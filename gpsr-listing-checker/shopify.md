# GPSR for Shopify stores

Shopify's product CSV has no GPSR columns of its own (it has 7 the checker reads, such as Vendor, SKU, Barcodes and Product image URL), so manufacturer, responsible person and warnings come from metafields or shop-wide details. Your file has 2 SKUs; 2 are missing a GPSR Article 19 item (most often: responsible person electronic address, on 2).

## Check your Shopify export

[Open the checker](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/?platform=shopify&markets=DE%2CFR)

## Columns the checker reads

- `Title`
- `URL handle`
- `Vendor`
- `Type`
- `SKU`
- `Barcodes`
- `Product image URL`
- `Metafields`

Older exports' `Handle, Variant SKU, Variant Barcode, Image Src` are read too. Variant rows with only a handle and SKU take the product's fields from the row above.

## A two-variant product checked

```csv
URL handle,Title,Vendor,Type,SKU,Barcodes,Product image URL
linen-apron,Linen apron,Fernhill,Apron,APR-S,4006381333931,https://cdn.example.com/apron.jpg
linen-apron,,,,APR-L,4006381333948,
```

With the manufacturer (in Leeds, UK) given once as shop-wide details, and France as the market:

- **APR-S**: responsible person name; responsible person postal address; responsible person electronic address; warnings or safety information
- **APR-L**: responsible person name; responsible person postal address; responsible person electronic address; warnings or safety information

The UK manufacturer is outside the EU, so both variants need an EU responsible person; the apron has no warnings, which is fine only if it can be used safely without them.

## Sources

- [Shopify Help: Using CSV files to import and export products (read November 8, 2026)](https://help.shopify.com/en/manual/products/import-export/using-csv)
- [EUR-Lex: Regulation (EU) 2023/988 on general product safety (read November 8, 2026)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988)

> Shopify's field names and limits change; they are quoted as read on November 8, 2026. Rules read from EUR-Lex and the European Commission on the dates shown. Not legal advice.

## Related

- [Checker vs the EU Ready Shopify app](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/vs-eu-ready/)
- [GPSR label generator](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/label-generator/)
- [GPSR for Etsy sellers](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/etsy/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/shopify/  
Data as of: 2026-11-08
