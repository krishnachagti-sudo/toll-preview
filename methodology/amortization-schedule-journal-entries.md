# How amortization schedules become journal entries

A straight-line schedule spreads the amount over equal months, half-months or actual days; every month but the last is rounded half up to the cent and the last takes the remainder, so the balance ends at exactly zero. A loan payment is split into interest (by 30/360, actual/365, actual/360) and principal, and its last payment clears what is left.

## How does it work?

1. Amounts are whole cents and dates are calendar days; refusals name the schedule and the field.
2. A prepaid posts Dr expense, Cr prepaid; deferred revenue Dr deferred revenue, Cr revenue; a loan payment Dr loan, Dr interest, Cr bank; loan fees Dr interest expense, Cr debt issuance costs, straight-line only.
3. Straight-line: monthly gives each month the amount over the months; half-month gives the first and last calendar month half; daily gives each month its days over the days of the term.
4. A loan's level payment is the standard annuity payment (the same as Excel's PMT); each month's interest is the balance times the rate by the day count, the rest is principal, and the last payment clears the balance.
5. A cancellation keeps the months used, then refunds the amount given and writes off (prepaid) or recognizes (deferred revenue) the rest.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/amortization-schedule-journal-entries/#what) below.

## What does it not cover?

- A schedule with a bad date, term or account is refused with the schedule and the field.
- It applies only the 12-month rule's duration test; whether a cost qualifies is for you and your accountant.
- It writes import files; it never posts to your books. Not accounting or tax advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 10 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The import layouts, steps and the 12-month rule were read on Intuit's, Xero's, Microsoft's and eCFR's own pages on 2026-11-08, and the pages are checked daily for changes.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check each method with the rounding in the last month, the loan payment against Excel's PMT, each day count, cancellations, the two eCFR examples of the 12-month rule, that every journal balances, the QuickBooks Online columns, Xero signs and 300-line files, and the template round trip.

- [Intuit QuickBooks: Import journal entries into QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US), see the document, read 2026-11-08
- [Intuit QuickBooks: Does QuickBooks Online have an amortization schedule?](https://quickbooks.intuit.com/learn-support/en-us/journal-entries/does-quickbooks-online-have-an-amortization-schedule/00/185786), see the document, read 2026-11-08
- [Intuit QuickBooks: Prepaid expenses and amortization](https://quickbooks.intuit.com/learn-support/en-us/help-article/expense-accounting/prepaid-expenses-amortization/L0aBbAeMQ_US_en_US), see the document, read 2026-11-08
- [Intuit QuickBooks: Create recurring transactions in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-article/recurring-transactions/create-recurring-transactions-quickbooks-online/L3WoKX2R8_US_en_US), see the document, read 2026-11-08
- [Intuit QuickBooks: Manually track loans in QuickBooks Desktop](https://quickbooks.intuit.com/learn-support/en-us/help-article/chart-accounts/manually-track-loans-quickbooks-desktop/L6UGYFBQX_US_en_US), see the document, read 2026-11-08
- [Intuit QuickBooks: QuickBooks Loan Manager](https://quickbooks.intuit.com/learn-support/en-us/help-article/vendor-loans/quickbooks-loan-manager/L7goT1WgX_US_en_US), see the document, read 2026-11-08
- [Xero Central: Add, import and post manual journals (US)](https://central.xero.com/s/article/Add-import-and-post-manual-journals-US), see the document, read 2026-11-08
- [Xero Central: Set up a repeating journal](https://central.xero.com/s/article/Set-up-a-repeating-journal), see the document, read 2026-11-08
- [eCFR: 26 CFR 1.263(a)-4(f), the 12-month rule (up to date as of November 5, 2026)](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/section-1.263%28a%29-4), see the document, read 2026-11-08
- [Microsoft Support: PMT function](https://support.microsoft.com/en-us/excel/functions/pmt-function), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the amortization schedule to journal entries compute?

Give the schedules (a prepaid expense, deferred revenue, a loan or loan fees) and the tool posts each month's journal entry, balanced, on the right sides for its type, and writes a QuickBooks Online, Xero or generic import file. It rolls each balance forward, ties it to your general ledger balance when given, handles cancellations and checks prepaids against the 12-month rule's duration test.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `preview`: Returns one month's entries for every schedule, the totals, the rollforward and the tie-out. Free.
- `journal`: Returns one balanced journal per date for a range of months, the import file (QuickBooks Online, Xero in files of up to 300 lines, or generic), the schedules and the warnings. The same schedule is free again for 12 months.

Inputs:

- `schedules or csv`: Up to 500 schedules, or the CSV template: type (prepaid, deferred-revenue, loan, loan-fees), amount, start, months (or end), method and accounts.
- `method`: monthly (equal months, the start month in full, the default), half-month (half a month in the first and last month) or daily (actual days in each month over the days of the term).
- `loan fields`: Annual rate, a fixed payment, the first payment date, the day count (30/360, actual/365, actual/360), interest-only, or the lender's own rows.
- `cancel, refund`: The last day used when a prepaid or contract ends early, and the amount refunded.
- `period, from, to, format, loanEntry, initial, glBalances, taxYearEnd`: The month to preview or the range to post, the import format, how loan payments are booked, whether to add the initial entries, balances to tie to, and the tax year end for the 12-month rule.

Outputs:

- answer: the month's lines and amounts from prepaids, deferred revenue and loans
- journals and lines, each journal balanced, with the import file
- rollforward, tie-out and warnings

**Every step in full (7) and the rules**

1. Amounts are whole cents and dates are calendar days; refusals name the schedule and the field.
2. A prepaid posts Dr expense, Cr prepaid; deferred revenue Dr deferred revenue, Cr revenue; a loan payment Dr loan, Dr interest, Cr bank; loan fees Dr interest expense, Cr debt issuance costs, straight-line only.
3. Straight-line: monthly gives each month the amount over the months; half-month gives the first and last calendar month half; daily gives each month its days over the days of the term. Every month but the last is rounded half up; the last takes the remainder.
4. A loan's level payment is the standard annuity payment (the same as Excel's PMT); each month's interest is the balance times the rate by the day count, the rest is principal, and the last payment clears the balance.
5. A cancellation keeps the months used, then refunds the amount given and writes off (prepaid) or recognizes (deferred revenue) the rest.
6. Entries are grouped into one balanced journal per date and written in the chosen import format.
7. The 12-month rule check applies only the duration test of 26 CFR 1.263(a)-4(f)(1) to prepaids.

**Import files and the 12-month rule.**

The QuickBooks Online and Xero import columns follow Intuit's and Xero's own help pages; the 12-month rule is 26 CFR 1.263(a)-4(f) on eCFR; all read on 2026-11-08.

## Which edge cases does it handle?

**The edge cases (4)**

- A half-month schedule starting mid-month still ends at exactly zero.
- Interest-only loans pay the principal with the last payment; a fixed payment below the level one leaves a balloon.
- The interest-reclass option moves only the interest when the bank feed already posted the whole payment to the loan.
- Billing keys follow the terms, not the labels, so renaming a schedule does not make it new.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**November 2026 for a policy, a subscription, a support contract and an equipment loan**

November 2026 for a policy, a subscription, a support contract and an equipment loan

| Result | Value |
| --- | --- |
| answer | For November 2026, your 4 schedules post 9 journal lines: $1,360.00 from prepaids to expense, $2,500.00 from deferred revenue to revenue and $306.46 of loan interest against $867.51 of principal. |
| journal lines | 9 |

**The input**

```json
op: "preview"
period: "2026-11"
schedules: 4 items
```

## How is it tested?

**What its test suite asserts (3)**

- Each method ends at exactly zero with the rounding in the last month; the loan payment matches Excel's PMT.
- The two eCFR examples of the 12-month rule are reproduced.
- Every journal balances, with the QuickBooks Online columns and Xero signs in files of 300 lines.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Amortization schedule to journal entries tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/).

## Questions

### Is there any AI in the amortization schedule to journal entries answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the amortization schedule to journal entries refuse to answer?

A schedule with a bad date, term or account is refused with the schedule and the field. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Amortization schedule to journal entries tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/amortization-schedule-journal-entries/  
Data as of: 2026-11-04
