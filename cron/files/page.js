// The cron checker page. core.js (the same file the server runs) parses, explains and lists the
// runs in the browser as you type, so the page is free and never uses a run. The API and MCP run
// the same code on the server.
import { explain, build, instantsOf, isTimeZone, dstRuleText, DIALECTS, DIALECT_IDS, WEEKDAYS, CronError } from './core.js';

const T = window.Endwise;
const h = T.h;
const $ = (id) => document.getElementById(id);

const ZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Sao_Paulo', 'Europe/London', 'Europe/Dublin', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Helsinki', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Australia/Lord_Howe', 'Pacific/Auckland'];

function fillZones() {
  const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  const list = $('cr-zones');
  for (const z of [...new Set([...ZONES, ...all])]) list.appendChild(h('option', { value: z }));
}
function fillDays() {
  const box = $('cr-days');
  WEEKDAYS.forEach((d, i) => {
    box.appendChild(h('label', { class: 'cr-day' }, [h('input', { type: 'checkbox', value: String(i), ...(i >= 1 && i <= 5 ? { checked: '' } : {}) }), d.slice(0, 3)]));
  });
}
function fillRules() {
  const rows = $('cr-rule-rows');
  for (const id of DIALECT_IDS) {
    const D = DIALECTS[id];
    const fields = D.fields.length - (D.optional ? 1 : 0);
    rows.appendChild(h('tr', {}, [
      h('th', { scope: 'row' }, D.name),
      h('td', {}, D.optional ? `${fields} or ${fields + 1}` : String(fields)),
      h('td', {}, D.dowBase === 1 ? '1' : D.seven7 ? '0 or 7' : '0'),
      h('td', {}, D.zone.fixed ? `Always ${D.zone.fixed}` : `Default: ${D.zone.default}`),
      h('td', {}, dstRuleText(D)),
    ]));
  }
}

// The "from" box is a wall-clock time in the chosen zone.
function fromInstant(zone) {
  const v = $('cr-from').value;
  if (!v) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
  if (!m) return undefined;
  const at = instantsOf(zone, +m[1], +m[2], +m[3], +m[4], +m[5]);
  const t = at.length ? at[0] : Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return new Date(t).toISOString();
}

// One line per run: its local time, the zone and offset, and any clock-change note or its UTC time.
function runRow(r, i) {
  return h('li', { class: r.at ? (i === 0 ? 'cr-run hi' : 'cr-run') : 'cr-run sk' }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, r.at ? String(i + 1) : '×'),
    h('span', { class: 'cr-when' }, r.at ? `${r.weekday.slice(0, 3)} ${r.local}` : `${r.local} (skipped)`),
    h('b', { class: 'cr-zone' }, r.at ? `${r.abbr} (UTC${r.offset})` : ''),
    h('em', { class: r.note ? 'cr-dst' : null }, r.note ?? (r.at ? r.at.replace('T', ' ').replace(/:00Z$|Z$/, ' UTC') : '')),
  ]);
}

// The form as first served, so the result can say "Example" until it is changed.
let DEFAULTS = null;
const formNow = () => ['cr-expr', 'cr-dialect', 'cr-tz', 'cr-from', 'cr-n'].map((id) => $(id).value).join('|');

// The inputs in one line: "0 9 * * 1-5 on GitHub Actions, America/New_York, from now, 10 runs".
function inputsLine(res) {
  const from = $('cr-from').value ? `from ${$('cr-from').value.replace('T', ' ')}` : 'from now';
  return `${res.expression} on ${res.dialectName}, ${res.timeZone}, ${from}, ${$('cr-n').value} runs`;
}

function draw(res) {
  const out = $('cr-out');
  out.textContent = '';
  const real = res.nextRuns.filter((r) => r.at);
  const example = formNow() === DEFAULTS;
  out.append(
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src cr-label' }, res.dialectName),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(res)}` : inputsLine(res)),
    h('p', { class: 'tf-big' }, [h('b', { class: 'word cr-answer' }, res.description)]),
    h('p', { class: 'tf-sub' }, real.length ? `Next run: ${real[0].weekday}, ${real[0].local} ${real[0].abbr} in ${res.timeZone} (${real[0].at.replace('T', ' ').replace('Z', ' UTC')}).` : (res.neverAgain ?? 'No runs found.')),
    h('p', { class: 'cr-heading' }, `Next runs in ${res.timeZone}`),
    h('ol', { class: 'tf-items cr-runs' }, res.nextRuns.map(runRow)),
  );
  if (res.warnings.length) out.append(h('ul', { class: 'cr-warn' }, res.warnings.map((w) => h('li', {}, w))));
  out.append(h('details', { class: 'xpand' }, [
    h('summary', {}, 'What each field means'),
    h('div', { class: 'xp-in' }, h('table', { class: 'cr-fields' }, [h('tbody', {}, res.fields.map((f) => h('tr', {}, [h('th', { scope: 'row' }, f.label), h('td', {}, h('code', {}, f.text)), h('td', { class: 'muted' }, f.values ? (f.values.length > 12 ? `${f.values.length} values` : f.values.join(', ')) : 'special')])))])),
  ]));
  out.append(h('p', { class: 'tf-note' }, `Clock changes: ${res.dstRule}`));
  out.append(h('p', { class: 'tf-cost' }, ['Sources: ', ...res.sources.flatMap((s, i) => [i ? '; ' : '', h('a', { href: s.href }, s.text)]), ` (read ${res.sources[0].readOn}).`]));

  const conv = $('cr-conv');
  conv.textContent = '';
  for (const id of DIALECT_IDS) {
    const c = res.conversions[id];
    const box = h('div', { class: c.error ? 'tf-panel cr-c cr-c-no' : 'tf-panel cr-c' }, [h('h3', {}, c.name)]);
    if (c.error) box.append(h('p', { class: 'muted' }, c.error));
    else {
      for (const e of c.expressions) {
        const st = h('span', { class: 'visually-hidden', role: 'status' });
        box.append(h('p', { class: 'cr-expr' }, [h('code', {}, e), ' ', h('button', { type: 'button', class: 'btn-link', onclick: (ev) => T.copy(e, ev.target, st) }, 'Copy'), st]));
      }
      if (c.note) box.append(h('p', { class: 'small muted' }, c.note));
      box.append(h('pre', { class: 'cr-snip' }, h('code', {}, c.snippet)));
    }
    conv.append(box);
  }
}

function showError(e) {
  $('cr-expr-err').textContent = e.message;
  $('cr-out').textContent = '';
  $('cr-out').append(h('p', { class: 'muted' }, 'Fix the expression to see its runs.'));
}

function update() {
  $('cr-expr-err').textContent = '';
  const tz = $('cr-tz').value.trim();
  if (tz && !isTimeZone(tz)) { showError(new CronError(`"${tz}" is not an IANA time zone name like America/New_York.`)); return; }
  try {
    const res = explain({ expression: $('cr-expr').value, dialect: $('cr-dialect').value, timeZone: tz || undefined, from: fromInstant(tz || 'UTC'), count: Number($('cr-n').value) });
    draw(res);
    $('cr-status').textContent = res.description;
    T.track && T.track('calculate');
  } catch (e) {
    if (e instanceof CronError) showError(e); else throw e;
  }
}

function makeExpression() {
  const days = [...$('cr-days').querySelectorAll('input:checked')].map((x) => Number(x.value));
  const pattern = $('cr-pattern').value;
  try {
    const res = build({ pattern, every: Number($('cr-every').value) || 1, at: $('cr-at').value.split(',').map((s) => s.trim()).filter(Boolean), days: pattern === 'weekly' || pattern === 'daily' ? (days.length && days.length < 7 ? days : undefined) : undefined, day: Number($('cr-day').value) || 1, dialect: $('cr-dialect').value, timeZone: $('cr-tz').value.trim() || undefined });
    if (res.error) { $('cr-expr-err').textContent = res.error; return; }
    $('cr-expr').value = res.expression;
    update();
  } catch (e) {
    if (e instanceof CronError) $('cr-expr-err').textContent = e.message; else throw e;
  }
}

// ?expr=0 9 * * 1-5&dialect=github&tz=America/New_York&from=2027-03-13T00:00&n=10
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const expr = q.get('expr');
  if (expr !== null && expr.length <= 200) $('cr-expr').value = expr;
  const d = q.get('dialect');
  if (d && DIALECT_IDS.includes(d)) $('cr-dialect').value = d;
  const tz = q.get('tz');
  if (tz !== null && tz.length <= 64) $('cr-tz').value = tz;
  const from = q.get('from');
  if (from && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(from)) $('cr-from').value = from;
  const n = q.get('n');
  if (n && ['5', '10', '20', '50'].includes(n)) $('cr-n').value = n;
}

fillZones();
fillDays();
fillRules();
fromQuery();
DEFAULTS = new URLSearchParams(location.search).toString() ? null : formNow();
for (const id of ['cr-expr', 'cr-tz', 'cr-from']) $(id).addEventListener('input', update);
for (const id of ['cr-dialect', 'cr-n']) $(id).addEventListener('change', update);
$('cr-make').addEventListener('click', makeExpression);
$('cr-form').addEventListener('submit', (e) => { e.preventDefault(); update(); });
update();
