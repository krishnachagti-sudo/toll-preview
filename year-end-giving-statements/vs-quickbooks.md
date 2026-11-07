# QuickBooks donor statements, or a statement maker

Intuit's help article (updated August 5, 2026) shows QuickBooks Online sending a transaction statement to many donors at once (Customer Hub, Batch action, Create statements) for organizations set up as nonprofits, covering any start and end date you pick. It works when every gift is already in QuickBooks; a statement maker works from a sheet of gifts and adds the IRS wording.

## What QuickBooks does

- Intuit's article "How to create single or multiple transactions statements for donors in QuickBooks" (updated August 5, 2026) applies to organizations set up as nonprofits in QuickBooks.
- Batch: All apps, Customer Hub, Customers & leads; tick the donors; Batch action, Create statements; Statement Type: Transaction Statement; a start and end date; then Save and send.
- A transaction statement shows all activity between the start and end dates you choose.
- The article notes that a donor who is not eligible for a statement of the selected type in that period is left out.

> From QuickBooks's own page, read November 8, 2026. Plans and features change; check their page.

## What Endwise does

- Works from a gift sheet you already have (CSV, or cells pasted from Excel or Google Sheets); no account with the gifts in it.
- Groups rows by donor or household, merges "Last, First" with "First Last", sets aside rows from other years and subtracts refunds.
- Prints the IRS Publication 1771 wording: the goods-or-services sentence, or the intangible religious benefits sentence for a church, with good faith estimates and the $75 disclosure where a gift bought something.
- Free preview of every total and one statement; $0.10 a donor statement, never more than $19.00 in a month. Also over a REST API and MCP.

## When QuickBooks is the better choice

- Every gift is already recorded in QuickBooks against the donor, and the statement it sends says what you need.
- You want statements sent from the same system as your books, by email from QuickBooks.

## When the statement maker is the better choice

- Gifts live in a sheet, an envelope log or a giving platform export, not as QuickBooks transactions per donor.
- You want the Pub 1771 sentences, good faith estimates and the $75 disclosure printed on each statement, and households merged.
- You want one PDF per donor to print or email yourself, plus a summary CSV.

## Try it on your sheet

[Open the statement maker](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/?sample=church)

## Sources

- [Intuit QuickBooks: How to create single or multiple transactions statements for donors in QuickBooks (updated August 5, 2026; read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/customer-statements/create-single-multiple-transactions-statements/L8QK6Ulzc_US_en_US)
- [IRS: Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements (read November 7, 2026)](https://www.irs.gov/pub/irs-pdf/p1771.pdf)

## Questions

### Can QuickBooks Online make giving statements for many donors at once?

Yes, per Intuit's help article: select the donors in Customers & leads, then Batch action, Create statements, with Statement Type set to Transaction Statement.

### Can I use a QuickBooks report with the statement maker?

Yes. Export a report with one row per gift; headings such as Customer, Name, Amount, Date and Product/Service are recognised.

## Related

- [From an offerings sheet to a statement per family](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/offerings-spreadsheet-to-statements/)
- [What a giving statement must include](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/requirements/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-quickbooks/  
Data as of: 2026-11-08
