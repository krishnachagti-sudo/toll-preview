# How PTO and sick leave accrual is worked out by state

Sick time is earned at the law's rate on the hours worked so far in the plan year, rounded down: Washington is 1 hour per 40 hours worked, so 1,144 hours worked earn 28.6 hours. Caps, waiting periods and carryover limits are applied as the law allows. 18 states and 7 cities are covered.

## How does it work?

1. Pay period ends: weekly adds 7 days, every two weeks adds 14, twice a month is the 15th and the last day of the month, and monthly keeps the day of the month (the last day stays the last day).
2. The place picks the law's row; where it sets rules by employer size, the employees given pick the tier, and without them the tool asks.
3. Sick time is worked out from the hours worked so far in the plan year: the hours divided by the law's rate, rounded down to a thousandth of an hour, less what was already earned.
4. Unless applyCaps is false, the limits the law lets an employer apply are used: the yearly accrual limit, the balance cap (accrual pauses until time is used), the yearly use limit, the waiting period in days from hire or hours worked, and the carryover limit at the plan year end, above which hours are forfeited.
5. The low-hours rule where the law has one (Maryland): no sick time in a two-week period under 24 hours, a week where it and the week before are under 24 hours, or a half month under 26 hours.

> Steps 6 to 9, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/pto-accrual/#what) below.

## What does it not cover?

- The limits shown are the most an employer may apply; your written policy, a union contract or a local ordinance can give more.
- City and county ordinances other than the covered cities are not applied; a covered city notes that the state law also applies where it gives more.
- The payout answer covers the vacation rule and sick leave law only; when the final paycheck itself is due is not worked out here. Not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 48 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every rule was read on November 9, 2026 from the state's or city's own statute or agency page, and each quote was checked against the fetched text before it was kept. The source pages are checked once a day for changes; a change is read again by a person before the rules file is edited, with the tests that pin the quotes.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests pin the covered states, cities and vacation states, every source as a government or legislature site read that day, and the key quotes. They check Washington's 1 per 40 exact over the year beside a PTO bank, caps and carryover, the Maryland short-period rule, D.C. and Seattle tiers, waiting periods and use limits, front-loading, plan years and pay schedules, the refusals, payout with the Illinois combined bank, per-paycheck figures, rules and batch rows.

- [Washington Department of Labor & Industries, Paid Sick Leave](https://lni.wa.gov/workers-rights/leave/paid-sick-leave/), see the document, read 2026-11-08
- [RCW 49.46.210, Paid sick leave](https://app.leg.wa.gov/RCW/default.aspx?cite=49.46.210), see the document, read 2026-11-08
- [Oregon Bureau of Labor and Industries, Sick time](https://www.oregon.gov/boli/workers/pages/sick-time.aspx), see the document, read 2026-11-08
- [A.R.S. 23-372, Accrual of earned paid sick time](https://www.azleg.gov/ars/23/00372.htm), see the document, read 2026-11-08
- [A.R.S. 23-373, Use of earned paid sick time](https://www.azleg.gov/ars/23/00373.htm), see the document, read 2026-11-08
- [Md. Code, Labor and Employment 3-1304, Earned sick and safe leave](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-1304&enactments=false), see the document, read 2026-11-08
- [Minn. Stat. 181.9446, Accrual of earned sick and safe time (2026)](https://www.revisor.mn.gov/statutes/cite/181.9446), see the document, read 2026-11-08
- [Minn. Stat. 181.9448, Earned sick and safe time: separation, rehire (2026)](https://www.revisor.mn.gov/statutes/cite/181.9448), see the document, read 2026-11-08
- [Minnesota Department of Labor and Industry, Earned sick and safe time](https://www.dli.mn.gov/sick-leave), see the document, read 2026-11-08
- [D.C. Code 32-531.02, Provision of paid leave](https://code.dccouncil.gov/us/dc/council/code/sections/32-531.02), see the document, read 2026-11-08
- [26 M.R.S. 637, Earned paid leave](https://legislature.maine.gov/statutes/26/title26sec637-2.html), see the document, read 2026-11-08
- [New Jersey Department of Labor and Workforce Development, Earned Sick Leave](https://www.nj.gov/labor/myworkrights/leave-benefits/sick-leave/law.shtml), see the document, read 2026-11-08
- [Illinois Department of Labor, Paid Leave for All Workers Act FAQ](https://labor.illinois.gov/faqs/paidleavefaq.html), see the document, read 2026-11-08
- [Colorado Department of Labor and Employment, INFO #6: Paid Leave under the Healthy Families and Workplaces Act (last updated July 19, 2023)](https://cdle.colorado.gov/sites/cdle/files/info_%236_hfwa_summary_%26_overview_07.19.23.pdf), see the document, read 2026-11-08
- [Alaska Department of Labor and Workforce Development, Minimum Wage and Paid Sick Leave FAQ (AS 23.10.066-23.10.069)](https://labor.alaska.gov/lss/sick-leave-faq.html), see the document, read 2026-11-08
- [Vermont Department of Labor, Vermont's Earned Sick Time Act notice](https://labor.vermont.gov/sites/labor/files/doc_library/Earned%20sick%20time%20text%20new.pdf), see the document, read 2026-11-08
- [Vermont Department of Labor, Vermont's Earned Sick Time Act Notice of Employee Rights (December 2016)](https://labor.vermont.gov/sites/labor/files/doc_library/EarnedSickTimePoster.pdf), see the document, read 2026-11-08
- [Va. Code 40.1-33.4, Accrual of paid sick leave (home health workers)](https://law.lis.virginia.gov/vacode/title40.1/chapter3/section40.1-33.4/), see the document, read 2026-11-08
- [Va. Code 40.1-33.3, Definitions (home health worker)](https://law.lis.virginia.gov/vacode/title40.1/chapter3/section40.1-33.3/), see the document, read 2026-11-08
- [NYC Department of Consumer and Worker Protection, Protected Time Off Law FAQs](https://www.nyc.gov/site/dca/about/paid-sick-leave-FAQs.page), see the document, read 2026-11-08
- [City of Chicago BACP, Paid Leave and Paid Sick Leave](https://www.chicago.gov/city/en/depts/bacp/supp_info/paidsickleaveinfo.html), see the document, read 2026-11-08
- [Seattle Office of Labor Standards, Paid Sick and Safe Time](https://www.seattle.gov/laborstandards/ordinances/paid-sick-and-safe-time), see the document, read 2026-11-08
- [City of Los Angeles Office of Wage Standards, paid sick leave](https://wagesla.lacity.gov/), see the document, read 2026-11-08
- [City of Saint Paul HREEO, Earned Sick and Safe Time](https://www.stpaul.gov/departments/human-rights-equal-economic-opportunity/labor-standards-enforcement-and-education/earned-sick-safe-time), see the document, read 2026-11-08
- [City of Philadelphia Department of Labor, Paid sick leave one-pager (2025)](https://www.phila.gov/media/20250731151754/dol-paid-sick-leave-one-pager-en.pdf), see the document, read 2026-11-08
- [City of Philadelphia Office of Worker Protections, Sick Leave Regulations](https://www.phila.gov/departments/department-of-records/regulations/sick-leave-regulations.pdf), see the document, read 2026-11-08
- [Montgomery County Office of Human Rights, Earned Sick and Safe Leave poster (County Code ch. 27, art. XIII)](https://www.montgomerycountymd.gov/humanrights/Resources/Files/EarnedSickandSavedLeave_Poster.pdf), see the document, read 2026-11-08
- [Illinois Department of Labor, Wage Payment and Collection Act FAQ (820 ILCS 115/5)](https://labor.illinois.gov/faqs/wage-payment-faq.html), see the document, read 2026-11-08
- [Illinois Department of Labor, Vacation FAQ](https://labor.illinois.gov/faqs/vacation-faq.html), see the document, read 2026-11-08
- [26 M.R.S. 626, Cessation of employment](https://legislature.maine.gov/statutes/26/title26sec626.html), see the document, read 2026-11-08
- [Md. Code, Labor and Employment 3-505](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-505&enactments=false), see the document, read 2026-11-08
- [Iowa Code 91A.4 (2026), Employment suspension or termination](https://www.legis.iowa.gov/docs/code/91A.4.pdf), see the document, read 2026-11-08
- [N.D. Cent. Code 34-14-09.2, Limitations on accrued paid time off](https://ndlegis.gov/cencode/t34c14.pdf), see the document, read 2026-11-08
- [Oklahoma Department of Labor, Protect Your Pay](https://oklahoma.gov/labor/workplace-rights/protect-your-pay.html), see the document, read 2026-11-08
- [Tennessee Department of Labor and Workforce Development, Wages, fringe benefits, paychecks (Tenn. Code Ann. 50-2-103)](https://www.tn.gov/workforce/employees/labor-laws/labor-laws-redirect/wages-breaks.html), see the document, read 2026-11-08
- [West Virginia Division of Labor, WPCA Fact Sheet 6: Payment of Final Wages (July 2016)](https://labor.wv.gov/media/85/download?inline=), see the document, read 2026-11-08
- [Wyoming Department of Workforce Services, Labor Standards employer FAQ](https://dws.wyo.gov/dws-division/labor-standards/employers/faq/), see the document, read 2026-11-08
- [Connecticut Department of Labor, Wage Payment Laws (C.G.S. 31-71a to 31-76k), update December 2023](https://portal.ct.gov/dol/-/media/DOL/2022-New-Design-System/Divisions/wage-and-workplace-standards/WagePaymentLaws_Update12-2023.pdf), see the document, read 2026-11-08
- [Oregon Bureau of Labor and Industries, Paychecks](https://www.oregon.gov/boli/workers/pages/paychecks.aspx), see the document, read 2026-11-08
- [S.C. Code 41-10-10 (2019 session version, the newest copy the legislature's site served)](https://www.scstatehouse.gov/Archives/CodeofLaws2019/t41c010.php), see the document, read 2026-11-08
- [South Dakota Department of Labor and Regulation, What you need to know about South Dakota labor laws (rev. 01/2026)](https://dlr.sd.gov/employment_laws/publications/what_need_know_laws.pdf), see the document, read 2026-11-08
- [Texas Labor Code 61.001, Definitions (Payment of Wages)](https://statutes.capitol.texas.gov/Docs/LA/htm/LA.61.htm), see the document, read 2026-11-08
- [Vermont Department of Labor, A Summary of Vermont Wage and Hour Laws (WH-13, 2019)](https://labor.vermont.gov/sites/labor/files/doc_library/WH-13-Wage-and-Hour-Laws-2019%20.pdf), see the document, read 2026-11-08
- [Cal. Labor Code 246, paid sick days (California Legislative Information)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=246.), see the document, read 2026-11-09
- [Massachusetts Attorney General's Office, Fair Labor Division: Earned Sick Time](https://www.mass.gov/info-details/earned-sick-time), see the document, read 2026-11-09
- [Michigan Department of Labor and Economic Opportunity, Earned Sick Time Act: Frequently Asked Questions (FAQ)](https://www.michigan.gov/leo/-/media/Project/Websites/leo/Documents/WAGE-HOUR/LEO-ESTA-FAQ-English.pdf), see the document, read 2026-11-09
- [The State of New York, New York Paid Sick Leave](https://www.ny.gov/programs/new-york-paid-sick-leave), see the document, read 2026-11-09
- [Connecticut Department of Labor, Paid Sick Leave FAQs (CGS 31-57r to 31-57w)](https://portal.ct.gov/dol/divisions/legal/connecticut-leave-programs/paid-sick-leave-faqs), see the document, read 2026-11-09

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the pto and sick leave accrual by state compute?

The tool runs one employee's PTO policy bank and the state or city paid sick leave bank side by side, paycheck by paycheck: hours earned per hour worked or per pay period, the yearly and balance caps, the waiting period, year-end carryover and what is forfeited. It also works out the payout at separation under the state's vacation rule, the hours per paycheck for a yearly PTO amount, and each covered place's rules, quoted word for word from its own statute or agency page read on November 9, 2026. Covered sick leave laws: Alaska, Arizona, California, Colorado, Connecticut, District of Columbia, Illinois, Massachusetts, Maryland, Maine, Michigan, Minnesota, New Jersey, New York, Oregon, Virginia, Vermont and Washington, and Chicago, IL, Los Angeles, CA, Montgomery County, MD, New York City, NY, Philadelphia, PA, Saint Paul, MN and Seattle, WA. Worked out from each state's or city's own published text, quoted with the date we read it. Not legal advice.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `accrue`: Runs one employee paycheck by paycheck: sick time earned, used and the balance under the place's law, the PTO policy bank beside it, each plan year end with what carries over and what is forfeited, the paycheck a cap is reached, any use refused with the reason, the rule in words and the quotes it rests on.
- `payout`: Works out the gross pay for unused PTO and sick hours at the final hourly rate (or a salary turned into one), and whether the state's vacation rule and sick leave law make it owed at separation, with the quotes.
- `per-period`: Spreads a yearly PTO amount over weekly, every-two-weeks, twice-a-month and monthly paychecks, and per hour worked over 2,080 hours a year or the hours given.
- `rules`: Returns one place's sick leave rules: each employer-size tier in words with its limits, the waiting period, rehire rule, payout rule and every fact with its quote; for a state not covered, why, and its vacation rule.
- `batch`: Runs accrue for up to 500 employees in one call, one row each with the sick and PTO totals, the paycheck a sick cap is reached and refused uses, and a CSV; a row the engine refuses carries its error and the rest still answer.

Inputs:

- `place, employees`: A two-letter state code or a city such as seattle, and the number of employees where the law sets rules by employer size.
- `frequency, firstPeriodEnd`: How often pay is: weekly (52 a year), biweekly (26 a year), semimonthly (24 a year), monthly (12 a year); and the last day of the first pay period, written like 2027-01-08.
- `hours, or hoursPerPeriod with periods`: Hours worked in each pay period (a list), or the same hours for so many periods; 1 to 160 periods, 0 to 400 hours each.
- `hireDate, yearStart, hoursPerDay`: The hire date (for waiting periods), the first day of the plan year written like 01-01 (January 1 by default), and hours in a day for caps written in days (8 by default).
- `sick`: method (accrue, or frontload where the law states an amount), applyCaps (true by default), and the balance, hours earned and hours used so far this year.
- `pto`: The employer's policy: annualHours or perHour (not both), an optional balance cap and carryover limit, and the starting balance.
- `use`: Sick or PTO hours used, by pay period number.
- `state, ptoHours, sickHours, rate or salary, combined`: For payout: the state, the unused hours, the final hourly rate or a salary per year, month or week, and whether the PTO bank is also the sick leave bank.
- `annualHours, hoursPerYear`: For per-period: the yearly PTO hours and the hours worked a year.
- `employees (batch)`: For batch: up to 500 employees, each with an optional id and the accrue fields.

Outputs:

- answer: the hours earned and the ending balance of each bank, the cap reached, and what carries over at year end
- rows: each paycheck with its end date, hours worked, and sick and PTO earned, used and balance, with a note where no time was earned
- yearEnds, events and refused: carryover and forfeits, caps reached, and use refused with the reason
- tier, quotes and notes: the rule in words, the law's words with source and date read, and anything not covered
- payout: the rate, the PTO and sick amounts, owedByLaw and the rule with its citation
- per-period rows and perHourWorked; rules tiers and facts; batch rows and csv

**Every step in full (9) and the rules**

1. Pay period ends: weekly adds 7 days, every two weeks adds 14, twice a month is the 15th and the last day of the month, and monthly keeps the day of the month (the last day stays the last day). The hire date defaults to the first day of the first weekly or two-week period.
2. The place picks the law's row; where it sets rules by employer size, the employees given pick the tier, and without them the tool asks.
3. Sick time is worked out from the hours worked so far in the plan year: the hours divided by the law's rate, rounded down to a thousandth of an hour, less what was already earned. So rounding never drifts across paychecks.
4. Unless applyCaps is false, the limits the law lets an employer apply are used: the yearly accrual limit, the balance cap (accrual pauses until time is used), the yearly use limit, the waiting period in days from hire or hours worked, and the carryover limit at the plan year end, above which hours are forfeited. A cap written in days becomes hours at the hours per day given.
5. The low-hours rule where the law has one (Maryland): no sick time in a two-week period under 24 hours, a week where it and the week before are under 24 hours, or a half month under 26 hours.
6. Front-loading, where the law states an amount: that many hours at the start and each new plan year, replacing what is left unless the law carries it over.
7. The PTO policy bank: a yearly amount is spread so that after k paychecks the total is the yearly hours times k over the paychecks a year, rounded, so the year adds up exactly; a per-hour policy is the hours worked times the rate, rounded down. A policy cap pauses accrual; a carryover limit applies at year end. Use above the balance is refused.
8. Payout: the PTO and sick hours times the final rate, rounded to the cent. A salary becomes an hourly rate over 2,080 hours a year, a twelfth of that a month, or 40 hours a week. The state's vacation rule is one of: must be paid, as earned vacation counts as wages; must be paid unless a written policy says otherwise; must be paid, with narrow written exceptions; is owed only as the written policy or agreement says. PTO counts as owed by law except under a written-policy rule; sick time counts only where Illinois's combined bank makes it vacation.
9. Per paycheck: the yearly hours over 52, 26, 24, 12 paychecks, to a thousandth of an hour, and per hour worked over the hours a year, to four places.

**The rules file.**

Each covered place's rate, tiers, caps, carryover, front-load, low-hours and waiting rules are quoted word for word from 48 statute and agency pages, all read on November 9, 2026. A limit the source does not state is null, and the engine says so rather than guessing.

Vacation payout rules are held for 15 states: Connecticut, Iowa, Illinois, Maryland, Maine, North Dakota, Oklahoma, Oregon, South Carolina, South Dakota, Tennessee, Texas, Vermont, West Virginia and Wyoming. Other states' payout rule was not read, and the answer says so.

**Places not covered.**

5 states' sick leave rules could not be read from our network and are not covered: Missouri, Nebraska, Nevada, New Mexico and Rhode Island. South Dakota has no paid sick leave law; other states without a statewide rule we read get none applied.

Cities not covered: San Francisco, CA (could not be read on 2026-11-08: sf.gov and sfgov.org returned a bot check (HTTP 202), which we do not get around.); Minneapolis, MN (could not be read on 2026-11-08: the sick and safe time page did not include the rules in the page we were served.).

## Which edge cases does it handle?

**The edge cases (6)**

- Washington carries over at most 40 hours: a weekly full-time employee with 52 hours at the year end carries 40 and forfeits 12.
- Maryland at 15 or more employees pays sick time; at fewer it is unpaid, job-protected time.
- Arizona under 15 employees: use before day 90 of employment may be refused, and use past 24 hours a year is refused in part.
- D.C. sets three tiers by employer size and caps written in days, turned into hours at 8 hours a day unless hoursPerDay is given.
- A place not covered gives no sick bank: with a PTO policy only the PTO bank is worked out, and without one the call is refused with the reason.
- A front-load where the source states no amount is refused; twice-a-month pay must start on the 15th or the last day of a month.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Washington, part time: PTO and sick time in separate banks through 2027**

Washington, part time: PTO and sick time in separate banks through 2027

| Result | Value |
| --- | --- |
| answer | Over 26 paychecks every two weeks (January 8, 2027 to December 24, 2027) and 1,144 hours worked, the PTO bank earns 80 hours and ends at 80 hours; the separate Washington sick bank earns 28.60 hours at 1 hour per 40 hours worked and ends at 20.60 hours. |
| sick rule | 1 hour per 40 hours worked; carryover may be limited to 40 hours |
| PTO policy | 80 hours a year, 3.08 hours a paycheck every two weeks |
| sick time | 28.6 earned, 8 used, 20.6 left |
| first paycheck | 1.1 sick hours, 3.08 PTO hours |

**The input**

```json
{
  "op": "accrue",
  "place": "WA",
  "frequency": "biweekly",
  "firstPeriodEnd": "2027-01-08",
  "hoursPerPeriod": 44,
  "periods": 26,
  "pto": {
    "annualHours": 80
  },
  "use": [
    {
      "period": 10,
      "sick": 8
    }
  ]
}
```

**More worked examples (5)**

**Maryland, 20 employees: the 40-hour yearly limit and a short two-week period**

Maryland, 20 employees: the 40-hour yearly limit and a short two-week period

| Result | Value |
| --- | --- |
| answer | Over 28 paychecks every two weeks (January 8, 2027 to January 21, 2028) and 2,180 hours worked, the Maryland sick bank earns 45.33 hours at 1 hour per 30 hours worked and ends at 45.33 hours, reaching its cap on paycheck 17 (August 20, 2027). At the plan year end 40 hours of sick time carries over. |
| tier | 15 or more employees: paid |
| paycheck 2 | 20 hours: under 24 hours in the two weeks: no accrual |
| cap | Paycheck 17 (August 20, 2027): the 40 hours yearly accrual limit is reached. |
| year end | 40 hours, 40 carried, 0 forfeited |

**The input**

```json
{
  "op": "accrue",
  "place": "MD",
  "employees": 20,
  "frequency": "biweekly",
  "firstPeriodEnd": "2027-01-08",
  "hours": [
    80,
    20,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80,
    80
  ]
}
```

**Illinois: 64 hours of unused vacation at $28 an hour at separation**

Illinois: 64 hours of unused vacation at $28 an hour at separation

| Result | Value |
| --- | --- |
| answer | Paying out 64 hours of PTO at $28.00 an hour is $1,792.00 gross (and 20 hours of sick time would be $560.00). In Illinois, unused vacation at separation must be paid, as earned vacation counts as wages (820 ILCS 115/5; 56 Ill. Adm. Code 300.520); unused sick leave under the state law need not be paid out (IDOL PLAWA FAQ). |
| PTO | 64 hours, $1,792.00 |
| sick | 20 hours, $560.00 |
| owed by law | $1,792.00 |

**The input**

```json
{
  "op": "payout",
  "state": "IL",
  "ptoHours": 64,
  "sickHours": 20,
  "rate": 28
}
```

**120 PTO hours a year, per paycheck and per hour worked**

120 PTO hours a year, per paycheck and per hour worked

| Result | Value |
| --- | --- |
| answer | 120 hours a year is 4.62 hours a paycheck every two weeks (120 / 26), 5.00 twice a month, 2.31 weekly and 10.00 monthly; per hour worked it is 0.0577 hours (120 / 2,080). |
| weekly | 2.308 hours (120 / 52) |
| every two weeks | 4.615 hours (120 / 26) |
| twice a month | 5 hours (120 / 24) |
| monthly | 10 hours (120 / 12) |
| per hour worked | 0.0577 |

**The input**

```json
{
  "op": "per-period",
  "annualHours": 120
}
```

**Seattle: the three employer-size tiers**

Seattle: the three employer-size tiers

| Result | Value |
| --- | --- |
| answer | Seattle, WA (SMC 14.16): Tier 3: 250 or more FTEs worldwide: 1 hour per 30 hours worked; carryover may be limited to 72 hours. Tier 2: 50 to 249 FTEs: 1 hour per 40 hours worked; carryover may be limited to 56 hours. Tier 1: 1 to 49 FTEs: 1 hour per 40 hours worked; carryover may be limited to 40 hours. |
| Tier 3: 250 or more FTEs worldwide | 1 hour per 30 hours worked; carryover may be limited to 72 hours |
| Tier 2: 50 to 249 FTEs | 1 hour per 40 hours worked; carryover may be limited to 56 hours |
| Tier 1: 1 to 49 FTEs | 1 hour per 40 hours worked; carryover may be limited to 40 hours |

**The input**

```json
{
  "op": "rules",
  "place": "seattle"
}
```

**Four employees in four places in one call**

Four employees in four places in one call

| Result | Value |
| --- | --- |
| answered | 3 of 4 |
| A-101 (OR) | sick 40 hours, PTO 120 hours |
| A-102 (seattle) | sick 32.5 hours |
| A-103 (NJ) | sick 40 hours |
| A-104 (refused) | Rhode Island's sick leave rules are not covered: could not be read from our network on 2026-11-08: dlt.ri.gov answered 403; webserver.rilegislature.gov timed out. Tried again in a browser on 2026-11-09: webserver.rilegislature.gov did not load and dlt.ri.gov showed a bot check. Add a pto policy to work out the PTO bank alone. |

**The input**

```json
{
  "op": "batch",
  "employees": [
    {
      "id": "A-101",
      "place": "OR",
      "employees": 40,
      "frequency": "biweekly",
      "firstPeriodEnd": "2027-01-08",
      "hoursPerPeriod": 80,
      "periods": 26,
      "pto": {
        "annualHours": 120
      }
    },
    {
      "id": "A-102",
      "place": "seattle",
      "employees": 40,
      "frequency": "biweekly",
      "firstPeriodEnd": "2027-01-08",
      "hoursPerPeriod": 50,
      "periods": 26
    },
    {
      "id": "A-103",
      "place": "NJ",
      "frequency": "weekly",
      "firstPeriodEnd": "2027-01-08",
      "hoursPerPeriod": 30,
      "periods": 52
    },
    {
      "id": "A-104",
      "place": "RI",
      "frequency": "weekly",
      "firstPeriodEnd": "2027-01-08",
      "hoursPerPeriod": 30,
      "periods": 52
    }
  ]
}
```

## How is it tested?

**What its test suite asserts (3)**

- The 18 state laws, 7 city laws and 15 vacation payout rules are pinned, every source must be a government or legislature site read on 2026-11-09, and the key quotes are pinned word for word.
- Accrual is checked for Washington exact over the year beside a PTO bank, caps and carryover, the Maryland short-period rule, D.C. and Seattle tiers, waiting periods, use limits, front-loading, plan years and pay schedules.
- Payout with the Illinois combined bank, per-paycheck figures, rules, batch rows with a refused row, input refusals and every worked example against a fresh run are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the PTO and sick leave accrual by state tool](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/).

## Questions

### Is there any AI in the pto and sick leave accrual by state answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the pto and sick leave accrual by state refuse to answer?

The limits shown are the most an employer may apply; your written policy, a union contract or a local ordinance can give more. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the PTO and sick leave accrual by state tool](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/pto-accrual/  
Data as of: 2026-11-04
