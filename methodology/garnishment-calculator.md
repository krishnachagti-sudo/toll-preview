# How the wage garnishment calculator works for employers

A creditor may take the lesser of 25% of disposable earnings and the amount above 30 times the $7.25 federal minimum wage for the pay period (15 U.S.C. 1673(a)), and less where the work state's statute says so. 19 of the 51 jurisdictions (the states and DC) have their own rule read here; for the rest the federal limit is shown and the answer says the state may allow less.

## How does it work?

1. Every amount is read as whole cents; percentages are basis points; the weeks in a pay period are sixths of a week (1, 2, 13/6 and 13/3 weeks for weekly, biweekly, semimonthly and monthly, as Fact Sheet #30 scales them), so every floor is exact and every limit is rounded down to the cent, never up.
2. Disposable earnings are gross pay less only the deductions required by law (15 U.S.C. 1672(b)): income taxes, Social Security, Medicare, state disability and unemployment insurance and mandatory retirement.
3. The federal limit is the lesser of 25% of disposable earnings and the amount above 30 times the federal minimum wage times the weeks in the period: weekly: nothing at or below $217.50, 25% from $290.00; biweekly: nothing at or below $435.00, 25% from $580.00.
4. For a covered state, its statute's tests are run the same way (a percentage, a multiple of the federal, state or local minimum wage, tiers), and its own adjustments: amounts per dependent, head of family with or without a waiver, a yearly cap per creditor, debts that cannot be garnished at all.
5. Support and earlier orders already withheld use up the creditor limit first; what is left, never below zero, is the most this order may take, and no more than the balance owed.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/garnishment-calculator/#what) below.

## What does it not cover?

- State rules are covered only for the 19 jurisdictions whose own statute or court form was read; for the others the federal limit is shown and the state may allow less.
- State support statutes were not checked for lower limits unless the notes say so.
- Follow the order you were served: where it sets a lower amount, the order controls.
- It is not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 22 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Fact Sheet #30 and the U.S. Code were read on 2026-11-08; each covered state's statute or court form on 2026-11-08; the state minimum wages from each state's own site; Publication 1494 for 2026 on 2026-11-08. The rules change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests reproduce the Fact Sheet #30 thresholds for every pay period and the $2,400 biweekly example ($470), check that only required deductions come off, that support and earlier orders use up the creditor limit and never go below zero, the 50, 55, 60 and 65 percent support limits, the federal debt rule, one case per covered state worked by hand from its statute, California's court examples, the dated minimum wages, and Publication 1494's examples and table cells.

- [U.S. Department of Labor, Wage and Hour Division, Fact Sheet #30: Wage Garnishment Protections of the Consumer Credit Protection Act (CCPA)](https://www.dol.gov/agencies/whd/fact-sheets/30-cppa), revised December 2024, read 2026-11-08
- [15 U.S.C. 1672 to 1677 (Consumer Credit Protection Act, Title III), U.S. Code 2023 edition on govinfo.gov](https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap41-subchapII.htm), 2023 edition, read 2026-11-08
- [IRS Publication 1494 (Rev. 12-2025), Tables for Figuring Amount Exempt from Levy on Wages, Salary, and Other Income (Forms 668-W(ACS) and 668-W(ICS))](https://www.irs.gov/pub/irs-pdf/p1494.pdf), for 2026, read 2026-11-08
- [Arizona: A.R.S. 33-1131](https://www.azleg.gov/ars/33/01131.htm), see the document, read 2026-11-08
- [California: Cal. Code Civ. Proc. 706.050, as stated on Judicial Council form WG-002 (Rev. January 1, 2026)](https://www.courts.ca.gov/documents/wg002.pdf), see the document, read 2026-11-08
- [Colorado: Colorado Judicial Branch Form 27, Calculation of the Amount of Exempt Earnings Worksheet (C.R.S. 13-54-104)](https://www.coloradojudicial.gov/sites/default/files/2024-08/Form27.pdf), see the document, read 2026-11-09
- [Delaware: 10 Del. C. 4913](https://delcode.delaware.gov/title10/c049/sc01/index.html), see the document, read 2026-11-08
- [District of Columbia: D.C. Code 16-572](https://code.dccouncil.gov/us/dc/council/code/sections/16-572), see the document, read 2026-11-08
- [Florida: Fla. Stat. 222.11](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0222/Sections/0222.11.html), see the document, read 2026-11-08
- [Iowa: Iowa Code 642.21](https://www.legis.iowa.gov/docs/code/642.21.pdf), see the document, read 2026-11-08
- [Kansas: K.S.A. 60-2310](https://www.ksrevisor.gov/statutes/chapters/ch60/060_023_0010.html), see the document, read 2026-11-08
- [Kentucky: KRS 427.010](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=46624), see the document, read 2026-11-08
- [Maine: 14 M.R.S. 3126-A(3) and 3127-B](https://legislature.maine.gov/statutes/14/title14sec3126-A.html), see the document, read 2026-11-08
- [Maryland: Md. Code, Com. Law 15-601.1](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcl&section=15-601.1), see the document, read 2026-11-08
- [Minnesota: Minn. Stat. 571.922](https://www.revisor.mn.gov/statutes/cite/571.922), see the document, read 2026-11-08
- [Montana: Mont. Code Ann. 25-13-614](https://archive.legmt.gov/bills/mca/title_0250/chapter_0130/part_0060/section_0140/0250-0130-0060-0140.html), see the document, read 2026-11-08
- [New York: N.Y. CPLR 5231(b)](https://www.nysenate.gov/legislation/laws/CVP/5231), see the document, read 2026-11-08
- [North Dakota: N.D. Cent. Code 32-09.1-03](https://ndlegis.gov/cencode/t32c09-1.pdf), see the document, read 2026-11-08
- [Pennsylvania: 42 Pa.C.S. 8127](https://www.palegis.us/statutes/consolidated/view-statute?txtType=PDF&ttl=42&div=00.&chpt=081.&sctn=027.&subsctn=000.), see the document, read 2026-11-08
- [South Dakota: S.D. Codified Laws 21-18-51](https://sdlegislature.gov/api/Statutes/21-18-51.html), see the document, read 2026-11-08
- [Virginia: Va. Code 34-29](https://law.lis.virginia.gov/vacode/title34/chapter3/section34-29/), see the document, read 2026-11-08
- [Washington: RCW 6.27.150](https://app.leg.wa.gov/RCW/default.aspx?cite=6.27.150), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the wage garnishment calculator for employers compute?

For one paycheck, the tool takes the pay stub's gross pay and deductions, keeps only those required by law, and works out disposable earnings, the federal Consumer Credit Protection Act limit for the pay period, the work state's own limit where its statute was read, the lesser of the two, and what is left for this order after support and earlier orders already withheld. It also gives the support and federal-debt limits, the IRS levy exempt amount from Publication 1494, and the numbers for the employer's answer form.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `calculate`: Returns disposable earnings with each deduction line, the federal limit with both of its tests, the state limit with its tests (or why the state is not covered), the lesser limit and which one binds, what was already withheld, the room left, the amount to withhold, the answer form lines, warnings and sources. For a support or federal-debt order, the percentage limit instead. Free on the page.
- `levy`: Returns the amount exempt from an IRS levy each pay period under Publication 1494 for 2026 (the base for the filing status and frequency, plus each dependent and any additional standard deduction), and, with take-home pay, what goes to the IRS. Free on the page.
- `batch`: Returns one row per paycheck (up to 200) with disposable earnings, the limit, the amount to withhold and the answer, a refused paycheck carrying its error; only the paychecks worked out are charged.

Inputs:

- `state, payFrequency, payDate`: The work state's two-letter code, weekly, biweekly, semimonthly, monthly (default biweekly), and the pay date, which picks the state minimum wage in force.
- `grossPay, deductions or requiredDeductions`: Gross pay for the period, and either each deduction line by type (federal, state and local income tax, Social Security, Medicare, state disability, health insurance, 401(k), union dues and others) or one total of the deductions required by law.
- `orderType, debtType`: creditor, support, federal-debt (default creditor); for states whose rule depends on the debt, consumer, medical, private-student-loan, residential-lease, pa-listed, other.
- `supportWithheld, otherWithheld, supportOrdered, balanceOwed`: What is already withheld this period for support and for earlier orders, the support ordered, and the balance left on this order.
- `supportingOthers, arrears12Weeks`: For a support order: whether the worker supports another spouse or child, and whether the support is more than 12 weeks in arrears.
- `minimumWage, localMinimumWage, nyRegion, dependents, headOfFamily, waiverSigned, expectedAnnualEarnings, garnishedThisYear, weeksInPeriod`: The facts some state rules use: the state or local minimum wage when typed, the New York region, dependents, head of family and a signed waiver, the yearly earnings cap, and a custom number of weeks in the period.
- `filingStatus, dependents, additional, statementReturned, takeHomePay`: For levy: single, married-joint, married-separate, head-of-household; daily, weekly, biweekly, semimonthly, monthly pay; dependents; the number in ADDITIONAL STANDARD DEDUCTION (0 to 4); whether the employee returned the statement; and take-home pay.

Outputs:

- answer: the most that may be garnished and what to withhold this period, in one sentence
- disposable: gross, required and voluntary deductions, and each line
- federal and stateLimit: each test with its amount; limit: the lesser and which one binds
- alreadyWithheld, headroom and withhold
- answerForm: the lines for the employer's answer to the order
- warnings and sources (each with its read date)

**Every step in full (7) and the rules**

1. Every amount is read as whole cents; percentages are basis points; the weeks in a pay period are sixths of a week (1, 2, 13/6 and 13/3 weeks for weekly, biweekly, semimonthly and monthly, as Fact Sheet #30 scales them), so every floor is exact and every limit is rounded down to the cent, never up.
2. Disposable earnings are gross pay less only the deductions required by law (15 U.S.C. 1672(b)): income taxes, Social Security, Medicare, state disability and unemployment insurance and mandatory retirement. Health insurance, 401(k) and union dues are voluntary and stay in.
3. The federal limit is the lesser of 25% of disposable earnings and the amount above 30 times the federal minimum wage times the weeks in the period: weekly: nothing at or below $217.50, 25% from $290.00; biweekly: nothing at or below $435.00, 25% from $580.00.
4. For a covered state, its statute's tests are run the same way (a percentage, a multiple of the federal, state or local minimum wage, tiers), and its own adjustments: amounts per dependent, head of family with or without a waiver, a yearly cap per creditor, debts that cannot be garnished at all. The lesser of the federal and state limits applies.
5. Support and earlier orders already withheld use up the creditor limit first; what is left, never below zero, is the most this order may take, and no more than the balance owed.
6. A support order is limited to 50% of disposable earnings for a worker supporting another spouse or child and 60% otherwise, 5% more when over 12 weeks in arrears (15 U.S.C. 1673(b)(2)). A federal debt order (administrative wage garnishment) takes at most 15% of disposable earnings within the CCPA limit; state law does not apply.
7. An IRS levy exempts the Publication 1494 base for the filing status and pay frequency, plus the amount per dependent and any additional standard deduction; everything above it in take-home pay goes to the IRS. Without the employee's statement, the levy form says to use married filing separately with no dependents.

**15 U.S.C. 1672 to 1677 and DOL Fact Sheet #30.**

The definitions, the 25% and 30 times minimum wage tests, the support percentages and the federal debt rule are read from the U.S. Code on govinfo.gov and Fact Sheet #30 (revised December 2024), both on 2026-11-08. The engine reproduces Fact Sheet #30's table for every pay period.

**State statutes and minimum wages.**

Each covered jurisdiction's creditor-garnishment rule, read from its own statute or official court form on the date shown. Jurisdictions not covered are listed with the reason; for them the tool shows the federal limit and says the state may allow less. Read 2026-11-08. State minimum wages the state formulas use, each read from the state's own site on the date shown. Rates are in cents per hour with the date they take effect. A local minimum wage, where a statute uses it, is the caller's input. Outside a state's known range (from the first date to validUntil) the tool asks for the rate instead of guessing.

**IRS Publication 1494.**

The exempt amounts for 2026 are copied from the Publication 1494 tables, read 2026-11-08, and checked against its worked examples.

## Which edge cases does it handle?

**The edge cases (6)**

- Earnings at or below 30 times the minimum wage for the period cannot be garnished by a creditor at all.
- Support already withheld can use up the whole creditor limit, leaving $0.00 for the creditor.
- A state whose limit depends on the debt in the writ uses consumer debt unless you set the debt type, and says so.
- A pay date outside the range of a state's known minimum wages asks for the rate instead of guessing.
- A batch with one bad paycheck answers the rest and charges only the paychecks worked out.
- A levy without the employee's statement is figured as married filing separately with no dependents.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A biweekly California paycheck with child support already withheld**

A biweekly California paycheck with child support already withheld

| Result | Value |
| --- | --- |
| answer | On $2,379.00 disposable earnings paid every two weeks in California, the most a creditor garnishment may take is $302.64 (California's limit); after $150.00 already withheld for support or earlier orders, $152.64 is left, so withhold $152.64 this two-week pay period. |
| disposable earnings | $2,379.00 |
| federal limit | $594.75 |
| California limit | $302.64 |
| already withheld | $150.00 |
| withhold | $152.64 |

**The input**

```json
{
  "op": "calculate",
  "state": "CA",
  "payFrequency": "biweekly",
  "payDate": "2026-11-13",
  "grossPay": 3000,
  "deductions": [
    {
      "type": "federal-income-tax",
      "amount": 262.5
    },
    {
      "type": "state-income-tax",
      "amount": 90
    },
    {
      "type": "social-security",
      "amount": 186
    },
    {
      "type": "medicare",
      "amount": 43.5
    },
    {
      "type": "state-disability",
      "amount": 39
    },
    {
      "type": "health-insurance",
      "amount": 95
    },
    {
      "type": "retirement-401k",
      "amount": 150
    }
  ],
  "supportWithheld": 150
}
```

**More worked examples (3)**

**Federal rule only: $2,400 biweekly with $520 of taxes**

Federal rule only: $2,400 biweekly with $520 of taxes

| Result | Value |
| --- | --- |
| answer | On $1,880.00 disposable earnings paid every two weeks in Texas, the most a creditor garnishment may take is $470.00 (the federal limit), so withhold $470.00 this two-week pay period. |
| 25% of disposable earnings ($1,880.00) | $470.00 |
| The amount above 30 x $7.25 (the federal minimum wage) x 2 weeks = $435.00 | $1,445.00 |

**The input**

```json
{
  "op": "calculate",
  "state": "TX",
  "payFrequency": "biweekly",
  "payDate": "2026-11-13",
  "grossPay": 2400,
  "requiredDeductions": 520
}
```

**A support order for a worker not supporting another family, over 12 weeks behind**

A support order for a worker not supporting another family, over 12 weeks behind

| Result | Value |
| --- | --- |
| answer | For a support order on $800.00 disposable earnings, the federal limit for a worker not supporting another spouse or child and more than 12 weeks in arrears is 65%, or $520.00 this week; up to $520.00 may be withheld. |
| limit | $520.00 |

**The input**

```json
{
  "op": "calculate",
  "orderType": "support",
  "state": "NY",
  "payFrequency": "weekly",
  "payDate": "2026-11-13",
  "grossPay": 1000,
  "requiredDeductions": 200,
  "supportingOthers": false,
  "arrears12Weeks": true
}
```

**IRS levy: single, paid weekly, three dependents**

IRS levy: single, paid weekly, three dependents

| Result | Value |
| --- | --- |
| answer | Under IRS Publication 1494 for 2026, an employee paid weekly who files single with 3 dependents has $615.38 of take-home pay exempt from a levy each pay period; of $800.00 take-home pay, $184.62 goes to the IRS. |
| exempt | $615.38 |
| to the IRS | $184.62 |

**The input**

```json
{
  "op": "levy",
  "filingStatus": "single",
  "payFrequency": "weekly",
  "dependents": 3,
  "takeHomePay": 800
}
```

## How is it tested?

**What its test suite asserts (3)**

- Fact Sheet #30's thresholds for every pay period and its $2,400 biweekly example are reproduced, read 2026-11-08.
- One case per covered state (19 in all) is worked by hand from the statute, with California's court examples and the dated state minimum wages.
- Support, federal debt and Publication 1494 levy examples for 2026 are reproduced.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Wage garnishment calculator for employers tool](https://krishnachagti-sudo.github.io/toll-preview/garnishment-calculator/).

## Questions

### Is there any AI in the wage garnishment calculator for employers answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the wage garnishment calculator for employers refuse to answer?

State rules are covered only for the 19 jurisdictions whose own statute or court form was read; for the others the federal limit is shown and the state may allow less. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Wage garnishment calculator for employers tool](https://krishnachagti-sudo.github.io/toll-preview/garnishment-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/garnishment-calculator/  
Data as of: 2026-11-04
