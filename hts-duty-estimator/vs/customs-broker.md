# A broker or a CBP ruling vs an estimator

A CBP ruling is a definitive interpretation for a specific transaction, requested under 19 CFR part 177 by the importer or its agent (classification, marking and origin requests by letter or the eRulings template); a licensed customs broker files entries for you; this estimator only estimates from the code and origin you give it.

|  | CBP ruling | Licensed broker | This estimator |
| --- | --- | --- | --- |
| Binding | Yes, for the transaction described | No (files on your behalf) | No |
| Classification | Decided by CBP | Advises and files | Uses your code |
| Who | Importer, exporter or agent with a direct interest | Licensed by CBP (exam fee $390, permit fee $190.88 a year) | Anyone |
| Price | No fee listed on CBP's ruling page | Set by the broker | One SKU, and the check of a product CSV for missing data, are free on the estimator's page. An estimate for a list of SKUs, or any estimate over the API or MCP, is $0.01 per SKU row for the first 2,000 rows in a month and $0.004 after that, at least $0.1 a call and at most $25 a month; rows we refuse are refunded at once. |

## When a broker or a ruling is better

- A complex product, a high duty, or a line where the classification could go two ways.
- Goods of Canada, Russia or any line this estimator refuses.
- Any dispute with CBP, or a refund claim outside the CAPE process.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [CBP: What are ruling letters? (read November 8, 2026)](https://www.cbp.gov/trade/rulings/ruling-letters)
- [CBP: Customs broker fees (read November 8, 2026)](https://www.cbp.gov/trade/programs-administration/customs-brokers/fees)

## Related

- [Country of origin](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/guides/country-of-origin/)
- [Find your HS code](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/guides/find-your-hs-code/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/vs/customs-broker/  
Data as of: 2026-11-08
