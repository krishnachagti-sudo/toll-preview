# Spreadsheet pivot vs this tool

A pivot table adds up each task's durations, which rounds nothing until you add formulas: on the sample month, rounding each entry up to 15 minutes bills 26.75 hours ($2,760.00), while rounding the pivot's task totals bills 25.00 ($2,595.00). The spreadsheet is free; this tool does both ways for $0.40 an invoice.

- Rounded per entry: 26.75
- Rounded per line: 25.00

## The pivot in Google Sheets

Google's help gives the steps: select the cells with the source data, Insert, Pivot table, then add Project and Task under Rows and Duration under Values (summed).

## The formulas you add

A duration such as 2:07:30 is a fraction of a day in a spreadsheet. Times 24 is decimal hours; a ceiling of a quarter rounds up to 15 minutes. Put these in helper columns before the pivot to round each entry:

```text
=D2*24                  decimal hours
=CEILING(D2*24, 0.25)   each entry rounded up to 15 minutes
=ROUND(F2*G2, 2)        hours x rate, to the cent
```

Rounding the pivot's totals instead rounds each line once, which bills less. The difference on the sample month:

The sample month, billed each way

| Method | Hours | Amount |
| --- | ---: | ---: |
| Exact time, no rounding | 24.69 | $2,570.88 |
| Each entry rounded up to the next 15 minutes | 26.75 | $2,760.00 |
| Each line rounded up to the next 15 minutes | 25.00 | $2,595.00 |
| The total rounded up to the next 15 minutes | 25.00 | $2,595.00 |

## When the spreadsheet is better

- You want full control of the layout and keep your own invoice template.
- You invoice rarely and the formulas are already set up.
- You need a calculation this tool does not do.

## When this tool is better

- The same export layout every month, with the rounding level and rates chosen once in a link.
- Rates per task, tag, project, client or person, with a line per rate.
- A reconciliation of exact against billed time, and an entries file showing how each entry was rounded.

## Open the sample month

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=0&group=task&inc=15&mode=up&level=entry&rates=task%3ADesign%3D90%3Btask%3ADevelopment%3D120%3Btask%3AMeetings%3D60&run=1)

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Sources

- [Google Docs Editors Help: Create & use pivot tables (read November 8, 2026)](https://support.google.com/docs/answer/1272900)

## Related

- [Rounding time on an invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/round-time-on-invoice/)
- [Decimal hours vs hh:mm](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/decimal-hours-conversion/)
- [Timesheet invoice template](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/timesheet-invoice-template/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/vs/spreadsheet-pivot/  
Data as of: 2026-11-08
