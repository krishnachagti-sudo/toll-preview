# How the tip pool calculator works: split and checks

Each share is the pool times that person's hours, points or role share, rounded down to the cent; the cents left over go one each to the largest remainders, so the shares always add up to the pool. With a tip credit, the federal cash wage is at least $2.13 an hour and the credit at most $5.12 against the $7.25 minimum wage, and only customarily tipped staff may share.

## What does the tip pool calculator compute?

Given a pool and up to 200 people with their roles and hours or points, the tool splits the pool by hours worked, points, hours x points, role percentages and equal shares, to the cent, and checks who may be in it: managers, supervisors and owners, back of house with or without a tip credit, and card fee deductions, under 29 CFR Part 531 and DOL Fact Sheet #15, the state rules read on the state's own site, the UK code of practice on tips or Ontario's ESA guide. It also works out a server's tip-outs and gives a payroll CSV with the IRS tipped occupation code for each person.

Operations (the op field):

- `split`: Returns each person's share, the rate per hour, point or point-hour, the card fee taken off (if any), how many people got a leftover cent, and the findings of the check, each with the rule it quotes. Free on the page.
- `tipout`: Returns each role's tip-out as a percentage of sales or of tips, the total, what the server keeps, and the findings on who receives them. Free on the page.
- `check`: Returns each person's status (allowed, check or not allowed) and the findings, with no money involved. Free on the page.
- `rules`: Returns the wage row from the DOL tipped wage table and the pool rules for a state, or the UK or Ontario rules, each quoted with its source. Free.
- `record`: Does what split does for one pay run and also returns the payroll CSV (with the IRS tipped occupation code for US staff), a tip sheet to print and sign, and the file name. A corrected roster for the same location and period end is free for 30 days.

Inputs:

- `jurisdiction`: US (federal rules only, the default), a state code such as US-NY, UK or CA-ON. State pool rules are read for Washington, Minnesota, Massachusetts, New York, Maine, Delaware, Maryland and District of Columbia; for Montana, Virginia, Florida, Arizona, South Dakota and Kansas the state's wage rules were read and the federal pool rules apply.
- `pool, method`: The pool, at most $1,000,000.00, and the split method: hours, points, hours-points, percentage, equal (default hours).
- `staff`: Up to 200 people, each with a name (at most 60 characters), a role (server, bartender, busser, counter, barista, bellhop, stylist, barber, host, runner, barback, nail-tech, assistant, cook, dishwasher, prep, other, manager, owner), hours (at most 744) or points (at most 100), and optionally whether they are customarily tipped (yes, no or check), a supervisor or an owner.
- `rolePercents`: For the percentage method: each role's percentage of the pool, up to 30 roles, adding up to exactly 100.
- `tipCredit, voluntary`: Whether the employer takes a tip credit, and whether the staff agreed the pool among themselves.
- `cardTips, cardFeePercent, tipsPaidOn`: The card tips in the pool and the processor's fee percentage (at most 10%); the date the tips were paid, for the UK deadline.
- `base, sales, tips, outs`: For tipout: whether the tip-outs are a percentage of sales or of tips, the amounts, and each role with its percentage.
- `location, periodEnd`: For record: the location as it should show on the record, and the last day of the pay period.

Outputs:

- answer: the shares in one sentence, with the verdict of the check
- rows: each person's share, role, hours or points, whether they got a leftover cent, and the IRS tipped occupation code for US staff
- rate, totalUnits, groups (role percentages), cardFee, net and rounding
- findings: each with its level (fail, warn or info), the rule, the names it concerns, the quoted text and the citation; verdict: ok, check or fail
- jurisdiction: the DOL tipped wage row for a state, and the sources and read date of its pool rules
- csv, sheet and filename (record only)

## How is it calculated, step by step?

1. Every amount is read as whole cents and every hour or point as whole hundredths, so the arithmetic is exact. "$1,240.50", "1240.5" and 1240.5 all work.
2. Where card tips and a fee percentage are given, the fee is the card tips times the percentage, rounded half up to the cent, and comes off the pool. It is not taken off in the UK, or in a state whose rule says the fee may not come out of card tips; the finding says so.
3. Each person's weight is their hours, their points, hours times points, or 1 for equal shares. Each share is the net pool times the weight divided by the total, rounded down to the cent; the cents left over go one each to the people with the largest remainders, ties to the person listed first, so the shares add up exactly.
4. With role percentages, the pool is first split between the roles that worked (a role with nobody on shift has its percentage shared among the others in proportion), then each role's amount is split by hours inside the role, or equally when hours are missing, by the same largest-remainder rule.
5. In the US, managers and supervisors are never allowed in the pool, and owners are not either (29 CFR 531.52(b)(2), 531.54). With a tip credit, staff who are not customarily tipped are not allowed, and those the DOL does not name either way are flagged to check (more than $30 a month in tips, 29 CFR 531.56(c)). With no tip credit, back of house may share when everyone gets the full minimum wage in cash.
6. For a covered state, each rule read on its site is applied: no tip credit where the state requires the full minimum wage before tips, voluntary-only pools, pools limited to direct service staff, roles allowed and not allowed, card fee rules and the payout, record and notice rules. For a state not covered, only the federal rules apply and the answer says so.
7. In the UK, tips are passed on without deductions other than tax, the deadline is the last day of the month after the month the tip was paid (code of practice, paragraph 33), and records are kept for three years. In Ontario, tips are not wages, so no tip credit; owners and managers share only in the cases the ESA guide names.
8. A tip-out is the base (sales or tips) times each percentage, rounded half up to the cent. A tip-out total over the server's tips is flagged, and the roles receiving it are checked like a pool.
9. The record adds a CSV row per person with the IRS tipped occupation code for the role and the check status; a cell starting with =, +, - or @ gets a quote in front so a spreadsheet never runs it as a formula.

**29 CFR Part 531 and DOL Fact Sheet #15.**

Read through the eCFR as of 2026-11-04. The federal cash wage of $2.13, the tip credit of up to $5.12 and the $7.25 minimum wage, the tip-pool rules for managers, owners and back of house, and the card fee rule are quoted from these with each finding.

**DOL tipped wage table.**

The state wage row (combined minimum, tip credit, cash wage and threshold) is copied exactly as the DOL table shows it, revised November 5, 2026, read 2026-11-08.

**State, UK and Ontario rules.**

State rules come only from the state's own statute or labor agency site, quoted word for word and read 2026-11-08. The UK code of practice and Ontario's ESA guide were read the same day. Other provinces: Not covered: no other province's own site was read.

## Which edge cases does it handle?

- Hours that do not divide the pool evenly give leftover cents, each named in the rows.
- Two people with the same remainder: the leftover cent goes to the one listed first.
- A role in the percentages with nobody on shift has its share passed to the roles that worked, and the answer lists it as dropped.
- Role percentages that do not add up to exactly 100% are refused with the total.
- A cook in the pool is allowed with no tip credit and not allowed with one; a manager is never allowed.
- A tip-out total higher than the tips is a failure where the state says staff cannot pay in more than they received, and a point to check elsewhere.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Split $800 between five people by hours under the federal rules, no tip credit**

```json
{
  "op": "split",
  "jurisdiction": "US",
  "pool": "800.00",
  "method": "hours",
  "tipCredit": false,
  "staff": [
    {
      "name": "Ana",
      "role": "server",
      "hours": 8
    },
    {
      "name": "Ben",
      "role": "server",
      "hours": 6.5
    },
    {
      "name": "Cleo",
      "role": "bartender",
      "hours": 7
    },
    {
      "name": "Dev",
      "role": "busser",
      "hours": 5
    },
    {
      "name": "Eli",
      "role": "cook",
      "hours": 4.5
    }
  ]
}
```

Split $800 between five people by hours under the federal rules, no tip credit

| Result | Value |
| --- | --- |
| answer | Your $800.00 pool over 31 hours pays about $25.81 an hour: Ana $206.45, Ben $167.74, Cleo $180.65, Dev $129.03 and Eli $116.13 (to the cent, adding up to $800.00). No rule is broken on these facts. |
| rate | about $25.81 an hour |
| Ana (Server, 8 hours) | $206.45 |
| Ben (Server, 6.5 hours) | $167.74 |
| Cleo (Bartender, 7 hours) | $180.65 |
| Dev (Busser, 5 hours) | $129.03 |
| Eli (Cook, 4.5 hours) | $116.13 |
| people with a leftover cent | 2 |

**New York, tip credit, hours times points, with a cook and a manager in the pool**

```json
{
  "op": "split",
  "jurisdiction": "US-NY",
  "pool": "1240.00",
  "method": "hours-points",
  "tipCredit": true,
  "staff": [
    {
      "name": "Ana",
      "role": "server",
      "hours": 6,
      "points": 10
    },
    {
      "name": "Ben",
      "role": "server",
      "hours": 5,
      "points": 10
    },
    {
      "name": "Cleo",
      "role": "bartender",
      "hours": 6,
      "points": 8
    },
    {
      "name": "Dev",
      "role": "busser",
      "hours": 6,
      "points": 5
    },
    {
      "name": "Fay",
      "role": "host",
      "hours": 4,
      "points": 3
    },
    {
      "name": "Gus",
      "role": "cook",
      "hours": 7,
      "points": 3
    },
    {
      "name": "Hal",
      "role": "manager",
      "hours": 8,
      "points": 5
    }
  ]
}
```

New York, tip credit, hours times points, with a cook and a manager in the pool

| Result | Value |
| --- | --- |
| answer | Your $1,240.00 pool over 261 point-hours pays about $4.75 a point-hour: Ana $285.06, Ben $237.55, Cleo $228.04, Dev $142.53, Fay $57.01, Gus $99.77 and Hal $190.04 (to the cent, adding up to $1,240.00). The check found 3 problems and 1 point to check: Hal: a manager or supervisor may not receive tips from the pool, whether or not you take a tip credit. They may keep tips customers give them directly for service they alone provide. |
| verdict | fail |
| problem 1 | Hal: a manager or supervisor may not receive tips from the pool, whether or not you take a tip credit. They may keep tips customers give them directly for service they alone provide. |
| problem 2 | Gus: with a tip credit, the pool may include only employees who customarily and regularly receive tips, so this role is not allowed. Pay everyone in the pool at least the full minimum wage in cash to include them. |
| problem 3 | New York: Gus may not share in the pool there (cook), whether or not you take a tip credit. |

**A server's tip-out on $2,000 of sales**

```json
{
  "op": "tipout",
  "jurisdiction": "US",
  "base": "sales",
  "sales": "2000.00",
  "tips": "360.00",
  "outs": [
    {
      "role": "bartender",
      "percent": 2
    },
    {
      "role": "busser",
      "percent": 1.5
    }
  ]
}
```

A server's tip-out on $2,000 of sales

| Result | Value |
| --- | --- |
| answer | On $2,000.00 in sales, the bartender tip-out at 2% is $40.00 and the busser tip-out at 1.5% is $30.00, $70.00 in all; the server keeps $290.00 of $360.00 in tips. No rule is broken on these facts. |
| Bartender at 2% | $40.00 |
| Busser at 1.5% | $30.00 |
| server keeps | $290.00 |

**The payroll record for one pay run**

```json
{
  "op": "record",
  "jurisdiction": "US",
  "pool": "800.00",
  "method": "hours",
  "tipCredit": false,
  "staff": [
    {
      "name": "Ana",
      "role": "server",
      "hours": 8
    },
    {
      "name": "Ben",
      "role": "server",
      "hours": 6.5
    },
    {
      "name": "Cleo",
      "role": "bartender",
      "hours": 7
    },
    {
      "name": "Dev",
      "role": "busser",
      "hours": 5
    },
    {
      "name": "Eli",
      "role": "cook",
      "hours": 4.5
    }
  ],
  "location": "Main Street",
  "periodEnd": "2026-11-15"
}
```

The payroll record for one pay run

| Result | Value |
| --- | --- |
| file | tip-pool-main-street-2026-11-15.csv |
| CSV columns | location,period\_end,name,role,hours,points,share,currency,got\_leftover\_cent,irs\_ttoc,check |
| Ana | $206.45, IRS code 102 |
| Ben | $167.74, IRS code 102 |
| Cleo | $180.65, IRS code 101 |
| Dev | $129.03, IRS code 104 |
| Eli | $116.13, IRS code 105 |

## What does it not do?

- Whether someone is a manager or supervisor, or customarily and regularly tipped, depends on their duties; the tool applies your answer.
- State pool rules are covered only for the states whose own site was read; others get the federal rules and the DOL wage row. City rules and provinces other than Ontario are not covered.
- The split is arithmetic on the hours, points and roles you enter; the tool cannot check them.
- It is not legal or tax advice.

## Where does the data come from, and how fresh is it?

The eCFR text was read as of 2026-11-04; the DOL tipped wage table (revised November 5, 2026), Fact Sheet #15, the state sites, the UK code of practice, Ontario's ESA guide and the IRS tipped occupation list were read on 2026-11-08. The rules change only by hand, with the tests that pin them.

- [29 CFR Part 531, Subpart D: Tipped Employees (eCFR)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-A/part-531/subpart-D)
- [DOL Wage and Hour Division, Fact Sheet #15: Tipped Employees Under the Fair Labor Standards Act (FLSA)](https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa)
- [U.S. Department of Labor, Wage and Hour Division: Minimum Wages for Tipped Employees (table of minimum hourly wages for tipped employees, by state)](https://www.dol.gov/agencies/whd/state/minimum-wage/tipped)
- [Code of practice on fair and transparent distribution of tips (GOV.UK; published 29 July 2024, in effect from 1 October 2024)](https://www.gov.uk/government/publications/distributing-tips-fairly-statutory-code-of-practice/code-of-practice-on-fair-and-transparent-distribution-of-tips-html-version)
- [Ontario Ministry of Labour, Immigration, Training and Skills Development: Your guide to the Employment Standards Act, Tips or other gratuities (updated July 08, 2024)](https://www.ontario.ca/document/your-guide-employment-standards-act-0/tips-and-other-gratuities)
- [IRS: Occupations that customarily and regularly received tips on or before Dec. 31, 2024 (updated 28-Jun-2026)](https://www.irs.gov/forms-pubs/occupations-that-customarily-and-regularly-received-tips-on-or-before-dec-31-2024)
- [Washington: Washington Department of Labor & Industries: Tips and Service Charges](https://www.lni.wa.gov/workers-rights/wages/tips-and-service-charges)
- [Washington: Washington Department of Labor & Industries: Minimum Wage](https://lni.wa.gov/workers-rights/wages/minimum-wage/)
- [Minnesota: Minnesota Statutes 2025, section 177.24 (Office of the Revisor of Statutes)](https://www.revisor.mn.gov/statutes/cite/177.24)
- [Massachusetts: Massachusetts General Laws chapter 149, section 152A (mass.gov, amended by St.2020, c.358, effective January 14, 2021)](https://www.mass.gov/info-details/mass-general-laws-c149-ss-152a)
- [Massachusetts: Massachusetts Attorney General, Advisory 3/2004 on tips (revised 9/2026)](https://www.mass.gov/doc/attorney-generals-advisory-on-tips/download)
- [New York: New York State Department of Labor, Hospitality Industry Wage Order, 12 NYCRR Part 146 (as amended effective December 31, 2016)](https://forms.labor.ny.gov/WP/CR146.pdf)
- [Maine: Maine Revised Statutes, Title 26, section 664 (Maine Legislature)](https://legislature.maine.gov/statutes/26/title26sec664.html)
- [Delaware: Delaware Code, Title 19, Chapter 9, section 902 (Delaware Code Online)](https://delcode.delaware.gov/title19/c009/index.html)
- [Maryland: Maryland Code, Labor and Employment, section 3-419 (Maryland General Assembly)](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-419&enactments=false)
- [District of Columbia: D.C. Code section 32-1003 (Council of the District of Columbia, D.C. Code)](https://code.dccouncil.gov/us/dc/council/code/sections/32-1003)
- [Montana: Montana Code Annotated 39-3-409 (Montana Legislature)](https://leg.mt.gov/bills/mca/title_0390/chapter_0030/part_0040/section_0090/0390-0030-0040-0090.html)
- [Virginia: Code of Virginia 40.1-28.9 (Virginia Law, Legislative Information System)](https://law.lis.virginia.gov/vacode/title40.1/chapter3/section40.1-28.9/)
- [Virginia: Code of Virginia 40.1-28.10 (Virginia Law, Legislative Information System)](https://law.lis.virginia.gov/vacode/title40.1/chapter3/section40.1-28.10/)
- [Florida: Florida Statutes 448.110, Florida Minimum Wage Act (Online Sunshine, Florida Legislature)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0448/Sections/0448.110.html)
- [Arizona: Arizona Revised Statutes 23-363 (Arizona State Legislature)](https://www.azleg.gov/ars/23/00363.htm)
- [South Dakota: South Dakota Department of Labor and Regulation: Minimum Wage](https://dlr.sd.gov/employment_laws/minimum_wage.aspx)
- [Kansas: Kansas Statutes 44-1203 (Kansas Office of Revisor of Statutes)](https://www.ksrevisor.gov/statutes/chapters/ch44/044_012_0003.html)

The eCFR text was read as of 2026-11-04; the DOL tipped wage table (revised November 5, 2026), Fact Sheet #15, the state sites, the UK code of practice, Ontario's ESA guide and the IRS tipped occupation list were read on 2026-11-08. The rules change only by hand, with the tests that pin them.

Tip pool calculator: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [29 CFR Part 531, Subpart D: Tipped Employees (eCFR)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-A/part-531/subpart-D) | as of 2026-11-04 | 2026-11-08 |
| [DOL Wage and Hour Division, Fact Sheet #15: Tipped Employees Under the Fair Labor Standards Act (FLSA)](https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa) | see the document | 2026-11-08 |
| [U.S. Department of Labor, Wage and Hour Division: Minimum Wages for Tipped Employees (table of minimum hourly wages for tipped employees, by state)](https://www.dol.gov/agencies/whd/state/minimum-wage/tipped) | revised 2026-11-05 | 2026-11-08 |
| [Code of practice on fair and transparent distribution of tips (GOV.UK; published 29 July 2024, in effect from 1 October 2024)](https://www.gov.uk/government/publications/distributing-tips-fairly-statutory-code-of-practice/code-of-practice-on-fair-and-transparent-distribution-of-tips-html-version) | published 2024-07-29 | 2026-11-08 |
| [Ontario Ministry of Labour, Immigration, Training and Skills Development: Your guide to the Employment Standards Act, Tips or other gratuities (updated July 08, 2024)](https://www.ontario.ca/document/your-guide-employment-standards-act-0/tips-and-other-gratuities) | updated 2024-07-08 | 2026-11-08 |
| [IRS: What the “No Tax on Tips” deduction means for you (IRS Tax Tip, March 5, 2026; page updated 21-Sep-2026)](https://www.irs.gov/newsroom/what-the-no-tax-on-tips-deduction-means-for-you) | updated 2026-09-21 | 2026-11-08 |
| [IRS: Occupations that customarily and regularly received tips on or before Dec. 31, 2024 (updated 28-Jun-2026)](https://www.irs.gov/forms-pubs/occupations-that-customarily-and-regularly-received-tips-on-or-before-dec-31-2024) | updated 2026-06-28 | 2026-11-08 |
| [IRS: General Instructions for Forms W-2 and W-3 (2026)](https://www.irs.gov/instructions/iw2w3) | see the document | 2026-11-08 |
| [Washington: Washington Department of Labor & Industries: Tips and Service Charges](https://www.lni.wa.gov/workers-rights/wages/tips-and-service-charges) | see the document | 2026-11-08 |
| [Washington: Washington Department of Labor & Industries: Minimum Wage](https://lni.wa.gov/workers-rights/wages/minimum-wage/) | see the document | 2026-11-08 |
| [Minnesota: Minnesota Statutes 2025, section 177.24 (Office of the Revisor of Statutes)](https://www.revisor.mn.gov/statutes/cite/177.24) | see the document | 2026-11-08 |
| [Massachusetts: Massachusetts General Laws chapter 149, section 152A (mass.gov, amended by St.2020, c.358, effective January 14, 2021)](https://www.mass.gov/info-details/mass-general-laws-c149-ss-152a) | see the document | 2026-11-08 |
| [Massachusetts: Massachusetts Attorney General, Advisory 3/2004 on tips (revised 9/2026)](https://www.mass.gov/doc/attorney-generals-advisory-on-tips/download) | see the document | 2026-11-08 |
| [New York: New York State Department of Labor, Hospitality Industry Wage Order, 12 NYCRR Part 146 (as amended effective December 31, 2016)](https://forms.labor.ny.gov/WP/CR146.pdf) | see the document | 2026-11-08 |
| [Maine: Maine Revised Statutes, Title 26, section 664 (Maine Legislature)](https://legislature.maine.gov/statutes/26/title26sec664.html) | see the document | 2026-11-08 |
| [Delaware: Delaware Code, Title 19, Chapter 9, section 902 (Delaware Code Online)](https://delcode.delaware.gov/title19/c009/index.html) | see the document | 2026-11-08 |
| [Maryland: Maryland Code, Labor and Employment, section 3-419 (Maryland General Assembly)](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-419&enactments=false) | see the document | 2026-11-08 |
| [District of Columbia: D.C. Code section 32-1003 (Council of the District of Columbia, D.C. Code)](https://code.dccouncil.gov/us/dc/council/code/sections/32-1003) | see the document | 2026-11-08 |
| [Montana: Montana Code Annotated 39-3-409 (Montana Legislature)](https://leg.mt.gov/bills/mca/title_0390/chapter_0030/part_0040/section_0090/0390-0030-0040-0090.html) | see the document | 2026-11-08 |
| [Virginia: Code of Virginia 40.1-28.9 (Virginia Law, Legislative Information System)](https://law.lis.virginia.gov/vacode/title40.1/chapter3/section40.1-28.9/) | see the document | 2026-11-08 |
| [Virginia: Code of Virginia 40.1-28.10 (Virginia Law, Legislative Information System)](https://law.lis.virginia.gov/vacode/title40.1/chapter3/section40.1-28.10/) | see the document | 2026-11-08 |
| [Florida: Florida Statutes 448.110, Florida Minimum Wage Act (Online Sunshine, Florida Legislature)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0448/Sections/0448.110.html) | see the document | 2026-11-08 |
| [Arizona: Arizona Revised Statutes 23-363 (Arizona State Legislature)](https://www.azleg.gov/ars/23/00363.htm) | see the document | 2026-11-08 |
| [South Dakota: South Dakota Department of Labor and Regulation: Minimum Wage](https://dlr.sd.gov/employment_laws/minimum_wage.aspx) | see the document | 2026-11-08 |
| [Kansas: Kansas Statutes 44-1203 (Kansas Office of Revisor of Statutes)](https://www.ksrevisor.gov/statutes/chapters/ch44/044_012_0003.html) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests pin the federal numbers and the DOL table read date, check that shares always add up and leftover cents go to the largest remainders, every split method, card fees (half up, and refused where the state forbids them), the federal, state, UK and Ontario rules, tip-outs, the UK deadline across leap years, and that the payroll CSV is formula-safe.

What its test suite asserts:

- The federal numbers ($2.13 cash wage, $5.12 credit, $7.25 minimum wage) and the DOL tipped wage table revised 2026-11-05 are pinned with their read date, 2026-11-08.
- Shares always add up to the pool, with leftover cents to the largest remainders and ties to the first listed, for every split method.
- Managers, owners, back of house with and without a tip credit, card fees, each covered state, the UK and Ontario rules and the UK deadline across leap years are checked, and the payroll CSV is formula-safe.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Tip pool calculator tool](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/).

## Questions

### Is there any AI in the tip pool calculator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the tip pool calculator refuse to answer?

Whether someone is a manager or supervisor, or customarily and regularly tipped, depends on their duties; the tool applies your answer. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Tip pool calculator tool](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/tip-pool-calculator/  
Data as of: 2026-11-04
