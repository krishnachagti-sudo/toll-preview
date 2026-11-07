# Business days, working days and banking days

Business days and working days both mean Monday to Friday minus public holidays; banking days are the days banks settle payments, which in the US follow the Federal Reserve's calendar. They can differ: from June 14, 2027 to June 25, 2027 there are 9 US federal business days, 10 banking days and 10 working days in England and Wales.

## Count business days in a range

[Count in the tool](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=US&start=2027-06-13&end=2027-06-25)

## What is a business day?

A weekday that is not a public holiday. In the US the usual holiday list is the 11 federal holidays in [5 U.S.C. 6103](https://www.law.cornell.edu/uscode/text/5/6103), each moved to the Friday or Monday when it falls on a weekend. That is the US calendar this tool counts.

## What is a working day?

The same idea, in British usage: a weekday that is not a bank holiday. In England and Wales the bank holidays come from the Banking and Financial Dealings Act 1971 and royal proclamations ([GOV.UK](https://www.gov.uk/bank-holidays)). Scotland and Northern Ireland have different lists.

## What is a banking day?

A day the payment system settles. In the US, the Federal Reserve Banks close on the federal holidays, but when a holiday falls on a Saturday they stay open on the Friday before ([K.8](https://www.federalreserve.gov/aboutthefed/k8.htm)). So a banking day count can be higher than a federal business day count.

## The same ranges counted three ways

| Range (start not counted) | US business days | US banking days | England and Wales working days |
| --- | ---: | ---: | ---: |
| [June 13, 2027 to June 25, 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=US&start=2027-06-13&end=2027-06-25) | 9 | 10 | 10 |
| [December 19, 2027 to December 31, 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=US&start=2027-12-19&end=2027-12-31) | 8 | 10 | 8 |

In June, Juneteenth falls on Saturday, June 19, 2027: federal offices close on Friday, June 18, the Reserve Banks open, and England and Wales has no holiday. In late December, the US loses Friday, December 24 and Friday, December 31 to observed holidays while the Reserve Banks stay open, and England and Wales loses Monday 27 and Tuesday 28 December to substitute days.

## Which one should you use?

- Payments, ACH and wires: banking days.
- Delivery estimates, refunds and support SLAs: business days in the country the work happens in, plus your own closures.
- Contracts and legal deadlines: whatever the contract or rule defines; see counting a notice period.

[Counting business days in a contract notice](https://krishnachagti-sudo.github.io/toll-preview/business-days/contract-notice-business-days/) covers the last case.

## Sources

- [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103)
- [Federal Reserve: Holidays observed by the Federal Reserve System (K.8)](https://www.federalreserve.gov/aboutthefed/k8.htm)
- [GOV.UK: UK bank holidays](https://www.gov.uk/bank-holidays)
- [Banking and Financial Dealings Act 1971](https://www.legislation.gov.uk/ukpga/1971/80)

## Questions

### Is a working day the same as a business day?

Usually yes. Both mean a weekday that is not a public holiday. "Working day" is the common British term, "business day" the common American one. A contract or law can define either more narrowly, and that definition wins.

### Are Saturdays business days?

Not in the usual meaning, or in this tool: weekends are Saturday and Sunday. Some carriers deliver on Saturdays, and some contracts count them; check the definition you are working to.

### Are bank holidays business days?

No. In England and Wales bank holidays are not working days, and in the US the Federal Reserve holidays are not banking days.

### When do banking days and federal business days differ in the US?

On a Friday federal offices take off for a holiday that falls on a Saturday: the Reserve Banks stay open. In 2027 that is June 18, 2027, December 24, 2027 and December 31, 2027.

## Related

- [Federal Reserve bank holidays 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/federal-reserve-holidays-2027/)
- [How many business days do ACH and wires take?](https://krishnachagti-sudo.github.io/toll-preview/business-days/ach-wire-transfer-business-days/)
- [Counting business days in a contract notice](https://krishnachagti-sudo.github.io/toll-preview/business-days/contract-notice-business-days/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/business-vs-working-vs-banking-days/  
Data as of: 2026-11-06
