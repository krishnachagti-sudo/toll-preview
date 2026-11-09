# Different rates per task on one invoice

With a rate card of $90 for design, $120 for development, $60 for meetings and $100 for anything else, the sample month's 14 entries become 4 lines; the admin task, with no rate of its own, bills at the $100 default (0.75 h); a 5% discount and a not-to-exceed of $2,800 then bring $2,835.00 to $2,693.25.

- Total: $2,693.25
- Lines: 4

## The rate card

```text
default = 100
task: Design = 90
task: Development = 120
task: Meetings = 60
project: Website redesign = 110
tag: urgent = 150
client: Acme Co = 95
person: Sam Lee = 85
```

Type it like this on the tool page, one rate a line. Over the API it is { "default": 100, "task": { "Design": 90 }, ... }.

## Which rate wins

1. A rate for the entry's task.
2. A rate for one of its tags.
3. A rate for its project, then its client, then its person.
4. The billable rate in the export itself (Toggl, Clockify and Harvest can export one).
5. The default rate.
6. No rate: billed at $0 and flagged.

## The invoice

Every entry included this time (billable or not), each rounded up to 15 minutes.

| Line | Dates | Hours | Rate | Amount |
| --- | --- | ---: | ---: | ---: |
| Website redesign: Design | Nov 2 to Nov 19, 2026; 4 entries | 8.50 | $90.00/h | $765.00 |
| Website redesign: Meetings | Nov 2 to Nov 25, 2026; 4 entries | 3.25 | $60.00/h | $195.00 |
| Website redesign: Development | Nov 3 to Nov 24, 2026; 5 entries | 15.00 | $120.00/h | $1,800.00 |
| Website redesign: Admin | Nov 10, 2026; 1 entry | 0.75 | $100.00/h | $75.00 |

|  | Amount |
| --- | ---: |
| Subtotal | $2,835.00 |
| Discount 5% | -$141.75 |
| Not to exceed $2,800 | not reached |
| Total | $2,693.25 |

The discount is taken from the subtotal; the cap then limits what is left; tax, if any, is added last.

## Open these rates

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=0&group=task&inc=15&mode=up&level=entry&rates=default%3D100%3Btask%3ADesign%3D90%3Btask%3ADevelopment%3D120%3Btask%3AMeetings%3D60&run=1&billable=all&discount=5&cap=2800)

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Questions

### How do I bill different rates per task from one export?

Give each task, tag, project, client or person its rate. Each entry takes the most specific rate that matches, and each line holds one rate, so a project whose tasks bill differently becomes one line per rate.

## Related

- [Rounding time on an invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/round-time-on-invoice/)
- [A client-friendly time invoice](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/client-friendly-time-invoice/)
- [Retainers and blocks of hours](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/retainer-and-blocks-of-hours/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/different-rates-per-task/  
Data as of: 2026-11-08
