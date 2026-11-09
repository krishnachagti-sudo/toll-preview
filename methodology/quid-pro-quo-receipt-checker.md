# How the quid pro quo receipt checker works: IRS rules

A payment is split into the value of what the donor received (your organization's good faith estimate) and the rest, which is deductible. When the payment is over $75 and something was received, the receipt must state the deductible amount and the estimate; a missed disclosure risks $10 a contribution, at most $5,000 an event.

## What does the quid pro quo receipt checker compute?

Given a payment (a gala ticket, auction bid, raffle ticket, sponsorship, membership or a gift with a premium) and what came back with it, the tool works out the deductible amount, whether it is a quid pro quo contribution, whether the disclosure is required and whether a $250 acknowledgment is needed, applying the token, membership and religious exceptions with each year's limits from 2020 to 2027. It can check your own receipt text line by line, write the receipt and invitation wording for every ticket level of an event, and check a list of payments with the penalty exposure.

Operations (the op field):

- `limits`: Returns the insubstantial benefit limits for one year or every year from 2020 to 2027 (the 2% cap, the low-cost article and the minimum gift), the thresholds and the raffle prize reporting thresholds, each with its source. Free.
- `check`: Returns the verdict for one payment: the value received, the deductible amount, whether it is a contribution, a quid pro quo contribution, whether the disclosure and the acknowledgment are required, the exception that applied, the corrected receipt sentence and, with text, each line of your receipt checked. With a prize and wager, the Form W-2G test. Free.
- `wording`: Returns the receipt text, the invitation line and a correction letter for each level of one event (up to 20), as text and CSV. Rewording the same event within 90 days is free.
- `batch`: Checks up to 5,000 payments from rows or a CSV: each row's verdict and deductible amount, the totals, and per event the penalty exposure for rows marked as sent without the disclosure.

Inputs:

- `year`: The tax year, 2020 to 2027: the years whose IRS limits are held.
- `kind`: What the payment was for: ticket, auction, raffle, sponsorship, membership, donation.
- `payment, benefits`: The amount paid, and each thing received with its type and its value (or, for a logo item, its cost to the organization). The value is your good faith estimate; the tool never guesses one.
- `org, event, date, text`: The organization (and whether it is religious), the event, its date and, for check, the receipt text you send.
- `levels`: For wording: each ticket or giving level with its payment and benefits.
- `csv or rows`: For batch: the payments, with donor, event, payment, value, kind and whether the disclosure was sent.

Outputs:

- answer: one sentence with the verdict and the amounts
- deductible, valueReceived, quidProQuo, disclosureRequired, acknowledgmentRequired and the exception that applied (amounts as decimal strings)
- wording: the receipt sentence and, for an event, the invitation line and a correction letter
- checks on your receipt text, and for batch the totals, the events with penalty exposure and a CSV

## How is it calculated, step by step?

1. The payment and each benefit are read into whole cents; more than two decimals or a negative amount is refused.
2. Raffle tickets are not contributions (IRS Publication 526): nothing is deductible and the receipt must not call it deductible.
3. Benefits that are disregarded are set aside: items worth no more than 2% of the payment or the year's cap, whichever is less; logo items whose total cost to the organization is within the year's low-cost article limit when the payment is at least the year's minimum gift; annual membership privileges for a payment of $75 or less; intangible religious benefits from a religious organization; and a sponsor's name or logo shown.
4. What is left is the value received. A payment no larger than it has no donative element: nothing is deductible and no disclosure is required.
5. Otherwise the deductible amount is the payment less the value received. It is a quid pro quo contribution when something was received; the disclosure is required when the payment is over $75 (not at $75), even when the deductible part is smaller.
6. A written acknowledgment is flagged when the deductible amount is $250 or more.
7. Receipt text is checked for both disclosure elements (the deductible amount and the good faith estimate), a "no goods or services" line that is wrong, and wording such as "100% tax deductible"; a corrected sentence is written.
8. For a batch, rows marked as sent without a required disclosure count $10 each, at most $5,000 an event.

**The insubstantial benefit limits.**

Each year's 2% cap, low-cost article and minimum gift come from that year's revenue procedure, as read on irs.gov on 2026-11-08, from Rev. Proc. 2019-44 (for 2020) to Rev. Proc. 2026-35 (for 2027).

**Raffle prizes.**

With a prize and a wager, the check applies the Form W-2G test: winnings less the wager at or over the year's reporting threshold and at least 300 times the wager, with 24% withholding over $5,000, from Publication 3079, the W-2G instructions and the revenue procedure for later years.

## Which edge cases does it handle?

- A payment of exactly $75 with a benefit needs no disclosure; $75.01 does.
- A deductible part under $75 still needs the disclosure when the payment is over $75.
- An auction bid at or below the item's value is not a contribution at all.
- Logo items pass the token test by their cost to the organization, not their retail value.
- Event keys for wording ignore case and spacing, so a re-run of the same event is free.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A $150 gala ticket with a $60 dinner, and a receipt that says "100% tax deductible"**

```json
{
  "op": "check",
  "year": 2026,
  "kind": "ticket",
  "payment": 150,
  "benefits": [
    {
      "what": "dinner and dance",
      "type": "goods-services",
      "value": 60
    }
  ],
  "org": {
    "name": "Riverside Food Bank"
  },
  "event": "the Harvest Gala",
  "date": "2026-11-14",
  "text": "Thank you for your $150.00 gift to Riverside Food Bank for the Harvest Gala. Your gift is 100% tax deductible. No goods or services were provided."
}
```

A $150 gala ticket with a $60 dinner, and a receipt that says "100% tax deductible"

| Result | Value |
| --- | --- |
| answer | A $150.00 payment with $60.00 of goods or services is a quid pro quo contribution over $75: the receipt must state the $90.00 deductible amount and the $60.00 good faith estimate. |
| deductible | $90.00 |
| value received | $60.00 |
| disclosure required | yes |

**Seven gala payments checked at once, with the penalty exposure**

```json
{
  "op": "batch",
  "year": 2026,
  "org": {
    "name": "Riverside Food Bank"
  },
  "csv": "Donor,Event,Payment,Value,Kind,Disclosed\r\nA. Jensen,Harvest Gala,150,60,ticket,no\r\nB. Okafor,Harvest Gala,150,60,ticket,yes\r\nC. Patel,Harvest Gala,75,30,ticket,no\r\nD. Romero,Harvest Gala,2000,600,ticket,no\r\nE. Chen,Harvest Gala,20,,raffle,\r\nF. Kowalski,Harvest Gala,600,600,auction,no\r\nG. Silva,Harvest Gala,450,300,auction,"
}
```

Seven gala payments checked at once, with the penalty exposure

| Result | Value |
| --- | --- |
| answer | 7 payments checked: 4 need the quid pro quo disclosure, 2 marked as sent without it (penalty exposure $20.00, at $10 each and at most $5,000 an event); $1,775.00 deductible of $3,445.00 paid. |
| need the disclosure | 4 |
| penalty exposure | $20.00 |

## What does it not do?

- A year outside 2020 to 2027 is refused: no limits are held for it.
- It never estimates what a dinner, a stay or an auction item is worth: the value is the organization's good faith estimate.
- Federal rules only: state raffle and charitable solicitation rules are not covered. Not tax or legal advice.

## Where does the data come from, and how fresh is it?

Every limit, threshold and quote was read on irs.gov on 2026-11-08. Publication 1771's rules are read from the giving statements tool's own rules file, never copied. Each year's limits come from a new revenue procedure, added by hand each autumn.

- [IRS Publication 1771 (Rev. 11-2023), token, membership and religious exceptions](https://www.irs.gov/pub/irs-pdf/p1771.pdf)
- [IRS: Charitable contributions, quid pro quo contributions](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions)
- [IRS Publication 526 (2025), Charitable Contributions](https://www.irs.gov/publications/p526)
- [IRS: Advertising or qualified sponsorship payments?](https://www.irs.gov/charities-non-profits/advertising-or-qualified-sponsorship-payments)
- [IRS: Instructions for Forms W-2G and 5754 (01/2026)](https://www.irs.gov/instructions/iw2g)
- [IRS Publication 3079 (Rev. 10-2018), Tax-Exempt Organizations and Gaming](https://www.irs.gov/pub/irs-pdf/p3079.pdf)
- [Rev. Proc. 2019-44, section 3.34](https://www.irs.gov/pub/irs-drop/rp-19-44.pdf)
- [Rev. Proc. 2020-45, section 3.34](https://www.irs.gov/pub/irs-drop/rp-20-45.pdf)
- [Rev. Proc. 2021-45, section 3.34](https://www.irs.gov/pub/irs-drop/rp-21-45.pdf)
- [Rev. Proc. 2022-38, section 3.34](https://www.irs.gov/pub/irs-drop/rp-22-38.pdf)
- [Rev. Proc. 2023-34, section 3.34](https://www.irs.gov/pub/irs-drop/rp-23-34.pdf)
- [Rev. Proc. 2024-40, section 2.34](https://www.irs.gov/pub/irs-drop/rp-24-40.pdf)
- [Rev. Proc. 2025-32, section 4.33](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf)
- [Rev. Proc. 2026-35, section 3.35](https://www.irs.gov/pub/irs-drop/rp-26-35.pdf)

Every limit, threshold and quote was read on irs.gov on 2026-11-08. Publication 1771's rules are read from the giving statements tool's own rules file, never copied. Each year's limits come from a new revenue procedure, added by hand each autumn.

Quid pro quo receipt checker: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [IRS Publication 1771 (Rev. 11-2023), token, membership and religious exceptions](https://www.irs.gov/pub/irs-pdf/p1771.pdf) | Rev. 11-2023 | 2026-11-08 |
| [IRS: Charitable contributions, quid pro quo contributions](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions) | see the document | 2026-11-08 |
| [IRS Publication 526 (2025), Charitable Contributions](https://www.irs.gov/publications/p526) | see the document | 2026-11-08 |
| [IRS: Advertising or qualified sponsorship payments?](https://www.irs.gov/charities-non-profits/advertising-or-qualified-sponsorship-payments) | see the document | 2026-11-08 |
| [IRS: Instructions for Forms W-2G and 5754 (01/2026)](https://www.irs.gov/instructions/iw2g) | 01/2026 | 2026-11-08 |
| [IRS Publication 3079 (Rev. 10-2018), Tax-Exempt Organizations and Gaming](https://www.irs.gov/pub/irs-pdf/p3079.pdf) | Rev. 10-2018 | 2026-11-08 |
| [Rev. Proc. 2019-44, section 3.34](https://www.irs.gov/pub/irs-drop/rp-19-44.pdf) | see the document | 2026-11-08 |
| [Rev. Proc. 2020-45, section 3.34](https://www.irs.gov/pub/irs-drop/rp-20-45.pdf) | see the document | 2026-11-08 |
| [Rev. Proc. 2021-45, section 3.34](https://www.irs.gov/pub/irs-drop/rp-21-45.pdf) | see the document | 2026-11-08 |
| [Rev. Proc. 2022-38, section 3.34](https://www.irs.gov/pub/irs-drop/rp-22-38.pdf) | see the document | 2026-11-08 |
| [Rev. Proc. 2023-34, section 3.34](https://www.irs.gov/pub/irs-drop/rp-23-34.pdf) | see the document | 2026-11-08 |
| [Rev. Proc. 2024-40, section 2.34](https://www.irs.gov/pub/irs-drop/rp-24-40.pdf) | see the document | 2026-11-08 |
| [Rev. Proc. 2025-32, section 4.33](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf) | see the document | 2026-11-08 |
| [Rev. Proc. 2026-35, section 3.35](https://www.irs.gov/pub/irs-drop/rp-26-35.pdf) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Every limit and quote is pinned to irs.gov. The tests check the $75 line (over, not at), each exception year by year, the receipt text checks and the fix, the batch penalty at $10 each and $5,000 at most, the raffle prize thresholds, and that the browser engine agrees with the server.

What its test suite asserts:

- Every limit and quote is pinned to irs.gov as read on 2026-11-08; the disclosure applies over $75 and not at it.
- The token, membership, religious, sponsorship and raffle rules are checked year by year, and receipt text checks find a missing estimate and "100% deductible".
- Batch penalty exposure is $10 a row, at most $5,000 an event; the browser engine agrees with the server.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Quid pro quo receipt checker tool](https://krishnachagti-sudo.github.io/toll-preview/quid-pro-quo-receipt-checker/).

## Questions

### Is there any AI in the quid pro quo receipt checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the quid pro quo receipt checker refuse to answer?

A year outside 2020 to 2027 is refused: no limits are held for it. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Quid pro quo receipt checker tool](https://krishnachagti-sudo.github.io/toll-preview/quid-pro-quo-receipt-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/quid-pro-quo-receipt-checker/  
Data as of: 2026-11-04
