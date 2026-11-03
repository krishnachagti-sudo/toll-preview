# Business days API

POST `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days` with {"op":"between","region":"US","start":"2026-07-01","end":"2026-07-08"} returns 4 business days and names the holiday it skipped, Independence Day (observed) on 2026-07-03. Each call costs $0.0005 (₹0.04 on a rupee account).

- Business days: 4
- Per call: $0.0005

## Request

| Field | Value |
| --- | --- |
| `op` | `between` to count, or `add` to add days to a date |
| `region` | `US` (federal holidays) or `GB-ENG` (England and Wales bank holidays) |
| `start` | A date written like 2026-07-01, from 1971 to 2100. Never counted itself. |
| `end` | `between` only: the last date, counted. Before the start, the count is negative. |
| `days` | `add` only: a whole number from -3650 to 3650; negative goes back |
| `daysOff` | Optional: up to 400 of your own days off (company closures, state or local holidays), as dates like 2026-07-06. Skipped like holidays and listed in `daysOffSkipped` |

```shell
curl -X POST 'https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days' \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"op":"between","region":"US","start":"2026-07-01","end":"2026-07-08"}'
```

## Response

```json
{
  "ok": true,
  "result": {
    "businessDays": 4,
    "holidaysSkipped": [
      {
        "date": "2026-07-03",
        "name": "Independence Day (observed)"
      }
    ]
  },
  "charged": {
    "amount": 500,
    "currency": "USD",
    "display": "$0.0005"
  },
  "dataVersion": "holiday-rules-2026.10"
}
```

Amounts are whole micro-units (1,000,000 to the dollar or rupee); the response also carries your balance after the charge. `holidaysSkipped` lists each weekday holiday inside the range, with the date it was taken off. For `add` the result is `{ date, holidaysSkipped }`: adding 1 business day to 2026-12-24 in `GB-ENG` gives 2026-12-29, past Christmas Day and the Boxing Day substitute day. With `daysOff` the result also has `daysOffSkipped`: each of your days off that fell on a weekday in the range and was not already a holiday, as `{ date, name }`.

Invalid input is a 400 `invalid_input` with the field that was wrong, and is never charged. Retries are safe with an `Idempotency-Key` header. The [docs](https://krishnachagti-sudo.github.io/toll-preview/docs) cover errors, limits and idempotency for every tool.

## From an AI agent (MCP)

Agents that speak the Model Context Protocol call the same tool, named `business-days`, with the same input and price. Add the server with your key:

```json
{
  "mcpServers": {
    "endwise": {
      "type": "http",
      "url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

## What it knows

US federal holidays as set by [5 U.S.C. 6103](https://www.law.cornell.edu/uscode/text/5/6103) on their observed days, and England and Wales bank holidays with substitute days and one-off royal days, from 1971 to 2100. Weekends are Saturday and Sunday. It does not know state, company or Scottish holidays; send those as `daysOff`.

## Sources

- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103)
- [GOV.UK: UK bank holidays](https://www.gov.uk/bank-holidays)

## Steps

1. **Create an account.** Sign up; every account gets a small free allowance each month, spent before any money you add.
2. **Make a key.** Create an API key on your account page and keep it on your server.
3. **Call the tool.** POST a JSON body with op, region and the dates to the business-days endpoint, with the key as a Bearer token.

## Related

- [Business days in Python](https://krishnachagti-sudo.github.io/toll-preview/business-days/python/)
- [Count business days in Excel with NETWORKDAYS](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-networkdays/)
- [Docs: keys, errors, idempotency and limits](https://krishnachagti-sudo.github.io/toll-preview/docs)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/api/  
Data as of: 2026-10-30
