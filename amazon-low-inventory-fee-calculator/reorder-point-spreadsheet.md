# Reorder spreadsheet with the low-inventory fee check

This sheet works out days of supply, the fee band and the send-by date per SKU: in the four-SKU sample (week of November 9, 2026), 1 pays the fee (MUG-12OZ at $0.36 a unit), 1 is exempt for low volume, and 3 need a shipment sent now; download the CSV, or paste the same columns into the calculator's file tab.

## The sample sheet

Inputs, then the calculator's results for the week of November 9, 2026 with 3 prep + 6 transit + 7 receiving days and 60 days of stock.

| SKU | Tier | Status | Days of supply | Fee a unit | Send by | Units |
| --- | --- | --- | ---: | ---: | --- | ---: |
| MUG-12OZ | large-standard | fee | 25.5 | $0.36 | 2026-10-24 | 682 |
| RUG-5X7 | large-bulky | no-fee | 51.0 |  | 2026-11-12 | 97 |
| CANDLE-SM | small-standard | exempt | 15.0 |  | 2026-10-24 | 90 |
| LAMP-NEW | large-standard | no-fee | 45.0 |  | 2026-10-24 | 240 |

## Formulas

With the sample columns (D avg\_inventory\_30, E units\_shipped\_30, F avg\_inventory\_90, G units\_shipped\_90, I daily\_sales, J on\_hand) in row 2:

```
30-day days of supply:  =IF(E2=0,"--",D2*30/E2)
90-day days of supply:  =IF(G2=0,"--",F2*90/G2)
Fee applies (2026):     =AND(E2>0,G2>0,D2*30/E2<28,F2*90/G2<28)
Days of supply for band:=MAX(D2*30/E2,F2*90/G2)
28-day line, units:     =ROUNDUP(28*I2,0)
Send-by date:           =TODAY()+(J2-ROUNDUP(28*I2,0))/I2-(prep+transit+receiving)
```

Then look up the rate in Amazon's table for the tier and band. The calculator does the same with exact fractions at the band edges, both rules by date, the exemptions and any inbound shipment.

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)

> The reorder plan assumes the steady daily sales you give it. Amazon does not publish which day of the week it checks inventory, so dates are to the day of your own plan.

## Related

- [Spreadsheet vs this calculator](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/vs/spreadsheet-reorder-model/)
- [FBA reorder point](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fba-reorder-point/)
- [Fee rates 2026](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2026/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/reorder-point-spreadsheet/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/reorder-point-spreadsheet.csv
