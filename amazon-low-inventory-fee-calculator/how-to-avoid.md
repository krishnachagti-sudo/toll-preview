# How to avoid the low-inventory-level fee

You avoid the fee when one of the two days-of-supply windows is at 28 or more: for MUG-12OZ, selling 12 a day, that means 336 units on hand on average over 30 days under the 2026 rule, and 336 units at each weekly check from February 1, 2027; it has 230, so the fee is $0.36 a unit until a shipment lands.

## Find the line for your SKU

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=MUG-12OZ&tier=large-standard&weightLb=1.2&avgInventory30=240&unitsShipped30=360&avgInventory90=280&unitsShipped90=990&unitsLast7=84&onHand=230&prepDays=3&transitDays=6&receivingDays=7)

## The rule in one line

2026 rule: "We'll only charge a low-inventory-level fee when both the long-term historical days of supply (last 90 days) and short-term historical days of supply (last 30 days) are below 28 days (4 weeks)." 2027 rule: "We only apply the low-inventory level fee if your inventory levels are insufficient based on your actual shipped units in both the trailing and following 28-day periods. The fee rate is applied using the higher of the two days of supply metrics."

## The plan for the worked mug

Send 682 units today: stock is already under 336 units (28 days at 12 a day), and with 3 prep + 6 transit + 7 receiving days they arrive November 25, 2026; 3 weekly checks fall under 28 days of stock before February 1, 2027, when the fee depends on the 30- and 90-day averages.

## What does not avoid it

- Stock you fulfil yourself: Amazon counts only FBA inventory in its network.
- Units still on their way: the 2027 rule excludes "units currently being sent to our fulfillment network".
- A product being phased out: no exemption unless it ships under 20 units a week (the 2027 rule's following 28 days help a sell-down).

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Steps

1. **Find the line.** Multiply the trailing daily units shipped by 28: that many units must be at Amazon (Amazon's own advice in its 2027 help).
2. **Send before you reach it.** Send when FBA stock is at the line plus what sells during prep, transit and receiving.
3. **Use the one window that is enough.** The fee needs both windows under 28; one at 28 or more avoids it.
4. **Check the exemptions.** Under 20 units in 7 days, new sellers, New Selection, AWD at 70% or more, grocery.
5. **Claim inbound delays.** Amazon reimburses the fee automatically when its own services delayed receiving.

## Questions

### How do I avoid the low-inventory-level fee?

Keep days of supply at 28 or more in at least one of the two windows. Amazon's 2027 help: "We recommend that you track your trailing 28-day daily units shipped in FBA Inventory, multiply by 28, and maintain that many units on-hand before the inventory is assessed."

### Does AWD avoid it?

Yes, at 70%. Amazon's help: "The low-inventory-level fee doesn’t apply when you auto-replenish 70% or more of a SKU to FBA through AWD in the last 90 days."

### What if Amazon was slow to receive my shipment?

Amazon's help: "For excessive inbound delays caused by us or Amazon-managed services, such as the Amazon Partnered Carrier program and Amazon Global Logistics, we'll automatically reimburse you if the low-inventory-level fees are charged."

## Related

- [FBA reorder point](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fba-reorder-point/)
- [Exemptions](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/exemptions/)
- [AWD auto-replenishment waiver](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/awd-replenishment-low-inventory-waiver/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/how-to-avoid/  
Data as of: 2026-11-08
