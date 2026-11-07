# FMLA tracking spreadsheet

For this page's absence log the rolling balance on November 10, 2026 is 88 hours; the sheet below has one line for each of its 60 days of leave, with the hours protected, the balance after and the day each hour comes back, and the same check in a spreadsheet is a SUMIFS over the 365 or 366 days before each date.

- Days of leave: 60
- Remaining: 88

## Make the sheet from your log

[Work out the balance](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/?asof=2026-11-10&weekly=40&method=rolling&used=2025-11-17+to+2025-11-21+8%7C2026-02-09+8%7C2026-03-16+8%7C2026-04-20+8%7C2026-06-01+to+2026-06-26+8%7C2026-08-03+to+2026-08-28+8%7C2026-09-14+4%7C2026-10-19+4&requested=2026-11-16+to+2026-11-27+8)

## The rolling formula

Columns: A employee, B date, C kind, D hours, E FMLA-protected hours. For the row in line 2:

```text
=SUMIFS(E:E, A:A, A2, B:B, ">"&EDATE(B2,-12), B:B, "<"&B2)
```

That is the hours used in the 12 months before the date (a February 29 looks back to the 28th). The balance is `=480-that` for a 40-hour week (12 x 40), and the protected hours that day are the smaller of the hours and the balance. For several employees, keep the employee column in the SUMIFS, as above.

## The sheet

The example log as the leave record CSV lays it out. Download it with the CSV link.

| Date | Kind | Hours | Protected | Left after | Returns on |
| --- | --- | ---: | ---: | ---: | --- |
| 2025-11-17 | leave | 8 | 8 | 472 | 2026-11-17 |
| 2025-11-18 | leave | 8 | 8 | 464 | 2026-11-18 |
| 2025-11-19 | leave | 8 | 8 | 456 | 2026-11-19 |
| 2025-11-20 | leave | 8 | 8 | 448 | 2026-11-20 |
| 2025-11-21 | leave | 8 | 8 | 440 | 2026-11-21 |
| 2026-02-09 | leave | 8 | 8 | 432 | 2027-02-09 |
| 2026-03-16 | leave | 8 | 8 | 424 | 2027-03-16 |
| 2026-04-20 | leave | 8 | 8 | 416 | 2027-04-20 |
| 2026-06-01 | leave | 8 | 8 | 408 | 2027-06-01 |
| 2026-06-02 | leave | 8 | 8 | 400 | 2027-06-02 |
| 2026-06-03 | leave | 8 | 8 | 392 | 2027-06-03 |
| 2026-06-04 | leave | 8 | 8 | 384 | 2027-06-04 |
| 2026-06-05 | leave | 8 | 8 | 376 | 2027-06-05 |
| 2026-06-08 | leave | 8 | 8 | 368 | 2027-06-08 |
| 2026-06-09 | leave | 8 | 8 | 360 | 2027-06-09 |
| 2026-06-10 | leave | 8 | 8 | 352 | 2027-06-10 |
| 2026-06-11 | leave | 8 | 8 | 344 | 2027-06-11 |
| 2026-06-12 | leave | 8 | 8 | 336 | 2027-06-12 |
| 2026-06-15 | leave | 8 | 8 | 328 | 2027-06-15 |
| 2026-06-16 | leave | 8 | 8 | 320 | 2027-06-16 |
| 2026-06-17 | leave | 8 | 8 | 312 | 2027-06-17 |
| 2026-06-18 | leave | 8 | 8 | 304 | 2027-06-18 |
| 2026-06-19 | leave | 8 | 8 | 296 | 2027-06-19 |
| 2026-06-22 | leave | 8 | 8 | 288 | 2027-06-22 |
| 2026-06-23 | leave | 8 | 8 | 280 | 2027-06-23 |
| 2026-06-24 | leave | 8 | 8 | 272 | 2027-06-24 |
| 2026-06-25 | leave | 8 | 8 | 264 | 2027-06-25 |
| 2026-06-26 | leave | 8 | 8 | 256 | 2027-06-26 |
| 2026-08-03 | leave | 8 | 8 | 248 | 2027-08-03 |
| 2026-08-04 | leave | 8 | 8 | 240 | 2027-08-04 |
| 2026-08-05 | leave | 8 | 8 | 232 | 2027-08-05 |
| 2026-08-06 | leave | 8 | 8 | 224 | 2027-08-06 |
| 2026-08-07 | leave | 8 | 8 | 216 | 2027-08-07 |
| 2026-08-10 | leave | 8 | 8 | 208 | 2027-08-10 |
| 2026-08-11 | leave | 8 | 8 | 200 | 2027-08-11 |
| 2026-08-12 | leave | 8 | 8 | 192 | 2027-08-12 |
| 2026-08-13 | leave | 8 | 8 | 184 | 2027-08-13 |
| 2026-08-14 | leave | 8 | 8 | 176 | 2027-08-14 |
| 2026-08-17 | leave | 8 | 8 | 168 | 2027-08-17 |
| 2026-08-18 | leave | 8 | 8 | 160 | 2027-08-18 |
| 2026-08-19 | leave | 8 | 8 | 152 | 2027-08-19 |
| 2026-08-20 | leave | 8 | 8 | 144 | 2027-08-20 |
| 2026-08-21 | leave | 8 | 8 | 136 | 2027-08-21 |
| 2026-08-24 | leave | 8 | 8 | 128 | 2027-08-24 |
| 2026-08-25 | leave | 8 | 8 | 120 | 2027-08-25 |
| 2026-08-26 | leave | 8 | 8 | 112 | 2027-08-26 |
| 2026-08-27 | leave | 8 | 8 | 104 | 2027-08-27 |
| 2026-08-28 | leave | 8 | 8 | 96 | 2027-08-28 |
| 2026-09-14 | leave | 4 | 4 | 92 | 2027-09-14 |
| 2026-10-19 | leave | 4 | 4 | 88 | 2027-10-19 |
| 2026-11-16 | requested | 8 | 8 | 80 | 2027-11-16 |
| 2026-11-17 | requested | 8 | 8 | 80 | 2027-11-17 |
| 2026-11-18 | requested | 8 | 8 | 80 | 2027-11-18 |
| 2026-11-19 | requested | 8 | 8 | 80 | 2027-11-19 |
| 2026-11-20 | requested | 8 | 8 | 80 | 2027-11-20 |
| 2026-11-23 | requested | 8 | 8 | 80 | 2027-11-23 |
| 2026-11-24 | requested | 8 | 8 | 72 | 2027-11-24 |
| 2026-11-25 | requested | 8 | 8 | 64 | 2027-11-25 |
| 2026-11-26 | requested | 8 | 8 | 56 | 2027-11-26 |
| 2026-11-27 | requested | 8 | 8 | 48 | 2027-11-27 |

> Worked out from the facts shown under 29 CFR Part 825. State family and medical leave laws are not covered; an employee who is not eligible under the FMLA may still have leave under state law. Not legal advice.

## Sources

- [29 CFR 825.200, Amount of leave (eCFR, current to November 2, 2026, read November 8, 2026)](https://www.ecfr.gov/current/title-29/section-825.200)
- [29 CFR 825.205, Increments of FMLA leave for intermittent or reduced schedule leave (eCFR, current to November 2, 2026, read November 8, 2026)](https://www.ecfr.gov/current/title-29/section-825.205)

## Questions

### What is the rolling 12-month formula for an FMLA tracker?

With dates in column B and FMLA hours in column E, the hours used before the date in B2 are =SUMIFS(E:E,B:B,"\>"&EDATE(B2,-12),B:B,"\<"&B2), and the balance is the entitlement minus that.

### Why does a hand-built FMLA tracker go wrong?

Usually the window: it must look back from each day leave is used, not from the start of a year, and hours over the balance are not FMLA-protected.

## Related

- [Rolling 12-month calculator](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/rolling-12-month-calculator/)
- [Intermittent leave calculator](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/intermittent-leave-calculator/)
- [The eligibility notice](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/eligibility-notice/)
- [AbsenceSoft alternative for small HR teams](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/vs/absencesoft/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/tracking-spreadsheet/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/tracking-spreadsheet.csv
