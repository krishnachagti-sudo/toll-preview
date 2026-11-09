# AWD auto-replenishment and the low-inventory fee

Amazon waives the low-inventory-level fee on a SKU when 70% or more of it was auto-replenished to FBA through AWD over the prior 90 days, in both the 2026 and the 2027 rule: a large standard SKU at 18 and 20 days of supply pays $0.70 a unit at 69% and $0.00 at 70%.

## Test your SKU with its AWD share

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=MY-SKU&tier=large-standard&weightLb=1.2&dos30=18&dos90=20&unitsLast7=84&awdSharePct=70)

## The waiver by AWD share

Large standard up to 3 lb, 30-day 18 and 90-day 20 days of supply. Worked out by the calculator.

| AWD share, prior 90 days | Status | Fee a unit |
| --- | --- | ---: |
| 50% | Charged | $0.70 |
| 60% | Charged | $0.70 |
| 69% | Charged | $0.70 |
| 70% | Exempt | $0.00 |
| 85% | Exempt | $0.00 |
| 100% | Exempt | $0.00 |

## Decision

- You can keep 28 days of supply yourself: no need for AWD for this fee.
- You cannot (long prep or capacity limits): compare AWD's storage, processing and transport fees with the low-inventory fee on your units.
- Under 20 units a week: exempt anyway.

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)
- [Amazon Seller Central help: Unified monthly storage fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GVZX6EAEL2KZ3SGA)
- [Amazon: 2027 US Referral and Fulfillment by Amazon fees (read November 8, 2026)](https://amazon.com/selling-fee-changes)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Questions

### Does AWD auto-replenishment waive the low-inventory fee?

Yes, per SKU at 70%. Amazon's help: "the low-inventory-level fee does not apply at a SKU level when you auto-replenish 70% or more of that SKU to FBA through Amazon Warehousing and Distribution over the prior 90 days."

### Does AWD change storage fees too?

Amazon's unified monthly storage fee page: at 70% or more of an FNSKU auto-replenished from AWD, you pay the lowest age rate (0 to 180 days) whatever its age.

### What does AWD cost?

Amazon's 2027 fee announcement: from February 1, 2027 AWD processing is $1.55 a box and transportation $1.58 a cubic foot, with a 40% inbound processing discount for single-SKU pallets. Check Amazon's AWD fees page for the full schedule.

## Related

- [Exemptions](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/exemptions/)
- [How to avoid the fee](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/how-to-avoid/)
- [The safe zone](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/low-vs-aged-inventory/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/awd-replenishment-low-inventory-waiver/  
Data as of: 2026-11-08
