# Excel time formulas vs the time card calculator

Excel works out time with formulas such as =B2-A2 and =(B2-A2)\*24; you need extra steps for a shift that crosses midnight (10:00 PM to 6:30 AM with a 30-minute break is 8.00 hours), for overtime per workweek and for daylight-saving nights (9.00 real hours on November 1, 2026), which the calculator does from the punches.

## What Microsoft's formulas do

Microsoft Support's page "Calculate the difference between two times in Excel" (read November 8, 2026) gives these, with the start in A2 and the end in B2:

```excel
=B2-A2                 time between, shown in a time format
=TEXT(B2-A2,"h:mm")    as text, hours and minutes
=INT((B2-A2)*24)       whole hours
=(B2-A2)*1440          minutes
=HOUR(B2-A2)  =MINUTE(B2-A2)
```

Each assumes the end is later than the start on the same day.

## Where a timesheet needs more

| Job | In Excel | In the calculator |
| --- | --- | --- |
| Decimal hours | =(B2-A2)\*24 | Shown for every day and the week |
| Shift across midnight | =MOD(B2-A2,1)\*24, see [overnight shifts](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/overnight-shift-hours/) | Read from the punches: 10 PM to 6:30 AM, 30 minutes off, is 8.00 |
| Overtime per workweek | SUMIFS by week, then MAX(0, total − 40) | Each workweek counted alone; set the start day and hour |
| Daylight-saving night | Counts clock time: 8 hours | Real time with a zone set: 9.00 hours on the fall night |
| Rounding check | MROUND per punch, by hand | Every punch rounded and the net gain or loss shown |
| Signed timesheet | Build and format a template | A PDF with signature lines |

## When Excel is better

- The hours are already in a workbook and feed payroll formulas there.
- You need many rows recalculated live as you edit.
- You want to change the logic yourself, for a rule the calculator does not model.

## What the calculator costs

Totals, conversions and the rounding check are free on the calculator page; a signed-ready timesheet PDF and CSV costs $0.15 per employee and pay period; an API or MCP call costs $0.002.

## Try a week

[Open in the calculator](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/?start=2026-11-02&weeks=1&d0=9%3A00+am+-+5%3A00+pm&b0=30&d1=9%3A00+am+-+5%3A00+pm&b1=30&d2=9%3A00+am+-+5%3A00+pm&b2=30&d3=9%3A00+am+-+5%3A00+pm&b3=30&d4=9%3A00+am+-+5%3A00+pm&b4=30)

## Sources

- [Microsoft Support: Calculate the difference between two times in Excel (read November 8, 2026)](https://support.microsoft.com/en-us/office/calculate-the-difference-between-two-times-e1c78778-749b-49a3-b13e-737715505ff6)
- [DOL Wage and Hour Division, Fact Sheet #23, Overtime Pay (revised October 2019, read November 7, 2026)](https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay)

## Questions

### How do I get hours between two times in Excel?

Microsoft Support gives =B2-A2 for the time and =(B2-A2)\*1440 for minutes, with =INT((B2-A2)\*24) for whole hours. For decimal hours use =(B2-A2)\*24, and =MOD(B2-A2,1)\*24 when the shift crosses midnight.

### Why does Excel show #### for a night shift?

The end is earlier than the start, so the difference is negative, which a time format cannot show. =MOD(B2-A2,1) fixes it.

### When is Excel the better choice?

When the hours already live in a workbook, feed other formulas, or need to recalculate across many rows as you edit.

## Related

- [Overnight shift hours and the MOD formula](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/overnight-shift-hours/)
- [Clockify or the calculator](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/vs-clockify/)
- [timeanddate or Endwise](https://krishnachagti-sudo.github.io/toll-preview/compare/timeanddate/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/vs-excel-time-formulas/  
Data as of: 2026-11-08
