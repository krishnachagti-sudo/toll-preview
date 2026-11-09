# How time export to invoice works: entries to lines

Each entry is read to the second, rounded at the level you choose (each entry or each line) to 1, 5, 6, 10, 12, 15, 30, 60 minutes, up, nearest or down, priced from the most specific rate and grouped into lines; hours on a line are hundredths of an hour worked out from the seconds, and the reconciliation shows raw, rounded and billed time side by side.

## How does it work?

1. The CSV is read with its delimiter from the heading line; documented headings of each tracker are found by name.
2. Durations are read as h:mm:ss, h:mm, decimal hours or "1h 30m" to the whole second; start and end times alone give the time, across midnight.
3. Dates are ISO, or slash dates month first by default, day first when a value proves it; a file where every date is ambiguous is flagged.
4. Entries are filtered (non-billable left out unless kept, dates, client or project) and each gets its rate in the order task, tag, project, client, person.
5. Rounding uses the hours calculator's rule, at the chosen level; a line's hours are hundredths of an hour (36 seconds each) worked out from the seconds.

> Step 6, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/time-export-to-invoice/#what) below.

## What does it not cover?

- A file with nothing left after the filters is refused with the reason.
- It writes the invoice lines and files; it does not send invoices or change your tracker.
- Not tax or legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 12 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Uses no rates of its own: the rates are yours. The tracker facts were read on each tracker's own pages on 2026-11-08, and the pages are checked daily for changes.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check CSV reading, every duration and date form, the documented headings, rounding at each level, a sample month to the cent, Clockify's mismatch example, Harvest decimal hours, the rate order, grouping, filters, the retainer, discount, cap and tax, and that the files are the same each time.

- [Toggl Track: Creating invoices](https://support.toggl.com/creating-invoices-in-toggl-track), see the document, read 2026-11-08
- [Toggl Track: Detailed report](https://support.toggl.com/detailed-report), see the document, read 2026-11-08
- [Toggl Track: Rounding](https://support.toggl.com/rounding), see the document, read 2026-11-08
- [Toggl Track: Editing and uploading a CSV file](https://support.toggl.com/en/articles/2216070-editing-and-uploading-a-csv-file), see the document, read 2026-11-08
- [Clockify: Invoicing tracked time and expenses](https://clockify.me/help/projects/invoicing-tracked-time-expenses), see the document, read 2026-11-08
- [Clockify: Invoices and reports don't match](https://clockify.me/help/troubleshooting/rate-issues/invoices-dont-match), see the document, read 2026-11-08
- [Clockify: Time rounding](https://clockify.me/help/track-time-and-expenses/time-rounding), see the document, read 2026-11-08
- [Clockify: Pricing](https://clockify.me/pricing), see the document, read 2026-11-08
- [Toggl Track: Pricing](https://toggl.com/track/pricing/), see the document, read 2026-11-08
- [Harvest: Pricing](https://www.getharvest.com/pricing), see the document, read 2026-11-08
- [Harvest API v2: Time entries](https://help.getharvest.com/api-v2/timesheets-api/timesheets/time-entries/), see the document, read 2026-11-08
- [Everhour: Pricing](https://everhour.com/pricing), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the time export to invoice lines compute?

Upload the CSV export of Toggl Track, Clockify, Harvest, Everhour (or any sheet with a date and a duration) and the tool reads every entry, filters it, prices it from your rate card, rounds it the way your contract says and groups it into invoice lines, with a reconciliation of raw, rounded and billed time.

**In detail: operations, inputs and outputs**

The invoice adds a PDF and CSVs.

Operations (the op field):

- `preview`: Returns the answer, the totals, the reconciliation and the first three lines, without the entries.
- `invoice`: Returns every line, the totals, the reconciliation, every entry, the lines and entries CSVs and an invoice PDF. Corrections to the same invoice are free.

Inputs:

- `csv, source`: The export as text (up to 5,000 rows), and which tracker it comes from when the headings do not say.
- `columns, dateOrder`: The headings to use when the file's are not the documented ones, and the slash date order.
- `rates`: Rates by task, tag, project, client or person; the most specific one wins in that order.
- `rounding`: The increment (1, 5, 6, 10, 12, 15, 30, 60 minutes), the direction (up, nearest, down) and the level (each entry or each line).
- `groupBy, filters`: Lines by project, task, day, client, person, tag, description, entry or one line; non-billable entries, the dates, one client or project.
- `retainer, discount, cap, tax, client`: A prepaid block used line by line in date order, a discount, a not-to-exceed cap and tax, in that order, and the invoice details.

Outputs:

- answer: entries, raw time, lines, rounding rule, billed hours and total
- lines with dates, hours, rates and amounts; totals; reconciliation; flags
- invoice: entries, two CSVs and the PDF

**Every step in full (6) and the rules**

1. The CSV is read with its delimiter from the heading line; documented headings of each tracker are found by name.
2. Durations are read as h:mm:ss, h:mm, decimal hours or "1h 30m" to the whole second; start and end times alone give the time, across midnight.
3. Dates are ISO, or slash dates month first by default, day first when a value proves it; a file where every date is ambiguous is flagged.
4. Entries are filtered (non-billable left out unless kept, dates, client or project) and each gets its rate in the order task, tag, project, client, person.
5. Rounding uses the hours calculator's rule, at the chosen level; a line's hours are hundredths of an hour (36 seconds each) worked out from the seconds.
6. Lines are grouped and priced to the cent; then the retainer, the discount, the cap and the tax are applied in that order.

**Tracker formats.**

Each tracker's export headings, rounding options and invoicing behavior are read on its own help pages on 2026-11-08.

## Which edge cases does it handle?

**The edge cases (4)**

- Clockify's own mismatch example: rounding each entry to two decimals bills more than the exact time, and the reconciliation shows both.
- Rows that cannot be read are skipped and named; zero-length entries are flagged.
- More than 500 lines are refused with the way out (group more broadly).
- The PDF is the same bytes each time for the same input.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A month of Toggl entries at three rates, each entry rounded up to 15 minutes**

A month of Toggl entries at three rates, each entry rounded up to 15 minutes

| Result | Value |
| --- | --- |
| answer | Your 13 entries (24:41:35, 24.6931 h) become 3 invoice lines grouped by project and task, each entry rounded up to the next 15 minutes, billing 26.75 h and totalling $2,760.00. |

**The input**

```json
op: "preview"
source: "toggl"
csv: "User,Email,Client,Project,Task,Description,Billable,Start date,Start time,End date,End time,Duration,Tags\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Design,Homepage wireframes,Yes,2026-11-02,09:05:00,2026-11-02,11:12:30,02:07:30,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Meetings,Kickoff call,Yes,2026-11-02,13:00:00,2026-11-02,13:52:10,00:52:10,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Development,Theme setup,Yes,2026-11-03,09:30:00,2026-11-03,12:47:15,03:17:15,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Design,Product page mockups,Yes,2026-11-04,10:00:00,2026-11-04,12:31:40,02:31:40,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Development,Checkout fixes,Yes,2026-11-05,14:10:00,2026-11-05,18:02:05,03:52:05,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Meetings,Weekly check-in,Yes,2026-11-06,15:00:00,2026-11-06,15:21:00,00:21:00,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Development,Launch deploy,Yes,2026-11-09,22:40:00,2026-11-10,00:55:20,02:15:20,urgent\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Admin,Invoicing and email,No,2026-11-10,09:00:00,2026-11-10,09:40:00,00:40:00,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Design,Icon set,Yes,2026-11-12,09:15:00,2026-11-12,10:58:45,01:43:45,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Meetings,Review with client,Yes,2026-11-13,11:00:00,2026-11-13,11:47:30,00:47:30,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Development,Performance pass,Yes,2026-11-17,13:05:00,2026-11-17,16:44:50,03:39:50,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Design,Email templates,Yes,2026-11-19,09:00:00,2026-11-19,10:34:20,01:34:20,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Development,Bug fixes,Yes,2026-11-24,10:00:00,2026-11-24,11:06:10,01:06:10,\r\nSam Lee,sam@example.com,Acme Co,Website redesign,Meetings,Handover call,Yes,2026-11-25,16:00:00,2026-11-25,16:33:00,00:33:00,"
groupBy: "task"
rounding: {...}
rates: {...}
```

**More worked examples (1)**

**Clockify's own mismatch example**

Clockify's own mismatch example

| Result | Value |
| --- | --- |
| answer | Your 3 entries (5:01:05, 5.0181 h) become 3 invoice lines grouped by time entry (one line each), not rounded, billing 5.02 h and totalling $502.00. |

**The input**

```json
{
  "op": "preview",
  "source": "clockify",
  "csv": "Project,Description,Start date,Start time,Duration,Billable\r\nClient work,Entry 1,2026-11-02,09:00,1:15:45,Yes\r\nClient work,Entry 2,2026-11-03,09:00,2:45:30,Yes\r\nClient work,Entry 3,2026-11-04,09:00,0:59:50,Yes\r\n",
  "groupBy": "entry",
  "rates": {
    "default": "100"
  }
}
```

## How is it tested?

**What its test suite asserts (3)**

- Tracker facts are as read on their own pages on 2026-11-08.
- Every duration and date form is read to the second; rounding per entry, per line and on the total are shown side by side.
- The sample month, Clockify's mismatch example and Harvest decimal hours are reproduced to the cent.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Time export to invoice lines tool](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/).

## Questions

### Is there any AI in the time export to invoice lines answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the time export to invoice lines refuse to answer?

A file with nothing left after the filters is refused with the reason. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Time export to invoice lines tool](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/time-export-to-invoice/  
Data as of: 2026-11-04
