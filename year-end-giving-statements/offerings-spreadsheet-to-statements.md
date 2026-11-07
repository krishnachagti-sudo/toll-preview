# From a spreadsheet of offerings to a statement per family

Keep one gift a row with a donor name, a date and an amount, then group the rows by donor or household. In the worked sheet below, 3 names become 2 statements once John Smith and Mary Smith are merged: the Smith household gave $455.00 in 4 gifts, one of them $250 or more.

## Which columns does the sheet need?

Three: who gave, when, and how much. Everything else is optional. The blank template the tool offers has these headings: `Donor, Donor ID, Date, Amount, Fund, Method, Type, Description, Benefit value, Benefit description, Address, City, State, ZIP, Email`.

Some of the headings recognised without renaming (case, spaces and punctuation ignored).

| Field | Headings it is found under |
| --- | --- |
| Donor | Donor, Name, Customer, Family, Member, Household, Constituent |
| Donor ID | Donor ID, Member ID, Envelope, Envelope number, Constituent ID |
| Date | Date, Gift Date, Donation Date, Date Received, Transaction Date, Deposit Date |
| Amount | Amount, Gift Amount, Donation Amount, Gross, Total |
| Fund | Fund, Designation, Campaign, Product/Service, Category |
| Gift of property | Type ("In-kind" or "Stock") and Description, with no amount |

A heading the tool does not know can be named for a field instead, for example the amount column called "Gift (USD)".

## A worked sheet with a couple under two names

```csv
Name,Gift Date,Amount,Fund,Envelope
John Smith,2026-01-04,40.00,General,
Mary Smith,2026-01-11,40.00,General,
"Smith, John",2026-03-01,300.00,Building Fund,
Mary Smith,2026-12-20,75.00,Missions,
Ana Ruiz,2026-02-08,25.00,General,
```

Statements the engine makes from that sheet, before and after one merge line.

| Without a merge | Money total |
| --- | ---: |
| Ana Ruiz | $25.00 |
| John Smith | $340.00 |
| Mary Smith | $115.00 |

"Smith, John" was already grouped with John Smith. With the merge line `John and Mary Smith: John Smith; Mary Smith`, the sheet makes 2 statements: Ana Ruiz ($25.00) and John and Mary Smith ($455.00).

## What the checks catch

The tool's own sample sheet is messy on purpose. Its preview says: "3 donors gave $885.00 in 2026, plus 1 gift of property; 2 statements include a single gift of $250 or more, and every statement carries the IRS goods-or-services sentence." It also lists these notes before you pay:

- Ana Ruiz: A refund or reversal of $40.00 on 4/19/2026 is subtracted from the total.
- John and Mary Smith: Merged under one statement: John and Mary Smith; Smith, John and Mary.
- 1 gift dated outside 2026 set aside (rows 12).

A refund entered as a negative amount, or with "Refund" in the type, is subtracted. A row from the wrong year is set aside, never printed.

## How do I send them?

The finished set is one PDF per donor (zipped), a print file with every statement, a summary CSV for the books and an email list with each donor's file name. An organization can provide the acknowledgment electronically, such as via an email addressed to the donor.. The price is $0.10 a donor statement and never more than $19.00 in a month; the totals and one sample statement are free.

## What else could make them?

If your gifts already live in another system, it may make the statements for you. Compared fairly: [QuickBooks](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-quickbooks/), [Planning Center Giving](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-planning-center-giving/), [Statement Press](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-statement-press/) and [Word mail merge](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-mail-merge/).

## Try it on the sample sheet

[Open the statement maker](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/?sample=church)

> Made-up names and gifts. Not tax or legal advice.

## Sources

- [IRS: Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements (read November 7, 2026)](https://www.irs.gov/pub/irs-pdf/p1771.pdf)

## Steps

1. **One gift a row.** Put each gift on its own row with the donor's name, the date and the amount. Fund, method, address and email are optional columns.
2. **Keep the headings.** Leave the heading row in. Headings such as Name, Customer, Gift Date, Gross or Envelope are recognised without renaming.
3. **Paste or open the file.** Copy the cells from Excel or Google Sheets and paste them, or open a CSV. Rows from other years are set aside and counted.
4. **Merge households.** Name each household once, with the names it appears under in the sheet, so a couple gets one statement.
5. **Check the preview.** The free preview lists every donor's total and shows one finished statement. Compare the grand total with your books.
6. **Make, then send.** Make all the statements: one PDF per donor, a print file, a summary CSV and an email list. The price is $0.10 a donor statement.

## Questions

### Which columns does the sheet need?

A donor name (or a donor ID such as an envelope number), a date and an amount. A gift of property can leave the amount empty and describe the gift instead.

### Are "Smith, John" and "John Smith" one donor?

Yes. Case, punctuation and "Last, First" order are ignored when gifts are grouped, and the statement notes which spellings it merged.

### How do I give a couple one statement?

Add a merge line: the name to print, then the names in the sheet. In the example, John Smith and Mary Smith become "John and Mary Smith".

### How large a sheet can one call take?

Up to 50,000 gift rows; the page splits a larger file by donor and the price stays per donor.

## Related

- [Church contribution statement template](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/templates/church-contribution-statement/)
- [Word mail merge or a statement maker](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/vs-mail-merge/)
- [Quarterly and mid-year statements](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/quarterly-giving-statements/)
- [Reissue or correct a statement](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/reissue-or-correct-a-statement/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/offerings-spreadsheet-to-statements/  
Data as of: 2026-11-08
