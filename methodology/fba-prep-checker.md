# How FBA prep is checked: Seller Central rules by product

Each product type maps to Amazon's prep guidance (12 rows). A bag is at least 1.5 mil and at most 3 inches past the product; an opening of 5 inches or more needs the suffocation warning, printed at 24 pt for 60 inches or more, 18 pt for 40 to 59 inches, 14 pt for 30 to 39 inches and 10 pt for less than 29 inches of bag length plus width. A non-hazmat liquid over 4.2 oz (125 ml) goes through Amazon's cap seal tree. Resellers need an FNSKU label since March 31, 2026.

## How does it work?

1. The sides are sorted longest, median and shortest, and centimeters are turned into inches. A longest side under 2.125 inches (2 1/8, a credit card) adds the small type on its own.
2. A product that would need Amazon to assemble several pieces, or a perishable product, is refused, and the answer says so first.
3. Each type adds its rows of Amazon's prep guidance table (Adult, Apparel on hanger, Apparel, fabric, plush, and textiles, Baby, Fragile, glass, Liquids (non-glass), Perforated packaging, Powder, pellets, and granular, Sharp, Small, Sold as set and No prep needed) and its steps: an opaque bag for adult products; the hanger removed; softlines bagged unless leather (boxed) or already in a sealed six-sided package (not for a baby product with exposed surfaces); footwear in its box with no material exposed; perforated packaging and loose powders bagged, a sealed powder given the shake test; bubble wrap for fragile, premium or collectible items, with the 3-foot drop test, and a box when it fails; puncture-resistant packaging for sharp items; a box for vinyl records; bubble wrap for a hardcover over $60 or a softcover over $75, a bag for a special cover or a loose item; a bag or box for small items; packaging for jewelry; a bag for scented items; a set label with the units' barcodes covered; rigid packaging notes for batteries; and dates on every unit and the outer box for expiring products.
4. Liquids follow Amazon's cap seal tree: a hazmat liquid is bagged (and boxed in a fragile container over 4.2 oz); with no volume the step is to measure it; 4.2 oz (125 ml) or less needs nothing more; a fragile container is bubble wrapped; cans, roll-ons and mascara need nothing; a screw-top jar needs no cap seal; a pump needs a cap seal and a spray bottle a bag unless it has both a secondary seal and a lock; a secondary seal is enough for other containers; a bottle with a twist, screw, push, clip or flip top, a tube with a screw, twist, clip or flip top, or a clip-top jar gets a cap seal, around a twist or screw cap and over the opening for the others; any other container needs none by the tree.
5. A unit over 10 lb that is boxed, or a sharp one, needs a double-wall corrugated box.

> Steps 6 to 11, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/fba-prep-checker/#what) below.

## What does it not cover?

- Rules are from Amazon's US Seller Central help pages, read November 8, 2026, and each step links the page it comes from. Amazon may change them or set product-specific prep in Send to Amazon; that guidance wins.
- Hazmat status and the 3-foot drop test are your answers; the tool does not classify products.
- Only the US store is covered, and only rules on public Seller Central pages.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 24 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every rule was read from Amazon's US Seller Central help pages on November 8, 2026 (data version amazon-prep-rules-2026-11-08). The pages are checked once a day for changes; a change means a person reads the page again before the data file is edited, with the tests that pin it.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests pin the data file to the pages as read on November 8, 2026: the 24 sources, the 12 prep categories, the bag, warning, cap seal, box, label and expiration numbers, and both size tier tables.

- [Amazon Seller Central help: Prepare your products for FBA shipping](https://sellercentral.amazon.com/help/hub/reference/external/201021850), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Prep guidance](https://sellercentral.amazon.com/help/hub/reference/external/GF4G7547KSLDX2KC), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Product packaging requirements](https://sellercentral.amazon.com/help/hub/reference/external/G200141500), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Bagging requirements](https://sellercentral.amazon.com/help/hub/reference/external/G201685210), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Bubble wrap requirements](https://sellercentral.amazon.com/help/hub/reference/external/G201685300), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Boxing requirements](https://sellercentral.amazon.com/help/hub/reference/external/G201685340), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Cap seal requirements](https://sellercentral.amazon.com/help/hub/reference/external/GM6RPXLLRCECY5UB), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Opaque covering requirements](https://sellercentral.amazon.com/help/hub/reference/external/G201686220), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Liquid products](https://sellercentral.amazon.com/help/hub/reference/external/G200280130), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Granular products](https://sellercentral.amazon.com/help/hub/reference/external/G200280140), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Fragile products](https://sellercentral.amazon.com/help/hub/reference/external/G200280160), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Softlines and baby products](https://sellercentral.amazon.com/help/hub/reference/external/G200280180), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Small products and jewelry](https://sellercentral.amazon.com/help/hub/reference/external/G200942930), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Adult products](https://sellercentral.amazon.com/help/hub/reference/external/G200505410), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Packaging sharp units](https://sellercentral.amazon.com/help/hub/reference/external/G200280150), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Batteries](https://sellercentral.amazon.com/help/hub/reference/external/G201809280), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: FBA barcode requirements](https://sellercentral.amazon.com/help/hub/reference/external/G201100910), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Use Amazon barcodes for FBA](https://sellercentral.amazon.com/help/hub/reference/external/G200141490), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: FBA barcode choice and labeling FAQ](https://sellercentral.amazon.com/help/hub/reference/external/GEFKUGES6NSE7CBP), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Expiration dates on FBA products](https://sellercentral.amazon.com/help/hub/reference/external/201003420), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Product size tiers](https://sellercentral.amazon.com/help/hub/reference/external/G5KW835AHDJCH8W), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Dimensional weight](https://sellercentral.amazon.com/help/hub/reference/external/G53Z9EKF8VVZVH29), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: Shipping and routing requirements](https://sellercentral.amazon.com/help/hub/reference/external/G200141510), US store, public help page, read 2026-11-08
- [Amazon Seller Central help: FBA Prep Service](https://sellercentral.amazon.com/help/hub/reference/external/G201023020), US store, public help page, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the fba prep checker compute?

The tool takes what a product is (its types, size, weight, liquid container, bag, barcode and expiration date) and returns the prep Amazon's US Seller Central help pages ask for, one step at a time, each with the reason and the page it comes from: poly bag, bubble wrap, box, cap seal, opaque bag, set label, the suffocation warning and its print size, FNSKU or manufacturer barcode, the expiration-date label, and the size tier under the 2026 and 2027 tables. It checks a whole shipment list and prints FNSKU labels, warning stickers, "Sold as set" labels and expiration labels as PDFs. Not affiliated with Amazon. Amazon says determining the prep your products need is your responsibility; this is a checklist, not a promise that a shipment will be accepted. Hazmat (dangerous goods) status and the 3-foot drop test are your answers; this tool does not classify products.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `check`: Checks one product: the prep categories that apply, each step with its reason and source page, the bag checked against thickness, fit and the warning rule, the labels to print, the barcode answer, the 2026 and 2027 size tiers, the box weight, the expiration dates, notes, and anything Amazon does not accept. One product checked on the tool's page is free.
- `plan`: Runs the check for a list of up to 500 products, sent as products or as a CSV of up to 200,000 characters, and returns each verdict, totals (bags, warning stickers, bubble wrap, boxes, cap seals, set labels, FNSKU labels, refused) and a checklist CSV with one row per product.
- `labels`: Makes a PDF of FNSKU labels (Code 128 barcode, the FNSKU, the product name and the condition) on one of Amazon's label sheets or on thermal labels, up to 3,000 labels and 500 copies of one label, at 203, 300 or 600 dpi, from any starting position on the sheet, with an optional nudge and outlines. A reprint of the same batch within 14 days is free.
- `sheet`: Makes a free PDF of one kind of label: suffocation warnings at the print size a bag needs, "Sold as set" labels, expiration-date labels for units, expiration labels for the outer box, or a plain-paper alignment test for a label sheet.
- `rules`: Returns the dated rule tables (prep categories, bag, cap seal, small items, baby, books, box, labels, expiration and size tiers, and the FBA Prep Service fees with their end date) and the 24 Seller Central pages they come from. Free.

Inputs:

- `product.types`: Any of: adult (adult); apparel-hanger (apparel on hanger); apparel (apparel, fabric, plush, and textiles); baby (baby (for a child aged three years or younger)); fragile (fragile, glass); liquid (liquid, paste, gel or cream); perforated (perforated packaging); granular (powder, pellets, and granular); sharp (sharp); small (small (longest side under 2 1/8 in)); set (sold as set); jewelry (jewelry); footwear (footwear); book (book); battery (batteries or a battery product); scented (heavily scented); leather (leather or another material bags can damage); vinyl (vinyl record); collectible (collectible); premium (premium or high retail value); expiring (expiration-dated (has a shelf life)).
- `product.dims, product.weight`: Length, width and height in inches or centimeters, and weight in lb, oz, kg or g. They decide the small-item rule, the bag size and the size tier.
- `product.liquid`: For a liquid: volume in oz or ml, container (bottle, tube, jar, pump, spray, roll-on, can, mascara, other), lid, and whether it is hazmat, has a secondary seal, a locking mechanism or a fragile container.
- `product.bag`: The bag you intend to use: width, length, opening, unit, thickness in mil, and whether the warning is printed on it.
- `product.barcode`: seller (brand or reseller), whether the product has a manufacturer barcode, and whether it has a GTIN exemption.
- `product.book, product.expiry`: A book's cover, price, special cover or loose item; an expiration date (YYYY-MM or YYYY-MM-DD) with a shelf-life row from Amazon's table or the days to use it in full.
- `product (other)`: name, sku, fnsku, dropTest (passed, failed or not-tested), unitsPerBox, setHasAsins, needsAssembly, perishable, sealedBox, babyExposed and hanger.
- `onDate`: For check and plan: a date written YYYY-MM-DD to say which size tier table applies (the 2027 table from January 15, 2027).
- `products or csv`: For plan: up to 500 products, or a CSV with a header row naming columns such as name, sku, types (separated by \| or ;), length, width, height, weight, seller, volume, container and lid.
- `batch, labels, stock`: For labels: a batch name, the labels (fnsku of 10 letters and digits, name, condition and copies), and stock as one of the sheets (a4-21, a4-24, a4-24-646, a4-24-66, a4-24-70-36, a4-24-70-37, a4-27, letter-30, a4-40, a4-44) or a thermal size in inches.
- `kind, count, pt, bag, paper, text, date`: For sheet: the kind of label, how many, the print size, the bag (to pick the warning size), Letter or A4, the set wording ("Sold as set", "Ready to ship" and "This is a set. Do not separate.") and the expiration date.

Outputs:

- answer: one sentence naming everything the product needs, or why Amazon does not accept it as it is
- categories: Amazon's prep guidance rows that apply, with their steps as written
- steps: each prep step with what to do, why, and the Seller Central page it comes from
- bag: the bag size, its checks, and the suffocation warning (required or not, the minimum print size and the table row)
- labels, barcode: the labels to print and whether an FNSKU label is needed, with the reason
- size: the 2026 and 2027 size tiers with shipping weight, dimensional weight and length plus girth, and which applies on onDate
- box, expiry, notes, refused and sources
- plan: totals and a checklist CSV; labels and sheet: the PDF with its file name and size

**Every step in full (11) and the rules**

1. The sides are sorted longest, median and shortest, and centimeters are turned into inches. A longest side under 2.125 inches (2 1/8, a credit card) adds the small type on its own.
2. A product that would need Amazon to assemble several pieces, or a perishable product, is refused, and the answer says so first.
3. Each type adds its rows of Amazon's prep guidance table (Adult, Apparel on hanger, Apparel, fabric, plush, and textiles, Baby, Fragile, glass, Liquids (non-glass), Perforated packaging, Powder, pellets, and granular, Sharp, Small, Sold as set and No prep needed) and its steps: an opaque bag for adult products; the hanger removed; softlines bagged unless leather (boxed) or already in a sealed six-sided package (not for a baby product with exposed surfaces); footwear in its box with no material exposed; perforated packaging and loose powders bagged, a sealed powder given the shake test; bubble wrap for fragile, premium or collectible items, with the 3-foot drop test, and a box when it fails; puncture-resistant packaging for sharp items; a box for vinyl records; bubble wrap for a hardcover over $60 or a softcover over $75, a bag for a special cover or a loose item; a bag or box for small items; packaging for jewelry; a bag for scented items; a set label with the units' barcodes covered; rigid packaging notes for batteries; and dates on every unit and the outer box for expiring products.
4. Liquids follow Amazon's cap seal tree: a hazmat liquid is bagged (and boxed in a fragile container over 4.2 oz); with no volume the step is to measure it; 4.2 oz (125 ml) or less needs nothing more; a fragile container is bubble wrapped; cans, roll-ons and mascara need nothing; a screw-top jar needs no cap seal; a pump needs a cap seal and a spray bottle a bag unless it has both a secondary seal and a lock; a secondary seal is enough for other containers; a bottle with a twist, screw, push, clip or flip top, a tube with a screw, twist, clip or flip top, or a clip-top jar gets a cap seal, around a twist or screw cap and over the opening for the others; any other container needs none by the tree.
5. A unit over 10 lb that is boxed, or a sharp one, needs a double-wall corrugated box.
6. The bag: without a bag given, the smallest flat bag is taken as (width + height) by (length + height), which is geometry, not an Amazon rule. A bag given is checked at 1.5 mil or more, not smaller than that, and not more than 3 inches past it. An opening of 5 inches or more needs the warning, at 24 pt for 60 inches or more, 18 pt for 40 to 59 inches, 14 pt for 30 to 39 inches and 10 pt for less than 29 inches of length plus width; Amazon's table leaves gaps between rows, and there the larger size is used and the answer says so. A warning printed on the bag needs no sticker.
7. The barcode: a brand owner with a manufacturer barcode and no GTIN exemption can use it with no FNSKU sticker; a reseller needs an FNSKU label since March 31, 2026; a product with no manufacturer barcode or with a GTIN exemption needs one; with no answer the step says to state which seller you are. A bagged or wrapped product gets the barcode on the outside, flat, 0.25 in from the edge.
8. The size tier is worked out under the 2026 table (through January 14, 2027) and the 2027 table (from January 15, 2027). Dimensional weight is length x width x height / 139, with width and height at least 2 inches for bulky and larger tiers. Small standard uses the unit weight, the other tiers the greater of unit and dimensional weight, and the heaviest tier the unit weight. Overmax (2026) and the flat and overhang handling fees (2027) are noted.
9. A box of several units is checked against 50 lb (40 lb for jewelry), with the most units per box when over; one unit over 50 lb is labeled Team Lift and over 100 lb Mechanical Lift.
10. An expiration date is printed MM-YYYY. The days it must have left at check-in come from Amazon's shelf-life table (16 rows, 90 to 900 days) or the days to use it in full plus 90, and the latest check-in day is the date less those days. The outer box label is 36 pt or larger.
11. FNSKU labels are Code 128 with the FNSKU, name and condition, 0.25 in clear at the sides and 0.125 in at the top and bottom, the bar width snapped to whole printer dots. Amazon gives each sheet's label size, count and paper, not positions, so the grid is centered on the page. One A4 sheet that cannot fit its labels is left out. Thermal labels are between 1 x 2 and 2 x 3 inches. The PDF asks for no print scaling, and the same input gives the same bytes.

**Amazon Seller Central help (US).**

Every rule is transcribed from 24 public Seller Central help pages, read November 8, 2026 without signing in, and every step names its page. Wording in quotes, such as the suffocation warning, is Amazon's.

Where Amazon's own pages disagree or leave a gap, the stricter reading is used and the step says so.

**FBA Prep Service.**

The rule tables keep Amazon's FBA Prep Service fees for shipments created before January 1, 2026, for reference; no step uses them.

## Which edge cases does it handle?

**The edge cases (5)**

- A bag with length plus width of 29.5 inches falls in a gap of Amazon's table: the warning prints at 14 pt, the larger size, and the answer says the table skips that size.
- A 4.99-inch bag opening needs no warning; 5 inches does. 12.7 cm counts as 5 inches.
- A pump with a secondary seal but no lock still needs a cap seal; a spray bottle the same needs a bag.
- A product given no types and no reason to prep needs no extra prep, only an FNSKU label if you are a reseller.
- An FNSKU that is not 10 letters and digits, a label sheet that cannot fit A4, a thermal label outside Amazon's sizes, or a warning on a barcode label sheet is refused before anything runs.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A folded T-shirt in a 10 x 13 in bag, sold by a reseller**

A folded T-shirt in a 10 x 13 in bag, sold by a reseller

| Result | Value |
| --- | --- |
| answer | Cotton T-shirt, size M needs a transparent poly bag (1.5 mil or thicker), a suffocation warning sticker at 10 pt or larger and an FNSKU label on the outside. |
| step 1 | Bag it in a sealed transparent poly bag (or shrink wrap), at least 1.5 mil, folded to its smallest size, with a suffocation warning. |
| step 2 | Put the barcode on the outside of the bag or wrap (or use a clear bag it scans through), flat, not on a corner or curve, 0.25 in from the edge. |
| suffocation warning | 10 pt or larger: length plus width 23 in (less than 29 inches) |
| barcode | Since 2026-03-31, resellers must use Amazon barcodes (FNSKU, X00 labels) even when the product has a manufacturer barcode. |
| size tier | Large standard-size (2026 table), Large standard (2027 table) |

**The input**

```json
{
  "op": "check",
  "product": {
    "name": "Cotton T-shirt, size M",
    "types": [
      "apparel"
    ],
    "dims": {
      "length": 10,
      "width": 8,
      "height": 1,
      "unit": "in"
    },
    "weight": {
      "value": 6,
      "unit": "oz"
    },
    "bag": {
      "width": 10,
      "length": 13,
      "unit": "in",
      "mil": 1.5
    },
    "barcode": {
      "seller": "reseller"
    }
  }
}
```

**More worked examples (3)**

**A 16 oz pump bottle of lotion with no secondary seal, sold by the brand**

A 16 oz pump bottle of lotion with no secondary seal, sold by the brand

| Result | Value |
| --- | --- |
| answer | Shea body lotion 16 fl oz needs a cap seal and its manufacturer barcode, scannable on the outside (no FNSKU sticker). |
| step 1 | Apply a cap seal vertically over the top of the pump, attached to the bottle on both sides. A pump bottle with no secondary seal needs a cap seal. |
| barcode | Brand owners (Brand Registry brand representative) can use the manufacturer barcode without an Amazon barcode sticker, if the product is eligible. |

**The input**

```json
{
  "op": "check",
  "product": {
    "name": "Shea body lotion 16 fl oz",
    "types": [
      "liquid"
    ],
    "dims": {
      "length": 7,
      "width": 2.6,
      "height": 2.6
    },
    "weight": {
      "value": 1.2,
      "unit": "lb"
    },
    "liquid": {
      "volume": 16,
      "unit": "oz",
      "container": "pump",
      "secondarySeal": false
    },
    "barcode": {
      "seller": "brand",
      "manufacturerBarcode": true
    }
  }
}
```

**A shipment list of five SKUs sent as CSV**

A shipment list of five SKUs sent as CSV

| Result | Value |
| --- | --- |
| answer | 5 products: 2 need a bag (1 with a warning sticker), 1 bubble wrap, 0 a box, 1 a cap seal, 1 a set label and 5 an FNSKU label. |
| TS-BLK-M | Cotton T-shirt black M needs a transparent poly bag (1.5 mil or thicker), a suffocation warning sticker at 10 pt or larger and an FNSKU label on the outside. |
| LOT-16 | Shea body lotion 16 fl oz needs a cap seal and an FNSKU label on the outside if you are a reseller. |
| MUG-2 | Ceramic mug set of 2 needs bubble wrap, a "Sold as set" label and an FNSKU label on the outside. |
| KNF-8 | Chef knife 8 in needs puncture-resistant sharp packaging and an FNSKU label on the outside. |
| EAR-01 | Stud earrings needs a transparent poly bag (1.5 mil or thicker), no suffocation warning (bag opening under 5 in) and an FNSKU label on the outside. |

**The input**

```json
{
  "op": "plan",
  "csv": "sku,name,types,length,width,height,weight,weight_unit,seller,volume,container,lid\r\nTS-BLK-M,Cotton T-shirt black M,apparel,10,8,1,6,oz,reseller,,,\r\nLOT-16,Shea body lotion 16 fl oz,liquid,7,2.6,2.6,1.2,lb,brand,16,pump,\r\nMUG-2,Ceramic mug set of 2,fragile|set,9,5,4.5,1.9,lb,reseller,,,\r\nKNF-8,Chef knife 8 in,sharp,13,2,1,8,oz,reseller,,,\r\nEAR-01,Stud earrings,jewelry,1.5,1,0.4,0.4,oz,reseller,,,"
}
```

**Suffocation warning stickers for a 10 x 13 in bag (PDF)**

Suffocation warning stickers for a 10 x 13 in bag (PDF)

| Result | Value |
| --- | --- |
| answer | 20 suffocation warnings at 10 pt, 24 per Letter sheet (4 x 0.83 in each, cut on the dashed lines), with Amazon's wording. A 10 x 13 in bag: length plus width is 23 in, so the warning prints at 10 pt or larger (less than 29 inches). |
| file | suffocation-warning-10pt.pdf, 1 sheet of 24 |

**The input**

```json
{
  "op": "sheet",
  "kind": "warning",
  "bag": {
    "width": 10,
    "length": 13
  },
  "count": 20
}
```

## How is it tested?

They check the warning print size at each edge and gap, the bag rules, every branch of the cap seal tree, each product type, books and small items, the barcode by seller, Amazon's own size tier examples and boundaries, expiration dates, box weights, the sample shipment list and its CSV, Code 128 against reportlab, the label sheet layouts and the PDFs.

**What its test suite asserts (3)**

- The rule file is pinned to Amazon's US Seller Central help pages as read on 2026-11-08: the 24 sources, the 12 prep categories, the bag, warning, cap seal, box, label and expiration numbers, and the 2026 and 2027 size tier tables.
- The warning print size at each row and gap, the bag rules, every branch of the cap seal tree, each product type, the barcode by seller, and Amazon's own size tier examples are checked.
- The sample shipment list and its checklist CSV, Code 128 against reportlab, the label sheet layouts and the label PDFs (same bytes each time) are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the FBA prep checker tool](https://krishnachagti-sudo.github.io/toll-preview/fba-prep-checker/).

## Questions

### Is there any AI in the fba prep checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the fba prep checker refuse to answer?

Rules are from Amazon's US Seller Central help pages, read November 8, 2026, and each step links the page it comes from. Amazon may change them or set product-specific prep in Send to Amazon; that guidance wins. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the FBA prep checker tool](https://krishnachagti-sudo.github.io/toll-preview/fba-prep-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/fba-prep-checker/  
Data as of: 2026-11-04
