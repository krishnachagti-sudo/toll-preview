# A spreadsheet or Endwise: which to use

A spreadsheet is enough for a simple one-off count, and Endwise is better when the answer depends on a rule or rate that changes. For example, 5 weekdays fall after July 1, 2026 up to July 8, 2026 in the US, but only 4 are business days once the holiday is skipped.

## What is the real difference between a spreadsheet and a tool?

A spreadsheet does the arithmetic. It does not know the rule. For these jobs the hard part is the rule or the rate for a particular date: which days are holidays, what the rate was on that day, which period a mileage trip falls in. In a spreadsheet you keep that table up to date yourself. In a tool the table is kept for you, from a named source.

That does not make a spreadsheet the wrong choice. Below, each job says what the spreadsheet route needs from you, what the tool gives, and when the spreadsheet is the better pick.

## Business days: when do NETWORKDAYS and WORKDAY do the job?

NETWORKDAYS counts working days between two dates and WORKDAY adds them. Both take an optional list of holiday dates, which you supply as a range of cells; weekends are excluded. Microsoft and Google document both (see sources). For other weekend patterns there are the `INTL` versions.

What you must keep up to date: the holiday list, with observed days already moved (when a holiday falls on a weekend, the day off moves). Leave the list out and the count is wrong. From July 1, 2026 to July 8, 2026 in the US, the weekdays after the start number 5. Business days gives 4, because it skips Independence Day (observed) on July 3, 2026. Also note that NETWORKDAYS counts the start date itself when it is a business day, and the tool does not, so the two differ by one unless you adjust.

[Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/) gives the count with the holidays it skipped, for a region, at $0.0005 per call. The spreadsheet is the better choice for a one-off count in a year where you already have a holiday list, for offline work, and for a long column of dates in a model you already have. How-to guides: [Excel NETWORKDAYS](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-networkdays/), [Excel WORKDAY](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-workday/) and [Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/business-days/google-sheets-networkdays/).

## Exchange rate on a date: where does a spreadsheet get the rate?

A spreadsheet has no rates of its own. In Google Sheets, `GOOGLEFINANCE` can fetch currency data. Google says quotes are not sourced from all markets and may be delayed up to 20 minutes, that data is provided "as is" for information only, that historical data comes back as an expanded array with headers, and that historical data cannot be downloaded or accessed through the Sheets API or Apps Script. In Excel, or anywhere else, you paste a table of rates from a source you choose.

What you must keep up to date: the rate table, and a rule for dates with no rate. November 7, 2026 was a Saturday. The European Central Bank publishes no reference rate that day, so Exchange rate on a date uses the fixing of November 6, 2026, 1 EUR = 1.1165 USD, and says so. In a sheet you have to write that fallback yourself, or the lookup fails or returns a wrong day.

[Exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/) returns the rate for the date from a named official source (the ECB, U.S. Treasury, IRS or HMRC table, your pick), at $0.001 per call. The spreadsheet is the better choice when you convert live and do not need an audit trail, when you already hold the rates for your own period, or when the number is only for your own planning.

## Mileage: what changes when the IRS rate changes?

The IRS business mileage rate is set by period, and in 2026 it changed mid-year: 72.5 cents a mile from January 1 and 76 cents from July 1. A mileage sheet therefore needs a rate lookup by trip date, not one rate cell. The same 1,000 miles is $725.00 in June and $760.00 in July, so a year-long total at one rate is wrong for one half of the year. Mileage allowances paid by an employer can follow a paid-date rule on top of that.

[Mileage reimbursement and IRS mileage log](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/) applies the rate of each trip's period from the IRS table, and makes the log, at from $0.001. The spreadsheet is the better choice if you drive all year in one rate period and just need a running total, or if you want a log you format your own way.

## Per diem: how often do the rates change?

The IRS sets the special meals and incidental expenses rate for the transportation industry by notice, each for October 1 to September 30. The continental US rate was $66 a day under Notice 2020-71, $69 under Notice 2021-52 (from October 1, 2021) and $80 under Notice 2024-68 (from October 1, 2024). For 30 days away that is $1,980, $2,070 and $2,400.

What you must keep up to date: the rate for each travel date, every year, and the rule for a partial day. A sheet with one rate cell is right for one year at a time, and you have to notice when the new notice comes out.

[Trucker per diem worksheet](https://krishnachagti-sudo.github.io/toll-preview/trucker-per-diem/) picks the rate in force on each day and prints the worksheet, at from $0.02. The spreadsheet is the better choice for a quick estimate of one trip, or when your carrier already gives you a statement.

## The 1099 threshold: which year's rule applies?

The general reporting line for Forms 1099-NEC and 1099-MISC was $600 for payments in 2025 and is $2,000 for payments in 2026, and some boxes have different lines. A sheet that sums by payee and compares to one cell is right only if that cell holds the right year's figure for the right box.

[1099 threshold tracker](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/) checks each payee against the line for the payment year and box, at from $0.10. The spreadsheet is the better choice for a handful of payees, when you know the line, or when the file must not leave your machine.

## So which should you use?

- Use a spreadsheet for a one-off, simple count, for work offline, for figures that are your own, and when you have no budget. It costs nothing and you can see every cell.
- Use Endwise when the answer depends on a rule or rate for a date that someone else publishes and changes, when you want the source named next to the number, or when the job comes round only a few times a year and keeping a table current is the cost.
- Use both: let the sheet hold your data and bring the exact figure in by hand, or [from Excel](https://krishnachagti-sudo.github.io/toll-preview/guides/excel/). Per-use pricing is covered in [pay per use or a subscription](https://krishnachagti-sudo.github.io/toll-preview/guides/pay-per-use-or-subscription/). You get 5 free runs a day on each tool's page without an account, so you can compare with your sheet first.

## Sources

- [Microsoft: NETWORKDAYS function](https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7)
- [Microsoft: WORKDAY function](https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33)
- [Google Docs Editors Help: NETWORKDAYS](https://support.google.com/docs/answer/3092979?hl=en)
- [Google Docs Editors Help: GOOGLEFINANCE](https://support.google.com/docs/answer/3093281?hl=en)

## Questions

### Is a spreadsheet good enough for counting business days?

For a one-off count in a year you already have a holiday list for, yes. NETWORKDAYS and WORKDAY skip weekends and any holiday dates you give them, so the answer is only as good as the list.

### Why does a spreadsheet need a rate source for exchange rates?

A spreadsheet has no exchange rates of its own. You must supply them, from a lookup function or a table you maintain, and you must decide what to do for weekend and holiday dates.

### When is a spreadsheet the better choice?

When the job is a simple one-off, when you need to work offline, when the figures are your own, or when you have no budget for it.

### What do you get from Endwise that a sheet does not give?

The rule or rate for the date, taken from a named official source that the tool keeps up to date, with the working shown. Same input, same answer.

## Related

- [Business days in Excel: NETWORKDAYS](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-networkdays/)
- [Business days in Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/business-days/google-sheets-networkdays/)
- [Use Endwise in Excel](https://krishnachagti-sudo.github.io/toll-preview/guides/excel/)
- [Pay per use or a subscription](https://krishnachagti-sudo.github.io/toll-preview/guides/pay-per-use-or-subscription/)
- [Why AI assistants get numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/spreadsheet-or-endwise/  
Data as of: 2026-11-04
