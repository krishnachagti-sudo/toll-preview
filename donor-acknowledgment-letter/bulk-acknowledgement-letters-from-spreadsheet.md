# Bulk acknowledgment letters from a spreadsheet

Keep one gift a row with a donor, a date and an amount, add a type for anything that is not a money gift, and paste it: the letter maker gives each row its own letter type and IRS sentence. The sample sheet makes 9 letters and 1 family notice from 10 rows; the refund is set aside.

## The sample sheet

```csv
Donor,Date,Amount,Type,Description,Fund,Method,Benefit value,Benefit description,DAF sponsor,In memory of,Notify,Notify address,Previous gift date,Address,City,State,ZIP,Email
Priya Natarajan,11/3/2026,500.00,,,Annual fund,Check 2207,,,,,,,2025-11-20,14 Birch Road,Dayton,OH,45402,priya@example.com
Tom Becker,11/7/2026,150.00,,,Fall gala,Card,60.00,Gala dinner ticket,,,,,,3 Elm Court,Kettering,OH,45429,tom@example.com
The Lee Family,11/10/2026,2500.00,DAF grant,,Annual fund,,,,Fidelity Charitable (Lee Family Fund),,,,2025-12-15,8 Park Lane,Oakwood,OH,45419,
Maria Gomez,11/12/2026,100.00,,,General,Online,,,,Robert Gomez,The Gomez family,"40 Hill Street; Dayton, OH 45403",2024-06-01,40 Hill Street,Dayton,OH,45403,maria@example.com
Hardware Depot Inc.,11/14/2026,,In-kind,"Two pallets of canned vegetables (about 1,200 cans)",,,,,,,,,,900 Industrial Way,Moraine,OH,45439,
Ben Okafor,11/18/2026,,Stock,50 shares of Example Corp common stock,,,,,,,,,2025-12-30,40 River Road,Dayton,OH,45402,ben@example.com
Ana Ruiz,11/20/2026,25.00,,,Monthly giving,Card (monthly),,,,,,,2026-10-20,8 Elm Street,Dayton,OH,45403,ana@example.com
Sam Patel,11/21/2026,1000.00,Pledge,"$250 a quarter, January to October 2027",Building fund,,,,,,,,,55 Lake Drive,Centerville,OH,45459,
Grace Chen,11/22/2026,,Volunteer services,"Pro bono bookkeeping, 20 hours",,,,,,,,,,,,,,grace@example.com
Kim Novak,11/24/2026,-40.00,Refund,,General,Card,,,,,,,,,,,,
```

The preview says: "Your file has 9 gifts to acknowledge: 3 money gifts get the "no goods or services" sentence; 1 payment for a ticket or other benefit gets a good faith estimate (1 with the $75 disclosure); 2 gifts of goods or stock are described without a value; 1 grant from a donor-advised fund gets a thank-you without tax receipt language; 1 pledge is confirmed but not receipted; and 1 volunteer is thanked for services (not a receipt). 1 tribute family gets a notice without the amount."

## What it checks

- Tom Becker: $150.00 was more than $75 and partly for goods or services: Pub 1771 requires the disclosure when the payment is asked for or received. This letter gives it.
- 1 refund or reversal set aside (rows 11): no letter is made for them.

## What you get

- One PDF per letter and per family notice, zipped
- One print file with every letter on its own page (duplex option)
- The letter texts, for email bodies
- A summary CSV (file, donor, type, amount, sentence, segments) and an email list
- $0.05 a letter, never more than $9.00 in a month; the preview is free

## Privacy

The page reads your file in the browser to show the table. The rows go to the server only when you preview a letter or make them, and are not stored.

## Try the sample sheet

[Open the letter maker](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/?sample=batch)

> Made-up names. Not tax or legal advice.

## Sources

- [IRS: Publication 1771 (Rev. 11-2023), Charitable Contributions: Substantiation and Disclosure Requirements (read November 7, 2026)](https://www.irs.gov/pub/irs-pdf/p1771.pdf)

## Steps

1. **Columns.** Donor, date and amount are required; type, description, benefit value and description, DAF sponsor, in memory of, notify, address and email are optional.
2. **Clean.** One gift a row, dates as dates, refunds marked or negative.
3. **Paste and preview.** The free preview shows each row's letter type, sentence and segment, and lists what to check.
4. **Make.** One PDF per letter and notice (zipped), a print file, the letter texts and a summary and email CSV.

## Questions

### Is the donor list kept?

No. The rows are sent to make the letters, used for that answer and not kept; the page reads them in your browser first to show the preview table.

### How large a batch can one run take?

Up to 5,000 gifts a call; the page sends a larger batch in parts of 400 rows, and the price stays per letter.

## Related

- [Word mail merge](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/guides/word-mail-merge/)
- [Google Sheets and Autocrat](https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/guides/google-sheets/)
- [From an offerings sheet to annual statements](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/offerings-spreadsheet-to-statements/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/donor-acknowledgment-letter/bulk-acknowledgement-letters-from-spreadsheet/  
Data as of: 2026-11-08
