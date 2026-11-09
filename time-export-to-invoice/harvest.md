# Harvest export to invoice lines

Harvest's pricing page lists invoicing on its Free, Teams and Enterprise plans (Free is 1 seat, 2 projects), and its API says rounded\_hours is the value used in summary reports and invoices. To bill time from a Harvest export with your own lines and rates, open it here: 5 decimal-hour entries (7.6300 h) become 2 task lines, each line rounded to the nearest 6 minutes, totalling $630.50.

- Total: $630.50
- Entries: 5
- Lines: 2

## Open the Harvest sample

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=2&source=harvest&group=task&inc=6&mode=nearest&level=line&rates=default%3D85%3Btask%3AProject+Management%3D65&run=1)

## The fields Harvest names

Harvest's API v2 names these time entry fields; hours is decimal time tracked and rounded\_hours is the value used in summary reports and invoices, rounded by the Time Rounding setting in Preferences. Harvest's help center returned 403 when read, so no help-center wording is used.

| Field | What the lines use it for |
| --- | --- |
| spent\_date | The service date |
| client | Group by client; a rate per client; keep one client |
| project | Group by project; a rate per project |
| task | Group by project and task; a rate per task |
| user | Group by person; a rate per person |
| notes | The description |
| hours | The time billed (decimal hours) |
| rounded\_hours | Not used: your rounding is applied to hours instead |
| billable | Non-billable entries are left out (or kept, if you choose) |
| billable\_rate | The rate, when your rate card does not set one |
| started\_time | Start time on entry lines |
| ended\_time | End time on entry lines |

## Harvest's own rounding example, checked

The API docs show 2.11 hours as 2.25 rounded hours and 1.35 as 1.5. Rounding up to 15 minutes gives exactly that: 2.11 to 2.25 and 1.35 to 1.50.

## The sample as invoice lines

Decimal hours from a Harvest-style export, each line rounded once to the nearest 6 minutes.

| Line | Dates | Hours | Rate | Amount |
| --- | --- | ---: | ---: | ---: |
| Brand refresh: Design | Nov 2 to Nov 9, 2026; 3 entries | 6.50 | $85.00/h | $552.50 |
| Brand refresh: Project Management | Nov 5 to Nov 12, 2026; 2 entries | 1.20 | $65.00/h | $78.00 |

The same entries billed each way

| Method | Hours | Amount |
| --- | ---: | ---: |
| Exact time, no rounding | 7.63 | $625.55 |
| Each entry rounded to the nearest 6 minutes | 7.70 | $630.50 |
| Each line rounded to the nearest 6 minutes | 7.70 | $630.50 |
| The total rounded to the nearest 6 minutes | 7.70 | $630.50 |

Harvest's own invoices are the simpler choice for time tracked in Harvest. The tool is for a layout or rate card Harvest's invoice does not give you, or time from more than one tracker; [Everhour and other exports](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/harvest-everhour-exports/) map the same way.

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Sources

- [Harvest API v2: Time entries (read November 8, 2026)](https://help.getharvest.com/api-v2/timesheets-api/timesheets/time-entries/)
- [Harvest: Invoicing (read November 8, 2026)](https://www.getharvest.com/invoicing)
- [Harvest blog: Rounding up incremental billing (January 5, 2010) (updated January 5, 2010, read November 8, 2026)](https://www.getharvest.com/blog/2010/01/rounding-up-incremental-billing)
- [Harvest: Pricing (read November 8, 2026)](https://www.getharvest.com/pricing)

## Questions

### Does Harvest have invoicing on the free plan?

Yes. Harvest's pricing page lists invoicing on Free, which is 1 seat, 2 projects; Teams is $9 a seat a month billed annually (read November 8, 2026).

### What rounding options does Harvest offer?

A Harvest blog post of January 5, 2010 lists rounding to nearest, or rounding up to 6, 15 or 30 minutes, on export and invoicing. Today the API docs say rounded\_hours follows the Time Rounding setting in Preferences.

## Related

- [Toggl Track export to invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/toggl/)
- [Clockify export to invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify/)
- [Toggl vs Clockify vs Harvest invoicing](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/toggl-vs-clockify-vs-harvest-invoicing/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/harvest/  
Data as of: 2026-11-08
