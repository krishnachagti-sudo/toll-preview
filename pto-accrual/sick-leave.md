# Sick leave accrual calculator

At 1 hour per 30 worked, a part-time employee working 22 hours a week earns 3.18 sick hours a month and 38.13 hours over 2027, under Minnesota's 48 hours yearly limit; at 30 hours a week the limit is reached in week 49 (the week ending December 10, 2027).

## Work out one employee

[Work out the balances](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/?place=MN&freq=biweekly&first=2027-01-08&hours=44&periods=26)

## 22 hours a week in each place

Part-time employee, 22 hours a week through 2027 on a weekly payroll: sick hours earned and the week accrual stops

| Place | Rate | Earned a week | Earned in 2027 | Cap reached |
| --- | --- | ---: | ---: | --- |
| [Alaska](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/alaska/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Arizona](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/arizona/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [California](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/california/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Colorado](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/colorado/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Connecticut](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/connecticut/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [District of Columbia](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/district-of-columbia/) | 1 per 37 | 0.59 | 30.92 | not reached |
| [Illinois](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/illinois/) | 1 per 40 | 0.55 | 28.6 | not reached |
| [Maine](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/maine/) | 1 per 40 | 0.55 | 28.6 | not reached |
| [Maryland](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/maryland/) | 1 per 30 | 0.73 | 37.4 | not reached |
| [Massachusetts](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/massachusetts/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Michigan](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/michigan/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Minnesota](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/minnesota/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [New Jersey](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/new-jersey/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [New York](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/new-york/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Oregon](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/oregon/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Vermont](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/vermont/) | 1 per 52 | 0.42 | 22 | not reached |
| [Virginia](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/virginia/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Washington](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/washington/) | 1 per 40 | 0.55 | 28.6 | not reached |
| [Los Angeles, CA](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/city/los-angeles/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Montgomery County, MD](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/city/montgomery-county-md/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [New York City, NY](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/city/new-york-city/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Philadelphia, PA](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/city/philadelphia/) | 1 per 40 | 0.55 | 28.6 | not reached |
| [Saint Paul, MN](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/city/saint-paul/) | 1 per 30 | 0.73 | 38.13 | not reached |
| [Seattle, WA](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/city/seattle/) | 1 per 30 | 0.73 | 38.13 | not reached |

Earning stops only where the place lets the employer cap the year or the balance; with no cap stated, the hours keep adding up.

## The formula

```text
sick hours earned = floor(hours worked this year / rate, to 0.001 hour)
balance = carried over + earned (up to the cap) - used
```

> Worked out from each state's or city's own published text, quoted with the date we read it. Not legal advice. The limits shown are the most an employer may apply; your written policy, a union contract or a local ordinance can give more. Places whose official sites we could not read are listed as not covered rather than guessed.

## Steps

1. **Count the hours worked.** Add the hours actually worked in the plan year so far, overtime included where the law counts it.
2. **Divide by the rate.** Divide by the law's hours per sick hour (30 in most places, 40 in Washington, Illinois, Maine, Philadelphia).
3. **Apply the cap.** Stop at the yearly accrual limit or the balance cap the law lets the employer apply.
4. **Subtract what was used.** The balance is what was earned and carried over, less the hours used.

## Questions

### How do I calculate sick leave for part-time employees?

Multiply the hours actually worked by the place's rate (1/30 in most places), then apply the yearly or balance cap the law allows. Part-time employees earn at the same rate per hour worked.

## Related

- [Paid sick leave laws by state](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave-laws-by-state/)
- [PTO hours per paycheck in a spreadsheet](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/excel/)
- [Separate PTO and sick banks](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/separate-pto-and-sick-leave/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/  
Data as of: 2026-11-09
