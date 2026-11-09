# Clockify export to invoice lines

Clockify invoicing is a paid feature on the Standard plan ($5.49 a seat a month billed annually, read November 8, 2026) and up, and its Free plan exports reports as PDF only. From a Detailed report CSV (Basic, $3.99) the tool makes the lines instead: the sample month's 13 entries, each rounded to the nearest 6 minutes, become 3 task lines totalling $2,589.00.

- Total: $2,589.00
- Standard plan: $5.49 a seat a month
- Lines: 3

## Open the sample month

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=0&source=clockify&group=task&inc=6&mode=nearest&level=entry&rates=task%3ADesign%3D90%3Btask%3ADevelopment%3D120%3Btask%3AMeetings%3D60&run=1)

## What Clockify includes, plan by plan

Clockify's pricing page, read November 8, 2026. Per seat per month.

| Plan | Billed annually | Billed monthly | For invoicing |
| --- | ---: | ---: | --- |
| Free | $0 | $0 | up to 5 users; reports export as PDF |
| Basic | $3.99 | $4.99 | per seat per month; CSV and Excel export, billable rates |
| Standard | $5.49 | $6.99 | per seat per month; invoicing, time rounding, QuickBooks |
| Pro | $7.99 | $9.99 | per seat per month |

- Invoicing is a paid feature on the Standard, Pro or Enterprise plan.
- Detailed report export is in PDF on the Free plan, CSV or Excel on Basic or higher.
- Only uninvoiced, billable time entries and expenses can be imported.
- Workspace rounding can be applied on import, to each time entry, not just the final total.

## The columns the tool reads

Clockify's Detailed report help lists these fields (also approver and currency) without the exact heading text; its timesheet import guide spells Email, Start date, Start time, Duration, Project, Client, Task, Description, Tag and Billable.

| Field | What the lines use it for |
| --- | --- |
| Project | Group by project; a rate per project |
| Client | Group by client; a rate per client; keep one client |
| Description | Group by description, or listed under each line |
| Task | Group by project and task; a rate per task |
| User | Group by person; a rate per person |
| Email | The person, when there is no name column |
| Tags | Group by tag; a rate per tag |
| Billable | Non-billable entries are left out (or kept, if you choose) |
| Start date | The service date of each entry and line |
| Start time | Start and end on one-line-per-entry invoices |
| End date | Overnight entries |
| End time | Overnight entries; end times on entry lines |
| Duration | The time billed, to the second |
| Billable rate | The rate, when your rate card does not set one |
| Billable amount | Not used: amounts are worked out again from the time |

Durations can be Clock HH:mm or Decimal (such as 01:30 or 1.5), set per workspace; both are read.

## The sample month as invoice lines

Each entry rounded to the nearest 6 minutes (a tenth of an hour).

| Line | Dates | Hours | Rate | Amount |
| --- | --- | ---: | ---: | ---: |
| Website redesign: Design | Nov 2 to Nov 19, 2026; 4 entries | 7.90 | $90.00/h | $711.00 |
| Website redesign: Meetings | Nov 2 to Nov 25, 2026; 4 entries | 2.70 | $60.00/h | $162.00 |
| Website redesign: Development | Nov 3 to Nov 24, 2026; 5 entries | 14.30 | $120.00/h | $1,716.00 |

The same entries billed each way

| Method | Hours | Amount |
| --- | ---: | ---: |
| Exact time, no rounding | 24.69 | $2,570.88 |
| Each entry rounded to the nearest 6 minutes | 24.90 | $2,589.00 |
| Each line rounded to the nearest 6 minutes | 24.80 | $2,580.00 |
| The total rounded to the nearest 6 minutes | 24.80 | $2,580.00 |

Each entry to two decimals then times the rate, Clockify's invoice method, gives $2,571.60 on the exact times; the report method gives $2,570.88. [Why the two differ](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify-invoice-report-mismatch/).

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Sources

- [Clockify Help: Invoicing tracked time and expenses (read November 8, 2026)](https://clockify.me/help/projects/invoicing-tracked-time-expenses)
- [Clockify Help: Detailed report (read November 8, 2026)](https://clockify.me/help/track-time/detailed-report)
- [Clockify Help: Import data into Clockify (read November 8, 2026)](https://clockify.me/help/getting-started/import-timesheets)
- [Clockify Help: Time rounding (read November 8, 2026)](https://clockify.me/help/track-time-and-expenses/time-rounding)
- [Clockify Help: Invoices and reports don't match (read November 8, 2026)](https://clockify.me/help/troubleshooting/rate-issues/invoices-dont-match)
- [Clockify: Pricing (read November 8, 2026)](https://clockify.me/pricing)

## Steps

1. **Open the Detailed report.** Filter it to the client and the dates you are billing for.
2. **Export CSV.** Export, then CSV (Basic plan or higher in Clockify; the Free plan exports PDF).
3. **Open it here.** The tool reads Start date, Start time, Duration (clock or decimal), Project, Client, Task, Description, Tags, Billable and the billable rate.
4. **Choose lines, rounding and rates.** Clockify's Single item, Detailed and Grouped layouts are one line for everything, one line per entry, and one line per project, person or day here.
5. **Reconcile and make the invoice.** Check the two-decimals-per-entry line against the exact total, then download the PDF and CSVs.

## Questions

### Is Clockify invoicing free?

No. Clockify's help says: "Invoicing is a paid feature on the Standard, Pro or Enterprise plan."

### How can I group Clockify time on an invoice?

Single item (all hours and expenses on one line), Detailed (each time entry or expense on its own line) or Grouped by project, user or date, with subgroups. Here the same choices are one line for everything, one line per entry, or one line per project, person or day, and also per task, tag or client.

### Does Clockify round each entry or the total?

Each entry is rounded first, then the rounded durations are added together; reports, exports and earnings use the rounded values; the underlying data is not changed.

### Why does my Clockify invoice not match the report?

Invoices round each time entry to 2 decimals before multiplying by the rate; reports calculate the total time first, then multiply. On Clockify's own three entries at $100 an hour that is $502.00 against $501.81.

## Related

- [Why a Clockify invoice and report differ](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify-invoice-report-mismatch/)
- [Toggl Track export to invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/toggl/)
- [Toggl vs Clockify vs Harvest invoicing](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/toggl-vs-clockify-vs-harvest-invoicing/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify/  
Data as of: 2026-11-08
