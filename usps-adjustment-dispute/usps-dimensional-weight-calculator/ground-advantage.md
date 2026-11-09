# USPS Ground Advantage dimensional weight calculator

For USPS Ground Advantage, a 22.5 x 15.25 x 9.75 in rectangular parcel is billed at no less than 27 lb: sides rounded up to 23 x 16 x 10 in = 3,680 cubic inches, divided by 139. A nonrectangular parcel of the same size is 21 lb (rounded up, x 0.785, divided by 139).

## Work out the dimensional weight

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/?op=dim&service=ground-advantage&shape=rectangular&length=22.5&width=15.25&height=9.75)

## The rule

- Rectangular: round each side up to the whole inch, multiply; over 1,728 cubic inches divide by 139 and round up.
- Nonrectangular: measure the extreme dimensions, round each up, multiply, x 0.785; over 1,728 divide by 139 and round up.
- Billed at the greater of the actual weight and the dimensional weight; over 70 pounds of dimensional weight pays the 70-pound price.

## Box table

USPS Ground Advantage: dimensional weight in pounds ("none" = not over 1,728 cubic inches)

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

## Nonstandard fees

Notice 123, Time-limited prices, October 4, 2026 to January 17, 2027

| Fee | Amount |
| --- | ---: |
| Over 22 up to 30 inches long | $4.50 |
| Over 30 inches long | $10.00 |
| Over 2 cubic feet (3,456 cubic inches) | $21.00 |
| Nonstandard characteristics | $4.50 |
| Dimension Noncompliance Fee | $3.00 |

Length and characteristics fees: only the higher one. The volume fee is added to either. The volume test rounds each side off, not up.

Length plus girth over 108 up to 130 inches pays the oversized price instead (zone 1 $112.94 to zone 9 $295.93), with no nonstandard fees.

## Sources

- [USPS DMM 283 USPS Ground Advantage Commercial Prices and Eligibility, sections 1.1 to 1.8 (read November 8, 2026)](https://pe.usps.com/text/dmm300/283.htm)
- [USPS DMM archive, issue of April 6, 2026: 223 section 1.4 (the rule before July 12, 2026) (read November 8, 2026)](https://pe.usps.com/Archive/NHTML/DMMArchive20260406/223.htm)
- [USPS DMM 604.7.0 Computing Postage (round off, round up, round down) (read November 8, 2026)](https://pe.usps.com/text/dmm300/604.htm)
- [USPS Notice 123 Price List, effective October 4, 2026 (read November 8, 2026)](https://pe.usps.com/text/dmm300/Notice123.htm)

## Please read

- Not legal advice. USPS decides every APV dispute; a packet does not guarantee a refund.
- Prices are USPS Notice 123 commercial prices for the label's ship date. eBay, Etsy, Pirate Ship and other platforms may charge different rates, so the tool compares the adjustment (the difference), not label totals.
- The zone and USPS's measurements come from your adjustment notice; the tool does not read your account or USPS's scan data.
- Photos you add are processed in memory to build the PDF and are not kept.
- Rules and prices are as read on the dates shown. USPS changes prices next on January 17, 2027; labels from that date are refused until the new Notice 123 is loaded.

## Related

- [USPS dimensional weight calculator](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/)
- [Priority Mail dimensional weight](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/priority-mail/)
- [Parcel Select (Destination Entry) dimensional weight](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/parcel-select/)
- [Measure like USPS](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/guides/measure-like-usps/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/ground-advantage/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/ground-advantage.csv
