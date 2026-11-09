# G702/G703-style pay application template

This G702/G703-style pay application totals 5 schedule-of-values lines and one signed change order to a $248,500.00 contract sum to date, and asks for $42,525.00: $99,250.00 completed and stored, less $9,925.00 retainage at 10% and $46,800.00 previous certificates.

- Current payment due: $42,525.00
- Retainage held: $9,925.00
- Percent complete: 39.9%

## Fill in your own

[Open in the pay application tool](https://krishnachagti-sudo.github.io/toll-preview/pay-application/?rate=10&state=TX)

## The summary

Application 3, period to November 30, 2026 (a made-up job).

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

## The continuation sheet

Previous applications are work only; stored materials are recalculated each period.

| Item | Description | Scheduled value | Previous applications | This period | Stored now | Completed and stored | % | Balance to finish | Retainage |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Mobilization and submittals | $12,000.00 | $12,000.00 | $0.00 | $0.00 | $12,000.00 | 100.0% | $0.00 | $1,200.00 |
| 2 | Underground and rough-in | $96,000.00 | $40,000.00 | $25,000.00 | $0.00 | $65,000.00 | 67.7% | $31,000.00 | $6,500.00 |
| 3 | Switchgear and panels | $60,000.00 | $0.00 | $0.00 | $18,000.00 | $18,000.00 | 30.0% | $42,000.00 | $1,800.00 |
| 4 | Trim, fixtures and devices | $60,000.00 | $0.00 | $0.00 | $0.00 | $0.00 | 0.0% | $60,000.00 | $0.00 |
| 5 | Testing and closeout | $12,000.00 | $0.00 | $0.00 | $0.00 | $0.00 | 0.0% | $12,000.00 | $0.00 |
| CO 1 | Added generator receptacle | $8,500.00 | $0.00 | $4,250.00 | $0.00 | $4,250.00 | 50.0% | $4,250.00 | $425.00 |
| Totals |  | $248,500.00 | $52,000.00 | $29,250.00 | $18,000.00 | $99,250.00 | 39.9% | $149,250.00 | $9,925.00 |

## The formulas

If you build it in a spreadsheet, these are the cells, in the order AIA's instructions describe the columns:

```
Completed and stored to date = previous applications + this period + stored now
Percent = completed and stored / scheduled value
Balance to finish = scheduled value - completed and stored
Retainage = rate x (previous + this period) + stored rate x stored now
Earned less retainage = completed and stored - retainage
Current payment due = earned less retainage - previous certificates
```

The [spreadsheet page](https://krishnachagti-sudo.github.io/toll-preview/pay-application/spreadsheet-vs-generator/) shows the five places these formulas usually break.

## Please read

- Not legal or accounting advice. The arithmetic is exact for the numbers entered; whether they match your contract is yours to check.
- G702/G703-style: this tool's own layout with the same column logic as AIA's published instructions. It is not the AIA documents and is not affiliated with or endorsed by the American Institute of Architects. If your contract requires the AIA forms, use them.
- State retainage rules are quoted from each statute on the state's own site, read November 8, 2026. Your contract, the project's funding and later changes in the law can change the answer.
- States covered: Arizona, Florida, Kansas, Minnesota, Texas, Virginia and Washington, each only for the kinds of project shown. Every other state is listed as not covered rather than guessed at.

## Sources

- [AIA Contract Documents: Instructions, G703-1992 Continuation Sheet (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308302-Instructions-G703-1992-Continuation-Sheet)
- [AIA Contract Documents: Instructions, G702-1992 Application and Certificate for Payment (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308242-Instructions-G702-1992-Application-and-Certificate-for-Payment)
- [AIA Contract Documents: G702 Payment Application and Certificate for Payment, store page (read November 8, 2026)](https://aiacontracts.com/documents/g702-1992)
- [AIA Contract Documents: G703 Continuation Sheet, store page (read November 8, 2026)](https://aiacontracts.com/documents/g703-1992)

## Questions

### Is this the AIA G702 form?

No. It is this tool's own layout using the same columns as AIA's published instructions. AIA sells G702 and G703 at $59.99 each for one-time use; the documents are copyrighted. If your contract names the AIA forms, buy and use them.

### Can I get it in Excel?

The CSV link on this page opens in Excel and Google Sheets with the worked example's values. The tool makes the same CSV, and the PDF, from your own lines.

## Related

- [Schedule of values template](https://krishnachagti-sudo.github.io/toll-preview/pay-application/schedule-of-values-template/)
- [How to fill out a G702 and G703](https://krishnachagti-sudo.github.io/toll-preview/pay-application/how-to-fill-out-g702-g703/)
- [Official AIA forms or a G702/G703-style generator](https://krishnachagti-sudo.github.io/toll-preview/pay-application/vs-aia-forms/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pay-application/g702-g703-template/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/pay-application/g702-g703-template.csv
