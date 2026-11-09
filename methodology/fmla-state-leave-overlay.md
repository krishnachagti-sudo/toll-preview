# How state leave stacks on the FMLA: overlay method

Each state law on file is tested against the employee's case, and leave that qualifies under the FMLA and a state law counts against both (29 CFR 825.701(a)), so laws covering the same reason run at the same time and the longest decides the protected weeks. Weeks add up only when a later part of the leave has a reason an earlier law did not cover: a California birth at a 200-person employer gives 22 protected weeks, 18 of them paid.

## How does it work?

1. The case is checked: real dates, a hire date on or before the start, whole-number headcounts, and the counts in the state and within 75 miles no larger than the total.
2. The federal answer comes from the FMLA eligibility checker: a private employer with 50 or more employees is taken as having had them in 20 or more workweeks, and a public agency is covered at any size; the employee needs 12 months with the employer, 1,250 hours in the 12 months before the leave and 50 employees within 75 miles.
3. Each law on file for the state is tested on the case: its start and end dates, the employer size counted the way the law counts it (in the state, at the work location or in all), any upper size limit, whether it applies only where the FMLA does not cover the employer, months, days and hours with the employer, and average weekly hours. The result is yes, no, not-yet, or if when it rests on something the tool cannot check (the earnings test, or rules not on the page read).
4. Pay is tested the same way: the program's start date, its employer size, months and hours, and the earnings test, which makes the answer if when marked as met and no when marked as not met.
5. The leave is split into parts. A birth is the pregnancy disability (10 weeks unless given) and then bonding; any other reason is one part.

> Steps 6 to 9, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/fmla-state-leave-overlay/#what) below.

## What does it not cover?

- States not covered here: Hawaii, Massachusetts, Rhode Island and Virginia (their official sites refused our reads), and the 33 states where we have not read a family or medical leave law; for them only the FMLA is counted.
- Whether a condition qualifies, the earnings test and benefit amounts are decided by the employer and the state program; local ordinances and contracts can give more.
- It does not compute benefit amounts or the earnings test, and it is not legal advice.
- The formal FMLA designation notice is DOL form WH-382; the plan's note carries the state overlay that form does not.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 50 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every state rule and the federal sections were read on November 8, 2026 (the federal eligibility tests on November 8, 2026), each quoted word for word with its source. The data changes only by hand, with the tests that pin it.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests pin the data (51 jurisdictions, 14 covered, 4 named as unreadable, 33 FMLA only, read November 8, 2026) and the key sentence of each state law, and check that every source is on the state's own site.

- [California Civil Rights Department, Leave for Pregnancy Disability and Child Bonding: Quick Reference Guide](https://calcivilrights.ca.gov/employment/pdl-bonding-guide/), state program page, read 2026-11-08
- [California Civil Rights Department, Family Care and Medical Leave: Quick Reference Guide](https://calcivilrights.ca.gov/employment/family-care-medical-leave-guide/), state program page, read 2026-11-08
- [California EDD, Paid Family Leave](https://edd.ca.gov/en/disability/paid-family-leave/), state program page, read 2026-11-08
- [California EDD, Am I Eligible for Disability Insurance Benefits?](https://edd.ca.gov/en/disability/Am_I_Eligible_for_DI_Benefits/), state program page, read 2026-11-08
- [New Jersey Department of Labor, NJ Expands Job-Protected Leave for Workers](https://nj.gov/labor/myleavebenefits/worker/job-protection-information/more-protections.shtml), state program page, read 2026-11-08
- [New Jersey Department of Labor, Division of Temporary Disability and Family Leave Insurance, Maternity Coverage](https://www.nj.gov/labor/myleavebenefits/worker/maternity), state program page, read 2026-11-08
- [New Jersey Department of Labor, MyLeaveBenefits](https://www.nj.gov/labor/myleavebenefits/), state program page, read 2026-11-08
- [New York State Paid Family Leave, Paid Family Leave and Other Benefits (read through WebFetch: curl got 403)](https://paidfamilyleave.ny.gov/paid-family-leave-and-other-benefits), state program page, read 2026-11-08
- [New York State Paid Family Leave, home page (read through WebFetch: curl got 403)](https://paidfamilyleave.ny.gov/), state program page, read 2026-11-08
- [New York State Paid Family Leave, Eligibility (read through WebFetch: curl got 403)](https://paidfamilyleave.ny.gov/eligibility), state program page, read 2026-11-08
- [New York State Paid Family Leave, Benefits (read through WebFetch: curl got 403)](https://paidfamilyleave.ny.gov/benefits), state program page, read 2026-11-08
- [Washington Paid Family and Medical Leave (ESD), Find out how Paid Leave works](https://paidleave.wa.gov/find-out-how-paid-leave-works/), state program page, read 2026-11-08
- [Washington Paid Family and Medical Leave (ESD), Job protection requirements for employers](https://paidleave.wa.gov/job-protection-requirements-for-employers/), state program page, read 2026-11-08
- [Washington Paid Family and Medical Leave (ESD), Employer notice: FMLA impact on Paid Leave job protection (January 8, 2026)](https://paidleave.wa.gov/app/uploads/2026/01/Job-Protection-Employer-Notice_FMLA-Impact-on-PFML-Job-Protection-2026.01.08.pdf), state program page, read 2026-11-08
- [Paid Leave Oregon, home page](https://paidleave.oregon.gov/), state program page, read 2026-11-08
- [Paid Leave Oregon, Overview for employees](https://paidleave.oregon.gov/employees/overview.html), state program page, read 2026-11-08
- [Oregon Bureau of Labor and Industries, Oregon Family Leave Act](https://www.oregon.gov/boli/workers/pages/oregon-family-leave.aspx), state program page, read 2026-11-08
- [Colorado FAMLI Division, FAMLI and FMLA](https://famli.colorado.gov/individuals-and-families/how-famli-works/famli-and-fmla), state program page, read 2026-11-08
- [Colorado FAMLI Division, home page](https://famli.colorado.gov/), state program page, read 2026-11-08
- [Colorado FAMLI Division, Pregnancy Leave](https://famli.colorado.gov/individuals-and-families/reasons-to-take-famli-leave/pregnancy-leave), state program page, read 2026-11-08
- [Connecticut Paid Leave Authority, CT Paid Leave and FMLA](https://www.ctpaidleave.org/how-ct-paid-leave-works/ct-paid-leave-and-fmla), state program page, read 2026-11-08
- [Connecticut Paid Leave Authority, How CT Paid Leave works](https://www.ctpaidleave.org/how-ct-paid-leave-works), state program page, read 2026-11-08
- [Connecticut Paid Leave Authority, Coverage and Eligibility](https://www.ctpaidleave.org/how-ct-paid-leave-works/coverage-and-eligibility), state program page, read 2026-11-08
- [DC Paid Family Leave, Employer Information](https://dcpaidfamilyleave.dc.gov/employer-information/), state program page, read 2026-11-08
- [D.C. Code 32-501, Definitions (D.C. Family and Medical Leave Act)](https://code.dccouncil.gov/us/dc/council/code/sections/32-501), statute text, read 2026-11-08
- [D.C. Code 32-502, Family leave requirement](https://code.dccouncil.gov/us/dc/council/code/sections/32-502), statute text, read 2026-11-08
- [D.C. Code 32-503, Medical leave requirement](https://code.dccouncil.gov/us/dc/council/code/sections/32-503), statute text, read 2026-11-08
- [D.C. Code 32-516, Applicability](https://code.dccouncil.gov/us/dc/council/code/sections/32-516), statute text, read 2026-11-08
- [Delaware Department of Labor, Delaware Paid Leave](https://labor.delaware.gov/delaware-paid-leave/), state program page, read 2026-11-08
- [Maryland Department of Labor, FAMLI (paid family and medical leave)](https://paidleave.maryland.gov/), state program page, read 2026-11-08
- [Md. Code, Labor and Employment 3-1201 (Parental Leave Act definitions)](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-1201&enactments=false), statute text, read 2026-11-08
- [Md. Code, Labor and Employment 3-1202 (parental leave)](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-1202&enactments=false), statute text, read 2026-11-08
- [Maine Department of Labor, Paid Family and Medical Leave](https://www.maine.gov/paidleave/), state program page, read 2026-11-08
- [Maine Paid Family and Medical Leave, Workers](https://www.maine.gov/paidleave/workers/), state program page, read 2026-11-08
- [Maine Paid Family and Medical Leave, Employee FAQ (July 2026)](https://www.maine.gov/paidleave/docs/2026/employees/faq/employeeFAQenglish.pdf), state program page, read 2026-11-08
- [26 M.R.S. 843, Definitions (Maine family medical leave)](https://legislature.maine.gov/statutes/26/title26sec843.html), statute text, read 2026-11-08
- [26 M.R.S. 844, Family medical leave requirement](https://legislature.maine.gov/statutes/26/title26sec844.html), statute text, read 2026-11-08
- [Minn. Stat. 268B.04, Financial eligibility; benefits](https://www.revisor.mn.gov/statutes/cite/268B.04), statute text, read 2026-11-08
- [Minn. Stat. 268B.09, Employment protections](https://www.revisor.mn.gov/statutes/cite/268B.09), statute text, read 2026-11-08
- [Minn. Stat. 268B.27, Relationship to other leave](https://www.revisor.mn.gov/statutes/cite/268B.27), statute text, read 2026-11-08
- [Minn. Stat. 181.941, Pregnancy and parenting leave](https://www.revisor.mn.gov/statutes/cite/181.941), statute text, read 2026-11-08
- [Minn. Stat. 181.940, Definitions](https://www.revisor.mn.gov/statutes/cite/181.940), statute text, read 2026-11-08
- [Iowa Code 216.6 (2026), Unfair employment practices (pregnancy)](https://www.legis.iowa.gov/docs/code/216.6.pdf), statute text, read 2026-11-08
- [Mont. Code Ann. 49-2-310, Maternity leave](https://archive.legmt.gov/bills/mca/title_0490/chapter_0020/part_0030/section_0100/0490-0020-0030-0100.html), statute text, read 2026-11-08
- [Mont. Code Ann. 49-2-311, Reinstatement following pregnancy-related leave](https://archive.legmt.gov/bills/mca/title_0490/chapter_0020/part_0030/section_0110/0490-0020-0030-0110.html), statute text, read 2026-11-08
- [29 CFR 825.701, Interaction with State laws (eCFR)](https://www.ecfr.gov/current/title-29/section-825.701), federal rule or letter, read 2026-11-08
- [29 CFR 825.207, Substitution of paid leave (eCFR)](https://www.ecfr.gov/current/title-29/section-825.207), federal rule or letter, read 2026-11-08
- [29 CFR 825.702, Interaction with anti-discrimination laws (eCFR)](https://www.ecfr.gov/current/title-29/section-825.702), federal rule or letter, read 2026-11-08
- [29 CFR 825.300, Employer notice requirements (eCFR)](https://www.ecfr.gov/current/title-29/section-825.300), federal rule or letter, read 2026-11-08
- [U.S. Department of Labor, Wage and Hour Division, Opinion Letter FMLA2025-01-A (January 14, 2025)](https://www.dol.gov/sites/dolgov/files/WHD/opinion-letters/FMLA/2025_1_14_1_FMLA.pdf), federal rule or letter, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the state family and medical leave overlay compute?

For one employee's leave in one state, the tool lists the state family and medical leave laws that apply alongside the federal FMLA, whether each protects the job and whether it pays, how each runs with the FMLA, and the total weeks of job-protected and state-paid leave, with a birth parent's pregnancy disability followed by bonding as two parts. The rules of 14 jurisdictions (California, Colorado, Connecticut, District of Columbia, Delaware, Iowa, Maryland, Maine, Minnesota, Montana, New Jersey, New York, Oregon and Washington) are quoted word for word from the state's own program, labor or legislature site, read on November 8, 2026. Hawaii, Massachusetts, Rhode Island and Virginia are named as not covered because their sites refused our reads; for the other 33 states only the FMLA is counted. The federal answer comes from the FMLA eligibility checker's engine, so the two tools always agree. Not legal advice. Worked out from each state's own published text, quoted with the date we read it, and from 29 CFR Part 825.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `overlay`: Works out one case: the federal answer, each state law with its job and pay status and the reason for it, the parts of the leave with the laws protecting and paying each, the totals, the notices to give and the notes, with the state's quoted rules and sources.
- `plan`: Does what overlay does for a named employee and adds a designation note the employer can adapt (what is designated, the weeks counted against the FMLA, the paid leave rule during state-paid weeks) and a CSV of the parts and the laws.
- `batch`: Runs the overlay for up to 500 employees, one per row, each in its own state, and returns per row the coverage, the FMLA status, the state laws that apply, the protected and paid weeks and the answer, with a CSV.

Inputs:

- `state`: A two-letter state code, or DC.
- `reason`: One of own, care, bonding, birth, military: the employee's own serious health condition, caring for a family member, bonding with a new child, a birth (the birth parent's pregnancy disability, then bonding), or a military family member's deployment.
- `startDate, hireDate`: The day the leave starts and the day the employee was hired, written like 2026-12-01. The hire date cannot be after the start.
- `hours12, weeklyHours`: Hours worked in the 12 months before the leave (up to 8,784), and the average hours a week. Without weeklyHours, it is hours12 divided by 52.
- `employees, employeesInState, employeesWithin75, employeesAtSite`: The employer's total headcount; the count in the state (the total by default); within 75 miles of the work site (the smaller of the two by default); and at the work location (the count within 75 miles by default).
- `employer`: private (the default) or public. A public agency is covered by the FMLA whatever its size.
- `disabilityWeeks, bondingWeeks, weeks`: For a birth, the weeks of pregnancy disability (10 by default) and of bonding; for any other reason, the weeks of leave. Up to 52. Without a length, the part is open and the laws decide.
- `incapacity`: Yes when the provider certifies incapacity or complications in the pregnancy, for the extra weeks some states give.
- `meetsEarnings`: No when the employee does not meet a state program's earnings test. It is taken as met unless marked, and the answer then says the program applies only if the state's conditions are met.
- `employee`: For plan: the employee's name or ID, as it should show on the note.
- `rows`: For batch: up to 500 cases, each with the fields above.

Outputs:

- answer: which laws apply, which run at the same time as the FMLA, and the protected and paid weeks, in one sentence
- federal: yes, no or if, with the eligibility checker's answer
- laws: each state law with job (yes, if, no, not-yet or none), paid, the reasons, its weeks, how it runs with the FMLA and the quoted rules with their sources
- parts and totals: per part of the leave, the protected and paid weeks and the laws behind them; the total protected and paid weeks and any weeks left unprotected
- notices and notes: the FMLA designation, the paid leave rule, the New York and Washington notices, and what was assumed
- notice, csv and filename (plan); rows and csv (batch)

**Every step in full (9) and the rules**

1. The case is checked: real dates, a hire date on or before the start, whole-number headcounts, and the counts in the state and within 75 miles no larger than the total. Tenure is counted in days and in whole months (the day of the month must be reached; the 31st falls back to the month's last day).
2. The federal answer comes from the FMLA eligibility checker: a private employer with 50 or more employees is taken as having had them in 20 or more workweeks, and a public agency is covered at any size; the employee needs 12 months with the employer, 1,250 hours in the 12 months before the leave and 50 employees within 75 miles. When the employee is not eligible, the FMLA is left out of the stack.
3. Each law on file for the state is tested on the case: its start and end dates, the employer size counted the way the law counts it (in the state, at the work location or in all), any upper size limit, whether it applies only where the FMLA does not cover the employer, months, days and hours with the employer, and average weekly hours. The result is yes, no, not-yet, or if when it rests on something the tool cannot check (the earnings test, or rules not on the page read).
4. Pay is tested the same way: the program's start date, its employer size, months and hours, and the earnings test, which makes the answer if when marked as met and no when marked as not met.
5. The leave is split into parts. A birth is the pregnancy disability (10 weeks unless given) and then bonding; any other reason is one part.
6. For each part, the protected weeks are the part's length or, if shorter, the most weeks any covering law still has left. Every law covering the part is drawn down by those weeks at once (29 CFR 825.701(a)), the FMLA included at its 12 weeks. A law's combined cap limits its banks together, and pregnancy incapacity adds the extra weeks the state gives.
7. Paid weeks are counted the same way from the paying programs, within any state cap on all programs together. A law whose weeks run as the provider certifies covers a part of known length; for an open part it is named in a note, not counted. A law with a reasonable leave and no number of weeks is listed but never counted.
8. The totals add the parts. Where a program gives weeks per type and no combined maximum, only the larger part's paid weeks are certain and the total is shown as at least that.
9. The notices follow: designate FMLA leave in writing within five business days (29 CFR 825.300(d)), and during weeks a state program pays, neither side can force accrued paid leave to run (DOL Opinion Letter FMLA2025-01-A), with New York's and Washington's own notice rules.

**29 CFR Part 825 and the DOL.**

Sections 825.701 (state laws), 825.207 (paid leave substitution), 825.702 (anti-discrimination laws) and 825.300 (employer notices), read on eCFR on November 8, 2026, and Opinion Letter FMLA2025-01-A of January 14, 2025. Leave that qualifies under both laws counts against both; an employee eligible under only one law gets that law's leave.

**States that name pregnancy separately.**

Pregnancy Disability Leave (PDL) runs with the FMLA and CFRA bonding follows it; OFLA and Paid Leave Oregon cannot be taken at the same time for one reason, so the total takes OFLA for the disability and Paid Leave Oregon for bonding. A birth parent's pregnancy disability counts under each law's own-health leave unless the state names pregnancy separately (California PDL, Oregon OFLA, Iowa, Montana and Minnesota).

**Dated changes.**

New Jersey Family Leave Act (NJFLA), from July 17, 2026: 15 or more employees worldwide (or a state or local government agency); 3 months with the employer and 250 hours in the past 12 months; before then, 30 or more employees worldwide; 12 months with the employer and 1,000 hours in the past 12 months. Washington's job protection: 25 or more employees in Washington; 180 calendar days with the employer before the leave (from January 1, 2026). Maine Paid Family and Medical Leave starts May 1, 2026 and Maryland FAMLI (paid family and medical leave) January 1, 2028.

## Which edge cases does it handle?

**The edge cases (7)**

- A birth at a California employer below the FMLA's size still stacks PDL and then CFRA; at four employees, below their five, nothing is protected and both parts are listed as unprotected.
- Own-health leave in California is 12 weeks, not 24: CFRA and the FMLA run together, while SDI can pay up to 52.
- A New Jersey leave before July 17, 2026 is tested against the old law; TDI's protection while benefits are paid is named in a note for an open own-health leave and not counted.
- In the District of Columbia the paid weeks are shown as at least the larger part, since no combined maximum was on the page read.
- Delaware employers with 10 to 24 employees in the state pay parental leave only; Maryland's Parental Leave Act applies only to employers of 15 to 49 that the FMLA does not cover.
- Washington before January 1, 2026 gives no job protection; Washington with pregnancy incapacity raises the combined cap.
- A state that could not be read gives the FMLA alone, and the answer says the state's program is not covered.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A California birth at a 200-person employer: PDL with the FMLA, then CFRA bonding**

A California birth at a 200-person employer: PDL with the FMLA, then CFRA bonding

| Result | Value |
| --- | --- |
| answer | For a birth parent's leave in California starting January 11, 2027 at an employer with 200 employees, the FMLA, PDL, CFRA, SDI and PFL apply (SDI and PFL only if the state's conditions are met); PDL and CFRA run at the same time as the FMLA where the reason qualifies under both; together they protect 22 weeks of leave (10 for pregnancy disability, then 12 for bonding), 18 weeks of them paid by the state. |
| federal FMLA | yes |
| job-protected weeks | 22 |
| state-paid weeks | 18 |
| pregnancy: protected by | FMLA 10, PDL 10 |
| bonding: protected by | FMLA 2, CFRA 12 |
| pregnancy: paid by | SDI 10 |
| bonding: paid by | PFL 8 |

**The input**

```json
{
  "op": "overlay",
  "state": "CA",
  "reason": "birth",
  "startDate": "2027-01-11",
  "hireDate": "2024-06-03",
  "hours12": 1980,
  "employees": 200,
  "disabilityWeeks": 10,
  "employeesWithin75": 200
}
```

**More worked examples (4)**

**The same birth at a 30-person employer: no FMLA, but PDL and CFRA still stack**

The same birth at a 30-person employer: no FMLA, but PDL and CFRA still stack

| Result | Value |
| --- | --- |
| answer | For a birth parent's leave in California starting January 11, 2027 at an employer with 30 employees, PDL, CFRA, SDI and PFL apply (SDI and PFL only if the state's conditions are met); together they protect 22 weeks of leave (10 for pregnancy disability, then 12 for bonding), 18 weeks of them paid by the state. |
| federal FMLA | no |
| job-protected weeks | 22 |
| state-paid weeks | 18 |
| pregnancy: protected by | PDL 10 |
| bonding: protected by | CFRA 12 |
| pregnancy: paid by | SDI 10 |
| bonding: paid by | PFL 8 |

**The input**

```json
{
  "op": "overlay",
  "state": "CA",
  "reason": "birth",
  "startDate": "2027-01-11",
  "hireDate": "2024-06-03",
  "hours12": 1980,
  "employees": 30,
  "disabilityWeeks": 10
}
```

**A Washington birth with pregnancy incapacity: the 18-week combined cap**

A Washington birth with pregnancy incapacity: the 18-week combined cap

| Result | Value |
| --- | --- |
| answer | For a birth parent's leave in Washington starting December 7, 2026 at an employer with 80 employees, the FMLA and Paid Leave apply (Paid Leave only if the state's conditions are met); Paid Leave runs at the same time as the FMLA where the reason qualifies under both; together they protect 18 weeks of leave (8 for pregnancy disability, then 10 for bonding), 18 weeks of them paid by the state. |
| federal FMLA | yes |
| job-protected weeks | 18 |
| state-paid weeks | 18 |
| pregnancy: protected by | FMLA 8, Paid Leave 8 |
| bonding: protected by | FMLA 4, Paid Leave 10 |
| pregnancy: paid by | Paid Leave 8 |
| bonding: paid by | Paid Leave 10 |

**The input**

```json
{
  "op": "overlay",
  "state": "WA",
  "reason": "birth",
  "startDate": "2026-12-07",
  "hireDate": "2025-02-10",
  "hours12": 2010,
  "employees": 80,
  "employeesInState": 80,
  "disabilityWeeks": 8,
  "incapacity": true
}
```

**Massachusetts: the state program could not be read, so the FMLA alone**

Massachusetts: the state program could not be read, so the FMLA alone

| Result | Value |
| --- | --- |
| answer | For a leave for caring for a family member with a serious health condition in Massachusetts starting December 1, 2026 at an employer with 120 employees, the FMLA applies and protects up to 12 weeks; the state's own leave program could not be read from its official sites, so it is not covered here. |
| coverage | blocked |
| job-protected weeks | 12 |

**The input**

```json
{
  "op": "overlay",
  "state": "MA",
  "reason": "care",
  "startDate": "2026-12-01",
  "hireDate": "2023-09-05",
  "hours12": 1900,
  "employees": 120
}
```

**Four employees in four states in one call**

Four employees in four states in one call

| Result | Value |
| --- | --- |
| row 1, CO | FMLA and FAMLI: 12 weeks protected, 12 paid |
| row 2, NY | FMLA and PFL: 12 weeks protected, 12 paid |
| row 3, OR | FMLA and Paid Leave Oregon, OFLA: 22 weeks protected, 12 paid |
| row 4, TX | FMLA: 12 weeks protected, 0 paid |

**The input**

```json
{
  "op": "batch",
  "rows": [
    {
      "state": "CO",
      "reason": "own",
      "startDate": "2026-12-01",
      "hireDate": "2025-01-06",
      "hours12": 2000,
      "employees": 60
    },
    {
      "state": "NY",
      "reason": "care",
      "startDate": "2026-12-01",
      "hireDate": "2025-01-06",
      "hours12": 2000,
      "employees": 60
    },
    {
      "state": "OR",
      "reason": "birth",
      "startDate": "2026-12-01",
      "hireDate": "2025-01-06",
      "hours12": 2000,
      "employees": 60,
      "disabilityWeeks": 10
    },
    {
      "state": "TX",
      "reason": "own",
      "startDate": "2026-12-01",
      "hireDate": "2025-01-06",
      "hours12": 2000,
      "employees": 60
    }
  ]
}
```

## How is it tested?

They work California, Washington, New Jersey, Oregon, Colorado, Connecticut, Maine, Minnesota, DC, Delaware, Maryland, New York, Iowa and Montana week by week, the federal answer from the eligibility checker, the refusals, the designation note, the CSVs and every example.

**What its test suite asserts (3)**

- The data is pinned: 51 jurisdictions, 14 covered, 4 named as unreadable and 33 FMLA only, read on 2026-11-08, with the key sentence of each state law matched and every source on the state's own site.
- Each covered state is worked week by week, from California's PDL, CFRA, SDI and PFL to the Washington caps, the New Jersey change of July 17, 2026, Oregon's OFLA choice and the DC minimum.
- The federal answer from the FMLA eligibility checker, the refusals, the designation note, the plan and batch CSVs, every example and the prices are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the State family and medical leave overlay tool](https://krishnachagti-sudo.github.io/toll-preview/fmla-state-leave-overlay/).

## Questions

### Is there any AI in the state family and medical leave overlay answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the state family and medical leave overlay refuse to answer?

States not covered here: Hawaii, Massachusetts, Rhode Island and Virginia (their official sites refused our reads), and the 33 states where we have not read a family or medical leave law; for them only the FMLA is counted. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the State family and medical leave overlay tool](https://krishnachagti-sudo.github.io/toll-preview/fmla-state-leave-overlay/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/fmla-state-leave-overlay/  
Data as of: 2026-11-04
