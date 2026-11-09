# A pay application in a spreadsheet: five formulas that break

A spreadsheet pay application usually breaks in five places: stored materials counted twice (here $18,000.00 too much), retainage on this period only ($4,725.00 instead of $9,925.00), a line over 100%, previous certificates as requested instead of certified, and rounding; Endwise checks each before it makes the PDF.

| Formula that breaks | What happens on the sample |
| --- | --- |
| Stored materials carried into previous work | Next month the $18,000.00 of stored switchgear is copied into previous work and also left as stored: completed and stored becomes $117,250.00 instead of $99,250.00. AIA's instructions say previous work excludes stored materials. |
| Retainage on this period only | 10% of this month's work and stored materials is $4,725.00; the retainage held to date should be $9,925.00. |
| A line over 100% | Line 1 (Mobilization and submittals) bills $13,500.00 against a scheduled value of $12,000.00 (112.5%). A line cannot pass 100%: move the excess to a change order. |
| Previous certificates as requested | Entering $52,000.00 (requested) instead of $46,800.00 (certified, after retainage) cuts the amount due from $42,525.00 to $37,325.00. |
| Rounding | At 7.5% retainage on odd amounts, rounding each line holds $7,552.10; rounding the total holds $7,552.11. Use the method your GC uses; the tool offers both. |

## When a spreadsheet is better

- You have one job, want to see every cell and pay nothing.
- Your GC sends its own spreadsheet to fill in.

## When Endwise is better

- You want the checks run before the GC runs them.
- You want the PDF and CSV made the same way every month.
- You want the state retainage limit applied where the statute was read.

## Run the checks on your numbers

[Open in the pay application tool](https://krishnachagti-sudo.github.io/toll-preview/pay-application/?rate=10)

## Sources

- [AIA Contract Documents: Instructions, G703-1992 Continuation Sheet (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308302-Instructions-G703-1992-Continuation-Sheet)
- [AIA Contract Documents: Instructions, G702-1992 Application and Certificate for Payment (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308242-Instructions-G702-1992-Application-and-Certificate-for-Payment)
- [Google Sheets](https://sheets.google.com)

## Related

- [Why a G702 and G703 do not tie](https://krishnachagti-sudo.github.io/toll-preview/pay-application/g702-g703-do-not-tie/)
- [G702/G703-style template](https://krishnachagti-sudo.github.io/toll-preview/pay-application/g702-g703-template/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pay-application/spreadsheet-vs-generator/  
Data as of: 2026-11-08
