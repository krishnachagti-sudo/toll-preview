# GPSR checklist template

A GPSR checklist needs 8 columns per SKU for the Article 19 items (manufacturer name, postal and electronic address, responsible person, picture, identifier, warnings, warning languages); filled from the worked example, 1 of its 5 SKUs is ready, 2 miss something, 1 needs a check by hand and 1 is out of scope.

## Fill the checklist from your export

[Open the checker](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/?platform=generic&markets=DE%2CFR)

## The template, filled from the worked example

Made-up listings for a US brand selling into Germany and France

| sku | title | manufacturer name | manufacturer postal address | manufacturer electronic address | responsible person (EU) | picture | type or identifier | warnings | warning languages | verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MUG-01 | Stoneware mug 350 ml | Harbor & Pine LLC | 412 Elm St, Portland, OR 97205, USA | safety@harborpine.example | EuroRep GmbH | https://cdn.example.com/mug-01.jpg | Mug / 0012345678905 | yes | de fr | ok |
| KNIFE-02 | Paring knife | Harbor & Pine LLC | 412 Elm St, Portland, OR 97205, USA | safety@harborpine.example | Brit Rep Ltd (outside the EU) | https://cdn.example.com/knife-02.jpg | Kitchen knife / 4006381333931 | yes | en | missing |
| CANDLE-03 | Soy candle | Harbor & Pine LLC | 412 Elm St, Portland, OR 97205, USA | https://harborpine.example | EuroRep GmbH | https://cdn.example.com/candle-03.jpg | Candle / 4006381333932 | yes | de | check |
| TRAY-04 | Serving tray | Harbor & Pine LLC | 412 Elm St, Portland, OR 97205, USA | safety@harborpine.example | MISSING | MISSING | MISSING | none |  | missing |
| JAM-05 | Fig jam | Harbor & Pine LLC | 412 Elm St, Portland, OR 97205, USA | safety@harborpine.example |  |  |  | none |  | out-of-scope |

Download it with the CSV link below the table, or [run the checker](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/) to get it for your own SKUs.

## What each column checks

| Point | Item | What the checker tests |
| --- | --- | --- |
| (a) | Manufacturer | Name or registered trade mark present; postal address with a number and two parts; email (a web address is flagged: it must let consumers write directly) |
| (b) | EU responsible person | Needed when the manufacturer's country is outside the EU; name, postal and electronic address; refused when the address is outside the EU |
| (c) | Product identification | A picture URL; a type, model, MPN, batch or serial number, or GTIN; GTIN check digit |
| (d) | Warnings and safety information | Present or marked not needed; language declared or guessed, compared with each market's official EU languages |

## Sources

- [EUR-Lex: Regulation (EU) 2023/988 on general product safety (read November 8, 2026)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988)
- [EUR-Lex: Commission guidelines on the GPSR for businesses, C/2025/6233 (read November 8, 2026)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:C_202506233)

> This checks what your listing data shows against Article 19 of Regulation (EU) 2023/988 (GPSR). It does not certify that a product is safe or compliant, and it cannot confirm that an address is real or that a company is established in the EU. Each Member State decides the language of warnings. The check compares the warning language with that state's official EU languages; national rules can ask for more. Products under other EU product laws (toys, cosmetics, electrical goods and more) can need further warnings and marks that this check does not cover. Rules read from EUR-Lex and the European Commission on the dates shown. Not legal advice.

## Related

- [GPSR label generator](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/label-generator/)
- [Auditing a whole store for GPSR gaps](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/bulk-audit/)
- [The 4 Article 19 listing items](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/requirements/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/checklist/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/checklist.csv
