# A later delivery estimate for backordered items

Yes: give backordered items more processing days, as a range. For an order on Monday, March 1, 2027 at 10:00 am by Priority Mail, an in-stock item with 1 processing day arrives Thursday, March 4 to Friday, March 5; a backordered item with 10 to 15 processing days arrives Wednesday, March 17 to Thursday, March 25.

## Work out your backorder range

[Work out the delivery date](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/?op=delivery-date&order=2027-03-01T10%3A00&service=priority-mail&tz=America%2FNew_York&ship=mon%2Ctue%2Cwed%2Cthu%2Cfri&processing=10&cutoff=14%3A00)

## In stock vs backorder, side by side

Ordered Monday, March 1, 2027 at 10:00 am Eastern, a store that ships Monday to Friday with a 2:00 pm Eastern cutoff, USPS Priority Mail.

| Item | Processing days | Ships | Arrives |
| --- | --- | --- | --- |
| In stock | 1 | Tue, Mar 2 | Thu, Mar 4 to Fri, Mar 5 |
| Backorder | 10 to 15 | Mon, Mar 15 to Mon, Mar 22 | Wed, Mar 17 to Thu, Mar 25 |

## The API request

```json
{
  "op": "delivery-date",
  "orderAt": "2027-03-01T10:00",
  "timeZone": "America/New_York",
  "cutoff": "14:00",
  "processingDays": 10,
  "processingDaysMax": 15,
  "carrier": "usps",
  "service": "priority-mail"
}
```

The answer has `ships.earliest`, `ships.latest`, `arrives.earliest` and `arrives.latest`: here 2027-03-17 and 2027-03-25.

## What to tell the customer

- Say it is on backorder before checkout, next to the date.
- Give the ships-by range as well as the arrives-by range.
- If the restock date slips, tell the customer and offer a cancel.

> The FTC Mail, Internet, or Telephone Order Merchandise Rule sets what you must do when you cannot ship within the time you stated; read the FTC's business guide for the details. This is not legal advice.

## Sources

- [FTC: Business guide to the Mail, Internet, or Telephone Order Merchandise Rule](https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule)
- [USPS: Mail and shipping services, delivery times (read Saturday, October 31, 2026)](https://www.usps.com/ship/mail-shipping-services.htm)

## Steps

1. **Pick the processing range.** Set the fewest and most shipping days you need before the item can ship: for a backorder, the days until restock plus your usual handling.
2. **Work out the range.** Run the calculator with processingDays and processingDaysMax; it returns the earliest and latest ship and arrival dates.
3. **Show it per variant.** Show the in-stock estimate on in-stock variants and the backorder range on backordered ones, so the cart never mixes them silently.
4. **Update when the restock date moves.** Rerun it when the supplier changes the restock date.

## Questions

### What if the cart has in-stock and backordered items?

Use the backorder estimate for the order unless you ship the in-stock items first; then show both dates, one per shipment.

### Can I give a range instead of one date?

Yes. The calculator takes a range of processing days and returns the earliest and latest ship and arrival dates.

## Related

- [Why delivery dates go wrong after the cutoff](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/delivery-date-after-cutoff/)
- [Christmas order deadline banner](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/christmas-order-deadline-banner/)
- [Delivery date calculator](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/backorder-delivery-estimate/  
Data as of: 2026-11-06
