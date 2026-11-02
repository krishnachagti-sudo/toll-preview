# How an IFTA return is worked out

An IFTA return divides all miles by all fuel for one fleet MPG (4,350 / 690 = 6.30), turns each jurisdiction's taxable miles into taxable gallons at that MPG, subtracts the tax-paid gallons bought there and multiplies by the quarter's rate; surcharges are taxable gallons times the surcharge rate.

- Fleet MPG: 6.30
- Net: $28.73 credit
- Quarter: 3rd quarter 2026

## Try it with your miles

[Work out the return](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/?quarter=2026Q3&fuel=special_diesel&rows=MO%3A670%3A50%2CIL%3A260%3A160%2CIN%3A250%2CKY%3A380%2CWV%3A360%2CVA%3A370%3A150%2COK%3A500%3A70%2CTX%3A270%3A60%2CTN%3A1290%3A200&gallons=690)

## The worked example

3rd quarter 2026, diesel, 4,350 miles on 690 gallons = 6.30 MPG.

| Jurisdiction | Miles | Taxable gal | Tax-paid gal | Rate | Tax (credit) | Surcharge |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| IL Illinois | 260 | 41 | 160 | $0.7380 | -$87.82 |  |
| IN Indiana | 250 | 40 | 0 | $0.6300 | $25.20 |  |
| KY Kentucky | 380 | 60 | 0 | $0.2200 | $13.20 | $6.30 |
| MO Missouri | 670 | 106 | 50 | $0.2950 | $16.52 |  |
| OK Oklahoma | 500 | 79 | 70 | $0.1900 | $1.71 |  |
| TN Tennessee | 1,290 | 205 | 200 | $0.2700 | $1.35 |  |
| TX Texas | 270 | 43 | 60 | $0.2000 | -$3.40 |  |
| VA Virginia | 370 | 59 | 150 | $0.3360 | -$30.58 | $8.44 |
| WV West Virginia | 360 | 57 | 0 | $0.3570 | $20.35 |  |

Net: 3rd quarter 2026, special diesel: 4,350 miles on 690 gallons is 6.30 MPG, and the return comes to a $28.73 credit, surcharges included. It is due November 2, 2026.

## Rounding

Oregon DOT Form 9740: "ROUND to the nearest whole number when indicated on the instructions. For example, show 525.5 as 526 and 525.4 as 525." and for MPG: "Carry this calculation to three decimal places, then ROUND to two decimal places. For example, show 6. 155 as 6. 16, and show 6. 154 as 6. 15." Other base jurisdictions print their own rules; the totals rarely move by more than a few cents.

## Please read

- Computed from rates published by IFTA member jurisdictions in the IFTA tax rate matrix, as copied by Oregon DOT and New York State Tax (final rates, sources listed); not affiliated with IFTA, Inc. Your base jurisdiction's return governs.
- This is a calculation, not tax or legal advice; keep your original trip records and receipts for 4 years from the due or filing date, whichever is later.
- Record checks compare your records with the IFTA distance and fuel record elements; passing them does not guarantee an audit outcome.
- Rounding follows Oregon DOT Form 9740 (whole miles and gallons, MPG to two decimals); penalty and interest use the general IFTA rules. Your base jurisdiction may compute or round differently.

## Sources

- [Oregon DOT copy of the IFTA matrix, 3Q2026 FINAL Fuel Tax Rates (PDF) (read November 2, 2026)](https://www.oregon.gov/odot/MCT/Fuel%20Tax%20Rates/3Q2026FuelRates.pdf)
- [NY Tax IFTA-105 (3rd Quarter 2026), HTML table (read November 2, 2026)](https://www.tax.ny.gov/forms/html-instructions/2026/motor/ifta105-926.htm)
- [Oregon DOT, IFTA Tax Return Form 735-9740 and its filing instructions (03-26) (read November 2, 2026)](https://www.oregon.gov/odot/forms/motcarr/9740.pdf)

## Steps

1. **Total the miles.** Add every mile each qualified vehicle drove, in IFTA jurisdictions and outside them (Alaska, Hawaii, D.C., the territories, Mexico), rounded to whole miles.
2. **Total the fuel.** Add every gallon put in the propulsion tanks, wherever it was bought and whether tax was paid or not. Not diesel exhaust fluid, not reefer fuel.
3. **Fleet MPG.** Miles / gallons, carried to three decimals and rounded to two.
4. **Taxable gallons.** Each jurisdiction's taxable miles / MPG, rounded to a whole number.
5. **Net and tax.** Taxable gallons less tax-paid gallons bought there, times the quarter's rate. Negative is a credit.
6. **Surcharges.** Where the matrix prints a surcharge row for the fuel, taxable gallons times that rate, with no credit.

## Questions

### Why do I owe Kentucky even though I fueled there?

The surcharge has no tax-paid credit: in the example, 60 taxable gallons x $0.1050 = $6.30, whatever was bought in Kentucky.

### Why is a state a credit?

You bought more tax-paid fuel there than you burned there: in Illinois the example truck burned 41 gallons on 260 miles but bought 160, so -119 gallons x $0.7380 = -$87.82.

## Related

- [IFTA rates, 3rd quarter 2026](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/2026-q3-rates/)
- [IFTA records an auditor asks for](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/record-keeping/)
- [IFTA due dates](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/due-dates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/how-ifta-is-calculated/  
Data as of: 2026-11-02
