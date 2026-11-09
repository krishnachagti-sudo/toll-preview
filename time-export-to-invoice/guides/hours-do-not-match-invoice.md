# Hours that do not match the invoice

The export holds 25:21:35 (14 entries); 1 non-billable entry (0:40:00) and 2 entries before the invoice period (2:59:40) come off, leaving 21:41:55, and rounding each entry up to 15 minutes adds +1:48:05 to bill 23.50 h, $2,497.50.

- Tracked: 25:21:35
- Billed: 23.50 h

## Where the time went

The sample month, invoiced from November 3 with each entry rounded up to 15 minutes.

| Step | Entries | Time |
| --- | ---: | ---: |
| In the export | 14 | 25:21:35 |
| Not billable | -1 | -0:40:00 |
| Outside the invoice dates | -2 | -2:59:40 |
| On the invoice, exact | 11 | 21:41:55 |
| Rounding |  | +1:48:05 |
| Billed | 11 | 23:30:00 |

## The five checks

1. Rounding: per entry adds the most; compare it with per line and exact time in the tool's reconciliation.
2. Billable: a tracker report may count non-billable time that the invoice leaves out.
3. Dates: the invoice period, and an entry that starts before midnight on the last day.
4. Rates and currency: the rate each entry took is in the entries file; entries with no rate bill $0.
5. Duplicates and deletions: an entry exported twice bills twice; one deleted after export still bills.

Clockify adds a sixth: its invoices round each entry to two decimals of an hour first. See [why a Clockify invoice and report differ](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify-invoice-report-mismatch/).

## Reconcile the sample

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=0&group=task&inc=15&mode=up&level=entry&rates=task%3ADesign%3D90%3Btask%3ADevelopment%3D120%3Btask%3AMeetings%3D60&run=1&from=2026-11-03&to=2026-11-30)

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Steps

1. **Rounding.** Which increment, which direction, and per entry or per line.
2. **Billable filter.** Non-billable entries are usually left out.
3. **Dates.** The invoice period, and entries that cross midnight or a time zone boundary.
4. **Rates.** Which rate each entry took, and entries with none.
5. **Duplicates.** The same entry exported twice, or deleted in the tracker after export.

## Related

- [Clockify invoice and report mismatch](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify-invoice-report-mismatch/)
- [Rounding time on an invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/round-time-on-invoice/)
- [Decimal hours vs hh:mm](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/decimal-hours-conversion/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/hours-do-not-match-invoice/  
Data as of: 2026-11-08
