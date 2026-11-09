# Spreadsheet vs calculator for 12.07%

In a spreadsheet, 12.07% of pay in cell B2 is =ROUND(B2\*12.07%,2), so £364.70 gives £44.02; GOV.UK's worked steps are =ROUND(ROUND(B2/100,2)\*12.07,2), which gives £44.06, and accrued hours are =ROUND(C2\*12.07%,0).

- £364.70 at 12.07%: £44.02
- GOV.UK steps: £44.06

## Check a spreadsheet figure

[Work out the holiday pay](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/?pay=364.70)

## The formulas

```text
Holiday pay line:   =ROUND(B2*12.07%,2)
GOV.UK steps:       =ROUND(ROUND(B2/100,2)*12.07,2)
Accrued hours:      =ROUND(C2*12.07%,0)
Enhanced rate:      =ROUND(W/(52-W)*100,2)   (W = weeks of holiday)
```

Excel: ROUND(number, num\_digits); "To always round up (away from zero), use the ROUNDUP function." Google Sheets: ROUND(value, \[places\]), which rounds a number to a certain number of decimal places according to standard rules.

## Where sheets go wrong

- Basic pay in the formula instead of total pay: GOV.UK bases the line on total pay in the pay period.
- Rounding the hours down always (ROUNDDOWN): GOV.UK rounds 30 minutes or more up.
- The wrong rate for a longer contract: 35 days on a 5-day week is 7 weeks, 15.56%.
- A regular-hours worker left in the list: rolled-up pay is not allowed for them.
- A different answer each run from copied formulas; the calculator gives the same answer for the same file.

## When a spreadsheet is enough

When you pay five workers on the statutory 12.07% and check the formulas once. With more rows, other rates, eligibility checks or the 52-week average, the calculator saves the checking.

A payroll CSV costs $0.02 a worker row (at least $0.25 a file), and a re-run of the same rows within 30 days is free; one worker at a time is free on the page.

> Worked out under GOV.UK's guidance for Great Britain; Northern Ireland has its own rules and is not covered. Whether a worker is an irregular-hours or part-year worker depends on the contract. Not legal advice.

## Sources

- [Microsoft Support, ROUND function (read 8 November 2026)](https://support.microsoft.com/en-us/office/round-function-c018c5d8-40fb-4053-90b1-b3e7f61a213c)
- [Google Docs Editors Help, ROUND function (read 8 November 2026)](https://support.google.com/docs/answer/3093440?hl=en)
- [GOV.UK (Department for Business and Trade), Holiday pay and entitlement reforms from 1 January 2024 (updated 1 April 2024, read 8 November 2026)](https://www.gov.uk/government/publications/simplifying-holiday-entitlement-and-holiday-pay-calculations/holiday-pay-and-entitlement-reforms-from-1-january-2024)

## Questions

### What is the Excel formula for 12.07% holiday pay?

=ROUND(B2\*12.07%,2), with the period's total pay in B2. For accrued hours, =ROUND(C2\*12.07%,0) with the hours worked in C2.

### Does Excel ROUND round half up?

Microsoft's example: =ROUND(2.15, 1) gives 2.2. For pay and hours, which are positive, that is half up, as GOV.UK's 30-minute rule needs.

## Related

- [Rolled-up holiday pay in Xero](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/guides/xero/)
- [12.07% of pay table](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/12-07-percent-of-pay-table/)
- [Shiftbase and rolled-up holiday pay](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/vs/shiftbase/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/vs/spreadsheet/  
Data as of: 2026-11-08
