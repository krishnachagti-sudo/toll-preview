# How giving statements are built: IRS rules and sources

Each donor or household gets one statement listing every gift in the period and the money total. Following IRS Publication 1771 (Rev. 11-2023), a single gift of $250 or more is counted on its own, never by adding smaller gifts, and a payment over $75 that was partly for goods or services gets the disclosure wording. Gifts of property are described, never valued.

## How does it work?

1. Each row is read: the donor or donor ID, a date written as 2026-01-04, 1/4/2026 (month first), Jan 4, 2026 or 4 Jan 2026, and an amount in dollars and cents ("$1,234.50", "(25.00)" and "-25" are read; more than two decimals are refused, not rounded).
2. A row is a gift of property when its type says so (in-kind, non-cash, property, stock, securities, shares, goods, vehicle and similar words), or when it has a description and no amount.
3. A row whose type says refund, reversal, chargeback, returned or void is subtracted, even when its amount is written as positive.
4. Gifts dated outside the period are set aside and counted in a flag. A period with no gifts in it is refused.
5. Gifts are grouped by donor ID when the file has one, otherwise by name, with case, punctuation and spacing ignored and "Smith, John" read as "John Smith".

> Steps 6 to 8, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/year-end-giving-statements/#what) below.

## What does it not cover?

- It does not value goods or services or decide whether an exception applies (token items, membership benefits, intangible religious benefits): the statements print what you enter.
- It does not value gifts of property, and it does not produce Form 1098-C for vehicles, boats or airplanes.
- It does not send the disclosure a quid pro quo gift needed at the time of the solicitation or receipt; the statement repeats it but does not replace it.
- It is not tax or legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 4 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The rules were read from irs.gov on 2026-11-07: Publication 1771 (Rev. 11-2023), the IRS pages on written acknowledgments and quid pro quo contributions (updated 2026-06-28), and Publication 6196 (10-2026). They change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The thresholds and quotes are pinned to the irs.gov sources with their read date. The tests check the goods-or-services sentence in every case, that gifts under $250 are never added together, that $75.00 is not quid pro quo and $75.01 is, that property values appear in no output, and that the PDFs and ZIP are the same bytes every time.

- [IRS Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements](https://www.irs.gov/pub/irs-pdf/p1771.pdf), Rev. 11-2023, read 2026-11-07
- [IRS: Charitable contributions, written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments), page updated 2026-06-28, read 2026-11-07
- [IRS: Charitable contributions, quid pro quo contributions](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions), page updated 2026-06-28, read 2026-11-07
- [IRS Publication 6196 (10-2026), Charitable Contribution Deduction Tips for Non-Itemizers](https://www.irs.gov/pub/irs-pdf/p6196.pdf), 10-2026, read 2026-11-07

> The IRS rules are quoted from irs.gov, read on 2026-11-07, and change only by hand with the tests that pin them. The gifts themselves come from your own file.

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the year-end giving statements compute?

Given the gift rows of a year or of any date range, as a CSV or a list, the tool groups them into donors, totals the money gifts, lists the gifts of property, and writes the goods-or-services sentence each statement needs.

**In detail: operations, inputs and outputs**

A preview returns every donor's totals and one sample statement. Statements returns a PDF per donor, a print file, a summary CSV and an email list.

Operations (the op field):

- `rules`: Returns the IRS thresholds and the quoted rules the statements follow, each with its irs.gov source and the date it was read. Free.
- `preview`: Reads the file and returns every donor's totals, the flags and one sample statement PDF marked as a preview. Free.
- `statements`: Reads the file and returns one statement PDF per donor (as a ZIP or a list of files), a print file with every statement, a summary CSV and an email CSV of donors with an email address.

Inputs:

- `org`: The organization: name (required), address, EIN, kind (church or nonprofit), benefits (none or religious), signer and title, statement date, a message, and options for the exempt line, the non-itemizer note and last-name-first names.
- `year, or from and to`: A tax year from 2000 to 2100, or a from and to date for any other period. One of the two.
- `gifts or csv`: The gift rows, as a list or as CSV text (at most 50,000 rows in one call). Columns are found by their headings, such as Donor, Date, Amount, Fund, Method, Type, Description, Benefit value and Benefit description; columns renames a heading the tool does not know.
- `merge`: Optional: names or donor IDs to put under one statement, such as a household (at most 500 merges).
- `deliver, duplex`: For statements: a ZIP or a list of files, and whether the print file is laid out for two-sided printing.

Outputs:

- answer: the donors, the money total, the gifts of property and how many statements include a single gift of $250 or more
- totals: donors, money gifts, property gifts, money total, goods or services value, deductible estimate, statements with a $250 gift, quid pro quo gifts and gifts set aside as outside the period
- donors: per statement, the name, gifts, total, benefits, deductible estimate, the goods-or-services sentence and flags
- flags: merged names, more than one address, refunds, a total that is not positive, quid pro quo gifts, vehicles, benefits with no description, gifts outside the period
- the PDFs, the summary CSV and the email CSV (statements only)

**Every step in full (8) and the rules**

1. Each row is read: the donor or donor ID, a date written as 2026-01-04, 1/4/2026 (month first), Jan 4, 2026 or 4 Jan 2026, and an amount in dollars and cents ("$1,234.50", "(25.00)" and "-25" are read; more than two decimals are refused, not rounded). A row that cannot be read is refused with its row number.
2. A row is a gift of property when its type says so (in-kind, non-cash, property, stock, securities, shares, goods, vehicle and similar words), or when it has a description and no amount. Its value is never read into a total.
3. A row whose type says refund, reversal, chargeback, returned or void is subtracted, even when its amount is written as positive.
4. Gifts dated outside the period are set aside and counted in a flag. A period with no gifts in it is refused.
5. Gifts are grouped by donor ID when the file has one, otherwise by name, with case, punctuation and spacing ignored and "Smith, John" read as "John Smith". A merge entry puts several names or IDs under one statement.
6. For each donor the money gifts are totaled, any goods or services value is subtracted to give the deductible estimate, single gifts of $250 or more are counted, and gifts of more than $75 with a benefit are marked quid pro quo.
7. The goods-or-services sentence is written for the statement: none provided, only intangible religious benefits (the default for a church), or goods or services on the lines marked \*, with the disclosure that the deductible amount is limited to the excess over their value.
8. File names are made from the period and the donor name, made unique, and the PDFs, the print file and the CSVs are built from the same data.

**Publication 1771.**

A donor needs a contemporaneous written acknowledgment for any single contribution of $250 or more, and one annual summary may cover several. Separate gifts under $250 are not added together, so weekly offerings below the line never count as one large gift.

The acknowledgment names the organization, the amount of each money gift, a description but not the value of any property, and either a statement that no goods or services were provided, a description and good faith estimate of what was provided, or a statement that only intangible religious benefits were provided.

**Quid pro quo contributions.**

A payment of more than $75 made partly for goods or services needs a written disclosure, which the IRS says is due at the solicitation or receipt. The line is "more than": $75.00 does not cross it and $75.01 does. The penalty for a missing disclosure is $10 per contribution, up to $5,000 per event or mailing.

**Vehicles and non-itemizers.**

A donated motor vehicle, boat or airplane claimed at over $500 follows Form 1098-C rules, not Publication 1771, so such a gift is flagged. Publication 6196 (10-2026) lets eligible taxpayers who do not itemize deduct up to $1,000 of qualifying cash gifts ($2,000 married filing jointly), which the optional note on the statement repeats.

## Which edge cases does it handle?

**The edge cases (6)**

- A household written two ways ("John and Mary Smith" and "Smith, John and Mary") is merged under one statement and flagged, so the merge can be checked.
- A donor with more than one address gets the first one printed and a flag.
- A benefit value larger than the payment is refused, and so is a benefit on a refund, on a zero amount or on a gift of property.
- A benefit value with no description is flagged, because Publication 1771 asks for both.
- A money total of zero or less is flagged before anything is sent.
- A date range across two years is allowed and labeled with both dates.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A church's 2026 offerings sheet, with a household written two ways and a 2025 row**

A church's 2026 offerings sheet, with a household written two ways and a 2025 row

| Result | Value |
| --- | --- |
| donors | 3 |
| money total | $885.00 |
| property gifts | 1 |
| statements with a gift of $250 or more | 2 |
| gifts set aside (outside 2026) | 1 |
| sentence | The only goods or services provided in exchange for these contributions were intangible religious benefits. |

**The input**

```json
op: "preview"
org: {...}
year: 2026
csv: "Donor,Date,Amount,Fund,Method,Type,Description,Address,City,State,ZIP,Email\r\nJohn and Mary Smith,1/4/2026,50.00,General,Check 1012,,,12 Oak Lane,Springfield,OH,45501,smiths@example.com\r\n\"Smith, John and Mary\",2/1/2026,50.00,General,Check 1018,,,12 Oak Lane,Springfield,OH,45501,\r\nJohn and Mary Smith,3/1/2026,300.00,Building Fund,Check 1025,,,12 Oak Lane,Springfield,OH,45501,\r\nJohn and Mary Smith,12/20/2026,75.00,Missions,Card,,,12 Oak Lane,Springfield,OH,45501,\r\nAna Ruiz,1/11/2026,40.00,General,Cash,,,8 Elm Street,Springfield,OH,45503,ana@example.com\r\nAna Ruiz,4/12/2026,40.00,General,Cash,,,8 Elm Street,Springfield,OH,45503,\r\nAna Ruiz,4/19/2026,-40.00,General,Cash,Refund,,8 Elm Street,Springfield,OH,45503,\r\nAna Ruiz,9/6/2026,,,,In-kind,\"Two boxes of canned food for the pantry\",8 Elm Street,Springfield,OH,45503,\r\nBen Okafor,6/7/2026,250.00,General,Online,,,40 River Road,Dayton,OH,45402,\r\nBen Okafor,11/29/2026,120.00,General,Online,,,40 River Road,Dayton,OH,45402,\r\nBen Okafor,12/28/2025,500.00,General,Online,,,40 River Road,Dayton,OH,45402,"
```

**More worked examples (1)**

**A food bank's gifts with a gala ticket and a stock gift**

A food bank's gifts with a gala ticket and a stock gift

| Result | Value |
| --- | --- |
| money total | $810.00 |
| goods or services value | $85.00 |
| deductible estimate | $725.00 |
| quid pro quo gifts | 1 |
| Priya Natarajan: deductible | $690.00 |

**The input**

```json
op: "statements"
org: {...}
year: 2026
gifts: 5 items
```

## How is it tested?

**What its test suite asserts (3)**

- The thresholds ($250, $75, the $10 penalty up to $5,000, the $1,000 and $2,000 non-itemizer lines) and the quoted rules are pinned to their irs.gov sources and the read date.
- The goods-or-services sentence is checked for no benefits, intangible religious benefits only and gifts with a benefit; gifts under $250 are never added together, and $75.00 is not quid pro quo while $75.01 is.
- Gifts of property are described with their value in no output, refunds are subtracted, vehicles and extra addresses are flagged, and the PDFs and ZIP are the same bytes every time.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Year-end giving statements tool](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/).

## Questions

### Is there any AI in the year-end giving statements answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the year-end giving statements refuse to answer?

It does not value goods or services or decide whether an exception applies (token items, membership benefits, intangible religious benefits): the statements print what you enter. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Year-end giving statements tool](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Year-end giving statement rules](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/requirements/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/year-end-giving-statements/  
Data as of: 2026-11-04
