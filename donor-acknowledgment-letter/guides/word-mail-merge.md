# Donation receipt letters with Word mail merge

A Word merge writes one letter per row, so the IRS sentence can change per gift only through If...Then...Else rules (Mailings \> Rules): the gift types in a typical batch need 7 of them, some nested, and the $75 disclosure needs a calculated field. The letter maker does that branching for you from the same spreadsheet.

## The rules a mixed batch needs

What each gift type needs from the merge, worked from the letter maker's own rules.

| Condition | Wording it switches to | How in Word |
| --- | --- | --- |
| Type is "DAF grant" | DAF thank-you: name the sponsor, no receipt wording | a second IF on the sponsor column |
| Type is "Pledge" | Pledge confirmation, not a receipt | IF on Type |
| Type is "In-kind" or "Stock" | Describe the gift, print no amount | IF on Type, and a second IF to hide the Amount field |
| Benefit value is not blank | Description and good faith estimate | IF on Benefit value |
| Amount greater than 75 and Benefit value not blank | The quid pro quo disclosure with the deductible part | Nested IF (or COMPARE) plus a calculated field |
| In memory of is not blank | A line naming the person; a separate family notice merge | IF, plus a second merge for the notices |
| Organization is a church | Intangible religious benefits sentence | A separate template or another IF |

Microsoft's steps for one rule: place the cursor where the conditional text goes, go to Mailings \> Rules \> If...Then...Else, choose the field name and comparison, enter the value to compare, and enter the text to show when the condition is met and when it is not. The rule types offered include Ask, Fill-in, If...Then...Else, Merge Record #, Next Record If and Skip Record If.

## What breaks

- A blank Type cell falls through to the wrong branch unless every rule has an "otherwise" text.
- An in-kind row with a value in the Amount column prints that value unless a rule hides it; a charity describes property and does not value it (IRS Publication 1771).
- The deductible part of a ticket (payment less the benefit value) is a calculation; a merge field cannot subtract without a formula field.
- A memorial family notice is a second letter to a different person: a second merge from a filtered sheet.

## When Word is the better choice

- The letter is a long, designed appeal that a designer owns.
- Every gift in the batch is the same type, so one template with no rules is enough.

## When the letter maker is the better choice

- A batch mixes money, tickets, goods, stock, DAF grants and memorial gifts.
- Nobody wants to maintain nested IF fields each December.
- You want one PDF per letter and an email list; the price is $0.05 a letter, never more than $9.00 in a month.

## Try the sample batch

[Open the letter maker](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/?sample=batch)

> Microsoft's steps are quoted from its own pages, read on the date shown; menus vary by Word version.

## Sources

- [Microsoft Support: Set the rules for a mail merge (read November 8, 2026)](https://support.microsoft.com/en-us/word/set-the-rules-for-a-mail-merge)
- [Microsoft Support: Prepare your Excel data source for a Word mail merge (read November 8, 2026)](https://support.microsoft.com/en-us/word/prepare-your-excel-data-source-for-a-word-mail-merge)
- [IRS: Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements (read November 7, 2026)](https://www.irs.gov/pub/irs-pdf/p1771.pdf)

## Steps

1. **One gift a row.** In Excel, the first row holds the field names and each row one gift: donor, date, amount, type, description, benefit value and description, sponsor, address.
2. **Write the letter in Word.** Mailings \> Start Mail Merge \> Letters, then Select Recipients \> Use an Existing List and pick the sheet.
3. **Add a rule per gift type.** Place the cursor, go to Mailings \> Rules \> If...Then...Else, choose the field and the comparison, and enter the text for each case.
4. **Check every type.** Preview Results and step through one gift of each type before you finish the merge.

## Questions

### Can Word mail merge change the wording per gift type?

Yes, with If...Then...Else rules (Mailings \> Rules), one per condition. A letter with several gift types needs several rules, some nested.

### Can I keep my Word letterhead?

Yes; mail merge is the better choice when the letter's design matters more than per-gift wording. The letter maker's letter texts (a .txt file) and summary CSV can also be pasted into your own template.

## Related

- [Google Sheets and Autocrat](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/guides/google-sheets/)
- [Year-end statements with mail merge](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-mail-merge/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/guides/word-mail-merge/  
Data as of: 2026-11-08
