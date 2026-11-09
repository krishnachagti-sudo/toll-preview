# Rounding time on an invoice

Rounding each entry up adds time to every entry, so it bills the most: on one week of 6 entries (13:01:40 exact, $1,350.90), up to 6 minutes per entry bills $1,374.00, up to 15 minutes $1,440.00 and up to 30 minutes $1,485.00, while rounding each task's total up to 15 minutes once bills $1,372.50.

- Exact: $1,350.90
- Up 15 per entry: $1,440.00
- Up 15 per line: $1,372.50

## One week under each rule

Monday November 2 to Friday November 6, 2026 of the sample: Design $90, Development $120, Meetings $60 an hour.

| Rule | Hours billed | Amount | Over exact |
| --- | ---: | ---: | ---: |
| Exact time | 13.03 | $1,350.90 | $0.00 |
| Each entry up to 6 minutes | 13.30 | $1,374.00 | $23.10 |
| Each entry up to 10 minutes | 13.66 | $1,404.30 | $53.40 |
| Each entry up to 15 minutes | 14.00 | $1,440.00 | $89.10 |
| Each entry up to 30 minutes | 14.50 | $1,485.00 | $134.10 |
| Each entry to the nearest 15 minutes | 12.75 | $1,327.50 | -$23.40 |
| Each line (task) up to 15 minutes | 13.25 | $1,372.50 | $21.60 |

## Up, nearest and down

- Up: any part of an increment counts as a whole one (1 minute past bills 15). Best for you, and the one clients question.
- Nearest: under half rounds down, half or more rounds up. Over many entries it roughly evens out.
- Down: only whole increments bill. Rare on invoices.

## Per entry, per line or the total

Per entry rounds every entry, so many short entries add up: here 14.00 h against 13.0278 h exact. Per line rounds each task's total once (13.25 h). Toggl rounds each entry, or a group's subtotal; Clockify rounds each entry and then adds them up.

## Put it in the contract

Sample wording to adapt: "Time is billed in 15-minute increments. Each time entry is rounded up to the next 15 minutes, with a minimum of 15 minutes per entry. The invoice states the rounding used."

> Employee time clocks follow a different rule: 29 CFR 785.48(b) accepts rounding to the nearest 5 minutes, tenth or quarter hour only if it does not underpay over time. See [time clock rounding rules](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/time-clock-rounding-rules/) on the hours calculator. Professional rules for some fields (such as law) may also limit billing practice; check yours.

## Round your own week

[See the lines](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/?sample=0&group=task&inc=15&mode=up&level=entry&rates=task%3ADesign%3D90%3Btask%3ADevelopment%3D120%3Btask%3AMeetings%3D60&run=1&from=2026-11-02&to=2026-11-06)

> Lines are worked out from the entries shown, with the grouping, rounding and rates named. Rounding for freelance work is set by your contract; check an invoice before you send it. Not affiliated with Toggl, Clockify, Harvest or Everhour. Not tax or legal advice.

## Sources

- [Toggl Track: Rounding (updated July 21, 2026, read November 8, 2026)](https://support.toggl.com/rounding)
- [Clockify Help: Time rounding (read November 8, 2026)](https://clockify.me/help/track-time-and-expenses/time-rounding)
- [Harvest blog: Rounding up incremental billing (January 5, 2010) (updated January 5, 2010, read November 8, 2026)](https://www.getharvest.com/blog/2010/01/rounding-up-incremental-billing)

## Questions

### Should I round each entry or the total?

On this week's 6 entries, rounding each entry up to 15 minutes bills 14.00 h and rounding each task's total once bills 13.25 h. Say which in your contract.

### What is a normal billing increment?

Six minutes (a tenth of an hour) and 15 minutes are the common ones; Toggl's rounding offers 1, 5, 6, 10, 12, 15 or 30 minutes, 1 hour or 4 hours, and Harvest's 2010 post lists 6, 15 and 30.

## Related

- [Time clock rounding rules for employees](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/time-clock-rounding-rules/)
- [Different rates per task](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/different-rates-per-task/)
- [Spreadsheet pivot vs this tool](https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/vs/spreadsheet-pivot/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/time-export-to-invoice/guides/round-time-on-invoice/  
Data as of: 2026-11-08
