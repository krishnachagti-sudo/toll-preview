# Certificates from an Excel list

Open the Excel list in the certificate maker and its Name column becomes the name on each certificate: a class of 24 makes 24 certificate pages of US Letter landscape in one PDF, the longest name printed at 45.75 pt instead of 50 pt so it fits, and the clean PDF costs $0.99.

## Open your Excel list

[Open the certificate maker](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/?design=achievement)

## Column headings it reads

| Heading (any of these) | Prints as |
| --- | --- |
| Name, Full name, Student, Student name, Recipient, Participant, Attendee | The name ("Ruiz, Ana" is read as Ana Ruiz) |
| First name and Last name | Joined as "First Last" |
| Award, Achievement, Honor, Superlative, Prize | The award line under the name |
| Hours, CE hours, Credits, Course, Program, Workshop | The detail line, or {detail} in your wording |
| Homeroom, Class, Room, Teacher, Grade, Section | Used to sort the stack ({group} in your wording) |

Names typed in ALL CAPS or all lower case are put in title case (BEN OKAFOR becomes Ben Okafor, o'neil becomes O'Neil); names in mixed case are left exactly as typed. A row with no name is skipped and listed.

## What a class costs

| Certificates | Clean PDF | Priced by |
| ---: | ---: | --- |
| 10 | $0.99 | batch minimum |
| 20 | $0.99 | batch minimum |
| 25 | $0.99 | batch minimum |
| 30 | $0.99 | batch minimum |
| 50 | $0.99 | batch minimum |
| 75 | $0.99 | batch minimum |
| 99 | $0.99 | batch minimum |
| 100 | $1.00 | per certificate |
| 150 | $1.50 | per certificate |
| 200 | $2.00 | per certificate |
| 400 | $4.00 | per certificate |
| 999 | $9.99 | per certificate |
| 1,000 | $9.99 | monthly cap |
| 2,000 | $9.99 | monthly cap |

The proof (watermarked) is free and made in your browser. A reprint of the same batch name within 30 days is free; a larger reprint pays only for the extra names.

> Class lists are used to make the PDF and are not kept. The preview and the free proof are made in your browser; the clean PDF is made on the server, in memory, and the list is discarded with the answer.

- [Microsoft Support: Use mail merge to personalize letters (read November 8, 2026)](https://support.microsoft.com/en-us/office/use-mail-merge-to-personalize-letters-d7686bb1-3077-4af3-926b-8c825e9505a3)

## Steps

1. **Check the sheet.** One person a row under a heading row: a Name column (or First name and Last name). Add Award, Hours or Course, and Homeroom columns if you want them on the certificates or in the sort. Other columns are ignored.
2. **Open the .xlsx here.** Open the workbook in the certificate maker; the first worksheet is read in your browser. A CSV saved from Excel works the same way.
3. **Pick a design and the wording.** Choose a design, then change the title, the line above and under the name, the date and up to two signature lines.
4. **Check the flagged rows.** Names made smaller, names on two lines, letters the font cannot print and repeated rows are listed with their row numbers.
5. **Download the proof, then the clean PDF.** The proof is free and made in your browser. The clean PDF is $0.01 a certificate, at least $0.99 a batch.

## Questions

### How do I make multiple certificates with different names from Excel?

Put one name a row under a heading, open the workbook in a batch certificate generator, pick the design and download one PDF with a page per row. In Word the same job is a mail merge: Mailings \> Start Mail Merge \> Letters, select the list, insert the merge field, then Finish & Merge.

### Which column does it use for the name?

A column headed Name, Full name, Student, Student name, Recipient, Participant or Attendee; or First name and Last name together. You can name the column yourself through the API (columns).

### Can each certificate have a different award?

Yes: a column headed Award (or Achievement, Honor, Superlative) prints its row's award under the name.

## Related

- [Certificates from Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/from-google-sheets/)
- [Mail merge certificates in Word](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/mail-merge-word/)
- [Student certificate designs](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/students/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/from-excel/  
Data as of: 2026-11-08
