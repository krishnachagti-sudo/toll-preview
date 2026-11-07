// The redirect chain checker's rules: reading a URL list or redirect map, telling what each hop
// changed, judging a finished trace (chain, loop, temporary, plain-HTTP hop, broken ending, expected
// target), the batch summary, the results CSV, and reading pasted `curl -sIL` output. Pure and
// dependency-free: the page loads this same file. The network part (fetching one hop, blocking
// private addresses, the time budget) is in net.js, server only.
//
// Status code meanings follow Google Search Central, "Redirects and Google Search" (last updated
// 2026-04-14) and "HTTP status codes, network and DNS errors" (last updated 2026-02-04); the dated
// copy the engine reads is data/status-codes.json, passed in by tool.js.

export const ENGINE_VERSION = 'redirect-chain-1';

export class RedirectError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'RedirectError';
    this.field = field;
  }
}

// ---------- limits ----------

export const LIMITS = {
  urls: 1000, // URLs in one call
  urlChars: 2048, // one input URL
  maxHops: 20, // redirects followed for one URL before it is stopped
  googleHops: 10, // Google's crawlers follow up to 10 redirect hops by default
  longChain: 5, // Google's John Mueller has advised keeping chains under five hops
  freeWebUrls: 10, // a check of this many URLs or fewer is free on the web page
};

// ---------- URLs ----------

const HTTP_URL = /^https?:\/\//i;

// Reads one URL as typed. A bare host or path-with-host ("example.com/old") is read as http://, the
// way a browser would; returns { url, error }.
export function readUrl(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return { url: null, error: 'Empty URL.' };
  if (raw.length > LIMITS.urlChars) return { url: null, error: `A URL is at most ${LIMITS.urlChars} characters.` };
  if (/\s/.test(raw)) return { url: null, error: `"${raw.slice(0, 60)}" has a space in it; a web address cannot (write %20).` };
  let candidate = raw;
  if (!HTTP_URL.test(candidate)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(candidate) && !/^[^:/]+:\d+(\/|$)/.test(candidate)) {
      return { url: null, error: `Only http:// and https:// addresses can be checked ("${raw.slice(0, 60)}").` };
    }
    candidate = `http://${candidate.replace(/^\/+/, '')}`;
  }
  let u;
  try { u = new URL(candidate); } catch { return { url: null, error: `"${raw.slice(0, 60)}" is not a web address.` }; }
  if (!u.hostname || !u.hostname.includes('.') && !u.hostname.startsWith('[')) return { url: null, error: `"${raw.slice(0, 60)}" has no domain name.` };
  if (u.username || u.password) return { url: null, error: 'Addresses with a user name or password are not checked.' };
  u.hash = '';
  return { url: u.href, error: null };
}

// The form two URLs are compared in: scheme and host lower case (URL already does this), default
// ports dropped (URL does this too), fragment ignored. Path and query stay case-sensitive.
export function sameUrl(a, b) {
  return comparable(a) === comparable(b);
}
function comparable(href) {
  try { const u = new URL(href); u.hash = ''; return u.href; } catch { return String(href); }
}
const trimSlash = (href) => {
  try { const u = new URL(href); u.hash = ''; if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1); return u.href; } catch { return String(href); }
};

// Resolves a Location header against the URL that sent it. Returns { url, error }.
export function resolveLocation(location, base) {
  const loc = String(location ?? '').trim();
  if (!loc) return { url: null, error: 'empty' };
  let u;
  try { u = new URL(loc, base); } catch { return { url: null, error: 'unreadable' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { url: null, error: 'scheme' };
  if (!u.hostname) return { url: null, error: 'unreadable' };
  u.hash = '';
  return { url: u.href, error: null };
}

const stripWww = (host) => host.replace(/^www\./, '');

// What one redirect changed, in words a person fixing a rule can use.
export function hopChanges(fromHref, toHref) {
  let a; let b;
  try { a = new URL(fromHref); b = new URL(toHref); } catch { return ['other']; }
  const out = [];
  if (a.protocol !== b.protocol) out.push(b.protocol === 'https:' ? 'to-https' : 'to-http');
  if (a.hostname !== b.hostname) {
    if (stripWww(a.hostname) === stripWww(b.hostname)) out.push(b.hostname.startsWith('www.') ? 'add-www' : 'remove-www');
    else out.push('host');
  }
  if (a.port !== b.port) out.push('port');
  if (a.pathname !== b.pathname) {
    const ta = a.pathname.replace(/\/$/, '') || '/';
    const tb = b.pathname.replace(/\/$/, '') || '/';
    if (ta === tb) out.push(b.pathname.endsWith('/') ? 'add-slash' : 'remove-slash');
    else if (ta.toLowerCase() === tb.toLowerCase()) out.push('case');
    else out.push('path');
  }
  if (a.search !== b.search) out.push('query');
  return out.length ? out : ['none'];
}

export const CHANGE_WORDS = {
  'to-https': 'http to https',
  'to-http': 'https to http',
  'add-www': 'adds www',
  'remove-www': 'removes www',
  host: 'another host',
  port: 'another port',
  'add-slash': 'adds a trailing slash',
  'remove-slash': 'removes the trailing slash',
  case: 'changes letter case',
  path: 'another path',
  query: 'changes the query',
  none: 'the same URL',
  other: 'unreadable',
};

// ---------- reading the list ----------

// A header line names its columns ("old url,new url", "Source;Target") and holds no address.
const HEADER_WORD = /^(?:old|new|source|from|to|target|expected|destination|redirect|original|url|urls|address|link|page)\b/i;
const looksLikeHeader = (cells) => cells.some((c) => HEADER_WORD.test(c.trim())) && !cells.some((c) => /[./]/.test(c));
const splitLine = (line) => {
  if (line.includes('\t')) return line.split('\t');
  // A comma inside a URL is legal, so a line splits on a comma only before something that reads as
  // a second URL (old,new) or a quoted CSV.
  const quoted = /^"((?:[^"]|"")*)"\s*,\s*"?((?:[^"]|"")*)"?\s*$/.exec(line);
  if (quoted) return [quoted[1].replace(/""/g, '"'), quoted[2].replace(/""/g, '"')];
  const m = /^(.*?)\s*[,;]\s*((?:https?:\/\/|\/|www\.)\S*)\s*$/i.exec(line);
  if (m) return [m[1], m[2]];
  const sp = /^(\S+)\s+((?:https?:\/\/|\/)\S*)$/i.exec(line.trim());
  if (sp) return [sp[1], sp[2]];
  return [line];
};

// Reads the list as pasted: one URL per line, or a redirect map of "old,new" (comma, semicolon, tab
// or space). A header line is skipped. An expected target may be a path ("/new-page"), read against
// the old URL's host. Returns { items: [{ line, url, expected }], problems: [{ line, message }] }.
export function readList({ list, urls }) {
  const items = [];
  const problems = [];
  const add = (line, rawUrl, rawExpected) => {
    const r = readUrl(rawUrl);
    if (!r.url) { problems.push({ line, input: String(rawUrl ?? '').slice(0, 200), message: r.error }); return; }
    let expected = null;
    if (rawExpected !== undefined && rawExpected !== null && String(rawExpected).trim() !== '') {
      const e = String(rawExpected).trim();
      // A path ("/new-page") is kept as a path: judge() reads it on the site the URL ends on.
      const er = e.startsWith('/') && !e.startsWith('//') ? resolveLocation(e, r.url) : readUrl(e);
      if (!er.url) { problems.push({ line, input: e.slice(0, 200), message: `The expected target "${e.slice(0, 60)}" is not a web address.` }); return; }
      expected = e.startsWith('/') && !e.startsWith('//') ? (() => { const u = new URL(er.url); return u.pathname + u.search; })() : er.url;
    }
    items.push({ line, url: r.url, expected });
  };
  if (Array.isArray(urls)) {
    urls.forEach((u, i) => (typeof u === 'string' ? add(i + 1, u) : add(i + 1, u?.url, u?.expected)));
  } else {
    const lines = String(list ?? '').replace(/^﻿/, '').split(/\r\n|\r|\n/);
    lines.forEach((text, i) => {
      if (!text.trim() || text.trim().startsWith('#')) return;
      const cells = splitLine(text).map((c) => c.trim().replace(/^"|"$/g, ''));
      if (i === 0 && looksLikeHeader(cells)) return;
      add(i + 1, cells[0], cells[1]);
    });
  }
  return { items, problems };
}

// The same URL twice is checked once (its later lines share the answer); the expected target can
// differ per line, so dedupe is by URL only for fetching, not for reporting.
export function uniqueUrls(items) {
  return [...new Set(items.map((x) => x.url))];
}

// Counts what a call will check, as the price sees it: distinct readable URLs.
export function countUrls(input) {
  try { return uniqueUrls(readList(input).items).length; } catch { return 0; }
}

// ---------- meta refresh ----------

// The first <meta http-equiv="refresh"> in an HTML head: { seconds, url } or null. A refresh with no
// url= reloads the same page and is not a redirect.
export function metaRefresh(html) {
  const text = String(html ?? '');
  const tags = text.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/http-equiv\s*=\s*["']?\s*refresh\b/i.test(tag)) continue;
    const content = /\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
    if (!content) continue;
    return parseRefresh(content[1] ?? content[2] ?? content[3] ?? '');
  }
  return null;
}

// A Refresh value ("0; url=/new" or "5;URL='https://x'"). Returns { seconds, url } or null.
export function parseRefresh(value) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*(?:[;,]\s*(?:url\s*=\s*)?(.*))?$/i.exec(String(value ?? ''));
  if (!m) return null;
  const url = (m[2] ?? '').trim().replace(/^["']|["']$/g, '').trim();
  if (!url) return null;
  return { seconds: Math.floor(Number(m[1])), url };
}

// ---------- status codes ----------

// The kind of one hop: 'permanent' or 'temporary' for a redirect (Google's table), 'final' for an
// answer that ends the chain, or 'broken' for a 3xx Google does not treat as a redirect.
export function hopKind(hop, codes) {
  if (hop.via === 'meta-refresh' || hop.via === 'refresh-header') return hop.refreshSeconds === 0 ? 'permanent' : 'temporary';
  const s = hop.status;
  if (codes.permanent.includes(s)) return 'permanent';
  if (codes.temporary.includes(s)) return 'temporary';
  return 'final';
}

const statusClass = (s) => (s >= 200 && s < 300 ? 'ok' : s >= 300 && s < 400 ? 'redirect' : s >= 400 && s < 500 ? 'client-error' : s >= 500 ? 'server-error' : 'other');

// ---------- judging one trace ----------

// The verdict codes, in the order a person should fix them, with the words for each.
export const VERDICTS = {
  'not-checked': 'Not checked',
  blocked: 'Not fetched: private or local address',
  error: 'No answer (DNS, connection, TLS or timeout)',
  loop: 'Redirect loop',
  'too-many-hops': 'Stopped: more hops than the limit',
  'bad-location': 'Redirect with an empty or unreadable Location',
  broken: 'Ends on a 4xx or 5xx',
  'over-google-limit': 'More than 10 hops: past Google\'s default limit',
  'to-http': 'Downgrades from https to http',
  'ends-http': 'Ends on plain http',
  'http-in-chain': 'Plain-HTTP URL inside the chain',
  'wrong-target': 'Lands somewhere other than the expected target',
  'to-homepage': 'Redirected to the homepage',
  'slash-only': 'Matches the expected target except for a trailing slash',
  temporary: 'Temporary redirect (302, 303, 307 or delayed refresh)',
  'long-chain': 'Long chain (5 hops or more)',
  chain: 'Chain (2 or more hops)',
  'meta-refresh': 'Uses a meta refresh',
  'via-chain': 'Reaches the expected target through a chain',
  ok: 'OK',
};
export const VERDICT_ORDER = Object.keys(VERDICTS);
const SEVERE = new Set(['not-checked', 'blocked', 'error', 'loop', 'too-many-hops', 'bad-location', 'broken', 'over-google-limit', 'to-http', 'wrong-target']);

// trace: { url, expected?, hops: [{ url, status, location?, via?, refreshSeconds?, ms?, server?, hsts? }],
//          stop: null | { reason: 'loop' | 'too-many-hops' | 'error' | 'blocked' | 'bad-location' | 'not-checked', detail?, at? } }
// hops[i] is the answer for hops[i].url; a redirect's next URL is hops[i + 1].url.
export function judge(trace, codes, { maxHops = LIMITS.maxHops } = {}) {
  const hops = trace.hops ?? [];
  const stop = trace.stop ?? null;
  const redirects = hops.filter((h) => h.next);
  const verdicts = new Set();
  const notes = [];
  const last = hops[hops.length - 1] ?? null;
  const finalUrl = stop?.reason === 'loop' || stop?.reason === 'too-many-hops' ? null : (last?.url ?? trace.url);
  const finalStatus = last && !last.next ? last.status : null;

  if (stop) {
    if (stop.reason === 'not-checked') verdicts.add('not-checked');
    if (stop.reason === 'blocked') verdicts.add('blocked');
    if (stop.reason === 'error') verdicts.add('error');
    if (stop.reason === 'loop') verdicts.add('loop');
    if (stop.reason === 'too-many-hops') verdicts.add('too-many-hops');
    if (stop.reason === 'bad-location') verdicts.add('bad-location');
  }
  if (finalStatus !== null && finalStatus >= 400) verdicts.add('broken');
  if (finalStatus !== null && finalStatus >= 300 && finalStatus < 400) verdicts.add('bad-location');
  const n = redirects.length;
  if (n > LIMITS.googleHops) verdicts.add('over-google-limit');
  if (n >= LIMITS.longChain) verdicts.add('long-chain');
  if (n >= 2) verdicts.add('chain');

  const kinds = redirects.map((h) => hopKind(h, codes));
  if (kinds.includes('temporary')) verdicts.add('temporary');
  if (redirects.some((h) => h.via === 'meta-refresh' || h.via === 'refresh-header')) verdicts.add('meta-refresh');

  // Plain HTTP inside the chain: an http:// URL reached by a redirect (SecurityScorecard's "redirect
  // chain contains HTTP" names the problem; the rule is ours). The address given is not counted: a
  // visitor who types http:// is expected to take one hop to https.
  const httpAt = hops.findIndex((h, i) => i > 0 && h.url.startsWith('http:'));
  if (httpAt !== -1) verdicts.add('http-in-chain');
  const downgradeAt = redirects.findIndex((h) => h.url.startsWith('https:') && h.next.startsWith('http:'));
  if (downgradeAt !== -1) verdicts.add('to-http');
  if (finalUrl && finalUrl.startsWith('http:') && finalStatus !== null && finalStatus < 400 && !verdicts.has('error')) verdicts.add('ends-http');

  // Expected target (a redirect map row). A path is read on the site the URL ends on when that is
  // the same site as the old URL (www and scheme aside), else on the old URL's own site over https.
  let expectation = null;
  const expectedUrl = expectedFor(trace.expected, trace.url, finalUrl);
  if (expectedUrl) {
    if (finalUrl && finalStatus !== null && finalStatus < 300) {
      if (sameUrl(finalUrl, expectedUrl)) {
        expectation = n <= 1 ? 'match' : 'via-chain';
        if (n > 1) verdicts.add('via-chain');
      } else if (trimSlash(finalUrl) === trimSlash(expectedUrl)) {
        expectation = 'slash-only';
        verdicts.add('slash-only');
      } else {
        expectation = 'wrong-target';
        verdicts.add('wrong-target');
      }
    } else {
      expectation = 'not-reached';
    }
  }
  // Sent to the homepage: the old URL had a path, the final one is the root of a site. Google
  // counts such redirects as soft 404s when the target is not a real replacement.
  try {
    const start = new URL(trace.url);
    if (finalUrl && n >= 1 && start.pathname !== '/' && new URL(finalUrl).pathname === '/' && !(expectedUrl && sameUrl(finalUrl, expectedUrl))) verdicts.add('to-homepage');
  } catch { /* unreadable start: reported elsewhere */ }

  if (!verdicts.size || [...verdicts].every((v) => v === 'meta-refresh')) verdicts.add('ok');

  // Loop anatomy: where it starts and which URLs repeat.
  let loop = null;
  if (stop?.reason === 'loop') {
    const at = stop.at ?? 0;
    const cycle = hops.slice(at).map((h) => h.url);
    loop = { startsAtHop: at + 1, cycle, length: cycle.length };
    const selfLoop = cycle.length === 1;
    if (selfLoop && hops[at]?.server && /cloudflare/i.test(hops[at].server)) {
      notes.push('This URL redirects to itself behind Cloudflare: Cloudflare documents this loop when the origin redirects HTTP to HTTPS while the SSL/TLS encryption mode is Flexible. Its fix: remove the origin\'s HTTPS redirect or set the mode to Full or higher.');
    } else if (cycle.length === 2 && cycle[0].replace(/^https?:/, '') === cycle[1].replace(/^https?:/, '')) {
      notes.push('The loop alternates between http and https of the same URL: one rule sends visitors to https and another sends them back. Look for an https-to-http rule at the origin, a proxy or a CMS setting.');
    } else if (cycle.length === 2 && stripWww(hostOf(cycle[0])) === stripWww(hostOf(cycle[1])) && hostOf(cycle[0]) !== hostOf(cycle[1])) {
      notes.push('The loop alternates between the www and bare host: two rules disagree on which one is canonical.');
    } else if (cycle.length === 2 && trimSlash(cycle[0]) === trimSlash(cycle[1])) {
      notes.push('The loop adds and removes a trailing slash: two rules disagree on the slash.');
    }
  }
  if (n >= 2 && finalUrl && finalStatus !== null && finalStatus < 300) {
    notes.push(`Flatten it: point ${trace.url} straight at ${finalUrl} with one 301, and do the same for the ${n - 1} URL${n - 1 === 1 ? '' : 's'} in between.`);
  }
  if (verdicts.has('temporary') && finalStatus !== null && finalStatus < 300) {
    notes.push('Google treats 302, 303 and 307 (and a delayed meta refresh) as temporary: a weak signal, and the source page tends to stay in results. Use 301 or 308 for a move that is meant to last.');
  }
  if (verdicts.has('http-in-chain') && !verdicts.has('to-http')) {
    notes.push(`A plain http:// URL appears at hop ${httpAt + 1}. Point every redirect at the https URL directly.`);
  }
  if (stop?.reason === 'too-many-hops') notes.push(`Stopped after ${maxHops} hops without an answer.`);
  if (stop?.detail) notes.push(stop.detail);

  const sorted = VERDICT_ORDER.filter((v) => verdicts.has(v));
  return {
    url: trace.url,
    expected: expectedUrl ?? trace.expected ?? null,
    hops: hops.map((h, i) => ({
      n: i + 1,
      url: h.url,
      status: h.status ?? null,
      kind: h.next ? hopKind(h, codes) : 'final',
      via: h.via ?? (h.next ? 'location' : null),
      ...(h.refreshSeconds !== undefined ? { refreshSeconds: h.refreshSeconds } : {}),
      next: h.next ?? null,
      changes: h.next ? hopChanges(h.url, h.next) : [],
      ...(h.ms !== undefined ? { ms: h.ms } : {}),
      ...(h.server ? { server: h.server } : {}),
      ...(h.hsts ? { hsts: true } : {}),
    })),
    redirects: n,
    finalUrl,
    finalStatus,
    finalClass: finalStatus === null ? null : statusClass(finalStatus),
    stop: stop ? { reason: stop.reason, ...(stop.detail ? { detail: stop.detail } : {}) } : null,
    expectation,
    loop,
    verdicts: sorted,
    severity: sorted.some((v) => SEVERE.has(v)) ? 'fix' : sorted.includes('ok') || sorted.every((v) => v === 'meta-refresh') ? 'ok' : 'review',
    summary: sentence(trace.url, sorted, n, finalUrl, finalStatus, stop),
    notes,
  };
}

const hostOf = (href) => { try { return new URL(href).hostname; } catch { return ''; } };

// The expected target as a full URL: as given, or a path read on the right site.
export function expectedFor(expected, startUrl, finalUrl) {
  if (!expected) return null;
  if (!expected.startsWith('/')) return expected;
  try {
    if (finalUrl && stripWww(hostOf(finalUrl)) === stripWww(hostOf(startUrl))) return new URL(expected, finalUrl).href;
    const u = new URL(expected, startUrl);
    u.protocol = 'https:';
    return u.href;
  } catch { return null; }
}

function sentence(url, verdicts, n, finalUrl, finalStatus, stop) {
  if (stop?.reason === 'not-checked') return `${url} was not checked: ${stop.detail ?? 'the time budget ran out'}.`;
  if (stop?.reason === 'blocked') {
    const why = String(stop.detail ?? 'it points at a private, local or reserved address').replace(/\.$/, '');
    return n ? `${url} was stopped after ${n} redirect${n === 1 ? '' : 's'}: a redirect points at an address that is not fetched.` : `${url} was not fetched: ${why}.`;
  }
  if (stop?.reason === 'loop') return `${url} loops: a URL repeats after ${n} redirect${n === 1 ? '' : 's'}.`;
  if (stop?.reason === 'too-many-hops') return `${url} was stopped after ${n} redirects without reaching a page.`;
  if (stop?.reason === 'error') return `${url} got no answer${n ? ` after ${n} redirect${n === 1 ? '' : 's'}` : ''}: ${stop.detail ?? 'the request failed'}.`;
  if (stop?.reason === 'bad-location') return `${url} sends a redirect with an empty or unreadable Location after ${n} redirect${n === 1 ? '' : 's'}.`;
  if (n === 0) return `${url} answers ${finalStatus} with no redirect.`;
  const temp = verdicts.includes('temporary') ? ', with a temporary redirect' : '';
  return `${url} reaches ${finalUrl} (${finalStatus}) in ${n} redirect${n === 1 ? '' : 's'}${temp}.`;
}

// ---------- the batch ----------

// rows: the judged rows, in list order. Returns the counts the answer line and the CSV header use.
export function summarise(rows) {
  const has = (v) => rows.filter((r) => r.verdicts.includes(v)).length;
  // Checked: fetched at least once (a redirect to a blocked address still counts; it was followed).
  const checked = rows.filter((r) => !r.verdicts.includes('not-checked') && !(r.verdicts.includes('blocked') && !r.hops.length));
  const withMap = rows.filter((r) => r.expected);
  const s = {
    total: rows.length,
    checked: checked.length,
    notChecked: has('not-checked'),
    blocked: has('blocked'),
    noRedirect: checked.filter((r) => r.redirects === 0 && r.finalStatus !== null && r.finalStatus < 300).length,
    oneHop: checked.filter((r) => r.redirects === 1 && r.finalStatus !== null && r.finalStatus < 300).length,
    chains: has('chain'),
    longest: Math.max(0, ...checked.map((r) => r.redirects)),
    loops: has('loop'),
    tooManyHops: has('too-many-hops'),
    overGoogleLimit: has('over-google-limit'),
    temporary: has('temporary'),
    httpInChain: has('http-in-chain'),
    downgrades: has('to-http'),
    endsHttp: has('ends-http'),
    broken: has('broken'),
    errors: has('error'),
    badLocation: has('bad-location'),
    toHomepage: has('to-homepage'),
    metaRefresh: has('meta-refresh'),
    ok: rows.filter((r) => r.severity === 'ok').length,
    toFix: rows.filter((r) => r.severity === 'fix').length,
    toReview: rows.filter((r) => r.severity === 'review').length,
  };
  if (withMap.length) {
    s.expected = {
      rows: withMap.length,
      match: withMap.filter((r) => r.expectation === 'match').length,
      viaChain: withMap.filter((r) => r.expectation === 'via-chain').length,
      slashOnly: withMap.filter((r) => r.expectation === 'slash-only').length,
      wrong: withMap.filter((r) => r.expectation === 'wrong-target').length,
      notReached: withMap.filter((r) => r.expectation === 'not-reached').length,
    };
  }
  return s;
}

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// The answer line: "Of 5 URLs, 2 redirect in one hop, 1 chains (up to 3 hops), ..."
export function answerLine(s) {
  if (!s.total) return 'No URLs to check.';
  const parts = [];
  if (s.noRedirect) parts.push(`${s.noRedirect.toLocaleString('en-US')} answer${s.noRedirect === 1 ? 's' : ''} with no redirect`);
  if (s.oneHop) parts.push(`${s.oneHop.toLocaleString('en-US')} redirect${s.oneHop === 1 ? 's' : ''} in one hop`);
  if (s.chains) parts.push(`${s.chains.toLocaleString('en-US')} chain${s.chains === 1 ? 's' : ''} through 2 or more hops (longest ${s.longest})`);
  if (s.loops) parts.push(`${s.loops.toLocaleString('en-US')} loop${s.loops === 1 ? 's' : ''}`);
  if (s.temporary) parts.push(`${s.temporary.toLocaleString('en-US')} use${s.temporary === 1 ? 's' : ''} a temporary redirect`);
  if (s.httpInChain) parts.push(`${s.httpInChain.toLocaleString('en-US')} pass${s.httpInChain === 1 ? 'es' : ''} through plain http`);
  if (s.broken) parts.push(`${s.broken.toLocaleString('en-US')} end${s.broken === 1 ? 's' : ''} on a 4xx or 5xx`);
  if (s.errors) parts.push(`${s.errors.toLocaleString('en-US')} got no answer`);
  if (s.blocked) parts.push(`${s.blocked.toLocaleString('en-US')} ${s.blocked === 1 ? 'was' : 'were'} refused (a private address or a port not used for websites)`);
  if (s.notChecked) parts.push(`${s.notChecked.toLocaleString('en-US')} ${s.notChecked === 1 ? 'was' : 'were'} not reached in this call and not charged`);
  let line = `Of ${plural(s.total, 'URL')}, ${joinWords(parts.length ? parts : ['none could be read'])}.`;
  if (s.expected) {
    const e = s.expected;
    const v = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
    line += ` Against your map: ${v(e.match, 'lands', 'land')} on the expected target in one hop, ${v(e.viaChain, 'reaches', 'reach')} it through a chain, ${v(e.wrong, 'lands', 'land')} elsewhere${e.slashOnly ? `, ${v(e.slashOnly, 'differs', 'differ')} only by a trailing slash` : ''}${e.notReached ? `, ${v(e.notReached, 'never reaches', 'never reach')} a page` : ''}.`;
  }
  return line;
}
const joinWords = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

// ---------- CSV ----------

const FORMULA = /^[=+\-@\t\r]/;
const cell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (FORMULA.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const CSV_COLUMNS = ['line', 'url', 'expected', 'severity', 'verdicts', 'redirects', 'final_url', 'final_status', 'expected_result', 'chain', 'notes'];

export function toCsv(rows) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of rows) {
    const chain = r.hops.map((h) => `${h.status ?? '-'} ${h.url}`).join(' > ');
    lines.push([r.line ?? '', r.url, r.expected ?? '', r.severity, r.verdicts.join(' '), r.redirects, r.finalUrl ?? '', r.finalStatus ?? '', r.expectation ?? '', chain, r.notes.join(' ')].map(cell).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}

// ---------- pasted curl output ----------

// Reads `curl -sIL URL` (or -sSL -D -, or -v with "< " prefixes) output into hops: each response
// block's status line and Location. The first URL must be given, since curl -I does not print it.
// Returns { hops, problems }.
export function readCurl(text, firstUrl) {
  const start = readUrl(firstUrl);
  if (!start.url) throw new RedirectError(`The first URL: ${start.error}`, 'url');
  const lines = String(text ?? '').split(/\r\n|\r|\n/).map((l) => l.replace(/^[<>]\s?/, ''));
  const blocks = [];
  let cur = null;
  for (const line of lines) {
    const st = /^HTTP\/[\d.]+\s+(\d{3})\b/i.exec(line.trim());
    if (st) { cur = { status: Number(st[1]), headers: {} }; blocks.push(cur); continue; }
    if (!cur) continue;
    const hd = /^([A-Za-z0-9-]+):\s*(.*)$/.exec(line.trim());
    if (hd) cur.headers[hd[1].toLowerCase()] = hd[2].trim();
  }
  // 1xx interim answers (100 Continue, 103 Early Hints) are not hops.
  const real = blocks.filter((b) => b.status >= 200);
  if (!real.length) throw new RedirectError('No HTTP status lines found. Paste the output of curl -sIL <url>.', 'curl');
  const hops = [];
  let url = start.url;
  for (const b of real) {
    const hop = { url, status: b.status };
    if (b.headers.server) hop.server = b.headers.server;
    if (b.headers['strict-transport-security']) hop.hsts = true;
    if (b.status >= 300 && b.status < 400 && b.headers.location !== undefined) {
      hop.location = b.headers.location;
      const next = resolveLocation(b.headers.location, url);
      if (next.url) { hop.next = next.url; hops.push(hop); url = next.url; continue; }
    }
    hops.push(hop);
    break;
  }
  return { hops, start: start.url };
}

// Turns hops read from curl (or given directly) into a trace with the same loop and hop-limit
// stops the live tracer uses, so a pasted run and a live run are judged alike.
export function traceFromHops(url, hops, { maxHops = LIMITS.maxHops, expected = null } = {}) {
  const out = [];
  const seen = new Map();
  for (const h of hops) {
    if (seen.has(comparable(h.url))) return { url, expected, hops: out, stop: { reason: 'loop', at: seen.get(comparable(h.url)) } };
    seen.set(comparable(h.url), out.length);
    if (out.filter((x) => x.next).length >= maxHops) return { url, expected, hops: out, stop: { reason: 'too-many-hops' } };
    out.push(h);
    if (!h.next) {
      if (h.status >= 300 && h.status < 400 && h.location !== undefined) return { url, expected, hops: out, stop: { reason: 'bad-location', detail: `Location "${String(h.location).slice(0, 80)}" cannot be followed.` } };
      return { url, expected, hops: out, stop: null };
    }
  }
  const lastHop = out[out.length - 1];
  if (lastHop?.next) {
    if (seen.has(comparable(lastHop.next))) return { url, expected, hops: out, stop: { reason: 'loop', at: seen.get(comparable(lastHop.next)) } };
    return { url, expected, hops: out, stop: { reason: 'not-checked', detail: 'the pasted output stops before the last redirect was answered' } };
  }
  return { url, expected, hops: out, stop: null };
}

// ---------- addresses ----------

// True for an address that must never be fetched: private, loopback, link-local (cloud metadata at
// 169.254.169.254 and fd00:ec2::254 included), carrier-grade NAT, documentation, multicast and
// reserved ranges, in IPv4 and IPv6 (with IPv4-mapped and NAT64 forms read as IPv4).
export function isBlockedIp(ip) {
  const s = String(ip ?? '').trim().replace(/^\[|\]$/g, '').toLowerCase().split('%')[0];
  const v4 = parseV4(s);
  if (v4) return blockedV4(v4);
  const v6 = parseV6(s);
  if (!v6) return true; // not an address we can read: refuse
  return blockedV6(v6);
}

function parseV4(s) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  return parts.every((p) => p <= 255) ? parts : null;
}
const V4_BLOCKS = [
  [[0, 0, 0, 0], 8], [[10, 0, 0, 0], 8], [[100, 64, 0, 0], 10], [[127, 0, 0, 0], 8], [[169, 254, 0, 0], 16],
  [[172, 16, 0, 0], 12], [[192, 0, 0, 0], 24], [[192, 0, 2, 0], 24], [[192, 88, 99, 0], 24], [[192, 168, 0, 0], 16],
  [[198, 18, 0, 0], 15], [[198, 51, 100, 0], 24], [[203, 0, 113, 0], 24], [[224, 0, 0, 0], 4], [[240, 0, 0, 0], 4],
];
const v4num = (p) => ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
function blockedV4(p) {
  const n = v4num(p);
  return V4_BLOCKS.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
    return ((n & mask) >>> 0) === ((v4num(base) & mask) >>> 0);
  });
}

// Eight 16-bit groups, or null.
function parseV6(s) {
  if (!/^[0-9a-f:.]+$/.test(s) || !s.includes(':')) return null;
  let head = s;
  let tail4 = null;
  const lastColon = s.lastIndexOf(':');
  if (s.slice(lastColon + 1).includes('.')) {
    tail4 = parseV4(s.slice(lastColon + 1));
    if (!tail4) return null;
    head = `${s.slice(0, lastColon + 1)}${((tail4[0] << 8) | tail4[1]).toString(16)}:${((tail4[2] << 8) | tail4[3]).toString(16)}`;
  }
  const halves = head.split('::');
  if (halves.length > 2) return null;
  const grp = (x) => (x === '' ? [] : x.split(':'));
  const left = grp(halves[0]);
  const right = halves.length === 2 ? grp(halves[1]) : [];
  const fill = 8 - left.length - right.length;
  if (halves.length === 1 ? left.length !== 8 : fill < 1) return null;
  const all = [...left, ...Array(halves.length === 2 ? fill : 0).fill('0'), ...right];
  if (all.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return all.map((g) => parseInt(g, 16));
}
function blockedV6(g) {
  const zeroTo = (k) => g.slice(0, k).every((x) => x === 0);
  if (g.every((x) => x === 0)) return true; // ::
  if (zeroTo(7) && g[7] === 1) return true; // ::1
  if (zeroTo(5) && g[5] === 0xffff) return blockedV4([g[6] >> 8, g[6] & 255, g[7] >> 8, g[7] & 255]); // ::ffff:a.b.c.d
  if (zeroTo(6)) return true; // ::a.b.c.d (deprecated compatible)
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) return blockedV4([g[6] >> 8, g[6] & 255, g[7] >> 8, g[7] & 255]); // NAT64
  if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local (fd00:ec2::254 metadata)
  if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((g[0] & 0xffc0) === 0xfec0) return true; // fec0::/10 old site-local
  if ((g[0] & 0xff00) === 0xff00) return true; // multicast
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation
  if (g[0] === 0x0100 && g.slice(1, 4).every((x) => x === 0)) return true; // discard-only 100::/64
  if (g[0] === 0x2002) return blockedV4([g[1] >> 8, g[1] & 255, g[2] >> 8, g[2] & 255]); // 6to4 wraps IPv4
  if (g[0] === 0x2001 && g[1] === 0) return true; // Teredo
  return false;
}

// Host names refused before any lookup.
export function isBlockedHost(hostname) {
  const h = String(hostname ?? '').toLowerCase().replace(/\.$/, '');
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (/\.(local|internal|intranet|lan|home|corp|localdomain|home\.arpa)$/.test(h)) return true;
  if (h === 'metadata' || h === 'metadata.google.internal') return true;
  return false;
}

// Ports a hop may use: the web's own. Anything else is refused, so the checker cannot be pointed
// at mail, database or admin ports on someone's server.
export const ALLOWED_PORTS = ['', '80', '443', '8080', '8443'];
