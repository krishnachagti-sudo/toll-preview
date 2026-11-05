# Historical exchange rates in Excel by date

In Excel, =XLOOKUP(DATE(2025,12,31),A:A,B:B,,-1) on the ECB's history file returns 1.1750, the EUR to USD reference rate for 31 December 2025; the -1 makes a weekend or holiday date take the last fixing before it.

## Check a formula against the tool

[Get the rate in the tool](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/?base=EUR&quote=USD&date=2025-12-31)

## Worked results from the current file

| Formula | Returns | Fixing used |
| --- | ---: | --- |
| =XLOOKUP(DATE(2025,12,31),A:A,B:B,,-1) | 1.1750 | Wednesday 31 Dec 2025 |
| =XLOOKUP(DATE(2025,6,29),A:A,B:B,,-1) | 1.1704 | Friday 27 Jun 2025 (Sunday 29 June 2025 has no fixing) |
| =XLOOKUP(DATE(2025,12,31),A:A,AH:AH,,-1)/XLOOKUP(DATE(2025,12,31),A:A,B:B,,-1) | 89.869362 (rounded to 6 decimals) | Wednesday 31 Dec 2025 |

In the ECB file today the US dollar is column B and the Indian rupee column AH. The ECB has added and dropped currencies over the years, so check the header row before you copy a column letter.

> Excel keeps the full quotient for a cross rate; the tool and the pages here round it to 6 decimal places, half away from zero. VLOOKUP with TRUE needs the dates sorted oldest first; XLOOKUP with match mode -1 does not.

## Ready-made tables

Each pair page has month-end rates, monthly averages and yearly averages, with the month table as CSV: [EUR to USD](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/eur-usd/), [USD to INR](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/usd-inr/), [USD to CAD](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/usd-cad/).

## How these rates are made

The European Central Bank publishes how many units of each currency one euro buys, usually at around 16:00 CET on every TARGET working day. A rate between two other currencies is worked out from the same day's fixing: units of the second per euro divided by units of the first per euro, rounded half away from zero to 6 decimal places. The inverse comes from the unrounded rate.

A weekend or TARGET holiday has no fixing, so a date like that uses the last fixing before it, up to 7 days back, and the tool names the day it used. Averages here are the mean of the daily rates, each as the tool reports it, rounded to 6 decimal places.

> These are ECB reference rates. The ECB publishes them for information only and discourages their use for transactions. They are not the rate a bank, card or money transfer service charges.

## Sources

- [European Central Bank: Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
- [European Central Bank: full history of the reference rates (CSV in a zip file)](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip)
- [Microsoft Support: XLOOKUP function](https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929)

## Steps

1. **Download the ECB history.** Download eurofxref-hist.zip from the ECB and unzip it. It holds one file, eurofxref-hist.csv, with every fixing since 4 January 1999.
2. **Open it in Excel.** Open eurofxref-hist.csv in Excel (or use Data, From Text/CSV). Column A is the date, newest first, and each other column is one currency in units per euro. A blank or N/A means no rate that day.
3. **Look up a date.** Use XLOOKUP with match mode -1, which takes the exact date or the next earlier one: =XLOOKUP(DATE(2025,12,31),A:A,B:B,,-1)
4. **Pairs without the euro.** Divide one currency's column by the other's on the same date. US dollar to Indian rupee: =XLOOKUP(DATE(2025,12,31),A:A,AH:AH,,-1)/XLOOKUP(DATE(2025,12,31),A:A,B:B,,-1)

## Related

- [EUR to USD month-end rates (CSV)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/eur-usd/)
- [USD to INR month-end rates (CSV)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/usd-inr/)
- [USD to CAD month-end rates (CSV)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/usd-cad/)
- [ECB euro reference rates for every currency](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/ecb-reference-rates/)
- [ECB exchange rate API](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/ecb-exchange-rate-api/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/historical-exchange-rates-in-excel/  
Data as of: 2026-11-05
