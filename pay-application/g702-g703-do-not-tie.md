# Why your G702 and G703 do not tie

A G702 and G703 do not tie when the summary and the lines disagree: in this broken example 5 checks fail (unexecuted change order, over 100 percent, schedule does not total, previous certificates differ and above state cap); fixed, the same job asks for $42,525.00.

## What the checks found

- **Fix:** Change order 2 is not executed but has amounts billed. It is left out of the totals: bill it once it is signed.
- **Fix:** Line 1 (Mobilization and submittals) bills $13,500.00 against a scheduled value of $12,000.00 (112.5%). A line cannot pass 100%: move the excess to a change order.
- **Fix:** The schedule of values lines total $240,000.00, but the original contract sum is $242,000.00 (a difference of -$2,000.00). The lines must add up to the contract sum.
- **Check:** Previous certificates ($52,000.00) differ from the earlier work and stored materials less their retainage ($45,760.00). That is expected when the last application was certified for a different amount; otherwise check the previous-work column against the last approved application.
- **Check:** The retainage rate (12%) is above Minnesota's 5% limit for this kind of project (Minn. Stat. 337.10, subd. 4).

## The fixed application

Lines total the contract sum, the change order is signed, previous certificates are the amounts certified, 10% retainage.

| Summary | Amount |
| --- | ---: |
| Original contract sum | $240,000.00 |
| Net change by change orders | $8,500.00 |
| Contract sum to date | $248,500.00 |
| Total completed and stored to date | $99,250.00 |
| Retainage held | $9,925.00 |
| Total earned less retainage | $89,325.00 |
| Less previous certificates for payment | $46,800.00 |
| Current payment due | $42,525.00 |
| Balance to finish, including retainage | $159,175.00 |

The continuation sheet that ties.

| Item | Description | Scheduled value | Previous applications | This period | Stored now | Completed and stored | % | Balance to finish | Retainage |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Mobilization and submittals | $12,000.00 | $12,000.00 | $0.00 | $0.00 | $12,000.00 | 100.0% | $0.00 | $1,200.00 |
| 2 | Underground and rough-in | $96,000.00 | $40,000.00 | $25,000.00 | $0.00 | $65,000.00 | 67.7% | $31,000.00 | $6,500.00 |
| 3 | Switchgear and panels | $60,000.00 | $0.00 | $0.00 | $18,000.00 | $18,000.00 | 30.0% | $42,000.00 | $1,800.00 |
| 4 | Trim, fixtures and devices | $60,000.00 | $0.00 | $0.00 | $0.00 | $0.00 | 0.0% | $60,000.00 | $0.00 |
| 5 | Testing and closeout | $12,000.00 | $0.00 | $0.00 | $0.00 | $0.00 | 0.0% | $12,000.00 | $0.00 |
| CO 1 | Added generator receptacle | $8,500.00 | $0.00 | $4,250.00 | $0.00 | $4,250.00 | 50.0% | $4,250.00 | $425.00 |
| Totals |  | $248,500.00 | $52,000.00 | $29,250.00 | $18,000.00 | $99,250.00 | 39.9% | $149,250.00 | $9,925.00 |

## Run the checks on yours

[Open in the pay application tool](https://krishnachagti-sudo.github.io/toll-preview/pay-application/?rate=10)

## Sources

- [AIA Contract Documents: Instructions, G703-1992 Continuation Sheet (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308302-Instructions-G703-1992-Continuation-Sheet)
- [AIA Contract Documents: Instructions, G702-1992 Application and Certificate for Payment (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308242-Instructions-G702-1992-Application-and-Certificate-for-Payment)
- [Minn. Stat. 337.10 (read November 8, 2026)](https://www.revisor.mn.gov/statutes/cite/337.10)

## Steps

1. **Lines total the contract sum.** The scheduled values add up to the original contract sum; change orders are added on their own lines.
2. **No line over 100%.** Completed and stored to date never exceeds the scheduled value; extra work is a change order.
3. **Bill signed change orders only.** A pending change order is listed, not billed.
4. **Previous work from the last approved application.** Use last month's certified amounts, and keep stored materials out of previous work.
5. **Retainage at the contract rate.** And within the state limit where a statute sets one.
6. **Summary from the same lines.** Every summary figure is worked out from the continuation sheet totals.

## Related

- [How to fill out a G702 and G703](https://krishnachagti-sudo.github.io/toll-preview/pay-application/how-to-fill-out-g702-g703/)
- [Pay app in a spreadsheet](https://krishnachagti-sudo.github.io/toll-preview/pay-application/spreadsheet-vs-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pay-application/g702-g703-do-not-tie/  
Data as of: 2026-11-08
