# Decimal hours vs hh:mm

1:20 is 80 minutes, which is 1.3333 hours (80 / 60), not 1.2; an invoice that reads 20 entries of 1:20 as 1.2 hours underbills $266.67 at $100 an hour. Convert minutes by dividing by 60, then multiply the hours by the rate.

- 1:20 in hours: 1.3333
- Underbilled: $266.67

## The mistake, in 5-minute steps

A duration, the right decimal hours, the decimal it is misread as, and what that misreading costs per entry at $100 an hour.

| h:mm | Hours | Misread as | Per entry at $100 |
| --- | ---: | ---: | ---: |
| 0:05 | 0.08 | 0.05 | $3.00 |
| 0:10 | 0.17 | 0.10 | $7.00 |
| 0:15 | 0.25 | 0.15 | $10.00 |
| 0:20 | 0.33 | 0.20 | $13.00 |
| 0:25 | 0.42 | 0.25 | $17.00 |
| 0:30 | 0.50 | 0.30 | $20.00 |
| 0:35 | 0.58 | 0.35 | $23.00 |
| 0:40 | 0.67 | 0.40 | $27.00 |
| 0:45 | 0.75 | 0.45 | $30.00 |
| 0:50 | 0.83 | 0.50 | $33.00 |
| 0:55 | 0.92 | 0.55 | $37.00 |
| 1:00 | 1.00 | 1.00 | $0.00 |

For every minute from 1 to 60, the [minutes to decimal hours chart](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/minutes-to-decimal-chart/) on the hours calculator has the decimals.

## How it adds up

20 entries of 1:20 are 26:40, which is 26.6667 hours; read as 1.2 each they are 24.00. At $100 an hour that is $2,666.67 against $2,400.00.

## Multiplying by the rate

- Add up the time first, then convert to hours, then multiply by the rate.
- Rounding each entry to two decimals first (Clockify's invoice method) moves the total by a few cents per entry.
- Show hours to two decimals on the invoice, and say if they are rounded.

## Convert a whole export

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=0&group=task&inc=15&mode=up&level=entry&rates=task%3ADesign%3D90%3Btask%3ADevelopment%3D120%3Btask%3AMeetings%3D60&run=1)

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Questions

### Is 1 hour 20 minutes 1.2 hours?

No. It is 1.3333 hours: 80 minutes divided by 60.

## Related

- [Minutes to decimal hours chart](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/minutes-to-decimal-chart/)
- [Clockify invoice and report mismatch](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/clockify-invoice-report-mismatch/)
- [Harvest and Everhour columns](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/harvest-everhour-exports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/decimal-hours-conversion/  
Data as of: 2026-11-08
