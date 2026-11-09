# A WARN spreadsheet vs this checker

A WARN spreadsheet needs, for every site and every separation date, the full-time losses in the 30 days and the 90 days from that date: with dates in column A, sites in B and full-time losses in C, the 30-day total is =SUMIFS(C:C,B:B,B2,A:A,"\>="&A2,A:A,"\<="&A2+29), and the 90-day one uses A2+89; this checker does both, plus 10 state laws, from the list.

- 30-day window end: A2+29

## Skip the formulas

[Check these sites](https://krishnachagti-sudo.github.io/toll-preview/warn-act-checker/?sites=Fresno+plant%2C+CA%2C+160%2C+20%7CAlbany+office%2C+NY%2C+90%2C+0%7CDallas+warehouse%2C+TX%2C+120%2C+0%2C+closing&losses=2027-01-15%2C+Fresno+plant%2C+40%2C+5%7C2027-02-05%2C+Fresno+plant%2C+15%2C+0%7C2027-01-29%2C+Albany+office%2C+30%2C+0%7C2027-03-01%2C+Dallas+warehouse%2C+48%2C+0&cft=400&cpt=40&notice=2026-12-01)

## The formulas

```text
30-day losses from this date at this site:
=SUMIFS(C:C, B:B, B2, A:A, ">="&A2, A:A, "<="&A2+29)
90-day losses:
=SUMIFS(C:C, B:B, B2, A:A, ">="&A2, A:A, "<="&A2+89)
Mass layoff test (D = full-time at the site):
=OR(AND(E2>=50, E2>=0.33*D2), E2>=500)
```

## Where sheets go wrong

- Counting part-time staff (under 20 hours on average, or under 6 of 12 months) in the federal numbers (20 CFR 639.3(h)).
- Measuring the window from the start of a month instead of from each separation date.
- Counting remote staff at home instead of at their home-base site (639.3(i)(6)).
- Using federal numbers in a state with its own law: 25 and 33% in New York, 50 statewide in Washington, any closure in California.

## When a spreadsheet is enough

One site, one date, in a state with no law of its own: the test is two comparisons and a date 60 days back. A sheet you already keep is fine for that.

> Worked out from the counts and dates shown under 20 CFR Part 639 and the state sources listed. Whether locations are one single site, whether an exception applies and who the employer is are facts for you and your counsel. Not legal advice.

## Sources

- [20 CFR Part 639, Worker Adjustment and Retraining Notification (eCFR, up to date as of November 5, 2026, last amended October 24, 2016, read November 8, 2026)](https://www.ecfr.gov/current/title-20/chapter-V/part-639)
- [U.S. Department of Labor, Employer's Guide to Advance Notice of Closings and Layoffs (read November 8, 2026)](https://www.dol.gov/sites/dolgov/files/ETA/Layoff/pdfs/_EmployerWARN2003.pdf)

## Related

- [Adding up over 90 days](https://krishnachagti-sudo.github.io/toll-preview/warn-act-checker/guides/aggregation/)
- [Federal threshold test](https://krishnachagti-sudo.github.io/toll-preview/warn-act-checker/guides/federal-threshold/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/warn-act-checker/vs/spreadsheet/  
Data as of: 2026-11-08
