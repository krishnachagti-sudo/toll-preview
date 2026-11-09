# HTS duty API and MCP tool

POST {"op":"estimate","rows":\[{"code":"6109.10.00.12","origin":"VN","value":12}\]} returns $3.48 for a $12 cotton T-shirt from Vietnam: the 16.5% base rate and 9903.05.84 at 12.5%, each with its source, under the 2026 HTS Revision 22.

## Request

```http
POST /endwise/api/v1/tools/hts-duty-estimator
Authorization: Bearer <key>

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

## Response (one row, shortened)

```json
{
  "revision": "2026 HTS Revision 22",
  "asOf": "2026-11-08",
  "rows": [
    {
      "status": "estimated",
      "line": {
        "code": "6109.10.00.12",
        "general": "16.5%"
      },
      "base": {
        "column": "column 1 general",
        "rate": "16.5%",
        "duty": 1.98
      },
      "layers": [
        {
          "heading": "9903.05.84",
          "name": "Section 301 (forced labor), 60 economies",
          "rate": 12.5,
          "duty": 1.5
        }
      ],
      "duty": 3.48
    }
  ],
  "answer": "HTS 6109.10.00.12 from Vietnam, $12.00: $3.48 US duty (29% of value) as of November 8, 2026 under the 2026 HTS Revision 22: 16.5% base (column 1 general) + 12.5% Section 301 (forced labor), 60 economies (9903.05.84)."
}
```

## Inputs

- `op: "estimate"`
-  with rows \[{ sku?, code, origin, value, quantity?, weightKg? }\] or csv (and inventoryCsv); claimFta; shipment: { mode } for MPF and HMF.

- op "audit" with csv: which rows miss an HTS code, origin, weight or value. Free.
- Each row comes back with status estimated, refused (a layer not computed, named) or incomplete (missing data).
- MCP: the same tool and input through the MCP endpoint; quote\_price returns the price of a call first.

One SKU, and the check of a product CSV for missing data, are free on the estimator's page. An estimate for a list of SKUs, or any estimate over the API or MCP, is $0.01 per SKU row for the first 2,000 rows in a month and $0.004 after that, at least $0.1 a call and at most $25 a month; rows we refuse are refunded at once.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22, effective 10/30/2026 (read November 8, 2026)](https://hts.usitc.gov/)
- [USITC: HTS Chapter 99, 2026 HTS Revision 22 (U.S. notes 20, 31, 50, 52) (read November 8, 2026)](https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099)

## Related

- [The estimator](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/)
- [Tariff layers explained](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/guides/tariff-layers/)
- [HS and HTS code validation API](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/api/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/developers/  
Data as of: 2026-11-08
