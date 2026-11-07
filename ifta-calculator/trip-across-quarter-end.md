# A trip that crosses a quarter end

Split the trip at midnight on the last day of the quarter and report each part in its own quarter: a 1,200-mile trip from March 30 to April 2, 2026 with the odometer at 500,600 at midnight on March 31 is 600 miles on the 1st quarter return and 600 miles on the 2nd, split by jurisdiction.

- 1st quarter miles: 600
- 2nd quarter miles: 600
- Whole trip: 1,200

## Why one trip goes on two returns

Each IFTA return covers one calendar quarter (R930.100), and Total Distance is all the miles driven "during the tax reporting period" (R266). Miles driven after midnight on the last day of the quarter belong to the next return.

## Worked example: Tulsa to Columbus, March 30 to April 2, 2026

One made-up truck, one load. As a single trip sheet in the 1st quarter, the calculator refuses it: "Trip T9 (unit 101) runs outside 2026-01-01 to 2026-03-31. Split it at the quarter's end and report each part on its own quarter; it is left out of this return."

Odometer 500,000 to 501,200; 500,600 at midnight on March 31, 2026.

| Jurisdiction | Whole trip | 1st quarter (to March 31) | 2nd quarter (from April 1) |
| --- | ---: | ---: | ---: |
| Oklahoma | 110 | 110 | 0 |
| Missouri | 290 | 290 | 0 |
| Illinois | 250 | 200 | 50 |
| Indiana | 155 | 0 | 155 |
| Ohio | 395 | 0 | 395 |
| Total | 1,200 | 600 | 600 |

Illinois is on both returns because the truck was in Illinois at midnight: 200 Illinois miles before midnight and 50 after.

Checked by the calculator: the 1st quarter half has 0 errors and the 2nd quarter half 0. Each half's miles by jurisdiction add up to its odometer miles (600 and 600), and the two add up to the trip's 1,200.

## Fuel bought on the trip

Each receipt belongs to the quarter of its date. A fill-up in Missouri on March 31 is 1st quarter fuel; one in Indiana on April 1 is 2nd quarter fuel, even though it is the same load. The calculator leaves a receipt dated outside the quarter out of that return and names it.

Trip sheets need the dates, origin and destination, route, odometer readings, miles by jurisdiction and unit number: see [IFTA records an auditor asks for](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/record-keeping/).

## Work out a quarter from totals

[Work out the return](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/?quarter=2026Q3&fuel=special_diesel&rows=MO%3A670%3A50%2CIL%3A260%3A160%2CIN%3A250%2CKY%3A380%2CWV%3A360%2CVA%3A370%3A150%2COK%3A500%3A70%2CTX%3A270%3A60%2CTN%3A1290%3A200&gallons=690)

## Please read

- Computed from rates published by IFTA member jurisdictions in the IFTA tax rate matrix, as copied by Oregon DOT and New York State Tax (final rates, sources listed); not affiliated with IFTA, Inc. Your base jurisdiction's return governs.
- This is a calculation, not tax or legal advice; keep your original trip records and receipts for 4 years from the due or filing date, whichever is later.
- Record checks compare your records with the IFTA distance and fuel record elements; passing them does not guarantee an audit outcome.
- Rounding follows Oregon DOT Form 9740 (whole miles and gallons, MPG to two decimals); penalty and interest use the general IFTA rules. Your base jurisdiction may compute or round differently.

## Sources

- [IFTA Articles of Agreement, revised August 26, 2026 (R266, R345, R410, R605, R610, R625, R630, R930, R940, R960, R1220, R1230, R1260, R1270) (read November 6, 2026)](https://www.iftach.org/manuals/2026/AA/Articles%20of%20Agreement%20-%2008-26-26.pdf)
- [Idaho State Tax Commission, IFTA licenses: records (IVDR) (read November 2, 2026)](https://tax.idaho.gov/?p=1239)
- [Oregon DOT, IFTA Tax Return Form 735-9740 and its filing instructions (03-26) (read November 2, 2026)](https://www.oregon.gov/odot/forms/motcarr/9740.pdf)

## Steps

1. **Find the midnight reading.** Take the odometer or hubometer reading at midnight at the end of the quarter from your ELD or GPS history, or the last fuel stop or log entry before it and the first after.
2. **Split the miles by jurisdiction.** Miles before the reading go on the old quarter, by the jurisdictions driven; miles after go on the new one. A jurisdiction you were in at midnight appears on both.
3. **Log two trip sheets.** Close the first sheet at the midnight reading and open the second at the same reading, so the odometer chain has no gap.
4. **Put fuel by receipt date.** Each fuel receipt goes in the quarter of its date: the gallons count in that quarter's total and, if tax-paid, its credit.
5. **Check both halves.** The miles by jurisdiction on each sheet must add up to that sheet's odometer miles.

## Questions

### What if my IFTA trip crosses midnight on March 31?

Report the miles driven through March 31 on the 1st quarter return and the rest on the 2nd. In the example, 600 of the trip's 1,200 miles were driven by midnight on March 31.

### Which quarter does a fuel receipt go in?

The quarter of the receipt date. The calculator leaves a receipt dated outside the quarter out of that quarter's return and says so.

### What if I have no odometer reading at midnight?

Use the ELD or GPS position history, or the readings before and after midnight from fuel receipts and logs. Whatever you use, keep it: an auditor checks that the two halves add up to the whole trip.

## Related

- [IFTA records an auditor asks for](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/record-keeping/)
- [Deadhead and bobtail miles](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/deadhead-and-bobtail-miles/)
- [Several trucks on one return](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/several-trucks-one-return/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/trip-across-quarter-end/  
Data as of: 2026-11-06
