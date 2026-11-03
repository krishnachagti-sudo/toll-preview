// The home page's mockups, made to work. home.js loads this module once a mockup is in view or
// touched; nothing here runs on any other page.
//
// Playing here never runs a tool on the server, so it never spends a free run and never charges
// anyone: there is no Toll.run in this file. Each mockup is worked out in this browser by the same
// core.js its tool's page uses for its previews, with the data that page reads (the tool's own
// published examples, from the tools API the static copy serves too). Where a tool has no engine
// in the browser (the exchange rate needs the ECB file, the tax set-aside its tax tables, the MACRS
// schedule the Publication 946 tables), the mockup shows the tool's own worked examples and hands
// anything else to the tool's page.
//
// Every mockup is a [data-try] element: a GET form whose named fields are the tool page's query
// string (so it hands off even without JavaScript), a .result, a "Run it for real" link (a.try-go)
// kept equal to the form, and a status line for screen readers. With every field at its printed
// value the printed result is put back as it was.

const T = window.Toll;

// ---------- data and engines, loaded on first use ----------

const once = (fn) => { let p = null; return () => (p ||= fn()); };
const toolCache = {};
const toolOf = (slug) => (toolCache[slug] ||= T.api(`/api/v1/tools/${slug}`).then((json) => json.tool));
const example = (tool, test) => tool.examples.find((x) => test(x.input));

const businessDays = once(() => import('../business-days/files/core.js'));

const ENGINES = {
  bd: once(async () => ({ bd: await businessDays() })),
  fx: once(async () => {
    const [fx, tool] = await Promise.all([import('../fx-on-date/files/core.js'), toolOf('fx-on-date')]);
    return { fx, examples: tool.examples };
  }),
  img: once(async () => ({ img: await import('../image-to-size/files/core.js') })),
  dd: once(async () => {
    const [bd, dd, tool] = await Promise.all([businessDays(), import('../delivery-date-calculator/files/core.js'), toolOf('delivery-date-calculator')]);
    // The USPS tables from the tool's published calendar example, as its page reads them.
    const cal = example(tool, (i) => i.op === 'calendar').output;
    return { dd, engine: dd.makeEngine(bd, { deadlines: cal.holidayDeadlines, standards: cal.serviceStandards }) };
  }),
  pd: once(async () => {
    const [pd, tool] = await Promise.all([import('../trucker-per-diem/files/core.js'), toolOf('trucker-per-diem')]);
    return { pd, engine: pd.makeEngine(example(tool, (i) => i.op === 'rates').output) };
  }),
  ts: once(async () => {
    const [ts, tool] = await Promise.all([import('../tax-set-aside/files/core.js'), toolOf('tax-set-aside')]);
    return { ts, examples: tool.examples };
  }),
  mr: once(async () => {
    const [mr, tool] = await Promise.all([import('../mileage-reimbursement/files/core.js'), toolOf('mileage-reimbursement')]);
    return { mr, engine: mr.makeEngine(example(tool, (i) => i.op === 'rates').output) };
  }),
  t99: once(async () => {
    const [bd, t99, tool] = await Promise.all([businessDays(), import('../1099-threshold/files/core.js'), toolOf('1099-threshold')]);
    return { t99, engine: t99.makeEngine(bd, example(tool, (i) => i.op === 'rules').output.files), scan: example(tool, (i) => i.op === 'scan').input };
  }),
  ifta: once(async () => {
    const [ifta, tool] = await Promise.all([import('../ifta-calculator/files/core.js'), toolOf('ifta-calculator')]);
    const rates = example(tool, (i) => i.op === 'rates' && !i.quarter && !i.jurisdiction).output;
    return { ifta, engine: ifta.makeEngine({ rates, rules: rates.rules }), estimate: example(tool, (i) => i.op === 'estimate').input };
  }),
  macrs: once(async () => ({})),
  qr: once(async () => ({ qr: await import('../qr-code-generator/files/core.js') })),
};

// ---------- words ----------

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (iso) => iso.split('-').map(Number);
const weekday = (iso) => { const [y, m, d] = parts(iso); return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; };
// "Fri 25 Dec", or "Fri 25 Dec 2026" with the year.
const day = (iso, year) => { const [y, m, d] = parts(iso); return `${weekday(iso)} ${d} ${MONTHS[m - 1]}${year ? ` ${y}` : ''}`; };
// "Jan 1"
const monthDay = (iso) => { const [, m, d] = parts(iso); return `${MONTHS[m - 1]} ${d}`; };
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
const grouped = (n) => n.toLocaleString('en-US');
// A whole or decimal amount typed in a box: a number, or null.
const amount = (raw) => (/^\s*\d+(\.\d+)?\s*$/.test(raw) ? Number(raw) : null);
const count = (raw, max) => (/^\s*\d+\s*$/.test(raw) && Number(raw) <= max ? Number(raw) : null);
// The ECB rate as the tool's page writes it: 1.113 -> "1.1130", 95.269093 -> "95.269093".
const rateText = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });

// What a mockup shows when it cannot work an answer out here.
const problem = (label, message) => ({ label, msg: message, rows: [], say: message });

// ---------- the mockups ----------
// Each one: read(values) -> what to work out, or { problem }; solve(engines, read, root) -> a view.
// A view is what the result shows: { label, main, sub, note, rows, foot, title, chip, say } where
// main and sub are lists of text and { num } or { mono } pieces, rows are [date, text, tag] and
// any part left undefined is kept as printed.

const REGION_FOOT = { US: '5 U.S.C. 6103, OPM observed-day rules', 'GB-ENG': 'England and Wales bank holidays, GOV.UK' };
const REGION_NAME = { US: 'United States', 'GB-ENG': 'England and Wales' };
const SHOWN_ROWS = 4;

// The days a count stepped over: weekday holidays and weekends, a Saturday and Sunday on one row.
function skippedRows(bd, region, start, end) {
  const lo = start < end ? start : end;
  const hi = start < end ? end : start;
  if (lo === hi) return [];
  const days = bd.calendarDays(region, bd.isoOf(bd.dayNumber(lo) + 1), hi);
  const rows = [];
  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    if (!d.weekend && d.holiday) rows.push([day(d.date), d.holiday, region === 'US' ? 'federal' : 'bank holiday']);
    if (!d.weekend) continue;
    const next = days[i + 1];
    if (d.weekday === 6 && next && next.weekend) {
      const sameMonth = d.date.slice(0, 7) === next.date.slice(0, 7);
      rows.push([sameMonth ? `Sat ${parts(d.date)[2]}, Sun ${parts(next.date)[2]}` : `${day(d.date)}, ${day(next.date)}`, 'Weekend', 'weekend']);
      i += 1;
    } else {
      rows.push([day(d.date), 'Weekend', 'weekend']);
    }
  }
  if (rows.length <= SHOWN_ROWS) return rows;
  const rest = rows.length - (SHOWN_ROWS - 1);
  return [...rows.slice(0, SHOWN_ROWS - 1), ['', `and ${rest} more rows of days off`, '']];
}

const MOCKS = {
  bd: {
    read(v) {
      if (!isDate(v.start)) return { problem: 'Pick a real start date.' };
      if (!isDate(v.end)) return { problem: 'Pick a real end date.' };
      return v;
    },
    solve({ bd }, v) {
      let r;
      try {
        r = bd.between(v.region, v.start, v.end);
      } catch (e) {
        if (e instanceof RangeError) return problem('Result', e.message);
        throw e;
      }
      const rows = skippedRows(bd, v.region, v.start, v.end);
      const n = r.businessDays;
      return {
        label: 'Result',
        main: [{ num: String(n) }, Math.abs(n) === 1 ? ' business day' : ' business days'],
        sub: rows.length ? 'Skipped along the way' : 'Nothing skipped',
        rows,
        foot: REGION_FOOT[v.region],
        chip: v.region === 'US' ? 'US' : 'England and Wales',
        say: `${n} business ${Math.abs(n) === 1 ? 'day' : 'days'} from ${v.start} to ${v.end}, ${REGION_NAME[v.region]}.`,
      };
    },
  },

  fx: {
    prepare(root, { fx }) {
      // The lists hold a few currencies in the page; the full list comes with the engine.
      for (const sel of root.querySelectorAll('select')) {
        for (const c of fx.CURRENCIES) if (!sel.querySelector(`option[value="${c.code}"]`)) sel.appendChild(T.h('option', { value: c.code }, c.code));
      }
    },
    // The hero's small country marks follow the currencies picked (USD -> US, EUR -> EU).
    sync(root) {
      for (const sel of root.querySelectorAll('select')) {
        const mark = sel.parentNode.querySelector('i');
        if (mark) mark.textContent = sel.value.slice(0, 2);
      }
    },
    read(v) {
      if (v.base === v.quote) return { problem: 'Pick two different currencies.' };
      if (!isDate(v.date)) return { problem: 'Pick a real date.' };
      return v;
    },
    solve({ fx, examples }, v, root) {
      const hero = root.dataset.layout === 'hero';
      const title = `${v.base} to ${v.quote}`;
      if (v.date < fx.FIRST_FIXING) return { ...problem('European Central Bank reference rate', `The ECB reference rates start on ${fx.longDate(fx.FIRST_FIXING)}.`), title, chip: v.date };
      // Only the tool's own worked examples are on hand here: the rates themselves are in the ECB
      // file the tool reads on the server.
      const ex = examples.find((x) => (x.input.source ?? 'ecb') === 'ecb' && x.input.base === v.base && x.input.quote === v.quote && x.input.date === v.date);
      if (!ex) {
        const shown = examples.filter((x) => (x.input.source ?? 'ecb') === 'ecb').map((x) => `${x.input.base} to ${x.input.quote} on ${x.input.date}`);
        return {
          label: 'European Central Bank reference rate',
          msg: `Look up ${title} on ${fx.longDate(v.date)} on the tool page.`,
          note: `The rate comes from the ECB file the tool reads when it runs. Here you can try its worked examples: ${shown.join(', ')}.`,
          rows: [],
          foot: hero ? `Requested ${v.date}` : 'European Central Bank',
          title,
          chip: v.date,
          say: `No rate here for ${title} on ${v.date}. Run it for real on the tool page.`,
        };
      }
      const o = ex.output;
      const note = fx.fixingNote(o.requestedDate, o.fixingDate);
      const say = `1 ${o.base} buys ${rateText(o.rate)} ${o.quote}, from the fixing of ${o.fixingDate}.`;
      if (hero) {
        return {
          label: 'European Central Bank reference rate',
          main: [`1 ${o.base} buys `, { num: rateText(o.rate) }, ` ${o.quote}`],
          sub: [`1 ${o.quote} buys `, { mono: rateText(o.inverse) }, ` ${o.base}`],
          note,
          rows: [],
          foot: `Requested ${o.requestedDate} · Fixing ${o.fixingDate}`,
          say,
        };
      }
      return {
        label: `Requested ${day(o.requestedDate, true)} · Fixing ${day(o.fixingDate, true)}`,
        main: [{ num: rateText(o.rate) }],
        sub: ['Inverse ', { mono: rateText(o.inverse) }],
        note,
        rows: [],
        foot: 'European Central Bank',
        title,
        chip: o.requestedDate,
        say,
      };
    },
  },

  dd: {
    read(v) {
      const processing = count(v.processing, 60);
      if (!/^\d{2}:\d{2}$/.test(v.cutoff)) return { problem: 'Pick a cutoff time.' };
      if (processing === null) return { problem: 'Processing days must be a whole number from 0 to 60.' };
      // The same input the tool's page builds for an order-by run with USPS.
      return {
        op: 'order-by', timeZone: 'America/New_York', cutoff: v.cutoff, shipDays: v.ship.split(','), federalHolidays: true,
        processingDays: processing, carrier: 'usps', deliverBy: '2026-12-24', destination: 'contiguous',
      };
    },
    solve({ dd, engine }, input) {
      let r;
      try {
        r = engine.orderBy(input);
      } catch (e) {
        if (e instanceof dd.DeliveryError) return problem('Last order', e.message);
        throw e;
      }
      const [first, ...rest] = r.deadlines;
      const time = dd.clockText(dd.parseClock(input.cutoff));
      const byDate = new Map();
      for (const d of rest) if (d.lastOrderDate !== first.lastOrderDate) byDate.set(d.lastOrderDate, [...(byDate.get(d.lastOrderDate) ?? []), d.name]);
      return {
        label: `Last order, ${first.name}`,
        main: [{ num: day(first.lastOrderDate) }, ` ${time}`],
        note: first.stillPossible ? null : 'That moment has already passed.',
        rows: [...byDate].map(([date, names]) => [day(date), names.join(' and '), time]),
        say: r.answer,
      };
    },
  },

  pd: {
    read(v) {
      const n = {};
      for (const k of ['full', 'partial', 'oct_full', 'oct_partial']) {
        n[k] = v[k].trim() === '' ? 0 : count(v[k], 366);
        if (n[k] === null) return { problem: 'Day counts must be whole numbers from 0 to 366.' };
      }
      // As the page's "day counts" mode sends them: only the counts that are not zero.
      const some = (full, partial) => ({ ...(full ? { fullDays: full } : {}), ...(partial ? { partialDays: partial } : {}) });
      return {
        op: 'quick', taxYear: 2024, ...some(n.full, n.partial), octDec: some(n.oct_full, n.oct_partial),
        hosSubject: v.hos === '1', interstate: true, transportationIndustry: true,
      };
    },
    solve({ pd, engine }, input) {
      let r;
      try {
        r = engine.quick(input);
      } catch (e) {
        if (e instanceof pd.PerDiemError) return problem('Schedule C line 24b', e.message);
        throw e;
      }
      return {
        label: 'Schedule C line 24b',
        main: [{ num: r.totals.display.deductible }],
        rows: r.segments.map((s) => [`${monthDay(s.from)} to ${monthDay(s.to)}`, s.notices.map((x) => x.notice).join(', '), `$${s.rateConus}`]),
        say: r.answer,
      };
    },
  },

  ts: {
    read(v) {
      const a = amount(v.amount);
      const y = amount(v.ytd);
      if (a === null || y === null) return { problem: 'Enter the payment and what you have earned so far as amounts in dollars.' };
      return { amount: a, ytd: y, state: v.state };
    },
    solve({ ts, examples }, v, root) {
      const stateName = root.querySelector(`[data-f="state"] option[value="${v.state}"]`).textContent;
      // The tax tables run on the server; here are the tool's own worked examples.
      const ex = examples.find((x) => x.input.op === 'payment' && x.input.country === 'US' && x.input.filingStatus === 'single' && x.input.state === v.state
        && x.input.amount === v.amount && x.input.ytdNetProfit === v.ytd && !x.input.miles && !x.input.tips && !x.input.expenses);
      const title = `Set aside, ${stateName} 2026`;
      if (!ex) {
        return {
          label: 'Move to your tax pot',
          msg: 'Work this one out on the tool page.',
          note: 'The tax tables run when the tool runs. Here you can try its worked examples: a $3,000 payment on $40,000 earned so far, in Texas or California. Signed out, the tool page gives you the percentage free, 5 runs a day.',
          rows: [],
          title,
          say: 'This payment is worked out on the tool page. Run it for real there.',
        };
      }
      const o = ex.output;
      const cents = (n) => ts.usd(n, { cents: true });
      return {
        label: 'Move to your tax pot',
        main: [{ num: cents(o.setAside) }, ` (${o.percent}%)`],
        rows: [
          ['SE tax', '15.3% of 92.35%', cents(o.breakdown.seTax)],
          ['Federal', `${Math.round(o.year.after.bracketRate * 100)}% bracket, after QBI`, cents(o.breakdown.federalIncomeTax)],
          ...(o.breakdown.state ? [[o.state.name, 'State income tax', cents(o.breakdown.state)]] : []),
        ],
        title,
        say: `Set aside ${cents(o.setAside)}, ${o.percent}% of the payment.`,
      };
    },
  },

  mr: {
    read(v) {
      const raw = [v.m1.trim() || '0', v.m2.trim() || '0'];
      if (raw.some((x) => amount(x) === null)) return { problem: 'Miles must be a number, such as 2600.' };
      return raw;
    },
    solve({ mr, engine }, miles) {
      // The year's rate periods, as the page's split form lists them.
      const field = mr.PURPOSES.business.field;
      const periods = engine.irs.periods.filter((p) => p.from <= '2026-12-31' && p.to >= '2026-01-01' && p[field] !== null && p[field] !== undefined)
        .map((p) => ({ from: p.from > '2026-01-01' ? p.from : '2026-01-01', to: p.to < '2026-12-31' ? p.to : '2026-12-31' }));
      const trips = periods.map((p, i) => ({ date: p.from, ...(p.to !== p.from ? { endDate: p.to } : {}), miles: miles[i] ?? '0', purpose: 'business' }))
        .filter((t) => Number(t.miles) > 0);
      if (!trips.length) return problem('Total', 'Enter the miles for at least one period.');
      let r;
      try {
        r = engine.calculate({ op: 'calculate', trips });
      } catch (e) {
        if (e instanceof mr.MileageError) return problem('Total', e.message);
        throw e;
      }
      const dollars = (c) => { const dp = (c.split('.')[1] ?? '').length + 2; return `$${(Number(c) / 100).toFixed(Math.max(2, dp))}`; };
      return {
        label: r.periods.map((p) => `${grouped(p.miles)} x ${dollars(p.rateCents)}`).join(' + '),
        main: [{ num: r.total }],
        say: r.answer,
      };
    },
  },

  t99: {
    read(v) {
      const rivera = amount(v.rivera);
      if (rivera === null) return { problem: 'Enter Rivera Electric\'s June payment as an amount in dollars.' };
      return { rivera, summit: v.summit, lumen: v.lumen };
    },
    solve({ t99, engine, scan }, v) {
      // The tool's own sample year of payments, with the three changes made here.
      const payments = scan.payments.map((p) => {
        if (p.payee === 'Rivera Electric LLC') return { ...p, amount: v.rivera };
        if (p.payee === 'Summit Staffing Inc') return { ...p, payeeType: v.summit };
        if (p.payee === 'Lumen Web Studio') return { ...p, method: v.lumen };
        return p;
      });
      const r = engine.scan({ ...scan, payments });
      const why = (p) => {
        if (p.verdict === 'file') return p.boxes.filter((b) => b.met).map((b) => `${b.form} box ${b.box}`).join(', ');
        if (p.verdict === 'near') return 'Under the $2,000 line, near it';
        if (p.verdict === 'under') return 'Under the line';
        if (t99.PAYEE_TYPES[p.payeeType]?.corporate) return 'Corporation, left out';
        if (payments.some((x) => x.payee === p.name && t99.METHODS[x.method]?.form1099K)) return 'Card payment, left out (1099-K)';
        return 'Left out';
      };
      const shown = ['Rivera Electric', 'Okafor & Lin LLP', 'Summit Staffing Inc', 'Lumen Web Studio'];
      return {
        label: 'Payees that need a form',
        main: [{ num: String(r.summary.file) }, ` of ${r.summary.payees}`],
        rows: shown.map((name) => r.payees.find((p) => p.name === name)).filter(Boolean).map((p) => [p.name, why(p), t99.money(p.paid)]),
        say: r.answer,
      };
    },
    // The hand-off checks one payee: the one changed last, as a single payment.
    handOff(form, key, v) {
      const set = (name, value) => { form.querySelector(`input[type="hidden"][name="${name}"]`).value = value; };
      if (key === 'rivera' && amount(v.rivera) !== null) { set('amount', String(1800 + amount(v.rivera))); set('payee', 'single-member-llc'); set('method', 'check'); }
      if (key === 'summit') { set('amount', '9600'); set('payee', v.summit); set('method', 'ach'); }
      if (key === 'lumen') { set('amount', '3100'); set('payee', 'individual'); set('method', v.lumen); }
    },
  },

  ifta: {
    prepare(root, { ifta, engine }) {
      // Every quarter on file, newest first, as the tool's page lists them.
      const sel = root.querySelector('[data-f="quarter"]');
      for (const q of [...engine.quarters].reverse()) {
        if (!sel.querySelector(`option[value="${q}"]`)) sel.appendChild(T.h('option', { value: q }, ifta.quarterWords(q)));
      }
    },
    read(v) {
      const gallons = amount(v.gallons);
      if (!gallons) return { problem: 'Gallons must be a number above zero.' };
      return { quarter: v.quarter, gallons };
    },
    solve({ ifta, engine, estimate }, v, root) {
      let r;
      try {
        r = engine.estimate({ ...estimate, quarter: v.quarter, totalGallons: v.gallons });
      } catch (e) {
        if (e instanceof ifta.IftaError) return problem('Return, surcharges included', e.message);
        throw e;
      }
      const cents = (x) => Math.round(x * 100);
      const line = (code) => {
        const l = r.lines.find((x) => x.jurisdiction === code);
        if (!l) return null;
        const words = l.surcharge ? 'Tax plus surcharge' : l.netTaxableGallons > 0 ? `${grouped(l.netTaxableGallons)} gallons owed` : l.netTaxableGallons < 0 ? 'Bought more than burned' : 'Nothing owed';
        return [l.name, words, ifta.money(cents(l.tax) + (l.surcharge ? cents(l.surcharge.tax) : 0))];
      };
      root.querySelector('[data-try-out]').textContent = `${ifta.whole(r.totalMiles)} mi, ${r.display.mpg}`;
      root.querySelector('[data-try-due]').textContent = `Due ${ifta.longDate(r.dueDate.due)}`;
      return {
        label: 'Return, surcharges included',
        main: [{ num: ifta.money(Math.abs(cents(r.netDue))) }, r.netDue < 0 ? ' credit' : ' due'],
        rows: ['IN', 'KY', 'IL'].map(line).filter(Boolean),
        foot: `IFTA rate matrix, ${r.rateStatus.status} rates`,
        title: ifta.quarterWords(v.quarter),
        say: r.answer,
      };
    },
  },

  macrs: {
    read: (v) => v,
    // The Publication 946 tables are read on the server, so anything but the sample is handed off.
    solve: () => ({
      label: 'First-year deduction',
      msg: 'Work this schedule out on the tool page.',
      note: 'The IRS Publication 946 tables run when the tool runs. Here you can see its sample schedule: bonus elected out on 7-year property, $250,000 of business income.',
      rows: [],
      chip: 'Not worked out here',
      say: 'These settings are worked out on the tool page. Run it for real there.',
    }),
  },

  qr: {
    read: (v) => v,
    solve({ qr }, v) {
      let payload;
      let notes;
      try {
        ({ payload, notes } = qr.buildPayload('wifi', { ssid: v.ssid, password: v.password, security: v.security }));
      } catch (e) {
        if (e instanceof qr.QrError) return { ...problem('Text the code holds', e.message), foot: '' };
        throw e;
      }
      const rows = ['M', 'H'].map((ecc) => [`Level ${ecc}`, `Restores ${qr.ECC_RESTORE[ecc]} damage`, `Version ${qr.encodeText(payload, { ecc }).version}`]);
      return {
        label: 'Text the code holds',
        main: [{ num: payload, mono: true }],
        rows,
        foot: notes.some((n) => /escaped/.test(n)) ? 'Special characters are escaped' : 'Nothing needed escaping',
        say: `The code holds ${payload}`,
      };
    },
  },
};

// ---------- image to size: shrunk here, in the browser ----------

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Phones and some browsers refuse canvases past roughly this many pixels.
const MAX_PIXELS = 16000000;

function bytesText(n, perKb) {
  if (n < perKb) return `${n} B`;
  if (n < perKb * perKb) return `${(Math.floor(n / (perKb / 10)) / 10).toFixed(1)} KB`;
  return `${(Math.floor(n / (perKb * perKb / 100)) / 100).toFixed(2)} MB`;
}

async function decode(file) {
  if (window.createImageBitmap) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { image: bitmap, width: bitmap.width, height: bitmap.height };
    } catch { /* an older browser: fall through to an image element */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { image: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// The encoder core.js searches with: draw at a scale, encode as JPEG at a quality, report the size.
function encoderFor(source, targetBytes) {
  const baseScale = Math.min(1, Math.sqrt(MAX_PIXELS / (source.width * source.height)));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const kept = new Map();
  async function encode(scale, quality) {
    const w = Math.max(1, Math.round(source.width * baseScale * scale));
    const hgt = Math.max(1, Math.round(source.height * baseScale * scale));
    canvas.width = w;
    canvas.height = hgt;
    // JPEG has no see-through: lay the picture on white so clear areas do not turn black.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, hgt);
    ctx.drawImage(source.image, 0, 0, w, hgt);
    const blob = await new Promise((done) => canvas.toBlob(done, 'image/jpeg', quality));
    if (!blob) throw new Error('encode_failed');
    if (blob.size <= targetBytes) kept.set(`${scale}|${quality}`, { blob, width: w, height: hgt });
    return { size: blob.size };
  }
  return { encode, find: (scale, quality) => kept.get(`${scale}|${quality}`) };
}

function imageMock(root) {
  const fileInput = root.querySelector('[data-f="file"]');
  const kbSelect = root.querySelector('[data-f="kb"]');
  const drop = root.querySelector('.drop');
  const form = root.querySelector('form');
  const state = { file: null, source: null, run: 0, url: null };

  async function shrink() {
    if (!state.source) return;
    const run = ++state.run;
    const { img } = await ENGINES.img();
    const kb = Number(kbSelect.value);
    const target = kb * img.BYTES_PER_KB;
    const { file, source } = state;
    say(root, 'Working on it.');
    let view;
    try {
      let out;
      if (file.type === 'image/jpeg' && file.size <= target) {
        out = { blob: file, width: source.width, height: source.height, same: true };
      } else {
        const enc = encoderFor(source, target);
        const fit = await img.fitToSize({ targetBytes: target, encode: enc.encode });
        out = enc.find(fit.scale, fit.quality);
      }
      if (run !== state.run) return;
      if (state.url) URL.revokeObjectURL(state.url);
      state.url = URL.createObjectURL(out.blob);
      const size = (n) => bytesText(n, img.BYTES_PER_KB);
      const dims = (w, hgt) => `${grouped(w)} x ${grouped(hgt)} px`;
      const name = `${(file.name.replace(/\.[^.]*$/, '').replace(/[^A-Za-z0-9._-]+/g, '-') || 'photo').slice(0, 60)}-${kb}kb.jpg`;
      view = {
        label: out.same ? 'Already fits' : 'Fits',
        main: [{ num: size(out.blob.size) }, ` of ${grouped(kb)} KB`],
        rows: [['Before', dims(source.width, source.height), size(file.size)], ['After', dims(out.width, out.height), size(out.blob.size)]],
        foot: 'Made in your browser, never uploaded',
        download: { href: state.url, name },
        say: `Done. The new photo is ${size(out.blob.size)}, under ${grouped(kb)} KB.`,
      };
    } catch (e) {
      if (run !== state.run) return;
      view = problem('Image to size', e.message === 'too_small'
        ? `This photo cannot get under ${grouped(kb)} KB, even at a tenth of its size. Try a larger limit.`
        : 'Your browser could not shrink this photo. Try another photo, or the tool page.');
    }
    paint(root, view);
  }

  async function take(file) {
    if (!file) return;
    if (file.type && !TYPES.includes(file.type)) { paint(root, problem('Image to size', 'That file is not a JPEG, PNG or WebP photo.')); return; }
    try {
      state.source = await decode(file);
    } catch {
      paint(root, problem('Image to size', 'This photo could not be read. Try another JPEG, PNG or WebP file.'));
      return;
    }
    state.file = file;
    drop.querySelector('b').textContent = file.name;
    if (drop.lastChild.nodeType === 3) drop.lastChild.textContent = ', or choose another';
    shrink();
  }

  fileInput.addEventListener('change', () => { take(fileInput.files && fileInput.files[0]); });
  kbSelect.addEventListener('change', () => { syncLink(root); shrink(); });
  ['dragenter', 'dragover'].forEach((type) => drop.addEventListener(type, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((type) => drop.addEventListener(type, () => drop.classList.remove('over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); take(e.dataTransfer && e.dataTransfer.files[0]); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.source) shrink(); else fileInput.click();
  });
  // A photo picked or dropped while this module was on its way.
  const early = drop.tryFile || (fileInput.files && fileInput.files[0]);
  if (early) take(early);
  if (kbSelect.value !== [...kbSelect.options].find((o) => o.defaultSelected).value) syncLink(root);
}

// ---------- painting a result ----------

const SVG = 'http://www.w3.org/2000/svg';
function infoIcon() {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG, 'use');
  use.setAttribute('href', '#i-info');
  svg.appendChild(use);
  return svg;
}
const piece = (p) => (typeof p === 'string' ? p : T.h('span', { class: p.num !== undefined ? `num${p.mono ? ' mono' : ''}` : 'mono' }, p.num ?? p.mono));

function say(root, text) {
  const el = root.querySelector('[data-try-say]');
  if (el) el.textContent = text;
}

// The answer lands as an answer does on a tool page (motion.css): it slides in and stops, and the
// cost line ticks in. A class already on is restarted through its animations, so nothing is measured.
function land(el, cls) {
  if (!el) return;
  if (!el.classList.contains(cls)) { el.classList.add(cls); return; }
  if (el.getAnimations) el.getAnimations().forEach((a) => { a.cancel(); a.play(); });
}

function resultOf(root) {
  let res = root.querySelector('.result');
  if (res) return res;
  // Image to size has no result until a photo is shrunk.
  res = T.h('div', { class: 'result', style: 'margin-top:16px' }, T.h('div', { class: 'r-foot' }, [T.h('span', { 'data-try-foot': '' }), T.h('a', { class: 'try-dl', download: '' }, 'Download')]));
  root.querySelector('form').after(res);
  return res;
}

function paint(root, view) {
  const res = resultOf(root);
  const foot = res.querySelector('.r-foot');
  for (const child of [...res.children]) if (child !== foot) child.remove();
  const top = T.h('div', { class: 'result-top' }, [T.h('div', { class: 'r-label' }, view.label)]);
  if (view.msg) top.appendChild(T.h('p', { class: 'r-msg' }, view.msg));
  if (view.main) top.appendChild(T.h('div', { class: 'r-main' }, view.main.map(piece)));
  if (view.sub && root.tryHasSub) top.appendChild(T.h('div', { class: 'r-sub' }, [].concat(view.sub).map(piece)));
  const parts = [top];
  if (view.note) parts.push(T.h('div', { class: 'rnote' }, [infoIcon(), T.h('span', null, view.note)]));
  if (view.rows && view.rows.length) {
    parts.push(T.h('ul', { class: 'skips' }, view.rows.map(([d, text, t]) => T.h('li', null, [T.h('span', { class: 'd' }, d), T.h('span', null, text), T.h('span', { class: 't' }, t)]))));
  } else if (!view.rows && root.tryRows) {
    parts.push(root.tryRows.cloneNode(true));
  }
  for (const part of parts) res.insertBefore(part, foot);
  if (view.foot !== undefined && foot.querySelector('[data-try-foot]')) foot.querySelector('[data-try-foot]').textContent = view.foot;
  const dl = foot.querySelector('.try-dl');
  if (dl && view.download) { dl.href = view.download.href; dl.setAttribute('download', view.download.name); dl.hidden = false; } else if (dl) dl.hidden = true;
  const title = root.querySelector('[data-try-title]');
  if (title && view.title) title.textContent = view.title;
  const chip = root.querySelector('[data-try-chip]');
  if (chip && view.chip) chip.textContent = view.chip;
  say(root, view.say ?? '');
  land(res, 'tl-land');
  land(foot.querySelector('.charged'), 'tl-charged');
}

// ---------- wiring one mockup ----------

function fieldsOf(root) { return [...root.querySelectorAll('[data-f]')].filter((el) => el.type !== 'file'); }
function valuesOf(root) { return Object.fromEntries(fieldsOf(root).map((el) => [el.dataset.f, el.value])); }
const atDefault = (el) => (el.tagName === 'SELECT' ? [...el.options].every((o) => o.selected === o.defaultSelected) : el.value === el.defaultValue);
const printedValue = (el) => (el.tagName === 'SELECT' ? ([...el.options].find((o) => o.defaultSelected) ?? el.options[0]).value : el.defaultValue);

// The hand-off link is the form itself as a query string, so it is exactly what submitting the form
// without JavaScript would open.
function syncLink(root) {
  const form = root.querySelector('form');
  const query = new URLSearchParams(new FormData(form)).toString();
  for (const a of root.querySelectorAll('a.try-go')) a.href = `${form.getAttribute('action')}?${query}`;
}

// The printed result, kept to put back when every field is at its printed value again.
function remember(root) {
  const res = root.querySelector('.result');
  if (!res) return;
  const foot = res.querySelector('.r-foot');
  root.tryPrinted = {
    parts: [...res.children].filter((c) => c !== foot).map((c) => c.cloneNode(true)),
    foot: foot && foot.querySelector('[data-try-foot]') ? foot.querySelector('[data-try-foot]').textContent : null,
    texts: [...root.querySelectorAll('[data-try-title], [data-try-chip], [data-try-out], [data-try-due]')].map((el) => [el, el.textContent]),
  };
  root.tryHasSub = !!res.querySelector('.r-sub');
  root.tryRows = res.querySelector('.skips');
}

function restore(root, quiet) {
  const res = root.querySelector('.result');
  const printed = root.tryPrinted;
  if (!res || !printed) return;
  const foot = res.querySelector('.r-foot');
  for (const child of [...res.children]) if (child !== foot) child.remove();
  for (const part of printed.parts) res.insertBefore(part.cloneNode(true), foot);
  if (printed.foot !== null) foot.querySelector('[data-try-foot]').textContent = printed.foot;
  for (const [el, text] of printed.texts) el.textContent = text;
  say(root, '');
  if (!quiet) land(res, 'tl-land');
}

function wire(root) {
  const key = root.dataset.try;
  if (key === 'img') { imageMock(root); syncLink(root); return; }
  const mock = MOCKS[key];
  if (!mock) return;
  const form = root.querySelector('form');
  remember(root);
  let timer = 0;
  // What the result shows now, as the inputs that made it: at first, the printed ones.
  let shown = JSON.stringify(Object.fromEntries(fieldsOf(root).map((el) => [el.dataset.f, printedValue(el)])));
  let prepared = false;
  const engines = () => ENGINES[key]().then((e) => {
    if (!prepared) { prepared = true; if (mock.prepare) mock.prepare(root, e); }
    return e;
  });
  root.tryWarm = () => { engines().catch(() => {}); };

  async function update() {
    syncLink(root);
    if (mock.sync) mock.sync(root);
    const values = valuesOf(root);
    const stamp = JSON.stringify(values);
    if (stamp === shown) return;
    shown = stamp;
    if (fieldsOf(root).every(atDefault)) { restore(root); return; }
    const read = mock.read(values);
    if (read.problem) {
      paint(root, problem(root.querySelector('.r-label') ? root.querySelector('.r-label').textContent : 'Result', read.problem));
      return;
    }
    let view;
    try {
      view = mock.solve(await engines(), read, root);
    } catch {
      view = problem('Result', 'This could not be worked out here. Run it for real on the tool page.');
    }
    if (stamp === shown) paint(root, view);
  }
  const soon = (e) => {
    // The 1099 hand-off checks the payee changed last; with every field at its printed value, Rivera.
    if (key === 't99' && e && e.target.dataset.f) mock.handOff(form, fieldsOf(root).every(atDefault) ? 'rivera' : e.target.dataset.f, valuesOf(root));
    clearTimeout(timer);
    timer = setTimeout(update, e && e.type === 'change' ? 0 : 220);
  };
  form.addEventListener('input', soon);
  form.addEventListener('change', soon);
  form.addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(timer); update(); });
  root.tryReset = () => {
    for (const el of fieldsOf(root)) {
      if (el.tagName === 'SELECT') for (const o of el.options) o.selected = o.defaultSelected;
      else el.value = el.defaultValue;
    }
    shown = JSON.stringify(valuesOf(root));
    syncLink(root);
    if (mock.sync) mock.sync(root);
    restore(root, true);
  };
  // A field changed before this module arrived is worked out now.
  if (!fieldsOf(root).every(atDefault)) update();
}

// ---------- start ----------

export function start(first) {
  const roots = [...document.querySelectorAll('[data-try]')];
  roots.forEach(wire);
  // The engines load when a mockup comes into view (when the browser is idle) or is touched.
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  const warm = (root) => { if (root.tryWarm && !root.tryWarmed) { root.tryWarmed = true; idle(() => root.tryWarm()); } };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { warm(en.target); io.unobserve(en.target); }
    }, { rootMargin: '200px 0px' });
    // The hero's views are always in view, so they load only when shown or touched.
    roots.filter((r) => !r.closest('#app')).forEach((r) => io.observe(r));
  }
  for (const r of roots) {
    r.addEventListener('focusin', () => warm(r));
    r.addEventListener('pointerdown', () => warm(r));
  }
  if (first) { const r = first.closest('[data-try]'); if (r) warm(r); }
  // The hero's replay puts the exchange-rate view back to the answer it replays.
  const app = document.getElementById('app');
  if (app) {
    app.addEventListener('home:replay', () => { const fx = app.querySelector('[data-try="fx"]'); if (fx && fx.tryReset) fx.tryReset(); });
    app.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('button.s-item[data-view]');
      if (b) warm(app.querySelector(`.view-wrap[data-for="${b.getAttribute('data-view')}"] [data-try]`) || app);
    });
  }
}
