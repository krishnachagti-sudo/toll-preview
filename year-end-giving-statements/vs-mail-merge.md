# Word mail merge for giving statements, or a statement maker

Word mail merge makes one letter per row of the Excel sheet, so it works for giving statements only once each donor has a single row with a total. A family that gives every Sunday has 52 gift rows in a year, which would be 52 letters: the sheet has to be summarised to 1 row per donor first, and the per-gift list does not come through a plain letter merge.

## What Word mail merge does

- Microsoft's guide to preparing an Excel data source: the first row holds the field names, and each row holds the information about one recipient.
- The merge writes one letter per recipient row, and Preview Results steps through them before you print or merge to email.
- Microsoft notes ZIP codes should be formatted as text to survive the merge.

> From Word mail merge's own page, read November 8, 2026. Plans and features change; check their page.

## What Endwise does

- Works from a gift sheet you already have (CSV, or cells pasted from Excel or Google Sheets); no account with the gifts in it.
- Groups rows by donor or household, merges "Last, First" with "First Last", sets aside rows from other years and subtracts refunds.
- Prints the IRS Publication 1771 wording: the goods-or-services sentence, or the intangible religious benefits sentence for a church, with good faith estimates and the $75 disclosure where a gift bought something.
- Free preview of every total and one statement; $0.10 a donor statement, never more than $19.00 in a month. Also over a REST API and MCP.

## Why a gift sheet does not merge as is

A typical offerings sheet has 52 rows for a family that gives every Sunday. Merged as is, that is 52 letters. You would first need a pivot table of totals per donor, and the letter would show the total but not the gift list. See [the step-by-step for a sheet of gifts](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/offerings-spreadsheet-to-statements/).

## When Word mail merge is the better choice

- Each donor already has one row with a yearly total, and you only need a total on the letter.
- You want your own Word letterhead and layout, and already know mail merge.

## When the statement maker is the better choice

- Your sheet has one row per gift, and you want every gift listed under each donor with the total.
- You need households merged and name variants such as "Smith, John" grouped.
- You want the goods-or-services sentence and the $75 disclosure worked out from the rows.

## Try it on your sheet

[Open the statement maker](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/?sample=church)

## Sources

- [Microsoft Support: Prepare your Excel data source for a Word mail merge (read November 8, 2026)](https://support.microsoft.com/en-us/word/prepare-your-excel-data-source-for-a-word-mail-merge)
- [IRS: Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements (read November 7, 2026)](https://www.irs.gov/pub/irs-pdf/p1771.pdf)

## Questions

### Can I make giving statements with mail merge?

Yes, if each donor is one row with a total. A list of every gift per donor needs a different approach, such as a statement maker that groups gift rows.

### Can I keep my Word letter and use the statement maker's totals?

Yes. The summary CSV it makes has one row per donor with the total, ready to be a mail merge data source.

## Related

- [From an offerings sheet to a statement per family](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/offerings-spreadsheet-to-statements/)
- [What a giving statement must include](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/requirements/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-mail-merge/  
Data as of: 2026-11-08
