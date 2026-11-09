// The WARN Act checker's engine: the federal Worker Adjustment and Retraining Notification Act
// (20 CFR Part 639, DOL Employer's Guide) and the state laws read on each state's own statute or
// labor department site, applied per site to a dated layoff list. Pure and dependency-free: the
// page loads this same file in the browser (README, "core.js is browser-loadable"), so the rules
// table lives here, with the citation and the day it was read on every row. Same input, same
// answer; no judgement calls: whether sites are one "single site", whether an exception applies
// and who counts as an employee are the user's facts, and the answer says so.

export class WarnError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'WarnError';
    this.field = field;
  }
}

export const READ_ON = '2026-11-08';
export const LIMITS = { sites: 200, events: 2000, rows: 10000 };

// ---------- dates (UTC calendar days) ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const y = +s.slice(0, 4);
  if (y < 1989 || y > 2100) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
export const dayIndex = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;
export const isoOf = (idx) => new Date(idx * 86_400_000).toISOString().slice(0, 10);
export const addDays = (iso, n) => isoOf(dayIndex(iso) + n);
export const daysBetween = (a, b) => dayIndex(b) - dayIndex(a);
export const weekdayOf = (iso) => (((dayIndex(iso) + 4) % 7) + 7) % 7;
export const weekdayName = (iso) => WEEKDAYS[weekdayOf(iso)];
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
// The same day k months later (or earlier), on the month's last day when it has no such day.
export function addMonths(iso, k) {
  const y = +iso.slice(0, 4);
  const m = +iso.slice(5, 7) - 1 + k;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  const dd = Math.min(+iso.slice(8, 10), lastDay(yy, mm + 1));
  return `${yy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}
const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const plural = (n, word, many = `${word}s`) => `${fmt(n)} ${n === 1 ? word : many}`;

// ---------- who counts ----------
//
// Every count is split three ways, because the laws count differently:
//   fullTime  20 or more hours a week on average and employed at least 6 of the last 12 months
//   partTime  under 20 hours a week on average, employed at least 6 of the last 12 months
//   short     employed fewer than 6 of the 12 months before notice is due, any hours
// Federal law excludes the last two from every threshold (20 CFR 639.3(h)); California counts
// part-time employees with 6 of 12 months; New Jersey counts part-time employees.
export const COUNTS = {
  fullTime: { label: 'full-time employees', of: (c) => c.fullTime },
  sixMonths: { label: 'full- and part-time employees with 6 of the last 12 months', of: (c) => c.fullTime + c.partTime },
  all: { label: 'employees, full- and part-time', of: (c) => c.fullTime + c.partTime + c.short },
};
const countOf = (rule, c) => COUNTS[rule].of(c);
const zero = () => ({ fullTime: 0, partTime: 0, short: 0 });
const plus = (a, b) => ({ fullTime: a.fullTime + b.fullTime, partTime: a.partTime + b.partTime, short: a.short + b.short });

// ---------- the laws ----------
//
// One row per law. employer: who is covered (scope: the whole company, the employees in the state,
// or the site itself). triggers: closing (a site or unit shut down), layoff (any other reduction)
// and relocation, each with the losses it needs in the window; a tier { min, share: [a, b] } needs
// at least min losses that are at least a/b of the base. window: the period losses add up over
// (days, months, or the whole list where the law names none); aggregate: the longer look-back for
// several small rounds. scope 'state' on a trigger counts every listed site in the state together.

const fed = 'https://www.ecfr.gov/current/title-20/chapter-V/part-639';
export const FEDERAL = {
  id: 'federal',
  code: 'US',
  name: 'Federal WARN Act',
  short: 'federal WARN',
  citation: '29 U.S.C. 2101 to 2109; 20 CFR Part 639',
  url: fed,
  readOn: READ_ON,
  employer: { min: 100, count: 'fullTime', scope: 'company', alt: { min: 100, count: 'all', hours: 4000 } },
  triggers: {
    closing: { min: 50, count: 'fullTime', name: 'plant closing' },
    layoff: { tiers: [{ min: 50, share: [33, 100] }, { min: 500 }], count: 'fullTime', name: 'mass layoff' },
  },
  window: { days: 30 },
  aggregate: { days: 90 },
  noticeDays: 60,
  recipients: [
    'Each affected employee, part-time employees included, or the chief elected officer of their union if they are represented (20 CFR 639.6(a), (b))',
    'The state dislocated worker unit, the state\'s rapid response team (20 CFR 639.6(c))',
    'The chief elected official of the local government where the closing or layoff happens; where the site is in more than one, the one the employer paid the most taxes the year before (20 CFR 639.3(g), 639.6(d))',
  ],
  cite: {
    employer: '20 CFR 639.3(a)',
    closing: '20 CFR 639.3(b)',
    layoff: '20 CFR 639.3(c)',
    partTime: '20 CFR 639.3(h)',
    window: '20 CFR 639.5(a)(1)',
    notice: '20 CFR 639.5(a), 639.6',
  },
};

const STATE_LAWS = [
  {
    code: 'CA',
    name: 'California WARN Act (Cal-WARN)',
    short: 'Cal-WARN',
    citation: 'Cal. Labor Code 1400 to 1408 (1400.5, 1401, 1403)',
    url: 'https://edd.ca.gov/en/jobs_and_training/Layoff_Services_WARN/',
    source: 'California EDD, Worker Adjustment and Retraining Notification (WARN)',
    readOn: READ_ON,
    employer: { min: 75, count: 'sixMonths', scope: 'site', note: 'A "covered establishment" employs, or employed in the 12 months before, 75 or more full- and part-time employees; each must have been employed at least 6 of the 12 months before notice is due (Labor Code 1400.5(a), (h)).' },
    triggers: {
      closing: { min: 1, count: 'sixMonths', name: 'closure (termination)' },
      layoff: { tiers: [{ min: 50 }], count: 'sixMonths', name: 'mass layoff' },
      relocation: { miles: 100, min: 1, count: 'sixMonths', name: 'relocation of 100 miles or more' },
    },
    window: { days: 30 },
    aggregate: null,
    noticeDays: 60,
    recipients: [
      'Each affected employee',
      'The Employment Development Department (email EDDWarnNotice@edd.ca.gov, employer name in the subject line)',
      'The Local Workforce Development Board',
      'The chief elected official of each city and county government where the closure, relocation or layoff happens',
    ],
    rules: [
      'Covers a closure of any size, a layoff of 50 or more in 30 days whatever the percentage, and a relocation of 100 miles or more (Labor Code 1400.5(d) to (f)).',
      'From 2026 (SB 617) the notice must say whether the employer will coordinate services with the local workforce board, another organization, or not at all, give the board\'s contact details, describe the services, and describe CalFresh with its helpline 1-877-847-3663.',
      'Liability: back pay at the higher of the final rate or the 3-year average rate, and benefits, for the period of violation up to 60 days or half the days employed, whichever is smaller; a civil penalty of up to $500 a day (Labor Code 1403).',
      'Exempt: seasonal employees hired knowing the work was seasonal; project work under Wage Orders 11, 12 or 16 (film, construction, drilling, logging, mining); a physical calamity or act of war (1400.5(g), 1401(c)).',
    ],
    liability: { backPayDays: 60, halfDaysEmployed: true, higherRate: true, penaltyPerDay: 500 },
  },
  {
    code: 'NY',
    name: 'New York WARN Act',
    short: 'NY WARN',
    citation: 'N.Y. Labor Law Article 25-A (860 et seq.); 12 NYCRR Part 921',
    url: 'https://dol.ny.gov/warn-regulations',
    source: 'New York State DOL, WARN page and WARN regulations (12 NYCRR Part 921)',
    readOn: READ_ON,
    employer: { min: 50, count: 'fullTime', scope: 'state', alt: { min: 50, count: 'all', hours: 2000 }, note: '50 or more employees in New York State not counting part-time employees, or 50 or more including part-time who work at least 2,000 hours a week in all (12 NYCRR 921-1.1(e)). Remote workers based at a site count at that site (921-1.1(e)(7)(i)).' },
    triggers: {
      closing: { min: 25, count: 'fullTime', name: 'plant closing' },
      layoff: { tiers: [{ min: 25, share: [33, 100] }, { min: 250 }], count: 'fullTime', name: 'mass layoff' },
      relocation: { miles: 50, min: 25, count: 'fullTime', name: 'relocation of 50 miles or more' },
    },
    window: { days: 30 },
    aggregate: { days: 90 },
    noticeDays: 90,
    recipients: [
      'Each affected employee, full- or part-time',
      'Each employee representative (every bargaining unit with affected employees)',
      'The Commissioner of Labor (New York State DOL)',
      'The local workforce development board where the site is',
      'The chief elected official of each unit of local government where the site is',
      'Each school district where the site is',
      'Each locality that provides police, fire, emergency medical or ambulance services to the site',
    ],
    rules: [
      'A plant closing affecting 25 or more full-time employees; a mass layoff of 25 or more full-time employees who are at least 33% of the site, or 250 or more; a relocation of 50 miles or more affecting 25 or more; a covered cut in hours (12 NYCRR 921-1.1).',
      'Look 30 days ahead and behind, and 90 days ahead and behind for rounds that are each too small (921-2.1(e)).',
      'Notice 90 calendar days before; by first class mail it must be postmarked at least 90 days before separation (921-2.1(a), 921-2.2(a)).',
      'Back pay and benefits for the period of violation up to 60 days or half the days employed, whichever is smaller; a civil penalty of up to $500 a day, avoided only by paying each employee in full within 3 weeks of the layoff (921-7.2).',
    ],
    liability: { backPayDays: 60, halfDaysEmployed: true, higherRate: false, penaltyPerDay: 500 },
  },
  {
    code: 'NJ',
    name: 'New Jersey WARN Act',
    short: 'NJ WARN',
    citation: 'N.J.S.A. 34:21-1 et seq., as amended effective April 10, 2023',
    url: 'https://business.nj.gov/updates/important-updates-to-employee-rights-under-new-jersey-warn-law',
    source: 'Business.NJ.gov, Important Updates to Employee Rights under New Jersey WARN Law (last updated April 17, 2023)',
    readOn: READ_ON,
    employer: { min: 100, count: 'all', scope: 'company', note: 'Employers with at least 100 employees; part-time employees are counted.' },
    triggers: {
      closing: { min: 50, count: 'all', name: 'closure' },
      layoff: { tiers: [{ min: 50 }], count: 'all', name: 'mass layoff' },
      relocation: { miles: 0, min: 50, count: 'all', name: 'relocation' },
    },
    // The state's summary gives no period for the 50, so the tool counts every loss at the
    // worksite in the list, and says so.
    window: { whole: true },
    aggregate: null,
    noticeDays: 90,
    recipients: [
      'Each affected employee (the state summary read names employees; the full recipient list is in N.J.S.A. 34:21-2, which was not read)',
    ],
    rules: [
      'Notice is due whenever a mass layoff affects at least 50 workers at a worksite; layoffs, closures and relocations all need 90 days\' notice.',
      'Part-time employees have the same protections as full-time employees and are counted.',
      'Employers must give discharged employees one week of severance pay for each year of service.',
      'The summary read gives no period for counting the 50, so this tool counts every loss at the worksite in your list.',
    ],
    severance: { weeksPerYear: 1, partialYears: false },
  },
  {
    code: 'IL',
    name: 'Illinois WARN Act',
    short: 'Illinois WARN',
    citation: '820 ILCS 65; 56 Ill. Adm. Code 230',
    url: 'https://dceo.illinois.gov/workforcedevelopment/warn.html',
    source: 'Illinois DCEO, Notices of Layoffs and Closures (WARN), and Illinois Department of Labor, WARN',
    readOn: READ_ON,
    employer: { min: 75, count: 'fullTime', scope: 'company', note: '75 or more full-time employees, part-time workers excluded.' },
    triggers: {
      // The plant-closing definition is in 820 ILCS 65/5, which could not be read (ilga.gov
      // refused the connection), so a closing is tested with the mass-layoff numbers.
      layoff: { tiers: [{ min: 25, share: [1, 3] }, { min: 250 }], count: 'fullTime', name: 'mass layoff' },
    },
    window: { days: 30 },
    aggregate: { days: 90 },
    noticeDays: 60,
    recipients: [
      'Each affected employee',
      'State and local government officials: the Illinois Department of Commerce (email CEO.WARNSubmission@Illinois.gov) and the chief elected official of the local government',
    ],
    rules: [
      'A mass layoff is 25 or more full-time employees in any 30-day period (in some cases any 90-day period) who are at least one-third of the full-time employees at the site, or 250 or more.',
      'The Illinois plant-closing threshold (820 ILCS 65/5) could not be read on ilga.gov, so a closing is tested here with the mass-layoff numbers.',
      'Back pay and benefits for the period of violation up to 60 days; a civil penalty of up to $500 a day. The law does not apply to federal, state or local governments.',
      'An employer receiving state or local economic development incentives must also send the notice to the Governor, legislative leaders and the mayor of each municipality where it has locations (DCEO).',
    ],
    liability: { backPayDays: 60, halfDaysEmployed: false, higherRate: false, penaltyPerDay: 500 },
  },
  {
    code: 'IA',
    name: 'Iowa Worker Adjustment and Retraining Notification Act',
    short: 'Iowa WARN',
    citation: 'Iowa Code chapter 84C',
    url: 'https://www.legis.iowa.gov/docs/code/84C.pdf',
    source: 'Iowa Code 2026, chapter 84C',
    readOn: READ_ON,
    employer: { min: 25, count: 'fullTime', scope: 'company', note: 'A person who employs 25 or more employees, excluding part-time employees (84C.2(5)).' },
    triggers: {
      closing: { min: 25, count: 'fullTime', name: 'business closing' },
      layoff: { tiers: [{ min: 25 }], count: 'fullTime', name: 'mass layoff' },
    },
    window: { days: 30 },
    aggregate: null,
    noticeDays: 30,
    recipients: [
      'Each affected employee, or their representative',
      'The Iowa Department of Workforce Development (this notice also lists the affected employees\' addresses)',
    ],
    rules: [
      'A business closing or mass layoff is an employment loss for 25 or more employees, part-time excluded, at a single site; a mass layoff counts any 30-day period (84C.2).',
      'Notice 30 days before; a collective bargaining agreement may set a different period (84C.3(1)).',
    ],
  },
  {
    code: 'ME',
    name: 'Maine severance pay and notice law',
    short: 'Maine 625-B',
    citation: '26 M.R.S. 625-B',
    url: 'https://legislature.maine.gov/statutes/26/title26sec625-B.html',
    source: 'Maine Revised Statutes, Title 26, section 625-B (data extracted October 5, 2026)',
    readOn: READ_ON,
    employer: { min: 100, count: 'all', scope: 'site', note: 'A "covered establishment" employs, or employed at any time in the 12 months before, 100 or more persons (625-B(1)(A)).' },
    triggers: {
      closing: { min: 1, count: 'all', name: 'closing' },
      relocation: { miles: 100, min: 1, count: 'all', name: 'relocation of 100 miles or more' },
      layoff: { tiers: [{ min: 50, share: [33, 100] }, { min: 500 }], count: 'all', name: 'mass layoff (6 months or longer)', noticeAfter: 7 },
    },
    window: { whole: true },
    aggregate: null,
    noticeDays: 90,
    recipients: [
      'The Director of the Bureau of Labor Standards',
      'For a closing: each employee, and the municipal officers of the municipality where the establishment is',
    ],
    rules: [
      'A closing or relocation needs 90 days\' written notice to the Director; a closing also to the employees and the municipal officers (625-B(6), (6-A)).',
      'A mass layoff (33% and at least 50, or 500, losing work for at least 6 months) needs notice to the Director as far ahead as practicable and no later than 7 days after the layoff (625-B(6)).',
      'Severance: one week\'s pay for each year of service, and partial pay for a partial year, to employees with at least 3 years at the establishment, paid within one regular pay period (625-B(2)).',
      'Fines: up to $1,000 per employee for unpaid severance; $500 a day for missing notice (625-B(9)).',
    ],
    severance: { weeksPerYear: 1, partialYears: true, minYears: 3 },
  },
  {
    code: 'MD',
    name: 'Maryland Economic Stabilization Act',
    short: 'Maryland ESA',
    citation: 'Md. Code Ann., Lab. & Empl. 11-301 et seq.',
    url: 'https://labor.maryland.gov/employment/dwdal-esa-frequently-asked-questions.shtml',
    source: 'Maryland Department of Labor, WARN and Economic Stabilization Act pages and ESA FAQs',
    readOn: READ_ON,
    employer: { min: 50, count: 'fullTime', scope: 'state', note: 'At least 50 employees in Maryland, operating for at least a year. An "employee" works 20 or more hours a week on average and has worked at least 6 of the last 12 months.' },
    triggers: {
      reduction: { tiers: [{ min: 15, share: [25, 100] }], count: 'fullTime', name: 'reduction in operations' },
    },
    window: { months: 3 },
    aggregate: null,
    noticeDays: 60,
    recipients: [
      'Every employee at the workplace subject to the reduction, part-time and recently hired staff included',
      'Each exclusive representative or bargaining agent of those employees',
      'The Maryland Department of Labor Dislocation Services Unit, 100 S. Charles Street, Tower 1, Suite 2000, Baltimore, MD 21201',
      'The chief elected official (where the workplace is in more than one political subdivision, the one paid the most taxes the year before)',
    ],
    rules: [
      'A reduction in operations is a shutdown of a workplace or part of it, or a relocation of part of the operation, that reduces employees at the workplace by at least 25% or 15 employees, whichever is greater, over any 3-month period.',
      'For remote workers the whole State of Maryland is one workplace; for teleworkers it is their official duty station.',
      'Not covered: labor disputes, construction sites and other temporary workplaces, customary seasonal factors, and bankruptcy filings.',
    ],
  },
  {
    code: 'DE',
    name: 'Delaware Worker Adjustment and Retraining Notification Act',
    short: 'Delaware WARN',
    citation: '19 Del. C. 1901 to 1911',
    url: 'https://delcode.delaware.gov/title19/c019/index.html',
    source: 'Delaware Code Online, Title 19, chapter 19',
    readOn: READ_ON,
    employer: { min: 100, count: 'fullTime', scope: 'company', alt: { min: 100, count: 'all', hours: 2000 }, note: '100 or more employees excluding part-time, or 100 or more who work at least 2,000 hours a week in all (1903(a)(4)).' },
    triggers: {
      closing: { min: 50, count: 'fullTime', name: 'plant closing' },
      layoff: { tiers: [{ min: 50, share: [33, 100] }, { min: 500 }], count: 'fullTime', name: 'mass layoff' },
      relocation: { miles: 50, min: 1, count: 'fullTime', name: 'relocation of 50 miles or more' },
    },
    window: { days: 30 },
    aggregate: { days: 90 },
    noticeDays: 60,
    recipients: [
      'Each affected employee and their representatives',
      'The Delaware Department of Labor Division of Employment and Training, WARN Act Administrator',
      'The Delaware Workforce Development Board for the locality',
    ],
    rules: [
      'The notice must carry the federal elements plus each dislocated worker\'s name, job title, home address, telephone number and email, general information on payouts, severance, relocation and retirement options, and whether the employer self-insures workers\' compensation (1904(b)).',
      'Small rounds within any 90 days add up unless the employer shows separate and distinct causes (1907).',
    ],
  },
  {
    code: 'WA',
    name: 'Washington Securing Timely Notification and Benefits for Laid-Off Employees Act',
    short: 'Washington WARN',
    citation: 'RCW 49.45 (2025 c 277; 2026 c 86)',
    url: 'https://app.leg.wa.gov/RCW/default.aspx?cite=49.45&full=true',
    source: 'RCW 49.45 and Employment Security Department, WARN requirements',
    readOn: READ_ON,
    employer: { min: 50, count: 'fullTime', scope: 'state', note: 'A person who employs 50 or more employees in Washington, excluding part-time employees (RCW 49.45.010(8)).' },
    triggers: {
      closing: { min: 50, count: 'fullTime', name: 'business closing' },
      // RCW 49.45.010(10) has no "single site" words: the 50 are counted across the state.
      layoff: { tiers: [{ min: 50 }], count: 'fullTime', scope: 'state', name: 'mass layoff (counted statewide)' },
    },
    window: { days: 30 },
    aggregate: null,
    noticeDays: 60,
    recipients: [
      'The Employment Security Department (email ESDGPLayoffAssistance@esd.wa.gov with "WARN" in the subject, or P.O. Box 9046, Olympia, WA 98507-9046)',
      'Each affected employee, or their bargaining representative if they are represented',
      'The chief elected official of the community (named on ESD\'s page; not in RCW 49.45.020)',
    ],
    rules: [
      'A business closing is an employment loss for 50 or more employees, excluding part-time, at a single site. A mass layoff is an employment loss for 50 or more employees, excluding part-time, in any 30-day period; the definition has no single-site words, so this tool counts all your Washington sites together (RCW 49.45.010).',
      'A short-term layoff of 3 months or less that is extended needs notice when the extension becomes foreseeable (49.45.020(1)(b)).',
      'The notice must say whether the action is the result of relocating or contracting out operations or positions (49.45.020(2)(e)).',
      'Back pay for each day of violation, up to 60 days, at the higher of the 3-year average or the final rate, plus benefits (49.45.040); a penalty of up to $500 a day (ESD).',
    ],
    liability: { backPayDays: 60, halfDaysEmployed: false, higherRate: true, penaltyPerDay: 500 },
  },
  {
    code: 'TN',
    name: 'Tennessee Plant Closing and Reduction in Operations Act',
    short: 'Tennessee 50-1-601',
    citation: 'Tenn. Code Ann. 50-1-601 to 50-1-604',
    url: 'https://www.tn.gov/content/dam/tn/workforce/documents/employers/WARN_Technical_Assistance_Guide.pdf',
    source: 'Tennessee Department of Labor and Workforce Development, WARN Act Technical Assistance Guide',
    readOn: READ_ON,
    employer: { min: 50, max: 99, count: 'fullTime', scope: 'site', note: 'At least 50 but not more than 99 full-time employees at a workplace in Tennessee (50-1-601(1)). Employers with 100 or more fall under the federal Act.' },
    triggers: {
      reduction: { tiers: [{ min: 50 }], count: 'fullTime', name: 'reduction in operations', noticeWhenTold: true },
    },
    window: { months: 3 },
    aggregate: null,
    noticeDays: 0,
    recipients: [
      'The affected employees first, then the Commissioner of Labor and Workforce Development by telephone: Dislocated Worker Unit, 220 French Landing Drive, Nashville, TN 37243, (615) 210-2724 or toll free (800) 255-5872',
    ],
    rules: [
      'A closure, modernization, relocation of more than 50 miles or management policy that cuts the workplace by 50 or more employees, permanently or indefinitely, in any 3-month period (50-1-601(2)).',
      'When the employer tells the affected employees, it must then telephone the Commissioner with the circumstances and the number affected (50-1-602(a)). The law sets no number of days.',
      'Not covered: labor disputes, construction sites and other temporary workplaces, customary seasonal factors (50-1-603).',
    ],
  },
  {
    code: 'CT',
    name: 'Connecticut (federal WARN Act)',
    short: 'Connecticut',
    federalOnly: true,
    citation: 'Connecticut Department of Labor, WARN',
    url: 'https://portal.ct.gov/dol/divisions/rapid-response/warn',
    source: 'Connecticut Department of Labor, WARN (dated August 18, 2025)',
    readOn: READ_ON,
    recipients: [
      'Send the federal notice to the Rapid Response Unit, Connecticut Department of Labor, 200 Folly Brook Boulevard, Wethersfield, CT 06109-1114, or dol.rapidresponse@ct.gov',
    ],
    rules: [
      'The Connecticut DOL WARN page describes the federal Act (100 or more full-time workers, 60 days) and where to send the notice. No other notice law is described there.',
    ],
  },
];
export const STATES = Object.fromEntries(STATE_LAWS.map((s) => [s.code, { ...s, id: s.code.toLowerCase() }]));

// Every state and DC, with the page slug. Those without a row above were not read on their own
// site and are reported as not covered.
export const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};
export const stateSlug = (code) => STATE_NAMES[code].toLowerCase().replace(/[^a-z]+/g, '-');
export const COVERED = Object.keys(STATES);
export const NOT_COVERED = Object.keys(STATE_NAMES).filter((c) => !STATES[c]);
// State laws with their own rules (not just the federal Act).
export const MINI_WARN = COVERED.filter((c) => !STATES[c].federalOnly);

export function normState(s, field = 'state') {
  const t = String(s ?? '').trim();
  const up = t.toUpperCase();
  if (STATE_NAMES[up]) return up;
  const hit = Object.entries(STATE_NAMES).find(([, n]) => n.toLowerCase() === t.toLowerCase());
  if (hit) return hit[0];
  throw new WarnError(`"${t.slice(0, 30)}" is not a US state; write the two-letter code, like CA.`, field);
}

// ---------- reading counts ----------

function whole(v, field, { max = 10_000_000 } = {}) {
  const n = typeof v === 'string' ? Number(v.replace(/,/g, '').trim()) : v;
  if (!Number.isInteger(n) || n < 0 || n > max) throw new WarnError(`${field} must be a whole number of people, 0 or more.`, field);
  return n;
}
const triple = (o = {}, field) => ({
  fullTime: whole(o.fullTime ?? 0, `${field}.fullTime`),
  partTime: whole(o.partTime ?? 0, `${field}.partTime`),
  short: whole(o.short ?? 0, `${field}.short`),
});

// A site: { name, state, fullTime, partTime, short, closing, relocationMiles, losses: [{ date,
// fullTime, partTime, short }] }. Headcounts are the employees at the site when notice is first
// due (20 CFR 639.5(a)(2)); losses are employment losses only (639.3(f)).
function readSite(s, i) {
  const f = `sites.${i}`;
  const name = String(s.name ?? '').trim();
  if (!name) throw new WarnError(`Site ${i + 1} needs a name.`, `${f}.name`);
  const state = normState(s.state, `${f}.state`);
  const head = triple(s, f);
  const losses = (s.losses ?? []).map((l, j) => {
    if (!isRealDate(l.date)) throw new WarnError(`${name}: loss ${j + 1} needs a date written like 2027-01-15.`, `${f}.losses.${j}.date`);
    return { date: l.date, ...triple(l, `${f}.losses.${j}`) };
  });
  if (!losses.length) throw new WarnError(`${name}: list at least one date with the employment losses on it.`, `${f}.losses`);
  const lost = losses.reduce(plus, zero());
  for (const k of ['fullTime', 'partTime', 'short']) {
    if (lost[k] > head[k]) throw new WarnError(`${name}: ${fmt(lost[k])} ${k === 'fullTime' ? 'full-time' : k === 'partTime' ? 'part-time' : 'short-service'} losses but only ${fmt(head[k])} such employees at the site.`, `${f}.losses`);
  }
  const miles = s.relocationMiles == null ? null : Number(s.relocationMiles);
  if (miles !== null && !(Number.isFinite(miles) && miles >= 0 && miles <= 20_000)) throw new WarnError(`${name}: relocationMiles must be a number of miles.`, `${f}.relocationMiles`);
  // Same-day losses are one group.
  const byDate = new Map();
  for (const l of losses) byDate.set(l.date, plus(byDate.get(l.date) ?? zero(), l));
  const groups = [...byDate].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, c]) => ({ date, ...c }));
  return { name, state, ...head, closing: !!s.closing, relocationMiles: miles, losses: groups, i };
}

// ---------- the test ----------

const meets = (tier, losses, base) => losses >= tier.min && (!tier.share || losses * tier.share[1] >= tier.share[0] * base);
const tierText = (t) => (t.share ? `${fmt(t.min)} or more who are at least ${t.share[0] === 1 ? 'one-third' : `${t.share[0]}%`} of the site` : `${fmt(t.min)} or more`);

// The first window (starting at each loss date in turn) whose losses meet the trigger, and every
// group inside a window that meets it. mode: { days }, { months } or { whole } (the whole list).
const endOf = (mode, start) => (mode.whole ? '9999-12-31' : mode.months ? addDays(addMonths(start, mode.months), -1) : addDays(start, mode.days - 1));
const modeText = (mode) => (mode.whole ? ' in the list' : mode.months ? ` in any ${mode.months} months` : ` in any ${mode.days} days`);
function scan(groups, mode, test) {
  let first = null;
  const covered = new Set();
  for (let a = 0; a < groups.length; a += 1) {
    const end = endOf(mode, groups[a].date);
    const inside = groups.filter((g, b) => b >= a && g.date <= end);
    const total = inside.reduce(plus, zero());
    const hit = test(total);
    if (hit) {
      if (!first) first = { from: groups[a].date, to: inside.at(-1).date, total, tier: hit };
      for (const g of inside) covered.add(g.date);
    }
    if (mode.whole) break;
  }
  return first ? { ...first, covered } : null;
}

function employerTest(law, ctx, site) {
  const e = law.employer;
  let counts;
  let where;
  if (e.scope === 'site') { counts = site; where = 'at this site'; }
  else if (e.scope === 'state') { counts = ctx.stateHead(site.state); where = `in ${STATE_NAMES[site.state]}`; }
  else { counts = ctx.company; where = 'in the company'; }
  const n = countOf(e.count, counts);
  let covered = n >= e.min && (e.max === undefined || n <= e.max);
  let byHours = false;
  if (!covered && e.alt && e.max === undefined && ctx.weeklyHours !== null && e.scope !== 'site') {
    const all = countOf(e.alt.count, counts);
    if (all >= e.alt.min && ctx.weeklyHours >= e.alt.hours) { covered = true; byHours = true; }
  }
  const range = e.max !== undefined ? `${fmt(e.min)} to ${fmt(e.max)}` : `${fmt(e.min)} or more`;
  const text = covered
    ? `${fmt(n)} ${COUNTS[e.count].label} ${where}${byHours ? `, and ${fmt(ctx.weeklyHours)} hours a week in all` : ''}: covered (${range} needed).`
    : `${fmt(n)} ${COUNTS[e.count].label} ${where}: not covered (${range} needed${e.alt ? `, or ${fmt(e.alt.min)} or more working ${fmt(e.alt.hours)} hours a week` : ''}).`;
  return { covered, count: n, text, byHours, estimated: e.scope === 'state' && ctx.stateEstimated(site.state) };
}

// One law at one site: covered employer, which trigger, the window, and the notice per group.
function lawAtSite(law, ctx, site, noticeDate) {
  const out = { law: law.id, code: law.code, name: law.name, short: law.short, citation: law.citation, url: law.url, readOn: law.readOn, noticeDays: law.noticeDays };
  if (law.federalOnly) return { ...out, federalOnly: true, triggered: false, recipients: law.recipients, reasons: law.rules };
  const employer = employerTest(law, ctx, site);
  out.employer = employer;
  if (!employer.covered) return { ...out, triggered: false, reasons: [employer.text] };
  const reasons = [employer.text];
  const tries = [];
  const t = law.triggers;
  const groupsFor = (trig) => (trig.scope === 'state' ? ctx.stateGroups(site.state) : site.losses);
  const baseFor = (trig) => (trig.scope === 'state' ? countOf(trig.count, ctx.stateHead(site.state)) : countOf(trig.count, site));
  if (t.closing && site.closing) tries.push({ key: 'closing', trig: t.closing, test: (c) => (countOf(t.closing.count, c) >= t.closing.min ? { min: t.closing.min } : null) });
  if (t.relocation && site.relocationMiles !== null && site.relocationMiles >= t.relocation.miles) tries.push({ key: 'relocation', trig: t.relocation, test: (c) => (countOf(t.relocation.count, c) >= t.relocation.min ? { min: t.relocation.min } : null) });
  for (const key of ['layoff', 'reduction']) {
    const trig = t[key];
    if (!trig) continue;
    const base = baseFor(trig);
    tries.push({ key, trig, test: (c) => trig.tiers.find((tier) => meets(tier, countOf(trig.count, c), base)) ?? null, base });
  }
  let hit = null;
  for (const x of tries) {
    const groups = groupsFor(x.trig);
    let w = scan(groups, law.window, x.test);
    let aggregated = false;
    if (!w && law.aggregate) { w = scan(groups, law.aggregate, x.test); aggregated = !!w; }
    if (w) { hit = { ...x, w, aggregated }; break; }
  }
  if (!hit) {
    const best = tries.map((x) => {
      const groups = groupsFor(x.trig);
      const mode = law.aggregate ?? law.window;
      let most = 0;
      for (let a = 0; a < groups.length; a += 1) {
        const end = endOf(mode, groups[a].date);
        most = Math.max(most, countOf(x.trig.count, groups.filter((g, b) => b >= a && g.date <= end).reduce(plus, zero())));
      }
      const need = x.trig.tiers ? x.trig.tiers.map(tierText).join(', or ') : `${fmt(x.trig.min)} or more`;
      return `${x.trig.name}: at most ${fmt(most)} ${COUNTS[x.trig.count].label} lost${modeText(mode)}${x.base !== undefined ? `, out of ${fmt(x.base)}` : ''}; ${need} needed.`;
    });
    if (!tries.length) best.push('No trigger applies: no closing or relocation is marked and the law has no layoff trigger.');
    return { ...out, triggered: false, reasons: [...reasons, ...best] };
  }
  const { w, trig, key } = hit;
  const lost = countOf(trig.count, w.total);
  const base = hit.base;
  const scope = trig.scope === 'state' ? ` across ${STATE_NAMES[site.state]}` : '';
  reasons.push(`${trig.name}${scope}: ${fmt(lost)} ${COUNTS[trig.count].label} lost ${w.from === w.to ? `on ${longDate(w.from)}` : `from ${longDate(w.from)} to ${longDate(w.to)}`}${base !== undefined && w.tier.share ? ` of ${fmt(base)} (${pct(lost, base)})` : ''}${hit.aggregated ? `, adding up rounds within ${law.aggregate.days} days` : ''}; ${trig.tiers ? tierText(w.tier) : `${fmt(trig.min)} or more`} needed.`);
  if (hit.aggregated) reasons.push(`The rounds are each too small but add up within ${law.aggregate.days} days, so notice is due unless the employer shows separate and distinct actions and causes.`);
  // The groups at this site inside a triggering window are entitled to notice; each group gets the
  // full notice period before its own date (20 CFR 639.5(a)(1)).
  const groups = site.losses.filter((g) => w.covered.has(g.date)).map((g) => {
    const people = g.fullTime + g.partTime + g.short;
    const r = { date: g.date, employees: people };
    if (trig.noticeAfter) r.noticeBy = addDays(g.date, trig.noticeAfter);
    else if (trig.noticeWhenTold) r.noticeBy = null;
    else r.noticeBy = addDays(g.date, -law.noticeDays);
    if (noticeDate && r.noticeBy) {
      const given = daysBetween(noticeDate, g.date);
      r.daysGiven = given;
      r.daysShort = trig.noticeAfter ? (daysBetween(g.date, noticeDate) > trig.noticeAfter ? daysBetween(g.date, noticeDate) - trig.noticeAfter : 0) : Math.max(0, law.noticeDays - given);
    }
    return r;
  });
  const recipients = law.code === 'ME' && key !== 'closing' ? [law.recipients[0]] : law.recipients;
  const noticeDays = trig.noticeAfter ? 0 : law.noticeDays;
  return {
    ...out,
    noticeDays,
    noticeAfter: trig.noticeAfter ?? null,
    noticeWhenTold: !!trig.noticeWhenTold,
    triggered: true,
    trigger: key,
    triggerName: trig.name,
    aggregated: hit.aggregated,
    window: { from: w.from, to: w.to, losses: lost, base: base ?? null },
    groups,
    noticeBy: groups.map((g) => g.noticeBy).filter(Boolean).sort()[0] ?? null,
    recipients,
    reasons,
    rules: law.rules ?? [],
  };
}

export const pct = (a, b) => (b ? `${(Math.floor((a * 1000) / b) / 10).toFixed(1)}%` : 'n/a');

// The site-level check. input: { employer: { fullTime, partTime, short, weeklyHours }, states: {
// CA: { fullTime, partTime, short } }, sites: [...], noticeDate }.
export function check(input) {
  const sitesIn = input.sites ?? [];
  if (!sitesIn.length) throw new WarnError('List at least one site.', 'sites');
  if (sitesIn.length > LIMITS.sites) throw new WarnError(`At most ${LIMITS.sites} sites.`, 'sites');
  const sites = sitesIn.map(readSite);
  const names = new Set();
  for (const s of sites) {
    const k = s.name.toLowerCase();
    if (names.has(k)) throw new WarnError(`Two sites are called "${s.name}"; give each a different name.`, 'sites');
    names.add(k);
  }
  if (sites.reduce((n, s) => n + s.losses.length, 0) > LIMITS.events) throw new WarnError(`At most ${LIMITS.events} loss dates in all.`, 'sites');
  const noticeDate = input.noticeDate ?? null;
  if (noticeDate !== null && !isRealDate(noticeDate)) throw new WarnError('noticeDate must be a date written like 2026-11-16.', 'noticeDate');
  const sum = sites.reduce(plus, zero());
  const companyGiven = input.employer && ['fullTime', 'partTime', 'short'].some((k) => input.employer[k] !== undefined);
  // Company totals: what is given, and the listed sites for any category left out.
  const company = companyGiven ? Object.fromEntries(['fullTime', 'partTime', 'short'].map((k) => [k, input.employer[k] === undefined ? sum[k] : whole(input.employer[k], `employer.${k}`)])) : sum;
  for (const k of ['fullTime', 'partTime', 'short']) if (company[k] < sum[k]) throw new WarnError(`The company total of ${k === 'fullTime' ? 'full-time' : k === 'partTime' ? 'part-time' : 'short-service'} employees (${fmt(company[k])}) is less than the sites listed (${fmt(sum[k])}).`, `employer.${k}`);
  const weeklyHours = input.employer?.weeklyHours == null ? null : whole(input.employer.weeklyHours, 'employer.weeklyHours', { max: 1_000_000_000 });
  const stateGiven = Object.fromEntries(Object.entries(input.states ?? {}).map(([k, v]) => [normState(k, 'states'), triple(v, `states.${k}`)]));
  const stateHead = (st) => stateGiven[st] ?? sites.filter((s) => s.state === st).reduce(plus, zero());
  const stateEstimated = (st) => !stateGiven[st];
  const stateGroups = (st) => {
    const byDate = new Map();
    for (const s of sites.filter((x) => x.state === st)) for (const g of s.losses) byDate.set(g.date, plus(byDate.get(g.date) ?? zero(), g));
    return [...byDate].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, c]) => ({ date, ...c }));
  };
  const ctx = { company, weeklyHours, stateHead, stateEstimated, stateGroups };
  const results = sites.map((s) => {
    const laws = [lawAtSite(FEDERAL, ctx, s, noticeDate)];
    const st = STATES[s.state];
    if (st) laws.push(lawAtSite(st, ctx, s, noticeDate));
    const due = laws.filter((l) => l.triggered && l.noticeBy && !l.noticeAfter).sort((a, b) => (a.noticeBy < b.noticeBy ? -1 : 1))[0];
    return {
      name: s.name,
      state: s.state,
      stateName: STATE_NAMES[s.state],
      headcount: { fullTime: s.fullTime, partTime: s.partTime, short: s.short },
      lost: s.losses.reduce(plus, zero()),
      closing: s.closing,
      relocationMiles: s.relocationMiles,
      losses: s.losses,
      laws,
      stateCovered: !!st,
      triggered: laws.some((l) => l.triggered),
      noticeBy: due?.noticeBy ?? null,
      noticeLaw: due?.short ?? null,
    };
  });
  const fedSites = results.filter((r) => r.laws[0].triggered);
  const stateSites = results.filter((r) => r.laws[1]?.triggered);
  const uncovered = [...new Set(results.filter((r) => !r.stateCovered).map((r) => r.state))];
  const first = results.filter((r) => r.noticeBy).sort((a, b) => (a.noticeBy < b.noticeBy ? -1 : 1))[0];
  return {
    op: 'check',
    answer: answerOf(results, fedSites, stateSites, first, uncovered),
    sites: results,
    summary: {
      sites: results.length,
      federalSites: fedSites.length,
      stateSites: stateSites.length,
      triggeredSites: results.filter((r) => r.triggered).length,
      firstNoticeBy: first?.noticeBy ?? null,
      firstNoticeSite: first?.name ?? null,
      company,
    },
    notCovered: uncovered,
    noticeDate,
  };
}

function answerOf(results, fedSites, stateSites, first, uncovered) {
  const n = results.length;
  const parts = [];
  if (fedSites.length) {
    const s = fedSites[0];
    const l = s.laws[0];
    parts.push(`Your list triggers federal WARN at ${fmt(fedSites.length)} of ${plural(n, 'site')} (${s.name}: ${fmt(l.window.losses)} full-time employees lost${l.window.base ? ` of ${fmt(l.window.base)}, ${pct(l.window.losses, l.window.base)}` : ''}, a ${l.triggerName}${l.aggregated ? ' added up over 90 days' : ''}); 60 days' notice is due by ${longDate(l.noticeBy)}`);
  } else {
    parts.push(n === 1 ? 'Your list does not trigger federal WARN at its one site' : `Your list does not trigger federal WARN at any of its ${fmt(n)} sites`);
  }
  // One clause per state law that is triggered, naming its sites and its first deadline.
  const byLaw = new Map();
  for (const r of stateSites) {
    const l = r.laws[1];
    if (!byLaw.has(l.code)) byLaw.set(l.code, { l, sites: [] });
    byLaw.get(l.code).sites.push(r);
  }
  for (const { l, sites } of byLaw.values()) {
    const first = sites.map((r) => r.laws[1]).filter((x) => x.noticeBy).sort((a, b) => (a.noticeBy < b.noticeBy ? -1 : 1))[0] ?? l;
    const when = l.noticeWhenTold ? 'the Commissioner must be phoned when employees are told' : l.noticeAfter ? `the Director must be told by ${longDate(first.noticeBy)}` : `${l.noticeDays} days' notice is due by ${longDate(first.noticeBy)}`;
    parts.push(`${l.short} is triggered at ${sites.length === 1 ? sites[0].name : `${sites.length} sites`}, where ${when}`);
  }
  let text = `${parts.join('; ')}.`;
  if (first && fedSites.length && stateSites.length && first.noticeBy < fedSites[0].laws[0].noticeBy) text += ` The earliest deadline is ${longDate(first.noticeBy)} at ${first.name}.`;
  if (uncovered.length) text += ` State law in ${uncovered.map((c) => STATE_NAMES[c]).join(', ')} is not covered by this tool.`;
  return text;
}

// ---------- the employee list ----------
//
// rows: { id, site, state?, hireDate, weeklyHours, separationDate?, reason? }. reason: 'layoff'
// (the default for a row with a separation date), 'cause', 'quit', 'retirement' or
// 'transfer' (an accepted transfer), which are not employment losses (20 CFR 639.3(f)), or
// 'short-layoff' (a layoff of 6 months or less, not a loss unless it is extended). Each row is
// classed on the day notice is first due: the earliest employment loss less 60 days, unless
// countOn is given.
export const REASONS = ['layoff', 'short-layoff', 'cause', 'quit', 'retirement', 'transfer'];
const LOSS = new Set(['layoff']);

export function classify(row, countOn) {
  if (row.hireDate > countOn) return 'later';
  if (row.hireDate > addMonths(countOn, -6)) return 'short';
  return row.weeklyHours < 20 ? 'partTime' : 'fullTime';
}

export function readRows(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new WarnError('Add at least one employee row.', 'rows');
  if (rows.length > LIMITS.rows) throw new WarnError(`At most ${fmt(LIMITS.rows)} employee rows.`, 'rows');
  const ids = new Set();
  return rows.map((r, i) => {
    const f = `rows.${i}`;
    const id = String(r.id ?? '').trim() || `row ${i + 1}`;
    if (ids.has(id)) throw new WarnError(`Employee "${id}" is listed twice.`, `${f}.id`);
    ids.add(id);
    const site = String(r.site ?? '').trim();
    if (!site) throw new WarnError(`${id}: the site is missing.`, `${f}.site`);
    if (!isRealDate(r.hireDate)) throw new WarnError(`${id}: hire date must be written like 2021-03-15.`, `${f}.hireDate`);
    const hours = Number(String(r.weeklyHours ?? '').replace(/,/g, ''));
    if (!(Number.isFinite(hours) && hours >= 0 && hours <= 168)) throw new WarnError(`${id}: average weekly hours must be a number from 0 to 168.`, `${f}.weeklyHours`);
    const sep = r.separationDate ? String(r.separationDate) : null;
    if (sep && !isRealDate(sep)) throw new WarnError(`${id}: separation date must be written like 2027-01-15.`, `${f}.separationDate`);
    if (sep && sep < r.hireDate) throw new WarnError(`${id}: separated before the hire date.`, `${f}.separationDate`);
    const reason = sep ? String(r.reason ?? 'layoff').toLowerCase() : null;
    if (reason && !REASONS.includes(reason)) throw new WarnError(`${id}: reason is one of ${REASONS.join(', ')}.`, `${f}.reason`);
    return { id, site, state: r.state ? normState(r.state, `${f}.state`) : null, hireDate: r.hireDate, weeklyHours: hours, separationDate: sep, reason, i };
  });
}

// Units the list is priced on: employees with a separation date (the people the plan affects).
export const affectedCount = (rows) => (Array.isArray(rows) ? rows.filter((r) => r && r.separationDate).length : 0);

export function list(input) {
  const rows = readRows(input.rows);
  const sitesIn = new Map((input.sites ?? []).map((s, i) => [String(s.name ?? '').trim().toLowerCase(), { ...s, i }]));
  const losses = rows.filter((r) => r.separationDate && LOSS.has(r.reason));
  if (!losses.length) throw new WarnError('No row has an employment loss: give laid-off employees a separation date (reason layoff, the default).', 'rows');
  const firstLoss = losses.map((r) => r.separationDate).sort()[0];
  const countOn = input.countOn ?? addDays(firstLoss, -60);
  if (!isRealDate(countOn)) throw new WarnError('countOn must be a date written like 2026-11-16.', 'countOn');
  const bySite = new Map();
  const classes = new Map();
  for (const r of rows) {
    const key = r.site.toLowerCase();
    if (!bySite.has(key)) {
      const given = sitesIn.get(key);
      const state = given?.state ? normState(given.state, `sites.${given.i}.state`) : r.state;
      if (!state) throw new WarnError(`${r.id}: give the site's state (a state column, or the site in the sites list).`, `rows.${r.i}.state`);
      bySite.set(key, { name: r.site, state, closing: !!given?.closing, relocationMiles: given?.relocationMiles ?? null, head: zero(), losses: new Map() });
    }
    const s = bySite.get(key);
    if (r.state && r.state !== s.state) throw new WarnError(`${r.id}: ${r.site} is in ${s.state} on another row.`, `rows.${r.i}.state`);
    const c = classify(r, countOn);
    classes.set(r.id, c);
    // On the payroll on the count date: counted in the site's headcount.
    const onPayroll = c !== 'later' && (!r.separationDate || r.separationDate > countOn);
    if (onPayroll) s.head[c] += 1;
    if (r.separationDate && LOSS.has(r.reason)) {
      const k = c === 'later' ? 'short' : c;
      const g = s.losses.get(r.separationDate) ?? zero();
      g[k] += 1;
      s.losses.set(r.separationDate, g);
      if (!onPayroll) s.head[k] += 1; // hired after the count date: still at the site when let go
    }
  }
  const sites = [...bySite.values()].filter((s) => s.losses.size).map((s) => ({
    name: s.name, state: s.state, ...s.head, closing: s.closing, relocationMiles: s.relocationMiles,
    losses: [...s.losses].map(([date, c]) => ({ date, ...c })),
  }));
  const kept = [...bySite.values()].filter((s) => !s.losses.size);
  // The company and state totals: from the roster, unless given.
  const roster = [...bySite.values()].reduce((a, s) => plus(a, s.head), zero());
  const employer = input.employer && ['fullTime', 'partTime', 'short'].some((k) => input.employer[k] !== undefined) ? input.employer : { ...roster, weeklyHours: input.employer?.weeklyHours };
  const states = { ...(input.states ?? {}) };
  for (const s of [...bySite.values()]) {
    if (states[s.state]) continue;
    // Sites with no losses still count toward a state's headcount.
    states[s.state] = [...bySite.values()].filter((x) => x.state === s.state).reduce((a, x) => plus(a, x.head), zero());
  }
  const result = check({ employer, states, sites, noticeDate: input.noticeDate });
  // Each employee: class, whether the loss counts, and the notice-by date under each law that is
  // triggered at their site for their date.
  const siteOf = new Map(result.sites.map((s) => [s.name.toLowerCase(), s]));
  const people = rows.filter((r) => r.separationDate).map((r) => {
    const s = siteOf.get(r.site.toLowerCase());
    const c = classes.get(r.id);
    const isLoss = LOSS.has(r.reason);
    const laws = (s?.laws ?? []).filter((l) => l.triggered && isLoss && l.groups.some((g) => g.date === r.separationDate));
    const due = laws.map((l) => ({ law: l.short, noticeBy: l.groups.find((g) => g.date === r.separationDate).noticeBy, after: l.noticeAfter, told: l.noticeWhenTold }));
    const first = due.filter((d) => d.noticeBy && !d.after).map((d) => d.noticeBy).sort()[0] ?? null;
    return {
      id: r.id, site: r.site, state: s?.state ?? r.state, hireDate: r.hireDate, weeklyHours: r.weeklyHours,
      class: c === 'later' ? 'short' : c, separationDate: r.separationDate, reason: r.reason,
      employmentLoss: isLoss, countsFederal: isLoss && c === 'fullTime',
      notices: due, noticeBy: first,
    };
  });
  const csv = listCsv(people, result);
  return {
    ...result,
    op: 'list',
    countOn,
    employees: people,
    sitesWithoutLosses: kept.map((s) => s.name),
    classes: { fullTime: count(classes, 'fullTime'), partTime: count(classes, 'partTime'), short: count(classes, 'short') + count(classes, 'later') },
    csv,
  };
}
const count = (m, v) => [...m.values()].filter((x) => x === v).length;

const csvCell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // never a formula in a spreadsheet
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const csvOf = (columns, rows) => [columns, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

export function listCsv(people, result) {
  const lawsAt = new Map(result.sites.map((s) => [s.name.toLowerCase(), s.laws]));
  const rows = people.map((p) => {
    const laws = lawsAt.get(p.site.toLowerCase()) ?? [];
    const fedL = laws[0];
    const st = laws[1];
    const pick = (l) => (l && l.triggered && p.employmentLoss ? l.groups.find((g) => g.date === p.separationDate) : null);
    const f = pick(fedL);
    const s = pick(st);
    const stDue = s ? (st.noticeWhenTold ? 'phone the Commissioner when employees are told' : st.noticeAfter ? `tell the Director by ${s.noticeBy}` : s.noticeBy) : '';
    return [p.id, p.site, p.state, p.class, p.separationDate, p.reason, p.employmentLoss ? 'yes' : 'no', p.countsFederal ? 'yes' : 'no', f ? 'yes' : 'no', f ? f.noticeBy : '', st && !st.federalOnly ? st.short : '', s ? 'yes' : 'no', stDue, p.noticeBy ?? ''];
  });
  return csvOf(['employee', 'site', 'state', 'class', 'separation_date', 'reason', 'employment_loss', 'counts_toward_federal_threshold', 'federal_notice_due', 'federal_notice_by', 'state_law', 'state_notice_due', 'state_notice_by', 'earliest_notice_by'], rows);
}

// A made-up roster: 120 at a California plant, 80 at a New York office, 60 at a Texas warehouse.
// Hire dates step through the years; every seventh person works under 20 hours a week; a few were
// hired within six months of the count date.
export function sampleRoster() {
  const rows = [];
  const add = (site, state, n, lay, sepDate, prefix) => {
    for (let k = 0; k < n; k += 1) {
      const hireDate = k % 23 === 22 ? addDays('2026-10-01', -(k % 5) * 7) : addDays('2014-03-03', k * 97 % 4000);
      const r = { id: `${prefix}-${String(k + 1).padStart(3, '0')}`, site, state, hireDate, weeklyHours: k % 7 === 6 ? 16 : 40 };
      if (k < lay) { r.separationDate = sepDate; if (k === 0) r.reason = 'retirement'; }
      rows.push(r);
    }
  };
  add('Fresno plant', 'CA', 120, 64, '2027-01-15', 'FR');
  add('Albany office', 'NY', 80, 33, '2027-02-12', 'AL');
  add('Dallas warehouse', 'TX', 60, 12, '2027-01-29', 'DA');
  return rows;
}
// ---------- exposure if notice is short ----------
//
// Federal (DOL Employer's Guide, p.13): back pay and benefits for the period of violation, up to
// 60 days, less wages paid over the notice period and voluntary unconditional payments; up to
// $500 a day if local government was not notified, avoided by paying every employee within 3
// weeks. The state rows add their own caps and rates (CA, NY, WA, IL) and severance (NJ, ME).
// Money is in cents.
export const EXPOSURE_STATES = ['CA', 'NY', 'WA', 'IL', 'NJ', 'ME'];

const cents = (v, field) => {
  if (v == null || v === '') return null;
  const s = String(v).replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new WarnError(`${field} must be an amount in dollars, like 245.50.`, field);
  const [a, b = ''] = s.split('.');
  const c = Number(a) * 100 + Number((b + '00').slice(0, 2));
  if (c > 100_000_000_00) throw new WarnError(`${field} is too large.`, field);
  return c;
};
export const money = (c) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Full years between two dates (anniversaries reached).
export function fullYears(from, to) {
  let y = +to.slice(0, 4) - +from.slice(0, 4);
  if (addMonths(from, y * 12) > to) y -= 1;
  return Math.max(0, y);
}

export function exposure(input) {
  const state = input.state ? normState(input.state) : null;
  if (!isRealDate(input.separationDate)) throw new WarnError('separationDate must be a date written like 2027-01-15.', 'separationDate');
  if (!isRealDate(input.hireDate)) throw new WarnError('hireDate must be a date written like 2019-04-01.', 'hireDate');
  if (input.hireDate > input.separationDate) throw new WarnError('The hire date is after the separation date.', 'hireDate');
  let given;
  if (input.noticeDate) {
    if (!isRealDate(input.noticeDate)) throw new WarnError('noticeDate must be a date written like 2026-12-01.', 'noticeDate');
    given = Math.max(0, daysBetween(input.noticeDate, input.separationDate));
  } else {
    given = whole(input.noticeDays ?? 0, 'noticeDays', { max: 3650 });
  }
  const daily = cents(input.dailyPay, 'dailyPay');
  if (daily === null) throw new WarnError('Give the employee\'s daily pay.', 'dailyPay');
  const average = cents(input.averageDailyPay, 'averageDailyPay');
  const benefits = cents(input.dailyBenefits, 'dailyBenefits') ?? 0;
  const paid = cents(input.wagesPaid, 'wagesPaid') ?? 0;
  const voluntary = cents(input.voluntaryPayments, 'voluntaryPayments') ?? 0;
  const weekly = cents(input.weeklyPay, 'weeklyPay');
  const law = state && STATES[state] && !STATES[state].federalOnly ? STATES[state] : null;
  const employedDays = daysBetween(input.hireDate, input.separationDate);
  const lines = [];
  const caps = [];

  const required = law && law.noticeDays && ['CA', 'NY', 'WA', 'IL'].includes(state) ? law.noticeDays : 60;
  let days = Math.max(0, required - given);
  lines.push(`${plural(given, 'day')} of notice given against ${required} required: ${plural(days, 'day')} short.`);
  if (law && law.noticeDays && law.noticeDays !== required) lines.push(`${law.short} requires ${law.noticeDays} days' notice; the back pay here follows federal WARN's 60 days, because ${law.short}'s own remedy other than severance was not read.`);
  const L = law?.liability;
  if (days > 60) { days = 60; caps.push('capped at 60 days'); }
  if (L?.halfDaysEmployed && days > Math.floor(employedDays / 2)) { days = Math.floor(employedDays / 2); caps.push(`capped at half the ${plural(employedDays, 'day')} employed`); }
  const rate = L?.higherRate && average !== null ? Math.max(daily, average) : daily;
  if (L?.higherRate && average !== null) lines.push(`Daily rate: the higher of the final rate (${money(daily)}) and the 3-year average (${money(average)}), ${money(rate)}.`);
  const gross = days * (rate + benefits);
  const backPay = Math.max(0, gross - paid - voluntary);
  lines.push(`Back pay and benefits: ${plural(days, 'day')} x ${money(rate + benefits)} = ${money(gross)}${caps.length ? ` (${caps.join(', ')})` : ''}${paid || voluntary ? `, less ${money(paid + voluntary)} paid = ${money(backPay)}` : ''}.`);
  const penaltyCap = days * 500 * 100;
  let severance = null;
  if (law?.severance) {
    const S = law.severance;
    const years = fullYears(input.hireDate, input.separationDate);
    if (weekly === null) {
      severance = { weeks: null, amount: null, note: `Give the weekly pay to work out ${law.short} severance.` };
    } else if (S.minYears && years < S.minYears) {
      severance = { weeks: 0, amount: 0, note: `${law.short} severance needs at least ${S.minYears} years; this employee has ${plural(years, 'full year')}.` };
    } else {
      let weeks = years;
      let note = `${plural(years, 'full year')} of service: ${plural(weeks, 'week')} of pay.`;
      if (S.partialYears) {
        const rest = daysBetween(addMonths(input.hireDate, years * 12), input.separationDate);
        const span = daysBetween(addMonths(input.hireDate, years * 12), addMonths(input.hireDate, (years + 1) * 12));
        weeks = years + rest / span;
        note = `${plural(years, 'full year')} and ${rest} of ${span} days of a partial year: ${weeks.toFixed(3)} weeks of pay.`;
      }
      severance = { weeks: Number(weeks.toFixed(3)), amount: Math.round(weeks * weekly), note };
    }
    if (severance.amount !== null) lines.push(`${law.short} severance: ${severance.note} ${money(severance.amount)} at ${money(weekly)} a week.`);
    else lines.push(severance.note);
  }
  const total = backPay + (severance?.amount ?? 0);
  const where = law ? `${law.short} (and federal WARN where it applies)` : 'federal WARN';
  const answer = days > 0
    ? `With ${plural(given, 'day')} of notice the exposure under ${where} is ${plural(days, 'day')} of back pay and benefits, ${money(backPay)}${severance?.amount ? `, plus ${money(severance.amount)} of severance` : ''}, for this employee.`
    : `With ${plural(given, 'day')} of notice there is no back-pay exposure under ${where}${severance?.amount ? `; the ${money(severance.amount)} of ${law.short} severance is still owed` : ''}.`;
  return {
    op: 'exposure',
    answer,
    state,
    law: law ? law.short : 'federal WARN',
    noticeRequired: required,
    noticeGiven: given,
    daysShort: Math.max(0, required - given),
    violationDays: days,
    employedDays,
    dailyRate: money(rate),
    backPay: money(backPay),
    backPayCents: backPay,
    severance: severance ? { ...severance, amount: severance.amount === null ? null : money(severance.amount) } : null,
    totalCents: total,
    total: money(total),
    penaltyCeiling: days ? `${money(penaltyCap)} (up to $500 a day for ${plural(days, 'day')}) if local government was not notified, avoided by paying each employee within 3 weeks` : null,
    lines,
  };
}

// ---------- notice contents (20 CFR 639.7) ----------

export const NOTICE_ELEMENTS = {
  employee: {
    title: 'Each affected employee without a union',
    cite: '20 CFR 639.7(d)',
    items: [
      'Whether the action is expected to be permanent or temporary and, if the whole plant will close, a statement saying so',
      'The expected date the plant closing or mass layoff will start and the expected date this employee will be separated',
      'Whether bumping rights exist',
      'The name and telephone number of a company official to contact',
    ],
  },
  union: {
    title: 'The union (chief elected officer of each representative)',
    cite: '20 CFR 639.7(c)',
    items: [
      'The name and address of the employment site, and the name and telephone number of a company official to contact',
      'Whether the action is expected to be permanent or temporary and, if the whole plant will close, a statement saying so',
      'The expected date of the first separation and the schedule of separations',
      'The job titles of the positions affected and the names of the workers in them',
    ],
  },
  government: {
    title: 'The state dislocated worker unit and the local chief elected official',
    cite: '20 CFR 639.7(e)',
    items: [
      'The name and address of the employment site, and the name and telephone number of a company official to contact',
      'Whether the action is expected to be permanent or temporary and, if the whole plant will close, a statement saying so',
      'The expected date of the first separation and the schedule of separations',
      'The job titles of the positions affected and the number of affected employees in each',
      'Whether bumping rights exist',
      'The name of each union representing affected employees, and the name and address of its chief elected officer',
    ],
  },
};
