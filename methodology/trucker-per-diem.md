# How trucker per diem is calculated: IRS notices

Each day away is priced at the IRS special transportation-industry meals and incidental expenses rate in force on that day, a departure or return day counts at 3/4 of the rate, and the meal amount is deducted at 80%, 50% or, in 2021 and 2022, 100%. IRS notices on file run from 2018-10-01 to 2027-09-30.

## What does the trucker per diem worksheet compute?

For an owner-operator or a driver who deducts per diem, the tool turns days away into the per diem amount and the deductible amount, split into the lines of Schedule C where they belong. It can start from counts of days, or from a log of trips and days, and it checks the log.

Operations (the op field):

- `quick`: From counts of full and partial days (continental US and outside it) and incidental-only days, with octDec for the days from October 1 in years when the rate changed, returns per diem, the deductible amount and what to enter.
- `preview`: From trips and day entries, returns the same totals with a day-by-day breakdown and the checks a preparer would make, without the files.
- `worksheet`: The same as preview, with a worksheet as PDF and CSV and a hash of the log.
- `rates`: The IRS rates on file with the notice, URL and the sentence in section 3 that sets each rate.

Inputs:

- `taxYear`: A calendar year from 2019 to the last year with notices on file.
- `fullDays, partialDays, oconusFullDays, oconusPartialDays`: Days away in the continental US (CONUS) and outside it (OCONUS: Alaska, Hawaii, Canada and abroad).
- `incidentalOnlyDays, incidentalOnlyPartialDays`: Days away with no meal costs.
- `hosSubject, interstate, transportationIndustry`: Whether meals were during DOT hours-of-service periods (default true), whether the work is interstate, and whether the work qualifies for the transportation rate.
- `days, trips`: A log: dates with a status (full, partial, incidental, incidental-partial, reimbursed, home), or trips with depart and return dates.

Outputs:

- totals.perDiem, deductible, scheduleCLine24b and scheduleCLine24a
- segments: each rate period with its notice and the days counted
- limit: the percentage and the reason
- citations

## How is it calculated, step by step?

1. The rate for a day is the one in force that day. Each IRS notice sets the rate for travel on or after October 1 until the next notice, so a calendar year has two notice periods, and 2021 and 2024 have two different rates.
2. A full day is 12:01 a.m. to midnight at the full rate. A departure or return day is a partial day at 3/4 of the rate. Rev. Proc. 2019-48 section 6.04 (Rev. Proc. 2011-47 section 6.04 before November 26, 2019) requires the 3/4 method for the self-employed method.
3. The whole M&IE amount is treated as food and beverage (section 6.05(1)). The deductible share is 80% for meals during periods subject to DOT hours-of-service limits (IRC section 274(n)(3), Publication 463), 50% otherwise, and 100% for 2021 and 2022 (Notice 2021-63).
4. Incidental-expenses-only days (a flat daily amount, 3/4 on a partial day) are not limited, and go on Schedule C line 24a rather than 24b.
5. Days a carrier or employer reimbursed cannot also be deducted (section 6.06).
6. Money is whole cents. Rates are whole dollars, so 3/4 of a rate is a whole number of cents, the 80% and 100% limits are exact, and only the 50% limit can leave half a cent, rounded half up once on the total.
7. For a log, the engine expands trips and day entries into one entry per date and checks for gaps, duplicates and days past the last published rate.

## Which edge cases does it handle?

- Split years: the rate changed on October 1 in 2021 ($66 to $69) and 2024 ($69 to $80). quick requires octDec, the count of days from October 1, and refuses if it is missing.
- A partial day is priced at 3/4 of the rate in force on that day, not of the year's rate.
- OCONUS days (outside the continental US) use the OCONUS rate in the same notice.
- A day logged twice with different statuses or localities is refused: keep one.
- Travel on or after the first day with no published IRS rate is refused with that date, and the answer notes when a year is only partly covered.
- The special rate is used for every CONUS and OCONUS day of the year once chosen, and the driver cannot switch to federal locality rates until January 1 of the next year (Rev. Proc. 2019-48).

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**2026: 240 full days and 40 departure or return days**

```json
{
  "op": "quick",
  "taxYear": 2026,
  "fullDays": 240,
  "partialDays": 40
}
```

2026: 240 full days and 40 departure or return days

| Result | Value |
| --- | --- |
| 2026-01-01 to 2026-12-31 | 240 full days and 40 partial days at $80 |
| per diem | $21,600.00 |
| deductible at 80% (line 24b) | $17,280.00 |

**2024, the year the rate changed on October 1**

```json
{
  "op": "quick",
  "taxYear": 2024,
  "fullDays": 240,
  "partialDays": 40,
  "octDec": {
    "fullDays": 60,
    "partialDays": 10
  }
}
```

2024, the year the rate changed on October 1

| Result | Value |
| --- | --- |
| 2024-01-01 to 2024-09-30 | 180 full days and 30 partial days at $69 |
| 2024-10-01 to 2024-12-31 | 60 full days and 10 partial days at $80 |
| per diem | $19,372.50 |
| deductible at 80% (line 24b) | $15,498.00 |

## What does it not do?

- The special transportation rate is only for work that directly moves people or goods by truck (or bus, train, ship, barge or plane) and regularly stops on one trip at places with different federal M&IE rates. Work that does not qualify is refused.
- The tool does not decide whether you were away from your tax home or whether your meals were during hours-of-service periods. You tell it, and the default is that they were.
- Company drivers whose employer reimburses cannot also deduct those days; reimbursed days are priced at zero.
- A date after 2027-09-30 has no rate until the IRS publishes the next notice, usually in late September, and is refused.

## Where does the data come from, and how fresh is it?

IRS notices from 2018-10-01 to 2027-09-30, each read 2026-10-31.

- [IRS Notice 2024-68](https://www.irs.gov/pub/irs-drop/n-24-68.pdf)
- [IRS Notice 2025-54](https://www.irs.gov/pub/irs-drop/n-25-54.pdf)
- [IRS Notice 2026-60](https://www.irs.gov/pub/irs-drop/n-26-60.pdf)
- [Rev. Proc. 2011-47](https://www.irs.gov/pub/irs-drop/rp-11-47.pdf)
- [Rev. Proc. 2019-48](https://www.irs.gov/pub/irs-drop/rp-19-48.pdf)
- [Notice 2021-63](https://www.irs.gov/pub/irs-drop/n-21-63.pdf)
- [IRS Publication 463 (for 2025 returns)](https://www.irs.gov/publications/p463)
- [Instructions for Schedule C (Form 1040), 2025](https://www.irs.gov/instructions/i1040sc)

IRS notices from 2018-10-01 to 2027-09-30, read 2026-10-31. A date after the last notice is refused.

Trucker per diem worksheet: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [IRS Notice 2018-77](https://www.irs.gov/pub/irs-drop/n-18-77.pdf) | 2018-10-01 to 2019-09-30 | 2026-10-31 |
| [IRS Notice 2019-55](https://www.irs.gov/pub/irs-drop/n-19-55.pdf) | 2019-10-01 to 2020-09-30 | 2026-10-31 |
| [IRS Notice 2020-71](https://www.irs.gov/pub/irs-drop/n-20-71.pdf) | 2020-10-01 to 2021-09-30 | 2026-10-31 |
| [IRS Notice 2021-52](https://www.irs.gov/pub/irs-drop/n-21-52.pdf) | 2021-10-01 to 2022-09-30 | 2026-10-31 |
| [IRS Notice 2022-44](https://www.irs.gov/pub/irs-drop/n-22-44.pdf) | 2022-10-01 to 2023-09-30 | 2026-10-31 |
| [IRS Notice 2023-68](https://www.irs.gov/pub/irs-drop/n-23-68.pdf) | 2023-10-01 to 2024-09-30 | 2026-10-31 |
| [IRS Notice 2024-68](https://www.irs.gov/pub/irs-drop/n-24-68.pdf) | 2024-10-01 to 2025-09-30 | 2026-10-31 |
| [IRS Notice 2025-54](https://www.irs.gov/pub/irs-drop/n-25-54.pdf) | 2025-10-01 to 2026-09-30 | 2026-10-31 |
| [IRS Notice 2026-60](https://www.irs.gov/pub/irs-drop/n-26-60.pdf) | 2026-10-01 to 2027-09-30 | 2026-10-31 |
| [IRS Notice 2021-63](https://www.irs.gov/pub/irs-drop/n-21-63.pdf) | 2021-01-01 to 2022-12-31 | 2026-10-31 |
| [Rev. Proc. 2011-47](https://www.irs.gov/pub/irs-drop/rp-11-47.pdf) | see the document | 2026-10-31 |
| [Rev. Proc. 2019-48](https://www.irs.gov/pub/irs-drop/rp-19-48.pdf) | see the document | 2026-10-31 |
| [IRS Publication 463 (for 2025 returns)](https://www.irs.gov/publications/p463) | see the document | 2026-10-31 |
| [Instructions for Schedule C (Form 1040), 2025](https://www.irs.gov/instructions/i1040sc) | see the document | 2026-10-31 |
| [49 CFR 395.8(k) (records of duty status kept 6 months)](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-395/subpart-A/section-395.8) | see the document | 2026-10-31 |
| [49 CFR 395.22(i) (ELD back-ups kept 6 months)](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-395/subpart-B/section-395.22) | see the document | 2026-10-31 |
| [IRS: How long should I keep records?](https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records) | see the document | 2026-10-31 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Every notice period is compared with the notice: its URL, effective date and the sentence in section 3 that sets the rate. A gap in the rate table is refused. The rate in force on each date is checked across every October 1 change, and worked examples are reproduced, such as 240 full and 40 partial days in 2026 giving $21,600 of per diem and $17,280 at 80%.

What its test suite asserts:

- Every notice period is compared with the notice: its URL, effective date and the sentence in section 3 that sets the rate. A gap in the rate table is refused.
- The rate in force on each date is checked across every October 1 change, including the split years 2021 and 2024.
- Worked examples are reproduced, such as 240 full and 40 partial days in 2026 giving $21,600 of per diem and $17,280 at 80%.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Trucker per diem worksheet tool](https://krishnachagti-sudo.github.io/toll-preview/trucker-per-diem/).

## Questions

### Is there any AI in the trucker per diem worksheet answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the trucker per diem worksheet refuse to answer?

The special transportation rate is only for work that directly moves people or goods by truck (or bus, train, ship, barge or plane) and regularly stops on one trip at places with different federal M&IE rates. Work that does not qualify is refused. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Trucker per diem worksheet tool](https://krishnachagti-sudo.github.io/toll-preview/trucker-per-diem/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Trucker per diem rate history since 2019](https://krishnachagti-sudo.github.io/toll-preview/trucker-per-diem/rate-history/)
- [Partial days](https://krishnachagti-sudo.github.io/toll-preview/trucker-per-diem/partial-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/trucker-per-diem/  
Data as of: 2026-11-04
