# How bulk certificates are made: fitting and layout

Each row with a name becomes one page of one PDF, on US Letter or A4. The name is set at the largest size, in quarter points, at which it fits the line by the standard PDF fonts' published character widths, and every line stays at least 0.5 inch inside the paper edge. A list holds at most 2,000 names.

## What does the bulk certificate generator compute?

Given a list as CSV or rows and a design, the tool reads the names, tidies them, finds repeated rows and lays out one certificate per name in one PDF, with each line sized to fit. It says which certificates have a name made smaller, put on two lines or cut, which letters the fonts cannot print, and which rows were skipped. It offers 7 designs, each with wording you can change, award titles and details (such as hours) per row, up to two signature lines and a date, and a free plan and watermarked proof before the clean PDF.

Operations (the op field):

- `plan`: Reads the list and lays out every certificate without drawing a PDF: the answer in words, the count, the page size, the largest and smallest name sizes, how many names were made smaller, the flagged certificates with their page numbers, the repeats, the rows skipped, the columns used and ignored, and the print order. Free.
- `sample`: Does what plan does and also returns a proof PDF with every certificate watermarked PROOF and a line at the foot saying the clean PDF has none. Free.
- `batch`: Does what plan does and also returns the clean PDF, named after the batch. Needs a batch name; a reprint of the same batch name within 30 days is free.

Inputs:

- `csv or rows`: The list: CSV text (comma, tab or semicolon, at most 200,000 characters) or rows of { name, first, last, award, detail, group }, one of the two. At most 2,000 certificates in one batch; each field at most 120 characters.
- `columns`: Names the heading that holds a field (first, last, full, award, detail, group) when the tool does not recognise it, for example { "full": "Student" }.
- `design`: achievement (Certificate of Achievement), completion (Certificate of Completion), appreciation (Certificate of Appreciation), end-of-year (End of Year Award), funny (Funny class award), kids (Kids award), participation (Certificate of Participation). Default achievement.
- `paper, orientation`: letter (US Letter, 8.5 x 11 in) or a4 (A4, 210 x 297 mm); landscape or portrait (default letter, landscape).
- `title, presented, reason`: The wording, replacing the design's own (at most 80, 100 and 300 characters). {award}, {detail}, {group} and {name} are filled from each row.
- `org, date, signers`: The organization printed at the top (at most 100 characters), the date over its own line, and up to two signers with a name and role.
- `sort, fixNames, removeDuplicates`: as-given, last-name, first-name, group, award (default as-given); whether names typed all in capitals or all in lower case are put in title case (default yes); and whether repeated rows are dropped (default no, they are listed).
- `batch`: The batch name, at most 80 characters: needed for batch, and the name of the PDF file.

Outputs:

- answer: the names, the certificates of which design on which paper, and what was made smaller, cut or could not be printed
- certificates, pages, design, paper, orientation and pageSize in points
- nameSizes and shrunk: the largest and smallest name sizes, the design's full size, and how many names are below it
- flagged: per certificate, its page, row and name and each flag (shrunk, wrapped, cut, characters, empty)
- duplicates, skipped, columnsUsed, columnsIgnored and list: what to check before printing, and the print order
- pdf: the file name, size in bytes and the PDF as base64 (sample and batch)

## How is it calculated, step by step?

1. The CSV's separator is found from its heading line (tab, then semicolon when there is no comma, otherwise comma), quotes and a byte order mark are handled, and each row keeps its line number in the file.
2. Headings are matched to fields with case, spaces and punctuation ignored: Name, Student, Recipient or Attendee for the full name, First name and Last name, Award, Hours or Course for the detail, Homeroom, Class or Team for the group, and others. A column you name wins. A list with no name column is refused, except that a one-column list is read as names.
3. Each name is tidied: spaces collapsed, "Last, First" turned round, and a full name split into first and last at its last space. A name typed all in capitals or all in lower case is put in title case, with Mc and parts after a hyphen or apostrophe capitalized and particles such as van and de kept lower after the first word; mixed case is left as written. Rows with no name are skipped and listed.
4. A repeat is the same name, award and detail with case ignored, so one student with two awards is two certificates. Repeats are listed, or dropped when removeDuplicates is set. Certificates are sorted by the order chosen, ties kept in list order.
5. Each certificate is laid out from the top: the organization in capitals, the title, the presented line, the name over a rule, the award, the reason and the detail. Every line is centred within 0.5 inch of the paper edge plus 30 points. Sizes are set for landscape Letter and scaled to the paper, a little smaller on a portrait page.
6. Each line gets the largest size, in quarter points, at which it fits the width by the Adobe Core 14 character widths of Times and Helvetica. The name and title may go onto two lines before going below their smallest size, and are cut with "..." only past that. The reason may take three lines, shrinking in half points first. If the lines are too tall together, they are all scaled down.
7. Characters the standard PDF fonts cannot print lose their accent or become "?", and the certificate is flagged; letters in Windows-1252, such as é, ñ and š, print as written. A placeholder such as {detail} that a row has nothing for is flagged as empty.
8. The PDF draws each certificate on its own page at the paper size, with the five standard fonts, and asks the print dialog for 100% with no scaling. No date or id is stamped in, so the same list and settings give the same bytes.

**Type metrics.**

The width of each character is the Adobe Core 14 font metrics for Times Roman, Times Bold, Times Italic, Helvetica and Helvetica Bold, which every PDF reader has, so the size worked out is the size printed.

**Printing.**

Every item of every design, paper and orientation stays at least 0.5 inch inside the page edge, twice the quarter inch a desktop printer usually cannot reach. Print at 100% (Actual size).

**Student data.**

General information, not legal advice. The US Department of Education asks teachers to check with their school or district before using an online tool with student data; this tool makes no claim about FERPA compliance. The US Department of Education's Student Privacy Policy Office FAQ on online tools was read on 2026-11-08.

## Which edge cases does it handle?

- A very long name shrinks, then goes onto two lines, then is cut, and the certificate is flagged so it can be checked.
- Two rows with the same name but different awards are two certificates, not a repeat.
- A completion or participation reason that uses {detail} falls back to the design's own wording when the row has no detail.
- A name like "Dubois, Chloé" prints as Chloé Dubois with the accent kept.
- A list of more than 2,000 names is refused: split it.
- A list with a heading and no names, or no row with a name, is refused.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Plan a class of end-of-year awards: names cleaned, a repeated row found, the long name fitted**

```json
{
  "op": "plan",
  "csv": "Student,Award,Homeroom\r\nAna Ruiz,Most Improved Reader,Room 12\r\nBEN OKAFOR,Math Whiz,Room 12\r\n\"Dubois, Chloé\",Kindness Award,Room 14\r\nMaximiliana Featherstonehaugh-Worthington,Science Star,Room 14\r\ndev patel,Perfect Attendance,Room 12\r\n,,\r\nGrace O'Neil,Math Whiz,Room 14\r\nGrace O'Neil,Art Star,Room 14\r\nAna Ruiz,Most Improved Reader,Room 12",
  "design": "end-of-year",
  "org": "Lakeside Elementary School",
  "date": "June 11, 2027",
  "signers": [
    {
      "name": "Ms. Grace Lee",
      "role": "Teacher"
    },
    {
      "name": "Dr. Sam Patel",
      "role": "Principal"
    }
  ],
  "sort": "group"
}
```

Plan a class of end-of-year awards: names cleaned, a repeated row found, the long name fitted

| Result | Value |
| --- | --- |
| answer | 8 names made 8 end-of-year awards on US Letter landscape, one page each in one PDF; 1 long name made smaller to fit. |
| name sizes | 50 pt largest, 33.25 pt smallest |
| page 6 | Maximiliana Featherstonehaugh-Worthington: shrunk to 33.25 pt |
| repeat | row 10 repeats row 2 |
| columns used | full: Student, award: Award, group: Homeroom |

**Three certificates of completion with training hours, as a clean PDF on US Letter**

```json
{
  "op": "batch",
  "batch": "CPR training March 2027",
  "design": "completion",
  "reason": "has completed {detail} of CPR and first aid training",
  "date": "March 6, 2027",
  "rows": [
    {
      "name": "Rosa Delgado",
      "detail": "4 hours"
    },
    {
      "name": "Li Wei",
      "detail": "4 hours"
    },
    {
      "name": "Sean McDonald",
      "detail": "2 hours"
    }
  ]
}
```

Three certificates of completion with training hours, as a clean PDF on US Letter

| Result | Value |
| --- | --- |
| answer | 3 names made 3 certificates of completion on US Letter landscape, one page each in one PDF; every name at the full 50 pt. |
| PDF | cpr-training-march-2027.pdf |
| pages | 3 |

**A free watermarked proof of two kids' awards on A4 portrait**

```json
{
  "op": "sample",
  "design": "kids",
  "paper": "a4",
  "orientation": "portrait",
  "rows": [
    {
      "name": "Olivia Brown"
    },
    {
      "name": "Mateo Garcia"
    }
  ]
}
```

A free watermarked proof of two kids' awards on A4 portrait

| Result | Value |
| --- | --- |
| answer | 2 names made 2 kids' awards on A4 portrait, one page each in one PDF; every name at the full 44.5 pt. |
| page size | 595.28 x 841.89 pt |
| proof PDF | super-star-award-proof.pdf |

## What does it not do?

- It uses the standard PDF fonts, so scripts outside Windows-1252, such as Chinese or Polish Ł, are printed with "?" or without the accent and flagged.
- It prints only the 7 designs, on US Letter or A4; there is no upload of your own artwork or logo.
- It cannot correct a printer that scales the page; print at 100%.
- Lists are used to make the PDF and are not kept. It makes no claim about FERPA compliance and is not legal advice.

## Where does the data come from, and how fresh is it?

The designs, wording and font metrics live in the tool's own code and change only by hand, with the tests that pin them. The student privacy guidance was read on studentprivacy.ed.gov on 2026-11-08.

- [US Department of Education, Student Privacy Policy Office: "I want to use online tool or application as part of my course..." (read November 8, 2026)](https://studentprivacy.ed.gov/faq/i-want-use-online-tool-or-application-part-my-course-however-i-am-worried-it-violation-ferpa)

The designs, wording and font metrics live in the tool's own code and change only by hand, with the tests that pin them. The student privacy guidance was read on studentprivacy.ed.gov on 2026-11-08.

Bulk certificate generator: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [US Department of Education, Student Privacy Policy Office: FAQ on using an online tool in a course](https://studentprivacy.ed.gov/faq/i-want-use-online-tool-or-application-part-my-course-however-i-am-worried-it-violation-ferpa) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check CSV reading, heading matching, name tidying and case fixing, repeats and sorting, the Adobe metrics, fitting at every boundary (full size, smaller, two lines, cut), placeholders, that every item of every design, paper and orientation stays 0.5 inch inside the page, and that the PDFs are valid with one page per certificate and the same bytes every time.

What its test suite asserts:

- Every item of every design, paper and orientation stays at least 0.5 inch inside the page edge.
- Names shrink, go onto two lines and are cut only in that order, measured by the Adobe Core 14 widths of Times and Helvetica.
- CSV reading, heading matching, name case fixing, repeats and sorting are checked, and the PDFs are valid, one page per certificate, with the same bytes every time.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Bulk certificate generator tool](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/).

## Questions

### Is there any AI in the bulk certificate generator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the bulk certificate generator refuse to answer?

It uses the standard PDF fonts, so scripts outside Windows-1252, such as Chinese or Polish Ł, are printed with "?" or without the accent and flagged. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Bulk certificate generator tool](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/bulk-certificate-generator/  
Data as of: 2026-11-04
