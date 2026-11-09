# USITC HTS search vs this estimator

The USITC search shows HTS 6109.10.00 at 16.5% general and the Chapter 99 headings in their own chapter; for a $100 shipment from China this estimator adds the layers for you: $36.50 (36.5%).

|  | USITC HTS search | This estimator |
| --- | --- | --- |
| Price | Free | One SKU, and the check of a product CSV for missing data, are free on the estimator's page. An estimate for a list of SKUs, or any estimate over the API or MCP, is $0.01 per SKU row for the first 2,000 rows in a month and $0.004 after that, at least $0.1 a call and at most $25 a month; rows we refuse are refunded at once. |
| What it is | The official schedule, every revision | Reads that schedule (2026 HTS Revision 22) and the Federal Register actions |
| Origin layers | Chapter 99 headings and notes; you combine them | Added per SKU, each with its source and date |
| Many SKUs | One search at a time; the whole schedule exports as JSON | Up to 5,000 rows per call, with a results CSV |
| Legal text | Yes: notes, general rules, footnotes | No: links to it |

## When the USITC search is better

For the authoritative text, the legal notes and the general rules of interpretation it is the final check, and it is free. Use it to confirm a line before you file.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [USITC: Harmonized Tariff Schedule search (read November 8, 2026)](https://hts.usitc.gov/)
- [USITC: HTS JSON export](https://hts.usitc.gov/reststop/exportList?from=0101&to=9999.99.99&format=JSON&styles=false)
- [USITC: HTS Chapter 99, 2026 HTS Revision 22 (U.S. notes 20, 31, 50, 52) (read November 8, 2026)](https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099)

## Related

- [HTS code lookup](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/hts/)
- [Tariff layers explained](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/guides/tariff-layers/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/vs/usitc-hts/  
Data as of: 2026-11-08
