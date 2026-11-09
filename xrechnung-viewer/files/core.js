// XRechnung / ZUGFeRD viewer and validator: the pure engine shared by the page and the server.
//
// Four parts, all deterministic and dependency-free (the browser loads this same file):
//  1. A safe XML parser: no DTD, no entities beyond the five predefined ones, caps on size, depth
//     and node count. A document with a DOCTYPE is refused (no external entities, no entity bombs).
//  2. An XPath 2.0 evaluator for the subset the official schematron files use, with exact decimal
//     arithmetic for xs:decimal (amount rules such as BR-CO-10 must not drift on binary floats).
//  3. A schematron runner: it takes the official .sch files as published (CEN EN 16931 1.3.16 and
//     the KoSIT XRechnung schematron 2.6.0), picks the KoSIT scenario and its custom levels, and
//     runs every assertion. The rule files are data the server reads; this file holds no rule.
//  4. Reading an e-invoice: ZUGFeRD/Factur-X PDFs (the embedded XML and the Factur-X metadata), the
//     format and profile, and the invoice as EN 16931 business terms (BT-1 ...) for the view.
// Words shown to people come in German and English (LABELS); the content pages are German.

export const ENGINE_VERSION = 'xrv-1';
export const LIMITS = { bytes: 5 * 1024 * 1024, depth: 200, nodes: 400_000, pdfObjects: 200_000 };

export class InvoiceError extends Error {
  constructor(code, message, field = 'file') { super(message); this.code = code; this.field = field; }
}

// ---------------------------------------------------------------------------------------------
// 1. XML
// ---------------------------------------------------------------------------------------------

export const NS = {
  xml: 'http://www.w3.org/XML/1998/namespace',
  ubl: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  cn: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
  cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
  ext: 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
  rsm: 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
  ram: 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
  udt: 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100',
  qdt: 'urn:un:unece:uncefact:data:standard:QualifiedDataType:100',
  xs: 'http://www.w3.org/2001/XMLSchema',
  sch: 'http://purl.oclc.org/dsdl/schematron',
  xsl: 'http://www.w3.org/1999/XSL/Transform',
};

let ORDER = 0; // document order across every parsed tree (nodes of two trees never mix in a sequence)

function makeNode(kind, props) { return { kind, order: ORDER++, ...props }; }

// Bytes (Uint8Array) or text to text, honouring a UTF-8 BOM and the encoding in the XML declaration.
export function decodeXml(input) {
  if (typeof input === 'string') return input.replace(/^﻿/, '');
  let bytes = input;
  if (bytes.length >= 2 && ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff))) {
    return new TextDecoder(bytes[0] === 0xff ? 'utf-16le' : 'utf-16be').decode(bytes).replace(/^﻿/, '');
  }
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) bytes = bytes.subarray(3);
  const head = String.fromCharCode(...bytes.subarray(0, Math.min(200, bytes.length)));
  const m = /^<\?xml[^>]*encoding\s*=\s*["']([A-Za-z0-9._-]+)["']/.exec(head);
  const enc = m ? m[1].toLowerCase() : 'utf-8';
  const label = ['iso-8859-1', 'latin1', 'iso-8859-15', 'windows-1252', 'cp1252'].includes(enc) ? 'windows-1252' : 'utf-8';
  return new TextDecoder(label, { fatal: label === 'utf-8' }).decode(bytes);
}

const NAME_START = /[A-Za-z_À-￿]/;
const PREDEFINED = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };

// Parses XML text into a small DOM: { kind: 'document' | 'element' | 'text' | 'attribute', ... }.
// Elements carry ns (namespace URI), local, prefix, name (qualified), attrs, children, parent.
export function parseXml(text, { maxBytes = LIMITS.bytes, maxDepth = LIMITS.depth, maxNodes = LIMITS.nodes } = {}) {
  if (text.length > maxBytes) throw new InvoiceError('too_large', `The XML is larger than ${Math.round(maxBytes / 1048576)} MB.`);
  const doc = makeNode('document', { children: [], parent: null });
  let i = 0;
  let nodes = 0;
  const n = text.length;
  const stack = [{ el: doc, ns: { xml: NS.xml, '': '' } }];
  const fail = (msg) => {
    const line = text.slice(0, i).split('\n').length;
    throw new InvoiceError('not_xml', `This is not well-formed XML (line ${line}): ${msg}`);
  };
  const decode = (s) => s.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z]+);|&/g, (all, ref) => {
    if (!ref) fail('a bare "&" must be written &amp;');
    if (ref[0] === '#') {
      const cp = ref[1] === 'x' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      if (!(cp === 9 || cp === 10 || cp === 13 || (cp >= 0x20 && cp <= 0xd7ff) || (cp >= 0xe000 && cp <= 0xfffd) || (cp >= 0x10000 && cp <= 0x10ffff))) fail(`character reference &${ref}; is not allowed`);
      return String.fromCodePoint(cp);
    }
    if (!(ref in PREDEFINED)) fail(`the entity &${ref}; is not one of the five XML defines (entities are not read, for safety)`);
    return PREDEFINED[ref];
  });
  const addText = (s) => {
    if (!s) return;
    const top = stack[stack.length - 1].el;
    if (top === doc) { if (/\S/.test(s)) fail('text outside the root element'); return; }
    const last = top.children[top.children.length - 1];
    if (last && last.kind === 'text') { last.value += s; return; }
    if (++nodes > maxNodes) throw new InvoiceError('too_large', 'The XML has too many nodes.');
    top.children.push(makeNode('text', { value: s, parent: top }));
  };
  let rootSeen = false;
  while (i < n) {
    const lt = text.indexOf('<', i);
    if (lt === -1) { addText(decode(text.slice(i))); i = n; break; }
    if (lt > i) addText(decode(text.slice(i, lt)));
    i = lt;
    if (text.startsWith('<!--', i)) {
      const e = text.indexOf('-->', i + 4);
      if (e === -1) fail('a comment is not closed');
      i = e + 3; continue;
    }
    if (text.startsWith('<![CDATA[', i)) {
      const e = text.indexOf(']]>', i + 9);
      if (e === -1) fail('a CDATA section is not closed');
      if (stack.length === 1) fail('CDATA outside the root element');
      addText(text.slice(i + 9, e)); i = e + 3; continue;
    }
    if (text.startsWith('<!', i)) {
      if (/^<!DOCTYPE/i.test(text.slice(i, i + 9))) throw new InvoiceError('doctype', 'The XML has a DOCTYPE declaration. E-invoices never need one, and it is refused for safety (no DTDs or external entities are read).');
      fail('unexpected "<!"');
    }
    if (text.startsWith('<?', i)) {
      const e = text.indexOf('?>', i + 2);
      if (e === -1) fail('a processing instruction is not closed');
      i = e + 2; continue;
    }
    if (text[i + 1] === '/') {
      const e = text.indexOf('>', i);
      if (e === -1) fail('an end tag is not closed');
      const name = text.slice(i + 2, e).trim();
      const top = stack.pop();
      if (stack.length === 0 || top.el.name !== name) fail(`the end tag </${name}> does not match <${top.el?.name ?? ''}>`);
      i = e + 1; continue;
    }
    // A start tag.
    i++;
    const nameStart = i;
    if (!NAME_START.test(text[i] ?? '')) fail('a tag name is expected after "<"');
    while (i < n && !/[\s/>]/.test(text[i])) i++;
    const qname = text.slice(nameStart, i);
    const rawAttrs = [];
    for (;;) {
      while (i < n && /\s/.test(text[i])) i++;
      if (text[i] === '>' || text.startsWith('/>', i)) break;
      if (i >= n) fail(`the tag <${qname}> is not closed`);
      const as = i;
      while (i < n && !/[\s=/>]/.test(text[i])) i++;
      const an = text.slice(as, i);
      while (i < n && /\s/.test(text[i])) i++;
      if (text[i] !== '=') fail(`the attribute ${an} has no value`);
      i++;
      while (i < n && /\s/.test(text[i])) i++;
      const q = text[i];
      if (q !== '"' && q !== "'") fail(`the value of ${an} must be quoted`);
      const ve = text.indexOf(q, i + 1);
      if (ve === -1) fail(`the value of ${an} is not closed`);
      const raw = text.slice(i + 1, ve);
      if (raw.includes('<')) fail(`the value of ${an} contains "<"`);
      rawAttrs.push([an, decode(raw).replace(/[\t\n\r]/g, ' ')]);
      i = ve + 1;
    }
    const selfClose = text.startsWith('/>', i);
    i += selfClose ? 2 : 1;
    const parentCtx = stack[stack.length - 1];
    if (parentCtx.el === doc) { if (rootSeen) fail('more than one root element'); rootSeen = true; }
    if (stack.length > maxDepth) throw new InvoiceError('too_large', 'The XML is nested too deeply.');
    const ns = { ...parentCtx.ns };
    const seen = new Set();
    for (const [an, av] of rawAttrs) {
      if (seen.has(an)) fail(`the attribute ${an} appears twice`);
      seen.add(an);
      if (an === 'xmlns') ns[''] = av;
      else if (an.startsWith('xmlns:')) ns[an.slice(6)] = av;
    }
    const split = (q, isAttr) => {
      const c = q.indexOf(':');
      const prefix = c === -1 ? '' : q.slice(0, c);
      const local = c === -1 ? q : q.slice(c + 1);
      if (isAttr && !prefix) return { prefix, local, ns: '' };
      if (!(prefix in ns)) fail(`the prefix "${prefix}" is not declared`);
      return { prefix, local, ns: ns[prefix] };
    };
    const en = split(qname, false);
    if (++nodes > maxNodes) throw new InvoiceError('too_large', 'The XML has too many nodes.');
    const el = makeNode('element', { name: qname, local: en.local, prefix: en.prefix, ns: en.ns, attrs: [], children: [], parent: parentCtx.el, nsMap: ns });
    for (const [an, av] of rawAttrs) {
      if (an === 'xmlns' || an.startsWith('xmlns:')) continue;
      const a = split(an, true);
      el.attrs.push(makeNode('attribute', { name: an, local: a.local, prefix: a.prefix, ns: a.ns, value: av, parent: el }));
    }
    parentCtx.el.children.push(el);
    if (!selfClose) stack.push({ el, ns });
  }
  if (stack.length !== 1) fail(`the element <${stack[stack.length - 1].el.name}> is not closed`);
  if (!rootSeen) fail('there is no root element');
  return doc;
}

export const rootOf = (doc) => doc.children.find((c) => c.kind === 'element');

export function stringValue(node) {
  if (node.kind === 'text' || node.kind === 'attribute') return node.value;
  let out = '';
  const walk = (x) => { for (const c of x.children) { if (c.kind === 'text') out += c.value; else if (c.kind === 'element') walk(c); } };
  walk(node);
  return out;
}

// ---------------------------------------------------------------------------------------------
// 2. XPath 2.0 (the subset the schematron files use)
// ---------------------------------------------------------------------------------------------

export class XPathError extends Error {}

// Exact decimals: value = n / 10^s, n a BigInt.
export class Dec {
  constructor(n, s) { this.n = n; this.s = s; }
  static parse(str) {
    const t = String(str).trim();
    const m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(t);
    if (!m || (m[2] === '' && (m[3] ?? '') === '')) return null;
    const frac = m[3] ?? '';
    const n = BigInt((m[2] || '0') + frac) * (m[1] === '-' ? -1n : 1n);
    return new Dec(n, frac.length).norm();
  }
  static int(v) { return new Dec(BigInt(v), 0); }
  static fromNumber(x) {
    if (!Number.isFinite(x)) return null;
    let s = String(x);
    if (/e/i.test(s)) s = x.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
    return Dec.parse(s);
  }
  norm() { let { n, s } = this; while (s > 0 && n % 10n === 0n) { n /= 10n; s--; } return new Dec(n, s); }
  static align(a, b) { const s = Math.max(a.s, b.s); return [a.n * 10n ** BigInt(s - a.s), b.n * 10n ** BigInt(s - b.s), s]; }
  add(b) { const [x, y, s] = Dec.align(this, b); return new Dec(x + y, s).norm(); }
  sub(b) { const [x, y, s] = Dec.align(this, b); return new Dec(x - y, s).norm(); }
  mul(b) { return new Dec(this.n * b.n, this.s + b.s).norm(); }
  div(b, scale = 24) {
    if (b.n === 0n) throw new XPathError('Division by zero');
    const [x, y] = Dec.align(this, b);
    return new Dec((x * 10n ** BigInt(scale)) / y, scale).norm();
  }
  idiv(b) { if (b.n === 0n) throw new XPathError('Division by zero'); const [x, y] = Dec.align(this, b); return new Dec(x / y, 0); }
  mod(b) { if (b.n === 0n) throw new XPathError('Division by zero'); const [x, y, s] = Dec.align(this, b); return new Dec(x % y, s).norm(); }
  cmp(b) { const [x, y] = Dec.align(this, b); return x < y ? -1 : x > y ? 1 : 0; }
  neg() { return new Dec(-this.n, this.s); }
  abs() { return this.n < 0n ? this.neg() : this; }
  floor() { if (this.s === 0) return this; const d = 10n ** BigInt(this.s); let q = this.n / d; if (this.n < 0n && this.n % d !== 0n) q -= 1n; return new Dec(q, 0); }
  ceil() { return this.neg().floor().neg(); }
  round() { return this.add(new Dec(5n, 1)).floor(); } // XPath round: half towards positive infinity
  isInt() { return this.s === 0; }
  toNumber() { return Number(this.toString()); }
  toString() {
    const neg = this.n < 0n;
    let digits = (neg ? -this.n : this.n).toString();
    if (this.s === 0) return (neg && digits !== '0' ? '-' : '') + digits;
    digits = digits.padStart(this.s + 1, '0');
    return `${neg ? '-' : ''}${digits.slice(0, -this.s)}.${digits.slice(-this.s)}`;
  }
}

// Atomic values: { t: 'str' | 'ua' (untypedAtomic) | 'bool' | 'int' | 'dec' | 'dbl' | 'date', v }.
const A = {
  str: (v) => ({ t: 'str', v }),
  ua: (v) => ({ t: 'ua', v }),
  bool: (v) => ({ t: 'bool', v: !!v }),
  int: (v) => ({ t: 'int', v: v instanceof Dec ? v : Dec.int(v) }),
  dec: (v) => ({ t: 'dec', v }),
  dbl: (v) => ({ t: 'dbl', v }),
};
const isNode = (x) => x && x.kind !== undefined;
const isNum = (a) => a.t === 'int' || a.t === 'dec' || a.t === 'dbl';
const TRUE = [A.bool(true)];
const FALSE = [A.bool(false)];

function atomize(seq) {
  const out = [];
  for (const x of seq) out.push(isNode(x) ? A.ua(stringValue(x)) : x);
  return out;
}

function dblString(x) {
  if (Number.isNaN(x)) return 'NaN';
  if (x === Infinity) return 'INF';
  if (x === -Infinity) return '-INF';
  if (x === 0) return Object.is(x, -0) ? '-0' : '0';
  const ax = Math.abs(x);
  if (ax >= 1e-6 && ax < 1e6) return Dec.fromNumber(x).toString();
  const [m, e] = x.toExponential().split('e');
  return `${m.includes('.') ? m : `${m}.0`}E${Number(e)}`;
}

function strOf(a) {
  if (isNode(a)) return stringValue(a);
  switch (a.t) {
    case 'bool': return a.v ? 'true' : 'false';
    case 'int': case 'dec': return a.v.toString();
    case 'dbl': return dblString(a.v);
    default: return a.v;
  }
}

function toDouble(a) {
  switch (a.t) {
    case 'dbl': return a.v;
    case 'int': case 'dec': return a.v.toNumber();
    case 'bool': return a.v ? 1 : 0;
    default: {
      const s = a.v.trim();
      if (/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(s)) return Number(s);
      if (s === 'INF') return Infinity;
      if (s === '-INF') return -Infinity;
      return NaN;
    }
  }
}

function castDecimal(a, type = 'dec') {
  if (a.t === 'int' || a.t === 'dec') return type === 'int' ? A.int(a.v.s ? (a.v.n < 0n ? a.v.ceil() : a.v.floor()) : a.v) : A.dec(a.v);
  if (a.t === 'dbl') {
    if (!Number.isFinite(a.v)) throw new XPathError(`Cannot convert ${dblString(a.v)} to xs:decimal`);
    const d = Dec.fromNumber(type === 'int' ? Math.trunc(a.v) : a.v);
    return type === 'int' ? A.int(d) : A.dec(d);
  }
  if (a.t === 'bool') return type === 'int' ? A.int(a.v ? 1 : 0) : A.dec(Dec.int(a.v ? 1 : 0));
  const s = String(a.v).trim();
  if (type === 'int') {
    if (!/^[+-]?\d+$/.test(s)) throw new XPathError(`"${a.v}" is not a valid xs:integer`);
    return A.int(Dec.parse(s));
  }
  const d = /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s) ? Dec.parse(s) : null;
  if (!d) throw new XPathError(`"${a.v}" is not a valid xs:decimal`);
  return A.dec(d);
}

const DATE_RE = /^-?\d{4,}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(Z|[+-](0\d|1[0-4]):[0-5]\d)?$/;
function isValidDate(s) {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.replace(/^-/, '').slice(0, 10).split('-').map(Number);
  const days = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d <= days[m - 1];
}

function cast(a, type) {
  switch (type) {
    case 'decimal': return castDecimal(a, 'dec');
    case 'integer': return castDecimal(a, 'int');
    case 'double': return A.dbl(toDouble(a));
    case 'string': return A.str(strOf(a));
    case 'boolean': {
      if (a.t === 'bool') return a;
      if (isNum(a)) return A.bool(toDouble(a) !== 0 && !Number.isNaN(toDouble(a)));
      const s = a.v.trim();
      if (s === 'true' || s === '1') return A.bool(true);
      if (s === 'false' || s === '0') return A.bool(false);
      throw new XPathError(`"${a.v}" is not a valid xs:boolean`);
    }
    case 'date': {
      const s = strOf(a).trim();
      if (!isValidDate(s)) throw new XPathError(`"${s}" is not a valid xs:date`);
      return { t: 'date', v: s };
    }
    default: throw new XPathError(`Unsupported type xs:${type}`);
  }
}

// Effective boolean value.
function ebv(seq) {
  if (seq.length === 0) return false;
  if (isNode(seq[0])) return true;
  if (seq.length > 1) throw new XPathError('Effective boolean value of a sequence of more than one atomic value');
  const a = seq[0];
  switch (a.t) {
    case 'bool': return a.v;
    case 'str': case 'ua': return a.v.length > 0;
    case 'dbl': return !(a.v === 0 || Number.isNaN(a.v));
    case 'int': case 'dec': return a.v.n !== 0n;
    default: return true;
  }
}

// Arithmetic with numeric promotion: untyped -> double; integer < decimal < double.
function arith(op, x, y) {
  if (x.t === 'ua' || x.t === 'str') x = A.dbl(toDouble(x));
  if (y.t === 'ua' || y.t === 'str') y = A.dbl(toDouble(y));
  if (x.t === 'bool' || y.t === 'bool') throw new XPathError('Arithmetic on a boolean');
  if (x.t === 'dbl' || y.t === 'dbl') {
    const a = toDouble(x); const b = toDouble(y);
    switch (op) {
      case '+': return A.dbl(a + b);
      case '-': return A.dbl(a - b);
      case '*': return A.dbl(a * b);
      case 'div': return A.dbl(a / b);
      case 'mod': return A.dbl(a % b);
      case 'idiv': { if (b === 0 || !Number.isFinite(a)) throw new XPathError('Integer division by zero'); return A.int(Math.trunc(a / b)); }
      default: throw new XPathError(op);
    }
  }
  const a = x.v; const b = y.v;
  const both = x.t === 'int' && y.t === 'int';
  switch (op) {
    case '+': return both ? A.int(a.add(b)) : A.dec(a.add(b));
    case '-': return both ? A.int(a.sub(b)) : A.dec(a.sub(b));
    case '*': return both ? A.int(a.mul(b)) : A.dec(a.mul(b));
    case 'div': return A.dec(a.div(b));
    case 'mod': return both ? A.int(a.mod(b)) : A.dec(a.mod(b));
    case 'idiv': return A.int(a.idiv(b));
    default: throw new XPathError(op);
  }
}

function numCmp(a, b) {
  if (a.t === 'dbl' || b.t === 'dbl') {
    const x = toDouble(a); const y = toDouble(b);
    if (Number.isNaN(x) || Number.isNaN(y)) return NaN;
    return x < y ? -1 : x > y ? 1 : 0;
  }
  return a.v.cmp(b.v);
}

const CMP = { '=': (c) => c === 0, '!=': (c) => c !== 0 && !Number.isNaN(c), '<': (c) => c < 0, '<=': (c) => c <= 0, '>': (c) => c > 0, '>=': (c) => c >= 0 };
const VALUE_OPS = { eq: '=', ne: '!=', lt: '<', le: '<=', gt: '>', ge: '>=' };

// One pair of atomics in a general (=, !=, ...) or value (eq, ...) comparison.
function compareAtoms(op, a, b, general) {
  let x = a; let y = b;
  if (general) {
    // An untyped value takes the type of the other side (XPath 2.0, 3.5.2).
    const typed = (u, other) => {
      if (isNum(other)) return A.dbl(toDouble(u));
      if (other.t === 'bool') return cast(u, 'boolean');
      if (other.t === 'date') return cast(u, 'date');
      return A.str(u.v);
    };
    if (x.t === 'ua' && y.t !== 'ua') x = typed(x, y);
    else if (y.t === 'ua' && x.t !== 'ua') y = typed(y, x);
    if (x.t === 'ua') x = A.str(x.v);
    if (y.t === 'ua') y = A.str(y.v);
  } else {
    if (x.t === 'ua') x = A.str(x.v);
    if (y.t === 'ua') y = A.str(y.v);
  }
  let c;
  if (isNum(x) && isNum(y)) c = numCmp(x, y);
  else if (x.t === 'bool' && y.t === 'bool') c = (x.v === y.v ? 0 : x.v ? 1 : -1);
  else if ((x.t === 'str' || x.t === 'date') && (y.t === 'str' || y.t === 'date')) c = x.v < y.v ? -1 : x.v > y.v ? 1 : 0;
  else if (isNum(x) || isNum(y)) throw new XPathError(`Cannot compare ${strOf(x)} with ${strOf(y)}`);
  else c = strOf(x) < strOf(y) ? -1 : strOf(x) > strOf(y) ? 1 : 0;
  return CMP[op](c);
}

// ---- tokenizer ----

const AXES = new Set(['child', 'descendant', 'attribute', 'self', 'descendant-or-self', 'following-sibling', 'following', 'parent', 'ancestor', 'preceding-sibling', 'preceding', 'ancestor-or-self']);
const KIND_TESTS = new Set(['node', 'text', 'element', 'attribute', 'comment', 'processing-instruction', 'document-node']);
const OPERATOR_WORDS = new Set(['and', 'or', 'div', 'idiv', 'mod', 'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'to', 'union', 'intersect', 'except', 'is', 'instance', 'treat', 'castable', 'cast', 'return', 'satisfies', 'then', 'else', 'in', 'as', 'of']);

function tokenize(src) {
  const toks = [];
  let i = 0;
  const n = src.length;
  const prevIsOperand = () => {
    const p = toks[toks.length - 1];
    if (!p) return false;
    if (p.type === 'num' || p.type === 'str' || p.type === 'var') return true;
    if (p.type === 'name') return !p.op;
    return p.v === ')' || p.v === ']' || p.v === '.' || p.v === '..' || p.v === '*' && p.nameTest;
  };
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (src.startsWith('(:', i)) { const e = src.indexOf(':)', i); i = e === -1 ? n : e + 2; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1; let s = '';
      for (;;) {
        if (j >= n) throw new XPathError('Unclosed string literal');
        if (src[j] === c) { if (src[j + 1] === c) { s += c; j += 2; continue; } break; }
        s += src[j++];
      }
      toks.push({ type: 'str', v: s }); i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      const m = /^(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      toks.push({ type: 'num', v: m[0] }); i += m[0].length; continue;
    }
    if (c === '$') {
      const m = /^\$([A-Za-z_][\w.\-]*(?::[A-Za-z_][\w.\-]*)?)/.exec(src.slice(i));
      if (!m) throw new XPathError('Bad variable reference');
      toks.push({ type: 'var', v: m[1] }); i += m[0].length; continue;
    }
    const two = src.slice(i, i + 2);
    if (['!=', '<=', '>=', '//', '::', '..', '<<', '>>'].includes(two)) { toks.push({ type: 'sym', v: two }); i += 2; continue; }
    if (c === '*') {
      if (prevIsOperand()) toks.push({ type: 'sym', v: '*', mul: true });
      else if (src[i + 1] === ':' && /[A-Za-z_]/.test(src[i + 2] ?? '')) {
        const m = /^\*:([A-Za-z_][\w.\-]*)/.exec(src.slice(i));
        toks.push({ type: 'name', v: m[0] }); i += m[0].length; continue;
      } else toks.push({ type: 'sym', v: '*', nameTest: true });
      i++; continue;
    }
    if ('()[],/@=<>|+-.?'.includes(c)) { toks.push({ type: 'sym', v: c }); i++; continue; }
    if (/[A-Za-z_À-￿]/.test(c)) {
      const m = /^[A-Za-z_À-￿][\w.\-À-￿]*(?::(?:[A-Za-z_][\w.\-]*|\*))?/.exec(src.slice(i));
      let v = m[0];
      // A trailing "." or "-" belongs to the name only when followed by a name character.
      while (/[.-]$/.test(v)) v = v.slice(0, -1);
      const op = OPERATOR_WORDS.has(v) && prevIsOperand();
      toks.push({ type: 'name', v, op }); i += v.length; continue;
    }
    throw new XPathError(`Unexpected character "${c}"`);
  }
  toks.push({ type: 'eof', v: '' });
  return toks;
}

// ---- parser (recursive descent) to a small AST ----

function parseXPath(src) {
  const t = tokenize(src);
  let p = 0;
  const peek = (k = 0) => t[p + k];
  const isSym = (v, k = 0) => t[p + k].type === 'sym' && t[p + k].v === v;
  const isWord = (v, k = 0) => t[p + k].type === 'name' && t[p + k].v === v;
  const isOpWord = (v) => t[p].type === 'name' && t[p].v === v && t[p].op;
  const expect = (v) => { if (!(t[p].v === v && (t[p].type === 'sym' || t[p].type === 'name'))) throw new XPathError(`Expected "${v}" near "${t[p].v}" in ${src}`); p++; };

  function expr() {
    const items = [single()];
    while (isSym(',')) { p++; items.push(single()); }
    return items.length === 1 ? items[0] : { k: 'seq', items };
  }
  function bindings() {
    const out = [];
    do {
      if (out.length) p++;
      const v = peek(); if (v.type !== 'var') throw new XPathError('Expected a variable');
      p++; expect('in');
      out.push({ name: v.v, e: single() });
    } while (isSym(','));
    return out;
  }
  function single() {
    if ((isWord('for') || isWord('some') || isWord('every')) && peek(1).type === 'var') {
      const kw = t[p++].v;
      const b = bindings();
      if (kw === 'for') { expect('return'); return { k: 'for', b, ret: single() }; }
      expect('satisfies');
      return { k: 'quant', every: kw === 'every', b, test: single() };
    }
    if (isWord('if') && isSym('(', 1)) {
      p += 2; const c = expr(); expect(')'); expect('then'); const a = single(); expect('else'); const b = single();
      return { k: 'if', c, a, b };
    }
    return or();
  }
  function or() { let l = and(); while (isOpWord('or')) { p++; l = { k: 'or', l, r: and() }; } return l; }
  function and() { let l = comparison(); while (isOpWord('and')) { p++; l = { k: 'and', l, r: comparison() }; } return l; }
  function comparison() {
    const l = range();
    const tk = peek();
    if (tk.type === 'sym' && ['=', '!=', '<', '<=', '>', '>='].includes(tk.v)) { p++; return { k: 'gcmp', op: tk.v, l, r: range() }; }
    if (tk.type === 'name' && tk.op && VALUE_OPS[tk.v]) { p++; return { k: 'vcmp', op: VALUE_OPS[tk.v], l, r: range() }; }
    if (tk.type === 'name' && tk.op && tk.v === 'is') { p++; return { k: 'is', l, r: range() }; }
    return l;
  }
  function range() { const l = additive(); if (isOpWord('to')) { p++; return { k: 'range', l, r: additive() }; } return l; }
  function additive() {
    let l = multiplicative();
    while (isSym('+') || isSym('-')) { const op = t[p++].v; l = { k: 'arith', op, l, r: multiplicative() }; }
    return l;
  }
  function multiplicative() {
    let l = union();
    for (;;) {
      if (isSym('*') && t[p].mul) { p++; l = { k: 'arith', op: '*', l, r: union() }; continue; }
      if (isOpWord('div') || isOpWord('idiv') || isOpWord('mod')) { const op = t[p++].v; l = { k: 'arith', op, l, r: union() }; continue; }
      return l;
    }
  }
  function union() {
    let l = intersect();
    while (isSym('|') || isOpWord('union')) { p++; l = { k: 'union', l, r: intersect() }; }
    return l;
  }
  function intersect() {
    let l = castable();
    while (isOpWord('intersect') || isOpWord('except')) { const op = t[p++].v; l = { k: 'setop', op, l, r: castable() }; }
    return l;
  }
  function singleType() {
    const tk = t[p++];
    if (tk.type !== 'name') throw new XPathError('Expected a type name');
    const type = tk.v.replace(/^xs:/, '');
    let optional = false;
    if (isSym('?') ) { p++; optional = true; }
    return { type, optional };
  }
  function castable() {
    const l = castExpr();
    if (isOpWord('castable')) { p++; expect('as'); const st = singleType(); return { k: 'castable', e: l, ...st }; }
    if (isOpWord('instance')) { p++; expect('of'); const st = singleType(); return { k: 'instanceof', e: l, ...st }; }
    return l;
  }
  function castExpr() {
    const l = unary();
    if (isOpWord('cast')) { p++; expect('as'); const st = singleType(); return { k: 'cast', e: l, ...st }; }
    return l;
  }
  function unary() {
    if (isSym('-')) { p++; return { k: 'neg', e: unary() }; }
    if (isSym('+')) { p++; return unary(); }
    return path();
  }
  function startsStep() {
    const tk = peek();
    if (tk.type === 'name') return !tk.op;
    if (tk.type === 'sym') return ['@', '.', '..', '*', '('].includes(tk.v) && !(tk.v === '*' && tk.mul);
    return tk.type === 'var' || tk.type === 'str' || tk.type === 'num';
  }
  function path() {
    if (isSym('/')) {
      p++;
      const steps = [{ k: 'root' }];
      if (startsStep()) relative(steps);
      return { k: 'path', steps };
    }
    if (isSym('//')) {
      p++;
      const steps = [{ k: 'root' }];
      pushDescendant(steps, step());
      relative(steps, true);
      return { k: 'path', steps };
    }
    const steps = [];
    relative(steps);
    return steps.length === 1 && steps[0].k !== 'step' ? steps[0] : { k: 'path', steps };
  }
  // "//x" is descendant-or-self::node()/child::x; without predicates that is descendant::x.
  function pushDescendant(steps, st) {
    if (st.k === 'step' && st.axis === 'child' && !st.preds.length) steps.push({ ...st, axis: 'descendant' });
    else { steps.push({ k: 'step', axis: 'descendant-or-self', test: { kind: 'node' }, preds: [] }); steps.push(st); }
  }
  function relative(steps, started = false) {
    if (!started) steps.push(step());
    for (;;) {
      if (isSym('/')) { p++; steps.push(step()); continue; }
      if (isSym('//')) { p++; pushDescendant(steps, step()); continue; }
      return;
    }
  }
  function preds() { const out = []; while (isSym('[')) { p++; out.push(expr()); expect(']'); } return out; }
  function nodeTest(axis) {
    const tk = t[p];
    if (tk.type === 'sym' && tk.v === '*') { p++; return { kind: 'name', ns: '*', local: '*' }; }
    if (tk.type !== 'name') throw new XPathError(`Expected a node test near "${tk.v}" in ${src}`);
    if (KIND_TESTS.has(tk.v) && isSym('(', 1)) {
      p += 2; expect(')');
      return { kind: tk.v };
    }
    p++;
    const v = tk.v;
    const c = v.indexOf(':');
    if (v.startsWith('*:')) return { kind: 'name', ns: '*', local: v.slice(2) };
    if (c === -1) return { kind: 'name', prefix: '', local: v, attr: axis === 'attribute' };
    return { kind: 'name', prefix: v.slice(0, c), local: v.slice(c + 1) };
  }
  function step() {
    const tk = peek();
    if (tk.type === 'sym' && tk.v === '..') { p++; return { k: 'step', axis: 'parent', test: { kind: 'node' }, preds: preds() }; }
    if (tk.type === 'sym' && tk.v === '.') { p++; const pr = preds(); return pr.length ? { k: 'filter', e: { k: 'ctx' }, preds: pr } : { k: 'ctx' }; }
    if (tk.type === 'sym' && tk.v === '@') { p++; const test = nodeTest('attribute'); return { k: 'step', axis: 'attribute', test, preds: preds() }; }
    if (tk.type === 'name' && AXES.has(tk.v) && isSym('::', 1)) { p += 2; const test = nodeTest(tk.v); return { k: 'step', axis: tk.v, test, preds: preds() }; }
    // Primary expressions.
    let prim = null;
    if (tk.type === 'str') { p++; prim = { k: 'lit', v: A.str(tk.v) }; }
    else if (tk.type === 'num') {
      p++;
      prim = { k: 'lit', v: /[eE]/.test(tk.v) ? A.dbl(Number(tk.v)) : tk.v.includes('.') ? A.dec(Dec.parse(tk.v)) : A.int(Dec.parse(tk.v)) };
    } else if (tk.type === 'var') { p++; prim = { k: 'var', name: tk.v }; }
    else if (tk.type === 'sym' && tk.v === '(') {
      p++;
      if (isSym(')')) { p++; prim = { k: 'seq', items: [] }; } else { prim = expr(); expect(')'); prim = { k: 'paren', e: prim }; }
    } else if (tk.type === 'name' && isSym('(', 1) && !KIND_TESTS.has(tk.v)) {
      p += 2;
      const args = [];
      if (!isSym(')')) { args.push(single()); while (isSym(',')) { p++; args.push(single()); } }
      expect(')');
      prim = { k: 'call', name: tk.v, args };
    }
    if (prim) { const pr = preds(); return pr.length ? { k: 'filter', e: prim, preds: pr } : prim; }
    const test = nodeTest('child');
    return { k: 'step', axis: 'child', test, preds: preds() };
  }
  const ast = expr();
  if (peek().type !== 'eof') throw new XPathError(`Unexpected "${peek().v}" in ${src}`);
  return ast;
}

const AST_CACHE = new Map();
export function compileXPath(src) {
  let ast = AST_CACHE.get(src);
  if (!ast) { ast = parseXPath(src); AST_CACHE.set(src, ast); }
  return ast;
}

// ---- evaluator ----

function sortDocOrder(nodes) {
  const seen = new Set();
  const out = [];
  for (const x of nodes) if (!seen.has(x)) { seen.add(x); out.push(x); }
  return out.sort((a, b) => a.order - b.order);
}

function childrenOf(n) { return n.children ?? []; }
function collect(n, out) { for (const c of childrenOf(n)) { out.push(c); if (c.children) collect(c, out); } return out; }
const DESC = new WeakMap();
// Descendants in document order; cached for whole documents, which every "//" path starts from.
function descendants(n) {
  if (n.kind !== 'document') return collect(n, []);
  let d = DESC.get(n);
  if (!d) { d = collect(n, []); DESC.set(n, d); }
  return d;
}
function docOf(n) { let x = n; while (x.parent) x = x.parent; return x; }

function axisNodes(n, axis) {
  switch (axis) {
    case 'child': return childrenOf(n);
    case 'attribute': return n.attrs ?? [];
    case 'self': return [n];
    case 'parent': return n.parent ? [n.parent] : [];
    case 'descendant': return descendants(n);
    case 'descendant-or-self': return [n, ...descendants(n)];
    case 'ancestor': { const out = []; let x = n.parent; while (x) { out.push(x); x = x.parent; } return out; }
    case 'ancestor-or-self': { const out = [n]; let x = n.parent; while (x) { out.push(x); x = x.parent; } return out; }
    case 'following-sibling': { if (!n.parent || n.kind === 'attribute') return []; const s = n.parent.children; return s.slice(s.indexOf(n) + 1); }
    case 'preceding-sibling': { if (!n.parent || n.kind === 'attribute') return []; const s = n.parent.children; return s.slice(0, s.indexOf(n)).reverse(); }
    case 'following': {
      const out = [];
      const start = n.kind === 'attribute' ? n.parent : n;
      const all = [...descendants(docOf(n))];
      const desc = new Set(descendants(start));
      for (const x of all) if (x.order > start.order && !desc.has(x)) out.push(x);
      return out;
    }
    case 'preceding': {
      const anc = new Set(axisNodes(n, 'ancestor'));
      return [...descendants(docOf(n))].filter((x) => x.order < n.order && !anc.has(x)).reverse();
    }
    default: throw new XPathError(`Unsupported axis ${axis}`);
  }
}

function matchesTest(node, test, axis, ctx) {
  switch (test.kind) {
    case 'node': return true;
    case 'text': return node.kind === 'text';
    case 'element': return node.kind === 'element';
    case 'attribute': return node.kind === 'attribute';
    case 'document-node': return node.kind === 'document';
    case 'comment': case 'processing-instruction': return false;
    default: {
      const principal = axis === 'attribute' ? 'attribute' : 'element';
      if (node.kind !== principal) return false;
      if (test.local !== '*' && node.local !== test.local) return false;
      if (test.ns === '*') return true;
      let uri;
      if (test.prefix) {
        uri = ctx.ns[test.prefix];
        if (uri === undefined) throw new XPathError(`Undeclared namespace prefix "${test.prefix}"`);
      } else uri = '';
      return node.ns === uri;
    }
  }
}

const REVERSE = new Set(['parent', 'ancestor', 'ancestor-or-self', 'preceding', 'preceding-sibling']);

function applyPreds(items, preds, ctx) {
  let cur = items;
  for (const pr of preds) {
    const out = [];
    const size = cur.length;
    for (let i = 0; i < size; i++) {
      const r = evalNode(pr, { ...ctx, item: cur[i], pos: i + 1, size });
      if (r.length === 1 && !isNode(r[0]) && isNum(r[0])) { if (toDouble(r[0]) === i + 1) out.push(cur[i]); }
      else if (ebv(r)) out.push(cur[i]);
    }
    cur = out;
  }
  return cur;
}

function evalStep(step, ctx) {
  if (step.k === 'step') {
    const node = ctx.item;
    if (!isNode(node)) throw new XPathError('A path step needs a node as its context');
    let nodes = axisNodes(node, step.axis).filter((x) => matchesTest(x, step.test, step.axis, ctx));
    if (step.preds.length) {
      nodes = applyPreds(nodes, step.preds, ctx);
      if (REVERSE.has(step.axis)) nodes = nodes.slice();
    }
    return nodes;
  }
  return evalNode(step, ctx);
}

function evalPath(steps, ctx) {
  let current;
  let i = 0;
  if (steps[0].k === 'root') {
    if (!isNode(ctx.item)) throw new XPathError('"/" needs a node as its context');
    current = [docOf(ctx.item)];
    i = 1;
  } else {
    current = [ctx.item];
  }
  if (i === steps.length) return current;
  for (; i < steps.length; i++) {
    const step = steps[i];
    const out = [];
    const size = current.length;
    let allNodes = true;
    for (let j = 0; j < size; j++) {
      const r = evalStep(step, { ...ctx, item: current[j], pos: j + 1, size });
      for (const x of r) { if (!isNode(x)) allNodes = false; out.push(x); }
    }
    if (allNodes) current = step.k === 'step' && size <= 1 && !REVERSE.has(step.axis) ? out : sortDocOrder(out);
    else {
      if (out.some(isNode)) throw new XPathError('A path step mixes nodes and atomic values');
      if (i !== steps.length - 1) throw new XPathError('Only the last step of a path may return atomic values');
      current = out;
    }
  }
  return current;
}

function evalNode(e, ctx) {
  switch (e.k) {
    case 'lit': return [e.v];
    case 'seq': { const out = []; for (const x of e.items) out.push(...evalNode(x, ctx)); return out; }
    case 'paren': return evalNode(e.e, ctx);
    case 'ctx': if (ctx.item === undefined) throw new XPathError('No context item'); return [ctx.item];
    case 'var': {
      if (!(e.name in ctx.vars)) throw new XPathError(`Unknown variable $${e.name}`);
      const v = ctx.vars[e.name];
      return typeof v === 'function' ? v() : v;
    }
    case 'path': return evalPath(e.steps, ctx);
    case 'step': return evalPath([e], ctx);
    case 'root': return [docOf(ctx.item)];
    case 'filter': return applyPreds(evalNode(e.e, ctx), e.preds, ctx);
    case 'or': return ebv(evalNode(e.l, ctx)) || ebv(evalNode(e.r, ctx)) ? TRUE : FALSE;
    case 'and': return ebv(evalNode(e.l, ctx)) && ebv(evalNode(e.r, ctx)) ? TRUE : FALSE;
    case 'if': return ebv(evalNode(e.c, ctx)) ? evalNode(e.a, ctx) : evalNode(e.b, ctx);
    case 'gcmp': {
      const l = atomize(evalNode(e.l, ctx)); const r = atomize(evalNode(e.r, ctx));
      for (const a of l) for (const b of r) if (compareAtoms(e.op, a, b, true)) return TRUE;
      return FALSE;
    }
    case 'vcmp': {
      const l = atomize(evalNode(e.l, ctx)); const r = atomize(evalNode(e.r, ctx));
      if (!l.length || !r.length) return [];
      if (l.length > 1 || r.length > 1) throw new XPathError('A value comparison needs single values');
      return compareAtoms(e.op, l[0], r[0], false) ? TRUE : FALSE;
    }
    case 'is': { const l = evalNode(e.l, ctx); const r = evalNode(e.r, ctx); if (!l.length || !r.length) return []; return l[0] === r[0] ? TRUE : FALSE; }
    case 'range': {
      const l = atomize(evalNode(e.l, ctx)); const r = atomize(evalNode(e.r, ctx));
      if (!l.length || !r.length) return [];
      const a = Number(castDecimal(l[0], 'int').v.toString()); const b = Number(castDecimal(r[0], 'int').v.toString());
      const out = [];
      for (let x = a; x <= b && out.length < 100_000; x++) out.push(A.int(x));
      return out;
    }
    case 'arith': {
      const l = atomize(evalNode(e.l, ctx)); const r = atomize(evalNode(e.r, ctx));
      if (!l.length || !r.length) return [];
      if (l.length > 1 || r.length > 1) throw new XPathError(`Arithmetic on a sequence of more than one item (${e.op})`);
      return [arith(e.op, l[0], r[0])];
    }
    case 'neg': {
      const v = atomize(evalNode(e.e, ctx));
      if (!v.length) return [];
      return [arith('-', A.int(0), v[0].t === 'ua' ? A.dbl(toDouble(v[0])) : v[0])];
    }
    case 'union': {
      const all = [...evalNode(e.l, ctx), ...evalNode(e.r, ctx)];
      if (!all.every(isNode)) throw new XPathError('Union of non-nodes');
      return sortDocOrder(all);
    }
    case 'setop': {
      const l = evalNode(e.l, ctx); const r = new Set(evalNode(e.r, ctx));
      return sortDocOrder(l.filter((x) => (e.op === 'intersect' ? r.has(x) : !r.has(x))));
    }
    case 'for': {
      const out = [];
      const loop = (i, vars) => {
        if (i === e.b.length) { out.push(...evalNode(e.ret, { ...ctx, vars })); return; }
        for (const item of evalNode(e.b[i].e, { ...ctx, vars })) loop(i + 1, { ...vars, [e.b[i].name]: [item] });
      };
      loop(0, ctx.vars);
      return out;
    }
    case 'quant': {
      const test = (i, vars) => {
        if (i === e.b.length) return ebv(evalNode(e.test, { ...ctx, vars }));
        const items = evalNode(e.b[i].e, { ...ctx, vars });
        for (const item of items) {
          const r = test(i + 1, { ...vars, [e.b[i].name]: [item] });
          if (e.every && !r) return false;
          if (!e.every && r) return true;
        }
        return e.every;
      };
      return test(0, ctx.vars) ? TRUE : FALSE;
    }
    case 'castable': {
      const v = atomize(evalNode(e.e, ctx));
      if (v.length === 0) return e.optional ? TRUE : FALSE;
      if (v.length > 1) return FALSE;
      try { cast(v[0], e.type); return TRUE; } catch { return FALSE; }
    }
    case 'cast': {
      const v = atomize(evalNode(e.e, ctx));
      if (v.length === 0) { if (e.optional) return []; throw new XPathError('Cast of an empty sequence'); }
      if (v.length > 1) throw new XPathError('Cast of more than one item');
      return [cast(v[0], e.type)];
    }
    case 'instanceof': return FALSE;
    case 'call': return callFunction(e, ctx);
    default: throw new XPathError(`Unknown expression ${e.k}`);
  }
}

const one = (seq, fn) => {
  const a = atomize(seq);
  if (a.length > 1) throw new XPathError(`${fn}() expects at most one value, got ${a.length}`);
  return a[0];
};
const str1 = (seq, fn) => { const a = one(seq, fn); return a === undefined ? '' : strOf(a); };
const cps = (s) => Array.from(s);

function toRegex(pattern, flags = '') {
  // XML Schema regex to JavaScript: anchors differ (XPath matches() searches), \i \c are not used here.
  let p = pattern;
  if (flags.includes('x')) p = p.replace(/\s+/g, '');
  const f = `u${flags.includes('i') ? 'i' : ''}${flags.includes('m') ? 'm' : ''}${flags.includes('s') ? 's' : ''}`;
  try { return new RegExp(p, f); } catch { return new RegExp(p, f.replace('u', '')); }
}

function callFunction(e, ctx) {
  const name = e.name.replace(/^fn:/, '');
  const arg = (i) => evalNode(e.args[i], ctx);
  const nargs = e.args.length;
  const user = ctx.functions?.[name];
  if (user) return user(e.args.map((a) => evalNode(a, ctx)), ctx);
  if (name.startsWith('xs:')) {
    const v = atomize(arg(0));
    if (!v.length) return [];
    if (v.length > 1) throw new XPathError(`${name}() of more than one value`);
    return [cast(v[0], name.slice(3))];
  }
  switch (name) {
    case 'true': return TRUE;
    case 'false': return FALSE;
    case 'not': return ebv(arg(0)) ? FALSE : TRUE;
    case 'boolean': return ebv(arg(0)) ? TRUE : FALSE;
    case 'exists': return arg(0).length ? TRUE : FALSE;
    case 'empty': return arg(0).length ? FALSE : TRUE;
    case 'count': return [A.int(arg(0).length)];
    case 'last': return [A.int(ctx.size ?? 1)];
    case 'position': return [A.int(ctx.pos ?? 1)];
    case 'string': return [A.str(nargs ? str1(arg(0), name) : strOf(ctx.item))];
    case 'data': return atomize(arg(0));
    case 'number': {
      const a = nargs ? one(arg(0), name) : (isNode(ctx.item) ? A.ua(stringValue(ctx.item)) : ctx.item);
      return [A.dbl(a === undefined ? NaN : toDouble(a))];
    }
    case 'normalize-space': return [A.str((nargs ? str1(arg(0), name) : strOf(ctx.item)).replace(/[ \t\n\r]+/g, ' ').trim())];
    case 'string-length': return [A.int(cps(nargs ? str1(arg(0), name) : strOf(ctx.item)).length)];
    case 'upper-case': return [A.str(str1(arg(0), name).toUpperCase())];
    case 'lower-case': return [A.str(str1(arg(0), name).toLowerCase())];
    case 'concat': return [A.str(e.args.map((_, i) => str1(arg(i), name)).join(''))];
    case 'contains': return str1(arg(0), name).includes(str1(arg(1), name)) ? TRUE : FALSE;
    case 'starts-with': return str1(arg(0), name).startsWith(str1(arg(1), name)) ? TRUE : FALSE;
    case 'ends-with': return str1(arg(0), name).endsWith(str1(arg(1), name)) ? TRUE : FALSE;
    case 'substring-after': { const s = str1(arg(0), name); const t = str1(arg(1), name); const i = s.indexOf(t); return [A.str(i === -1 ? '' : s.slice(i + t.length))]; }
    case 'substring-before': { const s = str1(arg(0), name); const t = str1(arg(1), name); const i = s.indexOf(t); return [A.str(i === -1 ? '' : s.slice(0, i))]; }
    case 'substring': {
      const s = cps(str1(arg(0), name));
      const rnd = (x) => Math.floor(x + 0.5);
      const st = rnd(toDouble(one(arg(1), name)));
      let len = Infinity;
      if (nargs > 2) len = rnd(toDouble(one(arg(2), name)));
      if (Number.isNaN(st) || Number.isNaN(len)) return [A.str('')];
      const out = [];
      for (let i = 1; i <= s.length; i++) if (i >= st && i < st + len) out.push(s[i - 1]);
      return [A.str(out.join(''))];
    }
    case 'translate': {
      const s = cps(str1(arg(0), name)); const from = cps(str1(arg(1), name)); const to = cps(str1(arg(2), name));
      return [A.str(s.map((ch) => { const i = from.indexOf(ch); return i === -1 ? ch : (i < to.length ? to[i] : ''); }).join(''))];
    }
    case 'string-to-codepoints': return cps(str1(arg(0), name)).map((ch) => A.int(ch.codePointAt(0)));
    case 'codepoints-to-string': return [A.str(atomize(arg(0)).map((a) => String.fromCodePoint(Number(castDecimal(a, 'int').v.toString()))).join(''))];
    case 'string-join': return [A.str(atomize(arg(0)).map(strOf).join(nargs > 1 ? str1(arg(1), name) : ''))];
    case 'matches': {
      const s = str1(arg(0), name); const re = toRegex(str1(arg(1), name), nargs > 2 ? str1(arg(2), name) : '');
      return re.test(s) ? TRUE : FALSE;
    }
    case 'replace': {
      const s = str1(arg(0), name); const re = toRegex(str1(arg(1), name), nargs > 3 ? str1(arg(3), name) : '');
      const rep = str1(arg(2), name).replace(/\$(\d)/g, '$$$1');
      return [A.str(s.replace(new RegExp(re.source, `${re.flags}g`), rep))];
    }
    case 'tokenize': {
      const s = str1(arg(0), name);
      if (!s) return [];
      const re = toRegex(str1(arg(1), name), nargs > 2 ? str1(arg(2), name) : '');
      return s.split(new RegExp(re.source, `${re.flags}g`)).map(A.str);
    }
    case 'reverse': return arg(0).slice().reverse();
    case 'distinct-values': {
      const out = []; const seen = new Set();
      for (const a of atomize(arg(0))) { const k = isNum(a) ? `n:${toDouble(a)}` : `s:${strOf(a)}`; if (!seen.has(k)) { seen.add(k); out.push(a.t === 'ua' ? A.str(a.v) : a); } }
      return out;
    }
    case 'name': { const n = nargs ? arg(0)[0] : ctx.item; return [A.str(n && isNode(n) ? (n.name ?? '') : '')]; }
    case 'local-name': { const n = nargs ? arg(0)[0] : ctx.item; return [A.str(n && isNode(n) ? (n.local ?? '') : '')]; }
    case 'namespace-uri': { const n = nargs ? arg(0)[0] : ctx.item; return [A.str(n && isNode(n) ? (n.ns ?? '') : '')]; }
    case 'abs': { const a = one(arg(0), name); if (!a) return []; const x = a.t === 'ua' ? A.dbl(toDouble(a)) : a; return [x.t === 'dbl' ? A.dbl(Math.abs(x.v)) : { t: x.t, v: x.v.abs() }]; }
    case 'round': case 'floor': case 'ceiling': {
      const a = one(arg(0), name); if (!a) return [];
      const x = a.t === 'ua' ? A.dbl(toDouble(a)) : a;
      if (x.t === 'dbl') return [A.dbl(name === 'round' ? Math.floor(x.v + 0.5) : name === 'floor' ? Math.floor(x.v) : Math.ceil(x.v))];
      const r = name === 'round' ? x.v.round() : name === 'floor' ? x.v.floor() : x.v.ceil();
      return [{ t: x.t, v: r }];
    }
    case 'sum': case 'min': case 'max': case 'avg': {
      let items = atomize(arg(0)).map((a) => (a.t === 'ua' ? A.dbl(toDouble(a)) : a));
      if (!items.length) return name === 'sum' ? (nargs > 1 ? arg(1) : [A.int(0)]) : [];
      if (name === 'sum' || name === 'avg') {
        let acc = items[0];
        for (const x of items.slice(1)) acc = arith('+', acc, x);
        return name === 'sum' ? [acc] : [arith('div', acc, A.int(items.length))];
      }
      items = items.slice();
      let best = items[0];
      for (const x of items.slice(1)) { const c = isNum(x) ? numCmp(x, best) : (strOf(x) < strOf(best) ? -1 : 1); if ((name === 'min' && c < 0) || (name === 'max' && c > 0)) best = x; }
      return [best];
    }
    case 'index-of': { const s = atomize(arg(0)); const t = one(arg(1), name); const out = []; s.forEach((a, i) => { if (compareAtoms('=', a, t, false)) out.push(A.int(i + 1)); }); return out; }
    case 'current-date': return [{ t: 'date', v: '1970-01-01' }];
    default: throw new XPathError(`Unsupported function ${e.name}()`);
  }
}

// Evaluates an XPath expression. ctx: { item, ns: { prefix: uri }, vars: { name: sequence }, functions }.
export function evaluate(expr, ctx) {
  return evalNode(compileXPath(expr), { pos: 1, size: 1, vars: {}, functions: {}, ...ctx });
}
export const evalBoolean = (expr, ctx) => ebv(evaluate(expr, ctx));
export function evalString(expr, ctx) {
  const r = evaluate(expr, ctx);
  return r.length ? strOf(atomize(r)[0]) : '';
}
export { strOf as itemString, ebv as effectiveBoolean, atomize };

// ---------------------------------------------------------------------------------------------
// 3. Schematron
// ---------------------------------------------------------------------------------------------

const SEVERITY = { fatal: 'error', error: 'error', warning: 'warning', information: 'information', info: 'information' };

const elementsIn = (el, ns, local) => el.children.filter((c) => c.kind === 'element' && c.ns === ns && (!local || c.local === local));
const attr = (el, name) => el.attrs.find((a) => a.name === name)?.value;

// The message of an assert with <value-of select> and <name/> filled in, whitespace collapsed.
function messageParts(el) {
  const parts = [];
  for (const c of el.children) {
    if (c.kind === 'text') parts.push(c.value);
    else if (c.kind === 'element' && c.local === 'value-of') parts.push({ select: attr(c, 'select') });
    else if (c.kind === 'element' && c.local === 'name') parts.push({ select: attr(c, 'path') ?? 'name(.)' });
    else if (c.kind === 'element') parts.push(stringValue(c));
  }
  return parts;
}

// An xsl:function as a callable: params bound in order, then variable/sequence/choose evaluated.
function makeXslFunction(fnEl, ns) {
  const params = elementsIn(fnEl, NS.xsl, 'param').map((p) => attr(p, 'name'));
  const body = fnEl.children.filter((c) => c.kind === 'element' && c.local !== 'param');
  const run = (els, ctx) => {
    let result = [];
    let vars = ctx.vars;
    for (const el of els) {
      if (el.local === 'variable') {
        const sel = attr(el, 'select');
        let v;
        if (sel) v = evalNode(compileXPath(sel), { ...ctx, vars });
        else {
          const inner = el.children.filter((c) => c.kind === 'element');
          v = inner.length ? run(inner, { ...ctx, vars }) : [A.str(stringValue(el))];
        }
        if (attr(el, 'as') === 'xs:integer') v = v.map((a) => cast(atomize([a])[0], 'integer'));
        vars = { ...vars, [attr(el, 'name')]: v };
      } else if (el.local === 'sequence') {
        result = result.concat(evalNode(compileXPath(attr(el, 'select')), { ...ctx, vars }));
      } else if (el.local === 'choose') {
        const branches = el.children.filter((c) => c.kind === 'element');
        for (const b of branches) {
          if (b.local === 'when' && !ebv(evalNode(compileXPath(attr(b, 'test')), { ...ctx, vars }))) continue;
          result = result.concat(run(b.children.filter((c) => c.kind === 'element'), { ...ctx, vars }));
          break;
        }
      } else if (el.local === 'value-of') {
        result.push(A.str(atomize(evalNode(compileXPath(attr(el, 'select')), { ...ctx, vars })).map(strOf).join(' ')));
      } else throw new XPathError(`Unsupported xsl:${el.local} in function ${attr(fnEl, 'name')}`);
    }
    return result;
  };
  return (args, ctx) => {
    const vars = { ...ctx.globals };
    params.forEach((p, i) => { vars[p] = args[i] ?? []; });
    return run(body, { ...ctx, item: undefined, vars, ns: { ...ctx.ns, ...ns } });
  };
}

// Reads one or more .sch documents (already parsed) into a rule set: namespaces, global variables,
// functions and patterns with their rules, in file order. `include` resolves <include href>.
export function loadSchematron(docs) {
  const set = { ns: { xml: NS.xml }, globals: [], functions: {}, patterns: [], ids: new Map() };
  const addPattern = (patEl) => {
    const pattern = { id: attr(patEl, 'id') ?? null, rules: [] };
    for (const c of patEl.children) {
      if (c.kind !== 'element' || c.ns !== NS.sch) continue;
      if (c.local === 'let') set.globals.push({ name: attr(c, 'name'), value: attr(c, 'value') });
      if (c.local !== 'rule') continue;
      const rule = { context: attr(c, 'context'), lets: [], checks: [] };
      for (const r of c.children) {
        if (r.kind !== 'element' || r.ns !== NS.sch) continue;
        if (r.local === 'let') rule.lets.push({ name: attr(r, 'name'), value: attr(r, 'value') });
        else if (r.local === 'assert' || r.local === 'report') {
          const id = attr(r, 'id');
          const check = { id, kind: r.local, test: attr(r, 'test'), flag: attr(r, 'flag') ?? 'fatal', message: messageParts(r), context: rule.context };
          rule.checks.push(check);
          if (id && !set.ids.has(id)) set.ids.set(id, check);
        }
      }
      pattern.rules.push(rule);
    }
    set.patterns.push(pattern);
  };
  for (const doc of docs) {
    const root = rootOf(doc);
    const top = root.ns === NS.sch && root.local === 'pattern' ? [root] : root.children;
    for (const c of top) {
      if (c.kind !== 'element') continue;
      if (c.ns === NS.sch && c.local === 'ns') set.ns[attr(c, 'prefix')] = attr(c, 'uri');
      else if (c.ns === NS.sch && c.local === 'let') set.globals.push({ name: attr(c, 'name'), value: attr(c, 'value') });
      else if (c.ns === NS.sch && c.local === 'pattern') addPattern(c);
      else if (c.ns === NS.xsl && c.local === 'function') set.functions[attr(c, 'name')] = makeXslFunction(c, {});
    }
  }
  // Every global xsl:function sees the same namespaces.
  for (const [k, f] of Object.entries(set.functions)) set.functions[k] = f;
  return set;
}

// The nodes a rule context (an XSLT match pattern) selects in a document.
function contextNodes(doc, context, ctx) {
  const branches = splitTopLevel(context, '|');
  const out = [];
  for (const b of branches) {
    const t = b.trim();
    const expr = t.startsWith('/') ? t : `//${t}`;
    out.push(...evalNode(compileXPath(expr), { ...ctx, item: doc, pos: 1, size: 1 }));
  }
  return sortDocOrder(out.filter(isNode));
}

function splitTopLevel(s, sep) {
  const out = [];
  let depth = 0; let q = null; let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === sep && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}

// A location path for a node, the way validators print it: /*:Invoice[1]/*:AccountingSupplierParty[1].
export function locationOf(node) {
  const parts = [];
  let x = node;
  while (x && x.kind !== 'document') {
    if (x.kind === 'attribute') parts.unshift(`@${x.name}`);
    else if (x.kind === 'text') parts.unshift('text()');
    else {
      const same = x.parent.children.filter((c) => c.kind === 'element' && c.local === x.local && c.ns === x.ns);
      parts.unshift(`${x.prefix ? `${x.prefix}:` : ''}${x.local}[${same.indexOf(x) + 1}]`);
    }
    x = x.parent;
  }
  return `/${parts.join('/')}`;
}

// Runs rule sets over a parsed invoice. levels: { ruleId: 'error' | 'warning' | 'information' }
// (the scenario's custom levels). Returns every failed assert and fired report, in run order.
export function runSchematron(doc, ruleSets, { levels = {} } = {}) {
  const findings = [];
  let checked = 0;
  for (const set of ruleSets) {
    const base = { ns: set.ns, functions: {}, vars: {} };
    // Global variables, lazily evaluated with the document as context (they may refer to each other).
    const globals = {};
    for (const g of set.globals) {
      let cached;
      globals[g.name] = () => {
        if (cached === undefined) cached = evalNode(compileXPath(g.value), { ...base, vars: globals, item: doc, pos: 1, size: 1 });
        return cached;
      };
    }
    for (const [k, f] of Object.entries(set.functions)) base.functions[k] = (args, ctx) => f(args, { ...ctx, globals, ns: set.ns, functions: base.functions });
    base.vars = globals;
    for (const pattern of set.patterns) {
      const fired = new Set();
      for (const rule of pattern.rules) {
        let nodes;
        try { nodes = contextNodes(doc, rule.context, base); } catch (err) {
          for (const c of rule.checks) findings.push(failure(c, null, levels, `The rule context could not be evaluated: ${err.message}`));
          continue;
        }
        for (const node of nodes) {
          if (fired.has(node)) continue; // in a pattern, the first matching rule takes the node
          fired.add(node);
          let vars = globals;
          const ctx = { ...base, item: node, pos: 1, size: 1 };
          for (const l of rule.lets) {
            const v = evalNode(compileXPath(l.value), { ...ctx, vars });
            vars = { ...vars, [l.name]: v };
          }
          for (const c of rule.checks) {
            checked++;
            let ok;
            let note = null;
            try {
              const r = ebv(evalNode(compileXPath(c.test), { ...ctx, vars }));
              ok = c.kind === 'assert' ? r : !r;
            } catch (err) {
              ok = false;
              note = `The rule could not be evaluated on this file: ${err.message}`;
            }
            if (!ok) findings.push(failure(c, node, levels, note, { ...ctx, vars }));
          }
        }
      }
    }
  }
  return { findings, checked };
}

function failure(check, node, levels, note, ctx) {
  let text = '';
  for (const p of check.message) {
    if (typeof p === 'string') text += p;
    else {
      try { text += atomize(evalNode(compileXPath(p.select), ctx)).map(strOf).join(' '); } catch { /* leave it out */ }
    }
  }
  text = text.replace(/\s+/g, ' ').trim();
  const level = levels[check.id] ?? SEVERITY[check.flag] ?? 'error';
  return { id: check.id, level, flag: check.flag, message: text, location: node ? locationOf(node) : null, test: check.test, context: check.context, ...(note ? { note } : {}) };
}

// ---- KoSIT scenarios (scenarios.xml) ----

// Reads scenarios.xml: each scenario's name, match expression, namespaces, schematron resources and
// custom levels. Resources are named by their file name (EN16931-UBL-validation.xsl ...).
export function loadScenarios(doc) {
  const SNS = 'http://www.xoev.de/de/validator/framework/1/scenarios';
  const root = rootOf(doc);
  const text = (el, local) => { const x = elementsIn(el, SNS, local)[0]; return x ? stringValue(x).trim() : null; };
  const out = { name: text(root, 'name'), date: text(root, 'date'), scenarios: [] };
  for (const s of elementsIn(root, SNS, 'scenario')) {
    const ns = {};
    for (const nEl of elementsIn(s, SNS, 'namespace')) ns[attr(nEl, 'prefix')] = stringValue(nEl).trim();
    const schematron = elementsIn(s, SNS, 'validateWithSchematron').map((v) => {
      const res = elementsIn(v, SNS, 'resource')[0];
      return { name: text(res, 'name'), file: text(res, 'location').split('/').pop() };
    });
    const xsd = elementsIn(s, SNS, 'validateWithXmlSchema').length > 0;
    const levels = {};
    const deep = (el) => el.children.flatMap((c) => (c.kind === 'element' ? [c, ...deep(c)] : []));
    for (const cl of deep(s).filter((c) => c.ns === SNS && c.local === 'customLevel')) for (const id of stringValue(cl).trim().split(/\s+/)) levels[id] = attr(cl, 'level');
    out.scenarios.push({ name: text(s, 'name'), match: text(s, 'match'), ns, schematron, xsd, levels });
  }
  return out;
}

export function pickScenario(doc, scenarios) {
  for (const s of scenarios.scenarios) {
    try { if (ebv(evaluate(s.match, { item: doc, ns: s.ns }))) return s; } catch { /* a scenario that cannot be read does not match */ }
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// 4. Reading e-invoices
// ---------------------------------------------------------------------------------------------

// ---- PDF: find the embedded invoice XML (ZUGFeRD / Factur-X / XRechnung in a PDF) ----

const latin1 = (bytes, a = 0, b = bytes.length) => {
  let s = '';
  for (let i = a; i < b; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(b, i + 8192)));
  return s;
};

export const isPdf = (bytes) => bytes.length > 5 && latin1(bytes, 0, Math.min(1024, bytes.length)).includes('%PDF-');

// PDF literal and hex strings to text (PDFDocEncoding or UTF-16BE with a BOM).
function pdfString(raw) {
  let bytes = [];
  if (raw.startsWith('<')) {
    const hex = raw.slice(1, -1).replace(/\s+/g, '');
    for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt((hex.slice(i, i + 2) + '0').slice(0, 2), 16));
  } else {
    const s = raw.slice(1, -1);
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c !== '\\') { bytes.push(c.charCodeAt(0) & 0xff); continue; }
      const d = s[++i];
      const esc = { n: 10, r: 13, t: 9, b: 8, f: 12, '(': 40, ')': 41, '\\': 92 };
      if (d in esc) bytes.push(esc[d]);
      else if (/[0-7]/.test(d)) { let o = d; while (o.length < 3 && /[0-7]/.test(s[i + 1] ?? '')) o += s[++i]; bytes.push(parseInt(o, 8) & 0xff); }
      else if (d === '\r' || d === '\n') { if (d === '\r' && s[i + 1] === '\n') i++; }
      else bytes.push(d.charCodeAt(0));
    }
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    let out = '';
    for (let i = 2; i + 1 < bytes.length; i += 2) out += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
    return out;
  }
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return new TextDecoder().decode(new Uint8Array(bytes.slice(3)));
  return String.fromCharCode(...bytes);
}

// The end of the PDF value that starts at text[i] (a string, hex string, dictionary, array, name or
// number), so keys inside nested dictionaries and strings are never mistaken for the outer ones.
function skipValue(t, i) {
  const n = t.length;
  if (t.startsWith('<<', i)) {
    let depth = 0;
    while (i < n) {
      if (t.startsWith('<<', i)) { depth++; i += 2; continue; }
      if (t.startsWith('>>', i)) { depth--; i += 2; if (depth === 0) return i; continue; }
      if (t[i] === '(' || (t[i] === '<' && t[i + 1] !== '<') || t[i] === '[') { i = skipValue(t, i); continue; }
      i++;
    }
    return n;
  }
  if (t[i] === '(') {
    let depth = 0;
    for (; i < n; i++) {
      if (t[i] === '\\') { i++; continue; }
      if (t[i] === '(') depth++;
      else if (t[i] === ')') { depth--; if (depth === 0) return i + 1; }
    }
    return n;
  }
  if (t[i] === '<') { const e = t.indexOf('>', i); return e === -1 ? n : e + 1; }
  if (t[i] === '[') {
    i++;
    while (i < n && t[i] !== ']') {
      if (t[i] === '(' || t[i] === '<' || t[i] === '[') i = skipValue(t, i); else i++;
    }
    return i + 1;
  }
  const m = /^(\d+\s+\d+\s+R|\/[^\s/<>[\]()]*|[^\s/<>[\]()]+)/.exec(t.slice(i, i + 64));
  return i + (m ? m[0].length : 1);
}

// The value of a key at the top level of a PDF dictionary's text: { ref } | { name } | { str } |
// { dict } | { array } | { num }, or null.
function dictValue(dict, key) {
  let t = dict.trim();
  if (!t.startsWith('<<')) return null;
  const n = t.length;
  let i = 2;
  while (i < n) {
    while (i < n && /\s/.test(t[i])) i++;
    if (t.startsWith('>>', i)) return null;
    if (t[i] !== '/') { i = skipValue(t, i); continue; }
    const km = /^\/([^\s/<>[\]()]*)/.exec(t.slice(i, i + 80));
    i += km[0].length;
    while (i < n && /\s/.test(t[i])) i++;
    const start = i;
    const end = skipValue(t, i);
    if (km[1] === key) {
      const raw = t.slice(start, end);
      let r;
      if ((r = /^(\d+)\s+(\d+)\s+R/.exec(raw))) return { ref: Number(r[1]) };
      if (raw.startsWith('<<')) return { dict: raw };
      if (raw.startsWith('(') || raw.startsWith('<')) return { str: pdfString(raw) };
      if (raw.startsWith('[')) return { array: raw };
      if (raw.startsWith('/')) return { name: raw.slice(1) };
      if (/^-?\d+(\.\d+)?$/.test(raw)) return { num: Number(raw) };
      return null;
    }
    i = end;
  }
  return null;
}

// Pass 1: every indirect object in the file (and in object streams once they are inflated).
// Returns { objects: Map(num -> { dict, stream?, filters }), needs: [streams to inflate], encrypted }.
export function scanPdf(bytes) {
  const text = latin1(bytes);
  const objects = new Map();
  const re = /(\d+)\s+(\d+)\s+obj\b/g;
  let m;
  let count = 0;
  while ((m = re.exec(text))) {
    if (++count > LIMITS.pdfObjects) throw new InvoiceError('too_large', 'The PDF has too many objects.');
    const num = Number(m[1]);
    const start = m.index + m[0].length;
    const end = text.indexOf('endobj', start);
    const body = text.slice(start, end === -1 ? undefined : end);
    const si = body.search(/\bstream(\r\n|\n|\r)/);
    const obj = { num, dict: si === -1 ? body.trim() : body.slice(0, si).trim() };
    if (si !== -1) {
      const nl = /\bstream(\r\n|\n|\r)/.exec(body.slice(si));
      const dataStart = start + si + nl[0].length;
      const len = dictValue(obj.dict, 'Length');
      let dataEnd = -1;
      if (len && len.num !== undefined && dataStart + len.num <= bytes.length && /^\s*endstream/.test(text.slice(dataStart + len.num, dataStart + len.num + 24))) dataEnd = dataStart + len.num;
      if (dataEnd === -1) {
        const es = text.indexOf('endstream', dataStart);
        dataEnd = es === -1 ? dataStart : es;
        while (dataEnd > dataStart && (text[dataEnd - 1] === '\n' || text[dataEnd - 1] === '\r')) dataEnd--;
      }
      obj.raw = bytes.subarray(dataStart, dataEnd);
      const f = dictValue(obj.dict, 'Filter');
      obj.filters = f?.name ? [f.name] : f?.array ? [...f.array.matchAll(/\/(\w+)/g)].map((x) => x[1]) : [];
      re.lastIndex = dataEnd;
    } else if (end !== -1) re.lastIndex = end;
    if (!objects.has(num) || obj.raw) objects.set(num, obj);
  }
  const encrypted = /\/Encrypt\s+\d+\s+\d+\s+R/.test(text) || /\/Encrypt\s*<</.test(text);
  const needs = [];
  for (const o of objects.values()) {
    if (!o.raw) continue;
    const type = dictValue(o.dict, 'Type')?.name;
    const subtype = dictValue(o.dict, 'Subtype')?.name;
    if (type === 'ObjStm' || type === 'EmbeddedFile' || (type === 'Metadata' && subtype === 'XML')) needs.push(o);
  }
  return { objects, needs, encrypted, text };
}

// A stream's bytes after its filters, given an inflate (zlib) function.
function streamBytes(o, inflate) {
  let data = o.raw;
  for (const f of o.filters) {
    if (f === 'FlateDecode' || f === 'Fl') {
      if (dictValue(o.dict, 'DecodeParms')) {
        const parms = dictValue(o.dict, 'DecodeParms');
        if (parms.dict && /\/Predictor\s+(1[0-5]|[2-9])/.test(parms.dict)) throw new InvoiceError('pdf_unsupported', 'A stream in this PDF uses a PNG predictor the reader does not support.');
      }
      data = inflate(data);
    } else throw new InvoiceError('pdf_unsupported', `A stream in this PDF is encoded with ${f}, which the reader does not support.`);
  }
  return data;
}

// Pass 2: with the needed streams inflated (inflate(bytes) -> bytes, or a Map from the stream's raw
// bytes to its inflated bytes), find the invoice XML. Returns { name, relationship, bytes, embedded,
// xmp } or throws when the PDF holds no e-invoice XML.
export function readPdfInvoice(scan, inflate) {
  const inf = typeof inflate === 'function' ? inflate : (raw) => {
    const got = inflate.get(raw);
    if (!got) throw new InvoiceError('pdf_unsupported', 'A compressed stream in this PDF could not be read.');
    return got;
  };
  if (scan.encrypted) throw new InvoiceError('pdf_encrypted', 'This PDF is encrypted, so its embedded files cannot be read. ZUGFeRD and Factur-X PDFs (PDF/A-3) are never encrypted.');
  const objects = new Map(scan.objects);
  // Objects inside object streams.
  for (const o of scan.objects.values()) {
    if (dictValue(o.dict, 'Type')?.name !== 'ObjStm' || !o.raw) continue;
    let data;
    try { data = latin1(streamBytes(o, inf)); } catch { continue; }
    const nObj = dictValue(o.dict, 'N')?.num ?? 0;
    const first = dictValue(o.dict, 'First')?.num ?? 0;
    const header = data.slice(0, first).trim().split(/\s+/).map(Number);
    for (let k = 0; k < nObj; k++) {
      const num = header[2 * k]; const off = header[2 * k + 1];
      const nextOff = k + 1 < nObj ? header[2 * k + 3] : data.length - first;
      if (!objects.has(num)) objects.set(num, { num, dict: data.slice(first + off, first + nextOff).trim() });
    }
  }
  const files = [];
  for (const o of objects.values()) {
    const ef = dictValue(o.dict, 'EF');
    if (!ef) continue;
    const efDict = ef.dict ?? (ef.ref !== undefined ? objects.get(ef.ref)?.dict : null);
    if (!efDict) continue;
    const ref = (dictValue(efDict, 'UF') ?? dictValue(efDict, 'F'));
    if (!ref || ref.ref === undefined) continue;
    const nameV = dictValue(o.dict, 'UF') ?? dictValue(o.dict, 'F');
    const nameOf = (v) => (v?.str !== undefined ? v.str : v?.ref !== undefined ? (() => { const x = objects.get(v.ref); return x ? pdfString(x.dict.trim()) : ''; })() : '');
    files.push({ name: nameOf(nameV), relationship: dictValue(o.dict, 'AFRelationship')?.name ?? null, stream: ref.ref });
  }
  // Embedded file streams no file specification points to (a damaged PDF) are tried too.
  const named = new Set(files.map((f) => f.stream));
  for (const o of objects.values()) if (o.raw && dictValue(o.dict, 'Type')?.name === 'EmbeddedFile' && !named.has(o.num)) files.push({ name: '', relationship: null, stream: o.num });
  const KNOWN = ['factur-x.xml', 'zugferd-invoice.xml', 'xrechnung.xml', 'order-x.xml'];
  const ranked = files.map((f) => ({ ...f, rank: KNOWN.findIndex((k) => k.toLowerCase() === f.name.toLowerCase()) })).sort((a, b) => (a.rank === -1 ? 99 : a.rank) - (b.rank === -1 ? 99 : b.rank));
  const embedded = ranked.map((f) => f.name || '(unnamed)');
  let xmp = null;
  for (const o of objects.values()) {
    if (!o.raw || dictValue(o.dict, 'Type')?.name !== 'Metadata') continue;
    try { const t = new TextDecoder().decode(streamBytes(o, inf)); if (/pdfaid|fx:|zf:|DocumentType/.test(t)) { xmp = readXmp(t); break; } } catch { /* metadata is optional */ }
  }
  for (const f of ranked) {
    const s = objects.get(f.stream);
    if (!s?.raw) continue;
    let data;
    try { data = streamBytes(s, inf); } catch (e) { if (f.rank !== -1) throw e; continue; }
    // A file with one of the standard names is the invoice; any other embedded file only when its
    // root element is an invoice (comments before the root can be long, so look well past them).
    const head = latin1(data, 0, Math.min(65536, data.length));
    if (f.rank !== -1 || /<(\w+:)?(CrossIndustryInvoice|CrossIndustryDocument|Invoice|CreditNote)[\s>]/.test(head)) {
      return { name: f.name || '(unnamed)', relationship: f.relationship, bytes: data, embedded, xmp };
    }
  }
  if (files.length) throw new InvoiceError('pdf_no_invoice', `This PDF has embedded files (${embedded.join(', ')}) but none is invoice XML, so it is not a ZUGFeRD or Factur-X e-invoice.`);
  throw new InvoiceError('pdf_no_invoice', 'This PDF has no embedded invoice XML, so it is a plain PDF, not a ZUGFeRD or Factur-X e-invoice (an E-Rechnung needs the structured XML).');
}

// Factur-X / ZUGFeRD XMP: the PDF/A part and conformance, the document file name and the profile.
function readXmp(t) {
  const val = (re) => { const m = re.exec(t); return m ? (m[1] ?? m[2]).trim() : null; };
  const field = (name) => val(new RegExp(`<[\\w]+:${name}>([^<]*)<|[\\w]+:${name}="([^"]*)"`));
  return {
    pdfaPart: field('part'),
    pdfaConformance: field('conformance'),
    documentFileName: field('DocumentFileName'),
    documentType: field('DocumentType'),
    version: field('Version'),
    conformanceLevel: field('ConformanceLevel'),
  };
}

// ---- format and profile ----

export const PROFILES = [
  // ZUGFeRD / Factur-X guideline ids (BT-24), most specific first. The German status of each comes
  // from the BMF letter of 15 Oct 2025 and FeRD: MINIMUM and BASIC WL are not invoices under the UStG.
  { id: 'xrechnung-ext', test: (v) => /urn:xeinkauf\.de:kosit:extension:xrechnung_3\.0/.test(v), name: 'XRechnung 3.0 Extension', einvoice: true },
  { id: 'xrechnung-cvd', test: (v) => /urn:xeinkauf\.de:kosit:xrechnung:cvd_/.test(v), name: 'XRechnung 3.0 CVD', einvoice: true },
  { id: 'xrechnung', test: (v) => /urn:xeinkauf\.de:kosit:xrechnung_3\.0$/.test(v), name: 'XRechnung 3.0', einvoice: true },
  { id: 'xrechnung-old', test: (v) => /urn:xeinkauf\.de:kosit:xrechnung_[12]\./.test(v) || /xoev-de:kosit:standard:xrechnung_/.test(v), name: 'XRechnung (older version)', einvoice: null },
  { id: 'extended', test: (v) => /urn:factur-x\.eu:1p0:extended|urn:zugferd\.de:2p\d:extended/.test(v), name: 'ZUGFeRD / Factur-X EXTENDED', einvoice: true },
  { id: 'basicwl', test: (v) => /urn:factur-x\.eu:1p0:basicwl|urn:zugferd\.de:2p\d:basicwl/.test(v), name: 'ZUGFeRD / Factur-X BASIC WL', einvoice: false },
  { id: 'basic', test: (v) => /urn:factur-x\.eu:1p0:basic|urn:zugferd\.de:2p\d:basic/.test(v), name: 'ZUGFeRD / Factur-X BASIC', einvoice: true },
  { id: 'minimum', test: (v) => /urn:factur-x\.eu:1p0:minimum|urn:zugferd\.de:2p\d:minimum/.test(v), name: 'ZUGFeRD / Factur-X MINIMUM', einvoice: false },
  { id: 'peppol', test: (v) => /urn:fdc:peppol\.eu:2017:poacc:billing:3\.0/.test(v), name: 'Peppol BIS Billing 3.0', einvoice: true },
  { id: 'en16931', test: (v) => /^urn:cen\.eu:en16931:2017$/.test(v), name: 'EN 16931', einvoice: true },
  { id: 'zugferd1', test: (v) => /urn:ferd:CrossIndustryDocument:invoice:1p0/.test(v), name: 'ZUGFeRD 1.0', einvoice: false },
];

export function detectFormat(doc) {
  const root = rootOf(doc);
  let syntax = null;
  if (root.ns === NS.ubl && root.local === 'Invoice') syntax = 'ubl-invoice';
  else if (root.ns === NS.cn && root.local === 'CreditNote') syntax = 'ubl-creditnote';
  else if (root.ns === NS.rsm && root.local === 'CrossIndustryInvoice') syntax = 'cii';
  else if (root.local === 'CrossIndustryDocument') syntax = 'zugferd1';
  const ctx = { item: doc, ns: NS };
  const customization = syntax === 'cii'
    ? evalString('/rsm:CrossIndustryInvoice/rsm:ExchangedDocumentContext/ram:GuidelineSpecifiedDocumentContextParameter/ram:ID', ctx).trim()
    : syntax && syntax.startsWith('ubl') ? evalString('/*/cbc:CustomizationID', ctx).trim() : '';
  const z1 = syntax === 'zugferd1' ? evalString("//*[local-name() = 'GuidelineSpecifiedDocumentContextParameter']/*[local-name() = 'ID']", ctx).trim() : '';
  const profile = syntax === 'zugferd1' ? PROFILES.find((p) => p.id === 'zugferd1') : PROFILES.find((p) => customization && p.test(customization)) ?? null;
  if (z1) return { syntax, root: `${root.prefix ? `${root.prefix}:` : ''}${root.local}`, rootNs: root.ns, customization: z1, profile: { id: profile.id, name: profile.name, einvoice: profile.einvoice } };
  // The plain EN 16931 id is ZUGFeRD's / Factur-X's EN 16931 profile in CII, and the CEN core in UBL.
  const name = profile?.id === 'en16931' ? (syntax === 'cii' ? 'ZUGFeRD / Factur-X EN 16931' : 'EN 16931') : profile?.name;
  return { syntax, root: `${root.prefix ? `${root.prefix}:` : ''}${root.local}`, rootNs: root.ns, customization, profile: profile ? { id: profile.id, name, einvoice: profile.einvoice } : null };
}

// ---- the invoice as EN 16931 business terms ----

// XPath for each business term in UBL (Invoice and CreditNote share cac/cbc) and CII. Group paths
// are relative to the group's node. Only what the view and the PDF show; the rules check the rest.
const UBL = {
  doc: {
    'BT-1': 'cbc:ID', 'BT-2': 'cbc:IssueDate', 'BT-3': 'cbc:InvoiceTypeCode | cbc:CreditNoteTypeCode', 'BT-5': 'cbc:DocumentCurrencyCode', 'BT-6': 'cbc:TaxCurrencyCode',
    'BT-7': 'cbc:TaxPointDate', 'BT-8': 'cac:InvoicePeriod/cbc:DescriptionCode', 'BT-9': 'cbc:DueDate | cac:PaymentMeans/cbc:PaymentDueDate', 'BT-10': 'cbc:BuyerReference', 'BT-11': 'cac:ProjectReference/cbc:ID',
    'BT-12': 'cac:ContractDocumentReference/cbc:ID', 'BT-13': 'cac:OrderReference/cbc:ID', 'BT-14': 'cac:OrderReference/cbc:SalesOrderID', 'BT-15': 'cac:ReceiptDocumentReference/cbc:ID',
    'BT-16': 'cac:DespatchDocumentReference/cbc:ID', 'BT-17': 'cac:OriginatorDocumentReference/cbc:ID', 'BT-19': 'cbc:AccountingCost', 'BT-20': 'cac:PaymentTerms/cbc:Note',
    'BT-24': 'cbc:CustomizationID', 'BT-23': 'cbc:ProfileID', 'BT-25': 'cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID', 'BT-26': 'cac:BillingReference/cac:InvoiceDocumentReference/cbc:IssueDate',
    'BT-72': 'cac:Delivery/cbc:ActualDeliveryDate', 'BT-73': 'cac:InvoicePeriod/cbc:StartDate', 'BT-74': 'cac:InvoicePeriod/cbc:EndDate',
    'BT-70': 'cac:Delivery/cac:DeliveryParty/cac:PartyName/cbc:Name',
    'BT-106': 'cac:LegalMonetaryTotal/cbc:LineExtensionAmount', 'BT-107': 'cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount', 'BT-108': 'cac:LegalMonetaryTotal/cbc:ChargeTotalAmount',
    'BT-109': 'cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount', 'BT-110': "cac:TaxTotal/cbc:TaxAmount[@currencyID = ../../cbc:DocumentCurrencyCode]", 'BT-111': "cac:TaxTotal/cbc:TaxAmount[@currencyID = ../../cbc:TaxCurrencyCode]",
    'BT-112': 'cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount', 'BT-113': 'cac:LegalMonetaryTotal/cbc:PrepaidAmount', 'BT-114': 'cac:LegalMonetaryTotal/cbc:PayableRoundingAmount', 'BT-115': 'cac:LegalMonetaryTotal/cbc:PayableAmount',
    'BT-81': 'cac:PaymentMeans/cbc:PaymentMeansCode', 'BT-82': 'cac:PaymentMeans/cbc:PaymentMeansCode/@name', 'BT-83': 'cac:PaymentMeans/cbc:PaymentID',
    'BT-89': 'cac:PaymentMeans/cac:PaymentMandate/cbc:ID', 'BT-90': 'cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID="SEPA"]', 'BT-91': 'cac:PaymentMeans/cac:PaymentMandate/cac:PayerFinancialAccount/cbc:ID',
  },
  notes: 'cbc:Note',
  seller: {
    node: 'cac:AccountingSupplierParty/cac:Party',
    'BT-27': 'cac:PartyLegalEntity/cbc:RegistrationName', 'BT-28': 'cac:PartyName/cbc:Name', 'BT-29': 'cac:PartyIdentification/cbc:ID', 'BT-30': 'cac:PartyLegalEntity/cbc:CompanyID',
    'BT-31': "cac:PartyTaxScheme[normalize-space(upper-case(cac:TaxScheme/cbc:ID)) = 'VAT']/cbc:CompanyID", 'BT-32': "cac:PartyTaxScheme[normalize-space(upper-case(cac:TaxScheme/cbc:ID)) != 'VAT']/cbc:CompanyID",
    'BT-33': 'cac:PartyLegalEntity/cbc:CompanyLegalForm', 'BT-34': 'cbc:EndpointID',
    'BT-35': 'cac:PostalAddress/cbc:StreetName', 'BT-36': 'cac:PostalAddress/cbc:AdditionalStreetName', 'BT-162': 'cac:PostalAddress/cac:AddressLine/cbc:Line', 'BT-37': 'cac:PostalAddress/cbc:CityName',
    'BT-38': 'cac:PostalAddress/cbc:PostalZone', 'BT-39': 'cac:PostalAddress/cbc:CountrySubentity', 'BT-40': 'cac:PostalAddress/cac:Country/cbc:IdentificationCode',
    'BT-41': 'cac:Contact/cbc:Name', 'BT-42': 'cac:Contact/cbc:Telephone', 'BT-43': 'cac:Contact/cbc:ElectronicMail',
  },
  buyer: {
    node: 'cac:AccountingCustomerParty/cac:Party',
    'BT-44': 'cac:PartyLegalEntity/cbc:RegistrationName', 'BT-45': 'cac:PartyName/cbc:Name', 'BT-46': 'cac:PartyIdentification/cbc:ID', 'BT-47': 'cac:PartyLegalEntity/cbc:CompanyID',
    'BT-48': 'cac:PartyTaxScheme/cbc:CompanyID', 'BT-49': 'cbc:EndpointID',
    'BT-50': 'cac:PostalAddress/cbc:StreetName', 'BT-51': 'cac:PostalAddress/cbc:AdditionalStreetName', 'BT-163': 'cac:PostalAddress/cac:AddressLine/cbc:Line', 'BT-52': 'cac:PostalAddress/cbc:CityName',
    'BT-53': 'cac:PostalAddress/cbc:PostalZone', 'BT-54': 'cac:PostalAddress/cbc:CountrySubentity', 'BT-55': 'cac:PostalAddress/cac:Country/cbc:IdentificationCode',
    'BT-56': 'cac:Contact/cbc:Name', 'BT-57': 'cac:Contact/cbc:Telephone', 'BT-58': 'cac:Contact/cbc:ElectronicMail',
  },
  payee: { node: 'cac:PayeeParty', 'BT-59': 'cac:PartyName/cbc:Name', 'BT-60': 'cac:PartyIdentification/cbc:ID', 'BT-61': 'cac:PartyLegalEntity/cbc:CompanyID' },
  taxRep: { node: 'cac:TaxRepresentativeParty', 'BT-62': 'cac:PartyName/cbc:Name', 'BT-63': 'cac:PartyTaxScheme/cbc:CompanyID' },
  delivery: { node: 'cac:Delivery', 'BT-70': 'cac:DeliveryParty/cac:PartyName/cbc:Name', 'BT-71': 'cac:DeliveryLocation/cbc:ID', 'BT-72': 'cbc:ActualDeliveryDate', 'BT-75': 'cac:DeliveryLocation/cac:Address/cbc:StreetName', 'BT-77': 'cac:DeliveryLocation/cac:Address/cbc:CityName', 'BT-78': 'cac:DeliveryLocation/cac:Address/cbc:PostalZone', 'BT-80': 'cac:DeliveryLocation/cac:Address/cac:Country/cbc:IdentificationCode' },
  accounts: { node: 'cac:PaymentMeans/cac:PayeeFinancialAccount', 'BT-84': 'cbc:ID', 'BT-85': 'cbc:Name', 'BT-86': 'cac:FinancialInstitutionBranch/cbc:ID' },
  cards: { node: 'cac:PaymentMeans/cac:CardAccount', 'BT-87': 'cbc:PrimaryAccountNumberID', 'BT-88': 'cbc:HolderName' },
  allowances: { node: 'cac:AllowanceCharge', charge: 'cbc:ChargeIndicator', amount: 'cbc:Amount', base: 'cbc:BaseAmount', percent: 'cbc:MultiplierFactorNumeric', category: 'cac:TaxCategory/cbc:ID', rate: 'cac:TaxCategory/cbc:Percent', reason: 'cbc:AllowanceChargeReason', code: 'cbc:AllowanceChargeReasonCode' },
  vat: { node: 'cac:TaxTotal/cac:TaxSubtotal', 'BT-116': 'cbc:TaxableAmount', 'BT-117': 'cbc:TaxAmount', 'BT-118': 'cac:TaxCategory/cbc:ID', 'BT-119': 'cac:TaxCategory/cbc:Percent', 'BT-120': 'cac:TaxCategory/cbc:TaxExemptionReason', 'BT-121': 'cac:TaxCategory/cbc:TaxExemptionReasonCode' },
  docs: { node: 'cac:AdditionalDocumentReference', 'BT-122': 'cbc:ID', 'BT-123': 'cbc:DocumentDescription', 'BT-124': 'cac:Attachment/cac:ExternalReference/cbc:URI', 'BT-125': 'cac:Attachment/cbc:EmbeddedDocumentBinaryObject', mime: 'cac:Attachment/cbc:EmbeddedDocumentBinaryObject/@mimeCode', file: 'cac:Attachment/cbc:EmbeddedDocumentBinaryObject/@filename', 'BT-18': 'cbc:ID[../cbc:DocumentTypeCode = "130"]' },
  lines: {
    node: 'cac:InvoiceLine | cac:CreditNoteLine', 'BT-126': 'cbc:ID', 'BT-127': 'cbc:Note', 'BT-128': 'cac:DocumentReference/cbc:ID', 'BT-129': 'cbc:InvoicedQuantity | cbc:CreditedQuantity', 'BT-130': '(cbc:InvoicedQuantity | cbc:CreditedQuantity)/@unitCode',
    'BT-131': 'cbc:LineExtensionAmount', 'BT-132': 'cac:OrderLineReference/cbc:LineID', 'BT-133': 'cbc:AccountingCost', 'BT-134': 'cac:InvoicePeriod/cbc:StartDate', 'BT-135': 'cac:InvoicePeriod/cbc:EndDate',
    'BT-146': 'cac:Price/cbc:PriceAmount', 'BT-147': 'cac:Price/cac:AllowanceCharge/cbc:Amount', 'BT-148': 'cac:Price/cac:AllowanceCharge/cbc:BaseAmount', 'BT-149': 'cac:Price/cbc:BaseQuantity', 'BT-150': 'cac:Price/cbc:BaseQuantity/@unitCode',
    'BT-151': 'cac:Item/cac:ClassifiedTaxCategory/cbc:ID', 'BT-152': 'cac:Item/cac:ClassifiedTaxCategory/cbc:Percent', 'BT-153': 'cac:Item/cbc:Name', 'BT-154': 'cac:Item/cbc:Description',
    'BT-155': 'cac:Item/cac:SellersItemIdentification/cbc:ID', 'BT-156': 'cac:Item/cac:BuyersItemIdentification/cbc:ID', 'BT-157': 'cac:Item/cac:StandardItemIdentification/cbc:ID', 'BT-159': 'cac:Item/cac:OriginCountry/cbc:IdentificationCode',
    allowances: 'cac:AllowanceCharge',
  },
};

const CII = {
  doc: {
    'BT-1': '/rsm:CrossIndustryInvoice/rsm:ExchangedDocument/ram:ID', 'BT-2': '/rsm:CrossIndustryInvoice/rsm:ExchangedDocument/ram:IssueDateTime/udt:DateTimeString', 'BT-3': '/rsm:CrossIndustryInvoice/rsm:ExchangedDocument/ram:TypeCode',
    'BT-5': '//ram:ApplicableHeaderTradeSettlement/ram:InvoiceCurrencyCode', 'BT-6': '//ram:ApplicableHeaderTradeSettlement/ram:TaxCurrencyCode', 'BT-7': '//ram:ApplicableHeaderTradeSettlement/ram:ApplicableTradeTax/ram:TaxPointDate/udt:DateString',
    'BT-8': '//ram:ApplicableHeaderTradeSettlement/ram:ApplicableTradeTax/ram:DueDateTypeCode', 'BT-9': '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradePaymentTerms/ram:DueDateDateTime/udt:DateTimeString',
    'BT-10': '//ram:ApplicableHeaderTradeAgreement/ram:BuyerReference', 'BT-11': '//ram:ApplicableHeaderTradeAgreement/ram:SpecifiedProcuringProject/ram:ID', 'BT-12': '//ram:ApplicableHeaderTradeAgreement/ram:ContractReferencedDocument/ram:IssuerAssignedID',
    'BT-13': '//ram:ApplicableHeaderTradeAgreement/ram:BuyerOrderReferencedDocument/ram:IssuerAssignedID', 'BT-14': '//ram:ApplicableHeaderTradeAgreement/ram:SellerOrderReferencedDocument/ram:IssuerAssignedID',
    'BT-15': '//ram:ApplicableHeaderTradeDelivery/ram:ReceivingAdviceReferencedDocument/ram:IssuerAssignedID', 'BT-16': '//ram:ApplicableHeaderTradeDelivery/ram:DespatchAdviceReferencedDocument/ram:IssuerAssignedID',
    'BT-17': "//ram:ApplicableHeaderTradeAgreement/ram:AdditionalReferencedDocument[ram:TypeCode = '50']/ram:IssuerAssignedID", 'BT-19': '//ram:ApplicableHeaderTradeSettlement/ram:ReceivableSpecifiedTradeAccountingAccount/ram:ID',
    'BT-20': '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradePaymentTerms/ram:Description',
    'BT-24': '/rsm:CrossIndustryInvoice/rsm:ExchangedDocumentContext/ram:GuidelineSpecifiedDocumentContextParameter/ram:ID', 'BT-23': '/rsm:CrossIndustryInvoice/rsm:ExchangedDocumentContext/ram:BusinessProcessSpecifiedDocumentContextParameter/ram:ID',
    'BT-25': '//ram:ApplicableHeaderTradeSettlement/ram:InvoiceReferencedDocument/ram:IssuerAssignedID', 'BT-26': '//ram:ApplicableHeaderTradeSettlement/ram:InvoiceReferencedDocument/ram:FormattedIssueDateTime/qdt:DateTimeString',
    'BT-72': '//ram:ApplicableHeaderTradeDelivery/ram:ActualDeliverySupplyChainEvent/ram:OccurrenceDateTime/udt:DateTimeString',
    'BT-73': '//ram:ApplicableHeaderTradeSettlement/ram:BillingSpecifiedPeriod/ram:StartDateTime/udt:DateTimeString', 'BT-74': '//ram:ApplicableHeaderTradeSettlement/ram:BillingSpecifiedPeriod/ram:EndDateTime/udt:DateTimeString',
    'BT-106': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:LineTotalAmount', 'BT-107': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:AllowanceTotalAmount', 'BT-108': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:ChargeTotalAmount',
    'BT-109': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxBasisTotalAmount', 'BT-110': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxTotalAmount[@currencyID = //ram:ApplicableHeaderTradeSettlement/ram:InvoiceCurrencyCode]',
    'BT-111': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxTotalAmount[@currencyID = //ram:ApplicableHeaderTradeSettlement/ram:TaxCurrencyCode]',
    'BT-112': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:GrandTotalAmount', 'BT-113': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TotalPrepaidAmount',
    'BT-114': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:RoundingAmount', 'BT-115': '//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:DuePayableAmount',
    'BT-81': '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans/ram:TypeCode', 'BT-82': '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans/ram:Information',
    'BT-83': '//ram:ApplicableHeaderTradeSettlement/ram:PaymentReference', 'BT-89': '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradePaymentTerms/ram:DirectDebitMandateID',
    'BT-90': '//ram:ApplicableHeaderTradeSettlement/ram:CreditorReferenceID', 'BT-91': '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans/ram:PayerPartyDebtorFinancialAccount/ram:IBANID',
  },
  notes: '/rsm:CrossIndustryInvoice/rsm:ExchangedDocument/ram:IncludedNote/ram:Content',
  seller: {
    node: '//ram:ApplicableHeaderTradeAgreement/ram:SellerTradeParty',
    'BT-27': 'ram:Name', 'BT-28': 'ram:SpecifiedLegalOrganization/ram:TradingBusinessName', 'BT-29': 'ram:ID | ram:GlobalID', 'BT-30': 'ram:SpecifiedLegalOrganization/ram:ID',
    'BT-31': "ram:SpecifiedTaxRegistration/ram:ID[@schemeID = 'VA']", 'BT-32': "ram:SpecifiedTaxRegistration/ram:ID[@schemeID = 'FC']", 'BT-33': 'ram:Description', 'BT-34': 'ram:URIUniversalCommunication/ram:URIID',
    'BT-35': 'ram:PostalTradeAddress/ram:LineOne', 'BT-36': 'ram:PostalTradeAddress/ram:LineTwo', 'BT-162': 'ram:PostalTradeAddress/ram:LineThree', 'BT-37': 'ram:PostalTradeAddress/ram:CityName',
    'BT-38': 'ram:PostalTradeAddress/ram:PostcodeCode', 'BT-39': 'ram:PostalTradeAddress/ram:CountrySubDivisionName', 'BT-40': 'ram:PostalTradeAddress/ram:CountryID',
    'BT-41': 'ram:DefinedTradeContact/ram:PersonName', 'BT-42': 'ram:DefinedTradeContact/ram:TelephoneUniversalCommunication/ram:CompleteNumber', 'BT-43': 'ram:DefinedTradeContact/ram:EmailURIUniversalCommunication/ram:URIID',
  },
  buyer: {
    node: '//ram:ApplicableHeaderTradeAgreement/ram:BuyerTradeParty',
    'BT-44': 'ram:Name', 'BT-45': 'ram:SpecifiedLegalOrganization/ram:TradingBusinessName', 'BT-46': 'ram:ID | ram:GlobalID', 'BT-47': 'ram:SpecifiedLegalOrganization/ram:ID',
    'BT-48': "ram:SpecifiedTaxRegistration/ram:ID[@schemeID = 'VA']", 'BT-49': 'ram:URIUniversalCommunication/ram:URIID',
    'BT-50': 'ram:PostalTradeAddress/ram:LineOne', 'BT-51': 'ram:PostalTradeAddress/ram:LineTwo', 'BT-163': 'ram:PostalTradeAddress/ram:LineThree', 'BT-52': 'ram:PostalTradeAddress/ram:CityName',
    'BT-53': 'ram:PostalTradeAddress/ram:PostcodeCode', 'BT-54': 'ram:PostalTradeAddress/ram:CountrySubDivisionName', 'BT-55': 'ram:PostalTradeAddress/ram:CountryID',
    'BT-56': 'ram:DefinedTradeContact/ram:PersonName', 'BT-57': 'ram:DefinedTradeContact/ram:TelephoneUniversalCommunication/ram:CompleteNumber', 'BT-58': 'ram:DefinedTradeContact/ram:EmailURIUniversalCommunication/ram:URIID',
  },
  payee: { node: '//ram:ApplicableHeaderTradeSettlement/ram:PayeeTradeParty', 'BT-59': 'ram:Name', 'BT-60': 'ram:ID | ram:GlobalID', 'BT-61': 'ram:SpecifiedLegalOrganization/ram:ID' },
  taxRep: { node: '//ram:ApplicableHeaderTradeAgreement/ram:SellerTaxRepresentativeTradeParty', 'BT-62': 'ram:Name', 'BT-63': "ram:SpecifiedTaxRegistration/ram:ID[@schemeID = 'VA']" },
  delivery: { node: '//ram:ApplicableHeaderTradeDelivery', 'BT-70': 'ram:ShipToTradeParty/ram:Name', 'BT-71': 'ram:ShipToTradeParty/ram:ID | ram:ShipToTradeParty/ram:GlobalID', 'BT-72': 'ram:ActualDeliverySupplyChainEvent/ram:OccurrenceDateTime/udt:DateTimeString', 'BT-75': 'ram:ShipToTradeParty/ram:PostalTradeAddress/ram:LineOne', 'BT-77': 'ram:ShipToTradeParty/ram:PostalTradeAddress/ram:CityName', 'BT-78': 'ram:ShipToTradeParty/ram:PostalTradeAddress/ram:PostcodeCode', 'BT-80': 'ram:ShipToTradeParty/ram:PostalTradeAddress/ram:CountryID' },
  accounts: { node: '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans/ram:PayeePartyCreditorFinancialAccount', 'BT-84': 'ram:IBANID | ram:ProprietaryID', 'BT-85': 'ram:AccountName', 'BT-86': '../ram:PayeeSpecifiedCreditorFinancialInstitution/ram:BICID' },
  cards: { node: '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans/ram:ApplicableTradeSettlementFinancialCard', 'BT-87': 'ram:ID', 'BT-88': 'ram:CardholderName' },
  allowances: { node: '//ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeAllowanceCharge', charge: 'ram:ChargeIndicator/udt:Indicator', amount: 'ram:ActualAmount', base: 'ram:BasisAmount', percent: 'ram:CalculationPercent', category: 'ram:CategoryTradeTax/ram:CategoryCode', rate: 'ram:CategoryTradeTax/ram:RateApplicablePercent', reason: 'ram:Reason', code: 'ram:ReasonCode' },
  vat: { node: '//ram:ApplicableHeaderTradeSettlement/ram:ApplicableTradeTax', 'BT-116': 'ram:BasisAmount', 'BT-117': 'ram:CalculatedAmount', 'BT-118': 'ram:CategoryCode', 'BT-119': 'ram:RateApplicablePercent', 'BT-120': 'ram:ExemptionReason', 'BT-121': 'ram:ExemptionReasonCode' },
  docs: { node: "//ram:ApplicableHeaderTradeAgreement/ram:AdditionalReferencedDocument[ram:TypeCode = '916' or ram:TypeCode = '130']", 'BT-122': 'ram:IssuerAssignedID', 'BT-123': 'ram:Name', 'BT-124': 'ram:URIID', 'BT-125': 'ram:AttachmentBinaryObject', mime: 'ram:AttachmentBinaryObject/@mimeCode', file: 'ram:AttachmentBinaryObject/@filename', 'BT-18': "ram:IssuerAssignedID[../ram:TypeCode = '130']" },
  lines: {
    node: '//ram:IncludedSupplyChainTradeLineItem', 'BT-126': 'ram:AssociatedDocumentLineDocument/ram:LineID', 'BT-127': 'ram:AssociatedDocumentLineDocument/ram:IncludedNote/ram:Content',
    'BT-128': 'ram:SpecifiedLineTradeSettlement/ram:AdditionalReferencedDocument/ram:IssuerAssignedID', 'BT-129': 'ram:SpecifiedLineTradeDelivery/ram:BilledQuantity', 'BT-130': 'ram:SpecifiedLineTradeDelivery/ram:BilledQuantity/@unitCode',
    'BT-131': 'ram:SpecifiedLineTradeSettlement/ram:SpecifiedTradeSettlementLineMonetarySummation/ram:LineTotalAmount', 'BT-132': 'ram:SpecifiedLineTradeAgreement/ram:BuyerOrderReferencedDocument/ram:LineID',
    'BT-133': 'ram:SpecifiedLineTradeSettlement/ram:ReceivableSpecifiedTradeAccountingAccount/ram:ID', 'BT-134': 'ram:SpecifiedLineTradeSettlement/ram:BillingSpecifiedPeriod/ram:StartDateTime/udt:DateTimeString',
    'BT-135': 'ram:SpecifiedLineTradeSettlement/ram:BillingSpecifiedPeriod/ram:EndDateTime/udt:DateTimeString',
    'BT-146': 'ram:SpecifiedLineTradeAgreement/ram:NetPriceProductTradePrice/ram:ChargeAmount', 'BT-147': 'ram:SpecifiedLineTradeAgreement/ram:GrossPriceProductTradePrice/ram:AppliedTradeAllowanceCharge/ram:ActualAmount',
    'BT-148': 'ram:SpecifiedLineTradeAgreement/ram:GrossPriceProductTradePrice/ram:ChargeAmount', 'BT-149': 'ram:SpecifiedLineTradeAgreement/ram:NetPriceProductTradePrice/ram:BasisQuantity', 'BT-150': 'ram:SpecifiedLineTradeAgreement/ram:NetPriceProductTradePrice/ram:BasisQuantity/@unitCode',
    'BT-151': 'ram:SpecifiedLineTradeSettlement/ram:ApplicableTradeTax/ram:CategoryCode', 'BT-152': 'ram:SpecifiedLineTradeSettlement/ram:ApplicableTradeTax/ram:RateApplicablePercent', 'BT-153': 'ram:SpecifiedTradeProduct/ram:Name', 'BT-154': 'ram:SpecifiedTradeProduct/ram:Description',
    'BT-155': 'ram:SpecifiedTradeProduct/ram:SellerAssignedID', 'BT-156': 'ram:SpecifiedTradeProduct/ram:BuyerAssignedID', 'BT-157': 'ram:SpecifiedTradeProduct/ram:GlobalID', 'BT-159': 'ram:SpecifiedTradeProduct/ram:OriginTradeCountry/ram:ID',
    allowances: 'ram:SpecifiedLineTradeSettlement/ram:SpecifiedTradeAllowanceCharge',
  },
};

const ALLOWANCE_KEYS = ['charge', 'amount', 'base', 'percent', 'category', 'rate', 'reason', 'code'];

// CII dates are written 20260131 (format 102); shown as 2026-01-31.
const isoDate = (s) => (/^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s);
const DATE_TERMS = new Set(['BT-2', 'BT-7', 'BT-9', 'BT-26', 'BT-72', 'BT-73', 'BT-74', 'BT-134', 'BT-135']);

function readTerms(map, node, ctx, keys = Object.keys(map)) {
  const out = {};
  for (const k of keys) {
    if (k === 'node' || k === 'allowances' || typeof map[k] !== 'string') continue;
    let r;
    try { r = evaluate(map[k], { ...ctx, item: node }); } catch { continue; }
    const values = atomize(r).map(strOf).map((s) => s.replace(/\s+$/g, '').replace(/^\s+/, '')).filter((s) => s !== '');
    if (!values.length) continue;
    const v = values.length === 1 ? values[0] : values;
    out[k] = DATE_TERMS.has(k) ? (Array.isArray(v) ? v.map(isoDate) : isoDate(v)) : v;
    if (k === 'BT-125') out[k] = values[0].length; // the size of the base64 text, not the file itself
  }
  return out;
}

// The invoice as business terms: { doc, notes, seller, buyer, payee, taxRep, delivery, accounts,
// cards, allowances, vat, attachments, lines }. Amounts stay as written in the file (text).
export function readInvoice(doc, format = detectFormat(doc)) {
  const map = format.syntax === 'cii' ? CII : format.syntax?.startsWith('ubl') ? UBL : null;
  if (!map) throw new InvoiceError('not_einvoice', 'This XML is not an e-invoice: the root element is neither a UBL Invoice or CreditNote nor a UN/CEFACT CrossIndustryInvoice.');
  const root = rootOf(doc);
  const ctx = { ns: NS };
  const groupNodes = (path) => { try { return evaluate(path, { ...ctx, item: root }).filter(isNode); } catch { return []; } };
  const one1 = (key) => { const n = groupNodes(map[key].node)[0]; return n ? readTerms(map[key], n, ctx) : {}; };
  const many = (key) => groupNodes(map[key].node).map((n) => readTerms(map[key], n, ctx));
  const allowancesOf = (nodes) => nodes.map((n) => {
    const r = {};
    for (const k of ALLOWANCE_KEYS) { const v = evalString(map.allowances[k], { ...ctx, item: n }).trim(); if (v) r[k] = v; }
    r.charge = r.charge === 'true';
    return r;
  });
  const out = {
    doc: readTerms(map.doc, root, ctx),
    notes: groupNodes(map.notes).map((n) => stringValue(n).trim()).filter(Boolean),
    seller: one1('seller'), buyer: one1('buyer'), payee: one1('payee'), taxRep: one1('taxRep'), delivery: one1('delivery'),
    accounts: many('accounts'), cards: many('cards'),
    allowances: allowancesOf(groupNodes(map.allowances.node)),
    vat: many('vat'),
    attachments: groupNodes(map.docs.node).map((n) => {
      const t = readTerms(map.docs, n, ctx);
      const bin = evaluate(map.docs['BT-125'], { ...ctx, item: n }).filter(isNode)[0];
      return { id: t['BT-122'] ?? null, description: t['BT-123'] ?? null, uri: t['BT-124'] ?? null, mime: t.mime ?? null, filename: t.file ?? null, size: bin ? Math.floor((stringValue(bin).replace(/\s+/g, '').length * 3) / 4) : null, embedded: !!bin };
    }),
    lines: groupNodes(map.lines.node).map((n) => ({ ...readTerms(map.lines, n, ctx), allowances: allowancesOf(evaluate(map.lines.allowances, { ...ctx, item: n }).filter(isNode)) })),
  };
  return out;
}

// The base64 bytes of an embedded attachment (BG-24), by its position, for the page's download link.
export function attachmentData(doc, index, format = detectFormat(doc)) {
  const map = format.syntax === 'cii' ? CII : UBL;
  const nodes = evaluate(map.docs.node, { ns: NS, item: rootOf(doc) }).filter(isNode);
  const n = nodes[index];
  if (!n) return null;
  const bin = evaluate(map.docs['BT-125'], { ns: NS, item: n }).filter(isNode)[0];
  return bin ? stringValue(bin).replace(/\s+/g, '') : null;
}

// ---- code lists for the view (names in German and English) ----

export const TYPE_CODES = {
  326: { de: 'Teilrechnung', en: 'Partial invoice' },
  380: { de: 'Rechnung', en: 'Commercial invoice' },
  381: { de: 'Gutschrift (Rechnungskorrektur)', en: 'Credit note' },
  384: { de: 'Rechnungskorrektur', en: 'Corrected invoice' },
  389: { de: 'Gutschrift im Gutschriftsverfahren (Self-billed invoice)', en: 'Self-billed invoice' },
  875: { de: 'Teilschlussrechnung (Bauleistung)', en: 'Partial construction invoice' },
  876: { de: 'Teilschlussrechnung', en: 'Partial final construction invoice' },
  877: { de: 'Schlussrechnung', en: 'Final construction invoice' },
  261: { de: 'Selbst ausgestellte Gutschrift (Storno)', en: 'Self billed credit note' },
  383: { de: 'Belastungsanzeige', en: 'Debit note' },
  751: { de: 'Rechnungsinformation für Buchhaltungszwecke', en: 'Invoice information for accounting purposes' },
};

export const VAT_CATEGORIES = {
  S: { de: 'Normalsatz oder ermäßigter Satz', en: 'Standard rate' },
  Z: { de: 'Nullsatz', en: 'Zero rated' },
  E: { de: 'Steuerbefreit', en: 'Exempt from tax' },
  AE: { de: 'Umkehr der Steuerschuldnerschaft (Reverse Charge)', en: 'Reverse charge' },
  K: { de: 'Innergemeinschaftliche Lieferung', en: 'Intra-community supply' },
  G: { de: 'Ausfuhr (Export außerhalb der EU)', en: 'Export outside the EU' },
  O: { de: 'Nicht im Anwendungsbereich der Umsatzsteuer', en: 'Not subject to VAT' },
  L: { de: 'IGIC (Kanarische Inseln)', en: 'Canary Islands (IGIC)' },
  M: { de: 'IPSI (Ceuta und Melilla)', en: 'Ceuta and Melilla (IPSI)' },
};

export const PAYMENT_MEANS = {
  1: { de: 'Nicht definiert', en: 'Not defined' }, 10: { de: 'Bar', en: 'Cash' }, 20: { de: 'Scheck', en: 'Cheque' }, 30: { de: 'Überweisung', en: 'Credit transfer' },
  31: { de: 'Überweisung (Auslandszahlung)', en: 'Debit transfer' }, 42: { de: 'Zahlung auf Bankkonto', en: 'Payment to bank account' }, 48: { de: 'Kartenzahlung', en: 'Bank card' },
  49: { de: 'Lastschrift', en: 'Direct debit' }, 54: { de: 'Kreditkarte', en: 'Credit card' }, 55: { de: 'Debitkarte', en: 'Debit card' }, 57: { de: 'Dauerauftrag', en: 'Standing agreement' },
  58: { de: 'SEPA-Überweisung', en: 'SEPA credit transfer' }, 59: { de: 'SEPA-Lastschrift', en: 'SEPA direct debit' }, 97: { de: 'Verrechnung', en: 'Clearing between partners' }, ZZZ: { de: 'Sonstiges', en: 'Mutually defined' },
};

// Business term names (EN 16931 semantic model), for the view, the PDF and the rule pages.
export const TERMS = {
  'BT-1': { de: 'Rechnungsnummer', en: 'Invoice number' }, 'BT-2': { de: 'Rechnungsdatum', en: 'Invoice issue date' }, 'BT-3': { de: 'Rechnungsart', en: 'Invoice type code' },
  'BT-5': { de: 'Währung', en: 'Invoice currency' }, 'BT-6': { de: 'Steuerwährung', en: 'VAT accounting currency' }, 'BT-7': { de: 'Steuerfälligkeitsdatum', en: 'Value added tax point date' },
  'BT-8': { de: 'Code für das Steuerfälligkeitsdatum', en: 'VAT point date code' }, 'BT-9': { de: 'Fälligkeitsdatum', en: 'Payment due date' }, 'BT-10': { de: 'Käuferreferenz (Leitweg-ID)', en: 'Buyer reference' },
  'BT-11': { de: 'Projektreferenz', en: 'Project reference' }, 'BT-12': { de: 'Vertragsnummer', en: 'Contract reference' }, 'BT-13': { de: 'Bestellnummer', en: 'Purchase order reference' },
  'BT-14': { de: 'Auftragsnummer', en: 'Sales order reference' }, 'BT-15': { de: 'Wareneingangsmeldung', en: 'Receiving advice reference' }, 'BT-16': { de: 'Lieferavis', en: 'Despatch advice reference' },
  'BT-17': { de: 'Ausschreibung/Los', en: 'Tender or lot reference' }, 'BT-18': { de: 'Objektkennung', en: 'Invoiced object identifier' }, 'BT-19': { de: 'Buchungsreferenz des Käufers', en: 'Buyer accounting reference' },
  'BT-20': { de: 'Zahlungsbedingungen', en: 'Payment terms' }, 'BT-22': { de: 'Bemerkung', en: 'Invoice note' }, 'BT-23': { de: 'Geschäftsprozess', en: 'Business process type' },
  'BT-24': { de: 'Spezifikationskennung', en: 'Specification identifier' }, 'BT-25': { de: 'Vorausgegangene Rechnung', en: 'Preceding invoice reference' }, 'BT-26': { de: 'Datum der vorausgegangenen Rechnung', en: 'Preceding invoice issue date' },
  'BT-27': { de: 'Name des Verkäufers', en: 'Seller name' }, 'BT-28': { de: 'Handelsname', en: 'Seller trading name' }, 'BT-29': { de: 'Kennung des Verkäufers', en: 'Seller identifier' },
  'BT-30': { de: 'Registernummer', en: 'Seller legal registration identifier' }, 'BT-31': { de: 'USt-IdNr. des Verkäufers', en: 'Seller VAT identifier' }, 'BT-32': { de: 'Steuernummer des Verkäufers', en: 'Seller tax registration identifier' },
  'BT-33': { de: 'Weitere rechtliche Informationen', en: 'Seller additional legal information' }, 'BT-34': { de: 'Elektronische Adresse des Verkäufers', en: 'Seller electronic address' },
  'BT-35': { de: 'Straße', en: 'Address line 1' }, 'BT-36': { de: 'Adresszeile 2', en: 'Address line 2' }, 'BT-162': { de: 'Adresszeile 3', en: 'Address line 3' }, 'BT-37': { de: 'Ort', en: 'City' },
  'BT-38': { de: 'Postleitzahl', en: 'Post code' }, 'BT-39': { de: 'Region', en: 'Country subdivision' }, 'BT-40': { de: 'Land', en: 'Country code' },
  'BT-41': { de: 'Kontaktperson', en: 'Contact point' }, 'BT-42': { de: 'Telefon', en: 'Telephone' }, 'BT-43': { de: 'E-Mail', en: 'Email' },
  'BT-44': { de: 'Name des Käufers', en: 'Buyer name' }, 'BT-45': { de: 'Handelsname', en: 'Buyer trading name' }, 'BT-46': { de: 'Kennung des Käufers', en: 'Buyer identifier' },
  'BT-47': { de: 'Registernummer', en: 'Buyer legal registration identifier' }, 'BT-48': { de: 'USt-IdNr. des Käufers', en: 'Buyer VAT identifier' }, 'BT-49': { de: 'Elektronische Adresse des Käufers', en: 'Buyer electronic address' },
  'BT-50': { de: 'Straße', en: 'Address line 1' }, 'BT-51': { de: 'Adresszeile 2', en: 'Address line 2' }, 'BT-163': { de: 'Adresszeile 3', en: 'Address line 3' }, 'BT-52': { de: 'Ort', en: 'City' },
  'BT-53': { de: 'Postleitzahl', en: 'Post code' }, 'BT-54': { de: 'Region', en: 'Country subdivision' }, 'BT-55': { de: 'Land', en: 'Country code' },
  'BT-56': { de: 'Kontaktperson', en: 'Contact point' }, 'BT-57': { de: 'Telefon', en: 'Telephone' }, 'BT-58': { de: 'E-Mail', en: 'Email' },
  'BT-59': { de: 'Zahlungsempfänger', en: 'Payee name' }, 'BT-60': { de: 'Kennung des Zahlungsempfängers', en: 'Payee identifier' }, 'BT-61': { de: 'Registernummer des Zahlungsempfängers', en: 'Payee legal registration identifier' },
  'BT-62': { de: 'Steuervertreter', en: 'Seller tax representative name' }, 'BT-63': { de: 'USt-IdNr. des Steuervertreters', en: 'Tax representative VAT identifier' },
  'BT-70': { de: 'Name des Waren- oder Leistungsempfängers', en: 'Deliver to party name' }, 'BT-71': { de: 'Kennung des Lieferorts', en: 'Deliver to location identifier' }, 'BT-72': { de: 'Liefer- oder Leistungsdatum', en: 'Actual delivery date' },
  'BT-73': { de: 'Abrechnungszeitraum von', en: 'Invoicing period start date' }, 'BT-74': { de: 'Abrechnungszeitraum bis', en: 'Invoicing period end date' },
  'BT-75': { de: 'Lieferanschrift', en: 'Deliver to address line 1' }, 'BT-77': { de: 'Ort', en: 'Deliver to city' }, 'BT-78': { de: 'Postleitzahl', en: 'Deliver to post code' }, 'BT-80': { de: 'Land', en: 'Deliver to country code' },
  'BT-81': { de: 'Zahlungsart', en: 'Payment means type code' }, 'BT-82': { de: 'Zahlungsart (Text)', en: 'Payment means text' }, 'BT-83': { de: 'Verwendungszweck', en: 'Remittance information' },
  'BT-84': { de: 'IBAN / Kontonummer', en: 'Payment account identifier' }, 'BT-85': { de: 'Kontoinhaber', en: 'Payment account name' }, 'BT-86': { de: 'BIC', en: 'Payment service provider identifier' },
  'BT-87': { de: 'Kartennummer (gekürzt)', en: 'Payment card primary account number' }, 'BT-88': { de: 'Karteninhaber', en: 'Payment card holder name' },
  'BT-89': { de: 'Mandatsreferenz', en: 'Mandate reference identifier' }, 'BT-90': { de: 'Gläubiger-ID', en: 'Bank assigned creditor identifier' }, 'BT-91': { de: 'Belastetes Konto', en: 'Debited account identifier' },
  'BT-106': { de: 'Summe der Positionen (netto)', en: 'Sum of invoice line net amount' }, 'BT-107': { de: 'Summe der Nachlässe', en: 'Sum of allowances on document level' }, 'BT-108': { de: 'Summe der Zuschläge', en: 'Sum of charges on document level' },
  'BT-109': { de: 'Gesamtbetrag ohne Umsatzsteuer', en: 'Invoice total amount without VAT' }, 'BT-110': { de: 'Umsatzsteuer gesamt', en: 'Invoice total VAT amount' }, 'BT-111': { de: 'Umsatzsteuer in Steuerwährung', en: 'Invoice total VAT amount in accounting currency' },
  'BT-112': { de: 'Gesamtbetrag mit Umsatzsteuer', en: 'Invoice total amount with VAT' }, 'BT-113': { de: 'Bereits gezahlt', en: 'Paid amount' }, 'BT-114': { de: 'Rundungsbetrag', en: 'Rounding amount' }, 'BT-115': { de: 'Zahlbetrag', en: 'Amount due for payment' },
  'BT-116': { de: 'Bemessungsgrundlage', en: 'VAT category taxable amount' }, 'BT-117': { de: 'Steuerbetrag', en: 'VAT category tax amount' }, 'BT-118': { de: 'Steuerkategorie', en: 'VAT category code' }, 'BT-119': { de: 'Steuersatz', en: 'VAT category rate' },
  'BT-120': { de: 'Befreiungsgrund', en: 'VAT exemption reason text' }, 'BT-121': { de: 'Code des Befreiungsgrunds', en: 'VAT exemption reason code' },
  'BT-122': { de: 'Kennung des Dokuments', en: 'Supporting document reference' }, 'BT-123': { de: 'Beschreibung', en: 'Supporting document description' }, 'BT-124': { de: 'Externer Link', en: 'External document location' }, 'BT-125': { de: 'Angehängtes Dokument', en: 'Attached document' },
  'BT-126': { de: 'Positionsnummer', en: 'Invoice line identifier' }, 'BT-127': { de: 'Positionsbemerkung', en: 'Invoice line note' }, 'BT-128': { de: 'Objektkennung der Position', en: 'Invoice line object identifier' },
  'BT-129': { de: 'Menge', en: 'Invoiced quantity' }, 'BT-130': { de: 'Einheit', en: 'Invoiced quantity unit of measure code' }, 'BT-131': { de: 'Nettobetrag der Position', en: 'Invoice line net amount' },
  'BT-132': { de: 'Bestellposition', en: 'Referenced purchase order line reference' }, 'BT-133': { de: 'Buchungsreferenz', en: 'Invoice line Buyer accounting reference' },
  'BT-134': { de: 'Zeitraum von', en: 'Invoice line period start date' }, 'BT-135': { de: 'Zeitraum bis', en: 'Invoice line period end date' },
  'BT-146': { de: 'Nettopreis', en: 'Item net price' }, 'BT-147': { de: 'Rabatt auf den Preis', en: 'Item price discount' }, 'BT-148': { de: 'Bruttopreis', en: 'Item gross price' },
  'BT-149': { de: 'Preiseinheit', en: 'Item price base quantity' }, 'BT-150': { de: 'Einheit der Preisbasis', en: 'Item price base quantity unit of measure code' },
  'BT-151': { de: 'Steuerkategorie der Position', en: 'Invoiced item VAT category code' }, 'BT-152': { de: 'Steuersatz der Position', en: 'Invoiced item VAT rate' },
  'BT-153': { de: 'Artikelname', en: 'Item name' }, 'BT-154': { de: 'Artikelbeschreibung', en: 'Item description' }, 'BT-155': { de: 'Artikelnummer des Verkäufers', en: "Item Seller's identifier" },
  'BT-156': { de: 'Artikelnummer des Käufers', en: "Item Buyer's identifier" }, 'BT-157': { de: 'Standardkennung des Artikels', en: 'Item standard identifier' }, 'BT-159': { de: 'Ursprungsland', en: 'Item country of origin' },
};

export const GROUPS = {
  'BG-1': { de: 'Bemerkung zur Rechnung', en: 'Invoice note' }, 'BG-2': { de: 'Prozesssteuerung', en: 'Process control' }, 'BG-3': { de: 'Vorausgegangene Rechnung', en: 'Preceding invoice reference' },
  'BG-4': { de: 'Verkäufer', en: 'Seller' }, 'BG-5': { de: 'Anschrift des Verkäufers', en: 'Seller postal address' }, 'BG-6': { de: 'Kontakt des Verkäufers', en: 'Seller contact' },
  'BG-7': { de: 'Käufer', en: 'Buyer' }, 'BG-8': { de: 'Anschrift des Käufers', en: 'Buyer postal address' }, 'BG-9': { de: 'Kontakt des Käufers', en: 'Buyer contact' },
  'BG-10': { de: 'Zahlungsempfänger', en: 'Payee' }, 'BG-11': { de: 'Steuervertreter', en: 'Seller tax representative party' }, 'BG-13': { de: 'Lieferinformationen', en: 'Delivery information' },
  'BG-14': { de: 'Abrechnungszeitraum', en: 'Invoicing period' }, 'BG-15': { de: 'Lieferanschrift', en: 'Deliver to address' }, 'BG-16': { de: 'Zahlungsanweisungen', en: 'Payment instructions' },
  'BG-17': { de: 'Überweisung', en: 'Credit transfer' }, 'BG-18': { de: 'Kartenzahlung', en: 'Payment card information' }, 'BG-19': { de: 'Lastschrift', en: 'Direct debit' },
  'BG-20': { de: 'Nachlass auf Dokumentebene', en: 'Document level allowances' }, 'BG-21': { de: 'Zuschlag auf Dokumentebene', en: 'Document level charges' }, 'BG-22': { de: 'Gesamtbeträge', en: 'Document totals' },
  'BG-23': { de: 'Umsatzsteueraufschlüsselung', en: 'VAT breakdown' }, 'BG-24': { de: 'Rechnungsbegründende Unterlagen', en: 'Additional supporting documents' }, 'BG-25': { de: 'Rechnungsposition', en: 'Invoice line' },
  'BG-26': { de: 'Abrechnungszeitraum der Position', en: 'Invoice line period' }, 'BG-27': { de: 'Nachlass auf Positionsebene', en: 'Invoice line allowances' }, 'BG-28': { de: 'Zuschlag auf Positionsebene', en: 'Invoice line charges' },
  'BG-29': { de: 'Preis', en: 'Price details' }, 'BG-30': { de: 'Umsatzsteuer der Position', en: 'Line VAT information' }, 'BG-31': { de: 'Artikel', en: 'Item information' },
};

// The terms (BT-n and BG-n) a rule message names, e.g. "(BT-10)" -> ['BT-10'].
export const termsIn = (message) => [...new Set([...String(message).matchAll(/\b(B[TG]-\d+)\b/g)].map((m) => m[1]))];

// ---- the BMF letter of 15 Oct 2025: which kind of error a finding is ----
//
// Rn. 6a: format errors (the file does not follow an allowed syntax or its technical rules): the
// file is then not an E-Rechnung but a "sonstige Rechnung". Rn. 6b: business-rule errors (Geschäfts-
// regelfehler: missing or contradictory information, found as errors in validation). Rn. 35a: a
// business-rule error that concerns a mandatory VAT item of § 14 Abs. 4 / § 14a UStG is a content
// error (Inhaltsfehler); business-rule errors about other content (the letter's example: BT-10)
// do not matter for VAT. This mapping is our reading of the letter, shown with the letter cited.
const VAT_TERMS = new Set(['BT-1', 'BT-2', 'BT-7', 'BT-27', 'BT-31', 'BT-32', 'BT-35', 'BT-37', 'BT-38', 'BT-40', 'BT-44', 'BT-48', 'BT-50', 'BT-52', 'BT-53', 'BT-55', 'BT-63', 'BT-72', 'BT-73', 'BT-74', 'BT-106', 'BT-109', 'BT-110', 'BT-112', 'BT-116', 'BT-117', 'BT-118', 'BT-119', 'BT-120', 'BT-121', 'BT-129', 'BT-131', 'BT-146', 'BT-151', 'BT-152', 'BT-153', 'BG-4', 'BG-5', 'BG-7', 'BG-8', 'BG-23', 'BG-25']);
const FORMAT_PREFIXES = ['UBL-SR', 'UBL-CR', 'UBL-DT', 'CII-SR', 'CII-DT', 'BR-CL', 'BR-DEC'];
export function bmfBucket(finding) {
  if (finding.level !== 'error') return null;
  const id = finding.id ?? '';
  if (id === 'XSD' || id === 'PARSE' || FORMAT_PREFIXES.some((p) => id.startsWith(p))) return 'format';
  if (id === 'BR-DE-21' || id === 'BR-DEX-09' || /^PEPPOL-EN16931-R00[14]$/.test(id)) return 'format';
  const terms = termsIn(finding.message);
  if (/^BR-(CO|S|Z|E|AE|IC|G|O|AF|AG|IG|IP|B)-/.test(id) && !/^BR-CO-(26)$/.test(id)) return 'content';
  if (terms.some((t) => VAT_TERMS.has(t))) return 'content';
  return 'rule';
}

// ---- formatting ----

export function money(value, currency, lang = 'de') {
  if (value === undefined || value === null || value === '') return '';
  const d = Dec.parse(String(value));
  if (!d) return String(value);
  const neg = d.n < 0n;
  const scale = Math.max(2, d.s);
  let digits = (neg ? -d.n : d.n).toString().padStart(d.s + 1, '0');
  digits += '0'.repeat(scale - d.s);
  const int = digits.slice(0, digits.length - scale) || '0';
  const frac = digits.slice(digits.length - scale);
  const sep = lang === 'de' ? '.' : ',';
  const dec = lang === 'de' ? ',' : '.';
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return `${neg ? '-' : ''}${grouped}${dec}${frac}${currency ? ` ${currency}` : ''}`;
}

export function dateText(iso, lang = 'de') {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso ?? '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return lang === 'de' ? `${d}.${m}.${y}` : `${y}-${m}-${d}`;
}

export function percentText(v, lang = 'de') {
  if (v === undefined || v === null || v === '') return '';
  const d = Dec.parse(String(v));
  const s = d ? d.toString() : String(v);
  return `${lang === 'de' ? s.replace('.', ',') : s} %`;
}

// ---- the whole read: bytes (XML or PDF) -> parsed document and what it is ----

// prepared: { kind: 'xml' | 'pdf', xmlBytes, pdf? } from prepare(); inflate is needed only for PDFs.
export function prepare(bytes, inflate, scan) {
  if (!(bytes instanceof Uint8Array)) throw new InvoiceError('invalid_input', 'The file must be bytes.');
  if (bytes.length === 0) throw new InvoiceError('empty', 'The file is empty.');
  if (bytes.length > LIMITS.bytes) throw new InvoiceError('too_large', `The file is larger than ${LIMITS.bytes / 1048576} MB.`);
  if (isPdf(bytes)) {
    if (!inflate) throw new InvoiceError('pdf_unsupported', 'Reading a PDF needs a decompressor.');
    const found = readPdfInvoice(scan ?? scanPdf(bytes), inflate);
    return { kind: 'pdf', xmlBytes: found.bytes, pdf: { attachment: found.name, relationship: found.relationship, embedded: found.embedded, xmp: found.xmp } };
  }
  return { kind: 'xml', xmlBytes: bytes };
}

// inflate: (bytes) -> bytes, or (in the browser) a Map from each needed stream's raw bytes to its
// inflated bytes, made from scan.needs of the scan passed in.
export function readFile(bytes, inflate, scan) {
  const prepared = prepare(bytes, inflate, scan);
  let text;
  try { text = decodeXml(prepared.xmlBytes); } catch { throw new InvoiceError('not_xml', 'The file is not readable text: it is neither XML nor a PDF.'); }
  if (!/^\s*</.test(text)) throw new InvoiceError('not_xml', prepared.kind === 'pdf' ? 'The file embedded in the PDF is not XML.' : 'This file is neither XML nor a PDF. An XRechnung is an .xml file; a ZUGFeRD invoice is a PDF.');
  const doc = parseXml(text);
  const format = detectFormat(doc);
  return { ...prepared, text, doc, format };
}

// What the file is, in one sentence (German and English).
export function describeFormat(format, pdf, lang = 'de') {
  const syn = { 'ubl-invoice': 'UBL Invoice', 'ubl-creditnote': 'UBL CreditNote', cii: 'UN/CEFACT CII', zugferd1: 'ZUGFeRD 1.0' }[format.syntax] ?? format.root;
  const prof = format.profile?.name ?? (lang === 'de' ? 'unbekanntes Profil' : 'unknown profile');
  const where = pdf ? (lang === 'de' ? `, eingebettet in die PDF als ${pdf.attachment}` : `, embedded in the PDF as ${pdf.attachment}`) : '';
  return lang === 'de' ? `${prof} (Syntax ${syn})${where}` : `${prof} (${syn} syntax)${where}`;
}

// Line items as CSV (semicolon-separated for German Excel, or comma), formula-guarded cells.
export function linesCsv(invoice, { lang = 'de' } = {}) {
  const sep = lang === 'de' ? ';' : ',';
  const keys = ['BT-126', 'BT-155', 'BT-153', 'BT-154', 'BT-129', 'BT-130', 'BT-146', 'BT-149', 'BT-131', 'BT-151', 'BT-152'];
  const head = keys.map((k) => `${TERMS[k][lang]} (${k})`);
  const cell = (v) => {
    let s = Array.isArray(v) ? v.join(' ') : String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = `'${s}`;
    if (lang === 'de' && /^-?\d+(\.\d+)?$/.test(s)) s = s.replace('.', ',');
    return s.includes(sep) || /["\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [head.map(cell).join(sep), ...invoice.lines.map((l) => keys.map((k) => cell(l[k])).join(sep))].join('\r\n') + '\r\n';
}

// SHA-256-free short fingerprint is not needed in the browser; the server keys repeats by SHA-256.

export const LABELS = {
  de: {
    invoice: 'Rechnung', creditNote: 'Gutschrift', seller: 'Verkäufer', buyer: 'Käufer', payee: 'Zahlungsempfänger', taxRep: 'Steuervertreter', delivery: 'Lieferung',
    lines: 'Positionen', pos: 'Pos.', item: 'Artikel', qty: 'Menge', unitPrice: 'Einzelpreis', net: 'Netto', vatRate: 'USt.', totals: 'Summen', vat: 'Umsatzsteuer',
    payment: 'Zahlung', notes: 'Bemerkungen', attachments: 'Anhänge', allowance: 'Nachlass', charge: 'Zuschlag', references: 'Referenzen', period: 'Leistungszeitraum',
    valid: 'Gültig', invalid: 'Ungültig', errors: 'Fehler', warnings: 'Warnungen', infos: 'Hinweise', rule: 'Regel', location: 'Stelle', format: 'Format',
    noFindings: 'Keine Regelverstöße gefunden.', reportTitle: 'Prüfbericht', viewNote: 'Lesekopie einer E-Rechnung. Rechtlich maßgeblich ist die XML-Datei.',
    bucket: { format: 'Formatfehler (BMF Rn. 6a)', rule: 'Geschäftsregelfehler (BMF Rn. 6b)', content: 'mögliches Inhaltsfehler-Thema (BMF Rn. 35a)' },
  },
  en: {
    invoice: 'Invoice', creditNote: 'Credit note', seller: 'Seller', buyer: 'Buyer', payee: 'Payee', taxRep: 'Tax representative', delivery: 'Delivery',
    lines: 'Lines', pos: 'No.', item: 'Item', qty: 'Quantity', unitPrice: 'Unit price', net: 'Net', vatRate: 'VAT', totals: 'Totals', vat: 'VAT',
    payment: 'Payment', notes: 'Notes', attachments: 'Attachments', allowance: 'Allowance', charge: 'Charge', references: 'References', period: 'Service period',
    valid: 'Valid', invalid: 'Invalid', errors: 'errors', warnings: 'warnings', infos: 'notices', rule: 'Rule', location: 'Location', format: 'Format',
    noFindings: 'No rule violations found.', reportTitle: 'Validation report', viewNote: 'Reading copy of an e-invoice. The XML file is the legally binding invoice.',
    bucket: { format: 'Format error (BMF letter Rn. 6a)', rule: 'Business-rule error (BMF letter Rn. 6b)', content: 'possible content error (BMF letter Rn. 35a)' },
  },
};

// Common UN/ECE Recommendation 20 unit codes (BT-130, BT-150), named for the view; any other code
// is shown as written.
export const UNITS = {
  H87: { de: 'Stück', en: 'piece' }, C62: { de: 'Stück', en: 'unit' }, XPP: { de: 'Stück', en: 'piece' }, EA: { de: 'Stück', en: 'each' },
  HUR: { de: 'Std.', en: 'h' }, MIN: { de: 'Min.', en: 'min' }, DAY: { de: 'Tag', en: 'day' }, WEE: { de: 'Woche', en: 'week' }, MON: { de: 'Monat', en: 'month' }, ANN: { de: 'Jahr', en: 'year' },
  KGM: { de: 'kg', en: 'kg' }, GRM: { de: 'g', en: 'g' }, TNE: { de: 't', en: 't' }, LTR: { de: 'l', en: 'l' }, MTR: { de: 'm', en: 'm' }, KMT: { de: 'km', en: 'km' },
  MTK: { de: 'm²', en: 'm²' }, MTQ: { de: 'm³', en: 'm³' }, LS: { de: 'pauschal', en: 'lump sum' }, SET: { de: 'Satz', en: 'set' }, PR: { de: 'Paar', en: 'pair' }, KWH: { de: 'kWh', en: 'kWh' },
};

// ---- the made-up samples (shown on the page, used by the examples and the rule pages) ----

// An XRechnung 3.0 in UBL and a ZUGFeRD EN 16931 invoice in CII. Every firm, name and number is
// made up; both pass every rule of the KoSIT configuration (the tests check it).
export const SAMPLES = {
  ubl: `<?xml version="1.0" encoding="UTF-8"?>
<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
             xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
             xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</cbc:CustomizationID>
    <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
    <cbc:ID>RE-2026-0417</cbc:ID>
    <cbc:IssueDate>2026-11-02</cbc:IssueDate>
    <cbc:DueDate>2026-12-02</cbc:DueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:Note>Musterrechnung für die Endwise-Seiten. Alle Firmen, Namen und Nummern sind erfunden.</cbc:Note>
    <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
    <cbc:BuyerReference>04011000-12345-03</cbc:BuyerReference>
    <cac:OrderReference>
        <cbc:ID>4500012345</cbc:ID>
    </cac:OrderReference>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cbc:EndpointID schemeID="EM">rechnung@muster-elektro.example</cbc:EndpointID>
            <cac:PartyName>
                <cbc:Name>Muster Elektro</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>Hauptstraße 12</cbc:StreetName>
                <cbc:CityName>Stuttgart</cbc:CityName>
                <cbc:PostalZone>70173</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>DE</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>DE123456789</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>Muster Elektro GmbH</cbc:RegistrationName>
                <cbc:CompanyID>HRB 700001</cbc:CompanyID>
                <cbc:CompanyLegalForm>Amtsgericht Stuttgart, Geschäftsführerin Anna Beispiel</cbc:CompanyLegalForm>
            </cac:PartyLegalEntity>
            <cac:Contact>
                <cbc:Name>Anna Beispiel</cbc:Name>
                <cbc:Telephone>+49 711 123456</cbc:Telephone>
                <cbc:ElectronicMail>rechnung@muster-elektro.example</cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cbc:EndpointID schemeID="EM">eingangsrechnung@musterstadt.example</cbc:EndpointID>
            <cac:PostalAddress>
                <cbc:StreetName>Rathausplatz 1</cbc:StreetName>
                <cbc:CityName>Musterstadt</cbc:CityName>
                <cbc:PostalZone>12345</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>DE</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>Stadt Musterstadt, Hochbauamt</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>
    <cac:Delivery>
        <cbc:ActualDeliveryDate>2026-10-28</cbc:ActualDeliveryDate>
    </cac:Delivery>
    <cac:PaymentMeans>
        <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
        <cbc:PaymentID>RE-2026-0417</cbc:PaymentID>
        <cac:PayeeFinancialAccount>
            <cbc:ID>DE79000000001234567890</cbc:ID>
            <cbc:Name>Muster Elektro GmbH</cbc:Name>
        </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>
    <cac:PaymentTerms>
        <cbc:Note>Zahlbar bis 02.12.2026 ohne Abzug.</cbc:Note>
    </cac:PaymentTerms>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="EUR">113.48</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="EUR">582.60</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="EUR">110.69</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>19</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="EUR">39.90</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="EUR">2.79</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>7</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="EUR">622.50</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="EUR">622.50</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="EUR">735.98</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="EUR">735.98</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    <cac:InvoiceLine>
        <cbc:ID>1</cbc:ID>
        <cbc:InvoicedQuantity unitCode="HUR">6</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="EUR">411.00</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Description>Unterverteilung im Erdgeschoss erneuert, Montage und Prüfung</cbc:Description>
            <cbc:Name>Elektroinstallation, Arbeitsstunden</cbc:Name>
            <cac:SellersItemIdentification>
                <cbc:ID>L-100</cbc:ID>
            </cac:SellersItemIdentification>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>19</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="EUR">68.50</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
    <cac:InvoiceLine>
        <cbc:ID>2</cbc:ID>
        <cbc:InvoicedQuantity unitCode="H87">4</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="EUR">171.60</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>Fehlerstromschutzschalter 40 A</cbc:Name>
            <cac:SellersItemIdentification>
                <cbc:ID>FI-40</cbc:ID>
            </cac:SellersItemIdentification>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>19</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="EUR">42.90</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
    <cac:InvoiceLine>
        <cbc:ID>3</cbc:ID>
        <cbc:InvoicedQuantity unitCode="H87">1</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="EUR">39.90</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>Fachbuch Elektroinstallation</cbc:Name>
            <cac:SellersItemIdentification>
                <cbc:ID>B-7</cbc:ID>
            </cac:SellersItemIdentification>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>7</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="EUR">39.90</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
</ubl:Invoice>
`,
  cii: `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
    xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
    xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
    xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>RE-2026-0418</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">20261103</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:IncludedNote>
      <ram:Content>Musterrechnung für die Endwise-Seiten. Alle Firmen, Namen und Nummern sind erfunden.</ram:Content>
    </ram:IncludedNote>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>1</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:SellerAssignedID>WS-12</ram:SellerAssignedID>
        <ram:Name>Wartung Lüftungsanlage, Pauschale</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>240.00</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">1</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>S</ram:CategoryCode>
          <ram:RateApplicablePercent>19</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>240.00</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>2</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:SellerAssignedID>F-G4</ram:SellerAssignedID>
        <ram:Name>Luftfilter G4</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>18.45</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="H87">8</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>S</ram:CategoryCode>
          <ram:RateApplicablePercent>19</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>147.60</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:BuyerReference>Kostenstelle 4711</ram:BuyerReference>
      <ram:SellerTradeParty>
        <ram:Name>Muster Haustechnik GmbH</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID>HRB 800002</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:DefinedTradeContact>
          <ram:PersonName>Jonas Probe</ram:PersonName>
          <ram:TelephoneUniversalCommunication>
            <ram:CompleteNumber>+49 89 765432</ram:CompleteNumber>
          </ram:TelephoneUniversalCommunication>
          <ram:EmailURIUniversalCommunication>
            <ram:URIID>buchhaltung@muster-haustechnik.example</ram:URIID>
          </ram:EmailURIUniversalCommunication>
        </ram:DefinedTradeContact>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>80331</ram:PostcodeCode>
          <ram:LineOne>Marktstraße 5</ram:LineOne>
          <ram:CityName>München</ram:CityName>
          <ram:CountryID>DE</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="EM">buchhaltung@muster-haustechnik.example</ram:URIID>
        </ram:URIUniversalCommunication>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">DE987654321</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>Beispiel Bürogebäude KG</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>10115</ram:PostcodeCode>
          <ram:LineOne>Musterweg 3</ram:LineOne>
          <ram:CityName>Berlin</ram:CityName>
          <ram:CountryID>DE</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="EM">rechnungseingang@beispiel-buero.example</ram:URIID>
        </ram:URIUniversalCommunication>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">20261030</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:PaymentReference>RE-2026-0418</ram:PaymentReference>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>58</ram:TypeCode>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>DE79000000001234567890</ram:IBANID>
          <ram:AccountName>Muster Haustechnik GmbH</ram:AccountName>
        </ram:PayeePartyCreditorFinancialAccount>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>73.64</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>387.60</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>19</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradePaymentTerms>
        <ram:Description>Zahlbar innerhalb von 14 Tagen ohne Abzug.</ram:Description>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">20261117</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>387.60</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>387.60</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">73.64</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>461.24</ram:GrandTotalAmount>
        <ram:DuePayableAmount>461.24</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`,
};

// The sample as a ZUGFeRD-style PDF, built here so the page can offer it without a download: one
// page of text and the XML embedded uncompressed as factur-x.xml with its file specification.
export function samplePdf(xml, lines) {
  const enc = new TextEncoder();
  const xmlBytes = enc.encode(xml);
  const esc = (t) => t.replace(/[\\()]/g, (c) => `\\${c}`).replace(/[^\x20-\x7e]/g, (c) => { const code = c.charCodeAt(0); return code <= 0xff ? `\\${code.toString(8).padStart(3, '0')}` : '?'; });
  const content = lines.map((l, i) => `BT /F1 ${i === 0 ? 16 : 10} Tf 42 ${790 - i * 18} Td (${esc(l)}) Tj ET`).join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R /Names << /EmbeddedFiles << /Names [(factur-x.xml) 7 0 R] >> >> /AF [7 0 R] >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    { dict: `<< /Length ${content.length} >>`, data: enc.encode(content) },
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    { dict: `<< /Type /EmbeddedFile /Subtype /text#2Fxml /Length ${xmlBytes.length} /Params << /Size ${xmlBytes.length} >> >>`, data: xmlBytes },
    '<< /Type /Filespec /F (factur-x.xml) /UF (factur-x.xml) /AFRelationship /Alternative /EF << /F 6 0 R /UF 6 0 R >> >>',
  ];
  const parts = [enc.encode('%PDF-1.7\n')];
  let offset = parts[0].length;
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(offset);
    const chunk = typeof o === 'string' ? [enc.encode(`${i + 1} 0 obj\n${o}\nendobj\n`)] : [enc.encode(`${i + 1} 0 obj\n${o.dict}\nstream\n`), o.data, enc.encode('\nendstream\nendobj\n')];
    for (const c of chunk) { parts.push(c); offset += c.length; }
  });
  parts.push(enc.encode(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

export const SAMPLE_PDF_LINES = ['Rechnung RE-2026-0418', 'Muster Haustechnik GmbH, Marktstraße 5, 80331 München', 'An: Beispiel Bürogebäude KG, Musterweg 3, 10115 Berlin', 'Wartung Lüftungsanlage 240,00 EUR; 8 Luftfilter G4 je 18,45 EUR', 'Netto 387,60 EUR, USt. 19 % 73,64 EUR, Gesamt 461,24 EUR', 'Musterrechnung; alle Angaben sind erfunden.'];

// The made-up XRechnung with two mistakes: no Leitweg-ID (BR-DE-15) and a line total 0.10 short.
export const FAILING_SAMPLE = SAMPLES.ubl
  .replace('<cbc:BuyerReference>04011000-12345-03</cbc:BuyerReference>', '')
  .replace('<cbc:LineExtensionAmount currencyID="EUR">622.50</cbc:LineExtensionAmount>', '<cbc:LineExtensionAmount currencyID="EUR">622.40</cbc:LineExtensionAmount>');
