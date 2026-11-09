# How Ontario rent increases are checked: RTA method

The rent can rise once 12 months have passed since the last increase or the start of the tenancy (RTA s.119), by at most the guideline for the year the increase takes effect (1.9% for 2027, 2.1% for 2026, never above 2.5%), with at least 90 days' written notice (s.116). Mail counts as given on the 5th day after mailing (s.191(3)).

## How does it work?

1. The 12-month date is the last increase, or the start of the tenancy, plus 12 months on the same day number, or the month's last day when it has none; a February 29 date lands on February 28 outside leap years (RTA s.119(1); Legislation Act s.89(6), (7)).
2. With no increase date given, the earliest is the later of the 12-month date and 90 days after today (95 by mail), or the earliest a notice already served allows.
3. The notice must be given 90 days before the increase, counting the way s.89(3) of the Legislation Act does: the day it is given is left out and the increase day is counted.
4. The guideline is the one for the calendar year the increase takes effect, from the ontario.ca table. The increase is the rent times the guideline, rounded down to the cent, so the new rent is never above the limit. A year not yet published gives no maximum and says when it is due (by August 31 of the year before, s.120(3)).
5. No increase can take effect in 2021, the rent freeze year (s.136.1): the rent stays the same, even for an exempt unit.

> Steps 6 to 9, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/ontario-rent-increase/#what) below.

## What does it not cover?

- Courier, fax and email service depend on the Landlord and Tenant Board's Rules and are not worked out.
- Above-guideline increases are not worked out: they need a Board order or a signed N10 agreement.
- Only the November 15, 2018 exemption is checked; social housing, care homes and the other exemptions of ss.5 to 8 are not.
- Holidays are not added to the counts. It is not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 4 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The rules and the guideline table were read on November 8, 2026: the Residential Tenancies Act on e-Laws, current from September 21, 2026; the Legislation Act, current from December 11, 2025; and ontario.ca's Residential rent increases, updated June 23, 2026. A new guideline is published by August 31 each year; the table changes only by hand, with the tests that pin it.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The guideline table is pinned to ontario.ca, 1991 to 2027, and ontario.ca's own example ($1,000 from June 1, 2026 is $1,019.00 on June 1, 2027) is reproduced.

- [Residential Tenancies Act, 2006, S.O. 2006, c. 17](https://www.ontario.ca/laws/statute/06r17), e-Laws, current from 2026-09-21, read 2026-11-08
- [Legislation Act, 2006, S.O. 2006, c. 21, Sched. F](https://www.ontario.ca/laws/statute/06l21), e-Laws, current from 2025-12-11, read 2026-11-08
- [Ontario.ca: Residential rent increases](https://www.ontario.ca/page/residential-rent-increases), updated 2026-06-23, read 2026-11-08
- [Landlord and Tenant Board: Forms (form names only)](https://tribunalsontario.ca/ltb/forms/), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the ontario rent increase calculator (n1) compute?

The tool takes a tenancy's rent and dates and gives the most the rent can rise to, the earliest date it can, and the last day to serve the notice by hand, in the mail box or by mail. It checks a notice a tenant received, the November 15, 2018 exemption of RTA s.6.1, and the yearly interest and top-up on a last month's rent deposit.

**In detail: operations, inputs and outputs**

Every rule comes with its section of the Residential Tenancies Act, 2006, and days are counted under the Legislation Act, 2006, s.89. Computed from the Residential Tenancies Act, 2006, the Legislation Act, 2006 and ontario.ca, each cited with the date read. Not legal advice.

Operations (the op field):

- `check`: Works out one tenancy's next increase: the increase date (given, or the earliest allowed), the guideline that applies, the most the rent can rise to, the serve-by dates for each delivery method, the exemption answer, any proposed rent and notice already served checked against the rules, the deposit top-up, and a list of problems.
- `deposit-interest`: Works out the interest on a last month's rent deposit on each anniversary of the day it was paid, at the guideline for that year, how much of it is kept to top the deposit up to the rent, how much is owed to the tenant, and the next payment date.
- `sheet`: Does what check does for a chosen increase date and also returns what to write on each field of Form N1, how to serve it and keep a record, a note on the form to use, the deposit schedule when a deposit and its paid date are given, and the whole sheet as Markdown.
- `batch`: Runs the check for up to 500 units at once and returns them sorted by the last day to serve, with a CSV of the increase date, guideline, rent, maximum new rent, method, serve-by dates and problems for each unit.
- `guidelines`: Returns Ontario's rent increase guideline for every year from 1991 to 2027, with the note on 2021, and the ontario.ca page it was copied from.

Inputs:

- `rent`: The current monthly rent, as a number or text such as "1,850.50", from 0 to 1,000,000.
- `lastIncrease or tenancyStart`: The date of the last increase, or the date the tenancy started when there has been none. Dates are written like 2027-03-01.
- `effectiveDate`: The day the increase is to take effect. Without it, the earliest allowed date is used. Needed for sheet.
- `method`: How the notice is delivered: hand (handed to the tenant or an adult in the unit, s.191(1)(a), (c)), mailbox (left in the tenant's mail box (or where mail is delivered), s.191(1)(d), (e)), mail (sent by mail, s.191(1)(f), 191(3)). The default is hand.
- `servedOn, proposedRent`: For a tenant checking a notice: the day it was served, and the new rent it asks for.
- `deposit, depositPaidOn`: The last month's rent deposit held, for the top-up after the increase; with sheet, the day it was paid, for the interest schedule.
- `unit`: For the exemption: kind (building, addition, house or other), firstOccupied, unitsOnCutoff, selfContained, becameUnit, ownerLivedThere, unfinishedSpace and tenancyAgreed.
- `paidOn, rentChanges, through, applyToTopUp`: For deposit-interest: the day the deposit was paid, the rent from each date it changed, the last day to count to (today by default), and whether interest is kept for the top-up (yes by default).
- `unitAddress, tenantName, landlordName`: For sheet: the names and address to write on Form N1.
- `rows`: For batch: up to 500 units, each with a unit name, rent, lastIncrease or tenancyStart, and optionally effectiveDate and method.
- `asOf`: The day to count from, in Ontario time. Today by default.

Outputs:

- answer: the most the rent can rise to and on which date, and the last day to serve by the chosen method
- guideline, maxRent and increase: the year, its percentage and the new rent and increase in dollars
- serveBy and lastDayToServe: the day the notice must be given, by hand, in the mail box and by mail
- notice: for a notice already served, the day it counts as given, the days of notice and the earliest date it allows
- exemption: exempt or not, or not enough answers, with each paragraph of s.6.1 met or not met
- problems: each rule the increase breaks, in a sentence with its section
- sheet (sheet), rows and csv (batch), rows and totals (deposit-interest), the table (guidelines)

**Every step in full (9) and the rules**

1. The 12-month date is the last increase, or the start of the tenancy, plus 12 months on the same day number, or the month's last day when it has none; a February 29 date lands on February 28 outside leap years (RTA s.119(1); Legislation Act s.89(6), (7)).
2. With no increase date given, the earliest is the later of the 12-month date and 90 days after today (95 by mail), or the earliest a notice already served allows.
3. The notice must be given 90 days before the increase, counting the way s.89(3) of the Legislation Act does: the day it is given is left out and the increase day is counted. By hand or in the mail box, that is the last day to serve. By mail it counts as given on the 5th day after mailing (RTA s.191(3)), so it must be mailed 5 days earlier.
4. The guideline is the one for the calendar year the increase takes effect, from the ontario.ca table. The increase is the rent times the guideline, rounded down to the cent, so the new rent is never above the limit. A year not yet published gives no maximum and says when it is due (by August 31 of the year before, s.120(3)).
5. No increase can take effect in 2021, the rent freeze year (s.136.1): the rent stays the same, even for an exempt unit.
6. Exemption (s.6.1): a unit in a building, or an addition, first occupied for residential purposes after November 15, 2018 is exempt. A unit in a house is exempt when the house had at most two units on or before that date, the unit is self-contained, it became a unit after that date, and the owner lived in another unit when it was first occupied or it was built in unfinished space. A tenancy agreed on or before November 15, 2018 is not exempt (6.1(4)). With answers missing, the guideline is applied. Only this exemption is checked.
7. A notice already served is checked: the day it counts as given (five days after mailing), the days between that and the increase, and, short of 90, that the increase is void and a new notice is needed (s.116(4)), with the earliest date that notice allows.
8. A proposed rent above the limit is flagged with the amount over, and that more needs an N10 agreement (at most the guideline plus 3%, s.121) or a Board order (s.126). With a deposit, the top-up is the new rent less the deposit held (s.106(3)).
9. Deposit interest (s.106(6), (7)): on each anniversary of the day the deposit was paid, interest is the deposit times the guideline for that year, rounded to the cent. The part needed to bring the deposit up to the rent on that day is kept and added to the deposit; the rest is owed to the tenant. Payments stop at the through date or at a year whose guideline is not published.

**Residential Tenancies Act, 2006.**

The rules applied are ss.116 (90 days' notice on the Board's form), 119 (12 months between increases), 120 (the guideline, at most 2.5%), 121 (N10 agreements), 126 (above-guideline applications), 106 (deposits and interest), 136.1 (the 2021 freeze), 191 (giving notices) and 6.1 (the November 15, 2018 exemption), read on e-Laws current from September 21, 2026.

**Legislation Act, 2006, s.89.**

Days between two events leave out the first day and count the second, even for "at least"; months land on the same day number or the month's last day; a February 29 anniversary is February 28 outside leap years.

**The guideline table.**

Copied by hand from ontario.ca's Residential rent increases page (updated June 23, 2026), 1991 to 2027. 2021 is 0% because of the rent freeze.

## Which edge cases does it handle?

**The edge cases (6)**

- A last increase on January 31 makes the 12-month date January 31 of the next year; one on February 29 makes it February 28.
- When the last day to serve has passed, the answer says so and gives the date a notice served today allows.
- When the last day to serve is a Sunday, the answer says to serve earlier rather than rely on an extension.
- An exempt unit has no percentage limit, but the 90 days and the 12-month rule still apply, and the sheet notes that the form for an exempt unit should be checked with the Board.
- A deposit paid before January 31, 2007 is refused: earlier periods use the Act's 6% transition rate, which is not worked out.
- A batch row the engine refuses stops the batch, and the error names the row and the unit.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A $2,000 rent last raised March 1, 2026, with the N1 sent by mail**

A $2,000 rent last raised March 1, 2026, with the N1 sent by mail

| Result | Value |
| --- | --- |
| answer | Your rent of $2,000.00 can rise to at most $2,038.00 on March 1, 2027 (2027 guideline 1.9%); mail the N1 by November 26, 2026 (or hand it over by December 1, 2026). |
| guideline | 2027: 1.9% |
| most the rent can rise to | $2,038.00 (an increase of $38.00) |
| 12-month date | March 1, 2027 |
| mail by | November 26, 2026 |
| hand over by | December 1, 2026 |

**The input**

```json
{
  "op": "check",
  "rent": 2000,
  "lastIncrease": "2026-03-01",
  "method": "mail",
  "asOf": "2026-11-08"
}
```

**More worked examples (4)**

**A tenant checks an N1 mailed too late, asking more than the guideline**

A tenant checks an N1 mailed too late, asking more than the guideline

| Result | Value |
| --- | --- |
| answer | Your rent of $1,850.00 can rise to at most $1,888.85 on December 1, 2026 (2026 guideline 2.1%); the notice gives only 82 days. |
| counts as given | September 10, 2026 |
| days of notice | 82 |
| earliest date this notice allows | December 9, 2026 |
| above the limit by | $11.15 |
| problem 1 | Served by mail on September 5, 2026, the notice counts as given on September 10, 2026: 82 days before December 1, 2026, short of 90. Without 90 days the increase is void and a new notice is needed (s.116(4)); the earliest date this notice allows is December 9, 2026. |
| problem 2 | $1,900.00 is $11.15 above the 2.1% limit of $1,888.85. More needs an N10 agreement (at most the guideline plus 3%, s.121(3)) or a Board order (s.126). |

**The input**

```json
{
  "op": "check",
  "rent": 1850,
  "lastIncrease": "2025-12-01",
  "effectiveDate": "2026-12-01",
  "servedOn": "2026-09-05",
  "method": "mail",
  "proposedRent": 1900,
  "asOf": "2026-11-08"
}
```

**A basement suite finished in 2020 in a house where the owner lives upstairs**

A basement suite finished in 2020 in a house where the owner lives upstairs

| Result | Value |
| --- | --- |
| answer | The unit is exempt from the guideline (RTA 6.1(3)), so there is no percentage limit on February 6, 2027; the 12-month rule and 90 days' notice still apply: serve the notice by hand by November 8, 2026 (or mail it by November 3, 2026). |
| exempt | yes (RTA 6.1(3)) |
| reason 1 | Met: the house had at most two residential units on or before November 15, 2018 (para 1). |
| reason 2 | Met: the unit has its own bathroom and kitchen, an entrance with a door that secures from inside and one that locks from outside (para 2). |
| reason 3 | Met: it became such a unit on April 15, 2020, after November 15, 2018 (para 3). |
| reason 4 | Met: the owner lived in another unit of the house when it was first occupied (para 4 i). |
| reason 5 | If disputed, the landlord must prove it (6.1(6)). The 90-day notice and the 12-month rule still apply: s.6.1 does not lift ss.116 and 119. |

**The input**

```json
{
  "op": "check",
  "rent": 1600,
  "tenancyStart": "2025-09-01",
  "method": "hand",
  "unit": {
    "kind": "house",
    "unitsOnCutoff": 1,
    "selfContained": true,
    "becameUnit": "2020-04-15",
    "ownerLivedThere": true
  },
  "asOf": "2026-11-08"
}
```

**Interest on an $1,800 last month's rent deposit, the rent raised each June**

Interest on an $1,800 last month's rent deposit, the rent raised each June

| Result | Value |
| --- | --- |
| answer | On a $1,800.00 deposit paid June 1, 2023, 3 yearly interest payments came due through November 8, 2026, $130.84 in all: $130.83 kept to top the deposit up to the rent and $0.01 owed to the tenant; the deposit is now $1,930.83. |
| June 1, 2024 at 2.5% | $45.00: $45.00 kept, $0.00 to the tenant |
| June 1, 2025 at 2.5% | $46.13: $46.12 kept, $0.01 to the tenant |
| June 1, 2026 at 2.1% | $39.71: $39.71 kept, $0.00 to the tenant |
| next payment | June 1, 2027 at 1.9% |

**The input**

```json
{
  "op": "deposit-interest",
  "deposit": 1800,
  "paidOn": "2023-06-01",
  "rent": 1800,
  "rentChanges": [
    {
      "from": "2024-06-01",
      "rent": 1845
    },
    {
      "from": "2025-06-01",
      "rent": 1891.12
    },
    {
      "from": "2026-06-01",
      "rent": 1930.83
    }
  ],
  "through": "2026-11-08"
}
```

**Ontario's rent increase guidelines, 1991 to 2027**

Ontario's rent increase guidelines, 1991 to 2027

| Result | Value |
| --- | --- |
| answer | Ontario's rent increase guideline is 1.9% for 2027 and 2.1% for 2026; it is capped at 2.5% (RTA s.120(2)). |
| years | 1991 to 2027 |
| 2021 | 0% because of the government rent freeze during COVID-19; otherwise it would have been 1.5% (ontario.ca footnote 1; RTA s.120(3.1) and s.136.1). |

**The input**

```json
{
  "op": "guidelines"
}
```

## How is it tested?

The tests check 90 days with the notice day left out and 95 by mail, month ends and February 29, rounding down to the cent, the 2021 freeze, each paragraph of the exemption, a late mailed notice, deposit interest year by year, and the sheet and batch outputs.

**What its test suite asserts (3)**

- The guideline table, 1991 to 2027, is pinned to ontario.ca as read on 2026-11-08, and ontario.ca's own $1,000 example is reproduced.
- Serve-by dates are checked at 90 days with the notice day left out and 95 by mail, and the 12-month date at month ends and February 29.
- Rounding down to the cent, the 2021 freeze, each paragraph of the s.6.1 exemption, a late mailed notice and deposit interest year by year are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Ontario rent increase calculator (N1) tool](https://krishnachagti-sudo.github.io/toll-preview/ontario-rent-increase/).

## Questions

### Is there any AI in the ontario rent increase calculator (n1) answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the ontario rent increase calculator (n1) refuse to answer?

Courier, fax and email service depend on the Landlord and Tenant Board's Rules and are not worked out. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Ontario rent increase calculator (N1) tool](https://krishnachagti-sudo.github.io/toll-preview/ontario-rent-increase/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/ontario-rent-increase/  
Data as of: 2026-11-04
