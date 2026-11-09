# How donor acknowledgment letters are worded: IRS rules

Each gift gets its own letter. Money gets the no-goods-or-services sentence (or, for a church, the intangible religious benefits one); a payment partly for goods or services gets their description and a good faith estimate, and over $75 the disclosure of the deductible part (IRS Publication 1771, Rev. 11-2023). Goods and stock are described, never valued. A donor needs a written acknowledgment for a single gift of $250 or more.

## What does the donor acknowledgment letters compute?

Given a list of gifts as CSV or rows, the tool reads each one, works out which of 7 kinds of letter it needs (cash, quid-pro-quo, in-kind, stock, daf, pledge, services), writes the letter's IRS sentence and opening line, and puts the gift in segments (first, repeat, lapsed, major, monthly, memorial, honor). A memorial or honor gift also gets a notice to the family that names the donor but never the amount. The letters come as one PDF per letter, a print file, the letter texts, a summary CSV and an email CSV.

Operations (the op field):

- `rules`: Returns the IRS thresholds ($250 for a written acknowledgment, $75 for the quid pro quo disclosure and the others in the rules file), the quoted rules and their irs.gov sources. Free.
- `preview`: Reads the whole list and returns the answer, the totals, every gift's letter kind, IRS sentence, disclosure, segments and flags, and one sample letter as a PDF marked PREVIEW (the first, or the one named by sample). Free.
- `letters`: Does what preview does and returns a PDF for every letter and family notice (as one ZIP or a list of files), one print PDF of them all, the letter texts, the summary CSV and the email CSV. $0.05 a letter; the same gift's letter again within 180 days is free, and a month costs at most $9.00.

Inputs:

- `csv or gifts`: The gifts: CSV text (at most 1,950,000 characters) or a list of gift objects, one of the two. At most 5,000 gifts in one call.
- `columns`: Names the heading that holds a field when the tool does not recognise it, for example { "donor": "Name", "amount": "Gift" }.
- `org`: The organization: its name (needed), address, EIN, kind (church or nonprofit), benefits (none or religious), the signer and title, a letter date, a message added to every letter, and whether to print the 501(c)(3) line.
- `options`: majorUsd (the major gift line, default $1,000), lapsedMonths (default 12), only (gift kinds or segments to keep), from and to (a date range), and replacement (adds a line saying the letter replaces an earlier one).
- `sample`: For preview: the number of the letter drawn as the sample PDF.
- `deliver, duplex`: For letters: zip (default) or files, and whether the print file adds a blank page so no two letters share a sheet when printed on both sides.

Outputs:

- answer: how many gifts get which letter, and how many tribute families get a notice
- letterDate and totals: gifts, letters, notices, the money given, gifts of $250 or more, disclosures, gifts left out or set aside, and counts by kind and by segment
- letters: per gift, its row, donor, date, kind, segments, amount, goods or services value, deductible part, IRS sentence, disclosure, tribute, file name, notice and flags
- flags, columnsUsed and columnsIgnored: what to check before sending, and how the file was read
- sample (preview); files or zip, print, texts, summaryCsv and emailCsv (letters)

## How is it calculated, step by step?

1. The CSV's separator is found from its heading line (tab, then semicolon when there is no comma, otherwise comma), and headings are matched to fields with case, spaces and punctuation ignored (Donor, Name, Customer or Constituent for the donor; Date, Gift date or Received for the date; and so on). A column you name wins. The file needs a donor name or donor ID, a gift date, and an amount or a description.
2. Each gift is read: dates written 2026-01-04, 1/4/2026 (month first) or Jan 4, 2026; amounts such as 1,234.50, $50 or (25.00), with more than two decimals refused rather than rounded. A gift over $100,000,000 or of $0.00 is refused. A refund, reversal or negative amount is set aside and listed, with no letter.
3. Its kind is chosen in order: a pledge, then a donor-advised fund grant (the type or method says so, or a DAF sponsor is named), then services or volunteer time, then stock (shares, securities, bonds), then goods (in-kind, property, items, or a description with no amount), and otherwise money. Money with a benefit value becomes a quid pro quo payment; a benefit on any other kind is refused.
4. The IRS sentence follows Pub 1771. Money: "No goods or services were provided in exchange for your contribution", or for a church (or benefits set to religious) that the only goods or services were intangible religious benefits. A quid pro quo payment: the goods or services described and the good faith estimate of their value, plus, when the payment is over $75, the sentence limiting the deductible amount to the excess. A DAF grant: no goods or services were provided for the grant. Pledges and services get no IRS sentence.
5. Each donor's gifts (grouped by donor ID, or by name with case and punctuation ignored and "Smith, John" read as John Smith) are sorted by date. The earliest in the file is first and the rest are repeat, unless first and previous gift dates are given. A repeat gift more than lapsedMonths after the previous one is lapsed. Money, quid pro quo, DAF and pledge gifts at or over majorUsd are major; monthly, recurring or sustainer gifts are monthly.
6. The opening line comes from the segments in order: first gift, lapsed ("it is good to have you back"), major, monthly, and otherwise continued support. A memorial or honor gift adds a line naming the person, and a notice to the family named in Notify that names the donor and never the amount.
7. The letter date is the one given, or the latest gift date in the batch. Each letter and notice gets its own file name from the date and the donor, and the PDFs, print file and ZIP have no date or id stamped in, so the same file gives the same bytes.

**IRS Publication 1771.**

The $250 and $75 lines and the quoted wording are the year-end giving statements tool's IRS rules file, read on irs.gov on 2026-11-07: Publication 1771 (Rev. 11-2023) and the IRS pages on written acknowledgments and quid pro quo contributions. A payment of exactly $75.00 gets the estimate but not the disclosure.

**Gifts that are not money.**

A gift of goods or stock is described (for example "50 shares of Example Corp common stock") and its value is never printed; an amount typed beside it is flagged and left out. A donated motor vehicle, boat or airplane is flagged, because a claim over $500 follows Form 1098-C rules instead.

Volunteer services get a thank-you that says it is not a receipt (IRS Publication 526, read 2026-11-08). The donor-advised fund, memorial, pledge and volunteer letters follow common practice; the IRS prescribes no wording for them.

## Which edge cases does it handle?

- A $75.00 ticket payment gets the good faith estimate without the disclosure; $75.01 gets both.
- A benefit value larger than the payment, or a benefit with no description, is refused with the row named.
- A gift in memory and in honor of someone at once is refused; a family named to notify on a gift with no tribute is flagged and no notice is made.
- A gift exactly 12 months after the donor's previous one is not lapsed; a day later it is.
- A DAF grant with no sponsor named says "your donor-advised fund" and is flagged.
- A file with only refunds, or nothing in the dates or segments asked for, is refused.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A food bank's November gifts: the IRS sentence for each kind of gift, the segments and one sample letter**

```json
op: "preview"
org: {...}
csv: "Donor,Date,Amount,Type,Description,Fund,Method,Benefit value,Benefit description,DAF sponsor,In memory of,Notify,Notify address,Previous gift date,Address,City,State,ZIP,Email\r\nPriya Natarajan,11/3/2026,500.00,,,Annual fund,Check 2207,,,,,,,2025-11-20,14 Birch Road,Dayton,OH,45402,priya@example.com\r\nTom Becker,11/7/2026,150.00,,,Fall gala,Card,60.00,Gala dinner ticket,,,,,,3 Elm Court,Kettering,OH,45429,tom@example.com\r\nThe Lee Family,11/10/2026,2500.00,DAF grant,,Annual fund,,,,Fidelity Charitable (Lee Family Fund),,,,2025-12-15,8 Park Lane,Oakwood,OH,45419,\r\nMaria Gomez,11/12/2026,100.00,,,General,Online,,,,Robert Gomez,The Gomez family,\"40 Hill Street; Dayton, OH 45403\",2024-06-01,40 Hill Street,Dayton,OH,45403,maria@example.com\r\nHardware Depot Inc.,11/14/2026,,In-kind,\"Two pallets of canned vegetables (about 1,200 cans)\",,,,,,,,,,900 Industrial Way,Moraine,OH,45439,\r\nBen Okafor,11/18/2026,,Stock,50 shares of Example Corp common stock,,,,,,,,,2025-12-30,40 River Road,Dayton,OH,45402,ben@example.com\r\nAna Ruiz,11/20/2026,25.00,,,Monthly giving,Card (monthly),,,,,,,2026-10-20,8 Elm Street,Dayton,OH,45403,ana@example.com\r\nSam Patel,11/21/2026,1000.00,Pledge,\"$250 a quarter, January to October 2027\",Building fund,,,,,,,,,55 Lake Drive,Centerville,OH,45459,\r\nGrace Chen,11/22/2026,,Volunteer services,\"Pro bono bookkeeping, 20 hours\",,,,,,,,,,,,,,grace@example.com\r\nKim Novak,11/24/2026,-40.00,Refund,,General,Card,,,,,,,,,,,,"
```

A food bank's November gifts: the IRS sentence for each kind of gift, the segments and one sample letter

| Result | Value |
| --- | --- |
| answer | Your file has 9 gifts to acknowledge: 3 money gifts get the "no goods or services" sentence; 1 payment for a ticket or other benefit gets a good faith estimate (1 with the $75 disclosure); 2 gifts of goods or stock are described without a value; 1 grant from a donor-advised fund gets a thank-you without tax receipt language; 1 pledge is confirmed but not receipted; and 1 volunteer is thanked for services (not a receipt). 1 tribute family gets a notice without the amount. |
| money given | $775.00 |
| letter date | 2026-11-30 |
| segments | first 4, repeat 5, lapsed 1, major 2, monthly 1, memorial 1, honor 0 |
| Tom Becker: disclosure | The amount of your contribution that is deductible for federal income tax purposes is limited to the excess of the money you gave ($150.00) over the value of the goods or services we provided ($60.00), that is $90.00. |

**A church's three December gifts: intangible religious benefits, a DAF grant and a memorial gift with its family notice**

```json
op: "letters"
org: {...}
gifts: 3 items
deliver: "files"
```

A church's three December gifts: intangible religious benefits, a DAF grant and a memorial gift with its family notice

| Result | Value |
| --- | --- |
| answer | Your file has 3 gifts to acknowledge: 2 money gifts get the "intangible religious benefits" sentence and 1 grant from a donor-advised fund gets a thank-you without tax receipt language. 1 tribute family gets a notice without the amount. |
| John and Mary Smith (cash) | The only goods or services provided in exchange for your contribution were intangible religious benefits. |
| Ruth Alvarez (daf) | No goods or services were provided in exchange for this grant. |
| Ana Ruiz (cash) | The only goods or services provided in exchange for your contribution were intangible religious benefits. |
| files | acknowledgment-2026-12-06-john-and-mary-smith.pdf, acknowledgment-2026-12-08-ruth-alvarez.pdf, acknowledgment-2026-12-10-ana-ruiz.pdf, tribute-notice-2026-12-10-elena-ruiz.pdf |

## What does it not do?

- It does not value goods or services or decide whether an exception applies: it prints the good faith estimate you enter. It refuses more than 5,000 gifts in one call.
- It does not value gifts of property and does not produce Form 1098-C or Form 8283.
- The DAF, memorial, pledge and volunteer letters follow common practice; the IRS prescribes no wording for them.
- Gifts are used to make the letters and are not kept. It is not tax or legal advice.

## Where does the data come from, and how fresh is it?

The Publication 1771 rules were read on irs.gov on 2026-11-07, and Publication 526 (page updated 2026-04-30) and the IRS donor-advised funds page (updated 2026-10-09) on 2026-11-08. They change only by hand, with the tests that pin them. The gifts come from your own file.

- [IRS Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements](https://www.irs.gov/pub/irs-pdf/p1771.pdf)
- [IRS: Charitable contributions, written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments)
- [IRS: Charitable contributions, quid pro quo contributions](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions)
- [IRS Publication 526 (2025), Charitable Contributions](https://www.irs.gov/publications/p526)
- [IRS: Donor-advised funds](https://www.irs.gov/charities-non-profits/charitable-organizations/donor-advised-funds)

The Publication 1771 rules were read on irs.gov on 2026-11-07, and Publication 526 (page updated 2026-04-30) and the IRS donor-advised funds page (updated 2026-10-09) on 2026-11-08. They change only by hand, with the tests that pin them. The gifts come from your own file.

Donor acknowledgment letters: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [IRS Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements](https://www.irs.gov/pub/irs-pdf/p1771.pdf) | Rev. 11-2023 | 2026-11-07 |
| [IRS: Charitable contributions, written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments) | page updated 2026-06-28 | 2026-11-07 |
| [IRS: Charitable contributions, quid pro quo contributions](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions) | page updated 2026-06-28 | 2026-11-07 |
| [IRS Publication 526 (2025), Charitable Contributions](https://www.irs.gov/publications/p526) | page updated 2026-04-30 | 2026-11-08 |
| [IRS: Donor-advised funds](https://www.irs.gov/charities-non-profits/charitable-organizations/donor-advised-funds) | page updated 2026-10-09 | 2026-11-08 |
| [Fidelity Charitable: How to thank donors who use donor-advised funds (common practice, not an IRS rule)](https://www.fidelitycharitable.org/articles/how-to-thank-donors-who-use-donor-advised-funds.html) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check that the IRS rules are the giving statements tool's file and the additions are pinned to irs.gov, how each kind of gift is read, the Pub 1771 sentences, that $75.00 gets no disclosure, that property values appear in no output, the DAF, pledge, volunteer and family notice wording, every segment boundary, refunds set aside, and that the PDFs are the same bytes every time.

What its test suite asserts:

- The IRS rules are the year-end giving statements tool's file ($250 and $75), and this tool's additions are pinned to irs.gov with their read date.
- A quid pro quo payment always gets a description and good faith estimate, and the disclosure only over $75 (not at $75.00); goods and stock are described and their value appears in no output.
- DAF grants, pledges and volunteer services get thank-yous with no receipt wording, family notices never show the amount, every segment boundary is checked, and the PDFs are the same bytes every time.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Donor acknowledgment letters tool](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/).

## Questions

### Is there any AI in the donor acknowledgment letters answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the donor acknowledgment letters refuse to answer?

It does not value goods or services or decide whether an exception applies: it prints the good faith estimate you enter. It refuses more than 5,000 gifts in one call. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Donor acknowledgment letters tool](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/donor-acknowledgment-letter/  
Data as of: 2026-11-04
