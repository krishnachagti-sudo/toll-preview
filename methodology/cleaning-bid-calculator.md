# How cleaning bids are priced: labor hours method

Hours are square feet divided by your production rate, or a count times your minutes each. Each hour is priced at the wage plus payroll costs (7.65% employer FICA and 0.6% FUTA, or 29.96% from BLS ECEC), supplies and overhead, divided by one less the margin. A janitorial month is 52/12 weeks of visits.

## How does it work?

1. Each line has exactly one way to find its hours: square feet divided by the production rate, a count times the minutes each divided by 60, or the hours given.
2. The wage is the one given, or the BLS May 2025 figure for the state, occupation and statistic chosen (janitors and median by default).
3. The burden is a percent of wages. Itemized adds employer social security and Medicare (6.2% + 1.45%), FUTA at 0.6% after the 5.4% credit, and your state unemployment, workers' compensation and benefits rates.
4. The billed rate per labor hour is the wage times one plus the burden, times one plus supplies, times one plus overhead, divided by one less the margin.
5. Each line is priced at its hours times the billed rate, rounded to whole cents once, so the lines add up to the total.

> Steps 6 to 8, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/cleaning-bid-calculator/#what) below.

## What does it not cover?

- State unemployment, workers' compensation and local minimum wages vary and are your inputs; city and county minimums are not in the table.
- It supplies no industry production rates or market prices; check the bid against your own timed rates and costs.
- A bid is a business decision. It is not legal, tax or accounting advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 4 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The figures were read on 2026-11-08: BLS OEWS May 2025 (released 2026-05-15), IRS Publication 15 (2026), BLS ECEC for 2026-06 (released 2026-09-09) and the DOL state minimum wage table (updated 2026-11-05). They change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The BLS wages, the IRS rates and quotes, the ECEC figures and the DOL table are pinned.

- [U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2025 estimates](https://www.bls.gov/oes/), May 2025 estimates, released 2026-05-15, read 2026-11-08
- [IRS Publication 15 (2026), (Circular E), Employer's Tax Guide](https://www.irs.gov/publications/p15), 2026 edition, read 2026-11-08
- [BLS Employer Costs for Employee Compensation, June 2026 (USDL-26-1494), Table 4, private industry workers, service occupations](https://www.bls.gov/news.release/ecec.t04.htm), released 2026-09-09, read 2026-11-08
- [U.S. Department of Labor, Wage and Hour Division: State Minimum Wage Laws (basic minimum rate, non-farm employment)](https://www.dol.gov/agencies/whd/minimum-wage/state), updated 2026-11-05, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the cleaning bid calculator (commercial and post-construction) compute?

The tool turns a walk-through into a bid: area tasks at the contractor's own production rates, restroom fixtures and glass panes at their own minutes each, and fixed-time tasks become labor hours by line. A loaded hourly cost is built from the wage (the contractor's own, or a BLS May 2025 figure) and payroll costs, then supplies, overhead and margin are added.

**In detail: operations, inputs and outputs**

It prices a janitorial contract per visit, month and year, or a post-construction job per rough, final and touch-up phase, with a dollars per square foot check and a proposal PDF. Production rates, minutes per fixture or pane, extras and the target range are the figures you enter; this tool supplies no industry production rates or market prices.

Operations (the op field):

- `bid`: Works out the hours and price of every task line, the totals by category, the hourly rates from the wage to the billed rate, and the price per visit, month and year (janitorial) or per phase and job (post-construction), with the $/sq ft figures, the target check and the flags. Free on the page.
- `proposal`: Does what bid does and also returns a proposal PDF (a client copy with the scope and prices, or the full copy with hours and the cost build-up) and a CSV of the lines and totals.
- `rate`: Turns a timing into a production rate: square feet cleaned in a number of minutes into square feet an hour and minutes per 1,000 sq ft, or items done into minutes each. Free.
- `wages`: Returns the BLS May 2025 median and mean hourly wages for janitors and cleaners and for maids and housekeeping cleaners in one state or all of them, with each state's minimum wage. Free.

Inputs:

- `type, sqft`: janitorial (the default) or post-construction, and the cleanable square feet of the building.
- `lines`: Up to 60 tasks, each with a name, a category (area, restroom, glass, other), for post-construction a phase (rough, final, touch-up; final by default), and one of: a production rate in sq ft an hour (with its own sq ft, or the building's), a count and minutes each, or hours.
- `visitsPerWeek, crew`: For janitorial, visits a week (5 by default); and the crew size, to give the hours on site.
- `wage`: Either { hourly } or { state, occupation, stat } for a BLS figure: occupation janitors or maids, stat median or mean.
- `burden`: mode itemized, ecec, flat (itemized by default). Itemized takes fica and futa switches and your own suta, workersComp and benefits percents; flat takes one percent.
- `suppliesPercent, overheadPercent, marginPercent`: Supplies and equipment as a percent of loaded labor, overhead as a percent of cost, and the margin as a percent of the price.
- `extras, minimum, target, state`: Up to 20 extra charges at cost (with a phase for post-construction), a minimum charge, a target $/sq ft range per visit, month or job, and the state for the minimum wage check.
- `company, client, job, address, date, validDays, notes, detail`: For proposal: the names and details that print on it, and scope (client copy) or full.
- `minutes, sqft or count`: For rate: the minutes timed and the square feet or items done.

Outputs:

- answer: the hours, the loaded hourly cost, the margin and the price per visit and month, or per phase and job
- lines and byCategory: how each line's hours were found, its hours and price, and the price per fixture or pane
- rates: the wage and its source, the burden lines, and the loaded, with-supplies, with-overhead and billed hourly rates
- visit, month, year or phases and job: hours, wages, burden, supplies, extras, overhead, profit and price
- perSqft and check: dollars per square foot, and where the price sits against your target, with the break-even
- flags, and pdf and csv for proposal

**Every step in full (8) and the rules**

1. Each line has exactly one way to find its hours: square feet divided by the production rate, a count times the minutes each divided by 60, or the hours given. A rate line with no square feet of its own uses the building's.
2. The wage is the one given, or the BLS May 2025 figure for the state, occupation and statistic chosen (janitors and median by default).
3. The burden is a percent of wages. Itemized adds employer social security and Medicare (6.2% + 1.45%), FUTA at 0.6% after the 5.4% credit, and your state unemployment, workers' compensation and benefits rates. The BLS option uses service occupations' benefits of $5.47 on $18.26 of wages (29.96%). Flat uses your percent.
4. The billed rate per labor hour is the wage times one plus the burden, times one plus supplies, times one plus overhead, divided by one less the margin. Extras are priced at cost times one plus overhead, divided by one less the margin.
5. Each line is priced at its hours times the billed rate, rounded to whole cents once, so the lines add up to the total. The cost build-up (wages, burden, supplies, extras, overhead and profit) is worked out the same way.
6. Janitorial: a visit is the sum of the lines and extras, or the minimum charge if higher; a month is the visit times visits a week times 52/12; a year is times 52. Post-construction: each phase is priced on its own, and the job is the sum.
7. Dollars per square foot is the price divided by the building's square feet. With a target range, the price is marked below, within or above it, with the break-even per square foot.
8. Flags: a wage below the state's minimum (the higher of the state rate and the federal $7.25), a scheduled minimum wage rise DOL lists, state unemployment or workers' compensation not entered, FUTA charged on every hour, a 0% margin, a missing phase, and no area task with a production rate.

**Official figures only.**

The only figures the tool supplies are BLS OEWS May 2025 wages, IRS Publication 15 (2026) payroll tax rates, BLS ECEC benefit costs for 2026-06, and the DOL state minimum wage table updated 2026-11-05. No production rate, minutes per fixture or market price is built in: those are inputs.

**Margin and markup.**

The margin is a share of the price, not a markup on cost, so a 20% margin is a 25% markup on cost; both are shown.

## Which edge cases does it handle?

**The edge cases (5)**

- FUTA stops once a worker has earned $7,000 in a year; charging it on every hour is the most it can be, and the bid says so.
- A line with both a rate and minutes, or with a count and no minutes, is refused, naming the line.
- A visit priced under the minimum charge is raised to it and flagged.
- A phase given on a janitorial bid is refused; phases are for post-construction bids.
- Michigan's scheduled minimum wage rise is named on a bid in Michigan.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A 25,000 sq ft office cleaned 5 nights a week, from sample production rates**

A 25,000 sq ft office cleaned 5 nights a week, from sample production rates

| Result | Value |
| --- | --- |
| answer | At your production rates, 25,000 sq ft, 16 restroom fixtures and 6 glass panes is 10.27 labor hours a visit; at $20.36 an hour loaded and a 15% margin the bid is $299.74 a visit, $6,494.37 a month at 5 visits a week ($0.260 per sq ft a month, $0.012 a visit). |
| hours a visit | 10.27 |
| wage | $17.71 (BLS May 2025 median hourly wage, janitors and cleaners, United States) |
| burden | 14.95% |
| billed rate an hour | $29.20 |
| a visit | $299.74 |
| a month | $6,494.37 |
| a year | $77,932.40 |
| per sq ft a month | $0.260 |

**The input**

```json
{
  "op": "bid",
  "type": "janitorial",
  "sqft": 25000,
  "visitsPerWeek": 5,
  "lines": [
    {
      "task": "Vacuum carpeted offices",
      "category": "area",
      "sqft": 18000,
      "rate": 3600
    },
    {
      "task": "Dust mop and damp mop hard floors",
      "category": "area",
      "sqft": 7000,
      "rate": 2800
    },
    {
      "task": "Empty trash and recycling",
      "category": "other",
      "count": 120,
      "minutes": 0.75
    },
    {
      "task": "Clean restroom fixtures and refill dispensers",
      "category": "restroom",
      "count": 16,
      "minutes": 4
    },
    {
      "task": "Entrance door glass",
      "category": "glass",
      "count": 6,
      "minutes": 2
    }
  ],
  "wage": {
    "state": "US",
    "occupation": "janitors",
    "stat": "median"
  },
  "burden": {
    "mode": "itemized",
    "suta": 2.7,
    "workersComp": 4
  },
  "suppliesPercent": 6,
  "overheadPercent": 15,
  "marginPercent": 15
}
```

**More worked examples (3)**

**A 12,000 sq ft new build priced in rough, final and touch-up phases**

A 12,000 sq ft new build priced in rough, final and touch-up phases

| Result | Value |
| --- | --- |
| answer | A 12,000 sq ft post-construction job is 27.93 labor hours at your production rates and prices at rough $519.57, final $676.04 and touch-up $101.74: $1,297.35 in all ($0.108 per sq ft), glass $162.79 for 48 panes ($3.39 a pane, inside the final clean). |
| burden (BLS ECEC) | 29.96% |
| Rough clean | $519.57, 5.00 hours |
| Final clean | $676.04, 19.93 hours |
| Touch-up clean | $101.74, 3.00 hours |
| job | $1,297.35 |
| per sq ft | $0.108 |

**The input**

```json
op: "bid"
type: "post-construction"
sqft: 12000
lines: 5 items
extras: 1 items
wage: {...}
burden: {...}
suppliesPercent: 8
overheadPercent: 12
marginPercent: 20
```

**A production rate from a timing: 1,500 sq ft vacuumed in 25 minutes**

A production rate from a timing: 1,500 sq ft vacuumed in 25 minutes

| Result | Value |
| --- | --- |
| answer | 1,500 sq ft in 25 minutes is 3,600 sq ft an hour (16.67 minutes per 1,000 sq ft). |

**The input**

```json
{
  "op": "rate",
  "sqft": 1500,
  "minutes": 25
}
```

**BLS May 2025 wages for janitors and cleaners in Ohio**

BLS May 2025 wages for janitors and cleaners in Ohio

| Result | Value |
| --- | --- |
| answer | BLS May 2025: janitors and cleaners in Ohio earned a median $17.26 an hour (mean $18.06); maids and housekeeping cleaners a median $15.47. Ohio's minimum wage is $11.00 (DOL, updated 2026-11-05). Employers with annual gross receipts of $405,000 or more; $7.25 for smaller employers. |

**The input**

```json
{
  "op": "wages",
  "state": "OH"
}
```

## How is it tested?

The tests work the sample office and new build line by line, each burden mode, margin against overhead, the monthly figure, the minimum charge, the target check, the minimum wage flags, the CSV, and that the proposal PDF is the same bytes every time.

**What its test suite asserts (3)**

- The BLS May 2025 wages, the IRS Publication 15 (2026) rates, the BLS ECEC figures and the DOL minimum wage table are pinned as read on 2026-11-08.
- The sample office and new build are checked line by line: hours, the loaded rate, each burden mode, margin against overhead, the monthly figure and the minimum charge.
- The target check, the minimum wage flags, the CSV and the proposal PDF (the same bytes every time) are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Cleaning bid calculator (commercial and post-construction) tool](https://krishnachagti-sudo.github.io/toll-preview/cleaning-bid-calculator/).

## Questions

### Is there any AI in the cleaning bid calculator (commercial and post-construction) answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the cleaning bid calculator (commercial and post-construction) refuse to answer?

State unemployment, workers' compensation and local minimum wages vary and are your inputs; city and county minimums are not in the table. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Cleaning bid calculator (commercial and post-construction) tool](https://krishnachagti-sudo.github.io/toll-preview/cleaning-bid-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/cleaning-bid-calculator/  
Data as of: 2026-11-04
