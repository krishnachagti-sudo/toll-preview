# ACH and wire transfers: how many business days, and which ones count

A standard ACH payment settles the next banking day, and a Same Day ACH payment settles the day it is sent if it meets one of the 3 FedACH deadlines (10:30 a.m., 2:45 p.m. or 4:45 p.m. Eastern). Weekends and Federal Reserve holidays do not count: a next-day ACH sent on Wednesday, November 25, 2026 settles on Friday, November 27, 2026, after Thanksgiving.

## Add business days from a send date

[Add in the tool](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-11-25&days=1)

## How long does a standard ACH payment take?

One banking day. The Federal Reserve's FedACH schedule settles items that are not same-day at 8:30 a.m. Eastern on the next banking day (or a later settlement date the sender chose). A file sent late on a Friday therefore settles on Monday, or later if Monday is a Federal Reserve holiday ([FedACH processing schedule](https://www.frbservices.org/resources/resource-centers/same-day-ach/fedach-processing-schedule.html)).

## What are the Same Day ACH deadlines?

FedACH has 3 same-day windows. A file received by the deadline settles that afternoon or evening, Eastern time:

| File deadline (ET) | Settles (ET), same day |
| --- | --- |
| 10:30 a.m. | 1:00 p.m. |
| 2:45 p.m. | 5:00 p.m. |
| 4:45 p.m. | 6:00 p.m. |

Each payment must be $1 million or less to go same day ([Nacha](https://www.nacha.org/same-day-ach)). These are the network's deadlines; your bank or payroll provider usually needs the file earlier, so ask for its own cutoff.

## How long does a wire transfer take?

A Fedwire funds transfer settles the day it is sent, within the funds-transfer business day: from 9:00 p.m. Eastern the calendar day before to 7:00 p.m. Eastern. Saturdays, Sundays and the Federal Reserve Banks' holidays are not funds-transfer business days, so a wire sent then waits for the next one ([Fedwire operating hours](https://www.frbservices.org/resources/financial-services/wires/operating-hours.html)).

## When does a next-day ACH settle around the holidays?

| Sent | Which day | Settles (next banking day) | Next federal business day |
| --- | --- | --- | --- |
| Wed, Nov 25, 2026 | the day before Thanksgiving | Fri, Nov 27, 2026 | [Fri, Nov 27, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-11-25&days=1) |
| Thu, Dec 24, 2026 | Christmas Eve | Mon, Dec 28, 2026 | [Mon, Dec 28, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-12-24&days=1) |
| Thu, Dec 31, 2026 | New Year's Eve | Mon, Jan 4, 2027 | [Mon, Jan 4, 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-12-31&days=1) |
| Fri, Jan 15, 2027 | the Friday before Martin Luther King Jr. Day | Tue, Jan 19, 2027 | [Tue, Jan 19, 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2027-01-15&days=1) |
| Thu, Jun 17, 2027 | the day before the Juneteenth Friday | Fri, Jun 18, 2027 | [Mon, Jun 21, 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2027-06-17&days=1) |
| Fri, Jul 2, 2027 | the Friday before Independence Day (observed) | Tue, Jul 6, 2027 | [Tue, Jul 6, 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2027-07-02&days=1) |

The two columns differ only around Friday, June 18, 2027: federal offices are closed, but the Reserve Banks are open, so the payment settles that Friday.

## Checklist before you promise a date

- Count from the day the file reaches the network, not the day the customer pressed pay.
- Skip Saturdays, Sundays and Federal Reserve holidays.
- Watch the Fridays the Reserve Banks open while federal offices close ([Federal Reserve holidays 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/federal-reserve-holidays-2027/)).
- Add the days your bank or the receiving bank takes to post the funds, which the network schedule does not cover.

## Sources

- [Federal Reserve Financial Services: FedACH processing schedule](https://www.frbservices.org/resources/resource-centers/same-day-ach/fedach-processing-schedule.html)
- [Nacha: Same Day ACH](https://www.nacha.org/same-day-ach)
- [Federal Reserve Financial Services: Fedwire Funds Service operating hours](https://www.frbservices.org/resources/financial-services/wires/operating-hours.html)
- [Federal Reserve: Holidays observed by the Federal Reserve System (K.8)](https://www.federalreserve.gov/aboutthefed/k8.htm)

## Steps

1. **Find the send day.** Note the day the payment file reaches the ACH network or the wire is sent, in Eastern time.
2. **Check the deadline.** For Same Day ACH, check it made a FedACH same-day deadline (10:30 a.m., 2:45 p.m. or 4:45 p.m. ET); your bank may need it earlier.
3. **Count banking days.** For next-day ACH, move to the next banking day: skip Saturdays, Sundays and Federal Reserve holidays, but not the Fridays the Reserve Banks open for a Saturday holiday.
4. **Check the result.** Run the dates in the business days tool; on a Friday federal offices take off for a Saturday holiday, the Reserve Banks are open, so settle on that Friday instead.

## Questions

### Do ACH payments settle on weekends?

No. FedACH settles on banking days, which are Monday to Friday except Federal Reserve holidays. A payment sent on a Friday for next-day settlement settles on Monday, or Tuesday if Monday is a holiday.

### What is the Same Day ACH limit?

Nacha raised the Same Day ACH limit to $1 million per payment in 2022. Larger payments go as next-day ACH or by wire.

### When does Fedwire open and close?

A Fedwire funds-transfer business day starts at 9:00 p.m. Eastern the calendar day before and ends at 7:00 p.m. Eastern. Saturdays, Sundays and Federal Reserve holidays are not funds-transfer business days.

### Does an ACH payment settle on Friday, June 18, 2027?

Yes. Federal offices close that Friday for Juneteenth, which falls on a Saturday, but the Reserve Banks are open, so a next-day ACH sent on Thursday, June 17, 2027 settles on Friday, June 18, 2027.

## Related

- [Federal Reserve bank holidays 2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/federal-reserve-holidays-2027/)
- [Business days vs working days vs banking days](https://krishnachagti-sudo.github.io/toll-preview/business-days/business-vs-working-vs-banking-days/)
- [How long is 3 business days?](https://krishnachagti-sudo.github.io/toll-preview/business-days/how-long-is-3-business-days/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/ach-wire-transfer-business-days/  
Data as of: 2026-11-06
