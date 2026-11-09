# Code checks over MCP

Add https://conyso.com/endwise/mcp to your MCP client with your key as a Bearer token and your agent gets the industry-code-lookup tool: it checks up to 5,000 HS, HTS, Schedule B, NAICS, SIC or Schedule C codes a call against the official tables, at $0.002 per code, and quote\_price says the cost first.

- Codes per call: 5,000

## Prompts it answers

- Is HTS 6109.10.00 valid and what is it called?
- Validate these 20 NAICS codes against NAICS 2022.
- Which NAICS codes does the Census index give for food trucks?
- Is 492000 a Schedule C business code?

## Tool call

```json
{
  "name": "industry-code-lookup",
  "arguments": {
    "op": "check",
    "codes": [
      "541511",
      "6109.10"
    ],
    "system": "auto"
  }
}
```

Setup for Claude, ChatGPT, Cursor and VS Code is in the [docs](https://krishnachagti-sudo.github.io/toll-preview/docs).

> Reference, not a customs ruling or tax advice: a code that exists may still be the wrong one for your goods or business. Only U.S. Customs and Border Protection (by a binding ruling) decides an import classification, and the IRS decides what goes on a return. Each answer names the official table it came from and that table's date; check the official source before you file.

## Sources

- [U.S. Census Bureau: 2022 NAICS codes, descriptions and index file (read November 8, 2026)](https://www.census.gov/naics/)
- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22, effective 10/30/2026 (read November 8, 2026)](https://hts.usitc.gov/)

## Questions

### What does the MCP tool do?

It checks whether an HS, HTS, Schedule B, NAICS, SIC or Schedule C code exists in the current official edition and returns its official title and edition date, or searches the official text.

### Does the agent pay per call?

One code or one search is free on the checker's page. A list, or any call over the API or MCP, is $0.002 per code checked for the first 50,000 codes in a month and $0.0005 per code after that; a search over the API or MCP is $0.002.

## Related

- [Code validation API](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/api/)
- [NAICS code lookup](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/naics/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/mcp/  
Data as of: 2026-11-08
