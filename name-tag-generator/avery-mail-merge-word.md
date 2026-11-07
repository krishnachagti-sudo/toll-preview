# Avery name badge mail merge in Word

An Avery name badge mail merge in Word takes 6 steps: Mailings \> Start Mail Merge \> Labels, pick the Avery number, Use an Existing List, insert the fields in the first label, Update Labels and Preview Results, then print; the three usual faults are a missing Next Record, a cut-off second line and drift from scaling.

## Or skip the merge

[Open the badge maker](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/?product=5395)

## The usual faults

| What you see | Why | Fix |
| --- | --- | --- |
| The same name on every label of a sheet | The labels after the first have no Next Record rule | Fields in the first label only, then Update Labels; check with Alt+F9 that each label starts with Next Record |
| Last name or second line missing | Spacing or font size pushes it out of the label | Less paragraph spacing, text closer to the top, or a smaller size for all badges |
| Long names run off the badge | One font size for the whole merge | A second merge for long names with a smaller size, or a tool that fits each badge |
| Rows drift lower down the sheet | Scaling in the print dialog, or the printer's feed | Set no scaling; if a plain-paper test lines up, the printer's rollers are feeding the label stock unevenly |

The faults come from questions on Microsoft's own forums: a sheet that "cuts off the name" on its ninth row, names "replicated six times", and a last name that would "disappear".

> Compatible with Avery products; not made or endorsed by Avery. Avery is a trademark of its owner. Sizes and positions are from each template's avery.com page and the blank PDF template it offers, read November 8, 2026.

- [Avery: Take the Mystery Out of Mail Merge (read November 8, 2026)](https://www.avery.com/blog/take-the-mystery-out-of-mail-merge/)
- [Microsoft Q&A: Mail Merge duplicating entire page, then moving onto next label (read November 8, 2026)](https://learn.microsoft.com/answers/a/12153319)
- [Microsoft Tech Community: How to format text in mail merge name badges (read November 8, 2026)](https://techcommunity.microsoft.com/discussions/word/how-to-format-text-in-mail-merge-name-badges/3752079)
- [Microsoft Tech Community: Misalignment of Avery address labels printed through Word (read November 8, 2026)](https://techcommunity.microsoft.com/discussions/word/misalignment-of-avery-address-labels-formatted-and-printed-through-word-/4009421)

## Steps

1. **Start a label merge.** In Word, open the Mailings tab and choose Start Mail Merge \> Labels.
2. **Pick the Avery product.** In Label Options choose the Avery product number on your box.
3. **Use the guest list.** Select Recipients \> Use an Existing List and choose the Excel file.
4. **Fill the first label.** Insert the merge fields (First Name, Last Name, Company) into the first label and format them.
5. **Copy to every label.** Click Update Labels, then Preview Results.
6. **Print.** Print when the preview looks right (Finish & Merge).

## Questions

### Why does every name tag on the sheet show the same person?

The labels after the first are missing the Next Record rule. Put the fields in the first label only, then Mailings \> Update Labels; each label after the first should start with Next Record (Alt+F9 shows the field codes).

### Why is the last name cut off on my badges?

Paragraph spacing or a large font pushes the second line out of the label. Reduce the line spacing and move the text up, or use a smaller size; Word applies one size to every badge.

### Why do my labels drift down the sheet?

First check that the print dialog is set to no scaling. If a plain-paper test lines up but the label sheet does not, the printer is feeding the label stock unevenly.

## Related

- [Name tags from Excel without Word](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/from-excel/)
- [Avery 5395 template](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/avery-5395/)
- [Avery name badge sizes](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/avery-name-badge-sizes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/avery-mail-merge-word/  
Data as of: 2026-11-08
