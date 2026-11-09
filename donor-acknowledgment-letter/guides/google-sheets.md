# Donation receipts from Google Sheets

Autocrat fills a Google Docs template from each row of a sheet, so different receipt wording per gift has to be built into the sheet first: a formula column with a branch for each of the 7 gift types; pasting the same rows into the letter maker skips that, because it chooses the IRS sentence for each gift itself.

## What Autocrat does

- Its listing: "Flexible, easy to use document merge tool that creates PDF or shared Documents from spreadsheet data."
- You "Tell Autocrat which fields to merge via \<\<merge tags\>\>" and it mass-generates personalized documents, optionally sent "as email attachments".
- Listing figures on the date read: 4.4 stars from 6,308 ratings, 84M+ installs.

## What receipts need on top

A merge tag prints a cell. For receipts the cell has to hold the right sentence for that gift: the no-goods-or-services sentence, a description and estimate for a ticket, nothing about value for goods, no receipt wording for a DAF grant. In a sheet that is a formula column with one branch per gift type, kept up to date by hand.

## The columns the letter maker reads

Headings are matched with case, spaces and punctuation ignored. The template has: `Donor, Date, Amount, Type, Description, Fund, Method, Benefit value, Benefit description, DAF sponsor, In memory of, In honor of, Notify, Notify address, Address, City, State, ZIP, Email`.

## When Autocrat is the better choice

- Your school or office already runs Autocrat jobs and you want letters saved to Drive.
- Every gift gets the same wording.

## When the letter maker is the better choice

- Mixed gift types in one batch.
- You want segments (first, lapsed, major, monthly) to choose the opening line.
- You would rather not give an add-on access to your Drive.

## Paste your sheet

[Open the letter maker](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/?sample=batch)

> Autocrat's facts are from its own Marketplace listing, read on the date shown. Not tax or legal advice.

## Sources

- [Google Workspace Marketplace: Autocrat by New Visions Cloudlab (listing updated October 21, 2026; read November 8, 2026)](https://workspace.google.com/marketplace/app/autocrat/539341275670)
- [IRS: Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements (read November 7, 2026)](https://www.irs.gov/pub/irs-pdf/p1771.pdf)

## Steps

1. **Keep one gift a row.** Donor, date, amount, type and description columns, with the heading row in place.
2. **Select the cells.** Select the heading row and the gifts in Google Sheets and copy them.
3. **Paste into the letter maker.** Paste into "Or paste it". Columns are recognised by their headings; the preview lists each gift's letter type and sentence, free.
4. **Make the letters.** One PDF per letter, a print file, the letter texts and an email list.

## Questions

### What is Autocrat?

A Google Workspace add-on by New Visions Cloudlab. Its listing describes it as a "Flexible, easy to use document merge tool that creates PDF or shared Documents from spreadsheet data."

### Can Autocrat choose different receipt wording per gift?

Its listing describes merge tags filled from columns; per-gift wording then has to come from the sheet itself, for example a formula column that holds the right sentence for each row.

## Related

- [Word mail merge](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/guides/word-mail-merge/)
- [Bulk letters from a spreadsheet](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/bulk-acknowledgement-letters-from-spreadsheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/guides/google-sheets/  
Data as of: 2026-11-08
