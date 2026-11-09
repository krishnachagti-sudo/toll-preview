# USPS dimensional weight calculator

A 21.06 x 15.55 x 9.61 in rectangular parcel rounds up to 22 x 16 x 10 in = 3,520 cubic inches; over 1,728, so its Ground Advantage dimensional weight is 26 lb (divided by 139, rounded up) and USPS bills 26 lb. A box only just over 12 inches crosses the line: 12.1 x 12 x 12 in rounds up to 13 x 12 x 12 in = 1,872 cubic inches, a 14 lb dimensional weight.

- Divisor: 139

## Work out the dimensional weight

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/?op=dim&service=ground-advantage&shape=rectangular&length=21.06&width=15.55&height=9.61&weight=8)

## The rule, step by step

1. Measure: 21.06 x 15.55 x 9.61 in.
2. Round up each side to the whole inch: 22 x 16 x 10 in.
3. Multiply: 3,520 cubic inches.
4. Over 1,728 cubic inches, so divide by 139 and round up: 26 lb.

Then USPS bills the greater of the actual weight (rounded up to the pound) and the dimensional weight. Under 1,728 cubic inches there is no dimensional weight at all.

## Common boxes (USPS Ground Advantage)

Dimensional weight in pounds; "none" means not over 1,728 cubic inches. The last column is the rule before July 12, 2026 (sides rounded off, divided by 166).

| Box (in) | Rounded (in) | Cubic inches | Dim weight now | Nonrectangular now | Before Jul 12, 2026 |
| --- | --- | ---: | ---: | ---: | ---: |
| 12 x 12 x 12 | 12 x 12 x 12 | 1,728 | none | none | none |
| 12.1 x 12 x 12 | 13 x 12 x 12 | 1,872 | 14 lb | none | none |
| 13 x 11 x 11 | 13 x 11 x 11 | 1,573 | none | none | none |
| 14 x 10 x 10 | 14 x 10 x 10 | 1,400 | none | none | none |
| 14 x 12 x 10 | 14 x 12 x 10 | 1,680 | none | none | none |
| 16 x 12 x 8 | 16 x 12 x 8 | 1,536 | none | none | none |
| 16 x 12 x 10 | 16 x 12 x 10 | 1,920 | 14 lb | none | 12 lb |
| 16 x 16 x 16 | 16 x 16 x 16 | 4,096 | 30 lb | 24 lb | 25 lb |
| 18 x 12 x 12 | 18 x 12 x 12 | 2,592 | 19 lb | 15 lb | 16 lb |
| 18 x 14 x 10 | 18 x 14 x 10 | 2,520 | 19 lb | 15 lb | 16 lb |
| 18 x 18 x 12 | 18 x 18 x 12 | 3,888 | 28 lb | 22 lb | 24 lb |
| 18 x 18 x 18 | 18 x 18 x 18 | 5,832 | 42 lb | 33 lb | 36 lb |
| 20 x 14 x 10 | 20 x 14 x 10 | 2,800 | 21 lb | 16 lb | 17 lb |
| 20 x 16 x 12 | 20 x 16 x 12 | 3,840 | 28 lb | 22 lb | 24 lb |
| 20 x 20 x 20 | 20 x 20 x 20 | 8,000 | 58 lb | 46 lb | 49 lb |
| 22 x 16 x 10 | 22 x 16 x 10 | 3,520 | 26 lb | 20 lb | 22 lb |
| 22.5 x 15.25 x 9.75 | 23 x 16 x 10 | 3,680 | 27 lb | 21 lb | 21 lb |
| 24 x 16 x 12 | 24 x 16 x 12 | 4,608 | 34 lb | 27 lb | 28 lb |
| 24 x 18 x 12 | 24 x 18 x 12 | 5,184 | 38 lb | 30 lb | 32 lb |
| 24 x 24 x 18 | 24 x 24 x 18 | 10,368 | 70 lb | 59 lb | 63 lb |

## Which rule for which service

| Service | Rectangular | Nonrectangular | DMM |
| --- | --- | --- | --- |
| Priority Mail | round up, divide by 139 | round off, x 0.785, divide by 166 | 223.1.4 |
| Priority Mail Express | round up, divide by 139 | round up, x 0.785, divide by 139 | 213.1.4 |
| USPS Ground Advantage | round up, divide by 139 | round up, x 0.785, divide by 139 | 283.1.4 |
| Parcel Select (Destination Entry) | round up, divide by 139 | round up, x 0.785, divide by 139 | 253.1.2 |

Pages for each rule: [Priority Mail](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/priority-mail/), [USPS Ground Advantage](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/ground-advantage/), [Parcel Select](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/parcel-select/).

## Why other calculators disagree

Some general calculators still use the old figure: Omni Calculator: Dimensional weight calculator said the USPS dimensional factor is 166 when read on November 8, 2026. USPS's own Domestic Mail Manual has used 139, with each side rounded up, since July 12, 2026. A general calculator is still the better choice for UPS, FedEx or international shipments, where USPS's rules do not apply.

## Sources

- [USPS DMM 223 Priority Mail Commercial Prices and Eligibility, sections 1.1 to 1.10 (read November 8, 2026)](https://pe.usps.com/text/dmm300/223.htm)
- [USPS DMM 283 USPS Ground Advantage Commercial Prices and Eligibility, sections 1.1 to 1.8 (read November 8, 2026)](https://pe.usps.com/text/dmm300/283.htm)
- [USPS DMM 253 Parcel Select Prices and Eligibility, sections 1.2 and 1.7 to 1.8 (read November 8, 2026)](https://pe.usps.com/text/dmm300/253.htm)
- [USPS DMM 213 Priority Mail Express Commercial Prices and Eligibility, section 1.4 (read November 8, 2026)](https://pe.usps.com/text/dmm300/213.htm)
- [USPS DMM archive, issue of April 6, 2026: 223 section 1.4 (the rule before July 12, 2026) (read November 8, 2026)](https://pe.usps.com/Archive/NHTML/DMMArchive20260406/223.htm)
- [USPS DMM 604.7.0 Computing Postage (round off, round up, round down) (read November 8, 2026)](https://pe.usps.com/text/dmm300/604.htm)
- [USPS: Postage Verification (Automated Package Verification) (read November 8, 2026)](https://www.usps.com/business/verify-postage.htm)
- [Omni Calculator: Dimensional weight calculator (read November 8, 2026)](https://www.omnicalculator.com/other/dimensional-weight)

## Please read

- Not legal advice. USPS decides every APV dispute; a packet does not guarantee a refund.
- Prices are USPS Notice 123 commercial prices for the label's ship date. eBay, Etsy, Pirate Ship and other platforms may charge different rates, so the tool compares the adjustment (the difference), not label totals.
- The zone and USPS's measurements come from your adjustment notice; the tool does not read your account or USPS's scan data.
- Photos you add are processed in memory to build the PDF and are not kept.
- Rules and prices are as read on the dates shown. USPS changes prices next on January 17, 2027; labels from that date are refused until the new Notice 123 is loaded.

## Questions

### How does USPS calculate dimensional weight in 2026?

Since July 12, 2026: round each side up to the whole inch, multiply, and if the result is over 1,728 cubic inches divide by 139 and round up to the next pound (DMM 223.1.4, 283.1.4, 253.1.2, 213.1.4).

### Is the USPS divisor 139 or 166?

139 for every service since July 12, 2026, except nonrectangular Priority Mail parcels, which still round each side off and divide by 166 (DMM 223.1.4.3).

### Does dimensional weight apply to small boxes?

No. Only parcels over 1 cubic foot (1,728 cubic inches) are priced on the greater of the actual and the dimensional weight.

### What is the most USPS charges on dimensional weight?

The 70-pound price: a dimensional weight over 70 pounds is priced at 70 pounds.

## Related

- [Priority Mail dimensional weight](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/priority-mail/)
- [USPS Ground Advantage dimensional weight](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/ground-advantage/)
- [Parcel Select (Destination Entry) dimensional weight](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/parcel-select/)
- [What changed on July 12, 2026](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/guides/dim-weight-july-2026/)
- [Measure like USPS](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/guides/measure-like-usps/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator.csv
