# What does "next Friday" mean?

Said today, Saturday, November 7, 2026 (the date in New York, US Eastern time), "next Friday" is Friday, November 13, 2026 on both readings: the nearest Friday after today is also the Friday of next week.

- Nearest Friday: November 13, 2026
- Friday of next week: November 13, 2026

## Resolve any weekday phrase

[Resolve it in the tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=next+Friday&ref=2026-11-07&region=US)

## Two readings, both in use

People use "next Friday" for two different days. One is the nearest Friday after today: said on a Monday, the Friday of the same week. The other is the Friday of next week, the week that starts on the coming Monday. Parsers pick one silently: the Python library dateparser documents "next" before a weekday as the closest occurrence after the current date.

## Every day of the week

Said in the week of Monday, November 2, 2026. Days from the reference date in brackets. Weeks run Monday to Sunday.

| Said on | "Friday" | "Next Friday": nearest | "Next Friday": next week | "Last Friday": nearest | "Last Friday": last week |
| --- | --- | --- | --- | --- | --- |
| Mon, Nov 2, 2026 | Fri, Nov 6, 2026 (+4) | Fri, Nov 6, 2026 (+4) | Fri, Nov 13, 2026 (+11) | Fri, Oct 30, 2026 (-3) | Fri, Oct 30, 2026 (-3) |
| Tue, Nov 3, 2026 | Fri, Nov 6, 2026 (+3) | Fri, Nov 6, 2026 (+3) | Fri, Nov 13, 2026 (+10) | Fri, Oct 30, 2026 (-4) | Fri, Oct 30, 2026 (-4) |
| Wed, Nov 4, 2026 | Fri, Nov 6, 2026 (+2) | Fri, Nov 6, 2026 (+2) | Fri, Nov 13, 2026 (+9) | Fri, Oct 30, 2026 (-5) | Fri, Oct 30, 2026 (-5) |
| Thu, Nov 5, 2026 | Fri, Nov 6, 2026 (+1) | Fri, Nov 6, 2026 (+1) | Fri, Nov 13, 2026 (+8) | Fri, Oct 30, 2026 (-6) | Fri, Oct 30, 2026 (-6) |
| Fri, Nov 6, 2026 | Fri, Nov 6, 2026 (0) | Fri, Nov 13, 2026 (+7) | Fri, Nov 13, 2026 (+7) | Fri, Oct 30, 2026 (-7) | Fri, Oct 30, 2026 (-7) |
| Sat, Nov 7, 2026 | Fri, Nov 13, 2026 (+6) | Fri, Nov 13, 2026 (+6) | Fri, Nov 13, 2026 (+6) | Fri, Nov 6, 2026 (-1) | Fri, Oct 30, 2026 (-8) |
| Sun, Nov 8, 2026 | Fri, Nov 13, 2026 (+5) | Fri, Nov 13, 2026 (+5) | Fri, Nov 13, 2026 (+5) | Fri, Nov 6, 2026 (-2) | Fri, Oct 30, 2026 (-9) |

The two readings differ when said from Monday to Thursday: on Mon, Nov 2, 2026 they are 4 and 11 days away. They agree when said on a Friday, Saturday or Sunday, when the nearest Friday after the reference date is already in next week. "Friday" on its own, or "this Friday", is the coming Friday, or today when today is a Friday.

## How the date resolver answers

- The answer is the nearest Friday after the reference date, unless you set weekdayRule to "next-week".
- When the other reading is a different day, the answer is marked ambiguous and lists it, with its date and weekday.
- The reference date is always stated, so the answer can be checked.

> Contracts and notices should name the date, not "next Friday".

## Sources

- [dateparser documentation (relative weekdays)](https://dateparser.readthedocs.io/en/latest/)
- [ISO 8601: Date and time format](https://www.iso.org/iso-8601-date-and-time-format.html)

## Questions

### Does "next Friday" mean this coming Friday?

It can mean either. Said on Monday, November 2, 2026, the nearest Friday after it is November 6 (in 4 days) and the Friday of next week is November 13 (in 11 days). From Saturday or Sunday the two readings are the same day.

### What does "next Friday" mean if today is Friday?

Both readings give the Friday a week later, because the nearest Friday after today is also the Friday of next week.

### How do I avoid the ambiguity?

Write the date with its weekday ("Friday, November 13"). A tool that resolves phrases should say which reading it used and give the other one, as the date resolver does.

## Related

- [Date arithmetic traps](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/date-arithmetic-traps/)
- [Date resolver API and MCP](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/api/)
- [90 days from today](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/90-days-from-today/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/date-resolver/next-friday-meaning/  
Worked out for: 2026-11-07
