# How GPSR listings are checked: method and sources

Each SKU is checked against the 4 items of Article 19 of Regulation (EU) 2023/988, which applies from 2024-12-13: (a) the manufacturer's name, postal and electronic address, (b) an EU responsible person when the manufacturer is outside the EU, (c) a picture, the type and an identifier, and (d) warnings in a language of each of the 27 Member States you sell into. A finding is missing or to check; the tool never says a product is safe.

## What does the gpsr listing checker compute?

The tool reads a listing export from Amazon, Etsy, eBay, Shopify or any CSV, finds the columns that hold each Article 19 item, and checks every SKU. Each SKU gets a verdict (ok, check, missing or out of scope) and a list of findings, each cited to its article, with what to fix. The answer also has a fix list CSV, a checklist CSV and a label block per SKU. Two more operations say whether a manufacturer in a given country needs an EU responsible person, and return the rule set and the 27 Member States with their official EU languages.

Operations (the op field):

- `check`: Checks a file of listings, given as rows (a list of objects) or as csv text, one of the two. Options: platform (generic, amazon, etsy, ebay, shopify), markets (the EU countries you sell into), columns (your header for a field the tool does not recognize) and defaults (shop-wide manufacturer and responsible person details that fill blank cells). The answer has a summary, one result per SKU, labels, fixCsv, checklistCsv and the columns used and ignored.
- `responsible-person`: For one manufacturer country, says whether the listing must show an EU responsible person, who can be one under Article 4(2) of Regulation (EU) 2019/1020, and what the listing must show. With rpCountry it also says whether a responsible person in that country is established in the EU. Free.
- `rules`: Returns the four Article 19 items quoted from EUR-Lex, the date they apply from, the Article 2(2) exclusions, the 27 Member States with their official EU languages, the channel sources and the read date. Free.

Inputs:

- `rows or csv`: The listings. CSV text of at most 100,000 characters, at most 5,000 rows in one file, and at most 2,000 characters in a cell. The file needs a SKU, title or handle column.
- `columns`: Optional: maps a field (such as manufacturerName) to the header that holds it, for headers the tool does not know.
- `platform`: Optional: generic, amazon, etsy, ebay, shopify (default generic). shopify joins variant rows to their product; amazon checks where safety documents are hosted.
- `markets`: Optional: up to 27 EU countries as codes or names, such as DE, France or EL. A country outside the EU is refused.
- `defaults`: Optional: the manufacturer's and the responsible person's name, postal address, email and country, and the warning languages, used only where a row is blank.
- `manufacturerCountry, rpCountry`: For responsible-person: the manufacturer's country, and optionally the responsible person's, as a code or a name. A country the tool does not know is refused.

Outputs:

- answer: how many SKUs are missing an Article 19 item, the most common gap, and how many need a check by hand
- results: per SKU, the line, verdict, whether a responsible person is needed, the manufacturer country, the warning languages declared and detected, and the findings with article and fix
- labels: a block per SKU with the manufacturer, the responsible person when needed and the identifiers
- fixCsv and checklistCsv: the fix list and the checklist as spreadsheets
- columnsUsed and columnsIgnored: which header was read as which field

## How is it calculated, step by step?

1. The file is read. For CSV, the delimiter is whichever of comma, tab and semicolon appears most often in the first line outside quotes; quoted cells may hold the delimiter, doubled quotes and line breaks; a leading byte order mark and blank rows are dropped. A quote that is never closed is refused.
2. Each header is matched to a field by name, compared in lower case with "#1"-style indexes and everything but letters and digits removed, so "Variant SKU" and "variant\_sku" are one header. The names cover Amazon, Etsy, eBay and Shopify exports; columns maps any other. The first header for a field wins. With platform shopify, a variant row takes the product's fields from the row above with the same handle, and a row with no SKU or barcode is an extra image row, not a SKU.
3. Shop-wide defaults fill only the blank manufacturer, responsible person and warning language cells. A row marked as one of the Article 2(2) exclusions is out of scope and not checked.
4. Item (a): the manufacturer's name is required; with no manufacturer column, a brand is used and flagged to check that it is the registered trade name or mark. The postal address is required, and flagged to check if it has no digit or fewer than two parts. The electronic address must be an email address; a web address is flagged to check (Commission guidelines, section 3.1.1), and anything else is missing.
5. Item (b): the manufacturer's country is read from a country column, or else from the last parts of its address. An EU country needs no responsible person; a country outside the EU does, and then the responsible person's name, postal address and email address are each required. A responsible person outside the EU is missing; one in Norway, Iceland or Liechtenstein is flagged to check. An unknown manufacturer country with no responsible person given is flagged to check.
6. Item (c): a picture is required, and flagged to check if it is not a web address. One of type, model, MPN, barcode or batch number is required. Barcodes of 8, 12, 13 or 14 digits are checked against the GS1 mod-10 check digit. A row with no title is flagged to check.
7. Item (d): when there are warnings, their languages are read from a language column (codes such as de, de\_DE, or names such as German or Deutsch), or else guessed from the text: Greek and Bulgarian by their script, other languages by common safety words, with at least 2 hits and more than any other language. Each chosen market none of whose official EU languages is among them is flagged. No warnings at all is flagged to check, unless the row is marked noWarningsNeeded or carries Amazon's gpsr\_safety\_attestation as true.
8. On Amazon, a safety document hosted on drive.google.com, docs.google.com, dropbox.com, www.dropbox.com, dl.dropboxusercontent.com is missing, since Amazon does not take those links.
9. Each SKU is missing if any finding is missing, check if any finding needs a check, and ok otherwise. A label block is printed only when the manufacturer's name, postal and electronic address are present and, when needed, the responsible person's too, in the EU.

**Regulation (EU) 2023/988, Article 19.**

The offer must show: (a) name, registered trade name or registered trade mark of the manufacturer, as well as the postal and electronic address at which they can be contacted; (b) where the manufacturer is not established in the Union, the name, postal and electronic address of the responsible person within the meaning of Article 16(1) of this Regulation or Article 4(1) of Regulation (EU) 2019/1020; (c) information allowing the identification of the product, including a picture of it, its type and any other product identifier; and (d) any warning or safety information to be affixed to the product or to the packaging or included in an accompanying document in accordance with this Regulation or the applicable Union harmonisation legislation in a language which can be easily understood by consumers, as determined by the Member State in which the product is made available on the market.

The regulation applies from 2024-12-13 (Article 52). Article 2(2) leaves out 9 kinds of product, among them food, feed, medicinal products and antiques.

**Regulation (EU) 2019/1020, Article 4(2).**

A manufacturer established in the EU is itself the operator. Otherwise the responsible person can be an importer, where the manufacturer is not established in the Union; an authorised representative who has a written mandate from the manufacturer designating the authorised representative to perform the tasks set out in paragraph 3 on the manufacturer's behalf; or a fulfilment service provider established in the Union with respect to the products it handles, where no other economic operator as mentioned in points (a), (b) and (c) is established in the Union.

**Commission guidelines C/2025/6233.**

An electronic address can be an e-mail address or dedicated section of your website that enables consumers to contact you directly and easily. A website is not in itself sufficient if it does not allow direct communication with you.

**Member State languages.**

The 27 Member States and their 24 official EU languages are as each country's page on european-union.europa.eu lists them. Article 19(d) leaves the language of warnings to each Member State; the check compares with the official EU languages, and a national rule can ask for more.

## Which edge cases does it handle?

- A file with no SKU, title or handle column is refused with a hint to map one with columns.
- A brand with no manufacturer column is flagged to check, not counted as missing, and a brand used this way is still printed on the label.
- A country is read from a code, an English name or a native name such as Deutschland; a country column wins over the address.
- An unknown manufacturer country with a responsible person given checks that person as if one were needed.
- A barcode that is not 8, 12, 13 or 14 digits is not checked; one with a wrong last digit is flagged, since a typo there identifies another product.
- A warning language the tool does not know is flagged as not recognized, and a guess needs at least 2 common words and a clear lead.
- In the fix list CSV, a cell that starts like a spreadsheet formula is written as text.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Five listings for Germany and France: which SKUs miss what**

```json
op: "check"
csv: "sku,title,manufacturer,manufacturer address,manufacturer email,responsible person,responsible person address,responsible person email,image url,type,gtin,warnings,warning language,excluded\r\nMUG-01,Stoneware mug 350 ml,Harbor & Pine LLC,\"412 Elm St, Portland, OR 97205, USA\",safety@harborpine.example,EuroRep GmbH,\"Hauptstr. 5, 10115 Berlin, Germany\",gpsr@eurorep.example,https://cdn.example.com/mug-01.jpg,Mug,0012345678905,\"Nicht für die Mikrowelle geeignet. Ne pas utiliser au micro-ondes.\",\"de, fr\",\r\nKNIFE-02,Paring knife,Harbor & Pine LLC,\"412 Elm St, Portland, OR 97205, USA\",safety@harborpine.example,Brit Rep Ltd,\"1 High St, London, UK\",rep@britrep.example,https://cdn.example.com/knife-02.jpg,Kitchen knife,4006381333931,Sharp blade. Keep away from children.,en,\r\nCANDLE-03,Soy candle,Harbor & Pine LLC,\"412 Elm St, Portland, OR 97205, USA\",https://harborpine.example,EuroRep GmbH,\"Hauptstr. 5, 10115 Berlin, Germany\",gpsr@eurorep.example,https://cdn.example.com/candle-03.jpg,Candle,4006381333932,Kerze nie unbeaufsichtigt brennen lassen. Von Kindern fernhalten.,,\r\nTRAY-04,Serving tray,Harbor & Pine LLC,\"412 Elm St, Portland, OR 97205, USA\",safety@harborpine.example,,,,,,,,,\r\nJAM-05,Fig jam,Harbor & Pine LLC,\"412 Elm St, Portland, OR 97205, USA\",safety@harborpine.example,,,,,,,,,food"
markets: 2 items
columns: {...}
```

Five listings for Germany and France: which SKUs miss what

| Result | Value |
| --- | --- |
| answer | Your file has 5 SKUs; 2 are missing a GPSR Article 19 item. 1 more needs a check by hand. 1 marked out of scope. |
| markets | DE, FR |
| line 2: MUG-01 | ok |
| line 3: KNIFE-02 | missing (missing rp-outside-eu, check warning-language) |
| line 4: CANDLE-03 | check (check manufacturer-website, check gtin-check-digit, check warning-language) |
| line 5: TRAY-04 | missing (missing rp-name, missing rp-postal, missing rp-electronic, missing picture, missing identifier, check warnings) |
| line 6: JAM-05 | out-of-scope |
| label blocks printed for | MUG-01, CANDLE-03 |

**A US manufacturer with a responsible person in the United Kingdom**

```json
{
  "op": "responsible-person",
  "manufacturerCountry": "US",
  "rpCountry": "United Kingdom"
}
```

A US manufacturer with a responsible person in the United Kingdom

| Result | Value |
| --- | --- |
| answer | A manufacturer in the United States is outside the EU, so every listing must also show the name, postal and electronic address of an EU responsible person (Article 19(b)): an importer, an authorised representative with a written mandate, or a fulfilment service provider established in the EU. |
| responsible person needed | yes |
| responsible person in the EU | no |
| note | A responsible person in the United Kingdom is not established in the EU, so it cannot be the responsible person (Article 16(1)). |

## What does it not do?

- It checks what the listing data shows against Article 19. It does not certify that a product is safe or compliant, and it cannot confirm that an address is real or that a company is established in the EU.
- Each Member State decides the language of warnings. The check compares with that state's official EU languages; national rules can ask for more.
- Products under other EU product laws (toys, cosmetics, electrical goods and more) can need further warnings and marks that this check does not cover.
- How the rules apply in Norway, Iceland and Liechtenstein (the EEA Agreement) and in Northern Ireland (the Windsor Framework) is not applied; those cases are flagged with a note.

## Where does the data come from, and how fresh is it?

The rule texts were read on EUR-Lex on 2026-11-08, the Member State languages on european-union.europa.eu on 2026-11-08, and the channel field names on each channel's own pages on 2026-11-08. They are read once when the server starts and change only with a deploy (data version gpsr-2023-988+guidelines-c2025-6233+read-2026-11-08).

- [EUR-Lex: Regulation (EU) 2023/988 on general product safety (GPSR), OJ L 135, 23.5.2023, p. 1 (read 2026-11-08)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988)
- [EUR-Lex: Commission Notice C/2025/6233: Guidelines on the application of the EU general product safety legislative framework by businesses, OJ C, 21.11.2025 (read 2026-11-08)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:C_202506233)
- [EUR-Lex: Regulation (EU) 2019/1020 on market surveillance and compliance of products, Article 4 (read 2026-11-08)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019R1020)
- [European Union: EU countries (country profiles) (read 2026-11-08)](https://european-union.europa.eu/principles-countries-history/eu-countries_en)
- [Amazon Selling Partner API changelog: attributes for GPSR in programmatic listings submissions (read 2026-11-08)](https://developer-docs.amazon/sp-api/changelog/developers-can-use-attributes-in-their-programmatic-listings-submissions-to-comply-with-gpsr)
- [Etsy Help: What is the General Product Safety Regulation (GPSR)? (read 2026-11-08)](https://help.etsy.com/hc/en-us/articles/28211364687383-What-is-the-General-Product-Safety-Regulation-GPSR)
- [eBay Help: Product safety disclosures and hazardous materials labelling (read 2026-11-08)](https://www.ebay.com/help/selling/selling/product-safety-disclosures-hazardous-materials-labelling?id=5407)
- [Shopify Help Center: Using CSV files to import and export products (read 2026-11-08)](https://help.shopify.com/en/manual/products/import-export/using-csv)

The rule texts were read on EUR-Lex on 2026-11-08, the Member State languages on european-union.europa.eu on 2026-11-08, and the channel field names on each channel's own pages on 2026-11-08. They are read once when the server starts and change only with a deploy (data version gpsr-2023-988+guidelines-c2025-6233+read-2026-11-08).

GPSR listing checker: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [EUR-Lex: Regulation (EU) 2023/988 on general product safety (GPSR), OJ L 135, 23.5.2023, p. 1](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988) | Article 19 items; applies from 2024-12-13 | 2026-11-08 |
| [EUR-Lex: Commission Notice C/2025/6233: Guidelines on the application of the EU general product safety legislative framework by businesses, OJ C, 21.11.2025](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:C_202506233) | sections 2.1 and 3.1.1 | 2026-11-08 |
| [EUR-Lex: Regulation (EU) 2019/1020 on market surveillance and compliance of products, Article 4](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019R1020) | who can be the responsible person | 2026-11-08 |
| [European Union: EU countries (country profiles)](https://european-union.europa.eu/principles-countries-history/eu-countries_en) | 27 Member States, official EU languages | 2026-11-08 |
| [Amazon Selling Partner API changelog: attributes for GPSR in programmatic listings submissions](https://developer-docs.amazon/sp-api/changelog/developers-can-use-attributes-in-their-programmatic-listings-submissions-to-comply-with-gpsr) | Amazon field names | 2026-11-08 |
| [Etsy Help: What is the General Product Safety Regulation (GPSR)?](https://help.etsy.com/hc/en-us/articles/28211364687383-What-is-the-General-Product-Safety-Regulation-GPSR) | Etsy field names | 2026-11-08 |
| [eBay Help: Product safety disclosures and hazardous materials labelling](https://www.ebay.com/help/selling/selling/product-safety-disclosures-hazardous-materials-labelling?id=5407) | eBay field names | 2026-11-08 |
| [Shopify Help Center: Using CSV files to import and export products](https://help.shopify.com/en/manual/products/import-export/using-csv) | Shopify field names | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The quoted rule texts, the exclusions, the 27 Member States with their languages and the channel field names are pinned to the files as read. Each check is tested on its own: CSV reading, header matching, Shopify variant rows, each Article 19 item with its edge cases, language guessing, exclusions, defaults, markets and the responsible person operation. The worked examples equal run(), and the fix list CSV writes formula-like cells as text.

What its test suite asserts:

- The quoted rule texts, the Article 2(2) exclusions and the read date 2026-11-08 are pinned to the EUR-Lex and Commission texts as read.
- The 27 Member States carry the official EU languages europa.eu lists, and the channel field names are pinned to each channel's page.
- CSV reading (commas, semicolons, tabs, quotes, line breaks, BOM), header matching and Shopify variant rows are each checked.
- Each Article 19 item is checked on its own: manufacturer, responsible person by country, picture, identifier, GTIN check digits, warnings and their language per market, exclusions and defaults.
- The responsible person operation is checked for EU, non-EU, UK, EEA and Northern Ireland cases, the worked examples equal run(), and formula-like cells are written as text.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the GPSR listing checker tool](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/).

## Questions

### Is there any AI in the gpsr listing checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the gpsr listing checker refuse to answer?

It checks what the listing data shows against Article 19. It does not certify that a product is safe or compliant, and it cannot confirm that an address is real or that a company is established in the EU. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the GPSR listing checker tool](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [GPSR requirements: the 4 Article 19 items](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/requirements/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/gpsr-listing-checker/  
Data as of: 2026-11-04
