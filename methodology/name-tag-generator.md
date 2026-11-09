# How name tags are laid out: Avery template method

Each badge is placed at the label outline measured from the blank PDF template on its avery.com page, for 6 templates (5395, 5895, 5390, 5392, 5146, 5147) and the numbers Avery lists as compatible. The name is set at the largest size that fits inside a 0.12 in margin, and the sheets needed are the labels used divided by the labels per sheet, rounded up.

## What does the name tag generator compute?

Given a guest list as CSV or rows and an Avery product number, the tool finds the badge template, reads the names, tidies them and lays out one badge per guest at that template's exact label positions, each line as large as it fits. It says how many sheets the list needs and what is left blank, and returns a badge PDF and a check-in list for the door. It also prints single walk-in badges on a part-used sheet and a free alignment test page.

Operations (the op field):

- `plan`: Reads the list and returns the sheet count, the blanks on the last sheet, the template, every badge with its sheet, label and name size, the duplicates, the rows with no name, the columns used and ignored, and the badges whose text was cut, wrapped or changed. No PDF. Free.
- `batch`: Does what plan does and also returns the badge PDF, one page per sheet at the sheet size, and a check-in list PDF with each guest's sheet and label. Needs an event name.
- `walkin`: Prints up to 8 walk-in badges on one sheet from a given label, so a part-used sheet can be fed again.
- `test`: Returns the alignment test page for a template: every label outlined and numbered, its centre marked and a 1-inch bar, to print on plain paper and hold against a label sheet. A nudge moves it. Free.

Inputs:

- `product`: An Avery number: 5395, 5895, 5390, 5392, 5146, 5147, or any number Avery lists as compatible with one of them, such as 8395 or 74459. "Avery 5395" and similar forms are read.
- `csv or rows`: The guests: CSV text (comma, tab or semicolon, at most 100,000 characters) or a list of { first, last, full, org, title, pronouns, extra }. At most 2,000 guests in one batch.
- `columns`: Names the heading that holds a field when the tool does not know it, for example { "first": "Given" }.
- `event, header`: The event name (needed for batch and walkin), printed at the top of each badge unless header replaces it (at most 60 characters, empty for none).
- `style, show, fixNames`: first-large, full-name, first-only (default first-large); which of organization, title, pronouns and ticket type to print; and whether names typed all in capitals or all in lower case are put in title case (default yes).
- `sort, removeDuplicates, startAt, spares`: last-name, first-name, organization, as-given (default last-name); whether repeats are dropped; the label to start at on a used sheet; and up to 200 spare badges with only the header.
- `nudge, outlines`: A shift of up to 0.25 inch right or down to correct a printer, and dashed outlines around each badge.
- `position, guests`: For walkin: the first label to print on and the walk-ins.

Outputs:

- answer: the guests and spares, the sheets of which template, the start label and the blank labels left
- template: the name, size as sold, labels per sheet, layout, sheet and label size in inches, compatible numbers and the avery.com page
- badges: per badge, the list row, name, organization, sheet, label and name size in points
- nameSizes and shrunk: the largest and smallest name sizes, and how many names are below their largest size
- flagged, duplicates, skipped, columnsUsed, columnsIgnored: what to check before printing
- pdf and checkIn (batch and walkin), or the alignment test pdf (test)

## How is it calculated, step by step?

1. The product number is looked up among the templates, then among the numbers Avery lists as compatible. A number not found is refused with the list of templates.
2. The CSV is read with its delimiter found from the heading line (tab, semicolon or comma), quotes and a byte order mark handled, and line numbers kept. Headings are matched to fields with case, spaces and punctuation ignored (First name, Surname, Company, Job title, Pronouns, Ticket type and many more). A list with no name column is refused.
3. Each guest is tidied: spaces collapsed, a full name split into first and last, "Last, First" reversed, and a name typed all in capitals or all in lower case put in title case (McDonald, O'Neil, Mary-Jane, van and de kept lower). Mixed case is left as written. Rows with no name are skipped and listed.
4. Repeats are found by first name, last name and organization with case ignored, and listed or removed. Guests are sorted (by last name by default, ties kept in list order).
5. Sheets: the labels used are the start label less one, plus the guests, plus the spares; the sheets are that divided by the labels per sheet, rounded up, and the rest of the last sheet is blank.
6. Each badge is laid out inside its label, 0.12 in from every edge: the header at the top, the ticket type in capitals at the foot, and the name, full name, organization and title with pronouns centred between. Each line gets the largest size, in quarter points, at which it fits the width by Helvetica's published character widths. A name may wrap onto two lines before going below its smallest size, and is cut with "..." only past that. If the lines are too tall together, they are all scaled down.
7. Characters the standard PDF fonts cannot print lose their accent, or become "?", and the badge is flagged. Letters in Windows-1252, such as é, ñ and š, print as written.
8. The PDF draws each badge at its label's position from the template data, one page per sheet at the sheet's size, and asks the print dialog for 100% with no scaling. Nothing in it is dated, so the same input gives the same bytes.

**Avery template pages.**

For each template the size as sold, labels per sheet and compatible numbers are as printed on its avery.com page, and the sheet size and every label outline were measured in points from the blank PDF template that page offers, read on 2026-11-08. Compatible with Avery products; not made or endorsed by Avery.

**Printing.**

Badges land on the labels only when printed at 100% (Actual size). The alignment test is the check: each 1-inch bar measures 1 inch when the print was not scaled, and a nudge corrects a printer that feeds off center.

## Which edge cases does it handle?

- A start label past the labels on a sheet is refused: Avery 5392 has 6 labels, so startAt is 1 to 6.
- Walk-ins that would run off the sheet are refused with the last label they could start at.
- A very long first name shrinks, then wraps, then is cut, and the badge is flagged so it can be checked.
- A list with the same guest twice keeps both unless removeDuplicates is set, and says which row repeats which.
- A guest list with a heading and no guests, or no guest with a name, is refused.
- Spare badges carry only the header, for names written by hand.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Ten RSVP lines on Avery 5395: sheets, a duplicate and a long name fitted**

```json
{
  "op": "plan",
  "product": "5395",
  "event": "Spring Volunteer Social",
  "csv": "First Name,Last Name,Company,Job Title,Pronouns,Ticket Type\r\nAna,Ruiz,Lakeside Clinic,Practice Manager,she/her,Speaker\r\nBEN,OKAFOR,Northgate Depot,Operations Lead,,Attendee\r\nChloé,Dubois,Riverside Bank,Analyst,,Attendee\r\nMaximiliana,Featherstonehaugh-Worthington,Acme Supply,Regional Director of Partnerships,,Sponsor\r\ndev,patel,,Volunteer,he/him,Volunteer\r\n,,,,,\r\nGrace,O'Neil,County Library,Librarian,,Attendee\r\nAna,Ruiz,Lakeside Clinic,Practice Manager,she/her,Speaker\r\nSean,McDonald,Acme Supply,Buyer,,Attendee\r\nLi,Wei,Northgate Depot,Engineer,,Attendee"
}
```

Ten RSVP lines on Avery 5395: sheets, a duplicate and a long name fitted

| Result | Value |
| --- | --- |
| answer | 9 guests fit on 2 sheets of Avery 5395 (8 per sheet); the last sheet has 7 blank labels for walk-ins. |
| label size | 3.375 in x 2.333 in |
| layout | 2 across, 4 down |
| name sizes | 50.25 pt largest, 39.75 pt smallest |
| names below their largest size | 1 |
| duplicates | row 9 repeats row 2 |
| first badge | Chloé Dubois, sheet 1, label 1 |

**The same list on Avery 8395 from label 3 of a used sheet, duplicates removed**

```json
{
  "op": "batch",
  "product": "8395",
  "event": "Spring Volunteer Social",
  "csv": "First Name,Last Name,Company,Job Title,Pronouns,Ticket Type\r\nAna,Ruiz,Lakeside Clinic,Practice Manager,she/her,Speaker\r\nBEN,OKAFOR,Northgate Depot,Operations Lead,,Attendee\r\nChloé,Dubois,Riverside Bank,Analyst,,Attendee\r\nMaximiliana,Featherstonehaugh-Worthington,Acme Supply,Regional Director of Partnerships,,Sponsor\r\ndev,patel,,Volunteer,he/him,Volunteer\r\n,,,,,\r\nGrace,O'Neil,County Library,Librarian,,Attendee\r\nAna,Ruiz,Lakeside Clinic,Practice Manager,she/her,Speaker\r\nSean,McDonald,Acme Supply,Buyer,,Attendee\r\nLi,Wei,Northgate Depot,Engineer,,Attendee",
  "startAt": 3,
  "removeDuplicates": true
}
```

The same list on Avery 8395 from label 3 of a used sheet, duplicates removed

| Result | Value |
| --- | --- |
| answer | 8 guests fit on 2 sheets of Avery 8395 (template 5395, 8 per sheet, starting at label 3); the last sheet has 6 blank labels for walk-ins. |
| template | 5395 |
| guests | 8 |
| badge PDF | name-tags-spring-volunteer-social-avery-5395.pdf |
| check-in list | check-in-spring-volunteer-social.pdf |

**One walk-in badge on label 7 of a part-used sheet**

```json
{
  "op": "walkin",
  "product": "5395",
  "event": "Spring Volunteer Social",
  "position": 7,
  "guests": [
    {
      "first": "Rosa",
      "last": "Delgado",
      "org": "Lakeside Clinic"
    }
  ]
}
```

One walk-in badge on label 7 of a part-used sheet

| Result | Value |
| --- | --- |
| answer | Rosa Delgado: printed on label 7 of one Avery 5395 sheet; feed a sheet with label 7 still on it and leave the rest blank. |
| name size | 50.25 pt |

**The alignment test page for Avery 5392**

```json
{
  "op": "test",
  "product": "5392"
}
```

The alignment test page for Avery 5392

| Result | Value |
| --- | --- |
| template | 5392 |
| labels outlined | 6 |
| label size | 4 in x 3 in |

## What does it not do?

- It prints only the 6 badge templates listed (5395, 5895, 5390, 5392, 5146, 5147) and the numbers Avery lists as compatible with them.
- It uses the standard PDF fonts, so scripts outside Windows-1252, such as Chinese or Polish Ł, are printed with "?" or without the accent and flagged.
- It cannot correct a printer that scales the page; print at 100% and use the alignment test.
- Guest lists are used to make the badges and are not kept.

## Where does the data come from, and how fresh is it?

Every template was read from its avery.com page, and its label outlines measured from the blank PDF template that page offers, on 2026-11-08. The data changes only by hand, with the tests that pin each template.

- [Avery template 5395: Adhesive Name Badges (read 2026-11-08)](https://www.avery.com/templates/5395)
- [Avery template 5895: Adhesive Name Badges (read 2026-11-08)](https://www.avery.com/templates/5895)
- [Avery template 5390: Name Badge Inserts (read 2026-11-08)](https://www.avery.com/templates/5390)
- [Avery template 5392: Name Badges Insert Refills (read 2026-11-08)](https://www.avery.com/templates/5392)
- [Avery template 5146: Print or Write Name Badge Labels (read 2026-11-08)](https://www.avery.com/templates/5146)
- [Avery template 5147: Print or Write Name Badge Labels (read 2026-11-08)](https://www.avery.com/templates/5147)

Every template was read from its avery.com page, and its label outlines measured from the blank PDF template that page offers, on 2026-11-08. The data changes only by hand, with the tests that pin each template.

Name tag generator: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Avery template 5395: Adhesive Name Badges](https://www.avery.com/templates/5395) | blank PDF template U-0121-01 | 2026-11-08 |
| [Avery template 5895: Adhesive Name Badges](https://www.avery.com/templates/5895) | blank PDF template U-0086-01 | 2026-11-08 |
| [Avery template 5390: Name Badge Inserts](https://www.avery.com/templates/5390) | blank PDF template U-0119-01 | 2026-11-08 |
| [Avery template 5392: Name Badges Insert Refills](https://www.avery.com/templates/5392) | blank PDF template U-0114-01 | 2026-11-08 |
| [Avery template 5146: Print or Write Name Badge Labels](https://www.avery.com/templates/5146) | blank PDF template U-0236-01 | 2026-11-08 |
| [Avery template 5147: Print or Write Name Badge Labels](https://www.avery.com/templates/5147) | blank PDF template U-0237-01 | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Each template is pinned to its avery.com page and blank PDF template: size, count, first and last label positions and compatible numbers. The tests check that every line of every badge stays 0.12 in inside the label in every style, the sheet maths at its boundaries, name case fixing, CSV reading, and that the PDFs are valid and the same bytes every time.

What its test suite asserts:

- Each of the 6 templates is pinned to its avery.com page and blank PDF template: size as sold, labels per sheet, sheet and label size, first and last label position, and compatible numbers.
- Every line of every badge stays 0.12 inch inside its label in every style, names shrink, wrap and are cut only in that order, and the sheet maths is checked at its boundaries.
- CSV reading, heading matching, name case fixing, duplicates and sorting are checked, and the badge, alignment test and check-in PDFs are valid and the same bytes every time.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Name tag generator tool](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/).

## Questions

### Is there any AI in the name tag generator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the name tag generator refuse to answer?

It prints only the 6 badge templates listed (5395, 5895, 5390, 5392, 5146, 5147) and the numbers Avery lists as compatible with them. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Name tag generator tool](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Avery name badge sizes](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/avery-name-badge-sizes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/name-tag-generator/  
Data as of: 2026-11-04
