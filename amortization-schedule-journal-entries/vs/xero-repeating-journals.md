# Compared with Xero repeating journals

A Xero repeating journal posts the same lines each month, which fits the $6,000.00 lease prepayment ($500.00 every month); the policy starting on the 20th by actual days posts $66.00, then $186.00, $186.00 and so on, which a repeating journal cannot do without editing each one.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AOffice+lease+prepayment%2CPrepaid%2C6000.00%2C2026-11-01%2C12%2C%2C%2C%2C620%2C469%2C%2C%2C%2C%2C%2C%2C%2C%0D%0AInsurance+from+the+20th%2CPrepaid%2C2190.00%2C2026-11-20%2C%2C2027-11-19%2Cdaily%2C%2C620%2C433%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-11&from=2026-11&to=2027-11&format=xero)

## Side by side

Xero's side from Xero Central, read November 8, 2026

|  | Xero repeating journal | This tool |
| --- | --- | --- |
| What it does | automatically create journals in a weekly or monthly series, for a specified period | Every month's entries for many schedules, as import files |
| Amounts that change | Edited by hand; Xero: if the journal will be the same each time it's recorded, set the repeating journal to Post. | Computed per month (actual days, half-month, loans) |
| Month ends | If you choose a month-end date, Xero records the journals at the end of each month. | Dated at each month end (loan payments on their dates) |
| Mistakes | If repeating journals are set to Post, they can't be voided in bulk. | Nothing is posted until you import; fix the rows and run again free |
| Cost | Included in Xero | $0.50 per schedule |

## When repeating journals are better

- One schedule with identical monthly amounts: a repeating journal is free and enough.
- You want Xero to post on its own with no import each month.

## When this tool is

- Amounts that change by month: mid-month starts, actual days, loan interest.
- Many schedules: one import file instead of a repeating journal per item.
- Watch out for: "if you roll back the next journal date, Xero creates a new set of journals in addition to your existing ones".

## Sources

- [Xero Central: Set up a repeating journal (read November 8, 2026)](https://central.xero.com/s/article/Set-up-a-repeating-journal)
- [Xero Central: Add, import and post manual journals (US) (read November 8, 2026)](https://central.xero.com/s/article/Add-import-and-post-manual-journals-US)

## Related

- [The import file layout](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/journal-entry-import-layout/)
- [QuickBooks recurring journal compared](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/quickbooks-recurring-journal/)
- [Daily vs monthly proration](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/daily-vs-monthly-proration/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/xero-repeating-journals/  
Data as of: 2026-11-08
