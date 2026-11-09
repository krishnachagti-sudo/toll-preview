// VAT number check: reading a VAT number the way VIES and HMRC expect it, before anything is sent.
//
// Pure and dependency-free: the server (tool.js) and the page load this same file. The format
// table is not in here; makeChecker(data) takes it (data/vies.json on the server, the published
// formats example in the browser), so both sides read a number against the same dated table.
//
// The rules, each from the source named in data/vies.json:
//  - A number is a 2-letter prefix and a national part. VIES uses EL for Greece, so GR is
//    rewritten to EL. Spaces, dots, dashes, underscores and slashes are dropped and letters
//    upper-cased; "+" and "*" stay (Dutch and Irish numbers may use them).
//  - Each national part must fit the structure VIES publishes for its state (FAQ 11). VIES does
//    not publish check-digit algorithms, so no checksum is applied: the member state decides.
//  - EU states and XI (Northern Ireland) go to VIES. GB goes to HMRC, and only when the owner
//    has switched HMRC on (credentials); GD and HA forms are refused because HMRC's API takes 9
//    or 12 digits only.
//  - The requester (your own number, for a consultation number) must be an EU or XI number for a
//    VIES check, and a GB number for an HMRC check.

export const ENGINE_VERSION = 'vat-number-check 1.0';
export const VIES_STATES = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'XI'];
export const MATCH_FIELDS = [
  ['name', 'traderName', 'Name'],
  ['street', 'traderStreet', 'Street'],
  ['postalCode', 'traderPostalCode', 'Postcode'],
  ['city', 'traderCity', 'City'],
  ['companyType', 'traderCompanyType', 'Company type'],
];
export const MATCH_WORDS = { VALID: 'matches', INVALID: 'does not match', NOT_PROCESSED: 'not compared by this state' };

export class VatError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'VatError';
    this.field = field;
  }
}

const CLEAN_RE = /[\s.\-_/,]/g;
export const clean = (s) => String(s ?? '').toUpperCase().replace(CLEAN_RE, '');

// JSON with object keys sorted at every level, so equal receipts always hash alike.
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).filter((k) => value[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export function makeChecker(data) {
  const countries = data.countries;
  const patterns = Object.fromEntries(Object.entries(countries).map(([cc, c]) => [cc, new RegExp(`^(?:${c.pattern})$`)]));
  const known = (cc) => Object.hasOwn(countries, cc);

  // { country, national, full, notes } or a VatError naming what to fix. `country` is optional
  // when the number carries its prefix.
  function read(number, country, field = 'vatNumber') {
    const notes = [];
    let n = clean(number);
    let cc = country ? clean(country) : null;
    if (cc === 'GR') { cc = 'EL'; notes.push('Greece is EL in VIES, so GR was read as EL.'); }
    if (n === '') throw new VatError('Enter a VAT number.', field);
    if (/^GR/.test(n) && !cc) { n = `EL${n.slice(2)}`; notes.push('Greece is EL in VIES, so GR was read as EL.'); }
    if (cc && !known(cc)) {
      throw new VatError(`${cc} is not a country this tool checks. It checks the 27 EU states and XI (Northern Ireland) with VIES, and GB with HMRC.`, 'countryCode');
    }
    const lead = n.slice(0, 2);
    if (cc) {
      if (n.startsWith(cc)) n = n.slice(2);
      else if (/^GR/.test(n) && cc === 'EL') n = n.slice(2);
      else if (/^[A-Z]{2}/.test(lead) && known(lead) && !patterns[cc].test(n)) {
        throw new VatError(`The number starts with ${lead} but the country given is ${cc}. Use one or the other.`, field);
      }
    } else if (/^[A-Z]{2}$/.test(lead) && known(lead)) {
      cc = lead;
      n = n.slice(2);
    } else if (/^[A-Z]{2}$/.test(lead)) {
      throw new VatError(`${lead} is not a country this tool checks. It checks the 27 EU states and XI (Northern Ireland) with VIES, and GB with HMRC.`, field);
    } else {
      throw new VatError('Start the number with its 2-letter country code, such as DE or FR, or choose the country.', field);
    }
    if (n === '') throw new VatError('Enter the digits after the country code.', field);
    const c = countries[cc];
    if (!patterns[cc].test(n)) {
      const hint = cc === 'AT' && /^\d{8}$/.test(n) ? ' Austrian numbers keep the U after AT (ATU12345678).' : '';
      throw new VatError(`${cc}${n} does not have the shape VIES lists for ${c.name}: ${c.shape}.${hint}`, field);
    }
    if (cc === 'GB' && !/^\d+$/.test(n)) throw new VatError('HMRC checks GB numbers of 9 or 12 digits only.', field);
    return { country: cc, national: n, full: `${cc}${n}`, service: cc === 'GB' ? 'HMRC' : 'VIES', notes };
  }

  // What a check would do with this input, without calling anyone: { ok: true, target, requester }
  // or { ok: false, status, message, field }. `hmrcOn` says whether GB checks are switched on.
  function plan(input, { hmrcOn = false } = {}) {
    let target;
    try {
      target = read(input.vatNumber, input.countryCode);
    } catch (e) {
      if (!(e instanceof VatError)) throw e;
      return { ok: false, status: 'bad_format', message: e.message, field: e.field };
    }
    if (target.service === 'HMRC' && !hmrcOn) {
      return {
        ok: false, status: 'not_covered', field: 'vatNumber', target,
        message: 'GB numbers are checked with HMRC, not VIES, and HMRC checks are not switched on here yet. Check it free on GOV.UK (Check a UK VAT number). You were not charged.',
      };
    }
    let requester = null;
    if (input.requesterVatNumber) {
      try {
        requester = read(input.requesterVatNumber, null, 'requesterVatNumber');
      } catch (e) {
        if (!(e instanceof VatError)) throw e;
        return { ok: false, status: 'bad_format', message: `Your own VAT number: ${e.message}`, field: e.field };
      }
      if (target.service === 'VIES' && requester.service !== 'VIES') {
        return { ok: false, status: 'bad_format', field: 'requesterVatNumber', message: 'For an EU or XI number, VIES gives a consultation number only for a requester with an EU or XI VAT number. Leave your number out, or use your EU or XI number.' };
      }
      if (target.service === 'HMRC' && requester.service !== 'HMRC') {
        return { ok: false, status: 'bad_format', field: 'requesterVatNumber', message: 'For a GB number, HMRC gives a reference only for a requester with a UK (GB) VAT number. Leave your number out, or use your GB number.' };
      }
    }
    return { ok: true, target, requester };
  }

  // The format check on its own (free, no call to VIES or HMRC).
  function format(input) {
    try {
      const t = read(input.vatNumber, input.countryCode);
      const c = countries[t.country];
      return {
        op: 'format',
        wellFormed: true,
        vatNumber: t.full,
        countryCode: t.country,
        country: c.name,
        checkedWith: t.service,
        shape: c.shape,
        notes: [...t.notes, ...(c.note ? [c.note] : [])],
        message: `${t.full} has the shape VIES lists for ${c.name}. Only a check with ${t.service} says whether it is registered.`,
      };
    } catch (e) {
      if (!(e instanceof VatError)) throw e;
      return { op: 'format', wellFormed: false, field: e.field, message: e.message };
    }
  }

  function formats() {
    return {
      op: 'formats',
      readOn: data.readOn,
      countries: Object.entries(countries).map(([code, c]) => ({
        code, name: c.name, shape: c.shape, pattern: c.pattern, service: code === 'GB' ? 'HMRC' : 'VIES',
        window: data.windows?.[code] ?? null, ...(c.note ? { note: c.note } : {}),
      })),
    };
  }

  return { read, plan, format, formats, known };
}

// The data a browser needs to build the same checker, from the formats example's output.
export const checkerDataFrom = (formatsOutput) => ({
  readOn: formatsOutput.readOn,
  countries: Object.fromEntries(formatsOutput.countries.map((c) => [c.code, { name: c.name, shape: c.shape, pattern: c.pattern, ...(c.note ? { note: c.note } : {}) }])),
  windows: Object.fromEntries(formatsOutput.countries.map((c) => [c.code, c.window])),
});

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// "2026-11-02 18:10:50 UTC" from an ISO time, for people.
export function utcText(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${d.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}
