// DMARC aggregate report analyzer: the pure engine, loaded by the server and by the page.
//
// It reads the XML of a DMARC aggregate report in either published format, RFC 9990 (May 2026,
// namespace urn:ietf:params:xml:ns:dmarc-2.0) or RFC 7489 Appendix C (no namespace in practice),
// names the sending service behind each source IP from dated provider data the caller passes in,
// and says in plain words why each failing source failed and what usually fixes it.
//
// No imports, no Node APIs: the browser loads this same file. Decompression (.gz, .zip, .eml)
// happens before this, on the server (archive.js). The XML reader below is written for reports:
// it refuses any DOCTYPE (so no entity can be declared or expanded, and nothing external is ever
// fetched), knows only the five predefined entities and character references, and caps depth,
// element count and text size.

export class DmarcError extends Error {
  constructor(message, field = 'files') { super(message); this.name = 'DmarcError'; this.field = field; }
}

export const LIMITS = {
  xmlChars: 32 * 1024 * 1024, // one report's XML, after decompression
  elements: 1_500_000,
  depth: 24,
  records: 200_000,
  attrs: 32,
};

export const NS_9990 = 'urn:ietf:params:xml:ns:dmarc-2.0';
export const NS_7489 = 'http://dmarc.org/dmarc-xml/0.1';

// ---------- a small, safe XML reader ----------

const NAME_START = /[A-Za-z_:À-￿]/;
const PREDEFINED = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };

function decodeEntities(s, where) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(?:([^;&\s<]{1,12});)?/g, (m, name) => {
    if (name === undefined) throw new DmarcError(`The XML has a bare "&" ${where}.`);
    if (name[0] === '#') {
      const cp = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      if (!Number.isInteger(cp) || cp < 1 || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) throw new DmarcError(`The XML has an invalid character reference ${m} ${where}.`);
      return String.fromCodePoint(cp);
    }
    if (Object.hasOwn(PREDEFINED, name)) return PREDEFINED[name];
    throw new DmarcError(`The XML uses the entity ${m} ${where}, which XML does not define without a DOCTYPE. DMARC reports never need one, so it is refused.`);
  });
}

// Parses XML text into { name, local, prefix, attrs, children, text } nodes and returns the root.
export function parseXml(text) {
  if (typeof text !== 'string') throw new DmarcError('The report must be XML text.');
  if (text.length > LIMITS.xmlChars) throw new DmarcError(`The report XML is ${Math.round(text.length / 1048576)} MB; at most ${LIMITS.xmlChars / 1048576} MB is read.`);
  let i = text.charCodeAt(0) === 0xFEFF ? 1 : 0;
  const n = text.length;
  const stack = [];
  let root = null;
  let elements = 0;
  const lineAt = (pos) => text.slice(0, pos).split('\n').length;
  const fail = (msg, pos = i) => { throw new DmarcError(`${msg} (line ${lineAt(pos)}).`); };

  while (i < n) {
    const lt = text.indexOf('<', i);
    const chunk = lt < 0 ? text.slice(i) : text.slice(i, lt);
    if (chunk) {
      if (stack.length) {
        const top = stack[stack.length - 1];
        top.text += decodeEntities(chunk, `inside <${top.name}>`);
        if (top.text.length > 1_000_000) fail(`The text inside <${top.name}> is too long`);
      } else if (chunk.trim()) fail('There is text outside the root element');
    }
    if (lt < 0) break;
    i = lt;
    if (text.startsWith('<!--', i)) {
      const end = text.indexOf('-->', i + 4);
      if (end < 0) fail('A comment is not closed');
      i = end + 3;
    } else if (text.startsWith('<![CDATA[', i)) {
      const end = text.indexOf(']]>', i + 9);
      if (end < 0) fail('A CDATA section is not closed');
      if (!stack.length) fail('A CDATA section is outside the root element');
      stack[stack.length - 1].text += text.slice(i + 9, end);
      i = end + 3;
    } else if (text.startsWith('<?', i)) {
      const end = text.indexOf('?>', i + 2);
      if (end < 0) fail('A processing instruction is not closed');
      i = end + 2;
    } else if (text.startsWith('<!', i)) {
      // <!DOCTYPE and anything else declared: refused, so no entity can be defined or loaded.
      fail('The XML has a DOCTYPE or declaration. DMARC reports never need one, and it is refused for safety');
    } else if (text[i + 1] === '/') {
      const end = text.indexOf('>', i);
      if (end < 0) fail('A closing tag is not finished');
      const name = text.slice(i + 2, end).trim();
      const top = stack.pop();
      if (!top) fail(`</${name}> closes nothing`);
      if (top.name !== name) fail(`</${name}> does not match <${top.name}>`);
      if (!stack.length) root = top;
      i = end + 1;
    } else {
      // A start tag: read the name and attributes, honouring quotes.
      let j = i + 1;
      if (!NAME_START.test(text[j] ?? '')) fail('A "<" does not start a tag');
      while (j < n && !/[\s/>]/.test(text[j])) j++;
      const name = text.slice(i + 1, j);
      const attrs = {};
      let count = 0;
      let selfClose = false;
      for (;;) {
        while (j < n && /\s/.test(text[j])) j++;
        if (j >= n) fail(`<${name}> is not finished`);
        if (text[j] === '>') { j++; break; }
        if (text[j] === '/' && text[j + 1] === '>') { selfClose = true; j += 2; break; }
        let k = j;
        while (k < n && !/[\s=/>]/.test(text[k])) k++;
        const an = text.slice(j, k);
        while (k < n && /\s/.test(text[k])) k++;
        if (!an || text[k] !== '=') fail(`An attribute in <${name}> has no value`);
        k++;
        while (k < n && /\s/.test(text[k])) k++;
        const q = text[k];
        if (q !== '"' && q !== "'") fail(`An attribute in <${name}> is not quoted`);
        const close = text.indexOf(q, k + 1);
        if (close < 0) fail(`An attribute in <${name}> is not closed`);
        if (++count > LIMITS.attrs) fail(`<${name}> has too many attributes`);
        attrs[an] = decodeEntities(text.slice(k + 1, close), `in <${name}>`);
        j = close + 1;
      }
      if (root) fail('There is a second root element');
      if (++elements > LIMITS.elements) fail(`The report has more than ${LIMITS.elements.toLocaleString('en-US')} elements`);
      const colon = name.indexOf(':');
      const node = { name, prefix: colon > 0 ? name.slice(0, colon) : '', local: colon > 0 ? name.slice(colon + 1) : name, attrs, children: [], text: '' };
      if (stack.length) stack[stack.length - 1].children.push(node);
      if (selfClose) {
        if (!stack.length) root = node;
      } else {
        stack.push(node);
        if (stack.length > LIMITS.depth) fail(`The XML is nested more than ${LIMITS.depth} levels deep`);
      }
      i = j;
    }
  }
  if (stack.length) throw new DmarcError(`The XML ends before </${stack[stack.length - 1].name}> (the file may be cut short).`);
  if (!root) throw new DmarcError('The file has no XML element in it.');
  return root;
}

// ---------- IP addresses ----------

export function parseIp(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim().replace(/^\[|\]$/g, '');
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(t);
  if (v4) {
    const p = v4.slice(1).map(Number);
    if (p.some((x) => x > 255) || v4.slice(1).some((x) => x.length > 1 && x[0] === '0')) return null;
    return { v: 4, n: BigInt(((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]), text: p.join('.') };
  }
  if (!/^[0-9A-Fa-f:.]+$/.test(t) || !t.includes(':')) return null;
  let head = t; let tail4 = null;
  const m4 = /^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/.exec(t);
  if (m4) { const x = parseIp(m4[2]); if (!x) return null; head = `${m4[1]}0:0`; tail4 = x.n; }
  const dbl = head.split('::');
  if (dbl.length > 2) return null;
  const left = dbl[0] ? dbl[0].split(':') : [];
  const right = dbl.length === 2 && dbl[1] ? dbl[1].split(':') : [];
  if ([...left, ...right].some((g) => !/^[0-9A-Fa-f]{1,4}$/.test(g))) return null;
  const fill = 8 - left.length - right.length;
  if ((dbl.length === 1 && fill !== 0) || fill < (dbl.length === 2 ? 1 : 0)) return null;
  const groups = [...left, ...Array(dbl.length === 2 ? fill : 0).fill('0'), ...right].map((g) => parseInt(g, 16));
  let n = 0n;
  for (const g of groups) n = (n << 16n) + BigInt(g);
  if (tail4 !== null) n = (n >> 32n << 32n) + tail4;
  // IPv4-mapped (::ffff:a.b.c.d) is treated as the IPv4 address.
  if (n >> 32n === 0xFFFFn) return { v: 4, n: n & 0xFFFFFFFFn, text: parseIpText4(n & 0xFFFFFFFFn) };
  return { v: 6, n, text: compress6(n) };
}
const parseIpText4 = (n) => [24n, 16n, 8n, 0n].map((s) => String((n >> s) & 255n)).join('.');
function compress6(n) {
  const g = [];
  for (let k = 7; k >= 0; k--) g.push(Number((n >> BigInt(k * 16)) & 0xFFFFn).toString(16));
  let best = [-1, 0];
  for (let k = 0; k < 8;) {
    if (g[k] !== '0') { k++; continue; }
    let e = k; while (e < 8 && g[e] === '0') e++;
    if (e - k > best[1] && e - k > 1) best = [k, e - k];
    k = e;
  }
  if (best[0] < 0) return g.join(':');
  return `${g.slice(0, best[0]).join(':')}::${g.slice(best[0] + best[1]).join(':')}`;
}

export function parseCidr(s) {
  const [a, b] = String(s).split('/');
  const ip = parseIp(a);
  if (!ip) return null;
  const max = ip.v === 4 ? 32 : 128;
  const len = b === undefined ? max : Number(b);
  if (!Number.isInteger(len) || len < 0 || len > max) return null;
  const shift = BigInt(max - len);
  return { v: ip.v, len, base: (ip.n >> shift) << shift, shift, text: `${ip.text}/${len}` };
}
export const inCidr = (ip, c) => ip.v === c.v && (ip.n >> c.shift) << c.shift === c.base;

// ---------- the sender index ----------

// Builds the lookup from dated provider data:
//   ranges   [{ id, name, cidrs: ['1.2.3.0/24', ...], source, readOn }] from published SPF records
//   domains  [{ id, name, suffixes: ['amazonses.com'], where: 'dkim'|'spf'|'both', source, readOn }]
//   hosting  [{ id, name, cidrs, source, readOn }] networks that publish their ranges (a rented
//            server there says where mail came from, not who sent it)
// CIDRs are kept in buckets by prefix length (masked network -> ids), so one lookup is a handful
// of map reads even with many ranges.
export function buildIndex({ ranges = [], domains = [], hosting = [] } = {}) {
  const make = () => ({ 4: new Map(), 6: new Map() });
  const svc = make();
  const host = make();
  const add = (buckets, list) => {
    for (const r of list) {
      for (const c of r.cidrs) {
        const p = parseCidr(c);
        if (!p) continue;
        const byLen = buckets[p.v];
        if (!byLen.has(p.len)) byLen.set(p.len, new Map());
        const m = byLen.get(p.len);
        const k = p.base.toString(16);
        const hit = m.get(k) ?? [];
        if (!hit.some((x) => x.id === r.id)) hit.push({ id: r.id, text: p.text });
        m.set(k, hit);
      }
    }
  };
  add(svc, ranges);
  add(host, hosting);
  const services = {};
  for (const r of [...ranges, ...domains]) services[r.id] = { id: r.id, name: r.name, source: r.source, readOn: r.readOn, ...(services[r.id] ?? {}) };
  const networks = Object.fromEntries(hosting.map((h) => [h.id, { id: h.id, name: h.name, source: h.source, readOn: h.readOn }]));
  return { svc, host, services, networks, domains };
}

// Every range in the buckets that holds this IP: [{ id, text }].
function rangesFor(buckets, ip) {
  const out = [];
  const max = ip.v === 4 ? 32n : 128n;
  for (const [len, m] of buckets[ip.v]) {
    const shift = max - BigInt(len);
    const hit = m.get(((ip.n >> shift) << shift).toString(16));
    if (hit) out.push(...hit);
  }
  return out;
}

const endsWithDomain = (d, suffix) => d === suffix || d.endsWith(`.${suffix}`);

function domainService(index, domain, where) {
  if (!domain) return null;
  const d = domain.toLowerCase().replace(/\.$/, '');
  for (const s of index.domains) {
    if (s.where !== 'both' && s.where !== where) continue;
    if (s.suffixes.some((x) => endsWithDomain(d, x))) return s;
  }
  return null;
}

// Names one source from what the report says about it. Evidence, strongest first: the IP inside
// ranges a provider publishes in its SPF record; a passing DKIM signature or SPF check for a domain
// a provider documents as its own. Several providers can publish the same range (shared
// infrastructure): then all are named and the confidence is "shared". An IP inside a cloud
// network's published ranges is only "hosted at": anyone can rent a server there.
export function identify(index, { ip, dkim = [], spf = [] }) {
  const evidence = [];
  const parsed = parseIp(ip);
  const byIp = parsed ? rangesFor(index.svc, parsed) : [];
  const ipIds = [...new Set(byIp.map((x) => x.id))];
  for (const id of ipIds) {
    const c = byIp.find((x) => x.id === id);
    evidence.push({ service: id, how: 'ip-range', detail: `${parsed.text} is inside ${c.text}, which ${index.services[id].name} publishes in its SPF record` });
  }
  for (const d of dkim) {
    if (d.result !== 'pass') continue;
    const s = domainService(index, d.domain, 'dkim');
    if (s && !evidence.some((e) => e.service === s.id && e.how === 'dkim-domain')) evidence.push({ service: s.id, how: 'dkim-domain', detail: `a DKIM signature from d=${d.domain} passed; ${s.name}'s own documentation names that domain for sending` });
  }
  for (const x of spf) {
    if (x.result !== 'pass') continue;
    const s = domainService(index, x.domain, 'spf');
    if (s && !evidence.some((e) => e.service === s.id && e.how === 'spf-domain')) evidence.push({ service: s.id, how: 'spf-domain', detail: `SPF passed for ${x.domain}; ${s.name}'s own documentation names that domain for sending` });
  }
  const hosts = parsed ? rangesFor(index.host, parsed) : [];
  const hostedAt = hosts.length ? { id: hosts[0].id, name: index.networks[hosts[0].id].name, range: hosts[0].text } : null;
  if (hostedAt) evidence.push({ service: null, how: 'hosting', detail: `${parsed.text} is inside ${hostedAt.range}, which ${hostedAt.name} publishes as its own; anyone can rent a server there` });
  // The IP decides when a published range holds it; a signing or bounce domain naming another
  // service does not override it (the evidence list still shows it). Otherwise the domains name it.
  const ids = ipIds.length ? ipIds : [...new Set(evidence.filter((e) => e.service).map((e) => e.service))];
  let confidence = 'none';
  if (ids.length === 1) confidence = ipIds.length === 1 ? 'high' : 'medium';
  else if (ids.length > 1) confidence = 'shared';
  else if (hostedAt) confidence = 'hosting';
  return {
    ip: parsed ? parsed.text : String(ip ?? ''),
    validIp: Boolean(parsed),
    services: ids.map((id) => ({ id, name: index.services[id]?.name ?? id })),
    name: ids.length ? ids.map((id) => index.services[id]?.name ?? id).join(' or ') : null,
    hostedAt,
    confidence,
    evidence,
  };
}

export const CONFIDENCE_WORDS = {
  high: 'named from one provider\'s published range',
  medium: 'named from a signing or bounce domain the provider documents',
  shared: 'the range is published by more than one provider',
  hosting: 'a rented server in a cloud network; not a named service',
  none: 'nothing in the dated provider data names this IP',
};

// ---------- reading a report ----------

const kids = (node, local) => node.children.filter((c) => c.local === local);
const kid = (node, local) => node?.children.find((c) => c.local === local) ?? null;
const val = (node, local) => {
  const k = kid(node, local);
  if (!k) return null;
  const t = k.text.trim();
  return t === '' ? '' : t;
};
const low = (s) => (s == null ? s : s.toLowerCase());

const DISPOSITIONS = ['none', 'quarantine', 'reject', 'pass'];
const ALIGNED = ['pass', 'fail'];
const DKIM_RESULTS = ['none', 'pass', 'fail', 'policy', 'neutral', 'temperror', 'permerror'];
const SPF_RESULTS = ['none', 'neutral', 'pass', 'fail', 'softfail', 'policy', 'temperror', 'permerror'];
// RFC 7489 types plus RFC 9990's policy_test_mode.
export const REASON_TYPES = {
  forwarded: 'the receiver thinks the message was forwarded (RFC 7489)',
  sampled_out: 'the pct tag left this message out of the policy (RFC 7489)',
  trusted_forwarder: 'it came through a forwarder the receiver trusts',
  mailing_list: 'the receiver thinks it came through a mailing list',
  local_policy: 'the receiver\'s own policy exempted it',
  other: 'another exception (see the comment)',
  policy_test_mode: 'your record has t=y (test mode), so the policy was applied one step lower (RFC 9990)',
};

function isoUtc(sec) {
  if (!Number.isFinite(sec)) return null;
  const d = new Date(sec * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().replace('.000Z', 'Z');
}

// Reads one report's XML into a plain object. Throws DmarcError if it is not a DMARC aggregate
// report at all; tolerates (with a warning) what real reporters do: whitespace around values,
// missing optional elements, the next midnight as the end time, values outside the schema.
export function readReport(xml, { file = null } = {}) {
  const root = parseXml(xml);
  if (root.local !== 'feedback') throw new DmarcError(`This XML's root element is <${root.name}>, not <feedback>: it is not a DMARC aggregate report.`);
  const warnings = [];
  const ns = root.prefix ? root.attrs[`xmlns:${root.prefix}`] ?? null : root.attrs.xmlns ?? null;
  const schema = ns === NS_9990 ? 'rfc9990' : (ns === null || ns === NS_7489) ? 'rfc7489' : 'other';
  if (schema === 'other') warnings.push(`The root namespace is ${ns}, which neither RFC 9990 nor RFC 7489 uses; read as an aggregate report anyway.`);
  const meta = kid(root, 'report_metadata');
  const pol = kid(root, 'policy_published');
  if (!meta) throw new DmarcError('The report has no <report_metadata>: it is not a complete DMARC aggregate report.');
  if (!pol) throw new DmarcError('The report has no <policy_published>: it is not a complete DMARC aggregate report.');
  const range = kid(meta, 'date_range');
  const begin = Number(val(range, 'begin'));
  const end = Number(val(range, 'end'));
  if (!Number.isFinite(begin) || !Number.isFinite(end)) warnings.push('The date range is missing or not in seconds since 1970.');
  const days = Number.isFinite(begin) && Number.isFinite(end) ? (end - begin + 1) / 86400 : null;
  if (Number.isFinite(end) && end % 86400 === 0 && end > begin) warnings.push('The end time is the next midnight (00:00:00 UTC), not 23:59:59; RFC 9990 asks for non-overlapping periods, so the last second overlaps the next report. Microsoft and Mail.ru reports do this.');

  const metadata = {
    orgName: val(meta, 'org_name'),
    email: val(meta, 'email'),
    extraContact: val(meta, 'extra_contact_info'),
    reportId: val(meta, 'report_id'),
    begin: Number.isFinite(begin) ? begin : null,
    end: Number.isFinite(end) ? end : null,
    beginUtc: isoUtc(begin),
    endUtc: isoUtc(end),
    days: days === null ? null : Math.round(days * 100) / 100,
    errors: kids(meta, 'error').map((e) => e.text.trim()).filter(Boolean),
    generator: val(meta, 'generator'),
  };
  for (const k of ['orgName', 'email', 'reportId']) if (!metadata[k]) warnings.push(`report_metadata has no ${k === 'orgName' ? 'org_name' : k === 'reportId' ? 'report_id' : 'email'}, which both RFCs require.`);

  const policy = {
    domain: low(val(pol, 'domain')),
    p: low(val(pol, 'p')),
    sp: low(val(pol, 'sp')),
    np: low(val(pol, 'np')),
    adkim: low(val(pol, 'adkim')),
    aspf: low(val(pol, 'aspf')),
    pct: val(pol, 'pct') === null ? null : Number(val(pol, 'pct')),
    fo: val(pol, 'fo'),
    testing: low(val(pol, 'testing')),
    discoveryMethod: low(val(pol, 'discovery_method')),
  };
  if (!policy.domain) throw new DmarcError('policy_published has no <domain>: the report does not say which domain it is about.');
  if (policy.pct !== null && schema === 'rfc9990') warnings.push('This RFC 9990 report still carries pct, which RFC 9989 removed (Appendix A.6).');

  const recs = kids(root, 'record');
  if (!recs.length) warnings.push('The report has no <record>: RFC 9990 requires at least one.');
  if (recs.length > LIMITS.records) throw new DmarcError(`The report has ${recs.length.toLocaleString('en-US')} records; at most ${LIMITS.records.toLocaleString('en-US')} are read.`);
  const odd = new Set();
  const records = recs.map((r, idx) => {
    const row = kid(r, 'row');
    const pe = kid(row, 'policy_evaluated');
    const ids = kid(r, 'identifiers');
    const auth = kid(r, 'auth_results');
    const ip = val(row, 'source_ip');
    const parsed = parseIp(ip ?? '');
    const countText = val(row, 'count');
    const count = /^\d+$/.test(countText ?? '') ? Number(countText) : null;
    if (!row || !pe) throw new DmarcError(`Record ${idx + 1} has no <row> or <policy_evaluated>.`);
    if (!parsed) odd.add(`Record ${idx + 1}: source_ip "${ip ?? ''}" is not an IPv4 or IPv6 address.`);
    if (count === null) odd.add(`Record ${idx + 1}: count "${countText ?? ''}" is not a whole number; counted as 0.`);
    const disposition = low(val(pe, 'disposition'));
    const dkimAligned = low(val(pe, 'dkim'));
    const spfAligned = low(val(pe, 'spf'));
    if (!DISPOSITIONS.includes(disposition)) odd.add(`A disposition of "${disposition ?? ''}" is not in either schema.`);
    if (disposition === 'pass' && schema !== 'rfc9990') odd.add('A disposition of "pass" is RFC 9990 wording in an RFC 7489-style report.');
    for (const [k, v] of [['dkim', dkimAligned], ['spf', spfAligned]]) if (!ALIGNED.includes(v)) odd.add(`A policy_evaluated ${k} of "${v ?? ''}" is not pass or fail.`);
    const reasons = kids(pe, 'reason').map((x) => ({ type: low(val(x, 'type')), comment: val(x, 'comment') }));
    const dkim = auth ? kids(auth, 'dkim').map((d) => ({ domain: low(val(d, 'domain')), selector: val(d, 'selector'), result: low(val(d, 'result')), human: val(d, 'human_result') || null })) : [];
    const spf = auth ? kids(auth, 'spf').map((s) => ({ domain: low(val(s, 'domain')), scope: low(val(s, 'scope')), result: low(val(s, 'result')), human: val(s, 'human_result') || null })) : [];
    for (const d of dkim) if (d.result && !DKIM_RESULTS.includes(d.result)) odd.add(`A DKIM result of "${d.result}" is not in the schema.`);
    for (const s of spf) {
      if (s.result && !SPF_RESULTS.includes(s.result)) odd.add(`An SPF result of "${s.result}" is not in the schema.`);
      if (s.scope === 'helo') odd.add('Some SPF results have scope "helo": DMARC uses only the MAIL FROM identity (RFC 9990 3.1.1.13), so those rows say little about your domain.');
    }
    if (dkim.some((d) => d.selector === null) && schema === 'rfc9990') odd.add('A DKIM result has no selector, which RFC 9990 requires.');
    return {
      ip: parsed ? parsed.text : (ip ?? ''),
      count: count ?? 0,
      disposition,
      dkimAligned,
      spfAligned,
      dmarc: dkimAligned === 'pass' || spfAligned === 'pass' ? 'pass' : 'fail',
      reasons,
      headerFrom: low(val(ids, 'header_from')),
      envelopeFrom: low(val(ids, 'envelope_from')),
      envelopeTo: low(val(ids, 'envelope_to')),
      dkim,
      spf,
    };
  });
  warnings.push(...odd);
  return {
    file,
    schema,
    namespace: ns,
    version: val(root, 'version'),
    metadata,
    policy,
    hasExtension: Boolean(kid(root, 'extension')),
    records,
    warnings,
  };
}

// ---------- why a source failed ----------

const notYours = (d, policyDomain) => d && policyDomain && !endsWithDomain(d, policyDomain) && !endsWithDomain(policyDomain, d);

// The reason a record failed (or how it passed), in a code and plain words. Uses only what the
// receiver reported: its aligned verdicts (policy_evaluated) and the raw results (auth_results).
export function explainRecord(rec, policyDomain) {
  const from = rec.headerFrom || policyDomain;
  const dkimPass = rec.dkim.filter((d) => d.result === 'pass');
  const dkimOther = dkimPass.filter((d) => notYours(d.domain, from));
  const dkimOwnFail = rec.dkim.filter((d) => d.result !== 'pass' && d.domain && !notYours(d.domain, from));
  const spfMain = rec.spf.find((s) => s.scope !== 'helo') ?? rec.spf[0] ?? null;
  const reasonWords = rec.reasons.filter((r) => r.type).map((r) => `${r.type}: ${REASON_TYPES[r.type] ?? 'a reason outside the schema'}${r.comment ? ` ("${r.comment}")` : ''}`);
  if (rec.dmarc === 'pass') {
    const via = rec.dkimAligned === 'pass' && rec.spfAligned === 'pass' ? 'both' : rec.dkimAligned === 'pass' ? 'dkim' : 'spf';
    const words = { both: 'Passed: aligned DKIM and aligned SPF.', dkim: 'Passed on aligned DKIM.', spf: 'Passed on aligned SPF only: forwarding will break this mail, because SPF does not survive a forward. Sign it with DKIM for your domain.' }[via];
    return { code: `pass-${via}`, words, fix: via === 'spf' ? `Turn on DKIM signing with d=${from} at this sender.` : null, overrides: reasonWords };
  }
  // DMARC failed: both aligned checks failed.
  const parts = [];
  let code;
  let fix;
  if (dkimOther.length && spfMain?.result === 'pass' && notYours(spfMain.domain, from)) {
    code = 'third-party-not-aligned';
    parts.push(`DKIM passed for d=${dkimOther.map((d) => d.domain).join(', d=')} and SPF passed for ${spfMain.domain}, but neither is ${from}, so neither aligns.`);
    fix = `Set up the sender's custom DKIM so it signs with d=${from} (or a subdomain), or a custom MAIL FROM (return-path) under ${from}.`;
  } else if (dkimOther.length) {
    code = 'dkim-not-aligned';
    parts.push(`DKIM passed, but for d=${dkimOther.map((d) => d.domain).join(', d=')}, not ${from}.`);
    fix = `Set up custom DKIM at the sender so it signs with d=${from}.`;
  } else if (spfMain?.result === 'pass' && notYours(spfMain.domain, from)) {
    code = 'spf-not-aligned';
    parts.push(`SPF passed, but for ${spfMain.domain} (the bounce address domain), not ${from}, and there was no passing DKIM signature for ${from}.`);
    fix = `Turn on DKIM signing with d=${from} at the sender, or set a custom MAIL FROM (return-path) under ${from}.`;
  } else if (dkimOwnFail.length) {
    code = 'dkim-broken';
    parts.push(`A DKIM signature for ${dkimOwnFail[0].domain} did not verify (${dkimOwnFail[0].result}), and SPF did not pass for ${from}. The message was probably changed on the way (forwarding, a mailing list, a security gateway) or the published key does not match.`);
    fix = 'If this is a forwarder or list, nothing to fix on your side. If it is your own sender, check that the DKIM public key in DNS matches the selector it signs with.';
  } else if (spfMain && ['temperror', 'permerror'].includes(spfMain.result)) {
    code = 'spf-error';
    parts.push(`SPF returned ${spfMain.result} for ${spfMain.domain}${spfMain.result === 'permerror' ? ' (often more than 10 DNS lookups or a syntax error in the record)' : ' (a DNS failure at check time)'}, and there was no passing DKIM signature.`);
    fix = spfMain.result === 'permerror' ? `Count the lookups in ${spfMain.domain}'s SPF record and fix it.` : 'Usually temporary; watch the next reports.';
  } else {
    code = rec.dkim.length ? 'not-authorized' : 'no-dkim';
    const spfWords = spfMain ? `SPF ${spfMain.result ?? 'gave no result'} for ${spfMain.domain}` : 'no SPF result';
    parts.push(`${rec.dkim.length ? 'No DKIM signature passed' : 'The mail was not DKIM-signed'}, and ${spfWords}: this IP is not authorized to send as ${from}.`);
    fix = `If this is a service you use, add it to ${from}'s SPF record and turn on its DKIM signing. If you do not recognise it, it may be spoofing or a forwarder; your DMARC policy is what protects you.`;
  }
  if (reasonWords.length) parts.push(`The receiver gave a reason: ${reasonWords.join('; ')}.`);
  return { code, words: parts.join(' '), fix, overrides: reasonWords };
}

// ---------- analysing reports ----------

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const day = (iso) => (iso ? iso.slice(0, 10) : 'an unknown date');
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

export function dateRangeWords(meta) {
  if (!meta.beginUtc || !meta.endUtc) return 'an unknown period';
  const a = day(meta.beginUtc);
  const lastSecond = meta.end % 86400 === 0 && meta.end > meta.begin ? meta.end - 1 : meta.end;
  const b = day(isoUtc(lastSecond));
  return a === b ? `${a} (UTC)` : `${a} to ${b} (UTC)`;
}

// Groups a report's records by sending source. A source is a named service (all its IPs together)
// or, when nothing names it, one IP.
export function sourcesOf(report, index) {
  const map = new Map();
  for (const rec of report.records) {
    const who = identify(index, { ip: rec.ip, dkim: rec.dkim, spf: rec.spf });
    const key = who.services.length ? `svc:${who.services.map((s) => s.id).join('+')}` : `ip:${rec.ip}`;
    let s = map.get(key);
    if (!s) {
      s = { key, name: who.name, services: who.services, confidence: who.confidence, hostedAt: who.hostedAt, ips: [], messages: 0, passed: 0, failed: 0, dispositions: {}, headerFroms: [], dkimDomains: [], spfDomains: [], reasons: {}, evidence: [], rows: [] };
      map.set(key, s);
    }
    if (!s.ips.includes(rec.ip)) s.ips.push(rec.ip);
    s.messages += rec.count;
    if (rec.dmarc === 'pass') s.passed += rec.count; else s.failed += rec.count;
    s.dispositions[rec.disposition] = (s.dispositions[rec.disposition] ?? 0) + rec.count;
    if (rec.headerFrom && !s.headerFroms.includes(rec.headerFrom)) s.headerFroms.push(rec.headerFrom);
    for (const d of rec.dkim) { const t = `${d.domain}:${d.result}`; if (d.domain && !s.dkimDomains.includes(t)) s.dkimDomains.push(t); }
    for (const x of rec.spf) { const t = `${x.domain}:${x.result}`; if (x.domain && !s.spfDomains.includes(t)) s.spfDomains.push(t); }
    for (const e of who.evidence) if (!s.evidence.some((x) => x.detail === e.detail) && s.evidence.length < 6) s.evidence.push(e);
    const why = explainRecord(rec, report.policy.domain);
    const r = s.reasons[why.code] ?? (s.reasons[why.code] = { code: why.code, messages: 0, words: why.words, fix: why.fix });
    r.messages += rec.count;
    s.rows.push({ ip: rec.ip, count: rec.count, dmarc: rec.dmarc, disposition: rec.disposition, dkimAligned: rec.dkimAligned, spfAligned: rec.spfAligned, headerFrom: rec.headerFrom, envelopeFrom: rec.envelopeFrom, envelopeTo: rec.envelopeTo, dkim: rec.dkim, spf: rec.spf, reason: why.code, overrides: why.overrides });
  }
  const list = [...map.values()].map((s) => {
    const reasons = Object.values(s.reasons).sort((a, b) => b.messages - a.messages || a.code.localeCompare(b.code));
    const main = reasons.find((r) => !r.code.startsWith('pass')) ?? reasons[0];
    const status = s.failed === 0 ? 'pass' : s.passed === 0 ? 'fail' : 'mixed';
    return {
      ...s,
      label: s.name ?? (s.hostedAt ? `A server at ${s.hostedAt.name} (${s.ips[0]})` : `Unnamed (${s.ips[0]})`),
      status,
      passRate: pct(s.passed, s.messages),
      reasons,
      reason: main.words,
      fix: main.fix,
      rows: s.rows.sort((a, b) => b.count - a.count || a.ip.localeCompare(b.ip)),
    };
  });
  return list.sort((a, b) => b.failed - a.failed || b.messages - a.messages || a.label.localeCompare(b.label));
}

function answerFor(report, sources) {
  const total = sources.reduce((a, s) => a + s.messages, 0);
  const failed = sources.reduce((a, s) => a + s.failed, 0);
  const who = report.metadata.orgName || 'the reporter';
  const head = `This report from ${who} covers ${dateRangeWords(report.metadata)} for ${report.policy.domain}: ${plural(total, 'message')} from ${plural(sources.length, 'source')}`;
  if (!failed) return `${head}; all of them passed DMARC.`;
  const worst = sources.find((s) => s.failed);
  const where = worst.name ? `${worst.name} (${worst.ips.slice(0, 2).join(', ')}${worst.ips.length > 2 ? ` and ${worst.ips.length - 2} more` : ''})` : worst.hostedAt ? `a server at ${worst.hostedAt.name}, ${worst.ips[0]}` : `an unnamed source at ${worst.ips[0]}`;
  const failing = sources.filter((s) => s.failed).length;
  const lead = worst.reasons.find((r) => !r.code.startsWith('pass'));
  return `${head}; ${plural(failed, 'message')} (${pct(failed, total)}%) failed DMARC from ${plural(failing, 'source')}. The largest is ${where}, ${plural(worst.failed, 'failing message')}: ${lowerFirst(lead.words)}`;
}
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) && !/^(DKIM|SPF|DMARC)/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

const POLICY_WORDS = { none: 'p=none (monitor only)', quarantine: 'p=quarantine (failing mail goes to spam)', reject: 'p=reject (failing mail is refused)' };

// One report, analysed. reporters: the list of known reporters, to say who sent it and its known quirks.
export function analyzeReport(report, index, reporters = []) {
  const sources = sourcesOf(report, index);
  const total = sources.reduce((a, s) => a + s.messages, 0);
  const failed = sources.reduce((a, s) => a + s.failed, 0);
  const reporter = matchReporter(report.metadata, reporters);
  const dispositions = {};
  for (const r of report.records) dispositions[r.disposition] = (dispositions[r.disposition] ?? 0) + r.count;
  const policyWords = POLICY_WORDS[report.policy.p] ?? `p=${report.policy.p ?? 'missing'}`;
  return {
    file: report.file,
    answer: answerFor(report, sources),
    reporter: { orgName: report.metadata.orgName, email: report.metadata.email, known: reporter ? { id: reporter.id, name: reporter.name, page: reporter.page } : null },
    schema: report.schema,
    namespace: report.namespace,
    reportId: report.metadata.reportId,
    period: { begin: report.metadata.beginUtc, end: report.metadata.endUtc, days: report.metadata.days, words: dateRangeWords(report.metadata) },
    policy: { ...report.policy, words: policyWords },
    totals: { messages: total, passed: total - failed, failed, passRate: pct(total - failed, total), sources: sources.length, failingSources: sources.filter((s) => s.failed).length, records: report.records.length, dispositions },
    sources: sources.map(({ key, rows, ...s }) => ({ ...s, rows: rows.slice(0, 50), moreRows: Math.max(0, rows.length - 50) })),
    errors: report.metadata.errors,
    warnings: report.warnings,
  };
}

export function matchReporter(meta, reporters) {
  const email = low(meta.email ?? '');
  const org = low(meta.orgName ?? '');
  return reporters.find((r) => r.emails.some((e) => email === e) || r.orgNames.some((o) => org === o.toLowerCase())) ?? null;
}

// Several reports combined by source name (or IP), across reporters.
export function combine(results) {
  const map = new Map();
  for (const r of results) {
    for (const s of r.sources) {
      const key = s.name ?? s.ips[0];
      const c = map.get(key) ?? { label: s.label, name: s.name, hostedAt: s.hostedAt, ips: [], messages: 0, passed: 0, failed: 0, reporters: [], reasons: {} };
      for (const ip of s.ips) if (!c.ips.includes(ip)) c.ips.push(ip);
      c.messages += s.messages; c.passed += s.passed; c.failed += s.failed;
      if (r.reporter.orgName && !c.reporters.includes(r.reporter.orgName)) c.reporters.push(r.reporter.orgName);
      for (const x of s.reasons) {
        if (x.code.startsWith('pass')) continue;
        const y = c.reasons[x.code] ?? (c.reasons[x.code] = { code: x.code, messages: 0, fix: x.fix });
        y.messages += x.messages;
      }
      map.set(key, c);
    }
  }
  const sources = [...map.values()].map((c) => ({ ...c, reasons: Object.values(c.reasons).sort((a, b) => b.messages - a.messages), passRate: pct(c.passed, c.messages) }))
    .sort((a, b) => b.failed - a.failed || b.messages - a.messages || a.label.localeCompare(b.label));
  const messages = sources.reduce((a, s) => a + s.messages, 0);
  const failed = sources.reduce((a, s) => a + s.failed, 0);
  const domains = [...new Set(results.map((r) => r.policy.domain))];
  const reporters = [...new Set(results.map((r) => r.reporter.orgName).filter(Boolean))];
  const worst = sources.find((s) => s.failed);
  const answer = `${plural(results.length, 'report')} from ${plural(reporters.length, 'reporter')} for ${domains.join(', ')}: ${plural(messages, 'message')}, ${failed.toLocaleString('en-US')} failed DMARC (${pct(failed, messages)}%)${worst ? `; the largest failing source is ${worst.name ?? lowerFirst(worst.label)} with ${plural(worst.failed, 'message')}` : ''}.`;
  return { answer, reports: results.length, domains, reporters, messages, failed, passRate: pct(messages - failed, messages), sources: sources.slice(0, 200), moreSources: Math.max(0, sources.length - 200) };
}

// The per-source table as CSV text (the page offers it as a download).
export function sourcesCsv(results) {
  const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = [['report', 'reporter', 'domain', 'period', 'source', 'confidence', 'ips', 'messages', 'passed', 'failed', 'reason', 'fix'].join(',')];
  for (const r of results) {
    for (const s of r.sources) {
      lines.push([r.reportId, r.reporter.orgName, r.policy.domain, r.period.words, s.label, s.confidence, s.ips.join(' '), s.messages, s.passed, s.failed, s.failed ? s.reason : 'passed', s.failed ? s.fix ?? '' : ''].map(q).join(','));
    }
  }
  return `${lines.join('\n')}\n`;
}
