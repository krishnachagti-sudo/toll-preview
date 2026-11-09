# Harvest and Everhour exports to invoice lines

Harvest's API names a time entry's date, client, project, task, person, notes and decimal hours; Everhour's reports carry the columns you choose, with time that may be written like "1h 45m". Both map onto the same invoice line: an Everhour-style sample of 4 entries becomes 2 task lines, each entry rounded up to 6 minutes at $75, totalling $600.00.

- Total: $600.00
- Lines: 2

## Harvest

Harvest's API v2 names these time entry fields; hours is decimal time tracked and rounded\_hours is the value used in summary reports and invoices, rounded by the Time Rounding setting in Preferences. Harvest's help center returned 403 when read, so no help-center wording is used.

| Harvest field | Read as |
| --- | --- |
| spent\_date | Date |
| client, project, task | Client, project, task |
| user | Person |
| notes | Description |
| hours | Time (decimal hours) |
| billable\_rate | Rate, when your card sets none |
| started\_time, ended\_time | Start and end, when tracked by times |

## Everhour

Everhour's help groups report columns (time and progress, financial, project and task, team) without a fixed heading list; you choose the columns, so map Date and Time if they are headed differently.

| Everhour column | Read as |
| --- | --- |
| Date | Date |
| Member | Person |
| Client, Project, Task | Client, project, task |
| Time | Time (1h 45m, 1:45 or 1.75) |
| Comment | Description |
| Billing rate | Rate, when headed Rate or Billable rate |

A column with another heading can be named in the tool's column map ("columns": { "duration": "Time spent" } over the API).

## Time formats

- Decimal hours: 1.75 is 1 hour 45 minutes.
- Clock: 1:45 is 1 hour 45 minutes; 1:45:30 adds 30 seconds.
- Words: 1h 45m, 45m or 2h.
- A decimal comma (1,75) is read as 1.75.

## Rows without time

Expense rows, subtotal rows and blank rows have no time, so they are skipped and listed by row number; add expenses to the invoice yourself.

The Everhour-style sample, one line per task at $75, each entry rounded up to 6 minutes.

| Line | Dates | Hours | Rate | Amount |
| --- | --- | ---: | ---: | ---: |
| App launch: Copywriting | Nov 2 to Nov 6, 2026; 3 entries | 7.10 | $75.00/h | $532.50 |
| App launch: Research | Nov 4, 2026; 1 entry | 0.90 | $75.00/h | $67.50 |

## Open the Harvest sample

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=2&source=harvest&group=task&inc=6&mode=nearest&level=line&rates=default%3D85%3Btask%3AProject+Management%3D65&run=1)

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Sources

- [Harvest API v2: Time entries (read November 8, 2026)](https://help.getharvest.com/api-v2/timesheets-api/timesheets/time-entries/)
- [Everhour Help: Columns in reports (updated October 22, 2026, read November 8, 2026)](https://support.everhour.com/article/511-columns-in-reports-how-to)

## Related

- [Harvest export to invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/harvest/)
- [Everhour vs this tool](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/vs/everhour/)
- [Decimal hours vs hh:mm](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/decimal-hours-conversion/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/harvest-everhour-exports/  
Data as of: 2026-11-08
