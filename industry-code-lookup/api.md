# Code validation API

POST {"op":"check","codes":\[...\]} to /api/v1/tools/industry-code-lookup and each code comes back valid or not, with its system, official title, table edition and next revision: 3 of 5 valid; 1 retired (NAICS 2017). One call takes up to 5,000 codes at $0.002 each.

- Codes per call: 5,000
- Price per code: $0.002

## Request

```bash
curl -X POST https://conyso.com/endwise/api/v1/tools/industry-code-lookup \
  -H "Authorization: Bearer tk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"op":"check","codes":["722511","454110","6109.10.00.12","8471.30.0100","999999"]}'
```

## Response, one result

```json
{
  "input": "722511",
  "system": "naics",
  "code": "722511",
  "valid": true,
  "status": "valid",
  "title": "Full-Service Restaurants",
  "edition": "NAICS 2022",
  "answer": "722511 is valid in 3 systems: NAICS 2022 (Full-Service Restaurants); Schedule C business code (Full-service restaurants); HS (6-digit) (Flat-rolled products of other alloy steel, of a width of 600 mm or more: Of silicon electrical steel: Grain-oriented). Give a system to check just one."
}
```

## Systems

| system | Table | Digits |
| --- | --- | --- |
| naics | NAICS 2022 (Census), 2017 codes flagged | 2 to 6 |
| hs | HS six-digit, as carried in the US HTS | 2, 4, 6 |
| hts | US HTS, 2026 HTS Revision 22 | 4, 6, 8, 10 |
| schedule-b | Census Schedule B 2026 | 10 |
| us-sic | SIC 1987, by the Census concordances | 4 |
| uk-sic | UK SIC 2007, Companies House list | 5 |
| schedule-c | IRS Schedule C codes, 2025 | 6 |
| auto | every table the code's length fits | any |

Search with {"op":"search","query":"food truck","system":"naics"}: the official lines that contain your words, up to 25.

One code or one search is free on the checker's page. A list, or any call over the API or MCP, is $0.002 per code checked for the first 50,000 codes in a month and $0.0005 per code after that; a search over the API or MCP is $0.002.

Authentication, errors, idempotency and quotes are in the [docs](https://krishnachagti-sudo.github.io/toll-preview/docs).

> Reference, not a customs ruling or tax advice: a code that exists may still be the wrong one for your goods or business. Only U.S. Customs and Border Protection (by a binding ruling) decides an import classification, and the IRS decides what goes on a return. Each answer names the official table it came from and that table's date; check the official source before you file.

## Sources

- [U.S. Census Bureau: 2022 NAICS codes, descriptions and index file (read November 8, 2026)](https://www.census.gov/naics/)
- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22, effective 10/30/2026 (read November 8, 2026)](https://hts.usitc.gov/)
- [U.S. Census Bureau: Schedule B, 2026 export concordance (read November 8, 2026)](https://www.census.gov/foreign-trade/schedules/b/index.html)
- [IRS: Instructions for Schedule C (Form 1040) (2025), Principal Business or Professional Activity Codes (page updated April 30, 2026; read November 8, 2026)](https://www.irs.gov/instructions/i1040sc)
- [GOV.UK (Companies House): Standard industrial classification of economic activities (SIC), condensed list, Open Government Licence v3.0 (read November 8, 2026)](https://www.gov.uk/government/publications/standard-industrial-classification-of-economic-activities-sic)

## Questions

### How much does the API cost?

One code or one search is free on the checker's page. A list, or any call over the API or MCP, is $0.002 per code checked for the first 50,000 codes in a month and $0.0005 per code after that; a search over the API or MCP is $0.002.

### Is an invalid code charged?

Yes: "not valid" is the answer you paid for. Input that fails validation (not a list, too long) is refused and never charged.

## Related

- [MCP server for code checks](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/mcp/)
- [HS code lookup](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/hs/)
- [NAICS code lookup](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/naics/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/api/  
Data as of: 2026-11-08
