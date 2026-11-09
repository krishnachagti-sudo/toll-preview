# How USPS adjustments are checked: DMM and Notice 123

The label and USPS's measurements are both priced at USPS Notice 123 commercial prices for the label's ship date, and the adjustment should be the difference, plus the $3.00 Dimension Noncompliance Fee where it applies. Since July 12, 2026, dimensional weight rounds each side up to the whole inch and divides by 139 over 1,728 cubic inches. A dispute must be filed within 60 days of the notice.

## What does the usps adjustment dispute checker compute?

For a Priority Mail, Priority Mail Express, Ground Advantage or Parcel Select label that USPS adjusted under Automated Package Verification, the tool prices what was entered on the label, what USPS measured and, if given, your own measurements, using the Domestic Mail Manual rules and the Notice 123 commercial price list in force on the ship date. It says what the adjustment should be, whether the charge matches, how much to dispute, and the last day to file. The packet adds the text for USPS's dispute webform and a PDF with the worksheet and your photos.

Operations (the op field):

- `check`: Prices the label, USPS's measurements and your own, and returns each price with its steps, the expected adjustment with and without the Dimension Noncompliance Fee, whether the charge matches, the amount to dispute, the reasons, the deadline and the sources. Free on the tool page; $0.01 a call over the API or MCP.
- `packet`: Does what check does and adds the dispute text for USPS's webform (Revenue Assurance ID without leading zeros, tracking number, reason and the rule), the steps to file, and a PDF with the worksheet and up to 6 photos. $0.49 per adjustment; changes to the same adjustment are free for 60 days, and a month costs at most $4.99.
- `dim`: Works out the dimensional weight of one parcel under the rule in force now and the rule before July 12, 2026, side by side, with the weight USPS bills and any nonstandard fees. Free.
- `deadline`: Returns the last day to dispute, 60 days after the notice date, and the days left. Free.
- `rules`: Returns the rules file and the price file: every service, rounding rule, divisor, cubic tier, fee and price by zone, with the USPS page and the date each was read. Free.

Inputs:

- `service, zone, shipDate`: The service on the label (priority-mail, priority-mail-express, ground-advantage or parcel-select), the zone (1 to 9), and the day the label was bought or mailed, which picks the price list.
- `label`: What was entered on the label: weight in pounds (and ounces), length, width and height in inches, and pricing (weight, the default, or cubic).
- `usps`: What the notice says USPS measured: only what differs, including a different service or zone.
- `actual`: Your own measurements of the parcel, if you disagree with USPS.
- `notified, charged`: The date of the adjustment notice (starts the 60 days) and the adjustment amount in dollars.
- `shape, softPack, characteristics`: rectangular (default) or nonrectangular; a poly mailer or padded envelope priced by length plus width; a nonstandard characteristic such as a tube, roll or liquid.
- `raid, tracking, name, email, phone, note, photos`: For packet: the Revenue Assurance ID (up to 15 digits), the tracking number, your details, a short note, and up to 6 JPEG or PNG photos.

Outputs:

- answer: the label price, the price at USPS's measurements, what the adjustment should be, whether the charge matches, what to dispute and the date to file by
- edition: the price list used; label, usps and actual: each price with its row, fees, steps and dimensional weight
- expected, verdict and reasons: the adjustment with and without the fee, matches, above or below, the amount to dispute, and Weight, Dimensions, Zone or Package
- deadline: the notice date, the last day and the days left
- packet: the dispute text, the fields for the webform, the steps and the PDF (packet op)

## How is it calculated, step by step?

1. The price list is chosen by the ship date: July 12, 2026 prices (July 12, 2026 to October 3, 2026) and Time-limited prices, October 4, 2026 to January 17, 2027 (October 4, 2026 to January 16, 2027). A label from before the first or from January 17, 2027 on is refused, since those prices are not loaded.
2. Measurements are worked in hundredths of an inch and weights in ten-thousandths of a pound, so no rounding depends on floating point. Dimensional weight (DMM 213.1.4, 223.1.4, 253.1.2, 283.1.4): from July 12, 2026, each side is rounded up to the whole inch, multiplied, and over 1,728 cubic inches divided by 139 and rounded up, at most 70 lb. A nonrectangular parcel is multiplied by 0.785 first, and nonrectangular Priority Mail still rounds each side off and divides by 166. Before that date every service rounded off and divided by 166.
3. The weight row: Ground Advantage under 1 lb uses the 4, 8, 12 and 15.999 oz rows; Priority Mail and Priority Mail Express have a 0.5 lb row; otherwise the weight is rounded up to the next pound. The parcel is priced at the dimensional weight when that is more than the actual weight row.
4. Cubic prices (DMM 223.1.3 and 283.1.3): each side is rounded down to the quarter inch and the volume put in tenth-of-a-cubic-foot tiers, up to 0.5 cubic feet for Priority Mail and 1.0 for Ground Advantage. A cubic piece weighs at most 20 lb and its longest side is at most 22 inches; a soft pack is tiered by length plus width, at most 36 inches. A piece that does not qualify is priced by weight.
5. Fees from Notice 123: a nonstandard length fee over 22 and over 30 inches or a nonstandard characteristics fee, whichever is higher, plus a volume fee over 2 cubic feet. Ground Advantage with length plus girth over 108 up to 130 inches gets the oversized price; over 130 is refused.
6. The Dimension Noncompliance Fee ($3.00) is counted when the label's dimensions were omitted or differ from USPS's (each rounded up to the whole inch) and the parcel is over 1 cubic foot or 22 inches long, the Phase One rule of USPS's Parcel Dimension Compliance initiative.
7. The expected adjustment is the price at USPS's measurements minus the label price, with and without the fee. A charge within one cent of either matches. With your own measurements, the amount to dispute is the charge less what would be owed at them; without them, it is any amount charged above what USPS's own measurements produce.
8. The last day to dispute is 60 days after the notice date. The packet's text gives the Revenue Assurance ID without leading zeros, as USPS's FAQ asks, the tracking number, the reason, the measurements and the rule, for the webform at https://apvdisputes.usps.com/.

**Prices.**

USPS Notice 123 commercial prices in cents by zone (index 0 = zone 1 ... index 8 = zone 9), transcribed by script from USPS's own CSV price files and checked against the Notice 123 web page. pounds: weight not over N lb (Priority Mail and Priority Mail Express also have a 0.5 lb row). ounces: Ground Advantage under 1 lb. cubic: tier 'cubic feet up to'. fees: nonstandard and Dimension Noncompliance fees. Platforms such as eBay, Etsy and Pirate Ship may charge other rates, so the tool compares the adjustment (the difference), not label totals.

**Parcel Select.**

Parcel Select prices depend on the entry facility and are not priced; its dimensional weight is still worked out.

## Which edge cases does it handle?

- A parcel of exactly 1,728 cubic inches has no dimensional weight; it is priced on its actual weight.
- A box measured 12 x 10 x 8 in by you and 14 x 12 x 11 in by USPS: at your measurements nothing extra is owed, so the whole charge is disputed.
- A nonrectangular parcel with a nonstandard characteristic is not eligible for cubic prices.
- A notice dated October 28, 2026 can be disputed through December 27, 2026; after that the window is closed.
- Photos are checked by their contents: a file that is not a JPEG or PNG is refused.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Ground Advantage, zone 5: label 12 x 10 x 8 in, USPS says 14 x 12 x 11 in, $13.01 charged**

```json
{
  "op": "check",
  "service": "ground-advantage",
  "zone": 5,
  "shipDate": "2026-10-20",
  "notified": "2026-10-28",
  "charged": 13.01,
  "label": {
    "weight": 3,
    "length": 12,
    "width": 10,
    "height": 8
  },
  "usps": {
    "length": 14,
    "width": 12,
    "height": 11
  },
  "actual": {
    "length": 12,
    "width": 10,
    "height": 8
  }
}
```

Ground Advantage, zone 5: label 12 x 10 x 8 in, USPS says 14 x 12 x 11 in, $13.01 charged

| Result | Value |
| --- | --- |
| label | 3 lb, $12.12 |
| at USPS's measurements | 14 lb, $22.13 |
| the adjustment should be | $10.01, or $13.01 with the $3.00 Dimension Noncompliance Fee |
| to dispute | $13.01 |
| reasons | Dimensions |
| file by | December 27, 2026 |

**Dimensional weight: 21.06 x 15.55 x 9.61 in box, 8 lb, Ground Advantage**

```json
{
  "op": "dim",
  "service": "ground-advantage",
  "length": 21.06,
  "width": 15.55,
  "height": 9.61,
  "weight": 8
}
```

Dimensional weight: 21.06 x 15.55 x 9.61 in box, 8 lb, Ground Advantage

| Result | Value |
| --- | --- |
| answer | A 21.06 x 15.55 x 9.61 in rectangular parcel rounds up to 22 x 16 x 10 in = 3,520 cubic inches; over 1,728, so its Ground Advantage dimensional weight is 26 lb (divided by 139, rounded up) and USPS bills 26 lb. |
| before July 12, 2026 | 21 x 16 x 10 in, 21 lb (divided by 166) |

## What does it not do?

- It refuses labels with no loaded price list: before July 12, 2026, or from January 17, 2027 until the new Notice 123 is loaded.
- It does not read your account or USPS's scan data: the zone and USPS's measurements come from your notice.
- It does not file the dispute; USPS decides every one, and a packet does not guarantee a refund.
- Photos are processed to build the PDF and are not kept. It is not legal advice.

## Where does the data come from, and how fresh is it?

USPS's rules and the Notice 123 prices were read on November 8, 2026, the prices transcribed from USPS's own price files. USPS changes prices next on January 17, 2027: Postal Explorer listed only postage statement redlines (revised 11/06/2026) on November 8, 2026; no Notice 123 for January 17, 2027 yet.

- [USPS: Postage Verification (Automated Package Verification)](https://www.usps.com/business/verify-postage.htm)
- [USPS FAQ: Automated Package Verification Program](https://faq.usps.com/articles/Knowledge/Automated-Package-Verification-Program)
- [USPS Industry Alert: Automated Package Verification (APV) Dispute Process, updated October 25, 2024 (PostalPro)](https://postalpro.usps.com/node/13550)
- [USPS DMM 223 Priority Mail Commercial Prices and Eligibility, sections 1.1 to 1.10](https://pe.usps.com/text/dmm300/223.htm)
- [USPS DMM 283 USPS Ground Advantage Commercial Prices and Eligibility, sections 1.1 to 1.8](https://pe.usps.com/text/dmm300/283.htm)
- [USPS DMM 604.7.0 Computing Postage (round off, round up, round down)](https://pe.usps.com/text/dmm300/604.htm)
- [USPS Notice 123 Price List, effective October 4, 2026](https://pe.usps.com/text/dmm300/Notice123.htm)

USPS's rules and the Notice 123 prices were read on November 8, 2026, the prices transcribed from USPS's own price files. USPS changes prices next on January 17, 2027: Postal Explorer listed only postage statement redlines (revised 11/06/2026) on November 8, 2026; no Notice 123 for January 17, 2027 yet.

USPS adjustment dispute checker: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [USPS: Postage Verification (Automated Package Verification)](https://www.usps.com/business/verify-postage.htm) | see the document | 2026-11-08 |
| [USPS FAQ: Automated Package Verification Program](https://faq.usps.com/articles/Knowledge/Automated-Package-Verification-Program) | see the document | 2026-11-08 |
| [USPS Industry Alert: Automated Package Verification (APV) Dispute Process, updated October 25, 2024 (PostalPro)](https://postalpro.usps.com/node/13550) | see the document | 2026-11-08 |
| [USPS DMM 213 Priority Mail Express Commercial Prices and Eligibility, section 1.4](https://pe.usps.com/text/dmm300/213.htm) | see the document | 2026-11-08 |
| [USPS DMM 223 Priority Mail Commercial Prices and Eligibility, sections 1.1 to 1.10](https://pe.usps.com/text/dmm300/223.htm) | see the document | 2026-11-08 |
| [USPS DMM 253 Parcel Select Prices and Eligibility, sections 1.2 and 1.7 to 1.8](https://pe.usps.com/text/dmm300/253.htm) | see the document | 2026-11-08 |
| [USPS DMM 283 USPS Ground Advantage Commercial Prices and Eligibility, sections 1.1 to 1.8](https://pe.usps.com/text/dmm300/283.htm) | see the document | 2026-11-08 |
| [USPS DMM 604.7.0 Computing Postage (round off, round up, round down)](https://pe.usps.com/text/dmm300/604.htm) | see the document | 2026-11-08 |
| [USPS DMM archive, issue of April 6, 2026: 223 section 1.4 (the rule before July 12, 2026)](https://pe.usps.com/Archive/NHTML/DMMArchive20260406/223.htm) | see the document | 2026-11-08 |
| [USPS Notice 123 Price List, effective October 4, 2026](https://pe.usps.com/text/dmm300/Notice123.htm) | see the document | 2026-11-08 |
| [USPS Postal Explorer: Price Change (Time-Limited 2026 and January 2027)](https://pe.usps.com/PriceChange/Index) | see the document | 2026-11-08 |
| [USPS Postal Explorer, Price and SKU File Archive: price files effective July 12, 2026 (CSV)](https://pe.usps.com/PriceFile_Archive/CSV/PriceFile_Archive_20260712/Price%20Files%20-%20CSV.zip) | July 12, 2026 prices | 2026-11-08 |
| [USPS Postal Explorer, Price and SKU File Archive](https://pe.usps.com/Archive/PriceFile) | July 12, 2026 prices | 2026-11-08 |
| [USPS Notice 123 Price List, effective October 4, 2026 (Postal Explorer)](https://pe.usps.com/text/dmm300/Notice123.htm) | Time-limited prices, October 4, 2026 to January 17, 2027 | 2026-11-08 |
| [USPS Postal Explorer, Time-Limited 2026 Price Change: Notice 123 (final, revised 09/18/2026)](https://pe.usps.com/PriceChange/Index) | Time-limited prices, October 4, 2026 to January 17, 2027 | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests pin Notice 123 prices and fees to USPS's own files, dimensional weight under the rule in force and the rule before July 12, 2026, the weight rows, cubic tiers and soft packs, the nonstandard and noncompliance fees, refusals outside the loaded price lists, the sample adjustment with the $3 fee, the 60-day deadline, the dispute text, and that the packet PDF is the same bytes every time.

What its test suite asserts:

- Notice 123 prices and fees are pinned to USPS's own price files for both price lists, read November 8, 2026.
- Dimensional weight rounds up and divides by 139 since July 12, 2026 (nonrectangular Priority Mail still rounds off and divides by 166), and the weight rows, cubic tiers, soft packs and fees are checked.
- The sample adjustment matches USPS's numbers with the $3 fee and is all disputed at the seller's measurements; the 60-day deadline, the dispute text and the packet PDF's same bytes are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the USPS adjustment dispute checker tool](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/).

## Questions

### Is there any AI in the usps adjustment dispute checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the usps adjustment dispute checker refuse to answer?

It refuses labels with no loaded price list: before July 12, 2026, or from January 17, 2027 until the new Notice 123 is loaded. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the USPS adjustment dispute checker tool](https://krishnachagti-sudo.github.io/toll-preview/usps-adjustment-dispute/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/usps-adjustment-dispute/  
Data as of: 2026-11-04
