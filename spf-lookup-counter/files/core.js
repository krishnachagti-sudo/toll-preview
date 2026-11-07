// SPF lookup counter: an RFC 7208 evaluator that counts. Pure and dependency-free, so the page and
// the server load the same file. DNS comes in through `resolve(name, type)`, which the server wires
// to public resolvers (resolver.js) and the tests to a fake zone; nothing here touches the network.
//
// Two walks over the same cached answers:
//  - the audit (worst case): every term of every record, left to right and depth first, the way a
//    receiver would reach them if nothing matched earlier. It numbers each DNS-querying term, names
//    the 11th, counts void lookups, and keeps going (up to a cap) so the full overage is visible.
//  - check_host() for one sending IP (Section 4): the real evaluation, which stops at the first
//    match. It gives the result a receiver would reach for that IP and the lookups it used getting there.
//
// Section numbers in messages are RFC 7208's (https://www.rfc-editor.org/rfc/rfc7208).

export const RFC = 'https://www.rfc-editor.org/rfc/rfc7208';
export const LIMITS = Object.freeze({ lookups: 10, voids: 2, mxNames: 10, ptrNames: 10, sizeGuide: 450, udp: 512 });
// Our own caps, so one call cannot become a DNS flood: counted terms walked in the audit, queries
// per call (both walks share a cache), and the elapsed time (the RFC asks receivers to allow 20 s).
export const CAPS = Object.freeze({ terms: 40, queries: 200, ms: 20_000, txtChars: 4096, answers: 64 });

export class SpfError extends Error {
  constructor(message, field) { super(message); this.name = 'SpfError'; this.field = field; }
}

const COUNTED = new Set(['include', 'a', 'mx', 'ptr', 'exists']);
const MECHANISMS = new Set(['all', 'include', 'a', 'mx', 'ptr', 'ip4', 'ip6', 'exists']);
const QUALIFIERS = { '+': 'pass', '-': 'fail', '~': 'softfail', '?': 'neutral' };

// ---------- names ----------

// Names this tool will never send to DNS: special-use and private-network suffixes (RFC 6761, RFC
// 8375, ICANN's .internal) and the reverse trees, which only the ptr machinery queries itself.
const BLOCKED_SUFFIXES = ['localhost', 'local', 'internal', 'intranet', 'lan', 'home', 'corp', 'private', 'invalid', 'test', 'onion', 'alt', 'arpa', 'localdomain'];
const LABEL_RE = /^[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?$/;
const TLD_RE = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

export function normalizeName(name) {
  return String(name ?? '').trim().toLowerCase().replace(/\.$/, '');
}

// null when the name may be queried, else why not.
export function nameProblem(raw) {
  const name = normalizeName(raw);
  if (!name) return 'is empty';
  if (/[^\x21-\x7e]/.test(name)) return 'has characters DNS names cannot hold (write an internationalized name as its xn-- form)';
  if (name.length > 253) return 'is longer than 253 characters';
  const labels = name.split('.');
  if (labels.length < 2) return 'is not a multi-label domain name (Section 4.3)';
  if (labels.some((l) => !l.length)) return 'has an empty label';
  if (labels.some((l) => l.length > 63)) return 'has a label longer than 63 characters';
  if (labels.some((l) => !LABEL_RE.test(l))) return 'has a label with characters other than letters, digits, hyphens and underscores';
  const tld = labels.at(-1);
  if (!TLD_RE.test(tld)) return 'does not end in a top-level domain';
  if (BLOCKED_SUFFIXES.includes(tld) || name.endsWith('.home.arpa')) return 'is a private or special-use name this tool does not query';
  return null;
}

// ---------- IP addresses ----------

const QNUM = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4_RE = new RegExp(`^${QNUM}\\.${QNUM}\\.${QNUM}\\.${QNUM}$`);

function parse4(s) {
  const m = IPV4_RE.exec(s);
  if (!m) return null;
  return m.slice(1).reduce((n, x) => (n << 8n) + BigInt(x), 0n);
}

function parse6(s) {
  if (!/^[0-9a-f:.]+$/i.test(s) || s.length > 45) return null;
  let tail = [];
  let head = s;
  const v4 = /(?:^|:)(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4) {
    const n = parse4(v4[1]);
    if (n === null) return null;
    tail = [Number(n >> 16n), Number(n & 0xffffn)];
    head = s.slice(0, s.length - v4[1].length);
    if (head.endsWith(':') && !head.endsWith('::')) head = head.slice(0, -1);
  }
  const parts = head.split('::');
  if (parts.length > 2) return null;
  const groups = (p) => (p === '' ? [] : p.split(':'));
  const left = groups(parts[0]);
  const right = parts.length === 2 ? groups(parts[1]) : [];
  if ([...left, ...right].some((g) => !/^[0-9a-f]{1,4}$/i.test(g))) return null;
  const known = left.length + right.length + tail.length;
  if (parts.length === 1 && known !== 8) return null;
  if (parts.length === 2 && known > 7) return null;
  const all = [...left.map((g) => parseInt(g, 16)), ...Array(8 - known).fill(0), ...right.map((g) => parseInt(g, 16)), ...tail];
  return all.reduce((n, g) => (n << 16n) + BigInt(g), 0n);
}

const hex4 = (n, width) => n.toString(16).padStart(width, '0');

// { v: 4|6, n: BigInt, text } for an address, or null. An IPv4-mapped IPv6 address is the IPv4
// address it carries (Section 5).
export function parseIp(raw) {
  const s = String(raw ?? '').trim();
  const n4 = parse4(s);
  if (n4 !== null) return { v: 4, n: n4, text: s };
  const n6 = parse6(s);
  if (n6 === null) return null;
  if (n6 >> 32n === 0xffffn) {
    const n = n6 & 0xffffffffn;
    return { v: 4, n, text: [24n, 16n, 8n, 0n].map((b) => String((n >> b) & 255n)).join('.') };
  }
  const groups = [];
  for (let i = 7; i >= 0; i--) groups.push(((n6 >> BigInt(i * 16)) & 0xffffn).toString(16));
  return { v: 6, n: n6, text: compress6(groups) };
}

function compress6(groups) {
  let best = [-1, 0];
  for (let i = 0; i < 8;) {
    if (groups[i] !== '0') { i++; continue; }
    let j = i;
    while (j < 8 && groups[j] === '0') j++;
    if (j - i > best[1] && j - i > 1) best = [i, j - i];
    i = j;
  }
  if (best[0] < 0) return groups.join(':');
  return `${groups.slice(0, best[0]).join(':')}::${groups.slice(best[0] + best[1]).join(':')}`;
}

// The %{i} form: dotted quad, or 32 dot-separated nibbles for IPv6 (Section 7.3).
export function ipDotted(ip) {
  if (ip.v === 4) return ip.text;
  return hex4(ip.n, 32).split('').join('.');
}

export function reverseName(ip) {
  return ip.v === 4
    ? `${ip.text.split('.').reverse().join('.')}.in-addr.arpa`
    : `${hex4(ip.n, 32).split('').reverse().join('.')}.ip6.arpa`;
}

const inNet = (ip, net, prefix) => {
  const bits = ip.v === 4 ? 32 : 128;
  if (prefix === 0) return true;
  const shift = BigInt(bits - prefix);
  return (ip.n >> shift) === (net >> shift);
};

// Addresses that are never a mail sender on the internet: SPF is checked against the public
// address a message came from, and these would only send reverse lookups into private space.
const PRIVATE_V4 = [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16], ['224.0.0.0', 4], ['240.0.0.0', 4]];
const PRIVATE_V6 = [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]];

export function isPrivateIp(ip) {
  const list = ip.v === 4 ? PRIVATE_V4 : PRIVATE_V6;
  return list.some(([net, p]) => inNet(ip, parseIp(net).n, p));
}

// ---------- macros (Section 7) ----------

const MACRO_LETTERS = new Set(['s', 'l', 'o', 'd', 'i', 'p', 'h', 'v']);
const EXP_LETTERS = new Set(['c', 'r', 't']);
const DELIMS = new Set(['.', '-', '+', ',', '/', '_', '=']);
const TOPLABEL_RE = /^(?:[a-z0-9]*[a-z][a-z0-9]*|[a-z0-9]+-[a-z0-9-]*[a-z0-9])$/i;

// Splits a macro-string into literal and macro pieces, or throws SpfError on a syntax error.
export function tokenizeMacro(str, { exp = false } = {}) {
  const out = [];
  let lit = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch !== '%') {
      const code = ch.charCodeAt(0);
      if (!exp && (code < 0x21 || code > 0x7e)) throw new SpfError(`"${str}" has a character that is not allowed in a macro-string (Section 7.1).`);
      lit += ch;
      continue;
    }
    const next = str[i + 1];
    if (next === '%') { lit += '%'; i++; continue; }
    if (next === '_') { lit += ' '; i++; continue; }
    if (next === '-') { lit += '%20'; i++; continue; }
    if (next !== '{') throw new SpfError(`"${str}" has a "%" not followed by "{", "%", "_" or "-" (Section 7.3).`);
    const end = str.indexOf('}', i + 2);
    if (end < 0) throw new SpfError(`"${str}" has a macro with no closing "}" (Section 7.1).`);
    const body = str.slice(i + 2, end);
    const m = /^([a-z])(\d*)(r?)(.*)$/i.exec(body);
    if (!m) throw new SpfError(`"%{${body}}" is not a valid macro (Section 7.1).`);
    const letter = m[1].toLowerCase();
    if (!MACRO_LETTERS.has(letter) && !(exp && EXP_LETTERS.has(letter))) {
      throw new SpfError(EXP_LETTERS.has(letter)
        ? `"%{${body}}": the ${letter} macro is allowed only in exp text (Section 7.2).`
        : `"%{${body}}" uses an unknown macro letter "${m[1]}" (Section 7.2).`);
    }
    if (m[2] !== '' && Number(m[2]) === 0) throw new SpfError(`"%{${body}}": the digit transformer must not be zero (Section 7.3).`);
    if ([...m[4]].some((c) => !DELIMS.has(c))) throw new SpfError(`"%{${body}}" has a delimiter that is not one of . - + , / _ = (Section 7.1).`);
    if (lit) { out.push({ literal: lit }); lit = ''; }
    out.push({ letter, upper: m[1] !== letter, digits: m[2] === '' ? null : Number(m[2]), reverse: m[3] !== '', delims: m[4] || '.', raw: `%{${body}}` });
    i = end;
  }
  if (lit) out.push({ literal: lit });
  return out;
}

export const usesMacros = (str) => /%\{/.test(str);

const urlEscape = (s) => s.replace(/[^A-Za-z0-9\-._~]/g, (c) => [...new TextEncoder().encode(c)].map((b) => `%${b.toString(16).toUpperCase().padStart(2, '0')}`).join(''));

// One macro letter's value after transformers. `vals` holds the raw values by letter.
function applyMacro(tok, value) {
  const parts = value.split(new RegExp(`[${[...tok.delims].map((c) => `\\${c}`).join('')}]`));
  let list = tok.reverse ? parts.reverse() : parts;
  if (tok.digits !== null && tok.digits < list.length) list = list.slice(list.length - tok.digits);
  const joined = list.join('.');
  return tok.upper ? urlEscape(joined) : joined;
}

// The letters a macro-string needs, so the caller can tell whether the values are known.
export const macroLetters = (str, opts) => [...new Set(tokenizeMacro(str, opts).filter((t) => t.letter).map((t) => t.letter))];

// Expands a macro-string with known values: { s, l, o, d, i, p, h, v, c, r, t }. Returns
// { value, steps } where steps explain each macro. A missing value throws SpfError naming it.
export function expandMacro(str, vals, { exp = false, domain = true } = {}) {
  const steps = [];
  let value = '';
  for (const tok of tokenizeMacro(str, { exp })) {
    if (tok.literal !== undefined) { value += tok.literal; continue; }
    const raw = vals[tok.letter];
    if (raw === undefined || raw === null) throw new SpfError(`${tok.raw} needs ${MACRO_NEEDS[tok.letter]}.`, tok.letter);
    const out = applyMacro(tok, String(raw));
    steps.push({ macro: tok.raw, meaning: MACRO_MEANING[tok.letter], from: String(raw), becomes: out });
    value += out;
  }
  if (domain) {
    // Section 7.3: a name over 253 characters loses labels from the left until it fits.
    let name = value.replace(/\.$/, '');
    while (name.length > 253 && name.includes('.')) name = name.slice(name.indexOf('.') + 1);
    if (name !== value.replace(/\.$/, '')) steps.push({ macro: '(length)', meaning: 'names over 253 characters lose labels from the left (Section 7.3)', from: value, becomes: name });
    value = name;
  }
  return { value, steps };
}

export const MACRO_MEANING = {
  s: 'the sender (MAIL FROM address)', l: 'the local part of the sender', o: 'the domain of the sender',
  d: 'the domain whose record is being checked', i: 'the sending IP address', p: 'the validated host name of the sending IP (do not use)',
  h: 'the HELO/EHLO name', v: '"in-addr" for IPv4 or "ip6" for IPv6', c: 'the sending IP, readable', r: 'the checking host', t: 'the time, in seconds since 1970',
};
const MACRO_NEEDS = {
  s: 'a sender address', l: 'a sender address', o: 'a sender address', d: 'a domain', i: 'a sending IP address', p: 'a sending IP address',
  h: 'a HELO name', v: 'a sending IP address', c: 'a sending IP address', r: 'the checking host name', t: 'a time',
};

// The values every macro letter takes for one evaluation (Section 4.1, 4.3, 7.2).
export function macroValues({ domain, ip, sender, helo, validated }) {
  const vals = { d: domain };
  if (sender) {
    const at = sender.lastIndexOf('@');
    const local = at > 0 ? sender.slice(0, at) : 'postmaster';
    const dom = at >= 0 ? sender.slice(at + 1) : sender;
    vals.s = `${local}@${dom}`; vals.l = local; vals.o = dom;
  }
  if (ip) {
    vals.i = ipDotted(ip); vals.c = ip.text; vals.v = ip.v === 4 ? 'in-addr' : 'ip6';
    vals.p = validated ?? undefined;
  }
  if (helo) vals.h = helo;
  return vals;
}

// ---------- the record (Sections 4.5, 4.6, 5, 6) ----------

function domainSpecProblem(spec) {
  if (!spec) return 'is empty';
  try { tokenizeMacro(spec); } catch (e) { return e.message; }
  // domain-end: a macro, or "." and a top label (Section 7.1).
  if (/\}\.?$/.test(spec)) return null;
  const s = spec.replace(/\.$/, '');
  const dot = s.lastIndexOf('.');
  if (dot < 0) return `"${spec}" is not a fully qualified name (Section 7.1)`;
  if (!TOPLABEL_RE.test(s.slice(dot + 1))) return `"${spec}" does not end in a valid top label (Section 7.1)`;
  return null;
}

const CIDR_RE = /(?:\/(0|[1-9]\d?))?(?:\/\/(0|[1-9]\d{0,2}))?$/;

// Parses one record. { terms, errors } where errors are syntax problems (each a permerror, Section 4.6).
export function parseRecord(text) {
  const errors = [];
  const terms = [];
  const tokens = String(text).split(/ +/).filter((x) => x !== '');
  if (!tokens.length || tokens[0].toLowerCase() !== 'v=spf1') {
    return { terms, errors: [{ term: tokens[0] ?? '', message: 'The record does not start with "v=spf1" (Section 4.5).' }] };
  }
  const seenMod = {};
  for (const raw of tokens.slice(1)) {
    const firstSep = raw.search(/[=:/]/);
    if (firstSep > 0 && raw[firstSep] === '=') {
      const name = raw.slice(0, firstSep).toLowerCase();
      const value = raw.slice(firstSep + 1);
      if (!/^[a-z][a-z0-9_.-]*$/.test(name)) { errors.push({ term: raw, message: `"${raw}" is not a valid modifier name (Section 4.6.1).` }); continue; }
      const term = { raw, kind: 'modifier', name, value };
      if (name === 'redirect' || name === 'exp') {
        if (seenMod[name]) errors.push({ term: raw, message: `The ${name} modifier appears more than once (Section 6).` });
        seenMod[name] = true;
        const p = domainSpecProblem(value);
        if (p) errors.push({ term: raw, message: `${name}= ${p.startsWith('"') ? p : `domain-spec ${p}`}` });
      } else {
        try { tokenizeMacro(value); } catch (e) { errors.push({ term: raw, message: e.message }); }
        term.unknown = true;
      }
      terms.push(term);
      continue;
    }
    const m = /^([+\-~?]?)([a-z][a-z0-9]*)(.*)$/i.exec(raw);
    if (!m || !MECHANISMS.has(m[2].toLowerCase())) { errors.push({ term: raw, message: `"${raw}" is not a known mechanism or modifier (Section 4.6.1).` }); continue; }
    const name = m[2].toLowerCase();
    const term = { raw, kind: 'mechanism', name, qualifier: m[1] || '+', result: QUALIFIERS[m[1] || '+'] };
    let rest = m[3];
    if (name === 'all') {
      if (rest !== '') errors.push({ term: raw, message: `"all" takes no argument (Section 5.1).` });
    } else if (name === 'ip4' || name === 'ip6') {
      const mm = /^:([^/]+)(?:\/(\d+))?$/.exec(rest);
      const ip = mm && parseIp(mm[1]);
      const max = name === 'ip4' ? 32 : 128;
      const prefix = mm && mm[2] !== undefined ? Number(mm[2]) : max;
      const v = name === 'ip4' ? 4 : 6;
      const okIp = ip && (v === 4 ? IPV4_RE.test(mm[1]) : (!IPV4_RE.test(mm[1]) && parse6(mm[1]) !== null));
      if (!okIp || prefix > max || (mm[2] && /^0\d/.test(mm[2]))) errors.push({ term: raw, message: `"${raw}" is not a valid ${name} network (Section 5.6).` });
      else { term.net = v === 6 ? parse6(mm[1]) : ip.n; term.v = v; term.prefix = prefix; }
    } else {
      // a, mx, ptr, include, exists: [":" domain-spec] and, for a and mx, a dual-cidr-length.
      if (name === 'a' || name === 'mx') {
        const c = CIDR_RE.exec(rest);
        if (c && c[0]) {
          term.cidr4 = c[1] !== undefined ? Number(c[1]) : 32;
          term.cidr6 = c[2] !== undefined ? Number(c[2]) : 128;
          if (term.cidr4 > 32 || term.cidr6 > 128) errors.push({ term: raw, message: `"${raw}" has a CIDR length out of range (Section 5.6).` });
          rest = rest.slice(0, rest.length - c[0].length);
        }
      }
      if (rest.startsWith(':')) {
        term.spec = rest.slice(1);
        const p = domainSpecProblem(term.spec);
        if (p) errors.push({ term: raw, message: `${name}: ${p.startsWith('"') ? p : `domain-spec ${p}`}` });
      } else if (rest !== '') {
        errors.push({ term: raw, message: `"${raw}" is not valid ${name} syntax (Section 5).` });
      } else if (name === 'include' || name === 'exists') {
        errors.push({ term: raw, message: `"${raw}" needs a domain after "${name}:" (Section 5.${name === 'include' ? 2 : 7}).` });
      }
    }
    terms.push(term);
  }
  return { terms, errors };
}

// The v=spf1 records among a name's TXT strings (Section 4.5).
export function spfRecords(txts) {
  return txts.filter((t) => /^v=spf1(?: |$)/i.test(t));
}

// The approximate size of the TXT answer: the name plus every string (Section 3.4's guide).
export const answerSize = (name, txtStrings) => name.length + txtStrings.reduce((n, s) => n + s.length, 0);

// ---------- DNS through the injected resolver ----------

// resolve(name, type) -> Promise<{ status: 'ok' | 'nxdomain' | 'nodata' | 'error', answers, error? }>
// TXT answers are arrays of strings (one per record, the record's strings), A/AAAA/PTR strings,
// MX { exchange, priority }. The wrapper caches, counts, applies the caps and refuses unsafe names.
export function makeDns(resolve, { now = () => Date.now(), caps = CAPS } = {}) {
  const cache = new Map();
  const started = now();
  const log = [];
  const dns = {
    queries: 0,
    log,
    async q(name, type, { reverse = false } = {}) {
      const n = normalizeName(name);
      const key = `${type} ${n}`;
      if (cache.has(key)) return cache.get(key);
      if (!reverse) {
        const why = nameProblem(n);
        if (why) { const r = { status: 'refused', answers: [], error: `${n} ${why}` }; cache.set(key, r); return r; }
      }
      if (dns.queries >= caps.queries) return { status: 'error', answers: [], error: `this check stopped after ${caps.queries} DNS queries`, cap: true };
      if (now() - started > caps.ms) return { status: 'error', answers: [], error: `this check stopped after ${caps.ms / 1000} seconds`, cap: true };
      dns.queries++;
      let r;
      try {
        r = await resolve(n, type);
      } catch (e) {
        r = { status: 'error', answers: [], error: e?.message ?? 'no answer' };
      }
      r = clean(r, type, caps);
      log.push({ name: n, type, status: r.status, answers: r.answers.length });
      cache.set(key, r);
      return r;
    },
  };
  return dns;
}

function clean(r, type, caps) {
  const status = ['ok', 'nxdomain', 'nodata', 'error'].includes(r?.status) ? r.status : 'error';
  let answers = Array.isArray(r?.answers) ? r.answers : [];
  const total = answers.length;
  if (type === 'TXT') {
    answers = answers.map((x) => (Array.isArray(x) ? x.map(String).join('') : String(x))).filter((t) => t.length <= caps.txtChars);
  } else if (type === 'MX') {
    answers = answers.filter((x) => x && typeof x.exchange === 'string').map((x) => ({ exchange: normalizeName(x.exchange), priority: Number(x.priority) || 0 }));
  } else {
    answers = answers.map(String);
  }
  const out = { status: status === 'ok' && !answers.length && total === 0 ? 'nodata' : status, answers: answers.slice(0, caps.answers), total };
  if (r?.error) out.error = String(r.error);
  return out;
}

const isVoid = (r) => r.status === 'nxdomain' || r.status === 'nodata';

// ---------- the audit: every term, worst case ----------

function targetOf(term, domain, vals) {
  const spec = term.spec ?? term.value;
  if (spec === undefined) return { name: domain };
  const letters = macroLetters(spec);
  const missing = letters.filter((l) => vals[l] === undefined || vals[l] === null);
  if (missing.length) return { pending: missing, macro: true, needs: [...new Set(missing.map((l) => MACRO_NEEDS[l]))] };
  try {
    const { value, steps } = expandMacro(spec, vals);
    return { name: normalizeName(value), macro: letters.length > 0, steps };
  } catch (e) {
    return { error: e.message };
  }
}

function issue(list, code, message, at, extra = {}) {
  list.push({ code, message, at, ...extra });
}

async function auditRecord(ctx, domain, given, via, ancestors) {
  const node = { domain, via, record: null, terms: [], cost: 0 };
  let text = given;
  if (text === undefined) {
    const r = await ctx.dns.q(domain, 'TXT');
    if (r.status === 'refused') { node.status = 'refused'; node.note = r.error; issue(ctx.errors, 'refused-name', `${r.error}; it was not queried.`, domain); return node; }
    if (r.status === 'error') {
      node.status = 'temperror'; node.note = r.error;
      issue(ctx.temp, r.cap ? 'cap' : 'dns-error', `The TXT lookup for ${domain} failed (${r.error}): a receiver would return temperror (Section 4.4).`, domain);
      return node;
    }
    const recs = spfRecords(r.answers);
    node.size = answerSize(domain, r.answers);
    if (!recs.length) {
      node.status = 'none';
      node.note = r.status === 'nxdomain' ? 'the name does not exist' : 'no v=spf1 record';
      if (via !== 'top') issue(ctx.errors, via === 'include' ? 'include-none' : 'redirect-none', `${domain} has no SPF record (${node.note}): the ${via} returns permerror (Section ${via === 'include' ? '5.2' : '6.1'}).`, domain);
      return node;
    }
    if (recs.length > 1) {
      node.status = 'multiple'; node.records = recs;
      issue(ctx.errors, 'multiple-records', `${domain} publishes ${recs.length} v=spf1 records: check_host() returns permerror (Section 4.5).`, domain);
      return node;
    }
    text = recs[0];
    if (node.size > LIMITS.sizeGuide) issue(ctx.warnings, 'size', `The TXT records at ${domain} come to about ${node.size} octets, over RFC 7208's 450-octet guide; an answer over 512 octets needs EDNS0 or TCP, which some receivers cannot use (Section 3.4).`, domain);
  }
  node.record = text;
  const parsed = parseRecord(text);
  if (parsed.errors.length) {
    node.status = 'syntax';
    for (const e of parsed.errors) issue(ctx.errors, 'syntax', `${domain}: ${e.message} Any syntax error makes the whole record permerror (Section 4.6).`, domain, { term: e.term });
    node.terms = parsed.terms.map((t) => ({ term: t.raw, type: t.name, counted: false, status: 'not-evaluated' }));
    return node;
  }
  node.status = 'ok';
  const vals = macroValues({ domain, ip: ctx.ip, sender: ctx.sender ?? `postmaster@${domain}`, helo: ctx.helo, validated: ctx.validated });
  const hasAll = parsed.terms.some((t) => t.name === 'all' && t.kind === 'mechanism');
  let afterAll = false;
  const mods = [];
  for (const t of parsed.terms) {
    if (t.kind === 'modifier') { mods.push(t); continue; }
    const entry = { term: t.raw, type: t.name, counted: COUNTED.has(t.name), cost: 0 };
    node.terms.push(entry);
    if (afterAll) { entry.counted = false; entry.status = 'ignored'; entry.note = 'after "all": never evaluated (Section 5.1)'; issue(ctx.warnings, 'after-all', `${domain}: "${t.raw}" comes after "all" and is ignored (Section 5.1).`, domain); continue; }
    if (t.name === 'all') {
      afterAll = true; entry.status = 'ok';
      if (t.qualifier === '+') issue(ctx.warnings, 'plus-all', `${domain} ends with "+all", which authorizes every IP address on the internet.`, domain);
      continue;
    }
    if (!entry.counted) { entry.status = 'ok'; continue; }
    await countTerm(ctx, node, entry, t, domain, vals, ancestors);
  }
  for (const t of mods) {
    const entry = { term: t.raw, type: t.name, counted: false, cost: 0 };
    node.terms.push(entry);
    if (t.name === 'exp') { entry.status = 'ok'; entry.note = 'looked up only after a fail, never counted (Section 4.6.4)'; continue; }
    if (t.name !== 'redirect') { entry.status = 'ignored'; entry.note = 'unknown modifier, ignored (Section 6)'; continue; }
    if (hasAll) { entry.status = 'ignored'; entry.note = 'ignored because the record has "all" (Section 6.1)'; issue(ctx.warnings, 'redirect-ignored', `${domain}: redirect is ignored because the record also has "all" (Section 6.1).`, domain); continue; }
    entry.counted = true;
    await countTerm(ctx, node, entry, t, domain, vals, ancestors);
  }
  node.cost = node.terms.reduce((n, e) => n + (e.cost ?? 0), 0);
  return node;
}

function tick(ctx, entry, domain) {
  ctx.lookups++;
  entry.n = ctx.lookups;
  entry.cost = 1;
  if (ctx.lookups === LIMITS.lookups + 1) {
    ctx.firstOver = { domain, term: entry.term, n: ctx.lookups };
  }
}

function voidHit(ctx, entry, domain, what) {
  ctx.voids++;
  entry.void = ctx.voids;
  entry.status = 'void';
  entry.note = what;
  if (ctx.voids === LIMITS.voids + 1) ctx.firstVoidOver = { domain, term: entry.term, n: ctx.voids };
}

async function countTerm(ctx, node, entry, t, domain, vals, ancestors) {
  if (ctx.lookups >= CAPS.terms) {
    entry.counted = false; entry.status = 'not-walked'; entry.note = `not walked: this check stops at ${CAPS.terms} lookups`;
    ctx.truncated = true;
    return;
  }
  tick(ctx, entry, domain);
  const spec = t.spec ?? t.value;
  if (ctx.ip && spec && macroLetters(spec).includes('p') && vals.p === undefined) {
    // %{p} needs the sending IP's validated host name (Section 7.3): worked out once, when used.
    ctx.validated ??= await pValue({ dns: ctx.dns, ip: ctx.ip }, domain);
    vals.p = ctx.validated;
  }
  const tg = targetOf(t, domain, vals);
  if (tg.error) { entry.status = 'error'; entry.note = tg.error; issue(ctx.errors, 'macro', `${domain}: ${tg.error}`, domain, { term: t.raw }); return; }
  if (tg.pending) {
    entry.status = 'depends'; entry.macro = true;
    entry.note = `uses ${tg.pending.map((l) => `%{${l}}`).join(', ')}: the name depends on ${tg.needs.join(' and ')}, so it is counted as 1 and not followed. Give a sending IP to follow it.`;
    ctx.dependent.push({ domain, term: t.raw });
    return;
  }
  entry.target = tg.name;
  if (tg.macro) { entry.macro = true; entry.expansion = tg.steps; }
  const name = tg.name;
  const why = nameProblem(name);
  if (why) {
    entry.status = 'error'; entry.note = `${name} ${why}`;
    issue(ctx.errors, t.name === 'include' || t.name === 'redirect' ? `${t.name}-none` : 'bad-target', `${domain}: "${t.raw}" points at ${name}, which ${why}.`, domain, { term: t.raw });
    return;
  }
  if (t.name === 'include' || t.name === 'redirect') {
    if (ancestors.includes(name)) {
      entry.status = 'loop'; entry.note = `${name} is already being evaluated above: a loop that only the lookup limit ends`;
      issue(ctx.errors, 'loop', `${domain}: "${t.raw}" loops back to ${name}; a receiver keeps counting until the 10-lookup limit gives permerror.`, domain, { term: t.raw });
      return;
    }
    ctx.seenIncludes.push({ target: name, from: domain, term: t.raw });
    const child = await auditRecord(ctx, name, undefined, t.name, [...ancestors, name]);
    entry.child = child;
    entry.status = child.status === 'ok' ? 'ok' : child.status;
    entry.cost = 1 + (child.cost ?? 0);
    if (child.status === 'none' && (child.note === 'the name does not exist' || child.note === 'no v=spf1 record')) {
      // The TXT query of a missing name is a void answer too.
      voidHit(ctx, entry, domain, `${name}: ${child.note}`);
      entry.status = 'none';
    }
    return;
  }
  if (t.name === 'a' || t.name === 'exists') {
    const type = t.name === 'exists' ? 'A' : ctx.ip?.v === 6 ? 'AAAA' : 'A';
    const r = await ctx.dns.q(name, type);
    if (r.status === 'error' || r.status === 'refused') return dnsFail(ctx, entry, domain, name, type, r);
    if (isVoid(r)) return voidHit(ctx, entry, domain, `${name} has no ${type} record (${r.status === 'nxdomain' ? 'name does not exist' : 'no data'})`);
    entry.status = 'ok';
    entry.addresses = r.answers;
    return;
  }
  if (t.name === 'mx') {
    const r = await ctx.dns.q(name, 'MX');
    if (r.status === 'error' || r.status === 'refused') return dnsFail(ctx, entry, domain, name, 'MX', r);
    if (isVoid(r)) return voidHit(ctx, entry, domain, `${name} has no MX record`);
    entry.status = 'ok';
    entry.mxNames = r.answers.map((x) => x.exchange);
    if (r.total > LIMITS.mxNames) {
      entry.status = 'error';
      entry.note = `${r.total} MX names: more than 10 makes mx return permerror (Section 4.6.4)`;
      issue(ctx.errors, 'mx-limit', `${domain}: "${t.raw}" finds ${r.total} MX names; each mx may look up at most 10, else permerror (Section 4.6.4).`, domain, { term: t.raw });
    }
    return;
  }
  if (t.name === 'ptr') {
    issue(ctx.warnings, 'ptr', `${domain}: "${t.raw}" uses ptr, which SHOULD NOT be published: it is slow and unreliable (Section 5.5).`, domain, { term: t.raw });
    if (!ctx.ip) { entry.status = 'depends'; entry.note = 'needs a sending IP: counted as 1, reverse lookup not run'; return; }
    const r = await ctx.dns.q(reverseName(ctx.ip), 'PTR', { reverse: true });
    if (r.status === 'error') { entry.status = 'ok'; entry.note = 'reverse lookup failed: ptr does not match (Section 5.5)'; return; }
    if (isVoid(r)) return voidHit(ctx, entry, domain, `${ctx.ip.text} has no PTR record`);
    entry.status = 'ok'; entry.ptrNames = r.answers.slice(0, LIMITS.ptrNames);
  }
}

function dnsFail(ctx, entry, domain, name, type, r) {
  if (r.status === 'refused') {
    entry.status = 'refused'; entry.note = r.error;
    issue(ctx.errors, 'refused-name', `${domain}: ${r.error}; it was not queried.`, domain, { term: entry.term });
    return;
  }
  entry.status = 'temperror'; entry.note = `${type} lookup for ${name} failed (${r.error})`;
  issue(ctx.temp, r.cap ? 'cap' : 'dns-error', `${domain}: the ${type} lookup for ${name} failed (${r.error}); a receiver would return temperror (Section 5).`, domain, { term: entry.term });
}

// ---------- check_host() for one IP (Section 4) ----------

class Stop extends Error {
  constructor(result, reason, at) { super(reason); this.result = result; this.reason = reason; this.at = at; }
}

async function validatedNames(p) {
  if (p.validatedNames) return p.validatedNames;
  const out = [];
  const r = await p.dns.q(reverseName(p.ip), 'PTR', { reverse: true });
  if (r.status === 'ok') {
    for (const name of r.answers.slice(0, LIMITS.ptrNames)) {
      const n = normalizeName(name);
      if (nameProblem(n)) continue;
      const a = await p.dns.q(n, p.ip.v === 4 ? 'A' : 'AAAA');
      if (a.status !== 'ok') continue;
      if (a.answers.some((x) => { const ip = parseIp(x); return ip && ip.v === p.ip.v && ip.n === p.ip.n; })) out.push(n);
    }
  }
  p.validatedNames = out;
  return out;
}

async function pValue(p, domain) {
  const names = await validatedNames(p);
  return names.find((n) => n === domain) ?? names.find((n) => n.endsWith(`.${domain}`)) ?? names[0] ?? 'unknown';
}

function countPath(p, domain, raw) {
  p.lookups++;
  p.trail.push({ n: p.lookups, domain, term: raw });
  if (p.lookups > LIMITS.lookups) throw new Stop('permerror', `the ${p.lookups}th DNS-querying term, "${raw}" in ${domain}, is over the limit of 10 (Section 4.6.4)`, { domain, term: raw });
}

function voidPath(p, domain, raw) {
  p.voids++;
  if (p.voids > LIMITS.voids) throw new Stop('permerror', `"${raw}" in ${domain} is the ${p.voids}rd void lookup; the limit is 2 (Section 4.6.4)`, { domain, term: raw });
}

const ipMatches = (ip, addr, cidr4 = 32, cidr6 = 128) => {
  const a = parseIp(addr);
  if (!a || a.v !== ip.v) return false;
  return inNet(ip, a.n, ip.v === 4 ? cidr4 : cidr6);
};

async function pathTarget(p, t, domain) {
  const spec = t.spec ?? t.value;
  if (spec === undefined) return domain;
  let vals = macroValues({ domain, ip: p.ip, sender: p.sender, helo: p.helo });
  if (macroLetters(spec).includes('p')) vals = { ...vals, p: await pValue(p, domain) };
  if (vals.h === undefined) vals.h = 'unknown';
  try {
    return normalizeName(expandMacro(spec, vals).value);
  } catch (e) {
    throw new Stop('permerror', `${domain}: ${e.message}`, { domain, term: t.raw });
  }
}

async function addresses(p, name, type, domain, raw) {
  const r = await p.dns.q(name, type);
  if (r.status === 'refused') throw new Stop('permerror', `${domain}: "${raw}" points at ${r.error}`, { domain, term: raw });
  if (r.status === 'error') throw new Stop('temperror', `${domain}: the ${type} lookup for ${name} failed (${r.error})`, { domain, term: raw });
  return r;
}

async function checkHost(p, domain, given, depth) {
  if (depth > 20) throw new Stop('permerror', 'include and redirect nest too deep', { domain });
  let text = given;
  if (text === undefined) {
    if (nameProblem(domain)) return { result: 'none', reason: `${domain} ${nameProblem(domain)}` };
    const r = await p.dns.q(domain, 'TXT');
    if (r.status === 'refused') return { result: 'none', reason: r.error };
    if (r.status === 'error') throw new Stop('temperror', `the TXT lookup for ${domain} failed (${r.error})`, { domain });
    const recs = spfRecords(r.answers);
    if (!recs.length) return { result: 'none', reason: `${domain} has no SPF record` };
    if (recs.length > 1) throw new Stop('permerror', `${domain} has ${recs.length} SPF records (Section 4.5)`, { domain });
    text = recs[0];
  }
  const parsed = parseRecord(text);
  if (parsed.errors.length) throw new Stop('permerror', `${domain}: ${parsed.errors[0].message}`, { domain, term: parsed.errors[0].term });
  const ip = p.ip;
  let redirect = null;
  for (const t of parsed.terms) {
    if (t.kind === 'modifier') { if (t.name === 'redirect') redirect = t; continue; }
    if (t.name === 'all') return { result: t.result, matched: { domain, term: t.raw } };
    let match = false;
    if (t.name === 'ip4' || t.name === 'ip6') {
      match = t.v === ip.v && inNet(ip, t.net, t.prefix);
    } else {
      countPath(p, domain, t.raw);
      const name = await pathTarget(p, t, domain);
      if (t.name === 'include') {
        if (nameProblem(name)) throw new Stop('permerror', `${domain}: "${t.raw}" points at ${name}, which ${nameProblem(name)}`, { domain, term: t.raw });
        const r = await checkHost(p, name, undefined, depth + 1);
        if (r.result === 'pass') match = true;
        else if (r.result === 'none') throw new Stop('permerror', `${domain}: "${t.raw}": ${r.reason}, so include returns permerror (Section 5.2)`, { domain, term: t.raw });
      } else if (t.name === 'a') {
        const r = await addresses(p, name, ip.v === 4 ? 'A' : 'AAAA', domain, t.raw);
        if (isVoid(r)) voidPath(p, domain, t.raw);
        match = r.answers.some((x) => ipMatches(ip, x, t.cidr4, t.cidr6));
      } else if (t.name === 'mx') {
        const r = await addresses(p, name, 'MX', domain, t.raw);
        if (isVoid(r)) voidPath(p, domain, t.raw);
        if (r.total > LIMITS.mxNames) throw new Stop('permerror', `${domain}: "${t.raw}" finds ${r.total} MX names, more than 10 (Section 4.6.4)`, { domain, term: t.raw });
        for (const mx of r.answers) {
          const a = await addresses(p, mx.exchange, ip.v === 4 ? 'A' : 'AAAA', domain, t.raw);
          if (a.answers.some((x) => ipMatches(ip, x, t.cidr4, t.cidr6))) { match = true; break; }
        }
      } else if (t.name === 'exists') {
        const r = await addresses(p, name, 'A', domain, t.raw);
        if (isVoid(r)) voidPath(p, domain, t.raw);
        match = r.status === 'ok' && r.answers.length > 0;
      } else if (t.name === 'ptr') {
        const names = await validatedNames(p);
        match = names.some((n) => n === name || n.endsWith(`.${name}`));
      }
    }
    if (match) return { result: t.result, matched: { domain, term: t.raw } };
  }
  if (redirect) {
    countPath(p, domain, redirect.raw);
    const name = await pathTarget(p, redirect, domain);
    const r = await checkHost(p, name, undefined, depth + 1);
    if (r.result === 'none') throw new Stop('permerror', `${domain}: redirect target ${name} has no SPF record (Section 6.1)`, { domain, term: redirect.raw });
    return r;
  }
  return { result: 'neutral', reason: 'no mechanism matched and there is no redirect, so the default is neutral (Section 4.7)' };
}

// ---------- drafts ----------

// Applies { add, remove } to a record: added terms go before "all" (or before the modifiers when
// there is no all); removed terms are matched as written, with or without a "+".
export function editRecord(text, { add = [], remove = [] } = {}) {
  const tokens = String(text).split(/ +/).filter(Boolean);
  const bare = (s) => s.toLowerCase().replace(/^\+/, '');
  const gone = new Set(remove.map(bare));
  const missing = remove.filter((r) => !tokens.some((t) => bare(t) === bare(r)));
  let kept = [tokens[0], ...tokens.slice(1).filter((t) => !gone.has(bare(t)))];
  if (add.length) {
    let at = kept.findIndex((t, i) => i > 0 && /^[+\-~?]?all$/i.test(t));
    if (at < 0) at = kept.findIndex((t, i) => i > 0 && /^[a-z][a-z0-9_.-]*=/i.test(t));
    if (at < 0) at = kept.length;
    kept = [...kept.slice(0, at), ...add, ...kept.slice(at)];
  }
  return { record: kept.join(' '), missing };
}

// ---------- the whole check ----------

// input: { domain, record?, add?, remove?, ip?, sender?, helo? }. Returns the report.
export async function analyze(input, resolve, { now = new Date(), clock, resolverName = 'injected resolver' } = {}) {
  const domain = normalizeName(input.domain);
  const why = nameProblem(domain);
  if (why) throw new SpfError(`The domain ${why}.`, 'domain');
  let ip = null;
  if (input.ip) {
    ip = parseIp(input.ip);
    if (!ip) throw new SpfError('The sending IP must be an IPv4 address like 203.0.113.7 or an IPv6 address like 2001:db8::1.', 'ip');
    if (isPrivateIp(ip)) throw new SpfError('The sending IP is a private, loopback, link-local or reserved address. SPF is checked against the public address a message came from.', 'ip');
  }
  const sender = input.sender ? normalizeSender(input.sender) : null;
  const helo = input.helo ? normalizeName(input.helo) : null;
  const dns = makeDns(resolve, clock ? { now: clock } : {});

  // The record: live, or a draft (given, or the live one edited).
  let given;
  let source = 'dns';
  let editNote = null;
  if (input.record !== undefined || input.add?.length || input.remove?.length) {
    source = 'draft';
    let base = input.record;
    if (base === undefined) {
      const r = await dns.q(domain, 'TXT');
      if (r.status === 'error') return temperrorReport({ domain, ip, sender, helo, now, resolverName, dns, message: `The TXT lookup for ${domain} failed (${r.error}).` });
      const recs = spfRecords(r.answers);
      if (recs.length !== 1) throw new SpfError(recs.length ? `${domain} publishes ${recs.length} SPF records; paste the one you want to edit as "record".` : `${domain} has no SPF record to edit; give the whole draft as "record".`, 'domain');
      base = recs[0];
    }
    base = String(base).trim().replace(/^"|"$/g, '');
    if (input.add?.length || input.remove?.length) {
      const e = editRecord(base, { add: input.add ?? [], remove: input.remove ?? [] });
      if (e.missing.length) editNote = `Not in the record, so not removed: ${e.missing.join(', ')}.`;
      given = e.record;
    } else {
      given = base;
    }
  }

  const ctx = { dns, ip, sender, helo, lookups: 0, voids: 0, errors: [], warnings: [], temp: [], dependent: [], seenIncludes: [], firstOver: null, firstVoidOver: null, truncated: false };
  const tree = await auditRecord(ctx, domain, given, 'top', [domain]);
  if (source === 'dns' && tree.status === 'temperror') {
    return temperrorReport({ domain, ip, sender, helo, now, resolverName, dns, message: tree.note });
  }

  // Duplicate includes: the same name included twice costs twice.
  const counts = new Map();
  for (const x of ctx.seenIncludes) counts.set(x.target, (counts.get(x.target) ?? 0) + 1);
  const duplicates = [...counts].filter(([, n]) => n > 1).map(([target, n]) => ({ target, times: n }));
  for (const d of duplicates) issue(ctx.warnings, 'duplicate-include', `${d.target} is included ${d.times} times; each one is counted again.`, domain);

  if (ctx.lookups > LIMITS.lookups) {
    issue(ctx.errors, 'too-many-lookups', `The record needs ${ctx.truncated ? `more than ${ctx.lookups}` : ctx.lookups} DNS-querying terms; the limit is 10. The 11th is "${ctx.firstOver.term}" in ${ctx.firstOver.domain}, so any sender not matched before it gets permerror (Section 4.6.4).`, ctx.firstOver.domain, { term: ctx.firstOver.term });
  } else if (ctx.lookups >= 8) {
    issue(ctx.warnings, 'near-limit', `${ctx.lookups} of 10 lookups used: ${10 - ctx.lookups} left for new senders.`, domain);
  }
  if (ctx.voids > LIMITS.voids) {
    issue(ctx.errors, 'too-many-voids', `${ctx.voids} void lookups; RFC 7208 says receivers SHOULD stop at 2 and return permerror. The 3rd is "${ctx.firstVoidOver.term}" in ${ctx.firstVoidOver.domain} (Section 4.6.4). Some receivers do not enforce this limit.`, ctx.firstVoidOver.domain, { term: ctx.firstVoidOver.term });
  }
  if (ctx.dependent.length && !ip) {
    issue(ctx.warnings, 'macros', `${ctx.dependent.length} term${ctx.dependent.length === 1 ? '' : 's'} use${ctx.dependent.length === 1 ? 's' : ''} macros that depend on the sending IP: counted as 1 each and not followed. Give a sending IP to follow them.`, domain);
  }

  // check_host() for the IP, when one is given.
  let path = null;
  if (ip) {
    const p = { dns, ip, sender: sender ?? `postmaster@${domain}`, helo, lookups: 0, voids: 0, trail: [] };
    try {
      const r = await checkHost(p, domain, given, 0);
      path = { result: r.result, matched: r.matched ?? null, reason: r.reason ?? null };
    } catch (e) {
      if (!(e instanceof Stop)) throw e;
      path = { result: e.result, matched: null, reason: e.reason, at: e.at ?? null };
    }
    path.lookups = p.lookups;
    path.voids = p.voids;
    path.trail = p.trail;
    path.ip = ip.text;
    path.sender = p.sender;
    path.helo = helo;
  }

  const verdict = tree.status === 'none' ? 'none'
    : ctx.errors.length ? 'permerror'
      : ctx.temp.length ? 'temperror'
        : 'ok';
  const top = topCosts(tree);
  let answer = answerLine({ domain, tree, ctx, top, verdict });
  if (path) answer += ` For ${path.ip}, a receiver returns ${path.result} after ${path.lookups} ${path.lookups === 1 ? 'lookup' : 'lookups'}${path.matched ? ` (matched "${path.matched.term}" in ${path.matched.domain})` : ''}.`;
  return {
    domain,
    source,
    record: tree.record,
    recordNote: editNote,
    verdict,
    lookups: ctx.lookups,
    lookupsComplete: !ctx.truncated,
    limit: LIMITS.lookups,
    remaining: Math.max(0, LIMITS.lookups - ctx.lookups),
    firstOver: ctx.firstOver,
    voidLookups: ctx.voids,
    voidLimit: LIMITS.voids,
    dependsOnSender: ctx.dependent,
    answer,
    costs: top,
    errors: [...ctx.errors, ...ctx.temp],
    // The size guide is advice; the counting warnings come first.
    warnings: [...ctx.warnings.filter((w) => w.code !== 'size'), ...ctx.warnings.filter((w) => w.code === 'size')],
    suggestions: suggest(tree, ctx, top, duplicates),
    path,
    tree,
    dns: { resolver: resolverName, queries: dns.queries, checkedAt: now.toISOString() },
  };
}

function normalizeSender(s) {
  const t = String(s).trim();
  const at = t.lastIndexOf('@');
  if (at < 0) return `postmaster@${normalizeName(t)}`;
  return `${t.slice(0, at)}@${normalizeName(t.slice(at + 1))}`;
}

function temperrorReport({ domain, ip, now, resolverName, dns, message }) {
  return {
    domain, source: 'dns', record: null, verdict: 'temperror', lookups: 0, lookupsComplete: false, limit: 10, remaining: null, firstOver: null,
    voidLookups: 0, voidLimit: 2, dependsOnSender: [], answer: `${domain}: ${message} A receiver would return temperror (Section 4.4). Try again shortly.`,
    costs: [], errors: [{ code: 'dns-error', message, at: domain }], warnings: [], suggestions: [], path: ip ? { result: 'temperror', reason: message } : null, tree: null,
    dns: { resolver: resolverName, queries: dns.queries, checkedAt: now.toISOString() },
  };
}

// The top-level terms by what they cost, dearest first.
function topCosts(tree) {
  if (!tree?.terms) return [];
  return tree.terms.filter((e) => e.counted).map((e) => ({ term: e.term, cost: e.cost, status: e.status }))
    .sort((a, b) => b.cost - a.cost);
}

function answerLine({ domain, tree, ctx, top, verdict }) {
  if (tree.status === 'none') return `${domain} has no SPF record (${tree.note}), so SPF returns none.`;
  if (tree.status === 'multiple') return `${domain} publishes ${tree.records.length} SPF records, so every SPF check returns permerror (Section 4.5).`;
  if (tree.status === 'syntax') return `${domain}'s SPF record has a syntax error, so every SPF check returns permerror (Section 4.6).`;
  const n = ctx.truncated ? `more than ${ctx.lookups}` : String(ctx.lookups);
  const dear = top[0] && top[0].cost > 1 ? `; ${top[0].term} costs ${top[0].cost}` : '';
  const over = ctx.lookups > LIMITS.lookups ? ', over the limit: permerror' : '';
  const voids = `, and ${ctx.voids} void lookup${ctx.voids === 1 ? ' was' : 's were'} found (limit 2)`;
  const tail = verdict === 'permerror' && ctx.lookups <= LIMITS.lookups ? '. It still returns permerror: see the errors.' : '.';
  return `${domain} uses ${n} of 10 SPF DNS lookups${over}${dear}${voids}${tail}`;
}

function suggest(tree, ctx, top, duplicates) {
  const out = [];
  if (!tree?.terms) return out;
  const over = ctx.lookups - LIMITS.lookups;
  for (const e of tree.terms) {
    if (!e.counted) continue;
    if (e.status === 'none' || e.status === 'void') out.push({ action: `Remove "${e.term}"`, saves: e.cost, why: 'it finds nothing, so it only spends a lookup (and a void lookup)' });
    else if (e.type === 'ptr') out.push({ action: `Remove "${e.term}"`, saves: e.cost, why: 'ptr SHOULD NOT be used (Section 5.5); list the sending addresses with ip4 or ip6 instead' });
    else if ((e.type === 'a' && e.addresses?.length) || (e.type === 'mx' && e.mxNames?.length)) {
      out.push({ action: `Replace "${e.term}" with ip4/ip6 entries for its addresses`, saves: 1, why: 'ip4 and ip6 cost no lookups; update them if those servers change address' });
    }
  }
  for (const d of duplicates) out.push({ action: `Include ${d.target} once`, saves: d.times - 1, why: 'every repeat of an include is counted again' });
  if (over > 0) {
    const big = top.find((t) => /^[+\-~?]?include:/i.test(t.term));
    if (big) out.push({ action: `Move a sender to its own subdomain (for example news.yourdomain), starting with the dearest, ${big.term}`, saves: big.cost, why: `you are ${over} over; mail sent from a subdomain is checked against that subdomain's own SPF record` });
  }
  return out;
}

// ---------- batch summary ----------

export function summaryRow(report) {
  return {
    domain: report.domain,
    verdict: report.verdict,
    lookups: report.lookups,
    lookupsComplete: report.lookupsComplete,
    voidLookups: report.voidLookups,
    firstOver: report.firstOver ? `${report.firstOver.term} in ${report.firstOver.domain}` : null,
    dearest: report.costs[0] ? `${report.costs[0].term} (${report.costs[0].cost})` : null,
    record: report.record,
    errors: report.errors.map((e) => e.message),
  };
}

// ---------- the macro explainer (no DNS) ----------

export function explainMacro({ macro, domain, ip, sender, helo, validatedName, exp = false }) {
  const vals = { d: domain ? normalizeName(domain) : undefined };
  let ipInfo = null;
  if (ip) {
    ipInfo = parseIp(ip);
    if (!ipInfo) throw new SpfError('The sending IP must be an IPv4 or IPv6 address.', 'ip');
  }
  Object.assign(vals, macroValues({ domain: vals.d, ip: ipInfo, sender: sender ? normalizeSender(sender) : null, helo: helo ? normalizeName(helo) : null, validated: validatedName ?? 'unknown' }));
  if (exp) { vals.r = 'unknown'; vals.t = undefined; }
  let tokens;
  try { tokens = tokenizeMacro(macro, { exp }); } catch (e) { throw new SpfError(e.message, 'macro'); }
  const letters = [...new Set(tokens.filter((t) => t.letter).map((t) => t.letter))];
  const { value, steps } = (() => {
    try { return expandMacro(macro, vals, { exp, domain: !exp }); } catch (e) { throw new SpfError(e.message, e.field === 'd' ? 'domain' : e.field === 'h' ? 'helo' : ['s', 'l', 'o'].includes(e.field) ? 'sender' : 'ip'); }
  })();
  const name = exp ? null : normalizeName(value);
  return {
    macro,
    expansion: value,
    letters: letters.map((l) => ({ letter: l, meaning: MACRO_MEANING[l] })),
    steps,
    validName: name ? !nameProblem(name) : null,
    note: letters.includes('p') ? `%{p} was taken as "${vals.p}"; a receiver works it out from reverse DNS (Section 7.3), and RFC 7208 says not to publish it.` : null,
  };
}

// A resolver that answers from a recorded zone { "TXT name": { status, answers } }: the worked
// examples and the tests use it, so neither touches the network. Unknown names are NXDOMAIN.
export function zoneResolver(zone) {
  return async (name, type) => {
    const r = zone[`${type} ${name}`];
    if (!r) return { status: 'nxdomain', answers: [] };
    return { status: r.status, answers: r.answers, ...(r.error ? { error: r.error } : {}) };
  };
}
