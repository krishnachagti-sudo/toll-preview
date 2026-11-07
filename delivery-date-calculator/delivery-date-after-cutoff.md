# Why delivery dates go wrong for Friday orders after the cutoff

An order 1 minute after a 2:00 pm Friday cutoff is received on the next shipping day, not Friday: for an order on Friday, January 15, 2027 that is Tuesday, January 19, because the weekend and Martin Luther King Jr. Day come first. With 1 processing day it ships Wednesday, January 20 instead of Tuesday, January 19, and arrives Friday, January 22 to Tuesday, January 26 by Ground Advantage.

## Run your own edge case

[Work out the delivery date](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/?op=delivery-date&order=2027-01-15T14%3A01&service=ground-advantage&tz=America%2FNew_York&ship=mon%2Ctue%2Cwed%2Cthu%2Cfri&processing=1&cutoff=14%3A00)

## What are the usual causes?

- The cutoff is compared in the wrong time zone, often the visitor's browser or a server in UTC.
- Processing days are counted as calendar days, so a weekend counts as processing.
- Holidays are missing from the store calendar or the carrier calendar.
- The store and carrier calendars are treated as one: USPS delivers on Saturdays and on some Fridays federal offices take off.

## Test cases around Martin Luther King Jr. Day 2027

a store that ships Monday to Friday with a 2:00 pm Eastern cutoff, 1 processing day, USPS Ground Advantage.

| Order | Received | Ships | Arrives |
| --- | --- | --- | --- |
| Friday, 1 minute before the cutoff | Fri, Jan 15 | Tue, Jan 19 | Thu, Jan 21 to Mon, Jan 25 |
| Friday, 1 minute after the cutoff | Tue, Jan 19 | Wed, Jan 20 | Fri, Jan 22 to Tue, Jan 26 |
| Friday, 1:30 pm Pacific (4:30 pm Eastern) | Tue, Jan 19 | Wed, Jan 20 | Fri, Jan 22 to Tue, Jan 26 |
| Saturday morning | Tue, Jan 19 | Wed, Jan 20 | Fri, Jan 22 to Tue, Jan 26 |
| Sunday evening | Tue, Jan 19 | Wed, Jan 20 | Fri, Jan 22 to Tue, Jan 26 |
| Monday, Martin Luther King Jr. Day | Tue, Jan 19 | Wed, Jan 20 | Fri, Jan 22 to Tue, Jan 26 |

Paste these into your own estimate and check each row. If one differs, the cause list above usually names it.

## What the calculator shows for each order

- Ordered Friday, January 15, 2027 at 2:01 pm EST; that is after the 2:00 pm cutoff, so it is received on the next shipping day, Tuesday, January 19, 2027.
- 1 processing day on the store's calendar (the store ships Monday to Friday, not on federal holidays) puts the handover on Wednesday, January 20, 2027.
- USPS Ground Advantage takes 2 to 5 days (USPS's stated delivery time), counted on the carrier's calendar (USPS delivers Monday to Saturday, not on postal holidays): it arrives between Friday, January 22, 2027 and Tuesday, January 26, 2027.
- Skipped on the way: Monday, January 18, Birthday of Martin Luther King Jr. (store's calendar).

## Sources

- [USPS Newsroom: Holidays and events (read Saturday, October 31, 2026)](https://about.usps.com/newsroom/events/)
- [USPS: Mail and shipping services, delivery times (read Saturday, October 31, 2026)](https://www.usps.com/ship/mail-shipping-services.htm)
- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)

## Steps

1. **Use the store's clock.** Compare the order time with the cutoff in the store's time zone, not the visitor's or the server's.
2. **Move the received day.** After the cutoff, or on a day the store does not ship, the order is received on the next shipping day.
3. **Count processing on the store calendar.** Skip the store's non-shipping days and holidays while processing.
4. **Count transit on the carrier calendar.** Skip the days the carrier does not deliver, which are not always the store's days off.
5. **Test the edges.** Run the cases on this page before you publish: Friday after the cutoff, a visitor in another time zone, Saturday, Sunday and a Monday holiday.

## Questions

### Why does my estimate jump by 3 or 4 days on Friday afternoon?

After the Friday cutoff the order is received on Monday, or Tuesday when Monday is a holiday, so the whole estimate moves past the weekend. That is correct, and customers see it as a jump.

### Whose time zone decides the cutoff?

The store's. An order at 1:30 pm Pacific is 4:30 pm Eastern, after a 2:00 pm Eastern cutoff.

### Does USPS deliver on Martin Luther King Jr. Day?

No. It is a federal and postal holiday, so it is skipped on both calendars.

## Related

- [Different estimates for backorder items](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/backorder-delivery-estimate/)
- [Christmas order deadline banner](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/christmas-order-deadline-banner/)
- [USPS postal holidays 2027](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/usps-postal-holidays-2027/)
- [Delivery date calculator](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/delivery-date-after-cutoff/  
Data as of: 2026-11-06
