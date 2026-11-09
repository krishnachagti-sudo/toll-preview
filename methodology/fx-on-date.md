# How exchange rates on a date are worked out: method

The rate is the quote currency per euro divided by the base currency per euro, from the ECB reference file for that day, calculated in exact decimals and rounded half away from zero to 6 places. If the ECB published nothing on the date, the latest fixing in the 7 days before it is used and the answer says which.

## How does it work?

1. The ECB publishes how many units of each currency one euro buys, once per TARGET working day at about 16:00 CET.
2. The rate from base to quote is (quote per euro) divided by (base per euro). EUR counts as 1.
3. The division is done exactly, as a ratio of decimal numbers in BigInt, using the decimal the ECB wrote. The result is rounded half away from zero to 6 decimal places.
4. The inverse is 1 divided by that same unrounded ratio, rounded the same way. It is never the inverse of an already-rounded rate.
5. The fixing is the one on the requested date. If there is none, the tool looks back one day at a time, up to 7 days, and uses the first fixing found.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/fx-on-date/#what) below.

## What does it not cover?

- The default table is the ECB reference rate. It is a reference rate published once a day, not a rate you could trade at, and not a bank's rate.
- A date with no fixing uses an earlier day, at most 7 days back. Beyond that the tool refuses.
- The Treasury, IRS and HMRC options are limited to the pairs that include their anchor currency and to the years and months held in their tables.
- The tool does not tell you which rate a tax rule requires. It gives the number from the table you name.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 5 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): ECB rates are fetched each day after the ECB publishes them. The IRS table was read 2026-10-31. Treasury and HMRC files are refreshed with the data files.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The ECB file parser and the rate arithmetic are tested on a sample file: units per euro, cross rates, the 7-day lookback and rounding that is exact on the decimal value.

- [European Central Bank euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), daily fixings from 1999-01-04, refreshed daily
- [U.S. Treasury Reporting Rates of Exchange](https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange), every report since 2001-03-31, refreshed with the data files
- [IRS: Yearly average currency exchange rates](https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates), page updated 2026-09-17, read 2026-10-31
- [HMRC monthly exchange rates](https://www.trade-tariff.service.gov.uk/exchange_rates), every month since 2021-01, refreshed with the data files
- [U.S. Treasury Fiscal Data: Treasury Reporting Rates of Exchange (31 December reports)](https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange), 2023-12-31, 2024-12-31, 2025-12-31, read 2026-10-31

> ECB rates are fetched each day after the ECB publishes them, around 16:00 CET; they start on 1999-01-04, and a date with no fixing uses the latest one in the 7 days before it and says which. Treasury rates come quarterly with amendments in between, HMRC rates monthly. The IRS table is copied by hand: 2021 to 2025, page updated 2026-09-17.

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the exchange rate on a date compute?

Given a base currency, a quote currency and a date, the tool returns the rate, its inverse and the date of the fixing it used.

**In detail: inputs and outputs**

A source option swaps the default ECB table for the US Treasury reporting rates, the IRS yearly averages or the HMRC monthly rates, which tax authorities name for specific purposes.

Inputs:

- `base, quote`: Three-letter currency codes in capitals, like USD and EUR. Any code in the ECB data file is accepted, including retired ones.
- `date`: A real calendar date written like 2026-10-29.
- `source`: ecb (default), treasury, irs or hmrc.

Outputs:

- rate: units of quote per 1 base
- inverse: units of base per 1 quote
- requestedDate and fixingDate
- for the other sources: the published rate as printed, the report or period it covers and a link to the table

**Every step in full (7) and the rules**

1. The ECB publishes how many units of each currency one euro buys, once per TARGET working day at about 16:00 CET. The file starts on 1999-01-04.
2. The rate from base to quote is (quote per euro) divided by (base per euro). EUR counts as 1.
3. The division is done exactly, as a ratio of decimal numbers in BigInt, using the decimal the ECB wrote. The result is rounded half away from zero to 6 decimal places.
4. The inverse is 1 divided by that same unrounded ratio, rounded the same way. It is never the inverse of an already-rounded rate.
5. The fixing is the one on the requested date. If there is none, the tool looks back one day at a time, up to 7 days, and uses the first fixing found. The answer carries fixingDate, and the call reports it when it differs from the requested date.
6. A date after the latest fixing is answered only when every day in between is a weekend. A weekday in that gap has its own fixing coming, so the tool refuses rather than use an older rate.
7. For the other sources the published rate is kept as text and the answer is worked out from it exactly. Treasury, IRS and HMRC are each quoted against one anchor currency (US dollar, US dollar, pound), so base or quote must be that currency.

**US Treasury reporting rates.**

Quarterly, units per US dollar. Treasury says agencies use each report as of its date and for the ensuing three months, and that an amendment is a separate line with a new effective date. So a date uses the latest report dated on or before it, and within that report the latest line for the currency whose effective date is on or before the date. The answer gives the report date, the effective date and the period the rate covers.

**IRS yearly average.**

Units per US dollar for the calendar year of the date, copied from the IRS table (page updated 2026-09-17). A cell the IRS prints in a form that is not a plain number is refused rather than guessed.

**HMRC monthly rates.**

Units per pound, covering the first to the last day of the month of the date. HMRC's weekly amendments are not in the monthly files and are not used. A currency that the file lists with two different rates for the month is refused.

## Which edge cases does it handle?

**The edge cases (6)**

- Weekends: a Saturday uses the Friday fixing (24 October 2026 uses 23 October 2026).
- Target holidays: Christmas Day 2024 had no fixing, so the answer uses 24 December 2024 and says so in the note.
- A same-currency pair returns 1 for rate and inverse.
- A date before 1999-01-04 is refused: the ECB has no rates before the first day of the euro.
- A date in the future is refused, and so is a weekday after the latest published fixing.
- A currency missing from that day's row (the ECB leaves some blank) is refused for that date, not filled from another day.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A Saturday uses the Friday fixing**

A Saturday uses the Friday fixing

| Result | Value |
| --- | --- |
| requestedDate | 2026-10-24 |
| fixingDate | 2026-10-23 |
| rate (EUR per USD) | 0.893416 |
| inverse (USD per EUR) | 1.1193 |

**The input**

```json
{
  "base": "USD",
  "quote": "EUR",
  "date": "2026-10-24"
}
```

**More worked examples (3)**

**Christmas Day 2024: no ECB fixing**

Christmas Day 2024: no ECB fixing

| Result | Value |
| --- | --- |
| requestedDate | 2024-12-25 |
| fixingDate | 2024-12-24 |
| rate (JPY per GBP) | 197.149931 |
| inverse (GBP per JPY) | 0.005072 |

**The input**

```json
{
  "base": "GBP",
  "quote": "JPY",
  "date": "2024-12-25"
}
```

**HMRC monthly rate**

HMRC monthly rate

| Result | Value |
| --- | --- |
| publication | HMRC monthly exchange rates for January 2025 (published December 18, 2024) |
| publishedRate | 1.2707 (USD per 1 GBP) |
| periodStart to periodEnd | 2025-01-01 to 2025-01-31 |
| rate (GBP per USD) | 0.786968 |
| inverse | 1.2707 |

**The input**

```json
{
  "base": "USD",
  "quote": "GBP",
  "date": "2025-01-15",
  "source": "hmrc"
}
```

**IRS yearly average**

IRS yearly average

| Result | Value |
| --- | --- |
| publishedRate | 0.924 (EUR per 1 USD) |
| periodStart to periodEnd | 2023-01-01 to 2023-12-31 |
| rate (USD per EUR) | 1.082251 |
| inverse | 0.924 |

**The input**

```json
{
  "base": "EUR",
  "quote": "USD",
  "date": "2023-06-15",
  "source": "irs"
}
```

## How is it tested?

Treasury and HMRC values read on 2026-11-02 are pinned against the real files, and IRS averages against the stored IRS table, including the cells the IRS prints irregularly.

**What its test suite asserts (3)**

- The ECB file parser and the rate arithmetic are tested on a sample file: units per euro, cross rates, the 7-day lookback to the day, rounding that is exact on the decimal value.
- When the real downloaded files are present, the worked examples and the currency list are compared with them. Treasury and HMRC values read on 2026-11-02 are pinned against the real files.
- IRS yearly averages are tested against the stored IRS table, including the cells the IRS prints irregularly, which are refused rather than guessed.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Exchange rate on a date tool](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/).

## Questions

### Is there any AI in the exchange rate on a date answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the exchange rate on a date refuse to answer?

The default table is the ECB reference rate. It is a reference rate published once a day, not a rate you could trade at, and not a bank's rate. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Exchange rate on a date tool](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Which exchange rate to use for US taxes](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/which-exchange-rate-for-us-taxes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/fx-on-date/  
Data as of: 2026-11-04
