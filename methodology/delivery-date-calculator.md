# How delivery dates are calculated: method and sources

A delivery date is found by walking two calendars in turn: the store's shipping days for the cutoff and processing days, then the carrier's delivery days for transit. USPS delivers Monday to Saturday and closes on postal holidays, which are not the days a store observes as federal holidays, so the two calendars differ. Dates run from 2020 to 2035.

## What does the delivery date and holiday order-by calculator compute?

Given when an order is placed, the tool says when it is received, when it ships and when it arrives. Given a date the parcel must arrive by, it says the last moment to order. A third operation lists the carrier's closed days and published send-by dates for a year.

Operations (the op field):

- `delivery-date`: From an order time, the store's time zone, cutoff, shipping days, closures and processing days, and a carrier and service, returns received, ships (earliest and latest), arrives (earliest and latest), the days skipped by name and a plain-words list of steps.
- `order-by`: From a date the parcel must arrive by (deliverBy) or the carrier's own send-by date (sendBy), returns for each USPS service the last order date and the exact instant, with the steps and whether it is still possible at asOf.
- `calendar`: For a year (2020 to 2035) and carrier usps or federal, returns the closed days by name, and for USPS the published holiday send-by dates.

Inputs:

- `orderAt, timeZone, cutoff`: The order time (a store wall-clock time like 2026-12-11T15:12, or an instant with Z or an offset), an IANA zone like America/New\_York and a 24-hour cutoff like 14:00, or null for none.
- `shipDays, closures, federalHolidays`: The weekdays the store ships (default Monday to Friday), its own closures and whether it observes federal holidays.
- `processingDays, processingDaysMax`: Whole shipping days between receiving an order and handing it over (0 to 60), as a range if you give both.
- `carrier, service, transitDays`: usps with a service name, or other with your own delivery days, transit days and holiday rule.

Outputs:

- received, ships and arrives dates
- steps: each step in words
- skipped: each holiday or closure passed, by name and by which calendar
- validUntil: the instant after which the order falls to the next shipping day

## How is it calculated, step by step?

1. The order time is read on the store's wall clock in its time zone. A time without an offset is taken as store time. A wall-clock time skipped by a daylight-saving change is resolved to the hour before it, so a cutoff is never later than the store meant.
2. The order is received on the order day if that day is a shipping day and the time is before the cutoff. Otherwise it is received on the next shipping day. With no cutoff, an order counts as received on its day if that is a shipping day.
3. Processing days are whole shipping days after the day received. 0 ships the same day. A range gives an earliest and a latest handover.
4. The handover is the first day, from the end of processing, on which the store ships and the carrier accepts parcels.
5. Transit days are carrier delivery days counted after the handover day. For USPS the minimum and maximum come from the delivery times on its services page, unless you give your own.
6. Every holiday or closure passed on either calendar is recorded by name in skipped, and every step is written out in steps.
7. For the last-order date the walk runs backward. If the target is the date USPS's holiday table says delivery is before (25 December in 2026) or the day before it, the published send-by date for the service is the limit. Otherwise the tool finds the latest handover whose slowest transit still arrives by the target. It then steps back over the longest processing time on the store calendar, and the cutoff on that day is the last moment to order.

**Two calendars, never one.**

The store ships on its chosen weekdays, not on its own closures and, if it follows them, not on the US federal holidays as OPM observes them (a Saturday holiday is a Friday off).

USPS delivers Monday to Saturday and closes on postal holidays. Those do not follow OPM's observed Fridays: USPS is open with normal delivery on the Friday before a Saturday holiday and closed on the Saturday, and a Sunday holiday closes the Monday. Priority Mail Express delivers every day.

## Which edge cases does it handle?

- After the cutoff: an order at 3:12 pm with a 2 pm cutoff is received on the next shipping day.
- Holidays by name: an order placed the afternoon before Thanksgiving skips Thanksgiving Day on the store calendar and says so.
- Different weekends: a store that ships Monday to Friday and a carrier that delivers on Saturday are walked separately.
- A range of processing or transit days gives an earliest and a latest date rather than one guess.
- If the store and the carrier share no open day in the next 400 days (or the 400 days before the target), the tool refuses and says so.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**An order after the cutoff**

```json
{
  "op": "delivery-date",
  "orderAt": "2026-12-11T15:12",
  "timeZone": "America/New_York",
  "cutoff": "14:00",
  "processingDays": 1,
  "carrier": "usps",
  "service": "ground-advantage"
}
```

An order after the cutoff

| Result | Value |
| --- | --- |
| received | 2026-12-14 |
| ships | 2026-12-15 |
| arrives | 2026-12-17 to 2026-12-21 |
| skipped | none |

**Thanksgiving skipped by name**

```json
{
  "op": "delivery-date",
  "orderAt": "2026-11-25T16:30",
  "timeZone": "America/Chicago",
  "cutoff": "12:00",
  "processingDays": 1,
  "carrier": "usps",
  "service": "priority-mail"
}
```

Thanksgiving skipped by name

| Result | Value |
| --- | --- |
| received | 2026-11-27 |
| ships | 2026-11-30 |
| arrives | 2026-12-02 to 2026-12-03 |
| skipped | Thanksgiving Day (2026-11-26, store calendar) |

**The last order for Christmas 2026 by USPS Ground Advantage**

```json
{
  "op": "order-by",
  "deliverBy": "2026-12-24",
  "timeZone": "America/New_York",
  "cutoff": "14:00",
  "processingDays": 1,
  "carrier": "usps",
  "destination": "contiguous",
  "asOf": "2026-11-02T09:00"
}
```

The last order for Christmas 2026 by USPS Ground Advantage

| Result | Value |
| --- | --- |
| carrier send-by date | 2026-12-17 |
| last handover | 2026-12-17 |
| last order | Wednesday, December 16, 2026, 2:00 pm EST |

## What does it not do?

- Published USPS data is for the 2026 season only (read 2026-10-31). UPS and FedEx tables are not included, because both pages refused automated reading; for another carrier you give the carrier's own transit days, delivery days or send-by date.
- USPS delivery times are the ranges the carrier states for each service. The tool does not predict delays.
- The store calendar covers weekdays, your closures and federal holidays. It does not model per-product lead times or weekend processing.
- Dates must fall between 2020 and 2035; others are refused.
- Defaults when you give nothing: America/New\_York, a 14:00 cutoff, shipping Monday to Friday, federal holidays observed and 1 processing day.

## Where does the data come from, and how fresh is it?

USPS send-by dates, postal holidays and delivery times were read from the USPS pages on 2026-10-31. The federal holiday rules come from the business days tool, last changed 2026-10-30.

- [USPS: 2026 Holiday Shipping Deadlines](https://www.usps.com/holiday/holiday-shipping-dates.htm)
- [USPS Newsroom: Holidays and events (postal holidays)](https://about.usps.com/newsroom/events/)
- [USPS: Mail and shipping services](https://www.usps.com/ship/mail-shipping-services.htm)
- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Every USPS 2026 send-by date and weekday is compared with the USPS page as recorded, and the postal-holiday rule must give exactly the closures USPS lists. USPS delivery times are compared with its services page, and the missing UPS and FedEx tables are checked to be absent, with the reason recorded.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the Delivery date and holiday order-by calculator tool](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/).

## Questions

### Is there any AI in the delivery date and holiday order-by calculator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the delivery date and holiday order-by calculator refuse to answer?

Published USPS data is for the 2026 season only (read 2026-10-31). UPS and FedEx tables are not included, because both pages refused automated reading; for another carrier you give the carrier's own transit days, delivery days or send-by date. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Delivery date and holiday order-by calculator tool](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [USPS holiday shipping deadlines 2026](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/holiday-shipping-deadlines-2026/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/delivery-date-calculator/  
Data as of: 2026-11-04
