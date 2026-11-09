# How the tax set-aside is calculated: marginal method

The set-aside is the year's tax on (profit so far plus this payment) minus the year's tax on the profit so far, worked out with the same rules both times, so every bracket, wage base or threshold crossed inside the payment is split exactly. It covers tax year 2026 for the US and 2026-27 for the UK.

## What does the tax set-aside per payment compute?

For a self-employed person it says how much of one incoming payment to move to the tax pot, given what has been earned so far this year. It can also replay a year of payments and report a catch-up, and give the next estimated tax due date and safe-harbor amount.

Operations (the op field):

- `payment`: One payment: set-aside, percentage, marginal rate, the breakdown by tax and the working, with the sources of each figure.
- `ledger`: A year of payments in date order, with what should have been saved by now and the catch-up against what was saved.
- `next-due`: The next estimated payment date (US) or Self Assessment date (UK), and the safe-harbor amount or payments on account from last year's figures.
- `constants`: Every rate and threshold in use with its source.

Inputs:

- `country`: US or UK.
- `filingStatus, state, age65, w2Wages, tips, overtime`: US: filing status, state, W-2 wages, qualified tips, overtime and age.
- `nation, salary, studentLoan`: UK: England/Wales/Northern Ireland or Scotland, salary and student loan plans.
- `amount, expenses, miles, date, ytdNetProfit`: The payment, its expenses (or a rate), business miles, the payment date and the net profit so far this year.

Outputs:

- setAside and percent
- breakdown: Social Security, Medicare, Additional Medicare, federal income tax and state tax, or Income Tax, Class 4 and student loan
- crossings: each bracket or threshold passed inside this payment
- nextDue

## How is it calculated, step by step?

1. The payment adds to profit the amount less expenses and less business miles at the IRS rate for the payment date.
2. The year's tax is computed twice, on the profit before the payment and on the profit after it. The set-aside is the difference, never below zero.
3. US self-employment tax is 92.35% of net profit (nothing under $400) at 12.4% Social Security up to the wage base less W-2 wages, plus 2.9000000000000004% Medicare. Half of it is deducted. Additional Medicare Tax of 0.8999999999999999% applies over the threshold for the filing status.
4. US income tax starts from W-2 wages plus profit less half the self-employment tax, takes the standard deduction (more at 65 or over), the tips, overtime and senior deductions of 2025 to 2028 with their phase-outs, and the 20% qualified business income deduction with its threshold, phase-in and minimum deduction. The brackets for the filing status give the tax.
5. State tax follows the state's own rule: none, a flat rate on federal AGI less a deduction, Pennsylvania's flat rate, Illinois with exemptions, or California brackets with exemption credits and the behavioral health tax. States not covered are named, and the answer says it excludes them.
6. UK: Income Tax is computed on salary plus profit, minus the tax PAYE already takes on the salary. The Personal Allowance of £12,570 falls by £1 for every £2 of income over £100,000. Class 4 is 6% between £12,570 and £50,270 and 2% above. Student loan repayments are added beyond what payroll takes.
7. UK payments on account are half of the year's Self Assessment bill, due when the bill is at least £1,000 and less than 80% was collected at source. The first-year set-aside includes the first payment on account.

## Which edge cases does it handle?

- A bracket crossed inside the payment is split: the answer lists the crossing, such as the move from the 12% to the 22% bracket.
- The Social Security wage base is crossed mid-payment: earnings above it pay only the Medicare part.
- The QBI deduction enters its phase-in range, or the UK Personal Allowance starts to taper.
- Expenses larger than the payment lower the bill, so nothing is set aside from it.
- A payment dated in a different tax year than the tables is refused: the US tables are for the cash-basis year received.
- Mileage uses the rate for the payment date: 72.5 cents before July 1, 2026 and 76 cents from then.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A $3,000 payment in Texas, single, with $40,000 earned so far**

```json
{
  "op": "payment",
  "country": "US",
  "filingStatus": "single",
  "state": "texas",
  "amount": 3000,
  "ytdNetProfit": 40000,
  "date": "2026-10-31"
}
```

A $3,000 payment in Texas, single, with $40,000 earned so far

| Result | Value |
| --- | --- |
| set aside | $691.53 |
| percent | 23.1% |
| Social Security | $343.54 |
| Medicare | $80.34 |
| federal income tax | $267.65 |
| state | $0 |

**A £3,000 invoice, England, with £30,000 profit so far**

```json
{
  "op": "payment",
  "country": "UK",
  "nation": "england-wales-ni",
  "amount": 3000,
  "ytdNetProfit": 30000,
  "date": "2026-10-31"
}
```

A £3,000 invoice, England, with £30,000 profit so far

| Result | Value |
| --- | --- |
| set aside | £780 |
| percent | 26% |
| Income Tax | £600 |
| Class 4 | £180 |
| with the first payment on account | £1170 |

## What does it not do?

- US federal tables are for 2026 only, and UK tables for 2026-27 only; payments in other years are refused.
- A sole proprietor with no employees and no business property is assumed for the QBI deduction. Payments to a state not covered exclude that state's tax, and the answer says so.
- Class 2 National Insurance is never added to the UK set-aside.
- It estimates what to save, not what you owe. It is not tax advice and it does not file or pay anything.

## Where does the data come from, and how fresh is it?

US federal figures are for tax year 2026, the UK for 2026-27. Each state's rule was read from the state's own site.

- [IRS Rev. Proc. 2025-32 (2026 inflation adjustments): tax rate tables, standard deduction, additional standard deduction, section 199A thresholds](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf)
- [IRS: Self-employment tax (Social Security and Medicare taxes), page updated 30-Oct-2026](https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes)
- [IRS Topic no. 554, Self-employment tax (92.35% of net earnings)](https://www.irs.gov/taxtopics/tc554)
- [IRS Topic no. 560, Additional Medicare Tax](https://www.irs.gov/taxtopics/tc560)
- [26 U.S.C. 199A(i), minimum deduction for active qualified business income](https://www.law.cornell.edu/uscode/text/26/199A)
- [IRS: Tax deductions for working Americans and seniors (tips, overtime, seniors, 2025 to 2028)](https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors)
- [GOV.UK: Income Tax rates and Personal Allowances (2026 to 2027)](https://www.gov.uk/income-tax-rates)
- [GOV.UK: Scottish Income Tax (2026 to 2027 rates)](https://www.gov.uk/scottish-income-tax)
- [GOV.UK: Self-employed National Insurance rates (2026 to 2027)](https://www.gov.uk/self-employed-national-insurance-rates)
- [GOV.UK: Repaying your student loan, what you pay](https://www.gov.uk/repaying-your-student-loan/what-you-pay)
- [GOV.UK: Understanding your Self Assessment tax bill, payments on account](https://www.gov.uk/understand-self-assessment-bill/payments-on-account)

US federal figures for tax year 2026, the UK for 2026-27, state rules read 2026-10-31. Payments outside 2026 are refused.

Tax set-aside per payment: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [IRS Rev. Proc. 2025-32 (2026 inflation adjustments): tax rate tables, standard deduction, additional standard deduction, section 199A thresholds](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf) | US 2026 | 2026-10-31 |
| [IRS: Self-employment tax (Social Security and Medicare taxes), page updated 30-Oct-2026](https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes) | US 2026 | 2026-10-31 |
| [IRS Topic no. 554, Self-employment tax (92.35% of net earnings)](https://www.irs.gov/taxtopics/tc554) | US 2026 | 2026-10-31 |
| [IRS Topic no. 560, Additional Medicare Tax](https://www.irs.gov/taxtopics/tc560) | US 2026 | 2026-10-31 |
| [26 U.S.C. 199A(i), minimum deduction for active qualified business income](https://www.law.cornell.edu/uscode/text/26/199A) | US 2026 | 2026-10-31 |
| [IRS: Tax deductions for working Americans and seniors (tips, overtime, seniors, 2025 to 2028)](https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors) | US 2026 | 2026-10-31 |
| [26 U.S.C. 224, qualified tips ($25,000 cap, $100 per $1,000 over $150,000 / $300,000)](https://www.law.cornell.edu/uscode/text/26/224) | US 2026 | 2026-10-31 |
| [26 U.S.C. 225, qualified overtime compensation](https://www.law.cornell.edu/uscode/text/26/225) | US 2026 | 2026-10-31 |
| [26 U.S.C. 151(d)(5)(C), $6,000 deduction for seniors (6% over $75,000 / $150,000)](https://www.law.cornell.edu/uscode/text/26/151) | US 2026 | 2026-10-31 |
| [IRS: Standard mileage rates (2026: 72.5 cents January to June, 76 cents July to December)](https://www.irs.gov/tax-professionals/standard-mileage-rates) | US 2026 | 2026-10-31 |
| [IRS Form 1040-ES (2026), Payment due dates](https://www.irs.gov/pub/irs-pdf/f1040es.pdf) | US 2026 | 2026-10-31 |
| [IRS: Estimated tax FAQs for individuals (the $1,000 rule and safe harbors)](https://www.irs.gov/faqs/estimated-tax/individuals/individuals) | US 2026 | 2026-10-31 |
| [IRS: Quarterly interest rates (individual underpayments, 2026)](https://www.irs.gov/payments/quarterly-interest-rates) | US 2026 | 2026-10-31 |
| [GOV.UK: Income Tax rates and Personal Allowances (2026 to 2027)](https://www.gov.uk/income-tax-rates) | UK 2026-27 | 2026-10-31 |
| [GOV.UK: Scottish Income Tax (2026 to 2027 rates)](https://www.gov.uk/scottish-income-tax) | UK 2026-27 | 2026-10-31 |
| [GOV.UK: Self-employed National Insurance rates (2026 to 2027)](https://www.gov.uk/self-employed-national-insurance-rates) | UK 2026-27 | 2026-10-31 |
| [GOV.UK: Repaying your student loan, what you pay](https://www.gov.uk/repaying-your-student-loan/what-you-pay) | UK 2026-27 | 2026-10-31 |
| [GOV.UK: Understanding your Self Assessment tax bill, payments on account](https://www.gov.uk/understand-self-assessment-bill/payments-on-account) | UK 2026-27 | 2026-10-31 |
| Each state's own tax agency or official state portal, named beside the state in the rates and thresholds answer | 2026 | 2026-10-31 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The 2026 federal figures are compared with Rev. Proc. 2025-32 and the IRS pages named in the data. The UK 2026 to 2027 figures are compared with GOV.UK. Worked examples are checked, such as a $3,000 payment from a single filer in Texas, and the rules around them: the Social Security wage base, Additional Medicare Tax and the UK Personal Allowance taper.

What its test suite asserts:

- The 2026 federal figures (brackets, standard deduction, self-employment tax, QBI thresholds, the tips, overtime and senior deductions, payment due dates) are compared with Rev. Proc. 2025-32 and the IRS pages named in the data.
- The UK 2026 to 2027 figures are compared with GOV.UK, and every state covered is one whose rule was read from the state's own site.
- Worked examples are checked, such as a $3,000 payment from a single filer in Texas, and the rules around them: Social Security wage base, Additional Medicare Tax, the UK Personal Allowance taper.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Tax set-aside per payment tool](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/).

## Questions

### Is there any AI in the tax set-aside per payment answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the tax set-aside per payment refuse to answer?

US federal tables are for 2026 only, and UK tables for 2026-27 only; payments in other years are refused. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Tax set-aside per payment tool](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Quarterly estimated tax calculator](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/quarterly-estimated-tax-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/tax-set-aside/  
Data as of: 2026-11-04
