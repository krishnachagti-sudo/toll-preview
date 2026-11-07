// The sitemap validator's rules: an XML reader that keeps going after an error it can recover
// from, the sitemaps.org schema (urlset and sitemapindex), the 50,000 URL and 50MB limits, lastmod
// dates (format, and a labelled sanity heuristic), the URL scope rules, Google's image and news
// extensions, text sitemaps, robots.txt (RFC 9309, run against every listed URL), the robots meta
// tag, X-Robots-Tag and rel=canonical of a fetched page, and the verdict, answer line and CSV.
// Pure and dependency-free: the page loads this same file. Fetching (with the address guard, time
// budget and size caps) is in net.js, server only.
//
// Rules come from the sitemaps.org protocol and XSD, Google Search Central's sitemap pages and the
// Search Console Sitemaps report help, read on the date in data/rules.json. The issue codes below
// carry the Search Console name where Google has one, so an answer reads in the words the user saw.

export const ENGINE_VERSION = 'sitemap-validator-1';

export class SitemapError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'SitemapError';
    this.field = field;
  }
}

// ---------- limits ----------

export const LIMITS = {
  urls: 50_000, // <url> entries in one sitemap (sitemaps.org; Google)
  sitemaps: 50_000, // <sitemap> entries in one index
  bytes: 52_428_800, // 50MB, uncompressed (sitemaps.org gives the byte count)
  locMax: 2048, // sitemaps.org: "must be less than 2,048 characters"
  locMin: 12, // sitemaps.org XSD: minLength 12
  newsTags: 1000, // Google: up to 1,000 news:news tags in one sitemap
  newsDays: 2, // Google: only articles created in the last two days
  imagesPerUrl: 1000, // Google: up to 1,000 image:image tags in one <url>
  examples: 200, // examples kept per issue per file (the count is always complete)
};

// What one call may do. The page and tool.js share these.
export const CALL = {
  maxSitemaps: 50, // child sitemaps read from an index in one call
  live: 250, // listed URLs checked live in one call
  freeWebSitemaps: 10, // a web run reading at most this many child sitemaps...
  freeWebLive: 10, // ...and checking at most this many URLs live is free
  pasteChars: 5_000_000,
};

export const NS = {
  sitemap: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  image: 'http://www.google.com/schemas/sitemap-image/1.1',
  news: 'http://www.google.com/schemas/sitemap-news/0.9',
  video: 'http://www.google.com/schemas/sitemap-video/1.1',
  xhtml: 'http://www.w3.org/1999/xhtml',
};

// ---------- issues ----------

// severity: error (breaks a rule; Search Console reports it or drops the URL), warning (allowed but
// likely to cause trouble), note (worth knowing; strict-schema only, or a heuristic).
// gsc: the name the Search Console Sitemaps report uses, where it has one.
export const ISSUES = {
  'fetch-failed': { severity: 'error', gsc: "Couldn't fetch", title: 'The sitemap could not be downloaded' },
  'http-status': { severity: 'error', gsc: 'HTTP error / General HTTP error', title: 'The sitemap URL does not answer 200' },
  'blocked-address': { severity: 'error', gsc: null, title: 'The address is private, local or reserved, so it was not fetched' },
  'robots-blocks-sitemap': { severity: 'error', gsc: "Couldn't fetch (blocked by robots.txt)", title: 'robots.txt blocks Googlebot from the sitemap itself' },
  'robots-unreachable': { severity: 'error', gsc: null, title: 'robots.txt answers with a server error, so crawlers must assume everything is disallowed' },
  redirected: { severity: 'warning', gsc: null, title: 'The sitemap URL redirects; submit the final address' },
  'html-not-xml': { severity: 'error', gsc: 'Unsupported format', title: 'An HTML page came back instead of a sitemap' },
  'compression-error': { severity: 'error', gsc: 'Compression error', title: 'The gzip file could not be uncompressed' },
  'too-large': { severity: 'error', gsc: 'Sitemap file size error', title: 'Over 50MB (52,428,800 bytes) uncompressed' },
  'not-utf8': { severity: 'error', gsc: null, title: 'The file is not UTF-8' },
  'leading-whitespace': { severity: 'warning', gsc: 'Leading whitespace', title: 'Text or whitespace before the XML declaration' },
  'xml-error': { severity: 'error', gsc: 'Parsing error', title: 'The XML is not well-formed' },
  'unescaped-ampersand': { severity: 'error', gsc: 'Parsing error', title: 'A bare & that is not escaped as &amp;' },
  'unknown-entity': { severity: 'error', gsc: 'Parsing error', title: 'An entity XML does not define, such as &nbsp;' },
  'curly-quotes': { severity: 'error', gsc: 'Unsupported format', title: 'An attribute in curly quotes instead of straight quotes' },
  doctype: { severity: 'warning', gsc: null, title: 'A DOCTYPE declaration, which a sitemap does not need' },
  'wrong-root': { severity: 'error', gsc: 'Unsupported format', title: 'The root element is not <urlset> or <sitemapindex>' },
  namespace: { severity: 'error', gsc: 'Incorrect namespace', title: 'The sitemap namespace is missing or wrong' },
  'extension-namespace': { severity: 'warning', gsc: 'Incorrect namespace', title: 'An image, news or video prefix is bound to the wrong namespace' },
  'unexpected-tag': { severity: 'error', gsc: 'Invalid tag', title: 'A sitemap tag in a place the schema does not allow' },
  'missing-loc': { severity: 'error', gsc: 'Missing XML tag', title: 'An entry with no <loc>' },
  'duplicate-tag': { severity: 'error', gsc: 'Invalid XML: too many tags', title: 'The same tag twice in one entry' },
  'tag-order': { severity: 'note', gsc: null, title: 'Tags out of the schema order (only a strict XSD validator minds)' },
  'empty-sitemap': { severity: 'warning', gsc: 'Empty sitemap', title: 'No URLs listed' },
  'too-many-urls': { severity: 'error', gsc: 'Too many URLs', title: 'More than 50,000 URLs' },
  'too-many-sitemaps': { severity: 'error', gsc: 'Too many sitemaps', title: 'More than 50,000 sitemaps in the index' },
  'nested-index': { severity: 'error', gsc: 'Incorrect sitemap index format: Nested sitemap indexes', title: 'A sitemap index lists another index, or itself' },
  'relative-url': { severity: 'error', gsc: 'Invalid URL', title: 'A relative URL; sitemaps need full absolute URLs' },
  'invalid-url': { severity: 'error', gsc: 'Invalid URL', title: 'A URL that is not valid (scheme, spaces, quotes or brackets)' },
  'not-escaped': { severity: 'warning', gsc: null, title: 'Characters that should be percent-encoded' },
  'loc-too-long': { severity: 'error', gsc: 'Invalid URL', title: 'A URL of 2,048 characters or more' },
  'loc-too-short': { severity: 'note', gsc: null, title: 'A URL shorter than the XSD minimum of 12 characters' },
  'url-not-allowed': { severity: 'error', gsc: 'URL not allowed', title: 'A URL on another host, protocol or port than the sitemap' },
  'path-mismatch-www': { severity: 'error', gsc: 'Path mismatch: Missing www / Includes www', title: 'www and the bare domain mixed between the sitemap and its URLs' },
  'outside-directory': { severity: 'warning', gsc: 'URL not allowed', title: 'A URL above or beside the sitemap\'s folder' },
  'duplicate-url': { severity: 'warning', gsc: null, title: 'The same URL listed more than once' },
  'invalid-date': { severity: 'error', gsc: 'Invalid date', title: 'A date that is not W3C Datetime, or not a real date' },
  'time-without-seconds': { severity: 'note', gsc: null, title: 'A time without seconds (fine for Google; the XSD wants seconds)' },
  'future-lastmod': { severity: 'warning', gsc: null, title: 'lastmod in the future (sanity check)' },
  'same-lastmod': { severity: 'warning', gsc: null, title: 'Nearly every URL has the same lastmod (sanity check)' },
  'lastmod-is-today': { severity: 'warning', gsc: null, title: 'Nearly every lastmod is the day of the check (sanity check)' },
  'lastmod-after-file': { severity: 'warning', gsc: null, title: 'lastmod later than the sitemap file itself was modified (sanity check)' },
  'invalid-changefreq': { severity: 'error', gsc: 'Invalid tag value', title: 'A changefreq that is not one of the seven values' },
  'invalid-priority': { severity: 'error', gsc: 'Invalid tag value', title: 'A priority outside 0.0 to 1.0' },
  'ignored-tags': { severity: 'note', gsc: null, title: 'Google ignores <priority> and <changefreq>' },
  'image-missing-loc': { severity: 'error', gsc: 'Missing XML tag', title: 'An <image:image> without <image:loc>' },
  'too-many-images': { severity: 'error', gsc: null, title: 'More than 1,000 images in one <url>' },
  'image-deprecated': { severity: 'note', gsc: null, title: 'Image tags Google removed from its documentation' },
  'too-many-news': { severity: 'error', gsc: 'Too many News URLs', title: 'More than 1,000 <news:news> tags' },
  'news-missing-tag': { severity: 'error', gsc: 'Missing <publication> tag / Missing XML tag', title: 'A news entry without a required tag' },
  'news-twice': { severity: 'error', gsc: null, title: 'More than one <news:news> in one <url>' },
  'news-language': { severity: 'warning', gsc: null, title: 'A news language that is not an ISO 639 code' },
  'news-stale': { severity: 'warning', gsc: null, title: 'News articles older than two days' },
  'video-not-checked': { severity: 'note', gsc: null, title: 'Video entries are counted but not checked' },
  'text-not-url': { severity: 'error', gsc: null, title: 'A line in a text sitemap that is not a URL' },
  'text-extension': { severity: 'note', gsc: null, title: 'A text sitemap without a .txt name' },
  feed: { severity: 'note', gsc: null, title: 'An RSS or Atom feed, not an XML sitemap' },
  'robots-blocks-urls': { severity: 'error', gsc: 'Sitemap contains urls which are blocked by robots.txt', title: 'Listed URLs that robots.txt blocks for Googlebot' },
  'not-read': { severity: 'note', gsc: null, title: 'Child sitemaps not read in this call' },
};
export const SEVERITY_ORDER = ['error', 'warning', 'note'];
const ISSUE_ORDER = Object.keys(ISSUES);
const byIssueOrder = (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) || ISSUE_ORDER.indexOf(a.code) - ISSUE_ORDER.indexOf(b.code);

// Adds an issue to a file report already judged (robots.txt results, children not read), in order.
export function withIssue(file, code, examples = [], count = examples.length || 1) {
  const it = { code, severity: ISSUES[code].severity, gsc: ISSUES[code].gsc, title: ISSUES[code].title, count, examples: examples.slice(0, LIMITS.examples) };
  file.issues = [...(file.issues ?? []).filter((x) => x.code !== code), it].sort(byIssueOrder);
  return file;
}

// Collects issues for one file: a count per code and the first LIMITS.examples examples.
export function issueBag() {
  const map = new Map();
  return {
    add(code, example = null, n = 1) {
      if (!ISSUES[code]) throw new Error(`unknown issue code ${code}`);
      let it = map.get(code);
      if (!it) { it = { code, severity: ISSUES[code].severity, gsc: ISSUES[code].gsc, title: ISSUES[code].title, count: 0, examples: [] }; map.set(code, it); }
      it.count += n;
      if (example && it.examples.length < LIMITS.examples) it.examples.push(example);
      return it;
    },
    has: (code) => map.has(code),
    get: (code) => map.get(code) ?? null,
    list: () => [...map.values()].sort(byIssueOrder),
  };
}

// ---------- the XML reader ----------

const NAME_START = /[A-Za-z_:À-￿]/;
const NAME_RE = /^[A-Za-z_:À-￿][A-Za-z0-9_:.\-·À-￿]*$/;
const PREDEFINED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

// Line numbers, counted from the last position asked for (forwards or backwards), so a read of a
// large file counts each newline about once.
function lineCounter(text) {
  let pos = 0;
  let line = 1;
  return (at) => {
    if (at >= pos) {
      let i = text.indexOf('\n', pos);
      while (i !== -1 && i < at) { line++; i = text.indexOf('\n', i + 1); }
    } else {
      let i = text.lastIndexOf('\n', pos - 1);
      while (i !== -1 && i >= at) { line--; i = i > 0 ? text.lastIndexOf('\n', i - 1) : -1; }
    }
    pos = at;
    return line;
  };
}

// Decodes the entities in a run of text or an attribute value; reports bare & and unknown entities.
function decodeEntities(raw, at, report) {
  if (raw.indexOf('&') === -1) return raw;
  let out = '';
  let i = 0;
  for (;;) {
    const amp = raw.indexOf('&', i);
    if (amp === -1) { out += raw.slice(i); return out; }
    out += raw.slice(i, amp);
    const semi = raw.indexOf(';', amp);
    const ref = semi === -1 || semi - amp > 12 ? null : raw.slice(amp + 1, semi);
    if (ref && /^[A-Za-z][A-Za-z0-9]*$/.test(ref)) {
      if (PREDEFINED[ref] !== undefined) out += PREDEFINED[ref];
      else { report('unknown-entity', `&${ref};`, at + amp); out += `&${ref};`; }
      i = semi + 1;
    } else if (ref && /^#[0-9]+$/.test(ref)) {
      out += safeCodePoint(Number(ref.slice(1))); i = semi + 1;
    } else if (ref && /^#x[0-9a-fA-F]+$/.test(ref)) {
      out += safeCodePoint(parseInt(ref.slice(2), 16)); i = semi + 1;
    } else {
      report('unescaped-ampersand', raw.length <= 140 ? raw.trim() : `...${raw.slice(Math.max(0, amp - 60), amp + 40)}...`, at + amp);
      out += '&';
      i = amp + 1;
    }
  }
}
const safeCodePoint = (n) => (n > 0 && n <= 0x10FFFF ? String.fromCodePoint(n) : '�');

function parseAttributes(src, at, report) {
  const attrs = [];
  const re = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([“”‘’][^\s>]*)|([^\s"'>]+))/g;
  let m;
  let used = 0;
  const seen = new Set();
  while ((m = re.exec(src))) {
    if (src.slice(used, m.index).trim()) report('xml-error', `cannot read "${src.slice(used, m.index).trim().slice(0, 40)}" in a tag`, at);
    used = re.lastIndex;
    const name = m[1];
    if (m[4] !== undefined) { report('curly-quotes', `${name}=${m[4].slice(0, 60)}`, at); continue; }
    if (m[5] !== undefined) report('xml-error', `the value of ${name} is not in quotes`, at);
    const raw = m[2] ?? m[3] ?? m[5] ?? '';
    if (raw.includes('<')) report('xml-error', `a < inside the value of ${name}`, at);
    if (seen.has(name)) report('xml-error', `the attribute ${name} appears twice`, at);
    seen.add(name);
    attrs.push({ name, value: decodeEntities(raw, at, report) });
  }
  if (src.slice(used).trim()) report('xml-error', `cannot read "${src.slice(used).trim().slice(0, 40)}" in a tag`, at);
  return attrs;
}

// Reads XML as a stream of events: h.open({ name, local, prefix, uri, attrs, line }), h.text(text,
// line), h.close(name, line). Problems go to h.problem(code, detail, line); a structural error
// (a close tag that does not match, a second root) stops the read: { stoppedAt }.
// Returns { decl, root, stoppedAt, depthAtEnd }.
export function readXml(text, h, { truncated = false } = {}) {
  const lineOf = lineCounter(text);
  const report = (code, detail, at) => h.problem(code, detail, lineOf(at));
  const out = { decl: null, root: null, stoppedAt: null, depthAtEnd: 0, rootCount: 0 };
  let i = 0;
  if (text.charCodeAt(0) === 0xFEFF) i = 1;
  // Text before the XML declaration (Search Console: "Leading whitespace").
  const firstLt = text.indexOf('<', i);
  if (firstLt > i) {
    const lead = text.slice(i, firstLt);
    if (!lead.trim()) {
      if (text.startsWith('<?xml', firstLt)) report('leading-whitespace', `${lead.length} whitespace character${lead.length === 1 ? '' : 's'} before <?xml`, i);
    } else {
      report('xml-error', `text before the first tag: "${lead.trim().slice(0, 40)}"`, i);
    }
  }
  const stack = [];
  const scopes = [{ '': '', xml: 'http://www.w3.org/XML/1998/namespace' }];
  const stop = (code, detail, at) => { report(code, detail, at); out.stoppedAt = lineOf(at); };
  let afterRoot = false;
  while (i < text.length) {
    const lt = text.indexOf('<', i);
    const end = lt === -1 ? text.length : lt;
    if (end > i) {
      const raw = text.slice(i, end);
      if (stack.length) {
        const ln = lineOf(i);
        h.text(decodeEntities(raw, i, report), ln);
      } else if (raw.trim()) {
        report('xml-error', `text outside the root element: "${raw.trim().slice(0, 40)}"`, i);
      }
    }
    if (lt === -1) break;
    i = lt;
    if (text.startsWith('<!--', i)) {
      const close = text.indexOf('-->', i + 4);
      if (close === -1) { if (!truncated) stop('xml-error', 'a comment <!-- that never closes', i); break; }
      i = close + 3;
      continue;
    }
    if (text.startsWith('<![CDATA[', i)) {
      const close = text.indexOf(']]>', i + 9);
      if (close === -1) { if (!truncated) stop('xml-error', 'a <![CDATA[ section that never closes', i); break; }
      if (stack.length) h.text(text.slice(i + 9, close), lineOf(i));
      else report('xml-error', 'a CDATA section outside the root element', i);
      i = close + 3;
      continue;
    }
    if (text.startsWith('<!DOCTYPE', i) || text.startsWith('<!doctype', i)) {
      report('doctype', text.slice(i, i + 60).split('\n')[0], i);
      let depth = 0;
      let j = i + 9;
      for (; j < text.length; j++) {
        const c = text[j];
        if (c === '[') depth++;
        else if (c === ']') depth--;
        else if (c === '>' && depth <= 0) break;
      }
      i = j + 1;
      continue;
    }
    if (text.startsWith('<?', i)) {
      const close = text.indexOf('?>', i + 2);
      if (close === -1) { if (!truncated) stop('xml-error', 'a <? instruction that never closes', i); break; }
      const body = text.slice(i + 2, close);
      if (/^xml(\s|$)/.test(body)) {
        const before = text.slice(text.charCodeAt(0) === 0xFEFF ? 1 : 0, i);
        if (out.decl || before.trim() || stack.length || out.rootCount) report('xml-error', 'the <?xml declaration is not at the start of the file', i);
        const attrs = Object.fromEntries(parseAttributes(body.slice(3), i, report).map((a) => [a.name, a.value]));
        out.decl = { version: attrs.version ?? null, encoding: attrs.encoding ?? null, line: lineOf(i) };
      }
      i = close + 2;
      continue;
    }
    if (text[i + 1] === '/') {
      const close = text.indexOf('>', i + 2);
      if (close === -1) { if (!truncated) stop('xml-error', 'a closing tag that never ends', i); break; }
      const name = text.slice(i + 2, close).trim();
      const top = stack[stack.length - 1];
      if (!top) { stop('xml-error', `</${name}> closes nothing`, i); break; }
      if (top.name !== name) { stop('xml-error', `</${name}> where </${top.name}> (opened on line ${top.line}) should close first`, i); break; }
      stack.pop();
      scopes.pop();
      h.close(top, lineOf(i));
      if (!stack.length) afterRoot = true;
      i = close + 1;
      continue;
    }
    // A bare < in text (it must be written &lt;): reported, kept as text, and the read goes on.
    if (!NAME_START.test(text[i + 1] ?? '')) {
      report('xml-error', `a bare < in text near "${text.slice(i, i + 30).split('\n')[0]}" (write &lt;)`, i);
      if (stack.length) h.text('<', lineOf(i));
      i += 1;
      continue;
    }
    // A start tag. Find its end, skipping > inside quoted values.
    let j = i + 1;
    let quote = null;
    for (; j < text.length; j++) {
      const c = text[j];
      if (quote) { if (c === quote) quote = null; } else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
      else if (c === '<') break;
    }
    if (j >= text.length) { if (!truncated) stop('xml-error', 'a tag that never ends', i); break; }
    if (text[j] === '<') { stop('xml-error', `a < inside the tag starting "${text.slice(i, Math.min(j, i + 40))}"`, i); break; }
    const selfClosing = text[j - 1] === '/';
    const inner = text.slice(i + 1, selfClosing ? j - 1 : j);
    const nm = /^[^\s/>]+/.exec(inner);
    if (!nm || !NAME_RE.test(nm[0])) {
      report('xml-error', `"<${inner.slice(0, 30)}" is not a tag (write &lt; for a < in text)`, i);
      if (stack.length) h.text('<', lineOf(i));
      i += 1;
      continue;
    }
    const name = nm[0];
    if (afterRoot) { stop('xml-error', `a second root element <${name}> after the first one closed`, i); break; }
    const attrs = parseAttributes(inner.slice(name.length), i, report);
    const scope = { ...scopes[scopes.length - 1] };
    for (const a of attrs) {
      if (a.name === 'xmlns') scope[''] = a.value;
      else if (a.name.startsWith('xmlns:')) scope[a.name.slice(6)] = a.value;
    }
    const colon = name.indexOf(':');
    const prefix = colon === -1 ? '' : name.slice(0, colon);
    const local = colon === -1 ? name : name.slice(colon + 1);
    let uri = scope[prefix];
    if (uri === undefined) { report('xml-error', `the prefix "${prefix}:" in <${name}> is not declared (xmlns:${prefix}="...")`, i); uri = `undeclared:${prefix}`; }
    const el = { name, local, prefix, uri, attrs, line: lineOf(i), scope };
    if (!stack.length) { out.root = el; out.rootCount++; }
    h.open(el);
    if (selfClosing) {
      h.close(el, el.line);
      if (!stack.length) afterRoot = true;
    } else {
      stack.push(el);
      scopes.push(scope);
    }
    i = j + 1;
  }
  out.depthAtEnd = stack.length;
  if (stack.length && !out.stoppedAt && !truncated) {
    report('xml-error', `the file ends before </${stack[0].name}> closes${stack.length > 1 ? ` (and ${stack.length - 1} more open tag${stack.length > 2 ? 's' : ''}, innermost <${stack[stack.length - 1].name}> from line ${stack[stack.length - 1].line})` : ''}`, text.length);
    out.stoppedAt = lineOf(text.length);
  }
  return out;
}

// ---------- URLs ----------

const HTTP_URL = /^https?:\/\//i;

// Reads the sitemap address as typed. A bare host ("example.com/sitemap.xml") is read as https://.
export function readSitemapUrl(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return { url: null, error: 'Give the sitemap\'s address, such as https://example.com/sitemap.xml.' };
  if (raw.length > LIMITS.locMax) return { url: null, error: `An address is at most ${LIMITS.locMax} characters.` };
  if (/\s/.test(raw)) return { url: null, error: 'The address has a space in it; write %20.' };
  let candidate = raw;
  if (!HTTP_URL.test(candidate)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(candidate) && !/^[^:/]+:\d+(\/|$)/.test(candidate)) return { url: null, error: 'Only http:// and https:// addresses can be fetched.' };
    candidate = `https://${candidate.replace(/^\/+/, '')}`;
  }
  let u;
  try { u = new URL(candidate); } catch { return { url: null, error: `"${raw.slice(0, 60)}" is not a web address.` }; }
  if (!u.hostname || (!u.hostname.includes('.') && !u.hostname.startsWith('['))) return { url: null, error: 'The address has no domain name.' };
  if (u.username || u.password) return { url: null, error: 'Addresses with a user name or password are not fetched.' };
  u.hash = '';
  return { url: u.href, error: null };
}

const BAD_URL_CHARS = /[\s"<>{}|\\^`]/;
const hasNonAscii = (s) => /[^\x00-\x7F]/.test(s);

// Judges one <loc> value (already entity-decoded). Returns { url, codes: [[code, detail]] }: url is
// the parsed absolute URL, or null when it cannot be used at all.
export function judgeLoc(value, { base = null, index = false } = {}) {
  const v = value.trim();
  const codes = [];
  if (!v) return { url: null, codes: [['missing-loc', '<loc> is empty']] };
  if (v.length >= LIMITS.locMax) codes.push(['loc-too-long', `${v.length} characters`]);
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) {
    let resolved = null;
    if (base) { try { resolved = new URL(v, base).href; } catch { /* left null */ } }
    codes.push(['relative-url', index ? `${v} (Google looks for it at ${resolved ?? 'the index\'s folder'})` : v]);
    return { url: null, codes };
  }
  if (!HTTP_URL.test(v)) { codes.push(['invalid-url', `${v.slice(0, 80)} (only http and https)`]); return { url: null, codes }; }
  if (BAD_URL_CHARS.test(v)) {
    const c = BAD_URL_CHARS.exec(v)[0];
    codes.push(['invalid-url', `${v.slice(0, 100)} (has ${/\s/.test(c) ? 'a space' : `the character ${c}`})`]);
    return { url: null, codes };
  }
  let u;
  try { u = new URL(v); } catch { codes.push(['invalid-url', v.slice(0, 100)]); return { url: null, codes }; }
  if (!u.hostname) { codes.push(['invalid-url', v.slice(0, 100)]); return { url: null, codes }; }
  if (v.length < LIMITS.locMin) codes.push(['loc-too-short', v]);
  if (hasNonAscii(v)) codes.push(['not-escaped', `${v.slice(0, 100)} (write ${u.href.slice(0, 100)})`]);
  return { url: u.href, codes };
}

// Scope: the same protocol, host and port as the sitemap (URL not allowed), with www mixed up named
// as Search Console does (Path mismatch), and the directory rule (a warning: Google waives it for
// sitemaps submitted in Search Console).
export function scopeOf(url, sitemapUrl) {
  if (!sitemapUrl) return null;
  const a = new URL(url);
  const s = new URL(sitemapUrl);
  if (a.host !== s.host) {
    const bare = (h) => h.replace(/^www\./, '');
    if (bare(a.host) === bare(s.host) && a.protocol === s.protocol) return ['path-mismatch-www', s.host.startsWith('www.') ? `${url} (no www; the sitemap is on ${s.host})` : `${url} (www; the sitemap is on ${s.host})`];
    return ['url-not-allowed', `${url} (another host than ${s.host})`];
  }
  if (a.protocol !== s.protocol) return ['url-not-allowed', `${url} (${a.protocol.slice(0, -1)}, the sitemap is ${s.protocol.slice(0, -1)})`];
  const dir = s.pathname.slice(0, s.pathname.lastIndexOf('/') + 1);
  if (!a.pathname.startsWith(dir)) return ['outside-directory', `${url} (outside ${dir})`];
  return null;
}

// ---------- dates ----------

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

// Reads a lastmod (or news publication date). Returns { ok, kind, time, error, note }:
// kind 'date' | 'datetime' | 'datetime-nosec'; time is ms since the epoch (a date alone is midnight
// UTC, as Google's help says); error says what is wrong in plain words.
export function parseW3cDate(value) {
  const s = String(value ?? '').trim();
  if (!s) return { ok: false, error: 'empty' };
  let m = /^(\d{4})-(\d{2})-(\d{2})(Z|[+-]\d{2}:\d{2})?$/.exec(s);
  let kind;
  let parts;
  if (m) {
    kind = 'date';
    parts = { y: +m[1], mo: +m[2], d: +m[3], h: 0, mi: 0, se: 0, tz: m[4] ?? 'Z' };
  } else {
    m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/.exec(s);
    if (!m) return { ok: false, error: whyNotW3c(s) };
    if (!m[8]) return { ok: false, error: 'a time without a time zone (add Z or an offset such as +00:00)' };
    kind = m[6] === undefined ? 'datetime-nosec' : 'datetime';
    parts = { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5], se: m[6] === undefined ? 0 : +m[6], frac: m[7] ? Number(m[7]) : 0, tz: m[8] };
  }
  if (parts.y < 1) return { ok: false, error: 'year 0000 is not a date' };
  if (parts.mo < 1 || parts.mo > 12) return { ok: false, error: `month ${String(parts.mo).padStart(2, '0')} does not exist` };
  const dim = parts.mo === 2 && leap(parts.y) ? 29 : DAYS[parts.mo - 1];
  if (parts.d < 1 || parts.d > dim) return { ok: false, error: `${s.slice(0, 10)} is not a real date (that month has ${dim} days)` };
  if (parts.h > 23 || parts.mi > 59 || parts.se > 59) return { ok: false, error: 'the time is out of range' };
  let offset = 0;
  if (parts.tz !== 'Z') {
    const tm = /^([+-])(\d{2}):(\d{2})$/.exec(parts.tz);
    if (+tm[2] > 14 || +tm[3] > 59) return { ok: false, error: `the time zone ${parts.tz} is out of range` };
    offset = (tm[1] === '+' ? 1 : -1) * (+tm[2] * 60 + +tm[3]);
  }
  const time = Date.UTC(parts.y, parts.mo - 1, parts.d, parts.h, parts.mi, parts.se) + Math.round((parts.frac ?? 0) * 1000) - offset * 60_000;
  return { ok: true, kind, time, error: null };
}

function whyNotW3c(s) {
  if (/^\d{4}$/.test(s) || /^\d{4}-\d{2}$/.test(s)) return 'only a year or month; the sitemap schema needs a full date (YYYY-MM-DD)';
  if (/^\d{4}-\d{2}-\d{2}[ ]\d{2}:\d{2}/.test(s)) return 'a space between date and time; use T, as in 2026-11-08T09:30:00+00:00';
  if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(s)) return 'slashes; use hyphens: YYYY-MM-DD';
  if (/^\d{1,2}[/.-]\d{1,2}[/.-]\d{4}/.test(s)) return 'day and month first; the format is YYYY-MM-DD';
  if (/^[A-Za-z]{3},? \d{1,2} [A-Za-z]{3}/.test(s)) return 'an email-style (RFC 822) date; use YYYY-MM-DD';
  if (/^\d{9,13}$/.test(s)) return 'a Unix timestamp; use YYYY-MM-DD';
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) return 'month and day need two digits each (2026-01-05)';
  if (/^\d{8}$/.test(s)) return 'no hyphens; write YYYY-MM-DD';
  return 'not W3C Datetime (YYYY-MM-DD, or YYYY-MM-DDThh:mm:ss with a time zone)';
}

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

// ---------- robots.txt (RFC 9309) ----------

// Parses robots.txt into groups { agents: [lowercase tokens], rules: [{ allow, path }] } and the
// Sitemap lines. Rules before the first user-agent line belong to no group and are ignored.
export function parseRobots(text) {
  const groups = [];
  const sitemaps = [];
  let current = null;
  let lastWasAgent = false;
  for (const rawLine of String(text ?? '').split(/\r\n|\r|\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    if (key === 'sitemap') { if (value) sitemaps.push(value); continue; }
    lastWasAgent = false;
    if ((key === 'allow' || key === 'disallow') && current) {
      if (key === 'disallow' && value === '') continue; // "Disallow:" with nothing allows all
      current.rules.push({ allow: key === 'allow', path: value });
    }
  }
  return { groups, sitemaps };
}

// The rules for one crawler: every group naming its token (merged), else the * group, else none.
export function rulesFor(robots, token = 'googlebot') {
  const t = token.toLowerCase();
  const named = robots.groups.filter((g) => g.agents.includes(t));
  const groups = named.length ? named : robots.groups.filter((g) => g.agents.includes('*'));
  return groups.flatMap((g) => g.rules);
}

// Percent-encoding normalised for comparison: unreserved characters decoded, hex upper case,
// other non-ASCII encoded (RFC 9309 2.2.2).
function normPath(p) {
  let s = '';
  try { s = encodeURI(p); } catch { s = p; }
  s = s.replace(/%25([0-9A-Fa-f]{2})/g, '%$1');
  return s.replace(/%([0-9A-Fa-f]{2})/g, (all, hex) => {
    const c = String.fromCharCode(parseInt(hex, 16));
    return /[A-Za-z0-9\-._~]/.test(c) ? c : `%${hex.toUpperCase()}`;
  });
}

function ruleMatches(pattern, path) {
  const anchored = pattern.endsWith('$');
  const body = normPath(anchored ? pattern.slice(0, -1) : pattern);
  const pieces = body.split('*');
  let pos = 0;
  for (let k = 0; k < pieces.length; k++) {
    const piece = pieces[k];
    if (k === 0) {
      if (!path.startsWith(piece)) return false;
      pos = piece.length;
      continue;
    }
    if (k === pieces.length - 1 && anchored) {
      if (path.length - piece.length < pos || !path.endsWith(piece)) return false;
      return true;
    }
    const at = path.indexOf(piece, pos);
    if (at === -1) return false;
    pos = at + piece.length;
  }
  return anchored ? pos === path.length : true;
}

// Is this URL allowed for the crawler? Longest matching rule wins; allow wins a tie; /robots.txt
// is always allowed. Returns { allowed, rule }.
export function robotsAllows(rules, url) {
  const u = new URL(url);
  const path = normPath(u.pathname + u.search);
  if (u.pathname === '/robots.txt') return { allowed: true, rule: null };
  let best = null;
  for (const r of rules) {
    if (!r.path) continue;
    if (!ruleMatches(r.path, path)) continue;
    const len = normPath(r.path).length;
    if (!best || len > best.len || (len === best.len && r.allow && !best.rule.allow)) best = { len, rule: r };
  }
  return { allowed: best ? best.rule.allow : true, rule: best ? `${best.rule.allow ? 'Allow' : 'Disallow'}: ${best.rule.path}` : null };
}

// What robots.txt means for a host from how it answered (RFC 9309 2.3.1): 2xx rules apply; 4xx
// means no rules; 5xx or no answer means crawlers must assume everything is disallowed.
export function robotsState(answer) {
  if (!answer) return { state: 'not-checked', rules: [], sitemaps: [] };
  if (answer.error) return { state: 'unreachable', rules: [], sitemaps: [], detail: answer.error };
  if (answer.status >= 500) return { state: 'unreachable', rules: [], sitemaps: [], detail: `HTTP ${answer.status}` };
  if (answer.status >= 400) return { state: 'none', rules: [], sitemaps: [], detail: `HTTP ${answer.status}` };
  if (answer.status >= 200 && answer.status < 300) {
    const parsed = parseRobots(answer.text ?? '');
    return { state: 'rules', rules: rulesFor(parsed, 'googlebot'), sitemaps: parsed.sitemaps };
  }
  return { state: 'none', rules: [], sitemaps: [], detail: `HTTP ${answer.status}` };
}

// ---------- the page side: robots meta, X-Robots-Tag, canonical ----------

const KNOWN_DIRECTIVES = new Set(['all', 'noindex', 'nofollow', 'none', 'nosnippet', 'indexifembedded', 'notranslate', 'noimageindex', 'unavailable_after', 'max-snippet', 'max-image-preview', 'max-video-preview', 'noarchive', 'nocache', 'noodp', 'noydir']);

// Does an X-Robots-Tag header value say noindex to Googlebot? A value may name a crawler
// ("googlebot: noindex"); one for another crawler does not count.
export function headerNoindex(value) {
  if (!value) return false;
  let agent = null;
  for (const part of String(value).split(',')) {
    let p = part.trim().toLowerCase();
    const m = /^([a-z0-9_-]+)\s*:\s*(.*)$/.exec(p);
    if (m && !KNOWN_DIRECTIVES.has(m[1])) { agent = m[1]; p = m[2].trim(); }
    if ((p === 'noindex' || p === 'none') && (agent === null || agent === 'googlebot')) return true;
  }
  return false;
}

const attrOf = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]).trim() : null;
};
const htmlDecode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Reads the robots meta tags (robots and googlebot) and rel=canonical links from a page's HTML
// (comments, scripts and styles removed first). Returns { noindex, robots: [values], canonicals }.
export function readHead(html) {
  const s = String(html ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script\s*>/gi, '').replace(/<style\b[\s\S]*?<\/style\s*>/gi, '');
  const robots = [];
  for (const m of s.matchAll(/<meta\b[^>]*>/gi)) {
    const name = (attrOf(m[0], 'name') ?? '').toLowerCase();
    if (name !== 'robots' && name !== 'googlebot') continue;
    robots.push(`${name}: ${attrOf(m[0], 'content') ?? ''}`);
  }
  const canonicals = [];
  for (const m of s.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (attrOf(m[0], 'rel') ?? '').toLowerCase().split(/\s+/);
    if (!rel.includes('canonical')) continue;
    const href = attrOf(m[0], 'href');
    if (href) canonicals.push(htmlDecode(href));
  }
  const noindex = robots.some((r) => r.split(':').slice(1).join(':').toLowerCase().split(',').map((x) => x.trim()).some((x) => x === 'noindex' || x === 'none'));
  return { noindex, robots, canonicals };
}

// rel=canonical from a Link header: <https://...>; rel="canonical".
export function linkCanonical(value) {
  if (!value) return null;
  for (const part of String(value).split(/,(?=\s*<)/)) {
    const m = /<([^>]*)>\s*;(.*)$/.exec(part.trim());
    if (m && /rel\s*=\s*"?([^";]*\s)?canonical(\s[^";]*)?"?/i.test(m[2])) return m[1];
  }
  return null;
}

// Two URLs compared as a crawler would: scheme and host lower case, default port and fragment
// dropped; path and query as written.
export function sameUrl(a, b) {
  try {
    const x = new URL(a);
    const y = new URL(b);
    x.hash = ''; y.hash = '';
    return x.href === y.href;
  } catch { return a === b; }
}

// ---------- one file ----------

const URL_CHILDREN = ['loc', 'lastmod', 'changefreq', 'priority'];
const INDEX_CHILDREN = ['loc', 'lastmod'];
const CHANGEFREQ = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);
const PRIORITY_RE = /^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const NEWS_REQUIRED = ['publication', 'publication_date', 'title'];
const NEWS_LANG = /^(?:[a-z]{2,3}|zh-cn|zh-tw)$/;
const IMAGE_DEPRECATED = new Set(['caption', 'geo_location', 'title', 'license']);

// The kinds a file can turn out to be.
export const KINDS = {
  urlset: 'XML sitemap',
  sitemapindex: 'Sitemap index',
  text: 'Text sitemap',
  rss: 'RSS feed',
  atom: 'Atom feed',
  html: 'HTML page',
  unknown: 'Not a sitemap',
  empty: 'Empty file',
  unfetched: 'Not fetched',
};

const nsNearMiss = (uri) => /sitemaps\.org\/schemas\/sitemap/i.test(uri ?? '');
const looksHtml = (text) => /^\s*(?:<!doctype html|<html[\s>]|<head[\s>]|<body[\s>])/i.test(text.replace(/^﻿/, ''));

// Judges one fetched (or pasted) file. ctx:
//   url          the address the file was read from (after redirects); null for pasted XML with no address
//   now          the check time (ms), for future dates and news freshness
//   bytes        the uncompressed size in bytes; truncated: the read stopped at the size cap
//   contentType  the Content-Type header, if any; lastModified: the file's Last-Modified (ms)
//   parentIndex  for a child of an index: { url } (nested-index and folder rules)
// Returns { kind, url, bytes, urlCount, sitemapCount, issues, entries, children, extensions, lastmod }.
// entries: [{ loc, line }] the usable URLs (for robots.txt and live checks); children: the index's.
export function judgeFile(text, ctx = {}) {
  const bag = issueBag();
  const now = ctx.now ?? Date.now();
  const report = {
    kind: 'unknown', url: ctx.url ?? null, bytes: ctx.bytes ?? null, truncated: Boolean(ctx.truncated),
    urlCount: 0, sitemapCount: 0, entries: [], children: [], extensions: { image: 0, news: 0, video: 0, alternate: 0 },
    lastmod: { dated: 0, distinct: 0, mostCommon: null, newest: null, oldest: null },
  };
  const finish = () => { report.issues = bag.list(); return report; };
  // Issues found before the read (the fetch, robots.txt, gzip, encoding) go in first.
  for (const [code, example] of ctx.pre ?? []) bag.add(code, example);
  if (ctx.bytes !== undefined && ctx.bytes > LIMITS.bytes) bag.add('too-large', { value: `${ctx.truncated ? 'more than ' : ''}${ctx.bytes.toLocaleString('en-US')} bytes (${mb(ctx.bytes)} MB)` });
  const body = text.replace(/^﻿/, '');
  if (!body.trim()) { report.kind = 'empty'; bag.add('empty-sitemap', { value: 'the file is empty' }); return finish(); }
  if (looksHtml(body)) {
    report.kind = 'html';
    bag.add('html-not-xml', { value: `${ctx.contentType ? `Content-Type ${ctx.contentType}; ` : ''}${(/<title[^>]*>([^<]{0,80})/i.exec(body)?.[1] ?? 'an HTML page').trim()}` });
    return finish();
  }
  if (!body.trimStart().startsWith('<')) return judgeText(body, ctx, bag, report, finish);

  const counts = new Map();
  const dates = new Map();
  const seenLoc = new Map();
  const stack = [];
  let entry = null;
  let text_ = '';
  let order = [];
  let newsInEntry = 0;
  let imagesInEntry = 0;
  let news = null;
  let image = null;
  let rootKind = null;
  let SM = NS.sitemap; // the root's namespace: children are read in it even when it is wrong
  const problem = (code, detail, line) => bag.add(code, { line, value: detail });

  const add = (code, line, value) => bag.add(code, { line, value });
  const onLoc = (value, line) => {
    const index = rootKind === 'sitemapindex';
    const { url, codes } = judgeLoc(value, { base: report.url, index });
    for (const [code, detail] of codes) add(code, line, detail);
    if (!url) return;
    entry.locUrl = url;
    if (report.url && !index) {
      const sc = scopeOf(url, report.url);
      if (sc) add(sc[0], line, sc[1]);
    }
    if (index && report.url) {
      if (sameUrl(url, report.url)) add('nested-index', line, `${url} lists itself`);
      const sc = scopeOf(url, report.url);
      if (sc) add(sc[0], line, sc[1]);
    }
    const prev = seenLoc.get(url);
    if (prev) { add('duplicate-url', line, `${url} (first on line ${prev})`); entry.duplicate = true; } else seenLoc.set(url, line);
  };
  const onDate = (value, line, tag) => {
    const d = parseW3cDate(value);
    if (!d.ok) { add('invalid-date', line, `<${tag}>${value.trim().slice(0, 40)}</${tag}>: ${d.error}`); return; }
    if (d.kind === 'datetime-nosec') add('time-without-seconds', line, value.trim());
    entry.lastmodTime = d.time;
    const key = value.trim();
    dates.set(key, (dates.get(key) ?? 0) + 1);
    report.lastmod.dated++;
    if (report.lastmod.newest === null || d.time > report.lastmod.newest) report.lastmod.newest = d.time;
    if (report.lastmod.oldest === null || d.time < report.lastmod.oldest) report.lastmod.oldest = d.time;
    if (d.time > now + SANITY.futureMs) add('future-lastmod', line, `${key} (checked ${isoDay(now)})`);
    else if (ctx.lastModified && d.time > ctx.lastModified + SANITY.futureMs) add('lastmod-after-file', line, `${key} (the file says Last-Modified ${isoDay(ctx.lastModified)})`);
  };

  const h = {
    problem,
    open(el) {
      const depth = stack.length;
      stack.push(el);
      text_ = '';
      if (depth === 0) {
        if (el.local === 'urlset' || el.local === 'sitemapindex') {
          rootKind = el.local;
          report.kind = el.local;
          SM = el.uri;
          if (el.uri !== NS.sitemap) {
            add('namespace', el.line, !el.uri ? `<${el.name}> has no xmlns="${NS.sitemap}"` : `xmlns="${el.uri}"${nsNearMiss(el.uri) ? ' (a near miss)' : ''}; it must be exactly ${NS.sitemap}`);
          }
          for (const [prefix, uri] of Object.entries(el.scope)) {
            for (const [ext, right] of [['image', NS.image], ['news', NS.news], ['video', NS.video]]) {
              if (uri !== right && new RegExp(`sitemap-${ext}`, 'i').test(uri ?? '')) add('extension-namespace', el.line, `xmlns:${prefix}="${uri}"; Google's is ${right}`);
            }
          }
        } else if (el.local === 'rss' || el.local === 'feed') {
          rootKind = el.local === 'rss' ? 'rss' : 'atom';
          report.kind = rootKind;
          add('feed', el.line, `<${el.name}>: Google accepts RSS 2.0 and Atom 1.0 feeds as sitemaps; a feed lists recent URLs only`);
        } else if (el.local === 'html') {
          report.kind = 'html';
          add('html-not-xml', el.line, '<html> root');
        } else {
          add('wrong-root', el.line, `<${el.name}>`);
        }
        return;
      }
      if (rootKind === 'rss' || rootKind === 'atom') {
        if (rootKind === 'atom' && el.local === 'link' && stack[stack.length - 2]?.local === 'entry') {
          const href = el.attrs.find((a) => a.name === 'href')?.value;
          if (href) { report.urlCount++; entry = { line: el.line }; onLoc(href, el.line); if (entry.locUrl) report.entries.push({ loc: entry.locUrl, line: el.line }); entry = null; }
        }
        if (rootKind === 'rss' && el.local === 'item') entry = { line: el.line };
        return;
      }
      if (rootKind !== 'urlset' && rootKind !== 'sitemapindex') return;
      const parent = stack[stack.length - 2];
      const childTag = rootKind === 'urlset' ? 'url' : 'sitemap';
      if (depth === 1) {
        if (el.uri === SM) {
          if (el.local !== childTag) add('unexpected-tag', el.line, `<${el.name}> inside <${rootKind}>${el.local === 'url' || el.local === 'sitemap' ? ` (a ${rootKind === 'urlset' ? 'sitemap' : 'sitemap index'} lists <${childTag}> entries)` : ''}`);
          else {
            entry = { line: el.line, locUrl: null, locCount: 0, seen: new Set() };
            order = [];
            newsInEntry = 0;
            imagesInEntry = 0;
            if (rootKind === 'urlset') report.urlCount++;
            else report.sitemapCount++;
          }
        }
        return;
      }
      if (!entry) return;
      if (depth === 2 && parent.local === childTag && parent.uri === SM) {
        if (el.uri === SM) {
          const allowed = rootKind === 'urlset' ? URL_CHILDREN : INDEX_CHILDREN;
          if (!allowed.includes(el.local)) { add('unexpected-tag', el.line, `<${el.name}> inside <${childTag}>`); return; }
          if (entry.seen.has(el.local)) add('duplicate-tag', el.line, `a second <${el.name}> in the <${childTag}> from line ${entry.line}`);
          entry.seen.add(el.local);
          order.push(el.local);
          return;
        }
        if (el.uri === NS.image && el.local === 'image') { report.extensions.image++; imagesInEntry++; image = { line: el.line, loc: false }; }
        if (el.uri === NS.news && el.local === 'news') {
          report.extensions.news++; newsInEntry++;
          if (newsInEntry === 2) add('news-twice', el.line, `in the <url> from line ${entry.line}`);
          news = { line: el.line, seen: new Set(), date: null, lang: null };
        }
        if (el.uri === NS.video && el.local === 'video') report.extensions.video++;
        if (el.uri === NS.xhtml && el.local === 'link') report.extensions.alternate++;
        return;
      }
      if (image && el.uri === NS.image && parent.local === 'image') {
        if (el.local === 'loc') image.loc = true;
        else if (IMAGE_DEPRECATED.has(el.local)) add('image-deprecated', el.line, `<${el.name}>`);
      }
      if (news && el.uri === NS.news) news.seen.add(el.local);
    },
    text(t) { text_ += t; },
    close(el, line) {
      stack.pop();
      const depth = stack.length;
      const value = text_;
      text_ = '';
      if (rootKind === 'rss' && entry && el.local === 'link' && stack[stack.length - 1]?.local === 'item') {
        report.urlCount++; onLoc(value, el.line); if (entry.locUrl) report.entries.push({ loc: entry.locUrl, line: el.line });
        return;
      }
      if (rootKind === 'rss' && el.local === 'item') { entry = null; return; }
      if (rootKind !== 'urlset' && rootKind !== 'sitemapindex') return;
      if (!entry) return;
      const childTag = rootKind === 'urlset' ? 'url' : 'sitemap';
      if (depth === 2 && el.uri === SM) {
        if (el.local === 'loc' && !entry.locDone) { entry.locDone = true; onLoc(value, el.line); }
        else if (el.local === 'lastmod' && !entry.dateDone) { entry.dateDone = true; onDate(value, el.line, 'lastmod'); }
        else if (el.local === 'changefreq' && !CHANGEFREQ.has(value.trim())) add('invalid-changefreq', el.line, value.trim().slice(0, 40) || '(empty)');
        else if (el.local === 'priority') {
          const v = value.trim();
          if (!PRIORITY_RE.test(v) || Number(v) > 1) add('invalid-priority', el.line, v.slice(0, 40) || '(empty)');
        }
        if (el.local === 'priority' || el.local === 'changefreq') counts.set('ignored', (counts.get('ignored') ?? 0) + 1);
        return;
      }
      if (depth === 2 && el.uri === NS.image && el.local === 'image' && image) {
        if (!image.loc) add('image-missing-loc', image.line, `<image:image> on line ${image.line}`);
        image = null;
        return;
      }
      if (news && el.uri === NS.news) {
        if (el.local === 'publication_date') {
          news.date = value.trim();
          const d = parseW3cDate(news.date);
          if (!d.ok) add('invalid-date', el.line, `<news:publication_date>${news.date.slice(0, 40)}: ${d.error}`);
          else if (now - d.time > LIMITS.newsDays * 86_400_000) add('news-stale', el.line, `${news.date} (checked ${isoDay(now)})`);
        }
        if (el.local === 'language') {
          news.lang = value.trim();
          if (!NEWS_LANG.test(news.lang)) add('news-language', el.line, news.lang || '(empty)');
        }
        if (el.local === 'news' && depth === 2) {
          const missing = [...NEWS_REQUIRED, 'name', 'language'].filter((t) => !news.seen.has(t));
          if (missing.length) add('news-missing-tag', news.line, missing.map((t) => `<news:${t}>`).join(', '));
          news = null;
        }
        return;
      }
      if (depth === 1 && el.local === childTag && el.uri === SM) {
        if (!entry.seen.has('loc')) add('missing-loc', entry.line, `the <${childTag}> on line ${entry.line} has no <loc>`);
        const allowed = rootKind === 'urlset' ? URL_CHILDREN : INDEX_CHILDREN;
        const ranks = order.map((t) => allowed.indexOf(t));
        if (ranks.some((r, k) => k > 0 && r < ranks[k - 1])) add('tag-order', entry.line, `${order.map((t) => `<${t}>`).join(' ')} (the schema order is ${allowed.filter((t) => order.includes(t)).map((t) => `<${t}>`).join(' ')})`);
        if (imagesInEntry > LIMITS.imagesPerUrl) add('too-many-images', entry.line, `${imagesInEntry} in the <url> from line ${entry.line}`);
        if (entry.locUrl && !entry.duplicate) {
          if (rootKind === 'urlset') report.entries.push({ loc: entry.locUrl, line: entry.line, lastmod: entry.lastmodTime ?? null });
          else if (!(report.url && sameUrl(entry.locUrl, report.url))) report.children.push({ loc: entry.locUrl, line: entry.line, lastmod: entry.lastmodTime ?? null });
        }
        entry = null;
      }
    },
  };

  const read = readXml(body, h, { truncated: ctx.truncated });
  report.stoppedAt = read.stoppedAt;
  if (read.decl?.encoding && !/^utf-?8$/i.test(read.decl.encoding)) bag.add('not-utf8', { line: read.decl.line, value: `the XML declaration says encoding="${read.decl.encoding}"` });
  if (!read.root) { if (!bag.has('xml-error')) bag.add('wrong-root', { value: 'no root element' }); return finish(); }
  if (rootKind === 'urlset' && report.urlCount > LIMITS.urls) bag.add('too-many-urls', { value: `${report.urlCount.toLocaleString('en-US')} URLs` });
  if (rootKind === 'sitemapindex' && report.sitemapCount > LIMITS.sitemaps) bag.add('too-many-sitemaps', { value: `${report.sitemapCount.toLocaleString('en-US')} sitemaps` });
  if (rootKind === 'urlset' && report.urlCount === 0 && !read.stoppedAt) bag.add('empty-sitemap', { value: '<urlset> has no <url> entries' });
  if (rootKind === 'sitemapindex' && report.sitemapCount === 0 && !read.stoppedAt) bag.add('empty-sitemap', { value: '<sitemapindex> has no <sitemap> entries' });
  if (ctx.parentIndex && rootKind === 'sitemapindex') bag.add('nested-index', { line: read.root.line, value: `${report.url ?? 'this file'} is itself a sitemap index, listed in ${ctx.parentIndex.url}` });
  if (counts.get('ignored')) bag.add('ignored-tags', { value: `${counts.get('ignored').toLocaleString('en-US')} <priority> and <changefreq> tags` }, 1);
  if (report.extensions.news > LIMITS.newsTags) bag.add('too-many-news', { value: `${report.extensions.news.toLocaleString('en-US')} <news:news> tags` });
  if (report.extensions.video) bag.add('video-not-checked', { value: `${report.extensions.video} <video:video> entries` });
  // lastmod sanity (heuristic; labelled so): one value for nearly every URL, or the check day.
  report.lastmod.distinct = dates.size;
  if (dates.size) {
    const [value, n] = [...dates.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
    report.lastmod.mostCommon = { value, count: n };
    const dated = report.lastmod.dated;
    const today = isoDay(now);
    const onToday = [...dates.entries()].filter(([v]) => isoDay(parseW3cDate(v).time) === today).reduce((sum, [, k]) => sum + k, 0);
    // Nearly all dated today reads as "the time the file was made"; it covers the same-value case.
    if (dated >= SANITY.minDated && onToday / dated >= SANITY.share) bag.add('lastmod-is-today', { value: `${onToday.toLocaleString('en-US')} of ${dated.toLocaleString('en-US')} dated URLs are ${today}, the day of the check` });
    else if (dated >= SANITY.minDated && n / dated >= SANITY.share) bag.add('same-lastmod', { value: `${n.toLocaleString('en-US')} of ${dated.toLocaleString('en-US')} dated URLs say ${value}` });
  }
  return finish();
}

// A file that could not be read at all: only the issues found on the way (the fetch, robots.txt).
export function unfetchedFile(url, pre = []) {
  const bag = issueBag();
  for (const [code, example] of pre) bag.add(code, example);
  return {
    kind: 'unfetched', url, bytes: null, truncated: false, urlCount: 0, sitemapCount: 0, entries: [], children: [],
    extensions: { image: 0, news: 0, video: 0, alternate: 0 }, lastmod: { dated: 0, distinct: 0, mostCommon: null, newest: null, oldest: null },
    issues: bag.list(),
  };
}

// A text sitemap: one URL per line, nothing else (sitemaps.org; Google).
function judgeText(body, ctx, bag, report, finish) {
  report.kind = 'text';
  const seen = new Map();
  const lines = body.split(/\r\n|\r|\n/);
  lines.forEach((raw, k) => {
    const line = k + 1;
    const v = raw.trim();
    if (!v) return;
    if (!HTTP_URL.test(v)) { bag.add('text-not-url', { line, value: v.slice(0, 80) }); return; }
    report.urlCount++;
    const { url, codes } = judgeLoc(v, { base: report.url });
    for (const [code, detail] of codes) bag.add(code, { line, value: detail });
    if (!url) return;
    if (report.url) { const sc = scopeOf(url, report.url); if (sc) bag.add(sc[0], { line, value: sc[1] }); }
    if (seen.has(url)) bag.add('duplicate-url', { line, value: `${url} (first on line ${seen.get(url)})` });
    else { seen.set(url, line); report.entries.push({ loc: url, line, lastmod: null }); }
  });
  if (report.urlCount > LIMITS.urls) bag.add('too-many-urls', { value: `${report.urlCount.toLocaleString('en-US')} URLs` });
  if (!report.urlCount) bag.add('empty-sitemap', { value: 'no URL lines' });
  if (report.url && !/\.txt$/i.test(new URL(report.url).pathname)) bag.add('text-extension', { value: new URL(report.url).pathname });
  return finish();
}

// The lastmod sanity heuristic's thresholds (ours, not Google's): at least this many dated URLs, and
// this share of them on one value or on the day of the check.
export const SANITY = { minDated: 20, share: 0.95, futureMs: 86_400_000 };

export const mb = (bytes) => (bytes / 1_048_576).toFixed(bytes < 1_048_576 ? 3 : 1);
// A size in words: bytes, kB or MB (MB as the limit is written: 1 MB = 1,048,576 bytes).
export const sizeWords = (bytes) => (bytes < 1024 ? `${bytes.toLocaleString('en-US')} bytes` : bytes < 1_048_576 ? `${(bytes / 1024).toFixed(1)} kB` : `${(bytes / 1_048_576).toFixed(1)} MB`);
// A share of the 50,000 URL limit in words.
export const shareOfLimit = (n, limit = LIMITS.urls) => { const p = (n / limit) * 100; return p > 0 && p < 0.01 ? 'under 0.01%' : `${p.toFixed(p < 1 ? 2 : 1)}%`; };

// ---------- live URL checks ----------

// The verdicts a listed URL can get after a live request. The first that applies is its headline.
export const LIVE_VERDICTS = {
  'robots-blocked': { severity: 'error', words: 'blocked by robots.txt (not fetched)' },
  'blocked-address': { severity: 'error', words: 'private or reserved address (not fetched)' },
  'no-answer': { severity: 'error', words: 'no answer' },
  'server-error': { severity: 'error', words: '5xx server error' },
  'not-found': { severity: 'error', words: '404 or 410' },
  'client-error': { severity: 'error', words: 'other 4xx' },
  redirect: { severity: 'error', words: 'redirects' },
  noindex: { severity: 'error', words: 'noindex' },
  'canonical-elsewhere': { severity: 'error', words: 'canonical is another URL' },
  'not-html': { severity: 'note', words: 'not an HTML page' },
  'not-checked': { severity: 'note', words: 'not reached in this call' },
  ok: { severity: 'ok', words: '200, indexable, canonical' },
};

// Picks which listed URLs to check live: `live` of them from position `from`, either the first ones
// or spread evenly through the list. Deterministic.
export function pickLive(entries, { live = 0, from = 0, pick = 'first' } = {}) {
  const n = Math.max(0, Math.min(live, entries.length - from));
  if (n <= 0) return [];
  if (pick === 'spread') {
    const span = entries.length - from;
    return Array.from({ length: n }, (_, k) => entries[from + Math.floor((k * span) / n)]);
  }
  return entries.slice(from, from + n);
}

// Judges one live answer: { hops: [{ url, status, location }], final: { status, contentType,
// xRobotsTag, link, html }, error: { code, message } } for a listed URL.
export function judgeLive(entry, answer) {
  const row = { url: entry.loc, line: entry.line ?? null, file: entry.file ?? null, status: null, finalUrl: null, redirects: 0, noindex: null, canonical: null, verdicts: [], severity: 'ok', summary: '' };
  if (answer.notChecked) { row.verdicts = ['not-checked']; row.severity = 'note'; row.summary = 'Not reached in this call\'s time; not charged. Check it in the next batch.'; return row; }
  if (answer.robotsBlocked) { row.verdicts = ['robots-blocked']; row.severity = 'error'; row.summary = `robots.txt blocks Googlebot from this URL (${answer.robotsBlocked}), so Google will not crawl it. Remove it from the sitemap, or remove the rule.`; return row; }
  if (answer.error) {
    const v = answer.error.code === 'blocked' || answer.error.code === 'port' ? 'blocked-address' : 'no-answer';
    row.verdicts = [v]; row.severity = 'error'; row.summary = `${v === 'blocked-address' ? 'Not fetched' : 'No answer'}: ${answer.error.message}.`;
    if (answer.hops?.length) row.redirects = answer.hops.length;
    return row;
  }
  const hops = answer.hops ?? [];
  row.redirects = hops.filter((h) => h.location).length;
  const f = answer.final;
  row.status = hops[0]?.status ?? f.status;
  row.finalUrl = f.url ?? entry.loc;
  const v = [];
  if (row.redirects) v.push('redirect');
  if (f.status >= 500) v.push('server-error');
  else if (f.status === 404 || f.status === 410) v.push('not-found');
  else if (f.status >= 400) v.push('client-error');
  else if (f.status >= 300) v.push('redirect');
  if (f.status >= 200 && f.status < 300) {
    const head = f.html ? readHead(f.html) : { noindex: false, robots: [], canonicals: [] };
    const fromHeader = headerNoindex(f.xRobotsTag);
    if (fromHeader || head.noindex) { v.push('noindex'); row.noindex = fromHeader ? `X-Robots-Tag: ${f.xRobotsTag}` : head.robots.join('; '); }
    const canon = linkCanonical(f.link) ?? head.canonicals[0] ?? null;
    if (canon) {
      let abs = null;
      try { abs = new URL(canon, row.finalUrl).href; } catch { abs = canon; }
      row.canonical = abs;
      if (!sameUrl(abs, row.finalUrl)) v.push('canonical-elsewhere');
    }
    if (!f.html && !/html/i.test(f.contentType ?? '')) v.push('not-html');
  }
  const order = Object.keys(LIVE_VERDICTS);
  row.verdicts = v.length ? [...new Set(v)].sort((a, b) => order.indexOf(a) - order.indexOf(b)) : ['ok'];
  row.severity = row.verdicts.some((x) => LIVE_VERDICTS[x].severity === 'error') ? 'error' : row.verdicts.includes('not-html') ? 'note' : 'ok';
  row.summary = liveSummary(row, f);
  return row;
}

function liveSummary(row, f) {
  const parts = [];
  if (row.verdicts.includes('redirect')) parts.push(`Redirects (${row.redirects} hop${row.redirects === 1 ? '' : 's'}) to ${row.finalUrl}, which answers ${f.status}. List the final URL instead.`);
  if (row.verdicts.includes('not-found')) parts.push(`Answers ${f.status}. Remove it from the sitemap, or restore the page.`);
  if (row.verdicts.includes('client-error')) parts.push(`Answers ${f.status}. Google cannot index it.`);
  if (row.verdicts.includes('server-error')) parts.push(`Answers ${f.status}, a server error.`);
  if (row.verdicts.includes('noindex')) parts.push(`Says noindex (${row.noindex}); Search Console reports this as "Submitted URL marked noindex". Remove it from the sitemap, or remove the noindex.`);
  if (row.verdicts.includes('canonical-elsewhere')) parts.push(`Names ${row.canonical} as its canonical. List the canonical URL instead.`);
  if (row.verdicts.includes('not-html')) parts.push(`Answers ${f.status} with ${f.contentType || 'no Content-Type'}; no robots meta tag or canonical link to read.`);
  if (!parts.length) parts.push(`Answers ${f.status}, no noindex, ${row.canonical ? 'canonical is itself' : 'no canonical tag'}.`);
  return parts.join(' ');
}

// ---------- the whole report ----------

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// Counts across the files read, the robots.txt result and the live rows.
export function summarise({ files, live = [], robotsBlocked = 0, notRead = 0 }) {
  const s = {
    files: files.length, urls: 0, sitemaps: 0, bytes: 0, errors: 0, warnings: 0, notes: 0,
    biggestFile: null, futureLastmod: 0, invalidDates: 0, robotsBlocked, notRead,
    live: { checked: 0, ok: 0, non200: 0, redirects: 0, noindex: 0, canonicalElsewhere: 0, robotsBlocked: 0, notChecked: 0, noAnswer: 0 },
    fetched: files.length > 0 && files[0].kind !== 'unfetched',
  };
  for (const f of files) {
    s.urls += f.urlCount ?? 0;
    s.sitemaps += f.sitemapCount ?? 0;
    s.bytes += f.bytes ?? 0;
    if (!s.biggestFile || (f.bytes ?? 0) > s.biggestFile.bytes) s.biggestFile = { url: f.url, bytes: f.bytes ?? 0, urls: f.urlCount ?? 0 };
    for (const it of f.issues ?? []) {
      if (it.severity === 'error') s.errors += it.count;
      else if (it.severity === 'warning') s.warnings += it.count;
      else s.notes += it.count;
      if (it.code === 'future-lastmod') s.futureLastmod += it.count;
      if (it.code === 'invalid-date') s.invalidDates += it.count;
    }
  }
  for (const r of live) {
    if (r.verdicts.includes('not-checked')) { s.live.notChecked++; continue; }
    if (r.verdicts.includes('robots-blocked')) { s.live.robotsBlocked++; continue; }
    s.live.checked++;
    if (r.verdicts.includes('ok')) s.live.ok++;
    if (r.verdicts.includes('no-answer') || r.verdicts.includes('blocked-address')) s.live.noAnswer++;
    else if (r.redirects || (r.status !== null && (r.status < 200 || r.status >= 300))) s.live.non200++;
    if (r.verdicts.includes('redirect')) s.live.redirects++;
    if (r.verdicts.includes('noindex')) s.live.noindex++;
    if (r.verdicts.includes('canonical-elsewhere')) s.live.canonicalElsewhere++;
  }
  return s;
}

// The overall verdict: could not fetch, invalid (errors), valid with warnings, or valid.
export function verdictOf(s) {
  if (!s.fetched) return 'fetch-failed';
  if (s.errors > 0) return 'invalid';
  if (s.warnings > 0 || s.live.non200 || s.live.noindex || s.live.canonicalElsewhere || s.live.noAnswer) return 'warnings';
  return 'valid';
}
export const VERDICT_WORDS = {
  'fetch-failed': 'could not be fetched',
  invalid: 'is not valid',
  warnings: 'is valid with warnings',
  valid: 'is valid',
};

// The first sentence of every report.
export function answerLine(url, s) {
  const v = verdictOf(s);
  if (v === 'fetch-failed') return `${url} ${VERDICT_WORDS[v]}: ${s.fetchProblem ?? 'see the first file below'}.`;
  const head = s.sitemaps && s.files > 1
    ? `${url} ${VERDICT_WORDS[v]}: an index of ${plural(s.sitemaps, 'sitemap')}; ${plural(s.files - 1, 'child file')} read hold ${plural(s.urls, 'URL')}, the largest ${sizeWords(s.biggestFile?.bytes ?? 0)} uncompressed`
    : s.sitemaps
      ? `${url} ${VERDICT_WORDS[v]}: a sitemap index listing ${plural(s.sitemaps, 'sitemap')}`
      : `${url} ${VERDICT_WORDS[v]}: ${plural(s.urls, 'URL')} (${shareOfLimit(s.urls)} of the 50,000 limit), ${sizeWords(s.bytes)} uncompressed`;
  const issues = `${plural(s.errors, 'error')} and ${plural(s.warnings, 'warning')}${s.futureLastmod ? `, ${plural(s.futureLastmod, 'future lastmod date')}` : ''}${s.robotsBlocked ? `, ${plural(s.robotsBlocked, 'URL')} blocked by robots.txt` : ''}`;
  const live = s.live.checked ? `; of ${plural(s.live.checked, 'URL')} checked live, ${s.live.non200.toLocaleString('en-US')} did not answer 200, ${s.live.noindex.toLocaleString('en-US')} ${s.live.noindex === 1 ? 'is' : 'are'} noindex and ${s.live.canonicalElsewhere.toLocaleString('en-US')} name${s.live.canonicalElsewhere === 1 ? 's' : ''} another canonical` : '';
  return `${head}, ${issues}${live}.`;
}

// ---------- CSV ----------

export const CSV_COLUMNS = ['kind', 'file', 'line', 'severity', 'code', 'search_console_name', 'url_or_value', 'detail'];

const FORMULA = /^[=+\-@\t\r]/;
const csvCell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (FORMULA.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// One row per issue example (and per issue with no example), then one per live row.
export function toCsv(files, live = []) {
  const rows = [CSV_COLUMNS];
  for (const f of files) {
    for (const it of f.issues ?? []) {
      const ex = it.examples.length ? it.examples : [{ line: null, value: '' }];
      for (const e of ex) rows.push(['file', f.url ?? 'pasted', e.line ?? '', it.severity, it.code, it.gsc ?? '', e.value ?? '', it.count > it.examples.length && e === ex[ex.length - 1] ? `${it.title} (${it.count} in all; ${it.examples.length} shown)` : it.title]);
    }
  }
  for (const r of live) rows.push(['live', r.file ?? '', r.line ?? '', r.severity, r.verdicts.join(' '), r.verdicts.includes('noindex') ? 'Submitted URL marked noindex' : '', r.url, r.summary]);
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

// ---------- escaping (for the reference page and the paste box) ----------

const XML_ESC = { '&': '&amp;', "'": '&apos;', '"': '&quot;', '>': '&gt;', '<': '&lt;' };
export const xmlEscape = (s) => String(s).replace(/[&'"<>]/g, (c) => XML_ESC[c]);

// A URL as it belongs inside <loc>: percent-encoded (non-ASCII and spaces), then entity-escaped.
export function locFor(url) {
  let enc;
  try { enc = new URL(url).href; } catch { enc = encodeURI(url); }
  return xmlEscape(enc.replace(/'/g, '%27'));
}
