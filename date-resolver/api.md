# Date resolver API and MCP

POST {"text":"10 business days after next Friday","ref":"2026-11-02"} returns 2026-11-23 (Monday), skipping Veterans Day, and marks the phrase ambiguous: if "next Friday" means the Friday of next week, the date is 2026-11-30.

## Why an agent needs it

Language models predict text; they do not consult a calendar. Developers report models writing the wrong weekday beside dates even when given today's date. A deterministic tool gives the same answer every time and shows its working, so the agent can quote it.

## Request

```bash
curl -X POST https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/date-resolver \
  -H "Authorization: Bearer $ENDWISE_KEY" -H "Content-Type: application/json" \
  -d '{"text":"10 business days after next Friday","ref":"2026-11-02","region":"US"}'
```

## Response (shortened)

```json
{
  "date": "2026-11-23",
  "weekday": "Monday",
  "ambiguous": true,
  "readings": [
    {
      "reading": "next:nearest",
      "date": "2026-11-23"
    },
    {
      "reading": "next:next-week",
      "date": "2026-11-30"
    }
  ],
  "holidaysSkipped": [
    {
      "date": "2026-11-11",
      "name": "Veterans Day"
    }
  ]
}
```

The full answer also has dateText, isoWeek, dayOfYear, calendarDaysFromRef, businessDay, the steps in words and the assumptions: reference date and where it came from, time zone, holiday calendar, weekday rule and the counting rules.

## Inputs

- `text` one phrase, or `texts` a list of up to 50 (priced per phrase).
- `ref` the reference date, YYYY-MM-DD, or "today" with `timeZone` (an IANA name such as America/New\_York). Required: the tool never guesses today silently.
- `region` holidays for business days: US (federal, default), GB-ENG, IN-CENTRAL-DELHI or none; `daysOff` your own dates to skip.
- `weekdayRule` "nearest" (default) or "next-week"; `dateOrder` "MDY" (default) or "DMY" for 3/4/2027; `roll` none, following, preceding or modified-following for a date that lands on a weekend or holiday.

## What it refuses

A phrase it cannot read, a time of day ("at 5pm") and dates outside 1900 to 2199 are refused with a message that says what it understands, and a refused call is not charged. It does not guess.

## Sources

- [OPM: Federal holidays (read November 7, 2026)](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103)

## Steps

1. **Get a key.** Create an account and an API key on your account page.
2. **Add the MCP server.** Point your agent at the MCP endpoint with the key; the tool is called date-resolver.
3. **Send the phrase and the reference date.** Always send ref: the date the phrase was said on, or "today" with a timeZone.
4. **Use the date and say the weekday.** Write the returned date with its weekday; when ambiguous is true, ask the user which reading they meant or state the one used.

## Related

- [What "next Friday" means](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/next-friday-meaning/)
- [Date arithmetic traps](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/date-arithmetic-traps/)
- [Business days API](https://krishnachagti-sudo.github.io/toll-preview/business-days/api/)
- [Docs: REST and MCP](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/date-resolver/api/  
Data as of: 2026-11-07
