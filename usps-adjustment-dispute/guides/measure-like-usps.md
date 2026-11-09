# Measure a package the way USPS does

USPS rounds each side up to the whole inch for dimensional weight, so a 12.1 x 12 x 12 in box counts as 13 x 12 x 12 = 1,872 cubic inches, over 1,728, and has a 14 lb dimensional weight; for cubic prices it rounds down to the 1/4 inch instead, so 6-1/8 x 5-7/8 x 6-3/8 in is tier 0.2.

## Three roundings for three purposes

| Purpose | Rounding | DMM |
| --- | --- | --- |
| Dimensional weight | Up to the whole inch (nonrectangular Priority Mail: off) | 223.1.4, 283.1.4, 253.1.2, 213.1.4 |
| Cubic tier | Down to the 1/4 inch | 223.1.3, 283.1.3 |
| Over 2 cubic feet (nonstandard volume fee) | Off to the whole inch | 223.1.10, 283.1.7 |
| Weight | Up to the next pound or ounce increment | 223.1.1, 283.1.1 |

Round off: 5 or more raises the digit, 4 or less leaves it. Round up: any fraction raises it. Round down: the fraction is dropped (DMM 604.7.0).

## The cubic example from the DMM

6.25 x 6 x 5.75 in (each rounded down to the 1/4 inch) = 215.625 cubic inches = 0.125 cubic feet: tier 0.2.

## Work out the dimensional weight

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/?op=dim&service=ground-advantage&shape=rectangular&length=12.1&width=12&height=12)

## Sources

- [USPS DMM 223 Priority Mail Commercial Prices and Eligibility, sections 1.1 to 1.10 (read November 8, 2026)](https://pe.usps.com/text/dmm300/223.htm)
- [USPS DMM 283 USPS Ground Advantage Commercial Prices and Eligibility, sections 1.1 to 1.8 (read November 8, 2026)](https://pe.usps.com/text/dmm300/283.htm)
- [USPS DMM 604.7.0 Computing Postage (round off, round up, round down) (read November 8, 2026)](https://pe.usps.com/text/dmm300/604.htm)
- [USPS: Postage Verification (Automated Package Verification) (read November 8, 2026)](https://www.usps.com/business/verify-postage.htm)

## Please read

- Not legal advice. USPS decides every APV dispute; a packet does not guarantee a refund.
- Prices are USPS Notice 123 commercial prices for the label's ship date. eBay, Etsy, Pirate Ship and other platforms may charge different rates, so the tool compares the adjustment (the difference), not label totals.
- The zone and USPS's measurements come from your adjustment notice; the tool does not read your account or USPS's scan data.
- Photos you add are processed in memory to build the PDF and are not kept.
- Rules and prices are as read on the dates shown. USPS changes prices next on January 17, 2027; labels from that date are refused until the new Notice 123 is loaded.

## Steps

1. **Length.** Measure the longest side; that is the length. Over 22 inches adds a nonstandard length fee, over 30 inches a higher one.
2. **Width and height.** Measure the other two sides at their widest points, including any bulge.
3. **Round for dimensional weight.** Round each side up to the whole inch (nonrectangular Priority Mail: round off).
4. **Round for cubic.** For cubic prices, round each side down to the 1/4 inch; soft packs use length plus width.
5. **Weigh.** Weigh the packed parcel; any fraction of a pound counts as a whole pound (Ground Advantage under 1 lb: 4, 8, 12 or 15.999 oz).
6. **Photograph.** Photograph the tape against each side and the parcel on the scale: the evidence for a dispute.

## Related

- [Dimensional weight calculator](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/)
- [The July 12, 2026 change](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/guides/dim-weight-july-2026/)
- [Ground Advantage dimensional weight](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/usps-dimensional-weight-calculator/ground-advantage/)
- [How to dispute](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/guides/dispute-packet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/guides/measure-like-usps/  
Data as of: 2026-11-08
