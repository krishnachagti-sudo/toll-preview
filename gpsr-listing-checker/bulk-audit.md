# Auditing a whole store for GPSR gaps

Export the listings, add what the export lacks, run each SKU against the 4 Article 19 items, fix the "missing" ones first, then re-check: the worked 5-SKU file comes back with 1 ready, 2 missing, 1 to check by hand and 1 out of scope.

## Run the audit

[Open the checker](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/?platform=generic&markets=DE%2CFR)

## What the fix list looks like

```csv
line,sku,title,verdict,missing,to check,what to fix
2,MUG-01,Stoneware mug 350 ml,ok,,,
3,KNIFE-02,Paring knife,missing,responsible person outside the EU,warning language for a market,"Article 19(b): The responsible person is in the United Kingdom. It must be established in the EU (Article 16(1)); a UK or US address does not count. Article 19(d): The warnings are in English, which is not an official language of Germany (German), France (French). Each Member State decides the language (Article 19(d)); add a translation for these markets."
4,CANDLE-03,Soy candle,check,,website given as the manufacturer's electronic address; barcode with a wrong check digit; warning language for a market,"Article 19(a): https://harborpine.example is a web address. It counts only if it opens a page where consumers can write to the manufacturer directly; a home page alone is not enough (Commission guidelines, section 3.1.1). Article 19(c): 4006381333932: the last digit is not the barcode's check digit. A typo here identifies another product. Article 19(d): The warnings are in German (guessed from the text), which is not an official language of France (French). Each Member State decides the language (Article 19(d)); add a translation for these markets."
5,TRAY-04,Serving tray,missing,responsible person name; responsible person postal address; responsible person electronic address; product picture; product type or identifier,warnings or safety information,"Article 19(b): The manufacturer is in the United States, outside the EU, so the listing must show the name of an EU responsible person: an importer, an authorised representative or a fulfilment service provider established in the EU. Article 19(b): Add the responsible person's postal address in the EU. Article 19(b): Add the responsible person's email address (or the address of a contact form on their website). Article 19(c): Add a picture of the product. Article 19(c): Add the product's type and an identifier: a model or type number, batch or serial number, or a barcode (GTIN/EAN/UPC). Article 19(d): No warnings or safety information. That is fine only if the product can be used safely and as intended without them (Article 9(7)); otherwise add the warnings that are on the product or its packaging. Mark the row ""noWarningsNeeded"" once you have decided."
6,JAM-05,Fig jam,out-of-scope,,,Marked as food: Article 2(2) takes it out of the GPSR.
```

## Sources

- [EUR-Lex: Regulation (EU) 2023/988 on general product safety (read November 8, 2026)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988)
- [EUR-Lex: Commission guidelines on the GPSR for businesses, C/2025/6233 (read November 8, 2026)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:C_202506233)

> This checks what your listing data shows against Article 19 of Regulation (EU) 2023/988 (GPSR). It does not certify that a product is safe or compliant, and it cannot confirm that an address is real or that a company is established in the EU. Each Member State decides the language of warnings. The check compares the warning language with that state's official EU languages; national rules can ask for more. Products under other EU product laws (toys, cosmetics, electrical goods and more) can need further warnings and marks that this check does not cover. Rules read from EUR-Lex and the European Commission on the dates shown. Not legal advice.

## Steps

1. **Export the listings.** Download the active listings for the EU marketplaces: Amazon's listings report, Etsy's or eBay's listing export, or Shopify's product CSV.
2. **Add what the export lacks.** Amazon keeps names and postal addresses in Seller Central and Shopify has no GPSR columns, so give the manufacturer and responsible person once as shop-wide details or add columns.
3. **Run the check.** Choose the channel and the markets you sell to, paste or upload the file, and run it. Each SKU gets ready, check by hand, missing or out of scope.
4. **Fix the missing items first.** Sort the fix list by verdict: "missing" rows lack something Article 19 asks for; "check by hand" rows need a person's judgement (a brand as trade mark, a website as contact, a warning language).
5. **Fix in bulk on the channel.** Use the channel's bulk tools (Amazon feeds, eBay bulk edit, Shopify CSV import) with the checklist CSV beside you.
6. **Export and check again.** Run the new export; nothing should be left "missing".

## Questions

### What does checking a file cost?

$0.01 per SKU for the first 1,000 SKUs in a month and $0.004 after, at most $14.99 a month; one listing on the page is free. A 200-SKU file costs $2.00; 2,000 SKUs cost $14.00.

## Related

- [GPSR checklist template](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/checklist/)
- [GPSR for Amazon sellers](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/amazon/)
- [Checking GPSR in a spreadsheet](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/vs-spreadsheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/bulk-audit/  
Data as of: 2026-11-08
