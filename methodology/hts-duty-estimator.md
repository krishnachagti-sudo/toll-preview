# How US import duty is estimated: HTS and Section 301 method

The duty is the HTS base rate plus each Section 301 layer for the origin, all on the customs value, as of November 8, 2026 under the 2026 HTS Revision 22. A cotton T-shirt (HTS 6109.10.00.12) from Vietnam worth $12.00 pays 16.5% base plus 12.5% (heading 9903.05.84): $3.48. A line a layer we have not read applies to is refused, not guessed.

## How does it work?

1. The HTS number is read as its digits (spaces, dots and hyphens dropped). It must be 8 or 10 digits and on a line of the revision; a 6-digit HS code, a chapter 98 or 99 number, or a number not in the revision makes the row incomplete, with the reason.
2. The base rate is the line's column 1 general rate.
3. Goods of North Korea, Belarus, Russia and Cuba take the column 2 rate (General Note 3).
4. Section 301 on goods of China (U.S. notes 20 and 31): lists 2 and 3 at 25%, list 4A at 7.5%, and the four-year-review increases in force on November 8, 2026.
5. Section 301 on 60 economies (U.S. note 52, read November 8, 2026): 17 at 10% and 38 at 12.5% on top of the base.

> Steps 6 to 10, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/hts-duty-estimator/#what) below.

## What does it not cover?

- It refuses, rather than estimates, any line that Section 232, a safeguard, a quota, the section 338 duties on Canada or the Russia note reach, and it never includes antidumping or countervailing duties.
- It does not classify goods: the HTS number is yours, and only CBP decides the classification at entry.
- Product exclusions, conditional exemptions and the MPF exemptions for goods under some trade agreements are named but not applied; a special rate is used only when you claim it, and the goods must meet the agreement's rules of origin.
- Rates are as of November 8, 2026. A Federal Register action published later is not in the answer until the data is rebuilt. Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 20 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The 2026 HTS Revision 22 (effective 10/30/2026) and the 14 Federal Register documents were read on November 8, 2026. The USITC release list and the newest Federal Register documents from USTR, the President and CBP are checked once a day for changes; a new revision or action is read by a person and the data rebuilt, with the tests that pin it.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The data is pinned to the 2026 HTS Revision 22, its read date and the SHA-256 hash of each source, and the counts of each Chapter 99 list are pinned (17 economies at 10%, 38 at 12.5%, 5 topped up).

- [USITC: Harmonized Tariff Schedule, JSON export](https://hts.usitc.gov/reststop/exportList?from=0101&to=9999.99.99&format=JSON&styles=false), 2026 HTS Revision 22, effective 10/30/2026, read 2026-11-08
- [USITC: HTS release list](https://hts.usitc.gov/reststop/releaseList), 2026 HTS Revision 22, effective 10/30/2026, read 2026-11-08
- [USITC: HTS Chapter 99 (U.S. notes and headings), current revision](https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099), 2026 HTS Revision 22, effective 10/30/2026, read 2026-11-08
- [USITC: HTS General Notes, current revision](https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes), 2026 HTS Revision 22, effective 10/30/2026, read 2026-11-08
- [eCFR: 19 CFR 24.24, harbor maintenance fee](https://www.ecfr.gov/current/title-19/chapter-I/part-24/section-24.24), eCFR, current text, read 2026-11-08
- [eCFR: 19 CFR 143.21, merchandise eligible for informal entry](https://www.ecfr.gov/current/title-19/chapter-I/part-143/subpart-C/section-143.21), eCFR, current text, read 2026-11-08
- [Federal Register: Executive Order 14389: Ending Certain Tariff Actions](https://www.federalregister.gov/d/2026-03832), 91 FR 9437, published 2026-02-25, read 2026-11-08
- [Federal Register: Proclamation: Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems (section 122)](https://www.federalregister.gov/d/2026-03824), 91 FR 9339, published 2026-02-25, read 2026-11-08
- [Federal Register: Memorandum of July 23, 2026: Actions in the Section 301 investigations of 60 economies (forced labor)](https://www.federalregister.gov/d/2026-15274), 91 FR 47717, published 2026-07-28, read 2026-11-08
- [Federal Register: USTR: Notice of Actions in Section 301 Investigations of Various Economies (forced labor)](https://www.federalregister.gov/d/2026-15181), 91 FR 47318, published 2026-07-28, read 2026-11-08
- [Federal Register: Memorandum: Action in the Section 301 investigation of Brazil](https://www.federalregister.gov/d/2026-14654), 91 FR 45619, published 2026-07-20, read 2026-11-08
- [Federal Register: USTR: Notice of Action: Brazil](https://www.federalregister.gov/d/2026-14542), 91 FR 45516, published 2026-07-20, read 2026-11-08
- [Federal Register: USTR: Continuation of Actions: China (technology transfer, intellectual property)](https://www.federalregister.gov/d/2026-20510), 91 FR 64212, published 2026-10-07, read 2026-11-08
- [Federal Register: USTR: Notice of Action: Nicaragua](https://www.federalregister.gov/d/2025-22690), 90 FR (Dec. 12, 2025), published 2025-12-12, read 2026-11-08
- [Federal Register: Proclamation: Adjusting Imports of Polysilicon and Its Derivatives (section 232)](https://www.federalregister.gov/d/2026-16400), 91 FR 51975, published 2026-08-11, read 2026-11-08
- [Federal Register: Proclamation: Temporary Suspension of Additional Duties To Offset Canadian Discrimination (section 338)](https://www.federalregister.gov/d/2026-17294), 91 FR 54789, published 2026-08-24, read 2026-11-08
- [Federal Register: Proclamation: Further Modifying the Scope of Products of Canada Subject to the Additional Duties (section 338)](https://www.federalregister.gov/d/2026-22292), 91 FR 68861, published 2026-10-30, read 2026-11-08
- [Federal Register: CBP: Customs User Fees To Be Adjusted for Inflation in Fiscal Year 2027](https://www.federalregister.gov/d/2026-15530), 91 FR (July 31, 2026), published 2026-07-31, read 2026-11-08
- [Federal Register: CBP: Indefinite Suspension of the De Minimis Exemption for Mail Shipments and New Postal Informal Entry Process](https://www.federalregister.gov/d/2026-12669), 91 FR 37801, published 2026-06-24, read 2026-11-08
- [Federal Register: CBP: Indefinite Suspension of the De Minimis Exemption for Merchandise Arriving Through All Modes Other Than the International Postal Network](https://www.federalregister.gov/d/2026-12670), 91 FR 37789, published 2026-06-24, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the us import duty estimator by hts code compute?

Given a product's HTS number, country of origin and customs value, the tool returns the US duty, layer by layer: the base rate from the USITC Harmonized Tariff Schedule (2026 HTS Revision 22, effective 10/30/2026), then each Section 301 duty that applies to that origin, each with its Chapter 99 heading, legal source and read date.

**In detail: operations, inputs and outputs**

It takes one SKU or a whole product list (up to 5,000 rows, or a CSV export from Shopify, Etsy or any store), adds the merchandise processing fee (MPF) and harbor maintenance fee (HMF) for one shipment, and returns the results as CSV. A free check lists which products are missing an HTS code, origin, weight or value. It uses the HTS code table of the industry code checker, so both tools read the same revision. Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice.

Operations (the op field):

- `estimate`: Estimates the duty for each row: the HTS line and its description, the base rate and its column, each additional layer with its heading, rate, duty and sources, any notes, and the total and effective rate; or why the row is refused or incomplete. Returns a summary of all rows, the duties not applied, dated changes after November 8, 2026, the results CSV, and with a shipment mode, MPF and HMF.
- `audit`: Reads a product CSV (and a Shopify inventory CSV joined by SKU) and says, row by row, which have no valid HTS code, no country of origin, no weight or no value, with the columns it read. Free.

Inputs:

- `rows`: For estimate: up to 5,000 rows, each with code (the 8- or 10-digit HTS number), origin (a two-letter code such as CN or a country name such as Vietnam) and value (the customs value in US dollars, such as 12.50), and optionally sku, title, quantity and weightKg.
- `csv`: Or the text of a product CSV (up to 5,000 rows and 190,000 characters). Columns are found by their header, such as HS Code, COO, Weight (kg) or Customs value.
- `inventoryCsv, platform`: A Shopify inventory CSV, joined to the products by SKU for its HS Code and COO columns; and shopify, etsy or generic (the default).
- `claimFta`: true to use the special rate of a trade program the line lists for the origin. Off by default.
- `shipment.mode`: ocean, air, truck, rail, express or mail: treats the rows as one shipment and adds MPF and, by ocean, HMF.
- `quantity, weightKg`: Needed only when a rate is per unit or per kilogram, such as "25.4¢/kg + 7.7%".

Outputs:

- answer: the duty, its share of the value, the read date and the revision, with each layer named; or why there is no estimate
- rows: each row's status (estimated, refused or incomplete), HTS line, base, layers, notes, refusals or problems, duty and effective rate
- summary: rows estimated, refused and incomplete, the total duty and value, and with a shipment the total including fees
- fees: the entry type and why, MPF and the rule used, HMF, and their sources
- notApplied (duties left out and why) and scheduled (dated changes after the read date)
- csv: one line per row, with the layers, the duty, the reason and the revision
- audit: the columns read, the counts missing each field, and each row's missing list

**Every step in full (10) and the rules**

1. The HTS number is read as its digits (spaces, dots and hyphens dropped). It must be 8 or 10 digits and on a line of the revision; a 6-digit HS code, a chapter 98 or 99 number, or a number not in the revision makes the row incomplete, with the reason. The origin is a two-letter ISO code or a country name; US-origin goods (chapter 98) are not covered. A row without a value is incomplete.
2. The base rate is the line's column 1 general rate. Rate text is read as Free, a percentage, or cents or dollars per kg, liter, each, pair, dozen, gross or metric ton, and sums of those; anything else (such as a rate on drained weight or per proof liter) is refused. A per-kg term uses weightKg; other units use quantity; a missing one refuses the row and names the field.
3. Goods of North Korea, Belarus, Russia and Cuba take the column 2 rate (General Note 3). With claimFta, the special rate is used when the line lists a program the origin belongs to: the agreements with Australia, Bahrain, Chile, Colombia, Israel, Jordan, Japan, South Korea, Morocco, Oman, Panama, Peru and Singapore, USMCA (S, S+) for Canada and Mexico, and CAFTA-DR (P, P+) for Costa Rica, Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua. Otherwise a note says the general rate was used.
4. Section 301 on goods of China (U.S. notes 20 and 31): lists 2 and 3 at 25%, list 4A at 7.5%, and the four-year-review increases in force on November 8, 2026. An 8-digit line under which list 4A names only some 10-digit numbers needs the 10 digits. A line on both a list and a four-year-review heading is refused. Product exclusions (9903.88.69, through November 9, 2026 and 9903.88.70, through November 9, 2026) are shown as notes, not applied. Hong Kong is a separate economy.
5. Section 301 on 60 economies (U.S. note 52, read November 8, 2026): 17 at 10% and 38 at 12.5% on top of the base. For the EU 10%, Japan 12.5%, South Korea 12.5%, Switzerland 12.5% and Taiwan 10%, the duty only tops the general rate up to that figure, and is nothing when the general rate is already at or above it; a line whose general rate needs a quantity is refused for them. Exempt: the lines listed in note 52(b), each country's own lists in note 52(j), goods claimed under USMCA, textiles and apparel claimed under CAFTA-DR, and books, newspapers, printed matter (headings 4901 to 4905) and artworks (9701 to 9703). Exemptions that depend on the article are notes, not applied.
6. Section 301 on goods of Brazil (U.S. note 50) at 25%, with its listed exemptions and the same informational materials. Section 301 on goods of Nicaragua (heading 9903.89.01) at the rate in force on November 8, 2026 (0% from January 1, 2026, 10% from January 1, 2027, 15% from January 1, 2028), except goods claimed under CAFTA-DR.
7. A line is refused when a Chapter 99 note this estimator does not compute names it for that origin, or a footnote on the line points to one: Argentine beef quota (U.S. note 7, Argentina only); Softwood lumber of Canada (U.S. note 13, Canada only); Section 232: aluminum, steel and copper articles and derivatives (U.S. note 16); Safeguard: chapter 84 goods (U.S. note 17); Safeguard: chapter 85 goods (U.S. note 18); Section 232: aluminum (U.S. note 19); Russia: column 2 and additional duties (U.S. note 30, Russia only); Fine denier polyester staple fiber (safeguard) (U.S. note 32); Section 232: passenger vehicles, light trucks and parts (U.S. note 33); Section 232: list in U.S. note 35 (U.S. note 35); Section 232: timber, lumber, upholstered furniture, kitchen cabinets and vanities (U.S. note 37); Section 232: medium- and heavy-duty vehicles, buses and parts (U.S. note 38); Section 232: semiconductors (U.S. note 39); Section 232: pharmaceuticals (U.S. note 40); Safeguard: U.S. note 41 (U.S. note 41); Section 232: unmanned aircraft systems (U.S. note 43); Section 338: products of Canada (alcoholic beverages, dairy, motor vehicles) (U.S. note 51, Canada only). Chapters 04, 22 and 87 from Canada are refused because the section 338 scope was changed by an annex published as images (FR 2026-22292). A refused row has no duty and is not charged.
8. The duty is the base plus every layer; the effective rate is the duty divided by the value. Each answer is dated to the read date of the data, not the day you ask.
9. Shipment fees (CBP fiscal year 2027, from October 1, 2026): the entry is formal when the rows' total value is over $2,500, or any article under a Chapter 99 heading is worth more than $250. Formal entry MPF is 0.3464% of value, at least $34.58 and at most $670.86; informal entry MPF is $2.77 (automated). HMF is 0.125% of value by ocean only. A shipment total is given only when every row has an estimate. Mail is refused: postal entries use their own process.
10. The audit reads the header row by name (SKU, Title, HS Code, COO, Weight in kg, grams or lb, Customs value or cost, else price), joins a Shopify inventory CSV by SKU, and marks each row missing a valid HTS code, an origin, a weight or a value. For an Etsy export without those columns, it says which columns to add.

**What is computed, and what is left out.**

Computed: the base rate, Section 301 on China, the 60 economies, Brazil and Nicaragua, and MPF and HMF. Refused: 9 Section 232 notes, safeguards, quotas, the section 338 duties on Canada and goods of Russia. Not applied: the IEEPA duties, ended by Executive Order 14389 (91 FR 9437); the section 122 surcharge, imposed for 150 days from February 24, 2026 (91 FR 9339); and antidumping and countervailing duties, which are set per producer and are not in the HTS.

**The data.**

Built by the tool's build script from the USITC JSON export, Chapter 99 and General Notes of the 2026 HTS Revision 22 and the 14 Federal Register documents named on this page, each with its SHA-256 hash, read on November 8, 2026. The HTS lines are the same file the industry code checker was built from.

## Which edge cases does it handle?

**The edge cases (6)**

- An 8-digit number that has 10-digit lines under it is estimated at the 8-digit rate, with a note to give the 10 digits on the entry.
- A four-year-review increase that starts after November 8, 2026 (such as 100% from November 10, 2026, heading 9903.91.14) is a note, not a layer.
- Goods of the EU, Japan, Korea, Switzerland and Taiwan with a general rate above the cap show the note 52 layer at 0%; a free line from Taiwan pays 10% in all.
- A product CSV with some rows refused or incomplete still estimates the rest; refused and unreadable rows are listed with the reason and refunded.
- Weights in grams or pounds are converted to kilograms; a value is taken from a customs value or cost column, and from the price only when there is none.
- Cells that a spreadsheet would read as a formula are written to the results CSV with a leading apostrophe.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A cotton T-shirt from Vietnam worth $12**

A cotton T-shirt from Vietnam worth $12

| Result | Value |
| --- | --- |
| answer | HTS 6109.10.00.12 from Vietnam, $12.00: $3.48 US duty (29% of value) as of November 8, 2026 under the 2026 HTS Revision 22: 16.5% base (column 1 general) + 12.5% Section 301 (forced labor), 60 economies (9903.05.84). |
| HTS line | 6109.10.00.12: T-shirts, singlets, tank tops and similar garments, knitted or crocheted: Of cotton: Men's or boys': Other T-shirts: Men's (338) |
| base | 16.5% (column 1 general): $1.98 |
| Section 301 (forced labor), 60 economies (9903.05.84) | 12.5%: $1.50 |
| duty | $3.48 |

**The input**

```json
{
  "op": "estimate",
  "rows": [
    {
      "code": "6109.10.00.12",
      "origin": "VN",
      "value": 12
    }
  ]
}
```

**More worked examples (4)**

**A soy candle from China worth $18: list 4A and the 60-economy duty together**

A soy candle from China worth $18: list 4A and the 60-economy duty together

| Result | Value |
| --- | --- |
| answer | HTS 3406.00.00 from China, $18.00: $3.60 US duty (20% of value) as of November 8, 2026 under the 2026 HTS Revision 22: free base (column 1 general) + 7.5% Section 301 China (list 4A) (9903.88.15) + 12.5% Section 301 (forced labor), 60 economies (9903.05.31). |
| base | Free (column 1 general) |
| Section 301 China (list 4A) (9903.88.15) | 7.5%: $1.35 |
| Section 301 (forced labor), 60 economies (9903.05.31) | 12.5%: $2.25 |
| duty | $3.60 |

**The input**

```json
{
  "op": "estimate",
  "rows": [
    {
      "code": "3406.00.00",
      "origin": "CN",
      "value": 18
    }
  ]
}
```

**A product CSV of six rows: three estimated, one refused, two incomplete**

A product CSV of six rows: three estimated, one refused, two incomplete

| Result | Value |
| --- | --- |
| answer | Of 6 rows, 3 have an estimate totalling $2.27 in US duty on $15.50 of goods (as of November 8, 2026, 2026 HTS Revision 22); 1 is refused (a layer we have not verified) and 2 are missing a code, origin or value. |
| TEE-WHT-M | $1.86 duty on $6.40 |
| CND-SOY-8 | $0.41 duty on $4.10 |
| MUG-CER-12 | incomplete: No HTS code |
| HAT-KNT-01 | incomplete: No country of origin |
| BTL-STL-20 | refused: Section 232: aluminum, steel and copper articles and derivatives: this line is named in U.S. note 16 to subchapter III of Chapter 99, which this estimator does not compute |
| BK-PRNT-01 | $0.00 duty on $5.00 |

**The input**

```json
{
  "op": "estimate",
  "csv": "SKU,Title,HS Code,COO,Weight (kg),Customs value\nTEE-WHT-M,Cotton T-shirt,6109.10.00.12,VN,0.18,6.40\nCND-SOY-8,Soy candle 8 oz,3406.00.00,IN,0.35,4.10\nMUG-CER-12,Ceramic mug,,CN,0.42,2.25\nHAT-KNT-01,Knit beanie,6505.00.20,,0.09,3.80\nBTL-STL-20,Steel water bottle,7323.93.00,CN,0.31,3.15\nBK-PRNT-01,Printed book,4901.99.00.92,GB,0.6,5.00"
}
```

**One ocean shipment from Japan: green tea, towels and toys, with MPF and HMF**

One ocean shipment from Japan: green tea, towels and toys, with MPF and HMF

| Result | Value |
| --- | --- |
| answer | Of 3 rows, 3 have an estimate totalling $379.10 in US duty on $3,350.00 of goods (as of November 8, 2026, 2026 HTS Revision 22). With formal entry fees (MPF $34.58, HMF $4.19) the shipment pays $417.87. |
| TEA-02 | $41.60 (9903.05.86 exempt) |
| TOW-03 | $112.50 (9903.05.49 at 3.4%) |
| TOY-04 | $225.00 (9903.05.49 at 12.5%) |
| entry | formal: the shipment is worth more than $2,500 |
| MPF | $34.58: 0.3464% of value, at least $34.58 and at most $670.86 (fiscal year 2027) |
| HMF | $4.19 |

**The input**

```json
{
  "op": "estimate",
  "rows": [
    {
      "sku": "TEA-02",
      "code": "0902.10.10",
      "origin": "JP",
      "value": 650
    },
    {
      "sku": "TOW-03",
      "code": "6302.60.00.20",
      "origin": "JP",
      "value": 900
    },
    {
      "sku": "TOY-04",
      "code": "9503.00.00.73",
      "origin": "JP",
      "value": 1800
    }
  ],
  "shipment": {
    "mode": "ocean"
  }
}
```

**Which rows of the same CSV are missing an HTS code, origin or weight**

Which rows of the same CSV are missing an HTS code, origin or weight

| Result | Value |
| --- | --- |
| answer | Of your 6 product rows, 1 has no valid HTS code, 1 no country of origin and 0 no weight; 4 are complete. |
| MUG-CER-12 | missing HTS code |
| HAT-KNT-01 | missing country of origin |

**The input**

```json
{
  "op": "audit",
  "csv": "SKU,Title,HS Code,COO,Weight (kg),Customs value\nTEE-WHT-M,Cotton T-shirt,6109.10.00.12,VN,0.18,6.40\nCND-SOY-8,Soy candle 8 oz,3406.00.00,IN,0.35,4.10\nMUG-CER-12,Ceramic mug,,CN,0.42,2.25\nHAT-KNT-01,Knit beanie,6505.00.20,,0.09,3.80\nBTL-STL-20,Steel water bottle,7323.93.00,CN,0.31,3.15\nBK-PRNT-01,Printed book,4901.99.00.92,GB,0.6,5.00"
}
```

## How is it tested?

The tests check rate text, each layer by origin, the exemptions, trade programs, column 2, every refusal, incomplete rows, MPF and HMF, the CSV readers and the results CSV.

**What its test suite asserts (3)**

- The data is pinned to the 2026 HTS Revision 22 (effective 10/30/2026), the read date 2026-11-08, the same HTS export as the code checker, and the SHA-256 hash of every Federal Register document.
- The Chapter 99 counts are pinned (17 economies at 10%, 38 at 12.5%, 5 topped up, the China lists, Brazil at 25%, the CBP fiscal year 2027 fees), and each layer, exemption, trade program and refusal is checked by origin.
- Incomplete rows, formal and informal entry with MPF limits and HMF by ocean, the Shopify and Etsy CSV readers, the results CSV and the prices are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the US import duty estimator by HTS code tool](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/).

## Questions

### Is there any AI in the us import duty estimator by hts code answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the us import duty estimator by hts code refuse to answer?

It refuses, rather than estimates, any line that Section 232, a safeguard, a quota, the section 338 duties on Canada or the Russia note reach, and it never includes antidumping or countervailing duties. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the US import duty estimator by HTS code tool](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/hts-duty-estimator/  
Data as of: 2026-11-04
