# How 1099-K reconciliation works: Box 1a to your books

Box 1a is the year's gross with nothing taken off, so the tool starts there and takes out, in order, what is not business income, then refunds, chargebacks and discounts (Schedule C line 2), then fees and shipping. A payment app or marketplace had to file only when the gross was over $20,000 and the transactions over 200; card processors report any amount.

## How does it work?

1. Every amount is read to whole cents ("$1,234.56", "(12.00)" and 1234.5 all work) and kept as integer cents, so the lines always add up to the cent.
2. Box 1a of every form is added together.
3. Amounts that are not business income come off first: personal payments, duplicate amounts, sales tax, cash back. Personal items sold at a loss or break-even come off by their proceeds and are not deductible; items sold at a gain come off too, and the gain goes to Form 8949 and Schedule D. Amounts your books put in another year come off as timing.
4. What is left is business gross receipts from these forms: Schedule C line 1 for a sole proprietor, or the form the IRS names for a partnership, corporation or personal seller.
5. Refunds, chargebacks and discounts come off next as returns and allowances (Schedule C line 2), giving net sales; then fees, shipping come off as expenses (fees on line 10), giving what you kept before other costs.

> Steps 6 to 9, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/1099-k-reconciliation/#what) below.

## What does it not cover?

- You classify each amount; the tool applies the IRS reporting text to your classification and cannot tell a gift from a sale.
- State 1099-K thresholds are not covered: check your state revenue department.
- Tax years 2023 to 2026 only, and only the federal threshold in force for them as the IRS states it now.
- It is computed from IRS instructions and FAQs and the amounts you enter. It is not tax or legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 10 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The IRS pages were read on 2026-11-08: the Instructions for Form 1099-K (page updated 2026-06-01), the Form 1099-K FAQs, Fact Sheet FS-2025-08, the General Instructions for Certain Information Returns and the Instructions for Schedule C. Federal holidays for the due dates come from the business days tool's calendar. The rules change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The threshold, boxes, due dates and source read dates are pinned to irs.gov. The tests check the worked example ($48,000.00 Box 1a to $45,140.00 of gross receipts and $40,087.60 kept, tying to the books), the threshold at its boundaries, every check, personal items with the IRS FAQ figures, the books variance both ways, export reading, the worksheet and the due dates rolled past weekends.

- [IRS: Instructions for Form 1099-K (Rev. 12/2026)](https://www.irs.gov/instructions/i1099k), page updated 2026-06-01, read 2026-11-08
- [IRS: Understanding your Form 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k), page updated 2026-10-28, read 2026-11-08
- [IRS: What to do with Form 1099-K](https://www.irs.gov/businesses/what-to-do-with-form-1099-k), page updated 2026-07-27, read 2026-11-08
- [IRS: Form 1099-K FAQs, General information](https://www.irs.gov/newsroom/form-1099-k-faqs-general-information), page updated 2026-04-03, read 2026-11-08
- [IRS: Form 1099-K FAQs, What to do if you receive a Form 1099-K](https://www.irs.gov/newsroom/form-1099-k-faqs-what-to-do-if-you-receive-a-form-1099-k), page updated 2026-06-27, read 2026-11-08
- [IRS: Form 1099-K FAQs, Common situations](https://www.irs.gov/newsroom/form-1099-k-faqs-common-situations), page updated 2026-05-11, read 2026-11-08
- [IRS Fact Sheet FS-2025-08, Form 1099-K FAQs (October 2025)](https://www.irs.gov/pub/taxpros/fs-2025-08.pdf), page updated 2025-10-23, read 2026-11-08
- [IRS news release IR-2025-107 (October 23, 2025): Form 1099-K threshold reverts to $20,000](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000), page updated 2025-10-23, read 2026-11-08
- [IRS: General Instructions for Certain Information Returns (2025), Guide to Information Returns](https://www.irs.gov/instructions/i1099gi), page updated 2026-04-30, read 2026-11-08
- [IRS: Instructions for Schedule C (Form 1040) (2025)](https://www.irs.gov/instructions/i1040sc), page updated 2026-04-30, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the 1099-k reconciliation compute?

Given up to 10 Forms 1099-K for one tax year and the amounts you say are personal, duplicated, sales tax, refunds, fees and the rest, the tool walks Box 1a down to business gross receipts and to what you kept, each line with where it goes on a return and the IRS page it comes from.

**In detail: operations, inputs and outputs**

It checks the forms against the federal filing threshold, Boxes 5a to 5l against Box 1a and your books, and other forms for duplicates. A payment export can fill the amounts and rebuild the months. You decide which payments are which; the tool never guesses whether a payment is income.

Operations (the op field):

- `reconcile`: Returns the walkdown (the bridge lines with amounts and where each goes), the totals, each form with its threshold verdict, the personal items with their gain or loss, the month table when there is something to compare, the books variance, the checks and the due dates for the year's forms.
- `workpaper`: Does what reconcile does and also returns the CPA worksheet: a CSV of the bridge, forms, months and personal items, a Markdown memo with the dates, and a corrected-form request to send to the filer when a check calls for one.
- `rules`: Returns the rules the walkdown uses: the $20,000 and 200-transaction threshold, what each box holds, what Box 1a is not adjusted for, where each filer type reports, the Schedule C lines, the personal item rules, what to do about a wrong form, the due dates for a tax year and the sources with their read dates.

Inputs:

- `taxYear, filerType`: The tax year (2023, 2024, 2025, 2026) and who files: sole-proprietor (the default), partnership, corporation or individual (personal items only).
- `forms`: Up to 10 forms, each with Box 1a and optionally the filer's name, kind (tpso for a payment app or marketplace, card for a card processor), Boxes 1b, 1c, 3 and 4, and the 12 month amounts of Boxes 5a to 5l.
- `adjustments`: Amounts in Box 1a that you classify: personal, duplicate, salesTax, cashBack, otherYear, refunds, chargebacks, discounts, fees, shipping. Amounts are written like 48000 or "48,000.00".
- `personalItems`: Up to 50 personal items sold, each with what it sold for and what it cost.
- `books`: Your books' gross receipts for the year, and optionally the 12 monthly amounts, to compare.
- `transactionsCsv, columns, taxInGross`: A payment or marketplace export of at most 180,000 characters; the headings of its date, type, amount, fee, tax and refund columns when the tool does not know them; and whether the platform's Box 1a includes the sales tax you collected.

Outputs:

- answer: the walkdown in one sentence, from Box 1a to gross receipts and what you kept
- bridge: each line with its amount, where it goes on a return and the IRS page it is cited to
- totals: Box 1a, not income, gross receipts, returns, net sales, expenses, kept, withholding and personal-item gains
- forms: each form with its threshold verdict; monthly: Boxes 5a to 5l against the books or export
- checks: the warnings and notes, each with a code; dueDates: payee, IRS paper and IRS electronic
- csv, markdown and correctionRequest (workpaper only)

**Every step in full (9) and the rules**

1. Every amount is read to whole cents ("$1,234.56", "(12.00)" and 1234.5 all work) and kept as integer cents, so the lines always add up to the cent.
2. Box 1a of every form is added together. Box 1a is the gross "without regard to any adjustments" for credits, fees, refunds, shipping or other amounts (Instructions for Form 1099-K), so nothing comes off it unless you say so.
3. Amounts that are not business income come off first: personal payments, duplicate amounts, sales tax, cash back. Personal items sold at a loss or break-even come off by their proceeds and are not deductible; items sold at a gain come off too, and the gain goes to Form 8949 and Schedule D. Amounts your books put in another year come off as timing.
4. What is left is business gross receipts from these forms: Schedule C line 1 for a sole proprietor, or the form the IRS names for a partnership, corporation or personal seller.
5. Refunds, chargebacks and discounts come off next as returns and allowances (Schedule C line 2), giving net sales; then fees, shipping come off as expenses (fees on line 10), giving what you kept before other costs.
6. A transaction export is read by its headings (Date, Transaction Date, Gross, Fee and many more). Each row is placed by its type text: payouts and transfers are left out, chargebacks, refunds, shipping labels, fees, tax and personal payments go to their item, a negative amount with no type is a refund, and the rest are sales. Rows dated outside the tax year are counted aside. The export fills only the items you left empty, and rebuilds the month totals the way Boxes 5a to 5l are built, each payment in the month of its date.
7. Each payment app or marketplace form is tested against the threshold: filing was required only when Box 1a is over $20,000 and Box 3 is over 200; with no Box 3 the answer says the count decides it. Card processor forms have no threshold.
8. The checks flag Boxes 5a to 5l that do not add up to Box 1a, Box 1b above Box 1a, cash tips in Box 1c, backup withholding in Box 4, two forms with the same Box 1a or the same months, a form in an owner's name for a business that files its own return, personal items at both a gain and a loss, amounts taken out that exceed Box 1a, and the difference from your books and from your monthly figures.
9. The due dates are January 31 to the payee and February 28 on paper or March 31 electronically to the IRS, in the year after the tax year, each moved to the next business day past a weekend or federal holiday.

**Instructions for Form 1099-K.**

The threshold for payment apps and marketplaces is over $20,000 and over 200 transactions, both; payment card transactions have no threshold. The box definitions and the list of amounts Box 1a is not adjusted for (credits, cash equivalents, discounts, fees, refunds, shipping, any other amounts) are summarized in the tool's data file from the instructions read on 2026-11-08.

**IRS pages and FAQs on Form 1099-K.**

Where each filer type reports, the treatment of personal items (losses not deductible, gains to Form 8949 and Schedule D, gains and losses reported separately) and what to do about a wrong form (ask the filer for a corrected form, never the IRS) come from the IRS pages and FAQs listed below.

The 2025 General Instructions' Guide to Information Returns still lists third party network transactions at more than $2,500; the 12/2026 Form 1099-K instructions and FS-2025-08 (which supersede it on this point) say over $20,000 and over 200 transactions.

**Instructions for Schedule C.**

Line 1 gross receipts, line 2 returns and allowances, line 10 commissions and fees, and the rule that sales tax imposed on the buyer and paid over is not in gross receipts.

## Which edge cases does it handle?

**The edge cases (6)**

- A form at exactly $20,000, or with exactly 200 transactions, was not required: the rule is over both.
- Two forms with the same Box 1a are flagged as a possible duplicate, and so are two forms with the same twelve month amounts.
- A personal item sold for exactly what it cost counts with the losses, not the gains.
- An export's tax column is subtracted only when taxInGross is set, because some platforms include the sales tax in Box 1a and others do not.
- Rows of an export without a readable date or amount are counted and the first five line numbers named.
- When the books are higher than the walkdown, the answer says cash, check and other payment methods are not on a 1099-K; when lower, it points to an amount taken out twice or a sale missing from the books.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A $48,000 Shopify Payments form against the books, with refunds, fees, labels and sales tax**

A $48,000 Shopify Payments form against the books, with refunds, fees, labels and sales tax

| Result | Value |
| --- | --- |
| answer | Your 2025 Form 1099-K Box 1a of $48,000.00 reconciles to $45,140.00 of business gross receipts after $2,860.00 of sales tax; $2,450.00 of refunds and chargebacks go on line 2 and $2,602.40 of fees and shipping are expenses, so you kept $40,087.60. It ties to your books. |
| gross receipts (Schedule C line 1) | $45,140.00 |
| returns and allowances (line 2) | $2,450.00 |
| fees and shipping | $2,602.40 |
| kept | $40,087.60 |
| threshold | Shopify Payments: $48,000.00 in 612 transactions is over $20,000 and over 200, so the platform had to file it. |
| payee copy due | February 2, 2026 |

**The input**

```json
{
  "op": "reconcile",
  "taxYear": 2025,
  "filerType": "sole-proprietor",
  "forms": [
    {
      "filer": "Shopify Payments",
      "kind": "tpso",
      "box1a": 48000,
      "box3": 612,
      "months": [
        2900,
        3100,
        3600,
        3800,
        4100,
        3700,
        3500,
        3900,
        4200,
        4400,
        5300,
        5500
      ]
    }
  ],
  "adjustments": {
    "salesTax": 2860,
    "refunds": 2150,
    "chargebacks": 300,
    "fees": 1422.4,
    "shipping": 1180
  },
  "books": {
    "grossReceipts": 45140,
    "months": [
      2950,
      3100,
      3600,
      3800,
      4100,
      3700,
      3500,
      3900,
      4200,
      4400,
      5300,
      5450
    ]
  }
}
```

**More worked examples (3)**

**An eBay form and a payment-app form with personal payments in it**

An eBay form and a payment-app form with personal payments in it

| Result | Value |
| --- | --- |
| answer | Your two 2025 Forms 1099-K, $29,550.00 in Box 1a together, reconcile to $28,350.00 of business gross receipts after $1,200.00 of personal payments; $640.00 of refunds go on line 2 and $3,105.75 of fees are expenses, so you kept $24,604.25. |
| eBay threshold | eBay: $23,400.00 in 241 transactions is over $20,000 and over 200, so the platform had to file it. |
| Payment app threshold | Payment app: $6,150.00 is not over $20,000, so the federal rule did not require this form. The IRS says a platform may still send one, a state may set a lower threshold, and backup withholding makes one due. The income is reportable either way. |

**The input**

```json
{
  "op": "reconcile",
  "taxYear": 2025,
  "filerType": "sole-proprietor",
  "forms": [
    {
      "filer": "eBay",
      "kind": "tpso",
      "box1a": 23400,
      "box3": 241
    },
    {
      "filer": "Payment app",
      "kind": "tpso",
      "box1a": 6150,
      "box3": 64
    }
  ],
  "adjustments": {
    "personal": 1200,
    "refunds": 640,
    "fees": 3105.75
  }
}
```

**Personal items sold online, most at a loss and one at a gain**

Personal items sold online, most at a loss and one at a gain

| Result | Value |
| --- | --- |
| answer | Your 2025 Form 1099-K Box 1a of $21,350.00 leaves $0.00 of income after $20,450.00 of personal items sold at a loss and $900.00 of personal items sold at a gain; the $400.00 gain goes on Form 8949 and Schedule D, and the losses are not deductible. |
| Furniture, appliances and clothing | sold $19,750.00, cost $41,200.00: loss |
| Refrigerator | sold $700.00, cost $1,000.00: loss |
| Concert tickets | sold $900.00, cost $500.00: gain |
| report on | Schedule 1 (Form 1040), Form 8949 and Schedule D |

**The input**

```json
{
  "op": "reconcile",
  "taxYear": 2025,
  "filerType": "individual",
  "forms": [
    {
      "filer": "Online marketplace",
      "kind": "tpso",
      "box1a": 21350,
      "box3": 214
    }
  ],
  "personalItems": [
    {
      "description": "Furniture, appliances and clothing",
      "proceeds": 19750,
      "cost": 41200
    },
    {
      "description": "Refrigerator",
      "proceeds": 700,
      "cost": 1000
    },
    {
      "description": "Concert tickets",
      "proceeds": 900,
      "cost": 500
    }
  ]
}
```

**The Form 1099-K rules and the dates for 2026 forms**

The Form 1099-K rules and the dates for 2026 forms

| Result | Value |
| --- | --- |
| answer | A payment app or online marketplace must file Form 1099-K only when a payee's gross payments exceed $20,000 and the transactions exceed 200; card processors report any amount. Forms for 2026 reach payees by February 1, 2027. |
| payee copy | February 1, 2027 |
| IRS on paper | March 1, 2027 |
| IRS electronically | March 31, 2027 |

**The input**

```json
{
  "op": "rules",
  "taxYear": 2026
}
```

## How is it tested?

**What its test suite asserts (3)**

- The threshold (over $20,000 and over 200 transactions), the box list, the due dates and every source's read date are pinned to irs.gov as read on 2026-11-08.
- The worked example walks $48,000.00 of Box 1a to $45,140.00 of gross receipts and $40,087.60 kept and ties to the books; due dates for 2025 forms roll to February 2, 2026, March 2, 2026 and March 31, 2026.
- Every check is triggered and tested, personal items reproduce the IRS FAQ figures, and an export rebuilds the months and fills only empty items.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the 1099-K reconciliation tool](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/).

## Questions

### Is there any AI in the 1099-k reconciliation answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the 1099-k reconciliation refuse to answer?

You classify each amount; the tool applies the IRS reporting text to your classification and cannot tell a gift from a sale. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the 1099-K reconciliation tool](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/1099-k-reconciliation/  
Data as of: 2026-11-04
