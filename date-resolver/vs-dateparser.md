# Python dateparser or the Endwise date resolver?

dateparser is a free Python library that parses human-readable dates in more than 200 locales; Endwise's date resolver is a paid service (from $0.0005 a phrase) that also adds business days over a holiday calendar. Both read "next Friday" said on Monday, November 2, 2026 as Friday, November 6, 2026 by default; the resolver also returns Friday, November 13, 2026 as the other reading.

## What each one is

dateparser facts from its documentation, read November 8, 2026; its history lists version 1.5.0, dated November 4, 2026.

|  | dateparser | Endwise date resolver |
| --- | --- | --- |
| What it is | "python parser for human readable dates" | A hosted tool: a phrase and a reference date in, one date out, with steps |
| Where it runs | Your Python (pip install dateparser; Python 3.10+) | Web page, REST API and MCP |
| Cost | Free, BSD 3-Clause license | from $0.0005 a phrase on the API; free runs a day on the web |
| Languages | More than 200 language locales | English phrases |
| Reference date | RELATIVE\_BASE setting | ref, required: a date, or "today" with a time zone |
| Day and month order | DATE\_ORDER setting | dateOrder: MDY (default) or DMY |
| Business days and holidays | Not described in the documentation | US federal, England and Wales, India central government; your own days off |
| Text it cannot read | Returns None | Refused with a message, and not charged |

## The same phrases in both

dateparser documents "next" before a weekday as its closest occurrence after the current date. The date resolver's default is the same nearest Friday, Friday, November 6, 2026, said on Monday, November 2, 2026, and because some people mean the Friday of next week, it marks the phrase ambiguous and gives Friday, November 13, 2026 too. For business days, "10 business days after 2026-11-20" resolves to Monday, December 7, 2026, skipping Thanksgiving Day.

## When dateparser is the better choice

- Dates in many languages inside a Python pipeline you control.
- Free parsing of scraped or user text at volume, with no network call.
- You need its settings, such as PREFER\_DATES\_FROM or PREFER\_DAY\_OF\_MONTH, for incomplete dates.

## When the date resolver is the better choice

- An AI agent or a no-code tool needs the date over MCP or REST.
- The phrase counts business days and holidays must be skipped and named.
- You want both readings of an ambiguous phrase and the steps, to show a person.

## Resolve a phrase

[Resolve it in the tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=next+Friday&ref=2026-11-02&region=US)

## Sources

- [dateparser documentation (read November 8, 2026)](https://dateparser.readthedocs.io/en/latest/)
- [OPM: Federal holidays (read November 7, 2026)](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)

## Questions

### What does dateparser do with "next Friday"?

Its documentation says "last", "this" and "next" before a weekday mean its closest occurrence before, on or after, and after the current date (in English), whatever PREFER\_DATES\_FROM says.

### How do I set the reference date in dateparser?

With the RELATIVE\_BASE setting; its documentation shows "tomorrow" with a base of 1992-01-01 giving 1992-01-02.

### Does dateparser skip holidays?

Its documentation does not describe business days or holiday calendars.

## Related

- [chrono-node compared](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/vs-chrono-node/)
- [What "next Friday" means](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/next-friday-meaning/)
- [Date resolver API and MCP](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/api/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/date-resolver/vs-dateparser/  
Data as of: 2026-11-08
