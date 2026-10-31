// Delivery dates and holiday order-by dates for a store that ships with a carrier.
//
// Pure and dependency-free: Node (tool.js, pages.js, tests) and the browser (page.js) load this
// same file, so it imports nothing. The day arithmetic and the US federal holidays come from the
// Business days engine (tools/business-days/core.js), which every caller imports and hands in:
//
//   const engine = makeEngine(businessDays, carriers);
//
// carriers is { deadlines, standards }: the USPS holiday send-by table and the USPS delivery times,
// normalised from the dated, sourced files in data/ by tool.js (see carriersFromFiles).
//
// Two calendars, never one:
//  - the store's shipping calendar: the weekdays it ships, its own closures and, if it follows
//    them, the federal holidays as OPM observes them (a Saturday holiday is a Friday off);
//  - the carrier's delivery calendar: USPS delivers Monday to Saturday and closes on postal
//    holidays, which do not follow OPM's observed Fridays (USPS is open with normal delivery on the
//    Friday before a Saturday holiday and closed on the Saturday; a Sunday holiday closes the
//    Monday). Priority Mail Express delivers every day. For another carrier the caller says which
//    weekdays it delivers and which holidays it keeps.
//
// The order is received on the order day if that is a shipping day and it is before the cutoff,
// else on the next shipping day. Processing days are whole shipping days after that (0 ships the
// same day). The parcel is handed over on the first day both the store ships and the carrier
// accepts, and transit days are carrier delivery days after the handover day.

export const MIN_YEAR = 2020;
export const MAX_YEAR = 2035;
export const YEAR_MESSAGE = `Dates must fall between ${MIN_YEAR} and ${MAX_YEAR}.`;
export const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const DOMESTIC_SERVICES = ['ground-advantage', 'first-class-mail', 'priority-mail', 'priority-mail-express'];
export const DEFAULT_STORE = {
  timeZone: 'America/New_York',
  cutoff: '14:00',
  shipDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  federalHolidays: true,
  processingDays: 1,
};
const SEARCH_LIMIT = 400;

// A problem with the inputs that the caller can fix; field names the input it is about.
export class DeliveryError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'DeliveryError';
    if (field) this.field = field;
  }
}

// ---------- words ----------

const part = (iso) => iso.split('-').map(Number);
const pad2 = (n) => String(n).padStart(2, '0');
const weekdayOfDay = (n) => (((n + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday

export function weekdayName(iso) {
  const [y, m, d] = part(iso);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
// "Wednesday, December 16, 2026"
export function longDate(iso) {
  const [y, m, d] = part(iso);
  return `${weekdayName(iso)}, ${MONTHS[m - 1]} ${d}, ${y}`;
}
// "Wednesday, December 16"
export function dayDate(iso) {
  const [, m, d] = part(iso);
  return `${weekdayName(iso)}, ${MONTHS[m - 1]} ${d}`;
}
// "Wed, Dec 16"
export function shortDate(iso) {
  const [, m, d] = part(iso);
  return `${weekdayName(iso).slice(0, 3)}, ${MONTHS[m - 1].slice(0, 3)} ${d}`;
}
// 840 -> "2:00 pm"
export function clockText(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${pad2(m)} ${h < 12 ? 'am' : 'pm'}`;
}
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const range = (a, b, unit) => (a === b ? plural(a, unit, `${unit}s`) : `${a} to ${b} ${unit}s`);
const listOf = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);
export function weekdaySpan(keys) {
  const idx = WEEKDAY_KEYS.map((k, i) => (keys.includes(k) ? i : -1)).filter((i) => i >= 0);
  const monFirst = [...idx].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const run = monFirst.every((v, i) => i === 0 || (monFirst[i - 1] + 1) % 7 === v);
  if (monFirst.length === 7) return 'every day';
  if (run && monFirst.length > 2) return `${WEEKDAYS[monFirst[0]]} to ${WEEKDAYS[monFirst[monFirst.length - 1]]}`;
  return listOf(monFirst.map((i) => WEEKDAYS[i]));
}

// ---------- time zones ----------

const fmtCache = new Map();
function formatter(tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

export function isTimeZone(tz) {
  if (typeof tz !== 'string' || !tz) return false;
  try { formatter(tz); return true; } catch { return false; }
}

// The wall clock in a zone at an instant: { date: 'YYYY-MM-DD', minutes, seconds }.
export function wallClock(ms, tz) {
  const p = {};
  for (const x of formatter(tz).formatToParts(new Date(ms))) p[x.type] = x.value;
  const hour = Number(p.hour) % 24;
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: hour * 60 + Number(p.minute), seconds: Number(p.second) };
}

function offsetAt(ms, tz) {
  const w = wallClock(ms, tz);
  const [y, m, d] = part(w.date);
  return Date.UTC(y, m - 1, d, 0, w.minutes, w.seconds) - Math.floor(ms / 1000) * 1000;
}

// The instant a wall-clock time happens in a zone. A time skipped by a daylight-saving change
// resolves to the hour before it, so a cutoff is never later than the store meant.
export function instantAt(iso, minutes, tz) {
  const [y, m, d] = part(iso);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  const first = guess - offsetAt(guess, tz);
  return guess - offsetAt(first, tz);
}

// "EST", "PDT": the zone's short name at an instant (as the runtime's time-zone data spells it).
export function zoneName(ms, tz) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date(ms));
  return p.find((x) => x.type === 'timeZoneName')?.value ?? tz;
}

const isoInstant = (ms) => new Date(ms).toISOString().replace('.000Z', 'Z');
const ORDER_AT_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/;

// An order time: with a zone offset or Z it is an instant; without, it is the store's wall clock.
export function parseOrderAt(text, tz) {
  const m = ORDER_AT_RE.exec(text);
  if (!m) throw new DeliveryError('Times must look like 2026-12-11T15:12 (store time) or 2026-12-11T20:12:00Z.', 'orderAt');
  const [, date, hh, mm, ss = '00', zone] = m;
  if (Number(hh) > 23 || Number(mm) > 59 || Number(ss) > 59) throw new DeliveryError('That time of day does not exist.', 'orderAt');
  if (!zone) return instantAt(date, Number(hh) * 60 + Number(mm), tz) + Number(ss) * 1000;
  const ms = Date.parse(`${date}T${hh}:${mm}:${ss}${zone}`);
  if (Number.isNaN(ms)) throw new DeliveryError('That is not a real date and time.', 'orderAt');
  return ms;
}

export const parseClock = (hhmm) => {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm ?? '');
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

// ---------- carrier data ----------

// tool.js reads the data files and passes them here; the calendar answer carries the same shape,
// so the page can rebuild the engine from the tool's published example.
export function carriersFromFiles({ deadlines, standards }) {
  return {
    deadlines: {
      season: deadlines.season,
      deliverBefore: deadlines.deliverBefore,
      source: { ...deadlines.source },
      notes: [...deadlines.notes],
      rows: deadlines.sendBy.map((r) => ({
        destination: r.destination,
        destinationName: deadlines.destinations[r.destination],
        service: r.service,
        serviceName: deadlines.services[r.service],
        date: r.date,
        ...(r.note ? { note: r.note } : {}),
      })),
    },
    standards: { source: { ...standards.source }, services: JSON.parse(JSON.stringify(standards.services)) },
  };
}

export const SERVICE_NAMES = {
  'ground-advantage': 'USPS Ground Advantage',
  'first-class-mail': 'First-Class Mail',
  'priority-mail': 'Priority Mail',
  'priority-mail-express': 'Priority Mail Express',
};

// ---------- the engine ----------

export function makeEngine(bd, carriers) {
  const { dayNumber, isoOf, holidays } = bd;
  const deadlines = carriers?.deadlines ?? null;
  const standards = carriers?.standards ?? null;
  const MIN_DAY = dayNumber(`${MIN_YEAR}-01-01`);
  const MAX_DAY = dayNumber(`${MAX_YEAR}-12-31`);
  const inRange = (n) => { if (n < MIN_DAY || n > MAX_DAY) throw new DeliveryError(YEAR_MESSAGE); return n; };
  const dayOf = (iso, field) => {
    let n;
    try { n = dayNumber(iso); } catch { throw new DeliveryError(YEAR_MESSAGE, field); }
    if (n < MIN_DAY || n > MAX_DAY) throw new DeliveryError(YEAR_MESSAGE, field);
    return n;
  };

  // US federal holidays as OPM observes them: date -> name.
  const federalCache = new Map();
  function federal(year) {
    let map = federalCache.get(year);
    if (!map) {
      map = new Map();
      for (const h of holidays('US', year)) map.set(h.date, h.name);
      federalCache.set(year, map);
    }
    return map;
  }
  const federalOn = (iso) => federal(Number(iso.slice(0, 4))).get(iso) ?? null;

  // Postal holidays: the federal holiday's own date, except that a Sunday holiday closes the
  // Monday. A Saturday holiday (observed by OPM on the Friday) closes the Saturday, not the Friday.
  const postalCache = new Map();
  function postal(year) {
    let map = postalCache.get(year);
    if (!map) {
      map = new Map();
      for (const y of [year - 1, year]) {
        if (y < 1971) continue;
        for (const h of holidays('US', y)) {
          const observed = h.name.endsWith(' (observed)');
          const n = dayNumber(h.date);
          const closed = observed && weekdayOfDay(n) === 5 ? n + 1 : n;
          const iso = isoOf(closed);
          if (Number(iso.slice(0, 4)) !== year) continue;
          map.set(iso, observed && weekdayOfDay(n) === 5 ? h.name.replace(/ \(observed\)$/, '') : h.name);
        }
      }
      postalCache.set(year, map);
    }
    return map;
  }
  const postalOn = (iso) => postal(Number(iso.slice(0, 4))).get(iso) ?? null;

  function postalHolidays(year) {
    return [...postal(year).entries()].map(([date, name]) => ({ date, name })).sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  // ---- calendars: closed(n) -> null when open, else { kind: 'weekday' | 'holiday' | 'closure', name }

  function storeCalendar(s) {
    const ship = new Set(s.shipDays.map((k) => WEEKDAY_KEYS.indexOf(k)));
    const closures = new Map();
    for (const c of s.closures) {
      const from = dayOf(c.date, 'closures');
      const to = c.to ? dayOf(c.to, 'closures') : from;
      if (to < from) throw new DeliveryError(`A closure ends (${c.to}) before it starts (${c.date}).`, 'closures');
      if (to - from > 366) throw new DeliveryError('A closure can be at most a year long.', 'closures');
      for (let n = from; n <= to; n++) closures.set(isoOf(n), c.name || 'Store closed');
    }
    return {
      label: `the store ships ${weekdaySpan(s.shipDays)}${s.federalHolidays ? ', not on federal holidays' : ''}`,
      closed(n) {
        const wd = weekdayOfDay(n);
        if (!ship.has(wd)) return { kind: 'weekday', name: `${WEEKDAYS[wd]}, not a shipping day` };
        const iso = isoOf(n);
        if (closures.has(iso)) return { kind: 'closure', name: closures.get(iso) };
        const fed = s.federalHolidays ? federalOn(iso) : null;
        if (fed) return { kind: 'holiday', name: fed };
        return null;
      },
    };
  }

  function carrierCalendar(c) {
    if (c.carrier === 'usps') {
      const everyDay = c.service === 'priority-mail-express';
      return {
        label: everyDay ? 'Priority Mail Express delivers every day of the year' : 'USPS delivers Monday to Saturday, not on postal holidays',
        // Delivery days.
        closed(n) {
          if (everyDay) return null;
          if (weekdayOfDay(n) === 0) return { kind: 'weekday', name: 'Sunday, no USPS delivery' };
          const h = postalOn(isoOf(n));
          return h ? { kind: 'holiday', name: `${h} (postal holiday)` } : null;
        },
        // Days a Post Office takes parcels in.
        accepts(n) {
          if (weekdayOfDay(n) === 0) return { kind: 'weekday', name: 'Sunday, Post Offices closed' };
          const h = postalOn(isoOf(n));
          return h ? { kind: 'holiday', name: `${h} (postal holiday)` } : null;
        },
      };
    }
    const days = new Set(c.deliveryDays.map((k) => WEEKDAY_KEYS.indexOf(k)));
    const closures = new Map();
    for (const iso of c.carrierClosures) closures.set(isoOf(dayOf(iso, 'carrierClosures')), 'Carrier closed');
    const closed = (n) => {
      const wd = weekdayOfDay(n);
      if (!days.has(wd)) return { kind: 'weekday', name: `${WEEKDAYS[wd]}, no delivery` };
      const iso = isoOf(n);
      if (closures.has(iso)) return { kind: 'closure', name: closures.get(iso) };
      const fed = c.carrierHolidays === 'federal' ? federalOn(iso) : null;
      return fed ? { kind: 'holiday', name: fed } : null;
    };
    return {
      label: `the carrier delivers ${weekdaySpan(c.deliveryDays)}${c.carrierHolidays === 'federal' ? ', not on federal holidays' : ''}`,
      closed,
      accepts: closed,
    };
  }

  // ---- walking the calendars

  // Records the named days a walk passes over (holidays and closures; weekdays only count).
  function note(log, n, why, calendar, during) {
    if (why.kind !== 'weekday') log.push({ date: isoOf(n), name: why.name, calendar, during });
  }
  function firstOpen(cal, n, log, calendar, during) {
    for (let i = 0; i < SEARCH_LIMIT; i++, n++) {
      inRange(n);
      const why = cal.closed(n);
      if (!why) return n;
      note(log, n, why, calendar, during);
    }
    throw new DeliveryError(calendar === 'store' ? 'The store has no shipping day in the next 400 days.' : 'The carrier has no open day in the next 400 days.');
  }
  // The day `count` open days after n.
  function addOpen(cal, n, count, log, calendar, during) {
    let left = count;
    while (left > 0) {
      n = inRange(n + 1);
      const why = cal.closed(n);
      if (why) note(log, n, why, calendar, during); else left -= 1;
    }
    return n;
  }
  // The day `count` open days before n.
  function backOpen(cal, n, count, log, calendar, during) {
    let left = count;
    const found = [];
    while (left > 0) {
      n = inRange(n - 1);
      const why = cal.closed(n);
      if (why) note(found, n, why, calendar, during); else left -= 1;
    }
    log.push(...found.reverse());
    return n;
  }
  // The handover day: the first day from n on that the store ships and the carrier accepts.
  function handover(store, carrier, n, log) {
    for (let i = 0; i < SEARCH_LIMIT; i++, n++) {
      inRange(n);
      const s = store.closed(n);
      if (s) { note(log, n, s, 'store', 'handover'); continue; }
      const c = carrier.accepts(n);
      if (c) { note(log, n, c, 'carrier', 'handover'); continue; }
      return n;
    }
    throw new DeliveryError('The store and the carrier share no open day in the next 400 days.');
  }
  // The last day on or before n that the store ships and the carrier accepts.
  function lastHandover(store, carrier, n, log) {
    const found = [];
    for (let i = 0; i < SEARCH_LIMIT; i++, n--) {
      inRange(n);
      const s = store.closed(n);
      if (s) { note(found, n, s, 'store', 'handover'); continue; }
      const c = carrier.accepts(n);
      if (c) { note(found, n, c, 'carrier', 'handover'); continue; }
      log.push(...found.reverse());
      return n;
    }
    throw new DeliveryError('The store and the carrier share no open day in the 400 days before that date.');
  }

  // ---- inputs

  function storeOf(input) {
    const s = {
      timeZone: input.timeZone ?? DEFAULT_STORE.timeZone,
      cutoff: input.cutoff === undefined ? DEFAULT_STORE.cutoff : input.cutoff,
      shipDays: input.shipDays ?? DEFAULT_STORE.shipDays,
      closures: input.closures ?? [],
      federalHolidays: input.federalHolidays ?? DEFAULT_STORE.federalHolidays,
      processingDays: input.processingDays ?? DEFAULT_STORE.processingDays,
    };
    s.processingDaysMax = input.processingDaysMax ?? s.processingDays;
    if (!isTimeZone(s.timeZone)) throw new DeliveryError('Time zone must be an IANA name like America/New_York.', 'timeZone');
    s.cutoffMinutes = s.cutoff === null ? null : parseClock(s.cutoff);
    if (s.cutoff !== null && s.cutoffMinutes === null) throw new DeliveryError('Cutoff must be a 24-hour time like 14:00.', 'cutoff');
    if (!s.shipDays.length) throw new DeliveryError('Pick at least one shipping day.', 'shipDays');
    if (s.processingDaysMax < s.processingDays) throw new DeliveryError('The most processing days cannot be fewer than the fewest.', 'processingDaysMax');
    return s;
  }

  function carrierOf(input, { needTransit }) {
    const c = {
      carrier: input.carrier ?? 'usps',
      service: input.service ?? null,
      deliveryDays: input.deliveryDays ?? ['mon', 'tue', 'wed', 'thu', 'fri'],
      carrierHolidays: input.carrierHolidays ?? 'federal',
      carrierClosures: input.carrierClosures ?? [],
      transit: null,
    };
    if (c.carrier === 'usps' && c.service && !SERVICE_NAMES[c.service] && !deadlineServices().has(c.service)) {
      throw new DeliveryError(`Unknown USPS service "${c.service}".`, 'service');
    }
    if (input.transitDays !== undefined) {
      const max = input.transitDaysMax ?? input.transitDays;
      if (max < input.transitDays) throw new DeliveryError('The most transit days cannot be fewer than the fewest.', 'transitDaysMax');
      c.transit = { min: input.transitDays, max, from: 'yours' };
    } else if (input.transitDaysMax !== undefined) {
      throw new DeliveryError('Give transitDays (the fewest) with transitDaysMax.', 'transitDays');
    } else if (c.carrier === 'usps' && standards?.services[c.service ?? 'ground-advantage']) {
      const st = standards.services[c.service ?? 'ground-advantage'];
      c.transit = { min: st.min, max: st.max, from: 'usps' };
    } else if (needTransit) {
      throw new DeliveryError(c.carrier === 'usps'
        ? 'Give transitDays: USPS states no delivery time for that service.'
        : 'Give transitDays: the carrier delivery days from handover to the door.', 'transitDays');
    }
    if (c.carrier === 'usps' && !c.service) c.service = 'ground-advantage';
    if (c.carrier !== 'usps' && !c.deliveryDays.length) throw new DeliveryError('Pick at least one delivery day.', 'deliveryDays');
    return c;
  }

  function deadlineServices() {
    return new Set((deadlines?.rows ?? []).map((r) => r.service));
  }

  const serviceName = (c) => (!c.service ? (c.carrier === 'usps' ? 'USPS' : 'your carrier') : c.carrier === 'usps'
    ? (SERVICE_NAMES[c.service] ?? deadlines?.rows.find((r) => r.service === c.service)?.serviceName ?? c.service)
    : (c.service || 'your carrier'));

  const cutoffWords = (s) => (s.cutoffMinutes === null ? 'no cutoff' : `a ${clockText(s.cutoffMinutes)} cutoff`);

  // The moment an order must be in by to count as received on day n.
  const receivedBy = (s, n) => (s.cutoffMinutes === null ? instantAt(isoOf(n + 1), 0, s.timeZone) : instantAt(isoOf(n), s.cutoffMinutes, s.timeZone));

  function localText(ms, tz) {
    const w = wallClock(ms, tz);
    return `${longDate(w.date)}, ${clockText(w.minutes)} ${zoneName(ms, tz)}`;
  }

  // ---------- delivery date: when does an order placed at a moment arrive? ----------

  function deliveryDate(input, now = new Date()) {
    const s = storeOf(input);
    const c = carrierOf(input, { needTransit: true });
    const store = storeCalendar(s);
    const carrier = carrierCalendar(c);
    const orderMs = input.orderAt ? parseOrderAt(input.orderAt, s.timeZone) : Math.floor(now.getTime() / 1000) * 1000;
    const w = wallClock(orderMs, s.timeZone);
    const d0 = dayOf(w.date, 'orderAt');
    const log = [];
    const steps = [];
    const zone = zoneName(orderMs, s.timeZone);
    const afterCutoff = s.cutoffMinutes !== null && w.minutes >= s.cutoffMinutes;
    const orderWords = `${longDate(w.date)} at ${clockText(w.minutes)} ${zone}`;

    let received;
    const todayClosed = store.closed(d0);
    if (!todayClosed && !afterCutoff) {
      received = d0;
      steps.push(`Ordered ${orderWords}, ${s.cutoffMinutes === null ? 'a shipping day' : `before the ${clockText(s.cutoffMinutes)} cutoff`}, so it is received the same day.`);
    } else {
      if (todayClosed) note(log, d0, todayClosed, 'store', 'receiving');
      received = firstOpen(store, d0 + 1, log, 'store', 'receiving');
      const why = todayClosed ? `${todayClosed.kind === 'weekday' ? `${WEEKDAYS[weekdayOfDay(d0)]} is not a shipping day` : `the store is closed (${todayClosed.name})`}` : `that is after the ${clockText(s.cutoffMinutes)} cutoff`;
      steps.push(`Ordered ${orderWords}; ${why}, so it is received on the next shipping day, ${longDate(isoOf(received))}.`);
    }

    const readyMin = addOpen(store, received, s.processingDays, log, 'store', 'processing');
    const readyMax = addOpen(store, readyMin, s.processingDaysMax - s.processingDays, log, 'store', 'processing');
    const shipMin = handover(store, carrier, readyMin, log);
    const shipMax = readyMax === readyMin ? shipMin : handover(store, carrier, readyMax, log);
    steps.push(s.processingDaysMax === 0
      ? `With no processing days it is handed to the carrier that day, ${longDate(isoOf(shipMin))}.`
      : `${range(s.processingDays, s.processingDaysMax, 'processing day')} on the store's calendar (${store.label}) ${shipMin === shipMax ? `puts the handover on ${longDate(isoOf(shipMin))}` : `put the handover between ${longDate(isoOf(shipMin))} and ${longDate(isoOf(shipMax))}`}.`);

    const name = serviceName(c);
    const arriveMin = addOpen(carrier, shipMin, c.transit.min, log, 'carrier', 'transit');
    const arriveMax = addOpen(carrier, shipMax, c.transit.max, log, 'carrier', 'transit');
    steps.push(`${name} takes ${range(c.transit.min, c.transit.max, 'day')}${c.transit.from === 'usps' ? ' (USPS\'s stated delivery time)' : ''}, counted on the carrier's calendar (${carrier.label}): ${arriveMin === arriveMax ? `it arrives ${longDate(isoOf(arriveMin))}` : `it arrives between ${longDate(isoOf(arriveMin))} and ${longDate(isoOf(arriveMax))}`}.`);

    const skipped = dedupe(log);
    if (skipped.length) steps.push(`Skipped on the way: ${listOf(skipped.map((x) => `${dayDate(x.date)}, ${x.name} (${x.calendar === 'store' ? "store's calendar" : "carrier's calendar"})`))}.`);
    else steps.push('No holiday or closure fell in the way; only non-working weekdays were skipped.');

    const validUntil = receivedBy(s, received);
    const arrives = arriveMin === arriveMax
      ? `arrives ${longDate(isoOf(arriveMin))}`
      : `arrives between ${dayDate(isoOf(arriveMin))} and ${longDate(isoOf(arriveMax))}`;
    const answer = `An order placed ${orderWords} with ${cutoffWords(s)} and ${range(s.processingDays, s.processingDaysMax, 'processing day')} ships ${shipMin === shipMax ? longDate(isoOf(shipMin)) : `${dayDate(isoOf(shipMin))} to ${longDate(isoOf(shipMax))}`} and, by ${name}, ${arrives}.`;

    return {
      op: 'delivery-date',
      answer,
      orderAt: isoInstant(orderMs),
      orderLocal: `${w.date}T${pad2(Math.floor(w.minutes / 60))}:${pad2(w.minutes % 60)}`,
      timeZone: s.timeZone,
      cutoff: s.cutoff,
      afterCutoff,
      received: isoOf(received),
      ships: { earliest: isoOf(shipMin), latest: isoOf(shipMax) },
      arrives: { earliest: isoOf(arriveMin), latest: isoOf(arriveMax) },
      carrier: { carrier: c.carrier, service: c.carrier === 'usps' ? c.service : (c.service || null), name, transitDays: { min: c.transit.min, max: c.transit.max }, transitFrom: c.transit.from, calendar: carrier.label },
      storeCalendar: store.label,
      validUntil: isoInstant(validUntil),
      secondsToCutoff: Math.max(0, Math.round((validUntil - orderMs) / 1000)),
      skipped,
      steps,
    };
  }

  function dedupe(log) {
    const seen = new Set();
    return log.filter((x) => { const k = `${x.date}|${x.calendar}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }

  // ---------- order by: the last moment to order for delivery by a date ----------

  // USPS's dates are for delivery before its date (December 25): they answer a target of the day
  // before or the day itself.
  const publishedApplies = (deliverBy) => {
    if (!deadlines || !deliverBy) return false;
    const gap = dayNumber(deadlines.deliverBefore) - dayNumber(deliverBy);
    return gap === 0 || gap === 1;
  };

  function rowsFor(destination) {
    return (deadlines?.rows ?? []).filter((r) => r.destination === destination);
  }

  // One service's deadline. limit: { kind: 'published' | 'send-by', date } or { kind: 'transit' }.
  function deadlineFor(s, c, store, deliverByDay, limit, asOfMs) {
    const carrier = carrierCalendar(c);
    const log = [];
    const steps = [];
    const name = serviceName(c);
    let shipBy;
    if (limit.kind === 'transit') {
      // The latest handover day whose slowest delivery still lands by the target.
      shipBy = null;
      for (let i = 0, d = deliverByDay; i < SEARCH_LIMIT && shipBy === null; i++, d--) {
        inRange(d);
        if (store.closed(d) || carrier.accepts(d)) continue;
        if (addOpen(carrier, d, c.transit.max, [], 'carrier', 'transit') <= deliverByDay) shipBy = d;
      }
      if (shipBy === null) throw new DeliveryError('No handover day in the 400 days before that date delivers in time.');
      addOpen(carrier, shipBy, c.transit.max, log, 'carrier', 'transit');
      steps.push(`${name} takes up to ${plural(c.transit.max, 'day', 'days')}${c.transit.from === 'usps' ? ' (USPS\'s stated delivery time)' : ''} on the carrier's calendar (${carrier.label}), so the last handover that arrives by ${longDate(isoOf(deliverByDay))} is ${longDate(isoOf(shipBy))}.`);
    } else {
      const sendDay = dayOf(limit.date, 'sendBy');
      shipBy = lastHandover(store, carrier, sendDay, log);
      const whose = limit.kind === 'published' ? `USPS's recommended send-by date for ${name}` : `Your carrier's send-by date for ${name}`;
      steps.push(`${whose} is ${longDate(limit.date)}.${shipBy === sendDay ? '' : ` The store ships ${weekdaySpan(s.shipDays)}, so its last handover is ${longDate(isoOf(shipBy))}.`}`);
    }
    const lastReceived = backOpen(store, shipBy, s.processingDaysMax, log, 'store', 'processing');
    if (s.processingDaysMax > 0) steps.push(`With ${plural(s.processingDaysMax, 'processing day', 'processing days')} on the store's calendar (${store.label}), the order must be received by ${longDate(isoOf(lastReceived))}.`);
    const lastMs = receivedBy(s, lastReceived);
    const lastText = s.cutoffMinutes === null
      ? `before midnight at the end of ${longDate(isoOf(lastReceived))} (${s.timeZone})`
      : `by ${localText(lastMs, s.timeZone)}`;
    steps.push(`So the last order is ${lastText}${s.cutoffMinutes === null ? '' : ', the cutoff that day'}.`);
    const skipped = dedupe(log);
    if (skipped.length) steps.push(`Skipped on the way: ${listOf(skipped.map((x) => `${dayDate(x.date)}, ${x.name} (${x.calendar === 'store' ? "store's calendar" : "carrier's calendar"})`))}.`);
    return {
      service: c.carrier === 'usps' ? c.service : (c.service || null),
      name,
      basis: limit.kind,
      carrierSendBy: limit.kind === 'transit' ? null : limit.date,
      transitDays: c.transit ? { min: c.transit.min, max: c.transit.max } : null,
      shipBy: isoOf(shipBy),
      lastOrderDate: isoOf(lastReceived),
      lastOrderAt: isoInstant(lastMs),
      lastOrderText: s.cutoffMinutes === null ? `${longDate(isoOf(lastReceived))}, before midnight` : localText(lastMs, s.timeZone),
      stillPossible: asOfMs < lastMs,
      secondsLeft: Math.max(0, Math.round((lastMs - asOfMs) / 1000)),
      skipped,
      steps,
    };
  }

  function orderBy(input, now = new Date()) {
    const s = storeOf(input);
    const store = storeCalendar(s);
    const asOfMs = input.asOf ? parseOrderAt(input.asOf, s.timeZone) : now.getTime();
    const carrierName = input.carrier ?? 'usps';
    const destination = input.destination ?? 'contiguous';
    const deliverBy = input.deliverBy ?? null;
    if (!deliverBy && !input.sendBy) throw new DeliveryError('Give deliverBy (the date it must arrive by) or sendBy (the carrier\'s send-by date).', 'deliverBy');
    const deliverByDay = deliverBy ? dayOf(deliverBy, 'deliverBy') : null;
    if (input.sendBy && deliverByDay !== null && dayOf(input.sendBy, 'sendBy') > deliverByDay) throw new DeliveryError('The send-by date is after the delivery date.', 'sendBy');
    if (carrierName === 'usps' && deadlines && !deadlines.rows.some((r) => r.destination === destination)) throw new DeliveryError(`Unknown destination "${destination}".`, 'destination');
    if (carrierName !== 'usps' && input.destination && input.destination !== 'contiguous') throw new DeliveryError('Destinations other than "contiguous" use USPS\'s published table; for another carrier give its sendBy or transitDays.', 'destination');

    const usePublished = carrierName === 'usps' && !input.sendBy && publishedApplies(deliverBy);
    let services;
    if (input.service) services = [input.service];
    else if (input.sendBy) services = [null];
    else if (carrierName !== 'usps') services = [null];
    else if (usePublished) services = rowsFor(destination).map((r) => r.service);
    else services = destination === 'contiguous' ? DOMESTIC_SERVICES : rowsFor(destination).map((r) => r.service);

    const results = [];
    const unavailable = [];
    for (const service of services) {
      const transitGiven = input.transitDays !== undefined;
      const c = carrierOf({ ...input, service: service ?? undefined }, { needTransit: false });
      if (!service) c.service = input.service ?? null;
      let limit;
      if (input.sendBy) limit = { kind: 'send-by', date: input.sendBy };
      else if (usePublished) {
        const row = rowsFor(destination).find((r) => r.service === c.service);
        if (row?.date && !transitGiven) limit = { kind: 'published', date: row.date };
        else if (row && !row.date && !transitGiven) { unavailable.push({ service: c.service, name: serviceName(c), note: row.note ?? 'USPS gives no date.' }); continue; }
      }
      if (!limit) {
        if (!c.transit) {
          if (input.service || carrierName !== 'usps') throw new DeliveryError('Give transitDays: there is no published send-by date for this.', 'transitDays');
          unavailable.push({ service: c.service, name: serviceName(c), note: 'No USPS date for this; give transitDays.' });
          continue;
        }
        if (deliverByDay === null) throw new DeliveryError('Give deliverBy to count transit days back from.', 'deliverBy');
        limit = { kind: 'transit' };
      }
      results.push(deadlineFor(s, c, store, deliverByDay, limit, asOfMs));
    }
    results.sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? -1 : a.lastOrderAt > b.lastOrderAt ? 1 : 0));
    const open = results.filter((r) => r.stillPossible);
    const last = results[results.length - 1] ?? null;

    let answer;
    const target = deliverBy ? `delivery by ${longDate(deliverBy)}` : 'that send-by date';
    const store1 = `With ${cutoffWords(s)}, ${range(s.processingDays, s.processingDaysMax, 'processing day')} and shipping ${weekdaySpan(s.shipDays)}`;
    if (!results.length) answer = `No service has a date for ${target}${unavailable.length ? `: ${unavailable[0].note}` : '.'}`;
    else if (results.length === 1) answer = `${store1}, the last order for ${target} by ${results[0].name} is ${results[0].lastOrderText}.`;
    else {
      const first = results[0];
      answer = `${store1}, the last order for ${target} is ${first.lastOrderText} by ${first.name}; the latest, by ${last.name}, is ${last.lastOrderText}.`;
    }

    return {
      op: 'order-by',
      answer,
      deliverBy,
      carrier: carrierName,
      destination: carrierName === 'usps' ? destination : null,
      timeZone: s.timeZone,
      cutoff: s.cutoff,
      processingDays: { min: s.processingDays, max: s.processingDaysMax },
      storeCalendar: store.label,
      asOf: isoInstant(Math.floor(asOfMs / 1000) * 1000),
      deadlines: results,
      unavailable,
      stillPossible: open.length > 0,
      nextDeadline: open[0] ? { service: open[0].service, name: open[0].name, lastOrderAt: open[0].lastOrderAt, lastOrderText: open[0].lastOrderText, secondsLeft: open[0].secondsLeft } : null,
      source: usePublished ? { ...deadlines.source } : null,
    };
  }

  // ---------- calendar: a carrier's closed days and published dates for a year ----------

  function calendar(input) {
    const year = input.year;
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) throw new DeliveryError(YEAR_MESSAGE, 'year');
    if (input.carrier === 'federal') {
      return {
        op: 'calendar',
        carrier: 'federal',
        year,
        answer: `US federal offices close on ${plural(holidays('US', year).length, 'day', 'days')} in ${year}, as OPM observes them (a Saturday holiday on the Friday, a Sunday holiday on the Monday).`,
        closedDays: holidays('US', year).map((h) => ({ date: h.date, name: h.name })),
        sources: [{ title: 'OPM: Federal holidays', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/' }],
      };
    }
    const closed = postalHolidays(year);
    const out = {
      op: 'calendar',
      carrier: 'usps',
      year,
      answer: `USPS has ${plural(closed.length, 'postal holiday', 'postal holidays')} in ${year} with no regular delivery; it delivers Monday to Saturday, and Priority Mail Express every day.`,
      deliveryDays: 'Monday to Saturday; Priority Mail Express every day',
      closedDays: closed,
      sources: [{ title: 'USPS Newsroom: Holidays and events', url: 'https://about.usps.com/newsroom/events/' }],
    };
    if (deadlines && Number(deadlines.deliverBefore.slice(0, 4)) === year) {
      out.answer += ` Its recommended send-by dates for delivery before ${longDate(deadlines.deliverBefore)} run from ${longDate(deadlines.rows.filter((r) => r.date).map((r) => r.date).sort()[0])} to ${longDate(deadlines.rows.filter((r) => r.date).map((r) => r.date).sort().at(-1))}.`;
      out.holidayDeadlines = JSON.parse(JSON.stringify(deadlines));
      out.sources.push({ title: deadlines.source.title, url: deadlines.source.url, readOn: deadlines.source.readOn });
    }
    if (standards) {
      out.serviceStandards = JSON.parse(JSON.stringify(standards));
      out.sources.push({ title: standards.source.title, url: standards.source.url, readOn: standards.source.readOn });
    }
    return out;
  }

  // Days for drawing: each day from `from` to `to` with whether the store ships and the carrier delivers.
  function twoCalendars(input, from, to) {
    const s = storeOf(input);
    const c = carrierOf(input, { needTransit: false });
    const store = storeCalendar(s);
    const carrier = carrierCalendar(c);
    const out = [];
    for (let n = dayOf(from); n <= dayOf(to); n++) {
      const a = store.closed(n);
      const b = carrier.closed(n);
      out.push({ date: isoOf(n), weekday: weekdayOfDay(n), store: a ? a.name : null, carrier: b ? b.name : null });
    }
    return out;
  }

  return { deliveryDate, orderBy, calendar, postalHolidays, twoCalendars, deadlines, standards };
}

// ---------- the embeddable banner ----------

// JSON that is safe inside a <script> element.
const scriptJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const htmlText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A paste-anywhere banner from an order-by answer: plain HTML and a small script with the deadlines
// written in as fixed instants. It calls no server and holds no key. It shows the first deadline
// not yet passed, counts down in its last two days, moves on to the next faster service when one
// passes, and says so plainly when every deadline has passed. occasion: "Christmas".
export function bannerSnippet(result, { occasion = 'Christmas' } = {}) {
  const list = result.deadlines.map((d) => ({ n: d.name, t: Date.parse(d.lastOrderAt), l: d.lastOrderText }));
  if (!list.length) throw new DeliveryError('There is no deadline to show.');
  const first = list[0];
  const late = `Orders placed now may not arrive by ${occasion}.`;
  return [
    `<!-- Order-by banner for ${htmlText(occasion).replace(/-{2,}/g, '-')}: deadlines worked out from your store settings. It calls no server and holds no key. -->`,
    `<div data-order-by-banner role="status" style="padding:10px 14px;border:1px solid #d6c7a1;border-radius:6px;background:#fff8e6;color:#1f1a10;font:15px/1.45 system-ui,sans-serif">Order by ${htmlText(first.l)} for ${htmlText(occasion)} delivery with ${htmlText(first.n)}.</div>`,
    '<script>',
    '(function (s) {',
    '  var el = s && s.previousElementSibling, timer;',
    `  var d = ${scriptJson(list)};`,
    `  var occasion = ${scriptJson(occasion)}, late = ${scriptJson(late)};`,
    '  function left(ms) {',
    '    var m = Math.floor(ms / 60000), h = Math.floor(m / 60), days = Math.floor(h / 24);',
    "    if (days >= 1) return days + (days === 1 ? ' day ' : ' days ') + (h % 24) + (h % 24 === 1 ? ' hour' : ' hours');",
    "    return h + (h === 1 ? ' hour ' : ' hours ') + (m % 60) + (m % 60 === 1 ? ' minute' : ' minutes');",
    '  }',
    '  function draw() {',
    '    if (!el) return;',
    '    var now = Date.now();',
    '    for (var i = 0; i < d.length; i++) {',
    '      if (now < d[i].t) {',
    '        var ms = d[i].t - now;',
    "        el.textContent = ms < 172800000",
    "          ? 'Order within ' + left(ms) + ' for ' + occasion + ' delivery with ' + d[i].n + ' (by ' + d[i].l + ').'",
    "          : 'Order by ' + d[i].l + ' for ' + occasion + ' delivery with ' + d[i].n + '.';",
    '        return;',
    '      }',
    '    }',
    '    el.textContent = late;',
    '    clearInterval(timer);',
    '  }',
    '  draw();',
    '  timer = setInterval(draw, 60000);',
    '})(document.currentScript);',
    '</script>',
  ].join('\n');
}
