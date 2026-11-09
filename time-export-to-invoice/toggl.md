# Toggl Track export to invoice lines

Toggl Track's own invoices give one line per project from a Summary report or one per time entry from a Detailed report, and on the Free plan the PDF carries the Toggl logo. Export the Detailed report as CSV instead and open it in the tool: a sample month of 13 billable entries (24:41:35) becomes 3 task lines at $90, $120 and $60 an hour, each entry rounded up to 15 minutes, totalling $2,760.00.

- Total: $2,760.00
- Entries: 13
- Billed: 26.75 h

## Open the sample month

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=0&source=toggl&group=task&inc=15&mode=up&level=entry&rates=task%3ADesign%3D90%3Btask%3ADevelopment%3D120%3Btask%3AMeetings%3D60&run=1)

## What Toggl's own invoices do

- From a Summary report each line shows the project name, total time and total amount; from a Detailed report each time entry is listed separately.
- Invoices created by users on the Free plan will have the Toggl logo on the downloaded PDF file.
- The invoice layout, template, and font (style or size) cannot be changed.
- There is no built-in way to mark time entries on an invoice as paid.
- Generated invoices are not saved in the Track app.

## The columns the tool reads

Toggl's CSV import guide names these headings and says the easiest way to see how a CSV should look is to export a Detailed report to CSV.

| Field | What the lines use it for |
| --- | --- |
| Email | The person, when there is no name column |
| User | Group by person; a rate per person |
| Client | Group by client; a rate per client; keep one client |
| Project | Group by project; a rate per project |
| Task | Group by project and task; a rate per task |
| Description | Group by description, or listed under each line |
| Billable | Non-billable entries are left out (or kept, if you choose) |
| Start date | The service date of each entry and line |
| Start time | Start and end on one-line-per-entry invoices |
| Duration | The time billed, to the second |
| Tags | Group by tag; a rate per tag |

## The sample month as invoice lines

13 billable entries, 24:41:35 exact; one admin entry marked not billable is left out.

| Line | Dates | Hours | Rate | Amount |
| --- | --- | ---: | ---: | ---: |
| Website redesign: Design | Nov 2 to Nov 19, 2026; 4 entries | 8.50 | $90.00/h | $765.00 |
| Website redesign: Meetings | Nov 2 to Nov 25, 2026; 4 entries | 3.25 | $60.00/h | $195.00 |
| Website redesign: Development | Nov 3 to Nov 24, 2026; 5 entries | 15.00 | $120.00/h | $1,800.00 |

Rounding each entry up to 15 minutes bills 26.75 hours for 24.6931 tracked. Toggl's own rounding offers 1, 5, 6, 10, 12, 15 or 30 minutes, 1 hour or 4 hours (rounding is a paid plan feature.); Each time entry has the rounding setting applied to it separately; for grouped entries the entries in a group are totalled as is and the rounding is applied to that subtotal.

The same entries billed each way

| Method | Hours | Amount |
| --- | ---: | ---: |
| Exact time, no rounding | 24.69 | $2,570.88 |
| Each entry rounded up to the next 15 minutes | 26.75 | $2,760.00 |
| Each line rounded up to the next 15 minutes | 25.00 | $2,595.00 |
| The total rounded up to the next 15 minutes | 25.00 | $2,595.00 |

## One dated line per day

Clients who ask for dates get one line per day: the same month gives 13 dated lines and the same $2,760.00, because the rounding is still per entry.

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Sources

- [Toggl Track: Creating invoices in Toggl Track (updated August 5, 2026, read November 8, 2026)](https://support.toggl.com/creating-invoices-in-toggl-track)
- [Toggl Track: Detailed report (updated August 5, 2026, read November 8, 2026)](https://support.toggl.com/detailed-report)
- [Toggl Track: Editing and uploading a CSV file (updated June 16, 2026, read November 8, 2026)](https://support.toggl.com/en/articles/2216070-editing-and-uploading-a-csv-file)
- [Toggl Track: Rounding (updated July 21, 2026, read November 8, 2026)](https://support.toggl.com/rounding)
- [Toggl Track: Pricing (read November 8, 2026)](https://toggl.com/track/pricing/)

## Steps

1. **Set the duration format.** In your Toggl profile, set Duration format to Improved, so durations export as hours, minutes and seconds.
2. **Open the Detailed report.** Pick the client or project and the dates you are billing for.
3. **Export CSV.** Use Export in the upper right and choose CSV (a paid plan feature in Toggl).
4. **Open it here.** Open the file in the tool; it reads Start date, Start time, Duration, Project, Task, Description, Tags and Billable.
5. **Choose lines, rounding and rates.** One line per project, task or day; round each entry or each line; give a rate per task, project or tag.
6. **Make the invoice.** Check the lines and the reconciliation, then download the PDF and the lines CSV.

## Questions

### Can Toggl Track make invoices on the free plan?

Yes, from a report. Toggl's help says: "Invoices created by users on the Free plan will have the Toggl logo on the downloaded PDF file."

### Can I export a CSV from Toggl's free plan?

No. Toggl's Detailed report help says CSV and Excel exports are a paid plan feature.

### How are Toggl invoice lines grouped?

From a Summary report each line shows the project name, total time and total amount; from a Detailed report each time entry is listed separately.

### Can a Toggl invoice show the date on each line?

Not from a Summary report, which gives one line per project. Group by day in this tool to print one dated line per day: the sample month gives 13 dated lines.

## Related

- [Clockify export to invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify/)
- [Harvest export to invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/harvest/)
- [Toggl vs Clockify vs Harvest invoicing](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/toggl-vs-clockify-vs-harvest-invoicing/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/toggl/  
Data as of: 2026-11-08
