# chrono-node or the Endwise date resolver?

chrono is a free, MIT-licensed JavaScript library that parses dates and times out of text; Endwise's date resolver is a paid service (from $0.0005 a phrase) that resolves one phrase to one date with US, England and Wales or India holidays for business days. On "Friday" said on Saturday, August 25, 2012, chrono's README shows August 24 by default; the resolver answers Friday, August 31, 2012.

## What each one is

chrono facts from its README on GitHub, read November 8, 2026.

|  | chrono (chrono-node) | Endwise date resolver |
| --- | --- | --- |
| What it is | "A natural language date parser in Javascript" | A hosted tool: a phrase and a reference date in, one date out, with steps |
| Where it runs | In your code (npm install chrono-node) | Web page, REST API and MCP |
| Cost | Free, MIT license | from $0.0005 a phrase on the API; free runs a day on the web |
| Languages | English by default; more locales, some partial | English phrases |
| Times and time zones | Parses times, ranges and time zones | Dates only; refuses a time of day |
| Business days and holidays | Not described in the README | US federal, England and Wales, India central government; your own days off |
| An ambiguous phrase | One result; forwardDate picks the future | Both readings when they differ, marked ambiguous |
| Text it cannot read | Strict mode returns null; casual mode is the default | Refused with a message, and not charged |

## The same phrase in both

chrono's README parses "Friday" with a reference date of Saturday, August 25, 2012: the default result is Friday, August 24 (the day before), and with forwardDate: true it is August 31. The date resolver reads a bare weekday as the coming one: Friday, August 31, 2012. "Last Friday" said that day resolves to Friday, August 24, 2012. Neither is wrong; they are different conventions, so whichever you use, state the convention.

## When chrono is the better choice

- You can run code and want free, unlimited parsing with no network call.
- You need times, time ranges or time zones out of free text, such as "This Friday from 13:00 - 16.00".
- You parse text in French, Japanese, Dutch or another locale chrono supports.
- You are happy to own the edge cases and test them.

## When the date resolver is the better choice

- An AI agent needs a date from a phrase over MCP, without your code in between.
- The phrase has business days in it and holidays must be skipped and named.
- You want the other reading of "next Friday" returned, not chosen silently.
- You want the working shown (reference date, rules, steps) so a person can check it.

## Resolve a phrase

[Resolve it in the tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=Friday&ref=2012-08-25&region=US)

## Sources

- [chrono on GitHub (wanasit/chrono), README (read November 8, 2026)](https://github.com/wanasit/chrono)

## Questions

### Is chrono free?

Yes. chrono's README gives the MIT license; you install the chrono-node package from npm and run it in your own code.

### What does chrono return for "Friday" said on a Saturday?

Its README's example, with a reference date of August 25, 2012, gives Friday, August 24 by default and August 31 with forwardDate: true. The date resolver gives Friday, August 31, 2012 for "Friday" on that day.

### Does chrono count business days?

Its README does not describe business days or holiday calendars; it parses dates and times from text.

## Related

- [Python dateparser compared](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/vs-dateparser/)
- [Date resolver API and MCP](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/api/)
- [Endwise vs timeanddate.com](https://krishnachagti-sudo.github.io/toll-preview/compare/timeanddate/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/date-resolver/vs-chrono-node/  
Data as of: 2026-11-08
