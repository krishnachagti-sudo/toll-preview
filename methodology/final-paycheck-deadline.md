# How the final paycheck deadline is worked out by state

30 of the 51 jurisdictions (the states and DC) are covered from their own statute or labor department sites, read 2026-11-08; the other 21 are listed as not covered with the reason. A deadline counted in days is due by the end of that day; one counted in hours, such as Vermont's 72 hours, carries a time.

## How does it work?

1. The state's rule for the separation is picked. Where the statute names only a discharge, a layoff uses the discharge rule and the answer says so.
2. The rule is a small tree of parts, each dated from the facts: at separation, a number of hours after it, a number of calendar days, a number of business days after separation or a written request, the next payday, the payday for the final period, the end of the pay period, and the earlier or later of two parts.
3. Business days are Monday to Friday less US federal holidays (the business days tool's calendar) and any closed days you add.
4. Paydays come from the dates you give or from the schedule: weekly and biweekly step from the anchor; semimonthly and monthly use the days of the month, 31 meaning the last day.
5. Where a part of an earlier-of rule cannot be dated, the date shown is the latest the other part allows and the answer says the real deadline may be earlier.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/final-paycheck-deadline/#what) below.

## What does it not cover?

- States not read on their own sites are not covered (21 of them), and the answer gives the reason rather than a date.
- Business days skip only weekends and US federal holidays; add state holidays and closed days yourself.
- Local ordinances, union and employment contracts and industry rules can be stricter.
- It is worked out from each state's own published text. It is not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 46 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Each state's statute or labor department page, the eCFR text of 29 CFR 531.35 and the DOL state minimum wage table (page updated 2026-11-05) were read on 2026-11-08. The quotes are checked against the fetched text when the data is built. The rules change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check the covered and not-covered counts, Texas's 6 calendar days, hour, business-day and holiday counting, notice, demand and policy rules, missing inputs named rather than guessed, paydays from dates, lists and schedules, the deduction rules and the minimum-wage floor, each penalty formula, and a batch where a refused row still leaves the rest answered.

- [29 CFR 531.35, "Free and clear" payment; "kickbacks" (eCFR)](https://www.ecfr.gov/current/title-29/section-531.35), see the document, read 2026-11-08
- [U.S. Department of Labor, Wage and Hour Division: State Minimum Wage Laws (basic minimum rate, non-farm employment)](https://www.dol.gov/agencies/whd/minimum-wage/state), page updated 2026-11-05, read 2026-11-08
- [A.R.S. 23-353, Payment of wages of discharged employee](https://www.azleg.gov/ars/23/00353.htm), see the document, read 2026-11-08
- [A.R.S. 23-352, Withholding of wages](https://www.azleg.gov/ars/23/00352.htm), see the document, read 2026-11-08
- [A.R.S. 23-355, Action by employee to recover wages](https://www.azleg.gov/ars/23/00355.htm), see the document, read 2026-11-08
- [Alaska Department of Labor and Workforce Development, Wage and Hour: letter to employers and employees (AS 23.05.140)](https://labor.alaska.gov/lss/forms/FISH_PROCESSORS_LETTER_2020.pdf), 2022-01-20, read 2026-11-08
- [Colorado Department of Labor and Employment, INFO #3A: Timing of Wage Payments (C.R.S. 8-4-109)](https://cdle.colorado.gov/sites/cdle/files/INFO%20%233A%20Timing%20of%20Wage%20Payments,%20&%20Required%20Record-Keeping%2007.11.2023%20accessible.pdf), 2023-07-11, read 2026-11-08
- [Connecticut Department of Labor, Wage Payment Laws (C.G.S. 31-71a to 31-72), update December 2023](https://portal.ct.gov/dol/-/media/DOL/2022-New-Design-System/Divisions/wage-and-workplace-standards/WagePaymentLaws_Update12-2023.pdf), 2023-12, read 2026-11-08
- [19 Del. C. chapter 11, Wage Payment and Collection (sections 1103 and 1107)](https://delcode.delaware.gov/title19/c011/index.html), see the document, read 2026-11-08
- [D.C. Code 32-1303, Payment of wages upon discharge or resignation](https://code.dccouncil.gov/us/dc/council/code/sections/32-1303), see the document, read 2026-11-08
- [Idaho Department of Labor, Labor Laws FAQ (Idaho Code 45-606)](https://www.labor.idaho.gov/dnn/Businesses/Idaho-Labor-Laws/Labor-Laws-FAQ), see the document, read 2026-11-08
- [Illinois Department of Labor, Wage Payment and Collection Act FAQ (820 ILCS 115/5)](https://labor.illinois.gov/faqs/wage-payment-faq.html), see the document, read 2026-11-08
- [Illinois Department of Labor, Deductions from Pay FAQ (56 Ill. Adm. Code 300)](https://labor.illinois.gov/faqs/deductions-from-pay-faq.html), see the document, read 2026-11-08
- [Iowa Code 91A.4 (2026), Employment suspension or termination](https://www.legis.iowa.gov/docs/code/91A.4.pdf), see the document, read 2026-11-08
- [Iowa Code 91A.5 (2026), Deductions from wages](https://www.legis.iowa.gov/docs/code/91A.5.pdf), see the document, read 2026-11-08
- [K.S.A. 44-315, Payment of wages to discharged or quitting employee; penalty](https://www.ksrevisor.gov/statutes/chapters/ch44/044_003_0015.html), see the document, read 2026-11-08
- [K.S.A. 44-319, Withholding, deducting or diverting wages](https://www.ksrevisor.gov/statutes/chapters/ch44/044_003_0019.html), see the document, read 2026-11-08
- [26 M.R.S. 626, Cessation of employment](https://legislature.maine.gov/statutes/26/title26sec626.html), see the document, read 2026-11-08
- [26 M.R.S. 626-A, Penalties](https://legislature.maine.gov/statutes/26/title26sec626-A.html), see the document, read 2026-11-08
- [26 M.R.S. 629, Unfair agreements](https://legislature.maine.gov/statutes/26/title26sec629.html), see the document, read 2026-11-08
- [Md. Code, Labor and Employment 3-505](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-505&enactments=false), see the document, read 2026-11-08
- [Md. Code, Labor and Employment 3-503](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-503&enactments=false), see the document, read 2026-11-08
- [Minn. Stat. 181.13, Penalty for failure to pay wages promptly](https://www.revisor.mn.gov/statutes/cite/181.13), see the document, read 2026-11-08
- [Minn. Stat. 181.14, Prompt payment on resignation](https://www.revisor.mn.gov/statutes/cite/181.14), see the document, read 2026-11-08
- [Minn. Stat. 181.79, Wage deductions for faulty workmanship, loss, theft, or damage](https://www.revisor.mn.gov/statutes/cite/181.79), see the document, read 2026-11-08
- [Mont. Code Ann. 39-3-205, Payment of wages when employee separated](https://archive.legmt.gov/bills/mca/title_0390/chapter_0030/part_0020/section_0050/0390-0030-0020-0050.html), see the document, read 2026-11-08
- [Mont. Code Ann. 39-3-204, Payment of wages generally](https://archive.legmt.gov/bills/mca/title_0390/chapter_0030/part_0020/section_0040/0390-0030-0020-0040.html), see the document, read 2026-11-08
- [New Jersey Department of Labor and Workforce Development, selected state labor laws (N.J.S.A. 34:11-4.3 and 34:11-4.4)](https://www.nj.gov/labor/wageandhour/tools-resources/laws/selectedstatelaborlaws.shtml), see the document, read 2026-11-08
- [New York State Department of Labor, Frequency of Pay FAQ (Labor Law 191)](https://dol.ny.gov/system/files/documents/2021/03/frequency-of-pay-frequently-asked-questions.pdf), 2021-03, read 2026-11-08
- [North Carolina Department of Labor, Payment of Final Wages to Separated Employees (G.S. 95-25.7)](https://www.labor.nc.gov/workplace-rights/employee-rights-regarding-time-worked-and-wages-earned/payment-final-wages), see the document, read 2026-11-08
- [North Carolina Department of Labor, Deductions from Wages (G.S. 95-25.8)](https://www.labor.nc.gov/workplace-rights/employee-rights-regarding-time-worked-and-wages-earned/deductions-wages), see the document, read 2026-11-08
- [N.D. Cent. Code chapter 34-14, Wage Collection](https://ndlegis.gov/cencode/t34c14.pdf), see the document, read 2026-11-08
- [Oklahoma Department of Labor, Protect Your Pay](https://oklahoma.gov/labor/workplace-rights/protect-your-pay.html), see the document, read 2026-11-08
- [Oregon Bureau of Labor and Industries, Paychecks: final pay (ORS 652.140, 652.150)](https://www.oregon.gov/boli/workers/pages/paychecks.aspx), see the document, read 2026-11-08
- [Pennsylvania Department of Labor and Industry, Wage Payment and Collection Law (Act 329 of 1961) text](https://www.pa.gov/content/dam/copapwp-pagov/en/dli/documents/documents/regulations/llc/wpclaw.pdf), see the document, read 2026-11-08
- [S.C. Code of Laws Title 41 chapter 10 (2019 session version, the newest copy the legislature's site served us)](https://www.scstatehouse.gov/Archives/CodeofLaws2019/t41c010.php), 2019, read 2026-11-08
- [South Dakota Department of Labor and Regulation, What you need to know about South Dakota labor laws (rev. 01/2026)](https://dlr.sd.gov/employment_laws/publications/what_need_know_laws.pdf), 2026-01, read 2026-11-08
- [Tennessee Department of Labor and Workforce Development, Wages, fringe benefits, paychecks (Tenn. Code Ann. 50-2-103)](https://www.tn.gov/workforce/employees/labor-laws/labor-laws-redirect/wages-breaks.html), see the document, read 2026-11-08
- [Texas Labor Code chapter 61, Payment of Wages (sections 61.014 and 61.018)](https://statutes.capitol.texas.gov/Docs/LA/htm/LA.61.htm), see the document, read 2026-11-08
- [Vermont Department of Labor, A Summary of Vermont Wage and Hour Laws (WH-13, 2019; 21 V.S.A. 342)](https://labor.vermont.gov/sites/labor/files/doc_library/WH-13-Wage-and-Hour-Laws-2019%20.pdf), 2019, read 2026-11-08
- [Va. Code 40.1-29, Time and medium of payment; withholding wages](https://law.lis.virginia.gov/vacode/title40.1/chapter3/section40.1-29/), see the document, read 2026-11-08
- [RCW 49.48.010, Payment of wages due to employee ceasing work](https://app.leg.wa.gov/RCW/default.aspx?cite=49.48.010), see the document, read 2026-11-08
- [West Virginia Division of Labor, W. Va. Code chapter 21 article 5, Wage Payment and Collection](https://labor.wv.gov/media/164/download?inline=), see the document, read 2026-11-08
- [West Virginia Division of Labor, WPCA Fact Sheet 6: Payment of Final Wages (July 2016)](https://labor.wv.gov/media/85/download?inline=), 2016-07, read 2026-11-08
- [Wyoming Department of Workforce Services, Labor Standards employer FAQ](https://dws.wyo.gov/dws-division/labor-standards/employers/faq/), see the document, read 2026-11-08
- [Wyoming Department of Workforce Services, Your Rights as a Worker](https://dws.wyo.gov/dws-division/labor-standards/workers-and-job-seekers/your-rights-as-a-worker/), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the final paycheck deadline by state compute?

Given the state, whether the employee was fired, laid off or quit, the date (and time) they left and the pay schedule, the tool works out the date, and the time where the law counts hours, by which the final paycheck is due, quoting the state's rule.

**In detail: operations, inputs and outputs**

It also says whether a deduction from the final check is allowed under the state's rule, checks the deduction against the minimum wage for the final week, and works out the late-pay penalty where the state sets a formula.

Operations (the op field):

- `deadline`: Returns the due date and time (or the end of the day), how it was reached, the rule and its citation, the quoted text, what is missing if the date cannot be fixed, notes, the federal holidays skipped, the paydays used and the state's penalty text. Free on the page.
- `deductions`: Returns the state's verdict for the kind of deduction, the rule and its citation with the quoted text, the federal free-and-clear rule, and, with the final week's pay and hours, the minimum-wage floor check with the most that can come out. Free on the page.
- `penalty`: Returns the days late, the formula the state sets, the amount on top of the wages and the arithmetic, or says the state sets no formula or that none was read. Free on the page.
- `batch`: Returns one deadline row per separation (up to 500), a refused row carrying its error while the rest still answer, and a CSV of them all.

Inputs:

- `state, separation`: A two-letter state code, and discharge, layoff, quit.
- `separatedAt`: The last day, as 2026-11-13, or with a time, as 2026-11-13T16:30.
- `nextPayday, paydays, schedule`: The next regular payday, a list of up to 12 paydays, or a schedule (weekly, biweekly, semimonthly, monthly) with any one payday as the anchor or the days of the month.
- `periodPayday, periodEnd, noticeDate, noticeTime, requestDate, demandAt, options`: The facts some states count from: the payday for the final pay period, the end of the pay period, when notice of quitting was given, the date of a written request or demand, and whether there was a written request or a written policy.
- `closedDays`: Up to 60 days the business is closed, skipped like holidays.
- `topic, amount, finalWeek, minimumWage`: For deductions: the kind (equipment, advance, shortage, overpayment, benefits, other), the amount, the final week's gross pay and hours, and optionally the minimum wage to use.
- `unpaid, dueDate, paidDate, dailyRate, hourlyRate`: For penalty: the wages paid late, the due date, the date paid, and the daily or hourly rate where the state's formula uses one.

Outputs:

- answer: the due date and time with the rule and citation in one sentence
- due: date, time, how it was reached and the text; needs: what is missing, if anything
- rule, cite, quotes (word for word, with the source and read date), notes and holidaysSkipped
- verdict, verdictText, rule and floor (deductions)
- daysLate, formula, amount and math (penalty)
- rows, answered and csv (batch)

**Every step in full (7) and the rules**

1. The state's rule for the separation is picked. Where the statute names only a discharge, a layoff uses the discharge rule and the answer says so. A state not covered returns the reason instead of a date.
2. The rule is a small tree of parts, each dated from the facts: at separation, a number of hours after it, a number of calendar days, a number of business days after separation or a written request, the next payday, the payday for the final period, the end of the pay period, and the earlier or later of two parts.
3. Business days are Monday to Friday less US federal holidays (the business days tool's calendar) and any closed days you add. Hours of notice, where a state counts them, are counted on business days only.
4. Paydays come from the dates you give or from the schedule: weekly and biweekly step from the anchor; semimonthly and monthly use the days of the month, 31 meaning the last day.
5. Where a part of an earlier-of rule cannot be dated, the date shown is the latest the other part allows and the answer says the real deadline may be earlier. Where nothing can be dated, the answer names what is missing rather than guessing.
6. For a deduction, the state's rule for that kind of deduction is quoted with a verdict; with no topic rule, the state's general deduction rule applies. The floor check takes the final week's gross pay less the deduction and compares it with the hours times the higher of the federal and state basic minimum wage (or the rate you enter).
7. For a penalty, the state's formula is applied to the days after the due date up to the date paid: a multiple of the unpaid wages, a percent a day with a cap, a day's wages a day with a cap, or eight times the hourly rate a day. States with a formula: Alaska, Arizona, Connecticut, District of Columbia, Delaware, Kansas, Maine, Minnesota, North Dakota, Oregon, Pennsylvania, South Carolina and West Virginia.

**State statutes and labor department pages.**

Each covered state's rule is quoted word for word from its own statute site or labor department, read 2026-11-08. Each covered state's rules are quoted word for word from that state's own statute site or labor department, read on readOn. Quotes are checked against the fetched text by build\_states.py. Not-covered states give the reason.

**29 CFR 531.35 and the minimum wage.**

The free-and-clear rule is quoted from the eCFR, read 2026-11-08. The minimum wages for the floor check are the DOL's state table, read 2026-11-08; the federal rate is $7.25.

## Which edge cases does it handle?

**The edge cases (6)**

- A Friday firing in Texas is due by the end of the sixth calendar day, not the sixth business day.
- A deadline counted in hours keeps the time of separation, so Vermont's 72 hours from 3:30 pm ends at 3:30 pm.
- A business-day count skips Thanksgiving and other federal holidays and names them.
- A payday under the state's minimum number of days away moves the deadline to the next payday, within the state's day cap.
- A notice date after the separation day, or a final period payday before it, is refused.
- A deduction that would take the final week below the minimum wage gives the most that can come out that week.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Texas: fired on a Friday afternoon**

Texas: fired on a Friday afternoon

| Result | Value |
| --- | --- |
| answer | An employee fired (discharged) in Texas on November 13, 2026 at 4:00 pm must be paid by the end of Thursday, November 19, 2026 (6 calendar days after separation). The rule: by the sixth day after the discharge (Tex. Lab. Code 61.014(a)). |
| due | the end of Thursday, November 19, 2026 |
| rule | Tex. Lab. Code 61.014(a) |

**The input**

```json
{
  "op": "deadline",
  "state": "TX",
  "separation": "discharge",
  "separatedAt": "2026-11-13T16:00",
  "nextPayday": "2026-11-20"
}
```

**More worked examples (4)**

**Oregon: quit with less than 48 business hours of notice, over Thanksgiving**

Oregon: quit with less than 48 business hours of notice, over Thanksgiving

| Result | Value |
| --- | --- |
| answer | An employee quit (resigned) in Oregon on November 25, 2026 at 5:00 pm must be paid by the end of Monday, November 30, 2026 (the next regular payday, the earlier of the two). The rule: with at least 48 hours' notice (weekends and holidays not counted): on the last day, or the next business day if that is a weekend or holiday; with less: within 5 business days or by the next regular payday, whichever comes first (ORS 652.140(2)). |
| notice counted | Notice counted: 32 hours on business days (weekends and holidays not counted); less than 48. |
| holiday skipped | Thanksgiving Day, 2026-11-26 |

**The input**

```json
{
  "op": "deadline",
  "state": "OR",
  "separation": "quit",
  "separatedAt": "2026-11-25T17:00",
  "noticeDate": "2026-11-24",
  "noticeTime": "09:00",
  "schedule": {
    "frequency": "semimonthly",
    "days": [
      15,
      31
    ]
  }
}
```

**Kansas: an unreturned $900 laptop against a $600 final week**

Kansas: an unreturned $900 laptop against a $600 final week

| Result | Value |
| --- | --- |
| answer | In Kansas, a deduction of $900.00 for unreturned equipment (laptop, phone, tools, uniform) from the final paycheck: allowed after written notice. Allowed from final wages after a written notice and explanation, until the property is returned; then the withheld wages must be paid (K.S.A. 44-319). After it, the final week pays -$300.00 for 40 hours (-$7.50 an hour), below $7.25 an hour (the federal minimum wage): at most $310.00 can come out of that week. |
| verdict | allowed after written notice |
| most that can come out of the final week | $310.00 |

**The input**

```json
{
  "op": "deductions",
  "state": "KS",
  "topic": "equipment",
  "amount": 900,
  "finalWeek": {
    "gross": 600,
    "hours": 40
  }
}
```

**Oregon: final pay one week late**

Oregon: final pay one week late

| Result | Value |
| --- | --- |
| answer | Paid 7 days late, $1,840.00 of final wages in Oregon can carry $1,288.00 on top of the wages: 8 x $23.00 an hour x 7 days (at most 30). Penalty wages of eight times the regular hourly rate for each day unpaid, up to 30 days; plus a possible $1,000 civil penalty for willful failure. |
| penalty | $1,288.00 |
| arithmetic | 8 x $23.00 an hour x 7 days (at most 30) |

**The input**

```json
{
  "op": "penalty",
  "state": "OR",
  "unpaid": 1840,
  "dueDate": "2026-11-27",
  "paidDate": "2026-12-04",
  "hourlyRate": 23
}
```

**Five separations in one call**

Five separations in one call

| Result | Value |
| --- | --- |
| row 1 (NY) | the end of Friday, December 11, 2026 |
| row 2 (CT) | the end of Monday, December 28, 2026 |
| row 3 (VT) | 3:30 pm on Monday, December 7, 2026 |
| row 4 (DE) | the end of Wednesday, January 6, 2027 |
| row 5 (CA) | California is not covered: The state legislature's and labor department's sites could not be read from our network on 2026-11-08 (connection refused, timed out or a bot check), so no rule is shown. We do not copy other publishers' charts. |

**The input**

```json
{
  "op": "batch",
  "rows": [
    {
      "state": "NY",
      "separation": "quit",
      "separatedAt": "2026-12-04",
      "nextPayday": "2026-12-11"
    },
    {
      "state": "CT",
      "separation": "discharge",
      "separatedAt": "2026-12-24"
    },
    {
      "state": "VT",
      "separation": "discharge",
      "separatedAt": "2026-12-04T15:30"
    },
    {
      "state": "DE",
      "separation": "layoff",
      "separatedAt": "2026-12-31",
      "nextPayday": "2027-01-01"
    },
    {
      "state": "CA",
      "separation": "discharge",
      "separatedAt": "2026-12-04"
    }
  ]
}
```

## How is it tested?

**What its test suite asserts (3)**

- 30 jurisdictions are covered from their own sites and 21 are listed as not covered with a reason, each source with its read date, 2026-11-08.
- Calendar days, hours, business days, federal holidays, notice, demand and policy rules are each checked, and missing facts are named, not guessed.
- Each state's deduction rule, the minimum-wage floor and every penalty formula are checked, and a batch answers every row it can.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Final paycheck deadline by state tool](https://krishnachagti-sudo.github.io/toll-preview/final-paycheck-deadline/).

## Questions

### Is there any AI in the final paycheck deadline by state answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the final paycheck deadline by state refuse to answer?

States not read on their own sites are not covered (21 of them), and the answer gives the reason rather than a date. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Final paycheck deadline by state tool](https://krishnachagti-sudo.github.io/toll-preview/final-paycheck-deadline/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/final-paycheck-deadline/  
Data as of: 2026-11-04
