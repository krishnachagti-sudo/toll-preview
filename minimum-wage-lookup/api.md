# Minimum Wage API: Rate by Address and Date, With Change Alerts

POST a list of places (street addresses, ZIP codes or cities) and a date to /api/v1/tools/minimum-wage-lookup and get each place's minimum wage, tipped cash wage, the government that sets it, the official source and the next change; $0.002 a place answered, $0.001 past 10,000 a month, and places we do not cover are not charged.

## Request

```json
{
  "op": "lookup",
  "date": "2027-01-01",
  "employees": 40,
  "places": [
    {
      "address": "200 N Spring St, Los Angeles, CA 90012"
    },
    {
      "zip": "94025"
    },
    {
      "state": "WA",
      "city": "Seattle"
    }
  ]
}
```

## Response (one place, abridged)

```json
{
  "where": "Los Angeles, California",
  "date": "2026-11-08",
  "status": "answered",
  "rate": "18.42",
  "setBy": {
    "level": "city",
    "id": "california/los-angeles",
    "name": "Los Angeles"
  },
  "since": "2026-07-01",
  "tippedCash": "18.42",
  "next": {
    "date": "2027-07-01",
    "rate": null,
    "why": "Los Angeles: Los Angeles adjusts its rate every July 1; the rate from July 1, 2027 was not published on its page when we read it on November 8, 2026."
  }
}
```

## Scheduled changes

The `changes` operation lists every change we hold in a window (up to 800 days), for one state or all, with the source: use it to warn before a rate changes.

```json
{
  "op": "changes",
  "from": "2027-01-01",
  "to": "2027-07-01",
  "state": "CA"
}
```

## What the fields mean

- status: answered, depends (a ZIP or name that spans more than one rate: every candidate is listed), not-covered (the place depends on a page we could not read), not-found or error (not charged).
- layers: each of federal, state, county and city that applies, with its rate, start date, tier and source.
- possible: a rate that applies only in part of the place (unincorporated areas, an opt-out county).
- notCovered: what we could not read, and why.

MCP: the same tool and the free `quote_price` are on the MCP server. Prices and limits: [developers](https://krishnachagti-sudo.github.io/toll-preview/developers/).

> Not legal advice. The rate shown is the highest general minimum wage we hold for the place and date; industry, hotel, health care, youth, training and other special rates can differ. Every rate names the official page it was read from and the date we read it. Places and states whose pages we could not read are listed as not covered, never guessed. Employers covered by the federal Fair Labor Standards Act pay at least the federal $7.25; state laws differ on which employers they cover.

## Related

- [Minimum wage change calendar](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/guides/calendar/)
- [Multi-location wage audit](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/guides/multi-location/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/api/  
Data as of: 2026-11-08
