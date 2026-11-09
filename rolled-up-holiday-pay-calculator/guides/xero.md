# Rolled-up holiday pay in Xero

Xero does not calculate rolled-up holiday pay from timesheets: a request for it on Xero's ideas board had 42 votes and the status "Gaining Support" on 8 November 2026; this calculator adds the line to a payroll CSV instead, £151.51 for the 4 eligible workers in the example.

- Votes on the request: 42
- Holiday pay in the example: £151.51

## One worker's line

[Work out the holiday pay](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/?pay=509.60&hours=35.5)

## What Xero's ideas board says

The request, posted 24 April 2025, asks Xero to calculate rolled-up holiday pay from timesheets and show it as a separate payslip line. On 8 November 2026 it had 42 votes; Xero's last response (26 September 2025) said it was up to the community to support it. Commenters describe working the figure out by hand each week. [The request on Xero's site](https://productideas.xero.com/forums/967118-payroll-expenses/suggestions/49797191-uk-payroll-in-timesheets-automatically-calculat).

## A workflow

1. Export the pay run's workers with the period end, hours and pay for the work (a total column, or basic and overtime columns).
2. Run the file through the calculator: it adds holiday\_pay\_rate, rolled\_up\_holiday\_pay, accrued\_holiday\_hours and payslip\_line to every row.
3. Enter each rolled\_up\_holiday\_pay amount as its own pay line on that worker's payslip, so it shows as a separate item, and pay it in the same run.
4. Keep the output file: from 6 April 2026 holiday pay records are kept for 6 years.

## The example file

```csv
worker,period_end,worker_type,hours,basic,overtime
Sample A,2026-11-06,zero-hours,22,281.60,
Sample B,2026-11-06,zero-hours,35.5,454.40,55.20
Sample C,2026-11-06,term-time,30,384.00,
Sample D,2026-11-06,regular,37.5,480.00,
Sample E,2026-11-06,casual,6.25,80.00,
```

Result: 4 of 5 worker rows get a rolled-up holiday pay line: £151.51 in all on £1,255.20 of pay, and 12 hours of holiday accrued; 1 row is not allowed rolled-up pay.

> Worked out under GOV.UK's guidance for Great Britain; Northern Ireland has its own rules and is not covered. Whether a worker is an irregular-hours or part-year worker depends on the contract. Not legal advice.

## Sources

- [GOV.UK (Department for Business and Trade), Holiday pay and entitlement reforms from 1 January 2024 (updated 1 April 2024, read 8 November 2026)](https://www.gov.uk/government/publications/simplifying-holiday-entitlement-and-holiday-pay-calculations/holiday-pay-and-entitlement-reforms-from-1-january-2024)
- [Xero Product Ideas: UK Payroll - In timesheets, automatically calculate Rolled Up Holiday Pay (read 8 November 2026)](https://productideas.xero.com/forums/967118-payroll-expenses/suggestions/49797191-uk-payroll-in-timesheets-automatically-calculat)
- [GOV.UK, Holiday entitlement: Holiday pay (updated 5 November 2026, read 8 November 2026)](https://www.gov.uk/holiday-entitlement-rights/holiday-pay)

## Questions

### Does Xero calculate rolled-up holiday pay?

Not from timesheets as of 8 November 2026: the ideas-board request "UK Payroll - In timesheets, automatically calculate Rolled Up Holiday Pay" had 42 votes and the status "Gaining Support".

## Related

- [Spreadsheet or calculator](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/vs/spreadsheet/)
- [Record keeping from 6 April 2026](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/guides/record-keeping-2026/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/guides/xero/  
Data as of: 2026-11-08
