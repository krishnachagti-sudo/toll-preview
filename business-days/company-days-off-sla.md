# Company closures, SLAs and payroll cutoffs in business days

Send your closures as days off and the tool skips them like public holidays: a 3-business-day SLA from Tuesday, December 22, 2026 ends on Monday, December 28, 2026 on the federal calendar, but on Monday, January 4, 2027 if your company is closed December 28, 2026 to December 31, 2026.

## Add business days, then list your closures

[Add in the tool](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-12-22&days=3)

## How do I skip company closures?

Add a `daysOff` list to the request. Each date is skipped like a public holiday and listed in `daysOffSkipped` with the name "Your day off".

```json
{
  "op": "add",
  "region": "US",
  "start": "2026-12-22",
  "days": 3,
  "daysOff": [
    "2026-12-28",
    "2026-12-29",
    "2026-12-30",
    "2026-12-31"
  ]
}
```

POST it to the business days endpoint with your API key, as in the [API guide](https://krishnachagti-sudo.github.io/toll-preview/business-days/api/). The answer is `2027-01-04`.

## Year-end 2026 shutdown, worked out

| Question | Federal calendar only | With closures Dec 28 to Dec 31 |
| --- | --- | --- |
| 3 business days after December 22, 2026 | Mon, Dec 28, 2026 | Mon, Jan 4, 2027 |
| Business days in December 2026 | 22 | 18 |

## Where this helps

- Support SLAs: a "respond within 2 business days" clock that pauses over your shutdown.
- Payroll: a cutoff a set number of business days before pay day, around state holidays you observe.
- Delivery promises: processing days that skip warehouse closures.
- Month-end close: the business days your finance team actually works.

For holiday-week counts without closures, see [business days between Christmas and New Year 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/christmas-new-year-2026-business-days/).

## Sources

- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [OPM: Federal holidays, "in lieu of" days](https://www.opm.gov/policy-data-oversight/pay-leave/work-schedules/fact-sheets/Federal-Holidays-In-Lieu-Of-Determination)

## Steps

1. **List your closures.** Write each closure day as a date like 2026-12-28: shutdown weeks, state holidays you observe, company days off.
2. **Pick the public calendar.** Choose the region whose holidays you also close for: US federal, England and Wales, or India central government.
3. **Add them as days off.** Paste the dates into the "Your own days off" box on the calculator, or send them as daysOff (up to 400 dates) in a count or add request.
4. **Read what was skipped.** The answer lists public holidays in holidaysSkipped and your own closures in daysOffSkipped, so you can show the reason for the date.

## Questions

### How many days off can I send?

Up to 400 dates in one request.

### What if a day off is already a holiday or a weekend?

It is skipped once. Only days off that fall on a weekday and are not already a public holiday are listed in daysOffSkipped.

### Can I add days off on the web page?

Yes. The calculator has a "Your own days off" box: list the dates one per line or comma separated. Over the API and MCP the same list is daysOff.

## Related

- [Business days API](https://krishnachagti-sudo.github.io/toll-preview/business-days/api/)
- [Business days between Christmas and New Year 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/christmas-new-year-2026-business-days/)
- [Counting business days in a contract notice](https://krishnachagti-sudo.github.io/toll-preview/business-days/contract-notice-business-days/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/company-days-off-sla/  
Data as of: 2026-11-06
