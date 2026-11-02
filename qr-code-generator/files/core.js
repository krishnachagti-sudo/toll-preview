// The QR code engine, shared by the server (tool.js) and the browser (page.js), so a code made free
// on the page and one made over the API come from the same lines. No imports and no Node APIs: the
// platform serves this file to browsers as it is.
//
// What is here, in order:
//   - a QR Code Model 2 encoder written to ISO/IEC 18004 (numeric, alphanumeric and byte modes,
//     versions 1 to 40, error correction L/M/Q/H, the 8 masks with the standard's penalty rules),
//     structured the way Project Nayuki's MIT-licensed reference describes it, written fresh here;
//   - a decoder for a module grid (format and version information, unmasking, de-interleaving,
//     Reed-Solomon error correction, segment parsing), used to prove every file before download;
//   - a reader for clean images (renders and screenshots, not angled phone photos);
//   - the payload grammars (website, text, WiFi, vCard 3.0, email, SMS, phone, location);
//   - writers for SVG, PNG, PDF (single code and label sheets) and ZIP, and readers for PNG, ZIP,
//     CSV and the cells of an .xlsx sheet.
// Every table below is the standard's; the tests check them against an independent encoder.

export const ENGINE_VERSION = 'qr-1';

export class QrError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'QrError';
    this.field = field;
  }
}

// ---------- Galois field GF(256), polynomial 0x11D ----------

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
const gmul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);
const gdiv = (a, b) => {
  if (b === 0) throw new Error('division by zero in GF(256)');
  return a === 0 ? 0 : EXP[(LOG[a] + 255 - LOG[b]) % 255];
};
const gpow = (e) => EXP[((e % 255) + 255) % 255];

// The generator polynomial of degree n, highest power first without its leading 1 (roots 2^0..2^(n-1)).
const divisorCache = new Map();
function rsDivisor(degree) {
  let d = divisorCache.get(degree);
  if (d) return d;
  d = new Array(degree).fill(0);
  d[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < d.length; j++) {
      d[j] = gmul(d[j], root);
      if (j + 1 < d.length) d[j] ^= d[j + 1];
    }
    root = gmul(root, 2);
  }
  divisorCache.set(degree, d);
  return d;
}

export function rsRemainder(data, degree) {
  const div = rsDivisor(degree);
  const out = new Array(degree).fill(0);
  for (const b of data) {
    const factor = b ^ out.shift();
    out.push(0);
    for (let i = 0; i < degree; i++) out[i] ^= gmul(div[i], factor);
  }
  return out;
}

// Corrects a block (data then error-correction bytes, first byte = highest power) in place.
// Returns the number of bytes corrected, or -1 when there are more errors than the block can fix.
// Berlekamp-Massey for the error locator, a Chien search for the positions, Forney for the values.
export function rsCorrect(block, nsym) {
  const n = block.length;
  const evalAt = (x) => { let y = 0; for (const c of block) y = gmul(y, x) ^ c; return y; };
  const S = Array.from({ length: nsym }, (_, j) => evalAt(gpow(j)));
  if (S.every((s) => s === 0)) return 0;
  // Polynomials below are lowest power first.
  let C = [1];
  let B = [1];
  let L = 0;
  let m = 1;
  let b = 1;
  for (let k = 0; k < nsym; k++) {
    let d = S[k];
    for (let i = 1; i <= L; i++) d ^= gmul(C[i] ?? 0, S[k - i]);
    if (d === 0) { m++; continue; }
    const coef = gdiv(d, b);
    const next = C.slice();
    while (next.length < B.length + m) next.push(0);
    for (let i = 0; i < B.length; i++) next[i + m] ^= gmul(coef, B[i]);
    if (2 * L <= k) {
      B = C;
      L = k + 1 - L;
      b = d;
      m = 1;
    } else {
      m++;
    }
    C = next;
  }
  while (C.length > 1 && C[C.length - 1] === 0) C.pop();
  if (C.length - 1 !== L || 2 * L > nsym) return -1;
  const polyAt = (p, x) => { let y = 0; for (let i = p.length - 1; i >= 0; i--) y = gmul(y, x) ^ p[i]; return y; };
  const powers = [];
  for (let p = 0; p < n; p++) if (polyAt(C, gpow(-p)) === 0) powers.push(p);
  if (powers.length !== L) return -1;
  // Omega = S(x) * Lambda(x) mod x^nsym; Lambda' keeps the odd terms.
  const omega = new Array(nsym).fill(0);
  for (let i = 0; i < nsym; i++) for (let j = 0; j < C.length && i + j < nsym; j++) omega[i + j] ^= gmul(S[i], C[j]);
  const deriv = C.map((c, i) => (i % 2 === 1 ? c : 0)).slice(1);
  for (const p of powers) {
    const X = gpow(p);
    const Xinv = gpow(-p);
    const den = polyAt(deriv, Xinv);
    if (den === 0) return -1;
    const e = gmul(X, gdiv(polyAt(omega, Xinv), den));
    block[n - 1 - p] ^= e;
  }
  for (let j = 0; j < nsym; j++) if (evalAt(gpow(j)) !== 0) return -1;
  return powers.length;
}

// ---------- the standard's tables ----------

export const ECC_LEVELS = ['L', 'M', 'Q', 'H'];
const ECC_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };
// Error-correction codewords per block, and number of blocks, by level then version (index 0 unused).
const ECC_PER_BLOCK = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const NUM_BLOCKS = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};
// The error-correction share a level is designed to restore (DENSO WAVE gives M 15% and Q 25% in
// its text; L 7% and H 30% are the standard's values shown in its table).
export const ECC_RESTORE = { L: '7%', M: '15%', Q: '25%', H: '30%' };

export const sizeOf = (version) => version * 4 + 17;

export function rawDataModules(ver) {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const na = Math.floor(ver / 7) + 2;
    r -= (25 * na - 10) * na - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}
export const dataCodewords = (ver, ecc) => Math.floor(rawDataModules(ver) / 8) - ECC_PER_BLOCK[ecc][ver] * NUM_BLOCKS[ecc][ver];

export function alignmentPositions(ver) {
  if (ver === 1) return [];
  const na = Math.floor(ver / 7) + 2;
  const step = Math.floor((ver * 8 + na * 3 + 5) / (na * 4 - 4)) * 2;
  const out = [6];
  for (let pos = sizeOf(ver) - 7; out.length < na; pos -= step) out.splice(1, 0, pos);
  return out;
}

// ---------- segments ----------

export const MODES = {
  numeric: { bits: 0x1, cc: [10, 12, 14] },
  alphanumeric: { bits: 0x2, cc: [9, 11, 13] },
  byte: { bits: 0x4, cc: [8, 16, 16] },
  kanji: { bits: 0x8, cc: [8, 10, 12] },
  eci: { bits: 0x7, cc: [0, 0, 0] },
};
const ccBits = (mode, ver) => MODES[mode].cc[ver <= 9 ? 0 : ver <= 26 ? 1 : 2];
export const ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

export function utf8(text) {
  return Array.from(new TextEncoder().encode(text));
}

// One segment for the whole text, in the densest single mode that holds it.
export function makeSegments(text, { mode = 'auto', eci = false } = {}) {
  const pick = mode !== 'auto' ? mode
    : /^[0-9]*$/.test(text) ? 'numeric'
      : [...text].every((c) => ALNUM.includes(c)) ? 'alphanumeric' : 'byte';
  if (pick === 'numeric' && !/^[0-9]*$/.test(text)) throw new QrError('Numeric mode holds only the digits 0 to 9.', 'mode');
  if (pick === 'alphanumeric' && ![...text].every((c) => ALNUM.includes(c))) throw new QrError('Alphanumeric mode holds only 0-9, A-Z (capitals), space and $ % * + - . / :', 'mode');
  const segs = [];
  if (eci && pick === 'byte') segs.push({ mode: 'eci', count: 0, bits: [[26, 8]] }); // ECI 26 = UTF-8
  if (pick === 'numeric') {
    const bits = [];
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.slice(i, i + 3);
      bits.push([Number(chunk), chunk.length * 3 + 1]);
    }
    segs.push({ mode: 'numeric', count: text.length, bits });
  } else if (pick === 'alphanumeric') {
    const bits = [];
    for (let i = 0; i < text.length; i += 2) {
      if (i + 1 < text.length) bits.push([ALNUM.indexOf(text[i]) * 45 + ALNUM.indexOf(text[i + 1]), 11]);
      else bits.push([ALNUM.indexOf(text[i]), 6]);
    }
    segs.push({ mode: 'alphanumeric', count: text.length, bits });
  } else {
    const bytes = utf8(text);
    segs.push({ mode: 'byte', count: bytes.length, bits: bytes.map((b) => [b, 8]) });
  }
  return segs;
}

function segmentsBits(segs, ver) {
  let n = 0;
  for (const s of segs) {
    const cc = ccBits(s.mode, ver);
    if (s.mode !== 'eci' && s.count >= 2 ** cc) return Infinity;
    n += 4 + cc + s.bits.reduce((a, [, len]) => a + len, 0);
  }
  return n;
}

// ---------- the encoder ----------

function emptyGrid(size) {
  return Array.from({ length: size }, () => new Array(size).fill(false));
}

// The function patterns of a version, as { modules, isFunction }, with the format area reserved.
function template(ver) {
  const size = sizeOf(ver);
  const modules = emptyGrid(size);
  const isFunction = emptyGrid(size);
  const set = (x, y, dark) => { modules[y][x] = dark; isFunction[y][x] = true; };
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, dist !== 2 && dist !== 4);
      }
    }
  }
  const al = alignmentPositions(ver);
  const last = al.length - 1;
  for (let i = 0; i < al.length; i++) {
    for (let j = 0; j < al.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
  drawFormat(set, size, 'L', 0);
  if (ver >= 7) {
    const bits = versionBits(ver);
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, bit);
      set(b, a, bit);
    }
  }
  return { size, modules, isFunction };
}

export function formatBits(ecc, mask) {
  const data = (ECC_FORMAT_BITS[ecc] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

export function versionBits(ver) {
  let rem = ver;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  return (ver << 12) | rem;
}

// The two copies of the 15 format bits, as [x, y, bit index] lists.
function formatCells(size) {
  const a = [];
  const b = [];
  for (let i = 0; i <= 5; i++) a.push([8, i, i]);
  a.push([8, 7, 6], [8, 8, 7], [7, 8, 8]);
  for (let i = 9; i < 15; i++) a.push([14 - i, 8, i]);
  for (let i = 0; i < 8; i++) b.push([size - 1 - i, 8, i]);
  for (let i = 8; i < 15; i++) b.push([8, size - 15 + i, i]);
  return [a, b];
}

function drawFormat(set, size, ecc, mask) {
  const bits = formatBits(ecc, mask);
  for (const copy of formatCells(size)) for (const [x, y, i] of copy) set(x, y, ((bits >>> i) & 1) !== 0);
  set(8, size - 8, true); // the dark module
}

const MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

// The order data modules are filled in: two-column strips from the right, zigzagging up and down.
const orderCache = new Map();
function dataOrder(ver) {
  let order = orderCache.get(ver);
  if (order) return order;
  const { size, isFunction } = template(ver);
  order = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x]) order.push([x, y]);
      }
    }
  }
  orderCache.set(ver, order);
  return order;
}

function blockShape(ver, ecc) {
  const numBlocks = NUM_BLOCKS[ecc][ver];
  const eccLen = ECC_PER_BLOCK[ecc][ver];
  const raw = Math.floor(rawDataModules(ver) / 8);
  const numShort = numBlocks - (raw % numBlocks);
  const shortLen = Math.floor(raw / numBlocks);
  return { numBlocks, eccLen, raw, numShort, shortLen, shortData: shortLen - eccLen };
}

function interleave(data, ver, ecc) {
  const { numBlocks, eccLen, numShort, shortLen, shortData } = blockShape(ver, ecc);
  const blocks = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortData + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecw = rsRemainder(dat, eccLen);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecw));
  }
  const out = [];
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) if (i !== shortData || j >= numShort) out.push(blocks[j][i]);
  }
  return out;
}

// The standard's mask penalty (N1 = 3, N2 = 3, N3 = 40, N4 = 10).
export function penalty(modules) {
  const size = modules.length;
  let result = 0;
  const addHistory = (len, h) => { if (h[0] === 0) len += size; h.pop(); h.unshift(len); };
  const countPatterns = (h) => {
    const n = h[1];
    const core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
    return (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) + (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0);
  };
  const terminate = (color, len, h) => {
    if (color) { addHistory(len, h); len = 0; }
    len += size;
    addHistory(len, h);
    return countPatterns(h);
  };
  for (const line of [(i, j) => modules[i][j], (i, j) => modules[j][i]]) {
    for (let i = 0; i < size; i++) {
      let color = false;
      let run = 0;
      const h = [0, 0, 0, 0, 0, 0, 0];
      for (let j = 0; j < size; j++) {
        if (line(i, j) === color) {
          run++;
          if (run === 5) result += 3;
          else if (run > 5) result++;
        } else {
          addHistory(run, h);
          if (!color) result += countPatterns(h) * 40;
          color = line(i, j);
          run = 1;
        }
      }
      result += terminate(color, run, h) * 40;
    }
  }
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = modules[y][x];
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) result += 3;
    }
  }
  let dark = 0;
  for (const row of modules) for (const c of row) if (c) dark++;
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * 10;
  return result;
}

// Encodes text. Options: ecc (L/M/Q/H, default M), boostEcc (raise the level while the version
// stays the same, default true), mask (0-7 or 'auto'), minVersion/maxVersion, mode, eci.
// Returns { version, size, ecc, mask, mode, modules (rows of booleans), dataBytes, codewords }.
export function encodeText(text, opts = {}) {
  if (typeof text !== 'string' || text === '') throw new QrError('There is nothing to encode.', 'data');
  const ecc0 = opts.ecc ?? 'M';
  if (!ECC_LEVELS.includes(ecc0)) throw new QrError('Error correction must be L, M, Q or H.', 'ecc');
  const minV = opts.minVersion ?? 1;
  const maxV = opts.maxVersion ?? 40;
  const segs = makeSegments(text, { mode: opts.mode ?? 'auto', eci: opts.eci ?? false });
  let ver = 0;
  let used = 0;
  for (let v = minV; v <= maxV; v++) {
    used = segmentsBits(segs, v);
    if (used <= dataCodewords(v, ecc0) * 8) { ver = v; break; }
  }
  if (!ver) {
    const mode = segs[segs.length - 1].mode;
    const cap = capacity(ecc0, mode);
    throw new QrError(`Too much to fit in one QR code at error correction ${ecc0}: ${mode} mode holds at most ${cap.toLocaleString('en-US')} ${mode === 'byte' ? 'bytes' : 'characters'} (version 40). Shorten it, or use a lower error correction level.`, 'data');
  }
  let ecc = ecc0;
  if (opts.boostEcc !== false) {
    for (const higher of ['M', 'Q', 'H']) if (ECC_LEVELS.indexOf(higher) > ECC_LEVELS.indexOf(ecc) && used <= dataCodewords(ver, higher) * 8) ecc = higher;
  }
  // The bit stream: segments, terminator, pad to a byte, then the pad bytes 0xEC 0x11.
  const bits = [];
  const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  for (const s of segs) {
    put(MODES[s.mode].bits, 4);
    if (s.mode !== 'eci') put(s.count, ccBits(s.mode, ver));
    for (const [v, len] of s.bits) put(v, len);
  }
  const capBits = dataCodewords(ver, ecc) * 8;
  put(0, Math.min(4, capBits - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capBits; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  const codewords = interleave(data, ver, ecc);
  const tpl = template(ver);
  const order = dataOrder(ver);
  const base = tpl.modules.map((r) => r.slice());
  order.forEach(([x, y], i) => { base[y][x] = i < codewords.length * 8 ? ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1 : false; });
  const build = (mask) => {
    const m = base.map((r) => r.slice());
    for (const [x, y] of order) if (MASKS[mask](x, y)) m[y][x] = !m[y][x];
    drawFormat((x, y, d) => { m[y][x] = d; }, tpl.size, ecc, mask);
    return m;
  };
  let mask = opts.mask ?? 'auto';
  let modules;
  if (mask === 'auto') {
    let best = Infinity;
    for (let k = 0; k < 8; k++) {
      const m = build(k);
      const p = penalty(m);
      if (p < best) { best = p; mask = k; modules = m; }
    }
  } else {
    if (!Number.isInteger(mask) || mask < 0 || mask > 7) throw new QrError('Mask must be a whole number from 0 to 7, or "auto".', 'mask');
    modules = build(mask);
  }
  return { version: ver, size: tpl.size, ecc, mask, mode: segs[segs.length - 1].mode, eci: segs[0].mode === 'eci', modules, dataBytes: data, codewords };
}

// The most a single segment of `mode` can hold at version 40 and this level.
export function capacity(ecc, mode) {
  const bits = dataCodewords(40, ecc) * 8 - 4 - ccBits(mode, 40);
  if (mode === 'numeric') return Math.floor(bits / 10) * 3 + (bits % 10 >= 7 ? 2 : bits % 10 >= 4 ? 1 : 0);
  if (mode === 'alphanumeric') return Math.floor(bits / 11) * 2 + (bits % 11 >= 6 ? 1 : 0);
  return Math.floor(bits / 8);
}

// ---------- the decoder (module grid to text) ----------

const popcount = (x) => { let n = 0; while (x) { n += x & 1; x >>>= 1; } return n; };

// Reads the grid back as a phone would: format information (the nearer of the two copies to a
// valid word), unmasking, the codewords in fill order, de-interleaving, Reed-Solomon correction,
// then the segments. Throws QrError when it cannot.
export function decodeMatrix(modules) {
  const size = modules.length;
  if (size < 21 || size > 177 || (size - 17) % 4 !== 0 || modules.some((r) => r.length !== size)) throw new QrError('Not a QR code grid: the side must be 21 to 177 modules, in steps of 4.');
  const ver = (size - 17) / 4;
  let bestFormat = null;
  for (const copy of formatCells(size)) {
    let read = 0;
    for (const [x, y, i] of copy) if (modules[y][x]) read |= 1 << i;
    for (const ecc of ECC_LEVELS) {
      for (let mask = 0; mask < 8; mask++) {
        const d = popcount(read ^ formatBits(ecc, mask));
        if (!bestFormat || d < bestFormat.d) bestFormat = { d, ecc, mask };
      }
    }
  }
  if (bestFormat.d > 3) throw new QrError('The format information cannot be read.');
  const { ecc, mask } = bestFormat;
  const order = dataOrder(ver);
  const shape = blockShape(ver, ecc);
  const raw = new Array(shape.raw).fill(0);
  order.forEach(([x, y], i) => {
    if (i >= shape.raw * 8) return;
    const bit = modules[y][x] !== MASKS[mask](x, y);
    if (bit) raw[i >>> 3] |= 1 << (7 - (i & 7));
  });
  const blocks = Array.from({ length: shape.numBlocks }, () => new Array(shape.shortLen + 1).fill(0));
  let k = 0;
  for (let i = 0; i < shape.shortLen + 1; i++) {
    for (let j = 0; j < shape.numBlocks; j++) if (i !== shape.shortData || j >= shape.numShort) blocks[j][i] = raw[k++];
  }
  let corrected = 0;
  const data = [];
  blocks.forEach((blk, j) => {
    if (j < shape.numShort) blk.splice(shape.shortData, 1);
    const fixed = rsCorrect(blk, shape.eccLen);
    if (fixed < 0) throw new QrError('Too many damaged modules to correct.');
    corrected += fixed;
    data.push(...blk.slice(0, blk.length - shape.eccLen));
  });
  const parsed = parseSegments(data, ver);
  return { text: parsed.text, segments: parsed.segments, version: ver, size, ecc, mask, correctedBytes: corrected };
}

function parseSegments(data, ver) {
  let pos = 0;
  const total = data.length * 8;
  const read = (n) => {
    let v = 0;
    for (let i = 0; i < n; i++, pos++) v = (v << 1) | ((data[pos >>> 3] >>> (7 - (pos & 7))) & 1);
    return v;
  };
  let text = '';
  let eci = null;
  const segments = [];
  while (pos + 4 <= total) {
    const mode = read(4);
    if (mode === 0) break;
    if (mode === 0x7) {
      const first = read(8);
      eci = (first & 0x80) === 0 ? first : (first & 0xc0) === 0x80 ? ((first & 0x3f) << 8) | read(8) : ((first & 0x1f) << 16) | read(16);
      segments.push({ mode: 'eci', value: eci });
      continue;
    }
    const name = mode === 0x1 ? 'numeric' : mode === 0x2 ? 'alphanumeric' : mode === 0x4 ? 'byte' : mode === 0x8 ? 'kanji' : null;
    if (!name) throw new QrError('This code uses a mode this reader does not handle (structured append or FNC1).');
    const count = read(ccBits(name, ver));
    let part = '';
    if (name === 'numeric') {
      for (let i = 0; i < count; i += 3) {
        const n = Math.min(3, count - i);
        part += String(read(n * 3 + 1)).padStart(n, '0');
      }
    } else if (name === 'alphanumeric') {
      for (let i = 0; i < count; i += 2) {
        if (count - i >= 2) { const v = read(11); part += ALNUM[Math.floor(v / 45)] + ALNUM[v % 45]; } else part += ALNUM[read(6)];
      }
    } else if (name === 'byte') {
      const bytes = new Uint8Array(count);
      for (let i = 0; i < count; i++) bytes[i] = read(8);
      part = decodeBytes(bytes, eci);
    } else {
      const bytes = [];
      for (let i = 0; i < count; i++) {
        const v = read(13);
        const c = Math.floor(v / 0xc0) * 0x100 + (v % 0xc0);
        const sj = c + (c < 0x1f00 ? 0x8140 : 0xc140);
        bytes.push(sj >> 8, sj & 0xff);
      }
      try { part = new TextDecoder('shift_jis').decode(new Uint8Array(bytes)); } catch { throw new QrError('This code holds Kanji text this reader cannot show.'); }
    }
    if (pos > total) throw new QrError('The data ends early.');
    segments.push({ mode: name, count });
    text += part;
  }
  return { text, segments };
}

function decodeBytes(bytes, eci) {
  if (eci === 26 || eci === null) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { if (eci === 26) throw new QrError('The bytes are marked UTF-8 but are not valid UTF-8.'); }
  }
  return String.fromCharCode(...bytes); // ISO-8859-1, the standard's default
}

// ---------- reading a clean image ----------

// Reads a code from luminance pixels (0 dark to 255 light, row by row). Works on renders and
// screenshots where the code is upright and square to the pixels; an angled or curved phone
// photo needs a camera reader. Tries dark-on-light, then light-on-dark.
export function decodeLuminance(lum, width, height) {
  let lo = 255;
  let hi = 0;
  for (const v of lum) { if (v < lo) lo = v; if (v > hi) hi = v; }
  if (hi - lo < 40) throw new QrError('No QR code found: the image has too little contrast.');
  const t = (lo + hi) / 2;
  let lastErr = null;
  for (const inverted of [false, true]) {
    const dark = (x, y) => (lum[y * width + x] < t) !== inverted;
    try {
      return { ...sampleAndDecode(dark, width, height), inverted };
    } catch (e) {
      if (!(e instanceof QrError)) throw e;
      lastErr = e;
    }
  }
  throw new QrError(`No readable QR code found (${lastErr.message.replace(/\.$/, '')}). This reader needs the code upright and square to the picture, such as a screenshot or a scan; crop to the code and try again.`);
}

function sampleAndDecode(dark, width, height) {
  // The top-left finder: the first dark pixel in reading order whose run to the right and down
  // both look like a finder's outer edge (7 modules of dark).
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (dark(x, y)) { if (x < left) left = x; if (x > right) right = x; if (y < top) top = y; if (y > bottom) bottom = y; }
    }
  }
  if (right < 0) throw new QrError('No dark modules found');
  // Width of the finder's top edge, along a row a little below the top.
  const runAt = (y) => { let x = left; while (x <= right && dark(x, y)) x++; return x - left; };
  const edge = runAt(top);
  if (edge < 7) throw new QrError('The finder pattern is too small to read');
  const wide = right - left + 1;
  const tall = bottom - top + 1;
  if (Math.abs(wide - tall) > Math.max(2, wide * 0.03)) throw new QrError('The code is not square in the image');
  const est = Math.round(wide / (edge / 7));
  const candidates = [];
  for (let v = 1; v <= 40; v++) candidates.push(sizeOf(v));
  candidates.sort((a, b) => Math.abs(a - est) - Math.abs(b - est));
  let lastErr = null;
  for (const n of candidates.slice(0, 3)) {
    const mw = wide / n;
    const mh = tall / n;
    const grid = Array.from({ length: n }, (_, j) => Array.from({ length: n }, (_, i) => {
      const x = Math.min(width - 1, Math.floor(left + (i + 0.5) * mw));
      const y = Math.min(height - 1, Math.floor(top + (j + 0.5) * mh));
      return dark(x, y);
    }));
    try {
      return { ...decodeMatrix(grid), modulesPx: Math.round(mw * 100) / 100 };
    } catch (e) {
      if (!(e instanceof QrError)) throw e;
      lastErr = e;
    }
  }
  throw lastErr;
}

export function rgbaToLuminance(rgba, width, height, background = [255, 255, 255]) {
  const out = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const a = rgba[i * 4 + 3] / 255;
    const r = rgba[i * 4] * a + background[0] * (1 - a);
    const g = rgba[i * 4 + 1] * a + background[1] * (1 - a);
    const b = rgba[i * 4 + 2] * a + background[2] * (1 - a);
    out[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return out;
}

// ---------- payloads ----------
// The content grammars phones read, from the ZXing project's "Barcode Contents" wiki (WiFi, SMS,
// geo, tel, mailto and vCard sections) and RFC 2426 for vCard 3.0. Each builder returns the exact
// text that goes into the code.

export const TYPES = ['url', 'text', 'wifi', 'vcard', 'email', 'sms', 'phone', 'location'];
export const TYPE_NAMES = {
  url: 'Website link', text: 'Plain text', wifi: 'WiFi login', vcard: 'Contact card (vCard 3.0)',
  email: 'Email', sms: 'Text message (SMS)', phone: 'Phone call', location: 'Map location',
};
export const FIELDS = {
  url: ['url'],
  text: ['text'],
  wifi: ['ssid', 'password', 'security', 'hidden', 'eapMethod', 'anonymousIdentity', 'identity', 'phase2'],
  vcard: ['firstName', 'lastName', 'organization', 'title', 'phone', 'mobile', 'email', 'website', 'street', 'city', 'region', 'postalCode', 'country', 'note'],
  email: ['to', 'cc', 'bcc', 'subject', 'body'],
  sms: ['phone', 'message'],
  phone: ['phone'],
  location: ['latitude', 'longitude', 'altitude'],
};
export const WIFI_SECURITY = ['nopass', 'WEP', 'WPA', 'WPA2-EAP'];

const str = (v) => (v === undefined || v === null ? '' : String(v));
const need = (v, field, what) => {
  const s = str(v).trim();
  if (s === '') throw new QrError(`${what} is required.`, field);
  return s;
};
// WiFi: backslash before \ ; , " : (ZXing wiki).
const wifiEscape = (s) => s.replace(/([\\;,":])/g, '\\$1');
// ZXing: an SSID or password that could be read as hex is put in double quotes.
const wifiValue = (s) => (/^[0-9A-Fa-f]+$/.test(s) && s.length % 2 === 0 ? `"${wifiEscape(s)}"` : wifiEscape(s));
// vCard 3.0 text values (RFC 2426 sec. 4): backslash before \ , ; and newlines as \n.
const vEscape = (s) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r\n|\r|\n/g, '\\n');
// mailto, sms and similar: percent-encode the parts (RFC 6068 for mailto, ZXing for sms).
const pct = (s) => encodeURIComponent(s);
const phoneOf = (v, field) => {
  const s = need(v, field, 'A phone number');
  const clean = s.replace(/[\s().-]/g, '');
  if (!/^\+?[0-9]{3,20}$/.test(clean)) throw new QrError(`"${s}" is not a phone number: use digits, with + and the country code for calls from abroad (for example +12125551212).`, field);
  return clean;
};
const isEmail = (s) => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(s);

// The exact text for a type and its fields, with notes on what was escaped.
export function buildPayload(type, f = {}) {
  const notes = [];
  if (!TYPES.includes(type)) throw new QrError(`Type must be one of ${TYPES.join(', ')}.`, 'type');
  if (type === 'url') {
    let url = need(f.url, 'url', 'A link');
    if (/\s/.test(url)) throw new QrError('A link cannot contain spaces; replace them with %20.', 'url');
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) { url = `https://${url}`; notes.push('https:// was added at the front, as phones need the full address.'); }
    let parsed;
    try { parsed = new URL(url); } catch { throw new QrError(`"${url}" is not a web address.`, 'url'); }
    if (!/^https?:$/.test(parsed.protocol)) throw new QrError('A website link must start with http:// or https://.', 'url');
    if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') throw new QrError(`"${parsed.hostname}" is not a full domain name.`, 'url');
    return { payload: url, notes };
  }
  if (type === 'text') {
    const text = str(f.text);
    if (text === '') throw new QrError('Text is required.', 'text');
    return { payload: text, notes };
  }
  if (type === 'wifi') {
    const ssid = str(f.ssid);
    if (ssid === '') throw new QrError('The network name (SSID) is required.', 'ssid');
    const sec = str(f.security || (str(f.password) === '' ? 'nopass' : 'WPA'));
    const security = WIFI_SECURITY.find((s) => s.toLowerCase() === sec.toLowerCase())
      ?? (/^wpa2?$|^wpa\/wpa2|^wpa2-personal$|^wpa3$/i.test(sec) ? 'WPA' : null);
    if (!security) throw new QrError(`Security must be one of ${WIFI_SECURITY.join(', ')} (WPA covers WPA and WPA2 personal).`, 'security');
    if (/^wpa3$/i.test(sec)) notes.push('WPA3 networks are written as T:WPA, the form phones scan; WPA3-only fields are not added.');
    let out = `WIFI:T:${security};S:${wifiValue(ssid)};`;
    if (security !== 'nopass') {
      const pw = str(f.password);
      if (pw === '' && security !== 'WPA2-EAP') throw new QrError('A password is required for a secured network; choose "nopass" for an open one.', 'password');
      if (pw !== '') out += `P:${wifiValue(pw)};`;
    }
    const hidden = f.hidden === true || /^(true|yes|1)$/i.test(str(f.hidden));
    if (hidden) out += 'H:true;';
    if (security === 'WPA2-EAP') {
      if (f.eapMethod) out += `E:${wifiEscape(str(f.eapMethod))};`;
      if (f.anonymousIdentity) out += `A:${wifiEscape(str(f.anonymousIdentity))};`;
      if (f.identity) out += `I:${wifiEscape(str(f.identity))};`;
      if (f.phase2) out += `PH2:${wifiEscape(str(f.phase2))};`;
    } else if (f.eapMethod || f.identity || f.anonymousIdentity || f.phase2) {
      throw new QrError('EAP method, identity and phase 2 are only for WPA2-EAP (enterprise) networks.', 'security');
    }
    out += ';';
    if (/[\\;,":]/.test(ssid + str(f.password))) notes.push('Special characters \\ ; , " : were escaped with a backslash.');
    return { payload: out, notes };
  }
  if (type === 'vcard') {
    const first = str(f.firstName).trim();
    const last = str(f.lastName).trim();
    const org = str(f.organization).trim();
    if (!first && !last && !org) throw new QrError('Give a first or last name, or an organization.', 'firstName');
    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    lines.push(`N:${vEscape(last)};${vEscape(first)};;;`);
    lines.push(`FN:${vEscape([first, last].filter(Boolean).join(' ') || org)}`);
    if (org) lines.push(`ORG:${vEscape(org)}`);
    if (f.title) lines.push(`TITLE:${vEscape(str(f.title))}`);
    if (f.phone) lines.push(`TEL;TYPE=WORK,VOICE:${phoneOf(f.phone, 'phone')}`);
    if (f.mobile) lines.push(`TEL;TYPE=CELL:${phoneOf(f.mobile, 'mobile')}`);
    if (f.email) {
      const e = str(f.email).trim();
      if (!isEmail(e)) throw new QrError(`"${e}" is not an email address.`, 'email');
      lines.push(`EMAIL;TYPE=INTERNET:${e}`);
    }
    if (f.website) lines.push(`URL:${str(f.website).trim()}`);
    if (f.street || f.city || f.region || f.postalCode || f.country) {
      lines.push(`ADR;TYPE=WORK:;;${[f.street, f.city, f.region, f.postalCode, f.country].map((x) => vEscape(str(x))).join(';')}`);
    }
    if (f.note) lines.push(`NOTE:${vEscape(str(f.note))}`);
    lines.push('END:VCARD');
    return { payload: lines.join('\r\n'), notes: ['vCard 3.0 (RFC 2426): commas, semicolons and backslashes in text are escaped with a backslash.'] };
  }
  if (type === 'email') {
    const to = need(f.to, 'to', 'The address to write to');
    for (const a of to.split(',')) if (!isEmail(a.trim())) throw new QrError(`"${a.trim()}" is not an email address.`, 'to');
    const params = [];
    for (const k of ['cc', 'bcc', 'subject', 'body']) {
      const v = str(f[k]).trim();
      if (!v) continue;
      if ((k === 'cc' || k === 'bcc') && !v.split(',').every((a) => isEmail(a.trim()))) throw new QrError(`${k} must be email addresses separated by commas.`, k);
      params.push(`${k}=${k === 'cc' || k === 'bcc' ? v.split(',').map((a) => a.trim()).join(',') : pct(v)}`);
    }
    return { payload: `mailto:${to.split(',').map((a) => a.trim()).join(',')}${params.length ? `?${params.join('&')}` : ''}`, notes: params.length ? ['Subject and body are percent-encoded (a space is %20).'] : [] };
  }
  if (type === 'sms') {
    const phone = phoneOf(f.phone, 'phone');
    const msg = str(f.message);
    return { payload: msg ? `SMSTO:${phone}:${msg}` : `SMSTO:${phone}`, notes: ['SMSTO:number:message is the form phone camera apps read; there is no official standard for it.'] };
  }
  if (type === 'phone') return { payload: `tel:${phoneOf(f.phone, 'phone')}`, notes };
  // location
  const num = (v, field, lo, hi, what) => {
    const s = str(v).trim();
    if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) throw new QrError(`${what} must be a decimal number, such as 40.71872.`, field);
    const n = Number(s);
    if (n < lo || n > hi) throw new QrError(`${what} must be from ${lo} to ${hi}.`, field);
    return s;
  };
  const lat = num(f.latitude, 'latitude', -90, 90, 'Latitude');
  const lon = num(f.longitude, 'longitude', -180, 180, 'Longitude');
  const alt = str(f.altitude).trim();
  if (alt && !/^-?\d+(\.\d+)?$/.test(alt)) throw new QrError('Altitude is in meters, a decimal number.', 'altitude');
  return { payload: `geo:${lat},${lon}${alt ? `,${alt}` : ''}`, notes };
}

// What kind of content a decoded text is.
export function payloadKind(text) {
  if (/^https?:\/\//i.test(text)) return 'url';
  if (/^WIFI:/i.test(text)) return 'wifi';
  if (/^BEGIN:VCARD/i.test(text)) return 'vcard';
  if (/^MECARD:/i.test(text)) return 'mecard';
  if (/^mailto:/i.test(text)) return 'email';
  if (/^(SMSTO|sms):/i.test(text)) return 'sms';
  if (/^tel:/i.test(text)) return 'phone';
  if (/^geo:/i.test(text)) return 'location';
  return 'text';
}

// ---------- colours ----------

export function parseColor(s, field) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(s ?? '').trim());
  if (!m) throw new QrError('Colours are written like #000000.', field);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const hex = (c) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
// WCAG relative luminance and contrast ratio.
function relLum([r, g, b]) {
  const ch = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
export function contrast(a, b) {
  const [x, y] = [relLum(a), relLum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// ---------- the design: options shared by every renderer ----------

// { fg, bg (null = transparent), margin (modules), logo: { rgba, width, height } | null, logoShare }
export function designOf(opts = {}) {
  const fg = parseColor(opts.fg ?? '#000000', 'fg');
  const bg = opts.bg === 'transparent' ? null : parseColor(opts.bg ?? '#ffffff', 'bg');
  const margin = opts.margin ?? 4;
  if (!Number.isInteger(margin) || margin < 0 || margin > 20) throw new QrError('The margin is a whole number of modules from 0 to 20.', 'margin');
  const logoShare = opts.logoShare ?? 0.2;
  if (!(logoShare > 0 && logoShare <= 0.3)) throw new QrError('The logo may take from 1% to 30% of the code\'s width.', 'logoShare');
  return { fg, bg, margin, logo: opts.logo ?? null, logoShare };
}

// Checks a printer would care about, worded plainly. moduleMm is the printed module size.
export function printChecks(qr, design, { moduleMm = null, printerDpi = null } = {}) {
  const out = [];
  if (design.margin < 4) out.push({ level: 'warn', text: `The quiet zone is ${design.margin} modules; DENSO WAVE (the QR Code's inventor) says a QR code needs a margin of four modules on every side. Leave that much blank space around it when it is placed.` });
  const bgc = design.bg ?? [255, 255, 255];
  const ratio = contrast(design.fg, bgc);
  if (relLum(design.fg) > relLum(bgc)) out.push({ level: 'warn', text: 'The code is light on dark. Some older scanner apps read only dark-on-light codes; test it with the phones your audience uses.' });
  if (ratio < 4) out.push({ level: 'warn', text: `The colours have a contrast ratio of ${ratio.toFixed(1)}:1. Low contrast is a common reason codes fail to scan; darker modules on a light background read best.` });
  if (moduleMm !== null) {
    const line = { level: 'info', text: `Each module prints ${moduleMm.toFixed(2)} mm wide (${qr.size} x ${qr.size} modules, version ${qr.version}).` };
    out.push(line);
    if (printerDpi) {
      const dots = moduleMm / (25.4 / printerDpi);
      if (dots < 4) out.push({ level: 'warn', text: `At ${printerDpi} dpi that is ${dots.toFixed(1)} printer dots a module. DENSO WAVE recommends 4 or more dots a module for stable reading; print it larger or with a finer printer.` });
    }
  }
  if (design.logo) out.push({ level: 'info', text: `A logo covers part of the code, so it relies on error correction (level ${qr.ecc} restores about ${ECC_RESTORE[qr.ecc]} of the codewords). The file was read back to check it still decodes.` });
  return out;
}

// The square in modules (from the top-left of the symbol) a centred logo covers, or null.
export function logoBox(qr, design) {
  if (!design.logo) return null;
  const side = Math.max(1, Math.round(qr.size * design.logoShare));
  const s = side % 2 === qr.size % 2 ? side : side + 1;
  const start = (qr.size - s) / 2;
  return { start, side: s };
}

// ---------- SVG ----------

// Dark modules as horizontal runs in one path; "M x y h w v1 h-w z" per run, so the path can be
// read back exactly (svgModules).
export function svgOf(qr, design, { px = null } = {}) {
  const m = design.margin;
  const total = qr.size + 2 * m;
  const box = logoBox(qr, design);
  let d = '';
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (!qr.modules[y][x]) continue;
      let w = 1;
      while (x + w < qr.size && qr.modules[y][x + w]) w++;
      d += `M${x + m} ${y + m}h${w}v1h-${w}z`;
      x += w - 1;
    }
  }
  const size = px ? ` width="${px}" height="${px}"` : '';
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}"${size} shape-rendering="crispEdges">`;
  if (design.bg) out += `<rect width="${total}" height="${total}" fill="${hex(design.bg)}"/>`;
  out += `<path fill="${hex(design.fg)}" d="${d}"/>`;
  if (box && design.logo?.dataUrl) {
    out += `<rect x="${box.start + m}" y="${box.start + m}" width="${box.side}" height="${box.side}" fill="${hex(design.bg ?? [255, 255, 255])}"/>`;
    out += `<image x="${box.start + m}" y="${box.start + m}" width="${box.side}" height="${box.side}" preserveAspectRatio="xMidYMid meet" href="${design.logo.dataUrl}"/>`;
  }
  return `${out}</svg>`;
}

// Reads an SVG made by svgOf back into a module grid (the logo is laid over it as pixels would be).
export function svgModules(svg) {
  const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  const d = /<path fill="[^"]*" d="([^"]*)"/.exec(svg);
  if (!vb || !d) throw new QrError('Not an SVG this tool wrote.');
  const total = Number(vb[1]);
  const grid = Array.from({ length: total }, () => new Array(total).fill(false));
  for (const [, x, y, w] of d[1].matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) for (let i = 0; i < Number(w); i++) grid[Number(y)][Number(x) + i] = true;
  const logo = /<rect x="(\d+)" y="(\d+)" width="(\d+)" height="\d+" fill="[^"]*"\/><image/.exec(svg);
  return { total, grid, logo: logo ? { x: Number(logo[1]), y: Number(logo[2]), side: Number(logo[3]) } : null };
}

// ---------- raster ----------

// RGBA pixels of the code at `scale` pixels a module. The logo (RGBA pixels) is drawn into its
// square over a background-coloured pad, scaled by nearest neighbour.
export function rasterOf(qr, design, scale) {
  const m = design.margin;
  const total = (qr.size + 2 * m) * scale;
  const px = new Uint8Array(total * total * 4);
  const bg = design.bg ? [...design.bg, 255] : [0, 0, 0, 0];
  const fg = [...design.fg, 255];
  for (let y = 0; y < total; y++) {
    const my = Math.floor(y / scale) - m;
    for (let x = 0; x < total; x++) {
      const mx = Math.floor(x / scale) - m;
      const on = my >= 0 && my < qr.size && mx >= 0 && mx < qr.size && qr.modules[my][mx];
      px.set(on ? fg : bg, (y * total + x) * 4);
    }
  }
  const box = logoBox(qr, design);
  if (box && design.logo?.rgba) {
    const pad = design.bg ? [...design.bg, 255] : [255, 255, 255, 255];
    const x0 = (box.start + m) * scale;
    const side = box.side * scale;
    const { rgba, width, height } = design.logo;
    const fit = Math.min(side / width, side / height);
    const w = Math.max(1, Math.round(width * fit));
    const h = Math.max(1, Math.round(height * fit));
    const ox = x0 + Math.floor((side - w) / 2);
    const oy = x0 + Math.floor((side - h) / 2);
    for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) px.set(pad, ((x0 + y) * total + x0 + x) * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sx = Math.min(width - 1, Math.floor(x / fit));
        const sy = Math.min(height - 1, Math.floor(y / fit));
        const s = (sy * width + sx) * 4;
        const a = rgba[s + 3] / 255;
        const o = ((oy + y) * total + ox + x) * 4;
        for (let c = 0; c < 3; c++) px[o + c] = Math.round(rgba[s + c] * a + px[o + c] * (1 - a));
        px[o + 3] = 255;
      }
    }
  }
  return { rgba: px, width: total, height: total };
}

// ---------- checksums ----------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(bytes, start = 0, end = bytes.length) {
  let c = 0xffffffff;
  for (let i = start; i < end; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function adler32(bytes) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) { a = (a + bytes[i]) % 65521; b = (b + a) % 65521; }
  return ((b << 16) | a) >>> 0;
}

// zlib with uncompressed (stored) blocks: valid everywhere, no compressor needed. The server
// passes its own deflate for smaller files.
export function zlibStored(data) {
  const blocks = Math.max(1, Math.ceil(data.length / 65535));
  const out = new Uint8Array(2 + data.length + blocks * 5 + 4);
  out[0] = 0x78; out[1] = 0x01;
  let o = 2;
  for (let i = 0; i < blocks; i++) {
    const chunk = data.subarray(i * 65535, Math.min(data.length, (i + 1) * 65535));
    out[o++] = i === blocks - 1 ? 1 : 0;
    out[o++] = chunk.length & 255; out[o++] = chunk.length >> 8;
    out[o++] = ~chunk.length & 255; out[o++] = (~chunk.length >> 8) & 255;
    out.set(chunk, o);
    o += chunk.length;
  }
  const ad = adler32(data);
  out[o++] = ad >>> 24; out[o++] = (ad >>> 16) & 255; out[o++] = (ad >>> 8) & 255; out[o++] = ad & 255;
  return out;
}

const u32be = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
const ascii = (s) => Array.from(s, (c) => c.charCodeAt(0));
function concat(parts) {
  const len = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

// ---------- PNG ----------

// The filtered scanlines a PNG compresses (filter 0 on every line), RGB when fully opaque.
export function pngScanlines({ rgba, width, height }) {
  let opaque = true;
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i] !== 255) { opaque = false; break; }
  const bpp = opaque ? 3 : 4;
  const raw = new Uint8Array(height * (width * bpp + 1));
  for (let y = 0, o = 0; y < height; y++) {
    raw[o++] = 0;
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * 4;
      raw[o++] = rgba[s]; raw[o++] = rgba[s + 1]; raw[o++] = rgba[s + 2];
      if (!opaque) raw[o++] = rgba[s + 3];
    }
  }
  return { raw, opaque };
}

// A PNG of RGBA pixels, with a pHYs chunk for the print resolution. `deflate` turns the scanlines
// into zlib data (the browser compresses them first and hands the result over).
export function pngOf(img, { dpi = 300, deflate = zlibStored } = {}) {
  const { width, height } = img;
  const { raw, opaque } = pngScanlines(img);
  const chunk = (type, data) => {
    const body = concat([new Uint8Array(ascii(type)), data]);
    return concat([new Uint8Array(u32be(data.length)), body, new Uint8Array(u32be(crc32(body)))]);
  };
  const ppm = Math.round(dpi / 0.0254);
  return concat([
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', new Uint8Array([...u32be(width), ...u32be(height), 8, opaque ? 2 : 6, 0, 0, 0])),
    chunk('pHYs', new Uint8Array([...u32be(ppm), ...u32be(ppm), 1])),
    chunk('IDAT', new Uint8Array(deflate(raw))),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

// Reads a PNG into RGBA pixels. `inflate` turns zlib data into bytes (the server passes its own;
// the browser uses the canvas instead). Non-interlaced, any colour type, bit depth 8 (and 1, 2, 4
// for grey and palette images).
export function readPng(bytes, inflate) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 8 || sig.some((v, i) => bytes[i] !== v)) throw new QrError('That is not a PNG file.', 'image');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let pos = 8;
  let ihdr = null;
  let palette = null;
  let trns = null;
  const idat = [];
  while (pos + 8 <= bytes.length) {
    const len = view.getUint32(pos);
    const type = String.fromCharCode(...bytes.subarray(pos + 4, pos + 8));
    const data = bytes.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') ihdr = { width: view.getUint32(pos + 8), height: view.getUint32(pos + 12), depth: data[8], color: data[9], interlace: data[12] };
    else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (!ihdr) throw new QrError('The PNG has no header.', 'image');
  const { width, height, depth, color, interlace } = ihdr;
  if (interlace) throw new QrError('Interlaced PNGs are not read; save it again without interlacing.', 'image');
  if (width * height > 25_000_000) throw new QrError('The image is too large to read (at most 25 megapixels).', 'image');
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color];
  if (!channels || (depth !== 8 && !(depth < 8 && (color === 0 || color === 3)))) throw new QrError('This PNG uses a colour format this reader does not handle (16-bit); save it as an 8-bit PNG.', 'image');
  const raw = inflate(concat(idat));
  const bitsPP = channels * depth;
  const stride = Math.ceil((width * bitsPP) / 8);
  const bpp = Math.max(1, bitsPP >> 3);
  const out = new Uint8Array(width * height * 4);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let add = 0;
      if (f === 1) add = a;
      else if (f === 2) add = b;
      else if (f === 3) add = (a + b) >> 1;
      else if (f === 4) { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = (line[i] + add) & 255;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (depth < 8) {
        const bitPos = x * depth;
        const v = (line[bitPos >> 3] >> (8 - depth - (bitPos & 7))) & ((1 << depth) - 1);
        if (color === 3) { out[o] = palette[v * 3]; out[o + 1] = palette[v * 3 + 1]; out[o + 2] = palette[v * 3 + 2]; out[o + 3] = trns && v < trns.length ? trns[v] : 255; } else { const g = Math.round((v * 255) / ((1 << depth) - 1)); out[o] = out[o + 1] = out[o + 2] = g; out[o + 3] = 255; }
        continue;
      }
      const s = x * channels;
      if (color === 0) { out[o] = out[o + 1] = out[o + 2] = line[s]; out[o + 3] = 255; } else if (color === 2) { out[o] = line[s]; out[o + 1] = line[s + 1]; out[o + 2] = line[s + 2]; out[o + 3] = 255; } else if (color === 3) { const v = line[s]; out[o] = palette[v * 3]; out[o + 1] = palette[v * 3 + 1]; out[o + 2] = palette[v * 3 + 2]; out[o + 3] = trns && v < trns.length ? trns[v] : 255; } else if (color === 4) { out[o] = out[o + 1] = out[o + 2] = line[s]; out[o + 3] = line[s + 1]; } else { out[o] = line[s]; out[o + 1] = line[s + 1]; out[o + 2] = line[s + 2]; out[o + 3] = line[s + 3]; }
    }
    prev = line;
  }
  return { rgba: out, width, height };
}

// ---------- PDF ----------

const pdfNum = (n) => String(Math.round(n * 1000) / 1000);
const MM = 72 / 25.4;
// Text on PDFs uses the standard Helvetica font, so only plain Latin characters print.
export const pdfSafe = (s) => String(s).replace(/[^\x20-\x7e]/g, '?');
const pdfText = (s) => pdfSafe(s).replace(/([\\()])/g, '\\$1');
const helveticaWidth = (s, size) => pdfSafe(s).length * size * 0.56;

// The drawing commands for one code with its lower-left corner at (x, y) points and `side`
// points wide (quiet zone included).
function codeOps(qr, design, x, y, side, images) {
  const m = design.margin;
  const total = qr.size + 2 * m;
  const u = side / total;
  const rgb = (c) => c.map((v) => pdfNum(v / 255)).join(' ');
  let ops = '';
  if (design.bg) ops += `${rgb(design.bg)} rg ${pdfNum(x)} ${pdfNum(y)} ${pdfNum(side)} ${pdfNum(side)} re f\n`;
  ops += `${rgb(design.fg)} rg\n`;
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (!qr.modules[r][c]) continue;
      let w = 1;
      while (c + w < qr.size && qr.modules[r][c + w]) w++;
      ops += `${pdfNum(x + (c + m) * u)} ${pdfNum(y + side - (r + m + 1) * u)} ${pdfNum(w * u)} ${pdfNum(u)} re\n`;
      c += w - 1;
    }
  }
  ops += 'f\n';
  const box = logoBox(qr, design);
  if (box && design.logo?.rgba) {
    const lx = x + (box.start + m) * u;
    const ly = y + side - (box.start + m + box.side) * u;
    const s = box.side * u;
    ops += `${rgb(design.bg ?? [255, 255, 255])} rg ${pdfNum(lx)} ${pdfNum(ly)} ${pdfNum(s)} ${pdfNum(s)} re f\n`;
    const { width, height } = design.logo;
    const fit = Math.min(s / width, s / height);
    if (!images.includes(design.logo)) images.push(design.logo);
    const idx = images.indexOf(design.logo) + 1;
    ops += `q ${pdfNum(width * fit)} 0 0 ${pdfNum(height * fit)} ${pdfNum(lx + (s - width * fit) / 2)} ${pdfNum(ly + (s - height * fit) / 2)} cm /Im${idx} Do Q\n`;
  }
  return ops;
}

function pdfFile(pages, images, { deflate = null, background = [255, 255, 255] } = {}) {
  const objs = [];
  const add = (body) => { objs.push(body); return objs.length; };
  const catalog = add(null);
  const pagesId = add(null);
  const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const imageIds = images.map((img) => {
    const rgb = new Uint8Array(img.width * img.height * 3);
    for (let i = 0; i < img.width * img.height; i++) {
      const a = img.rgba[i * 4 + 3] / 255;
      for (let c = 0; c < 3; c++) rgb[i * 3 + c] = Math.round(img.rgba[i * 4 + c] * a + background[c] * (1 - a));
    }
    const data = deflate ? new Uint8Array(deflate(rgb)) : rgb;
    return add({ dict: `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8${deflate ? ' /Filter /FlateDecode' : ''} /Length ${data.length} >>`, data });
  });
  const xo = imageIds.length ? ` /XObject << ${imageIds.map((id, i) => `/Im${i + 1} ${id} 0 R`).join(' ')} >>` : '';
  const kids = pages.map((p) => {
    const content = new TextEncoder().encode(p.ops);
    const cid = add({ dict: `<< /Length ${content.length} >>`, data: content });
    return add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pdfNum(p.w)} ${pdfNum(p.h)}] /Resources << /Font << /F1 ${font} 0 R >>${xo} >> /Contents ${cid} 0 R >>`);
  });
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  const enc = new TextEncoder();
  const parts = [enc.encode('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')];
  let len = parts[0].length;
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(len);
    const head = enc.encode(`${i + 1} 0 obj\n${typeof o === 'string' ? o : `${o.dict}\nstream\n`}`);
    const tail = enc.encode(typeof o === 'string' ? '\nendobj\n' : '\nendstream\nendobj\n');
    const chunk = typeof o === 'string' ? concat([head, tail]) : concat([head, o.data, tail]);
    parts.push(chunk);
    len += chunk.length;
  });
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  parts.push(enc.encode(`${xref}trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${len}\n%%EOF\n`));
  return concat(parts);
}

// One code on a page its own size: widthMm across, quiet zone included.
export function pdfOf(qr, design, { widthMm = 40, deflate = null } = {}) {
  const side = widthMm * MM;
  const images = [];
  const ops = codeOps(qr, design, 0, 0, side, images);
  return pdfFile([{ w: side, h: side, ops }], images, { deflate, background: design.bg ?? [255, 255, 255] });
}

// Label sheets. The label size and count per sheet are the product's (avery.com, read
// 2026-11-02); the margins and gaps are this tool's own centred grid, so print a test sheet on
// plain paper and hold it against a label sheet before printing on labels.
export const SHEETS = {
  'letter-30': { name: 'US Letter, 30 labels of 1 x 2-5/8 in (the label size of Avery 5160)', page: [8.5, 11], cols: 3, rows: 10, label: [2.625, 1], gap: [0.125, 0], unit: 'in' },
  'letter-12-square': { name: 'US Letter, 12 square labels of 2 x 2 in (the label size of Avery 22816)', page: [8.5, 11], cols: 3, rows: 4, label: [2, 2], gap: [0.5, 0.5], unit: 'in' },
  'a4-21': { name: 'A4, 21 labels of 63.5 x 38.1 mm (3 across, 7 down)', page: [210, 297], cols: 3, rows: 7, label: [63.5, 38.1], gap: [2.5, 0], unit: 'mm' },
};

// The geometry of a sheet in points: page size, and each label's lower-left corner.
export function sheetGeometry(key) {
  const s = SHEETS[key];
  if (!s) throw new QrError(`Label sheet must be one of ${Object.keys(SHEETS).join(', ')}.`, 'sheet');
  const k = s.unit === 'in' ? 72 : MM;
  const [pw, ph] = s.page.map((v) => v * k);
  const [lw, lh] = s.label.map((v) => v * k);
  const [gx, gy] = s.gap.map((v) => v * k);
  const gridW = s.cols * lw + (s.cols - 1) * gx;
  const gridH = s.rows * lh + (s.rows - 1) * gy;
  const left = (pw - gridW) / 2;
  const top = (ph - gridH) / 2;
  const cells = [];
  for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) cells.push({ x: left + c * (lw + gx), y: ph - top - (r + 1) * lh - r * gy, w: lw, h: lh });
  return { pageW: pw, pageH: ph, cells, perSheet: s.cols * s.rows, sheet: s };
}

// The code's printed width on a label: the label's height for wide labels (text beside it), or
// the label less a text band for square ones. Returns points.
export function labelCodeSide(cell, hasText) {
  const pad = 4;
  if (cell.w > cell.h * 1.5) return cell.h - 2 * pad;
  return Math.min(cell.w, cell.h) - 2 * pad - (hasText ? 22 : 0);
}

// A label sheet PDF: one item per label, { qr, lines: [text, ...] }, as many pages as needed.
export function labelSheetPdf(items, design, sheetKey, { deflate = null } = {}) {
  const g = sheetGeometry(sheetKey);
  const pages = [];
  const images = [];
  for (let p = 0; p < items.length; p += g.perSheet) {
    let ops = '';
    items.slice(p, p + g.perSheet).forEach((it, i) => {
      const cell = g.cells[i];
      const lines = (it.lines ?? []).filter((l) => l !== '').slice(0, 3);
      const side = labelCodeSide(cell, lines.length > 0);
      const wide = cell.w > cell.h * 1.5;
      const cx = wide ? cell.x + 4 : cell.x + (cell.w - side) / 2;
      const cy = wide ? cell.y + (cell.h - side) / 2 : cell.y + cell.h - 4 - side;
      ops += codeOps(it.qr, design, cx, cy, side, images);
      ops += '0 0 0 rg\n';
      lines.forEach((line, li) => {
        const size = 8;
        const maxW = wide ? cell.w - side - 14 : cell.w - 8;
        let t = pdfSafe(line);
        while (t.length > 1 && helveticaWidth(t, size) > maxW) t = t.slice(0, -1);
        const tx = wide ? cell.x + side + 10 : cell.x + (cell.w - helveticaWidth(t, size)) / 2;
        const ty = wide ? cell.y + cell.h / 2 + (lines.length / 2 - li - 0.8) * 10 : cell.y + 4 + (lines.length - 1 - li) * 9 + 2;
        ops += `BT /F1 ${size} Tf ${pdfNum(tx)} ${pdfNum(ty)} Td (${pdfText(t)}) Tj ET\n`;
      });
    });
    pages.push({ w: g.pageW, h: g.pageH, ops });
  }
  return pdfFile(pages, images, { deflate, background: design.bg ?? [255, 255, 255] });
}

// ---------- ZIP ----------

// A ZIP of stored (uncompressed) files, dated 1980-01-01 so the same input gives the same bytes.
// Names are UTF-8 (flag bit 11).
export function zipOf(files) {
  const enc = new TextEncoder();
  const local = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const crc = crc32(data);
    const head = new DataView(new ArrayBuffer(30));
    head.setUint32(0, 0x04034b50, true); head.setUint16(4, 20, true); head.setUint16(6, 0x0800, true);
    head.setUint16(8, 0, true); head.setUint16(10, 0, true); head.setUint16(12, 0x21, true);
    head.setUint32(14, crc, true); head.setUint32(18, data.length, true); head.setUint32(22, data.length, true);
    head.setUint16(26, name.length, true); head.setUint16(28, 0, true);
    local.push(new Uint8Array(head.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cd = concat(central);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cd.length, true); end.setUint32(16, offset, true);
  return concat([...local, cd, new Uint8Array(end.buffer)]);
}

// The members of a ZIP: { name, method, data } where data is still compressed when method is 8.
export function zipEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new QrError('That file is not a readable ZIP or .xlsx workbook.', 'xlsx');
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const out = [];
  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new QrError('The workbook\'s file list is damaged.', 'xlsx');
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const at = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    const start = at + 30 + view.getUint16(at + 26, true) + view.getUint16(at + 28, true);
    out.push({ name, method, data: bytes.subarray(start, start + size) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

// ---------- spreadsheets ----------

// CSV or TSV text to rows of strings. The delimiter is the one (comma, tab, semicolon) that splits
// the first line most; quotes follow RFC 4180; a byte-order mark is dropped.
export function parseCsv(text) {
  const t = text.replace(/^﻿/, '');
  const first = t.split(/\r?\n/, 1)[0] ?? '';
  const delim = [',', '\t', ';'].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (quoted) {
      if (ch === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const xmlText = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&amp;/g, '&');

// A number cell's text as Excel shows it in a cell formatted as General, without exponent notation:
// 1.23456789012345E+15 becomes 1234567890123450. Leading zeros only survive in text cells, which is
// how Excel stores them, so those come through untouched.
export function plainNumber(v) {
  const m = /^(-?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/.exec(v);
  if (!m) return v;
  const [, sign, int, frac = '', expS] = m;
  const exp = Number(expS);
  let digits = int + frac;
  let point = int.length + exp;
  if (point <= 0) return `${sign}0.${'0'.repeat(-point)}${digits}`.replace(/\.?0+$/, '');
  if (point >= digits.length) return sign + digits + '0'.repeat(point - digits.length);
  return `${sign}${digits.slice(0, point)}.${digits.slice(point)}`.replace(/\.?0+$/, '');
}

// The first worksheet of an .xlsx as rows of strings. `text(name)` returns a member's XML text
// (the caller inflates it). Shared strings and inline strings keep their exact text; numbers are
// written without exponent notation.
export function xlsxRows(text) {
  const shared = [];
  const sst = text('xl/sharedStrings.xml');
  if (sst) for (const [, si] of sst.matchAll(/<si>([\s\S]*?)<\/si>/g)) shared.push([...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => xmlText(x[1])).join(''));
  const sheet = text('xl/worksheets/sheet1.xml');
  if (!sheet) throw new QrError('No first worksheet (sheet1) in that workbook. Save it as CSV and use that instead.', 'xlsx');
  const colIndex = (ref) => [...ref.replace(/\d+/g, '')].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const rows = [];
  for (const [, rowAttrs, body] of sheet.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const rn = /\br="(\d+)"/.exec(rowAttrs);
    const cells = [];
    for (const [, attrs, inner = ''] of (body ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = /\br="([A-Z]+)\d+"/.exec(attrs)?.[1] ?? 'A';
      const type = /\bt="(\w+)"/.exec(attrs)?.[1] ?? 'n';
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1];
      let value = '';
      if (type === 's') value = shared[Number(v)] ?? '';
      else if (type === 'inlineStr') value = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => xmlText(x[1])).join('');
      else if (type === 'b') value = v === '1' ? 'TRUE' : 'FALSE';
      else if (v !== undefined) value = type === 'n' ? plainNumber(xmlText(v)) : xmlText(v);
      cells[colIndex(ref)] = value;
    }
    const at = rn ? Number(rn[1]) - 1 : rows.length;
    while (rows.length < at) rows.push([]);
    rows[at] = Array.from(cells, (x) => x ?? '');
  }
  return rows;
}

// ---------- bulk ----------

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const ALIASES = {
  url: ['url', 'link', 'website', 'web', 'address'], text: ['text', 'content', 'data', 'value', 'payload'],
  ssid: ['ssid', 'network', 'networkname', 'wifiname'], password: ['password', 'pass', 'key'],
  phone: ['phone', 'tel', 'telephone', 'number'], email: ['email', 'mail', 'emailaddress'], to: ['to', 'email', 'recipient'],
  filename: ['filename', 'file', 'name'], type: ['type', 'qrtype'],
};

// Maps a heading row to field names: an exact field name (any case or spacing), then the aliases.
export function mapHeadings(head) {
  const fields = new Set(['type', 'filename', 'label', 'label2', 'label3', ...Object.values(FIELDS).flat()]);
  const byNorm = new Map([...fields].map((f) => [norm(f), f]));
  const map = {};
  head.forEach((h, i) => {
    const n = norm(h);
    const f = byNorm.get(n) ?? Object.entries(ALIASES).find(([, list]) => list.includes(n))?.[0];
    if (f && map[f] === undefined) map[f] = i;
  });
  return map;
}

// Rows of objects from a heading row and data rows; blank rows are kept as null so row numbers
// match the sheet.
export function rowsFromTable(table) {
  const [head = [], ...body] = table;
  const map = mapHeadings(head);
  const used = new Set(Object.values(map));
  const ignored = head.filter((h, i) => !used.has(i) && String(h).trim() !== '');
  const rows = body.map((r) => {
    if (r.every((x) => String(x ?? '').trim() === '')) return null;
    const o = {};
    for (const [f, i] of Object.entries(map)) if (r[i] !== undefined && String(r[i]) !== '') o[f] = String(r[i]);
    // Every column by its heading, for file name templates such as "asset-{Asset tag}".
    Object.defineProperty(o, 'columns', { value: Object.fromEntries(head.map((h, i) => [norm(h), String(r[i] ?? '')])), enumerable: false });
    return o;
  });
  return { rows, columns: map, ignored };
}

const fileSafe = (s) => String(s).normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/^[-.]+|-+$/g, '').slice(0, 80);

// Validates every row: its payload, and that it fits in one code at the chosen settings. Returns
// the good rows (with payload and encoded symbol) and the errors, each with its sheet row number
// (the heading is row 1, so the first data row is row 2).
export function planBulk(rows, { type = 'url', ecc = 'M', filename = 'qr-{row}', firstRow = 2, encode = true } = {}) {
  const ok = [];
  const errors = [];
  const warnings = [];
  const seenNames = new Map();
  const seenPayloads = new Map();
  rows.forEach((r, i) => {
    const row = firstRow + i;
    if (r === null) { warnings.push({ row, text: 'Blank row, skipped.' }); return; }
    try {
      const t = r.type ? String(r.type).trim().toLowerCase() : type;
      const { payload } = buildPayload(t, r);
      const qr = encode ? encodeText(payload, { ecc }) : null;
      const value = (k) => (norm(k) === 'row' ? String(row) : str(r[k] ?? r.columns?.[norm(k)] ?? Object.entries(r).find(([key]) => norm(key) === norm(k))?.[1]));
      let base = fileSafe(filename.replace(/\{([^{}]+)\}/g, (_, k) => value(k))) || `qr-${row}`;
      const lower = base.toLowerCase();
      const n = (seenNames.get(lower) ?? 0) + 1;
      seenNames.set(lower, n);
      if (n > 1) { warnings.push({ row, text: `File name "${base}" was already used; saved as "${base}-${n}".` }); base = `${base}-${n}`; }
      if (seenPayloads.has(payload)) warnings.push({ row, text: `Same content as row ${seenPayloads.get(payload)}.` });
      else seenPayloads.set(payload, row);
      ok.push({ row, type: t, payload, qr, file: base, lines: [r.label, r.label2, r.label3].filter((x) => x !== undefined && x !== '').map(String) });
    } catch (e) {
      if (!(e instanceof QrError)) throw e;
      errors.push({ row, field: e.field, text: e.message });
    }
  });
  return { ok, errors, warnings };
}

// The manifest CSV: one line per sheet row, with what was made and whether it was read back.
export function manifestCsv(plan, files) {
  const q = (v) => (/[",\r\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const lines = [['row', 'status', 'file', 'type', 'version', 'ecc', 'mask', 'verified', 'payload', 'error'].join(',')];
  const byRow = new Map(files.map((f) => [f.row, f]));
  const all = [...plan.ok.map((x) => ({ row: x.row, ok: x })), ...plan.errors.map((e) => ({ row: e.row, err: e }))].sort((a, b) => a.row - b.row);
  for (const { row, ok, err } of all) {
    if (ok) {
      const f = byRow.get(row);
      lines.push([row, 'made', f?.name ?? '', ok.type, ok.qr.version, ok.qr.ecc, ok.qr.mask, f?.verified ? 'yes' : 'no', ok.payload, ''].map(q).join(','));
    } else lines.push([row, 'refused', '', '', '', '', '', '', '', err.text].map(q).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}

// ---------- verification ----------

// Reads a rendered file back and checks it says exactly `payload`. Returns the decode, or throws.
export function verifyPixels(rgba, width, height, payload, background) {
  const d = decodeLuminance(rgbaToLuminance(rgba, width, height, background), width, height);
  if (d.text !== payload) throw new QrError('The rendered code read back differently from its content.');
  return d;
}

// Reads an SVG this tool wrote back into modules and decodes it. Whatever the logo shows, the
// modules under its square are counted as wrong (each one flipped), so a pass holds for any logo.
export function verifySvg(svg, payload) {
  const { total, grid, logo } = svgModules(svg);
  if (logo) for (let y = logo.y; y < logo.y + logo.side; y++) for (let x = logo.x; x < logo.x + logo.side; x++) grid[y][x] = !grid[y][x];
  const scale = 3;
  const w = total * scale;
  const lum = new Uint8Array(w * w).fill(255);
  for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) if (grid[Math.floor(y / scale)][Math.floor(x / scale)]) lum[y * w + x] = 0;
  const d = decodeLuminance(lum, w, w);
  if (d.text !== payload) throw new QrError('The SVG read back differently from its content.');
  return d;
}

export function base64Of(bytes) {
  if (typeof btoa === 'function') {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  throw new Error('no base64 encoder');
}
