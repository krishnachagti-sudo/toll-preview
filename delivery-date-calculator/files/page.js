// The delivery date page. core.js (the same file the server runs) works out the worked example and
// draws the two calendars; it is built on the Business days engine, loaded from that tool's files.
// The USPS tables come from this tool's published calendar example, so the page and the server
// read the same dated data. The answer for a real run always comes from the server through Endwise.run.
import * as businessDays from '../../business-days/files/core.js';
import {
  makeEngine, bannerSnippet, longDate, weekdaySpan, shortDate, clockText, parseClock, wallClock, zoneName,
  WEEKDAY_KEYS, WEEKDAYS, DEFAULT_STORE, MIN_YEAR, MAX_YEAR, YEAR_MESSAGE,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'delivery-date-calculator';
const MAX_DRAWN_DAYS = 42;

const $ = (id) => document.getElementById(id);
const pick = (name) => document.querySelector(`input[name="${name}"]:checked`).value;
const mode = () => pick('op');
const carrierPick = () => pick('carrier');

let engine = null;

// ---------- the form ----------

function dayBoxes(el, name, checked) {
  el.textContent = '';
  for (const k of [...WEEKDAY_KEYS.slice(1), 'sun']) {
    const i = WEEKDAY_KEYS.indexOf(k);
    el.appendChild(h('label', { class: 'dd-day-box' }, [
      h('input', { type: 'checkbox', name, value: k, checked: checked.includes(k) ? '' : null }),
      h('span', {}, WEEKDAYS[i].slice(0, 3)),
    ]));
  }
}
const checkedDays = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((x) => x.value);

function fillDestinations() {
  const sel = $('dd-dest');
  sel.textContent = '';
  for (const [key, label] of Object.entries(engine.deadlines.rows.reduce((m, r) => ({ ...m, [r.destination]: r.destinationName }), {}))) {
    sel.appendChild(h('option', { value: key }, label));
  }
}

function syncMode() {
  const m = mode();
  const c = carrierPick();
  for (const el of document.querySelectorAll('[data-mode]')) {
    if (el.tagName === 'OPTION') { el.hidden = el.dataset.mode !== m; continue; }
    el.hidden = el.dataset.mode !== m || (el.dataset.carrier && el.dataset.carrier !== c);
  }
  for (const el of document.querySelectorAll('[data-carrier]')) {
    if (el.dataset.mode && el.dataset.mode !== m) continue;
    el.hidden = el.dataset.carrier !== c;
  }
  const svc = $('dd-service');
  if (m === 'delivery-date' && svc.value === '') svc.value = 'ground-advantage';
  $('dd-cutoff').disabled = $('dd-nocut').checked;
  $('dd-run').textContent = m === 'order-by' ? 'Find the last day to order' : 'Find the delivery date';
  storeSummary();
  carrierSummary();
}

// The folded carrier settings say what they are set to: "USPS, every service, to Contiguous US".
const plainLabel = (sel) => sel.selectedOptions[0]?.textContent.replace(/ \(.*\)$/, '') ?? '';
function carrierSummary() {
  const m = mode();
  const text = carrierPick() === 'usps'
    ? `USPS, ${$('dd-service').value ? plainLabel($('dd-service')) : 'every service'}${m === 'order-by' && $('dd-dest').value ? `, to ${plainLabel($('dd-dest'))}` : ''}`
    : ($('dd-other-name').value.trim() || 'another carrier');
  $('dd-carrier-sum').textContent = text;
}

// The folded store settings say what they are set to: "Eastern, 2:00 pm cutoff, 1 processing day".
function storeSummary() {
  const zone = $('dd-tz').selectedOptions[0]?.textContent.replace(/ \(.*\)$/, '') ?? '';
  const cut = $('dd-nocut').checked ? 'no cutoff' : (parseClock($('dd-cutoff').value) === null ? 'no cutoff set' : `${clockText(parseClock($('dd-cutoff').value))} cutoff`);
  const p = $('dd-processing').value.trim();
  const days = p === '' ? '' : `, ${p} processing ${p === '1' ? 'day' : 'days'}`;
  $('dd-store-sum').textContent = `${zone}, ${cut}${days}`;
}

const FIELD_ERRORS = {
  deliverBy: 'dd-by-err', orderAt: 'dd-order-err', cutoff: 'dd-cutoff-err', shipDays: 'dd-ship-err', processingDays: 'dd-processing-err',
  processingDaysMax: 'dd-processing-err', closures: 'dd-closures-err', transitDays: 'dd-transit-err', transitDaysMax: 'dd-transit-err',
  carrierClosures: 'dd-carrier-closures-err',
};

function clearErrors() {
  $('dd-error').textContent = '';
  for (const id of new Set(Object.values(FIELD_ERRORS))) $(id).textContent = '';
}
// The server names a bad list entry by its place (carrierClosures.2); it shows under the list's box.
const fieldOf = (k) => k.split('.')[0];

function showFieldErrors(fields) {
  const known = Object.keys(fields).filter((k) => FIELD_ERRORS[fieldOf(k)]);
  for (const k of known) {
    const el = $(FIELD_ERRORS[fieldOf(k)]);
    el.textContent = fields[k];
    // A message inside the folded store settings opens the fold, so it is seen.
    const fold = el.closest('details');
    if (fold) fold.open = true;
  }
  return known.length === Object.keys(fields).length;
}

const inYears = (iso) => { const y = Number(iso.slice(0, 4)); return y >= MIN_YEAR && y <= MAX_YEAR; };
const CLOSURE_RE = /^(\d{4}-\d{2}-\d{2})(?:\s*(?:to|-|–)\s*(\d{4}-\d{2}-\d{2}))?\s*(.*)$/;
const wholeOrBlank = (raw) => (raw.trim() === '' ? undefined : Number(raw));
const isDays = (n) => Number.isInteger(n) && n >= 0 && n <= 60;
const MAX_CARRIER_CLOSURES = 60;

// The carrier closures box: dates one per line or comma separated, as pasted from a carrier's
// holiday page. { dates } sorted and once each, or { error } naming the first entry it could not read.
function readCarrierClosures(raw) {
  const dates = new Set();
  for (const item of raw.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean)) {
    if (!businessDays.isRealDate(item)) return { error: `Could not read "${item.slice(0, 40)}". Write each date like 2026-12-26, one per line or comma separated.` };
    if (!inYears(item)) return { error: YEAR_MESSAGE };
    dates.add(item);
  }
  if (dates.size > MAX_CARRIER_CLOSURES) return { error: `At most ${MAX_CARRIER_CLOSURES} carrier closures.` };
  return { dates: [...dates].sort() };
}

// { input } for a good form, or { errors } for a bad one, so a typo never spends a run.
function readForm() {
  const errors = {};
  const input = { op: mode(), timeZone: $('dd-tz').value };
  if ($('dd-nocut').checked) input.cutoff = null;
  else if (parseClock($('dd-cutoff').value) === null) errors.cutoff = 'Pick a cutoff time, or tick "No cutoff".';
  else input.cutoff = $('dd-cutoff').value;
  input.shipDays = checkedDays('ship');
  if (!input.shipDays.length) errors.shipDays = 'Pick at least one day you ship.';
  input.federalHolidays = $('dd-federal').checked;
  const p = Number($('dd-processing').value);
  if ($('dd-processing').value.trim() === '' || !isDays(p)) errors.processingDays = 'Processing days must be a whole number from 0 to 60.';
  else input.processingDays = p;
  const closures = [];
  for (const line of $('dd-closures').value.split('\n').map((x) => x.trim()).filter(Boolean)) {
    const m = CLOSURE_RE.exec(line);
    if (!m || !businessDays.isRealDate(m[1]) || (m[2] && !businessDays.isRealDate(m[2]))) { errors.closures = `Could not read "${line}". Write 2026-12-22 or 2026-12-22 to 2026-12-23, then a name.`; break; }
    closures.push({ date: m[1], ...(m[2] ? { to: m[2] } : {}), ...(m[3] ? { name: m[3].slice(0, 80) } : {}) });
  }
  if (closures.length) input.closures = closures;

  input.carrier = carrierPick();
  if (input.carrier === 'usps') {
    if ($('dd-service').value) input.service = $('dd-service').value;
  } else {
    if ($('dd-other-name').value.trim()) input.service = $('dd-other-name').value.trim().slice(0, 60);
    input.deliveryDays = checkedDays('deliver');
    if (!input.deliveryDays.length) errors.transitDays = 'Pick at least one day the carrier delivers.';
    input.carrierHolidays = $('dd-carrier-fed').checked ? 'federal' : 'none';
    const cc = readCarrierClosures($('dd-carrier-closures').value);
    if (cc.error) errors.carrierClosures = cc.error;
    else if (cc.dates.length) input.carrierClosures = cc.dates;
  }
  const t = wholeOrBlank($('dd-transit').value);
  const tMax = wholeOrBlank($('dd-transit-max').value);
  if (t !== undefined && !isDays(t)) errors.transitDays = 'Transit days must be a whole number from 0 to 60.';
  else if (tMax !== undefined && (!isDays(tMax) || t === undefined || tMax < t)) errors.transitDays = 'Give the fewest transit days, and an "up to" that is not fewer.';
  else {
    if (t !== undefined) input.transitDays = t;
    if (tMax !== undefined) input.transitDaysMax = tMax;
  }

  if (input.op === 'order-by') {
    const by = $('dd-by').value;
    const sendBy = input.carrier === 'other' ? $('dd-sendby').value : '';
    if (sendBy) input.sendBy = sendBy;
    if (!by && !sendBy) errors.deliverBy = 'Pick the date it must arrive by.';
    else if (by && !inYears(by)) errors.deliverBy = YEAR_MESSAGE;
    if (by) input.deliverBy = by;
    if (input.carrier === 'usps') input.destination = $('dd-dest').value || 'contiguous';
    if (input.carrier === 'other' && !sendBy && t === undefined) errors.transitDays = 'Give transit days, or the carrier\'s send-by date.';
  } else {
    const d = $('dd-order-date').value;
    const time = $('dd-order-time').value || '12:00';
    if (!d) errors.orderAt = 'Pick the order date.';
    else if (!inYears(d)) errors.orderAt = YEAR_MESSAGE;
    else input.orderAt = `${d}T${time}`;
    if (input.carrier === 'other' && t === undefined) errors.transitDays = 'Give the carrier\'s transit days.';
  }
  return Object.keys(errors).length ? { errors } : { input };
}

// ---------- drawing ----------

const timeIn = (iso, tz) => { const ms = Date.parse(iso); const w = wallClock(ms, tz); return `${shortDate(w.date)}, ${clockText(w.minutes)} ${zoneName(ms, tz)}`; };

function stepsList(steps) {
  return h('ol', { class: 'dd-steps' }, steps.map((s) => h('li', {}, s)));
}

function skippedList(skipped) {
  if (!skipped.length) return h('p', { class: 'dd-none' }, 'No holiday or closure fell in the way.');
  return h('ul', { class: 'dd-skipped' }, skipped.map((x) => h('li', {}, [
    h('span', { class: `dd-dot ${x.calendar}`, 'aria-hidden': 'true' }),
    h('span', { class: 'when' }, shortDate(x.date)),
    h('span', {}, x.name),
    h('span', { class: 'dd-which' }, x.calendar === 'store' ? 'your calendar' : 'carrier calendar'),
  ])));
}

// The two calendars side by side, one column per day: does the store ship, does the carrier deliver.
function strip(input, from, to, marks) {
  const span = businessDays.dayNumber(to) - businessDays.dayNumber(from) + 1;
  if (span > MAX_DRAWN_DAYS) return h('p', { class: 'dd-aside' }, `That is ${span} days, too many to draw one by one; the steps above list every day skipped.`);
  const days = engine.twoCalendars(input, from, to);
  const cells = days.map((d) => {
    const mark = marks[d.date];
    const said = [shortDate(d.date), d.store ? `store: ${d.store}` : 'store ships', d.carrier ? `carrier: ${d.carrier}` : 'carrier delivers', ...(mark ? [mark] : [])].join('. ');
    return h('li', { class: `dd-col${mark ? ' marked' : ''}`, title: said }, [
      h('span', { class: 'dd-col-date', 'aria-hidden': 'true' }, [h('b', {}, WEEKDAYS[d.weekday].slice(0, 2)), String(Number(d.date.slice(8)))]),
      h('span', { class: `dd-cell store${d.store ? ' off' : ''}`, 'aria-hidden': 'true' }),
      h('span', { class: `dd-cell carrier${d.carrier ? ' off' : ''}`, 'aria-hidden': 'true' }),
      mark ? h('span', { class: 'dd-col-mark', 'aria-hidden': 'true' }, mark) : null,
      h('span', { class: 'endwise-visually-hidden' }, said),
    ]);
  });
  return h('div', { class: 'dd-strip-wrap' }, [
    h('div', { class: 'dd-strip-rows', 'aria-hidden': 'true' }, [h('span', {}, ''), h('span', {}, 'Store ships'), h('span', {}, 'Carrier delivers')]),
    h('ol', { class: 'dd-strip', 'aria-label': 'Your shipping days and the carrier\'s delivery days' }, cells),
  ]);
}

function legend() {
  return h('ul', { class: 'dd-legend', 'aria-label': 'Key' }, [
    h('li', {}, [h('span', { class: 'dd-key store' }), 'Store ships']),
    h('li', {}, [h('span', { class: 'dd-key carrier' }), 'Carrier delivers']),
    h('li', {}, [h('span', { class: 'dd-key off' }), 'Closed']),
  ]);
}

// The inputs in one line, for the Example line: "Arrive by Thursday, December 24, 2026; Eastern,
// 2:00 pm cutoff, ships Monday to Friday, 1 processing day; USPS, every service".
const zoneLabel = (tz) => [...$('dd-tz').options].find((o) => o.value === tz)?.textContent.replace(/ \(.*\)$/, '') ?? tz;
function inputsLine(input) {
  const day = (iso) => `${shortDate(iso)}, ${iso.slice(0, 4)}`;
  const when = input.op === 'order-by'
    ? (input.deliverBy ? `Arrive by ${day(input.deliverBy)}` : `Send by ${day(input.sendBy)}`)
    : `Ordered ${day(input.orderAt.slice(0, 10))}, ${clockText(parseClock(input.orderAt.slice(11, 16)))}`;
  const cut = input.cutoff === null ? 'no cutoff' : `${clockText(parseClock(input.cutoff))} cutoff`;
  const store = `${zoneLabel(input.timeZone)}, ${cut}, ships ${weekdaySpan(input.shipDays)}, ${input.processingDays} processing ${input.processingDays === 1 ? 'day' : 'days'}`;
  const carrier = input.carrier === 'usps'
    ? `USPS, ${input.service ? plainLabel($('dd-service')) : 'every service'}${input.op === 'order-by' ? `, to ${plainLabel($('dd-dest')) || input.destination}` : ''}`
    : `${input.service || 'another carrier'}${input.transitDays !== undefined ? `, ${input.transitDays}${input.transitDaysMax !== undefined && input.transitDaysMax !== input.transitDays ? ` to ${input.transitDaysMax}` : ''} transit days` : ''}`;
  return `${when}; ${store}; ${carrier}`;
}

// Merge runs of the same skipped reason into one line, and long runs of counted days when the list
// is long, so it stays readable.
const MAX_ITEMS = 14;
// "Saturday, not a shipping day" beside "Sat, Dec 12" says the weekday once.
const reason = (x) => String(x).replace(/^(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day, /, '');
function foldRows(rows) {
  const merged = [];
  for (const r of rows) {
    const prev = merged[merged.length - 1];
    if (r.kind === 'skip' && prev?.kind === 'skip' && prev.em === r.em && !prev.mark) { prev.to = r.date; continue; }
    merged.push({ ...r, to: r.date });
  }
  if (merged.length <= MAX_ITEMS) return merged;
  const out = [];
  for (const r of merged) {
    const prev = out[out.length - 1];
    if (r.kind === prev?.kind && (r.kind === 'proc' || r.kind === 'transit') && !r.mark && !prev.mark) {
      prev.to = r.date; prev.k = r.k; prev.em = `${r.kind === 'proc' ? 'processing days' : 'transit days'} ${prev.from} to ${r.k}`; continue;
    }
    out.push({ ...r, from: r.k });
  }
  return out;
}

function itemList(rows) {
  const cls = { skip: 'sk', order: 'plain', mark: 'hi' };
  return h('ol', { class: 'tf-items' }, rows.map((r) => h('li', { class: [r.kind === 'skip' ? cls.skip : '', r.kind === 'order' ? cls.order : '', r.mark ? cls.mark : ''].filter(Boolean).join(' ') || null }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, String(r.k)),
    h('span', {}, r.to && r.to !== r.date ? `${shortDate(r.date)} to ${shortDate(r.to)}` : shortDate(r.date)),
    h('em', {}, r.em),
  ])));
}

// One line per day from the order to the latest arrival: when it is received, each processing day,
// the handover, each transit day, and every day skipped with its reason and whose calendar.
function deliveryItems(input, r) {
  const from = r.orderLocal.slice(0, 10);
  const to = r.arrives.latest;
  const span = businessDays.dayNumber(to) - businessDays.dayNumber(from) + 1;
  if (span > MAX_DRAWN_DAYS) return null;
  const days = engine.twoCalendars(input, from, to);
  const rows = [];
  let p = 0;
  let t = 0;
  const procMax = input.processingDaysMax ?? input.processingDays ?? 0;
  for (const d of days) {
    const row = { date: d.date };
    if (d.date === from && d.date !== r.received) {
      Object.assign(row, { kind: 'order', k: '×', em: r.afterCutoff && !d.store ? `ordered ${clockText(parseClock(r.orderLocal.slice(11)))}, after the cutoff` : `ordered; your calendar: ${reason(d.store ?? 'closed')}` });
    } else if (d.date < r.received) {
      Object.assign(row, { kind: 'skip', k: '×', em: `your calendar: ${reason(d.store ?? 'closed')}` });
    } else if (d.date === r.received) {
      Object.assign(row, { kind: 'mark', mark: true, k: 'In', em: d.date === r.ships.earliest ? 'received and handed to the carrier' : (d.date === from ? 'ordered and received' : 'received') });
    } else if (d.date <= r.ships.latest) {
      if (d.store) Object.assign(row, { kind: 'skip', k: '×', em: `your calendar: ${reason(d.store)}` });
      else {
        const ship = d.date === r.ships.earliest || d.date === r.ships.latest;
        const counted = p < procMax;
        if (counted) p += 1;
        const what = counted ? `processing day ${p}` : '';
        if (ship) Object.assign(row, { kind: 'mark', mark: true, k: 'Out', em: what ? `${what}, handed to the carrier` : 'handed to the carrier' });
        else Object.assign(row, { kind: 'proc', k: counted ? p : '·', em: what || 'waiting for a carrier delivery day' });
      }
    } else {
      if (d.carrier) Object.assign(row, { kind: 'skip', k: '×', em: `carrier calendar: ${reason(d.carrier)}` });
      else {
        t += 1;
        const due = d.date === r.arrives.earliest || d.date === r.arrives.latest;
        const which = r.arrives.earliest === r.arrives.latest ? 'arrives' : d.date === r.arrives.earliest ? 'earliest arrival' : 'latest arrival';
        Object.assign(row, { kind: due ? 'mark' : 'transit', mark: due, k: t, em: due ? `transit day ${t}, ${which}` : `transit day ${t}` });
      }
    }
    rows.push(row);
  }
  return itemList(foldRows(rows));
}

function renderDelivery(input, r) {
  const same = r.arrives.earliest === r.arrives.latest;
  const marks = { [r.received]: 'In', [r.ships.earliest]: 'Out', [r.arrives.earliest]: 'Due' };
  if (!same) marks[r.arrives.latest] = 'Due';
  if (r.received === r.ships.earliest) marks[r.received] = 'In, out';
  const items = deliveryItems(input, r);
  return [
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, same ? shortDate(r.arrives.earliest) : `${shortDate(r.arrives.earliest)} to ${shortDate(r.arrives.latest)}`), h('span', {}, 'arrives')]),
    h('p', { class: 'tf-sub' }, r.answer),
    h('p', { class: 'tf-note' }, `Ships ${r.ships.earliest === r.ships.latest ? shortDate(r.ships.earliest) : `${shortDate(r.ships.earliest)} to ${shortDate(r.ships.latest)}`}. The same answer holds for orders until ${timeIn(r.validUntil, r.timeZone)}.`),
    items ?? h('p', { class: 'tf-note' }, 'Too many days to list one by one; the steps below name every day skipped.'),
    h('details', { class: 'xpand dd-how' }, [
      h('summary', {}, `How it was worked out, and the holidays and closures skipped (${r.skipped.length})`),
      h('div', { class: 'xp-in' }, [stepsList(r.steps), skippedList(r.skipped)]),
    ]),
    strip(input, r.orderLocal.slice(0, 10), r.arrives.latest, marks),
    legend(),
  ];
}

// One line per service: its last order moment, and where that comes from (the carrier's send-by
// date or its transit days, and the handover day).
function deadlineItems(r) {
  return h('ol', { class: 'tf-items dd-deadlines' }, r.deadlines.map((d, i) => h('li', { class: d.stillPossible ? (d.service === r.nextDeadline?.service ? 'hi' : null) : 'dim' }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, d.stillPossible ? String(i + 1) : '×'),
    h('span', {}, d.name),
    h('b', {}, timeIn(d.lastOrderAt, r.timeZone)),
    h('em', {}, `${d.carrierSendBy ? `carrier send-by ${shortDate(d.carrierSendBy)}` : `${d.transitDays.max}-day transit`} · hand over by ${shortDate(d.shipBy)} · ${d.stillPossible ? 'Open' : 'Passed'}`),
  ])));
}

function renderOrderBy(input, r) {
  const next = r.nextDeadline;
  const out = [];
  if (next) {
    const w = wallClock(Date.parse(next.lastOrderAt), r.timeZone);
    out.push(h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, shortDate(w.date)), h('span', {}, `${clockText(w.minutes)} ${zoneName(Date.parse(next.lastOrderAt), r.timeZone)}, last order${next.name ? ` by ${next.name}` : ''}`)]));
  } else if (r.deadlines.length) {
    out.push(h('p', { class: 'tf-big dd-late' }, [h('b', { class: 'word' }, 'Too late'), h('span', {}, 'every deadline has passed')]));
  } else {
    out.push(h('p', { class: 'tf-big dd-late' }, [h('b', { class: 'word' }, 'No date')]));
  }
  out.push(h('p', { class: 'tf-sub' }, r.answer));
  if (r.deadlines.length) out.push(deadlineItems(r));
  for (const u of r.unavailable) out.push(h('p', { class: 'tf-note' }, `${u.name}: ${u.note}`));
  if (r.source) out.push(h('p', { class: 'tf-note' }, ['Send-by dates: ', h('a', { href: r.source.url }, r.source.title), `, read ${longDate(r.source.readOn)}.`]));
  for (const d of r.deadlines) {
    out.push(h('details', { class: 'xpand dd-why' }, [
      h('summary', {}, `Why ${shortDate(d.lastOrderDate)} for ${d.name}`),
      h('div', { class: 'xp-in' }, [stepsList(d.steps), skippedList(d.skipped)]),
    ]));
  }
  if (r.deadlines.length) {
    const first = r.deadlines.reduce((a, b) => (a.lastOrderDate < b.lastOrderDate ? a : b)).lastOrderDate;
    const to = r.deliverBy ?? r.deadlines[r.deadlines.length - 1].shipBy;
    // Marks for the first deadline (the slowest service still listed), so each day carries one.
    const d0 = r.deadlines[0];
    const marks = { [to]: 'Due', [d0.shipBy]: 'Out', [d0.lastOrderDate]: d0.lastOrderDate === d0.shipBy ? 'Last, out' : 'Last' };
    out.push(h('p', { class: 'dd-heading' }, `The two calendars, for ${d0.name}`));
    out.push(strip(input, first, to, marks), legend());
    out.push(bannerMaker(input, r));
  }
  return out;
}

function bannerMaker(input, r) {
  const box = h('div', { class: 'dd-banner' });
  const md = (r.deliverBy ?? '').slice(5);
  const occasionBox = h('input', { type: 'text', id: 'dd-occasion', maxlength: '40', value: md >= '12-24' && md <= '12-25' ? 'Christmas' : '', placeholder: 'Christmas' });
  const button = h('button', { class: 'btn btn-quiet btn-small', type: 'button' }, 'Make the banner code');
  const made = h('div', {});
  button.addEventListener('click', () => {
    const code = bannerSnippet(r, { occasion: occasionBox.value.trim() || 'Christmas' });
    const area = h('textarea', { class: 'dd-banner-code', rows: '8', readonly: true, 'aria-label': 'Banner code' }, code);
    const status = h('span', { class: 'hint', role: 'status' });
    const copy = h('button', { class: 'btn btn-small', type: 'button' }, 'Copy the code');
    copy.addEventListener('click', () => T.copy(code, area, status));
    // The preview is the banner's own markup, as the visitor first sees it.
    const doc = new DOMParser().parseFromString(code, 'text/html');
    const preview = h('div', { class: 'dd-banner-preview' }, document.importNode(doc.querySelector('[data-order-by-banner]'), true));
    made.textContent = '';
    made.append(preview, area, h('p', {}, [copy, ' ', status]),
      h('p', { class: 'dd-aside' }, ['Paste it into any page. ', h('a', { href: '#dd-banner-doc' }, 'How the banner works'), '.']));
  });
  box.append(
    h('p', { class: 'dd-heading' }, 'Order-by banner for your site'),
    h('div', { class: 'field dd-occasion' }, [h('label', { for: 'dd-occasion' }, 'The banner says "for ... delivery"'), occasionBox]),
    button, made,
  );
  return box;
}

// kind: 'example' (worked out on the page, free) or 'run' (a real call). note: the line under the result.
function render(input, result, { kind, note }) {
  const out = $('dd-out');
  out.textContent = '';
  const src = result.op === 'order-by'
    ? `${result.carrier === 'usps' ? 'USPS' : 'Your carrier'} · ${zoneLabel(result.timeZone)}`
    : `${result.carrier.name} · ${zoneLabel(result.timeZone)}`;
  out.appendChild(h('div', {}, [
    h('div', { class: 'tf-rh' }, [
      kind === 'example' ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, src),
    ]),
    h('p', { class: 'tf-exin' }, kind === 'example' ? `Example: ${inputsLine(input)}` : inputsLine(input)),
    ...(result.op === 'order-by' ? renderOrderBy(input, result) : renderDelivery(input, result)),
    note ? h('p', { class: 'tf-cost' }, note) : null,
  ]));
  $('dd-status').textContent = kind === 'run' ? result.answer : '';
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return null;
}

function showError(e) {
  const fields = e.fields || {};
  if (showFieldErrors(fields) && Object.keys(fields).length) return;
  const box = $('dd-error');
  box.textContent = e.message;
  if (e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const read = readForm();
  if (read.errors) { showFieldErrors(read.errors); return; }
  const button = $('dd-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, read.input);
    render(read.input, json.result, { kind: 'run', note: costNote(json) });
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// The price line: three short parts, the first two filled from the live price and the account.
function showPrice(tool) {
  T.me().then((account) => {
    const price = tool.price.display;
    const parts = $('dd-price').querySelectorAll('span');
    parts[0].textContent = `${T.money(price)} a run`;
    parts[1].textContent = account ? 'taken from your balance' : '5 free runs a day, no card needed';
    $('dd-run-note').textContent = '';
  }).catch(() => {});
}

// ---------- inputs from the address ----------

// Links from the deadline pages carry the settings (?op=order-by&by=2026-12-24&service=priority-mail
// &processing=1&cutoff=14:00&tz=America/New_York&ship=mon,tue,wed,thu,fri&dest=contiguous): the
// page opens with them filled in and worked out here, free. Anything unusable is ignored.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return false;
  const set = (id, v) => { if (v !== null && v !== '') $(id).value = v; };
  if (q.get('op') === 'delivery-date' || q.get('op') === 'order-by') document.querySelector(`input[name="op"][value="${q.get('op')}"]`).checked = true;
  if (q.get('carrier') === 'other') document.querySelector('input[name="carrier"][value="other"]').checked = true;
  if (q.get('tz') && [...$('dd-tz').options].some((o) => o.value === q.get('tz'))) $('dd-tz').value = q.get('tz');
  if (q.get('cutoff') === 'none') $('dd-nocut').checked = true; else if (parseClock(q.get('cutoff')) !== null) $('dd-cutoff').value = q.get('cutoff');
  if (q.get('ship')) dayBoxes($('dd-ship'), 'ship', q.get('ship').split(',').filter((k) => WEEKDAY_KEYS.includes(k)));
  if (q.get('processing') && isDays(Number(q.get('processing')))) $('dd-processing').value = q.get('processing');
  if (q.get('service') !== null && [...$('dd-service').options].some((o) => o.value === q.get('service'))) $('dd-service').value = q.get('service');
  if (q.get('dest') && [...$('dd-dest').options].some((o) => o.value === q.get('dest'))) $('dd-dest').value = q.get('dest');
  if (q.get('by') && businessDays.isRealDate(q.get('by'))) set('dd-by', q.get('by'));
  if (q.get('transit') && isDays(Number(q.get('transit')))) set('dd-transit', q.get('transit'));
  const order = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(q.get('order') ?? '');
  if (order && businessDays.isRealDate(order[1])) { set('dd-order-date', order[1]); set('dd-order-time', order[2]); }
  return true;
}

function workedOut(input) {
  try {
    return input.op === 'order-by' ? engine.orderBy(input) : engine.deliveryDate(input);
  } catch {
    return null;
  }
}

// ---------- start ----------

async function start() {
  dayBoxes($('dd-ship'), 'ship', DEFAULT_STORE.shipDays);
  dayBoxes($('dd-deliver'), 'deliver', ['mon', 'tue', 'wed', 'thu', 'fri']);
  document.querySelectorAll('input[name="op"], input[name="carrier"], #dd-nocut').forEach((el) => el.addEventListener('change', syncMode));
  for (const id of ['dd-tz', 'dd-cutoff', 'dd-processing']) $(id).addEventListener('input', storeSummary);
  for (const id of ['dd-service', 'dd-dest', 'dd-other-name']) $(id).addEventListener('input', carrierSummary);
  $('dd-form').addEventListener('submit', onSubmit);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('dd-code'), SLUG);

  let tool;
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('dd-out').textContent = 'The worked example could not load. The calculator still works: press the button to run it.';
    syncMode();
    return;
  }
  showPrice(tool);
  const cal = tool.examples.find((x) => x.input.op === 'calendar' && x.output.holidayDeadlines).output;
  engine = makeEngine(businessDays, { deadlines: cal.holidayDeadlines, standards: cal.serviceStandards });
  fillDestinations();
  carrierSummary();

  const linked = fromQuery();
  syncMode();
  const read = readForm();
  const result = read.input && workedOut(read.input);
  if (result) {
    render(read.input, result, {
      kind: 'example',
      note: `Worked out on this page${linked ? ' from the link you followed' : ` for a store in ${$('dd-tz').selectedOptions[0].textContent} time`}. Press "${$('dd-run').textContent}" to run it for real.`,
    });
  } else {
    $('dd-out').textContent = 'Change the settings and press the button to work it out.';
  }
}

start();
