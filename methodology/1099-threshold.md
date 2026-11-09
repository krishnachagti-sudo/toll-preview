# How the 1099 threshold is applied: method and sources

Payments are grouped by payee, the ones the IRS does not want on a 1099 are set aside, and each box total is compared with that box's line for the payment year: $600 for 2025 payments and $2,000 for 2026 payments on the general line. A total at exactly the line is reportable and one cent below is not.

## What does the 1099 threshold tracker compute?

The tool checks which payees need a Form 1099-NEC or 1099-MISC for a payment year, in which box, and why, from a list of payments or from one payee. It also returns the lines, due dates, penalties and state rules, and works out the 2027 line from the statute.

Operations (the op field):

- `scan`: A year-end scan of a payments list (rows or a spreadsheet): one verdict per payee, the boxes and amounts, due dates, penalties, a verdict CSV and an IRIS upload file.
- `check`: One payee, one amount: whether a form is needed and why.
- `thresholds`: Every box line for a payment year with the due dates.
- `projection`: The line for a year the IRS has not published, worked out from 26 U.S.C. 6041(h).
- `penalty`: Information return penalties by the year the return is due.
- `state`: A state's own 1099 rule and its Combined Federal/State Filing status.
- `rules`: The rule files every answer comes from, with their sources.

Inputs:

- `paymentYear`: The calendar year the payments were made: 2025, 2026 or 2027.
- `payee, tin, date, amount`: Who was paid, their taxpayer identification number, the payment date and the amount.
- `type, method, payeeType, state`: What the payment was for, how it was paid, what kind of payee it was, and the state.

Outputs:

- a verdict per payee: file, near (within 25% of a line), under or exempt
- the forms and boxes with amounts, and the date a box first reached its line
- reasons in plain words, and what was left out and why
- due dates, TIN and W-9 notes, state copies

## How is it calculated, step by step?

1. Payment rows are read (amounts like "$1,234.50" or "(80.00)" are understood, dates month first) and kept only if dated in the payment year. Rows from other years are counted aside.
2. Rows are grouped into payees: one payee per TIN (its 9 digits), otherwise per name, where case, spacing, punctuation and "&" do not split a name. A row with no TIN joins a TIN-bearing payee of the same name only if exactly one TIN goes with that name. Names that match once words like LLC are dropped but whose keys differ are flagged as a possible duplicate vendor, never merged.
3. Each row, in date order, is left out with a reason if: its payment type is never reported (rent paid to a property manager, merchandise and freight, wages, personal payments); it was paid by card or payment app (the processor reports it on Form 1099-K); the payee type is never reported (tax-exempt, government, foreign); the payee is a corporation and the type is not one that is reported to corporations (legal fees, medical and health care, attorney gross proceeds, substitute payments, fish bought for resale); or fish was not paid in cash.
4. What remains is added to the box its type belongs to. The date the box total first reached its line is kept, and a later refund that takes the total back under the line undoes the crossing.
5. Each box total is compared with that box's line for the year. "Any amount" boxes are met by any positive total. Otherwise the total must be at least the line.
6. A form is required when a box that is not optional meets its line, or when any backup withholding was taken on that form's payments. Direct sales of $5,000 or more are a checkbox on the 1099-NEC, or on the 1099-MISC when no 1099-NEC is filed.
7. The verdict is file, near (no form yet but a total is at least 75% of a line), exempt (everything was left out) or under.
8. Due dates start from the form instructions' month and day and are rolled to the next business day using the business days engine, so a Saturday, Sunday or federal holiday moves them.
9. For a year the IRS has not published, the line is the statutory $2,000 indexed under 26 U.S.C. 6041(h): the C-CPI-U averaged over the 12 months ending August of the year before, divided by the average for the 12 months ending August 2025, applied to $2,000, with the increase rounded to the nearest $100. It is marked provisional.

## Which edge cases does it handle?

- Exactly at the line: a payee paid $2,000 in 2026 is in, and one cent less is out, for every box and year.
- The line changed: $600 for 2025 payments, $2,000 for 2026 payments. Royalties stay at $10 and attorney gross proceeds at $600 because other sections set them.
- Backup withholding forces a form at any amount.
- A December check dated in the previous year belongs to that year's scan, not this one.
- A payee with no TIN is flagged for a Form W-9 and, if reportable, for backup withholding at the rate on file.
- A year with a gap in the published index: the projection says which months are missing and shows that filling the gap does not move the rounded result, or refuses and falls back to the statutory $2,000.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**One contractor paid $1,500 in 2026**

```json
{
  "op": "check",
  "paymentYear": 2026,
  "amount": 1500,
  "paymentType": "services",
  "payeeType": "individual",
  "method": "check"
}
```

One contractor paid $1,500 in 2026

| Result | Value |
| --- | --- |
| required | false |
| verdict | near |
| answer | No: $1,500.00 is under the $2,000 line for 1099-NEC box 1a. It is within 25% of the line, so collect a Form W-9 now in case more payments follow. |

**A year-end scan: due dates after the roll**

```json
op: "scan"
paymentYear: 2026
payments: 13 items
payer: {...}
payees: 3 items
exports: 2 items
```

A year-end scan: due dates after the roll

| Result | Value |
| --- | --- |
| answer | Of 8 payees paid in 2026, 4 need a form (2 Form 1099-NEC, 3 Form 1099-MISC) at the $2,000 line; 4 do not. |
| 1099-NEC to IRS and recipients | 2027-02-01 |
| 1099-MISC electronic filing | 2027-03-31 |

**The 2027 line from 26 U.S.C. 6041(h)**

```json
{
  "op": "projection",
  "paymentYear": 2027
}
```

The 2027 line from 26 U.S.C. 6041(h)

| Result | Value |
| --- | --- |
| status | provisional |
| base average | 177.205833 |
| current average | 182.856455 |
| increase on $2,000 before rounding (cents) | 6377 |
| line | $2,100 |

## What does it not do?

- Payment years 2025, 2026 and 2027 only. Another year is refused.
- Payments to foreign persons are reported on Form 1042-S and are not covered. Employee wages go on Form W-2.
- Card and payment-app rows are assumed to be goods or services reported by the processor. A personal transfer through an app is not reported by the app either.
- A payee whose type is not given is treated as not a corporation, so the answer errs toward filing. A Form W-9 settles it.
- A scan reads at most 5,000 payment rows. State rules are held only for states whose revenue agency page was read; other states are marked as not checked.
- It does not file anything. It does not decide whether someone is an employee or a contractor.

## Where does the data come from, and how fresh is it?

IRS instructions for payment years 2025 and 2026 were read 2026-10-31. The 2027 line is provisional until the IRS publishes it.

- [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. December 2026)](https://www.irs.gov/instructions/i1099mec)
- [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. April 2025)](https://www.irs.gov/pub/irs-prior/i1099mec--2025.pdf)
- [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. December 2026), Filing dates](https://www.irs.gov/instructions/i1099mec)
- [IRS: Information return penalties](https://www.irs.gov/payments/information-return-penalties)
- [26 U.S. Code 6041(h), Inflation adjustment (Cornell LII)](https://www.law.cornell.edu/uscode/text/26/6041)

IRS instructions for payment years 2025 and 2026, read 2026-10-31. The 2027 line is worked out from 26 U.S.C. 6041(h) and the chained CPI (latest month 2026-09) and is marked provisional until the IRS publishes its own.

1099 threshold tracker: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. April 2025)](https://www.irs.gov/pub/irs-prior/i1099mec--2025.pdf) | Rev. 4-2025 | 2026-10-31 |
| [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. December 2026)](https://www.irs.gov/instructions/i1099mec) | Rev. 12/2026 | 2026-10-31 |
| [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. December 2026), Filing dates](https://www.irs.gov/instructions/i1099mec) | filing dates | 2026-10-31 |
| [IRS: Information return penalties](https://www.irs.gov/payments/information-return-penalties) | penalties | 2026-10-31 |
| [IRS: General Instructions for Certain Information Returns (2025), part N, Backup Withholding](https://www.irs.gov/instructions/i1099gi) | 2025 | 2026-10-31 |
| [26 U.S. Code 6041(h), Inflation adjustment (Cornell LII)](https://www.law.cornell.edu/uscode/text/26/6041) | 26 U.S.C. 6041 | 2026-10-31 |
| [U.S. Bureau of Labor Statistics: Chained CPI for All Urban Consumers (C-CPI-U), series SUUR0000SA0](https://api.bls.gov/publicAPI/v1/timeseries/data/SUUR0000SA0) | through 2026-09 | 2026-10-31 |
| [IRS Publication 1220 (Rev. 5-2026), Part A Sec. 12, Table 1: Participating States and Codes (for tax year 2025, FIRE)](https://www.irs.gov/pub/irs-pdf/p1220.pdf) | Rev. 5-2026 | 2026-10-31 |
| [California Franchise Tax Board: Guide to Information Returns Filed With California (last updated 01/29/2026)](https://www.ftb.ca.gov/file/guide-to-information-returns-filed-with-california.html) | updated 01/29/2026 | 2026-10-31 |
| [IRS: IRIS CSV Template Formatting guidelines, tax year 2025 (ZIP, updated 01/14/2026)](https://www.irs.gov/pub/irs-efile/ty2025-template-formatting-guidelines.zip) | tax year 2025 | 2026-10-31 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Every federal line for 2025 and 2026 is compared with the IRS instructions with the revision recorded, and penalties, the CF/SF states and the IRIS CSV columns the same way. The 2027 projection is checked against the arithmetic in 26 U.S.C. 6041(h). A payee is in at exactly the line and out a cent below it, for every box and year.

What its test suite asserts:

- Every federal line for 2025 and 2026 is compared with the IRS instructions, with the revision and source recorded; penalties, the CF/SF states, California's lines and the IRIS CSV columns are checked the same way.
- The 2027 projection is checked against the arithmetic in 26 U.S.C. 6041(h) (rounded to the nearest $100) and marked provisional.
- A payee is in at exactly the line and out a cent below it, for every box and year.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the 1099 threshold tracker tool](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/).

## Questions

### Is there any AI in the 1099 threshold tracker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the 1099 threshold tracker refuse to answer?

Payment years 2025, 2026 and 2027 only. Another year is refused. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the 1099 threshold tracker tool](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [1099 payee guides](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/2026/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/1099-threshold/  
Data as of: 2026-11-04
