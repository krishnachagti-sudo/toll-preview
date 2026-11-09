# How MACRS depreciation is calculated: Publication 946

Each asset's business basis goes through Section 179 first, then the special allowance, then the Publication 946 percentage table for its class and convention. Mid-quarter applies when the bases placed in service in the last 3 months are more than 40% of the year's total; exactly 40% stays half-year.

## How does it work?

1. Order: Section 179 first, then the special allowance on what is left, then MACRS on the rest (Publication 946 chapters 3 and 4).
2. The business basis is cost times the business-use share. Section 179 needs more than 50% business use.
3. Section 179 elected must fit the year's dollar limit, which is reduced by the cost of Section 179 property over the phase-out start (for 2026 $2,560,000 less the excess over $4,090,000), and a heavy SUV is capped (for 2026 $32,000).
4. The 40% test uses each asset's basis after Section 179 and after the personal-use share, before any special allowance.
5. The special allowance rate depends on acquisition date: for 2025, 40% for property acquired before January 20, 2025 and 100% for property acquired after January 19, 2025 (or 40% by election for the first tax year ending after that date); for 2026, 100% for property acquired after January 19, 2025.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/macrs-depreciation/#what) below.

## What does it not cover?

- Tax years 2025 and 2026 only, and only one year's additions per run; earlier assets go in that year's run.
- Passenger automobiles (the Section 280F caps) are not computed. Property acquired before September 28, 2017 is not covered.
- Property acquired before January 20, 2025 and placed in service in 2026 is refused, because the sources disagree on whether it gets a special allowance. Electing out of its class gives the schedule without one.
- A Section 179 deduction above the business income limit cannot be carried forward by the tool; lower the election instead.
- The tool does not decide whether property is qualified or whether it is business property. It applies the facts you give.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 3 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Percentage tables are from Publication 946 (2025 edition, dated 2026-03-13), read 2026-11-02. Section 179 limits are held for 2025 and 2026.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): Every column of every percentage table sums to exactly 100%, and the tables are checked a second time against the declining-balance and straight-line formulas.

- [IRS Publication 946 (2025), How To Depreciate Property, Appendix A](https://www.irs.gov/pub/irs-pdf/p946.pdf), 2025 edition, dated 2026-03-13, read 2026-11-02
- [Rev. Proc. 2025-32 sec. 4.24, and IRS Publication 946 (2025), What's New for 2026](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf), 2026 limits, read 2026-11-02
- [IRS Publication 946 (2025), What's New for 2025, and chapter 2, Dollar Limits](https://www.irs.gov/publications/p946), 2025 limits, read 2026-11-02

> Percentage tables from Publication 946 (2025), dated 2026-03-13, read 2026-11-02. Section 179 limits for 2025 and 2026; other tax years are refused.

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the macrs depreciation schedule compute?

For one entity and one calendar tax year of additions, the tool runs the mid-quarter test, applies Section 179 and the special depreciation allowance, and reads the IRS percentage tables to produce a year-by-year schedule and the year's journal entry.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `schedule`: The full schedule for the year's assets, with the test worksheet, each asset's years and the totals by year, as a CSV and a journal entry.
- `mid-quarter-test`: Only the 40% worksheet, the convention and the year-1 total.
- `table`: A percentage table for a class, convention and quarter or month, with its page in Publication 946.
- `limits`: The Section 179 limits and special allowance rates for a tax year, with sources.

Inputs:

- `taxYear`: 2025 or 2026.
- `assets`: For each: cost, placedInService, acquired (the binding contract date), class (3, 5, 7, 10, 15, 20, qip, 25, 27.5 or 39), businessUsePct, section179, vehicle and disposedSameYear.
- `bonusElectOut, elect40Percent, businessIncome, section179PropertyCost`: Classes elected out of the special allowance, the 2025 election of 40%, the business income limit, and the cost of all Section 179 property for the phase-out.

Outputs:

- convention (HY, MQ or MM) and the test worksheet
- per asset: Section 179, special allowance and its reason, the table used and each year's percentage and amount
- totals by year and the year-1 total
- warnings

**Every step in full (7)**

1. Order: Section 179 first, then the special allowance on what is left, then MACRS on the rest (Publication 946 chapters 3 and 4).
2. The business basis is cost times the business-use share. Section 179 needs more than 50% business use. Listed property used 50% or less goes to the alternative depreciation system, which the tool does not compute, so vehicles at 50% or less are refused.
3. Section 179 elected must fit the year's dollar limit, which is reduced by the cost of Section 179 property over the phase-out start (for 2026 $2,560,000 less the excess over $4,090,000), and a heavy SUV is capped (for 2026 $32,000). A business income limit you give is also enforced.
4. The 40% test uses each asset's basis after Section 179 and after the personal-use share, before any special allowance. Residential rental and nonresidential real property and property placed in service and disposed of in the same year are left out. Mid-quarter applies only if the last-3-months total is more than 40% of the year's total.
5. The special allowance rate depends on acquisition date: for 2025, 40% for property acquired before January 20, 2025 and 100% for property acquired after January 19, 2025 (or 40% by election for the first tax year ending after that date); for 2026, 100% for property acquired after January 19, 2025. An election out is made for a whole class.
6. The remaining basis is multiplied by the table percentages: Tables A-1 to A-5 for 3- to 20-year property, A-8 to A-12 (straight line) for qualified improvement property and 25-year water utility property, and A-6 (27.5-year) and A-7a (39-year) with the mid-month convention.
7. Money is whole cents. Percentages are kept exactly as printed, a year's amount is rounded half up once, and the last year takes what is left, so the years add up to the basis to the cent.

## Which edge cases does it handle?

**The edge cases (5)**

- Exactly 40% in the last quarter stays half-year, because the rule is more than 40%. The answer says "just over" or "just under" when the share rounds to 40.00%.
- Publication 946 Example 2: a $5,000 computer placed in service in October when the year's total is $10,000 is 50%, so mid-quarter applies to every asset.
- Buildings and same-year disposals are left out of the test.
- Mid-quarter with 100% special allowance: the convention still sets the schedule for classes elected out and for a state that does not follow federal bonus, and a warning says so.
- Elected-out classes get the table schedule without the special allowance.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Publication 946 Example 2**

Publication 946 Example 2

| Result | Value |
| --- | --- |
| convention | MQ |
| test | $5,000.00 placed in service October to December / $10,000.00 for the year = 50.00%, more than 40%: mid-quarter for every asset in the test classes. |

**The input**

```json
{
  "op": "mid-quarter-test",
  "taxYear": 2025,
  "bonusElectOut": [
    "5",
    "7"
  ],
  "assets": [
    {
      "id": "machine",
      "description": "Machine",
      "cost": 4000,
      "placedInService": "2025-01-15",
      "class": "7"
    },
    {
      "id": "furniture",
      "description": "Office furniture",
      "cost": 1000,
      "placedInService": "2025-09-10",
      "class": "7"
    },
    {
      "id": "computer",
      "description": "Computer",
      "cost": 5000,
      "placedInService": "2025-10-03",
      "class": "5"
    }
  ]
}
```

**More worked examples (2)**

**Exactly 40% stays half-year**

Exactly 40% stays half-year

| Result | Value |
| --- | --- |
| convention | HY |
| test | $40,000.00 placed in service October to December / $100,000.00 for the year = 40.00%, not more than 40%: half-year. |

**The input**

```json
{
  "op": "mid-quarter-test",
  "taxYear": 2026,
  "assets": [
    {
      "id": "lathe",
      "cost": 60000,
      "acquired": "2026-02-02",
      "placedInService": "2026-03-02",
      "class": "7"
    },
    {
      "id": "forklift",
      "cost": 40000,
      "acquired": "2026-10-01",
      "placedInService": "2026-11-16",
      "class": "5"
    }
  ]
}
```

**Table A-5, fourth quarter**

Table A-5, fourth quarter

| Result | Value |
| --- | --- |
| table | Table A-5, 5-year, Q4 |
| percentages by year | 1: 5.00%, 2: 38.00%, 3: 22.80%, 4: 13.68%, 5: 10.94%, 6: 9.58% |

**The input**

```json
{
  "op": "table",
  "class": "5",
  "convention": "MQ",
  "quarter": 4
}
```

## How is it tested?

Worked examples from Publication 946 are reproduced, and the 2025 and 2026 Section 179 figures are compared with Publication 946 and Rev. Proc. 2025-32.

**What its test suite asserts (3)**

- Every column of every percentage table sums to exactly 100%, and the tables are checked a second time against the declining-balance and straight-line formulas.
- Worked examples from Publication 946 are reproduced: $10,000 of 7-year furniture (chapter 4), the October computer that forces mid-quarter, the $100,000 building placed in service in March, the $450,000 property that gets 40% bonus (chapter 3) and the Jane Ash Section 179 reduction (chapter 2).
- The 2025 and 2026 Section 179 figures are compared with Publication 946 and Rev. Proc. 2025-32.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the MACRS depreciation schedule tool](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/).

## Questions

### Is there any AI in the macrs depreciation schedule answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the macrs depreciation schedule refuse to answer?

Tax years 2025 and 2026 only, and only one year's additions per run; earlier assets go in that year's run. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the MACRS depreciation schedule tool](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/macrs-depreciation/  
Data as of: 2026-11-04
