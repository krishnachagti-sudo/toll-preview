# Clockify invoice and report totals don't match

Clockify's invoice rounds each of the 3 entries to two decimals before multiplying by the rate, so it shows $502.00 against the report's $501.81 for the same 5:01:05 at $100 an hour, a $0.19 gap. Clockify's help page prints the report as $501.08, which does not match its own 5:01:05 x $100.

- Invoice: $502.00
- Report: $501.81
- Difference: $0.19

## Clockify's example, entry by entry

At $100 an hour. Hundredths of an hour are 36 seconds each, rounded half up.

| Entry | Time | Exact hours | To 2 decimals | Invoice amount |
| --- | --- | ---: | ---: | ---: |
| Entry 1 | 1:15:45 | 1.2625 | 1.26 | $126.00 |
| Entry 2 | 2:45:30 | 2.7583 | 2.76 | $276.00 |
| Entry 3 | 0:59:50 | 0.9972 | 1.00 | $100.00 |

Report: 5:01:05 is 5.0181 hours, x $100 = $501.81. Invoice: 1.26 + 2.76 + 1.00 = 5.02 hours, x $100 = $502.00. Clockify's page gives the invoice as $502.00 (it agrees) and the report as $501.08 with a $0.92 gap; 5:01:05 at $100 is $501.81, so the gap is $0.19.

## On a month of entries

The sample month's 13 entries at $60 to $120 an hour: each entry to two decimals gives $2,571.60, the exact time $2,570.88, a $0.72 gap. The gap grows with the number of entries, and can go either way.

## Reconcile it

- Decide which rule the client is billed by, and say it on the invoice.
- For the report's total, bill exact time: choose "Exact time x rate" under line amounts in the tool.
- For Clockify's invoice total, make one line per entry: each line is that entry to two decimals x its rate.
- Rounding set in Clockify's workspace changes both; the reconciliation table shows each method side by side.

## Open Clockify's example

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=1&source=clockify&group=entry&inc=&rates=default%3D100&run=1)

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Sources

- [Clockify Help: Invoices and reports don't match (read November 8, 2026)](https://clockify.me/help/troubleshooting/rate-issues/invoices-dont-match)
- [Clockify Help: Invoicing tracked time and expenses (read November 8, 2026)](https://clockify.me/help/projects/invoicing-tracked-time-expenses)
- [Clockify Forum: Incorrect report totals (November 2022)](https://forum.clockify.me/t/incorrect-report-totals/1906)

## Questions

### Why do my Clockify invoice and report totals differ?

Invoices round each time entry to 2 decimals before multiplying by the rate; reports calculate the total time first, then multiply.

### Which total is right?

Both follow a rule. The report bills the exact time; the invoice bills each entry to the nearest hundredth of an hour. Agree one with the client; the tool shows both and lets the lines bill either.

## Related

- [Clockify export to invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify/)
- [My hours do not match the invoice: five checks](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/hours-do-not-match-invoice/)
- [Decimal hours vs hh:mm](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/decimal-hours-conversion/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify-invoice-report-mismatch/  
Data as of: 2026-11-08
