# Name tags printing misaligned

Name tags print off the labels for three reasons: the page was scaled (for example, fitting an 8.5 in wide sheet into 8 in shrinks it by 5.9%, so the rows creep further off the lower they are), the template is for another product, or the printer feeds the sheet unevenly; a plain-paper test at 100% tells them apart.

## Free alignment test page

[Open the badge maker](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/?product=5395)

The badge PDFs here ask the print dialog for no scaling, and keep all text 0.12 in inside each label so a small offset never cuts a name.

A Microsoft MVP gave the same order of checks on Microsoft's forum: no scaling first; then, if a plain-paper test lines up with the label sheet, the printer's rollers.

> Compatible with Avery products; not made or endorsed by Avery. Avery is a trademark of its owner.

- [Microsoft Tech Community: Misalignment of Avery address labels printed through Word (read November 8, 2026)](https://techcommunity.microsoft.com/discussions/word/misalignment-of-avery-address-labels-formatted-and-printed-through-word-/4009421)
- [Avery: Template 5395, Adhesive Name Badges 2-1/3" x 3-3/8" (and its blank PDF template U-0121-01), read November 8, 2026](https://www.avery.com/templates/5395)

## Steps

1. **Print at 100%.** In the print dialog choose Actual size or 100%, never Fit to page or Shrink oversized pages.
2. **Check the number.** Use the template for the number on your box. Same-size products can differ: 5895 sits about 0.03 in lower than 5395.
3. **Print the test page on plain paper.** Lay it on a label sheet and hold both to a window. Measure each 1-inch bar: if it is shorter, the print was scaled.
4. **Nudge if the whole sheet is off.** If every box is off by the same amount, enter that gap as a nudge (right and down, in inches) and print the test again.
5. **Check the feed.** If the test lines up on plain paper but the label sheet drifts row by row, the printer is feeding the label stock unevenly: try the manual feed tray.

## Questions

### Why are my name tags misaligned when printing?

Most often the print was scaled (Fit to page), the template is for another product number, or the printer feeds label sheets unevenly. Test on plain paper at 100% first.

### How do I know if my printer scaled the page?

Measure a known length on the printout: each label on the test page has a bar that is exactly 1 inch at 100%.

## Related

- [Avery mail merge in Word](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/avery-mail-merge-word/)
- [Avery 5395 template](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/avery-5395/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/name-tags-misaligned/  
Data as of: 2026-11-08
