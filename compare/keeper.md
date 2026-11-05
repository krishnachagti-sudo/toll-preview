# Keeper alternative for tax set-asides: Endwise compared

Use Keeper if you want a service that tracks expenses, files your return and has accountants to ask. Use Endwise if you only need to know how much of each payment to set aside: on the same case Keeper publishes, a $40,000 profit gives 18.6% there and 18.6% here, and Endwise works it per payment from $0.10.

## Keeper and Endwise side by side

Keeper and Endwise, as of November 2026

| Question | Keeper | Endwise |
| --- | --- | --- |
| What it does | A tax platform: bookkeeping, tax filing, quarterly estimated payments and access to tax professionals. | One job: how much of this payment to set aside, given what you have earned so far this year. US federal and state, or UK. |
| Set-aside method | A calculator for a percentage of 1099 income; its page lists IRS and SSA sources for the method. | Year-to-date tax before and after each payment, split exactly where a payment crosses a bracket or threshold, with each constant cited. |
| Same answer every time | Not stated on the page we read. | Yes, with no AI in the answer. |
| Account needed | Its page does not say the calculator needs an account; its app has a 14-day free trial, then an annual plan. | No account for the percentage on the web. 5 free runs a day. |
| Price model | Standard $199 a year; Premium $399 a year; Business $1,199 a year (its site). | Set-aside for a payment: $0.10 per payment. At most $2.49 a calendar month for this tool; after that it is free until the month ends. |
| Files your return | Yes: federal and state e-filing in its plans. | No. |
| API / AI assistants | Not described on the page we read. | Yes, over REST and MCP. |

> Keeper facts are from its own site, read on 2026-11-05 (as of November 2026). Plans and prices change, so check its pages before you decide.

## When is Keeper the better choice?

- You want one service for bookkeeping, deductions and your tax return, with accountants available.
- You want your bank transactions scanned for deductible expenses.
- You are an LLC, S-corp or partnership owner who needs filing help, which its higher plans cover.
- You want someone else to handle quarterly payments for you.

## When is Endwise the better choice?

- You earn in lumps (gig payouts, invoices) and want the set-aside for each one as it lands.
- You want to see the working: every bracket, rate and source behind the figure.
- You want to pay per payment, with a monthly cap, and no yearly plan.
- You need the figure inside your own app or an AI assistant, over the API or MCP.
- You are a UK sole trader: Income Tax, Class 4 and student loan are covered.

## Do Keeper and Endwise agree on the same case?

Keeper publishes a table for a single freelancer with no other income, the standard deduction and no kids or credits. It covers federal tax only and says to add your state's tax on top. We ran the same cases through Tax set-aside per payment for a state with no income tax (Texas):

| 1099 profit | Keeper (published) | Endwise (computed) |
| --- | ---: | ---: |
| $20,000 | 15.1% | 15.1% |
| $40,000 | 18.6% | 18.6% |
| $60,000 | 20.1% | 20.1% |
| $80,000 | 20.8% | 20.8% |
| $100,000 | 22.4% | 22.4% |
| $150,000 | 25.1% | 25.1% |

Endwise also splits a single payment. For a $3,000.00 payment in Texas after $40,000 earned so far, it says to set aside $691.53 (23.1%).

## How do you switch from Keeper to Endwise?

1. Open the [Tax set-aside per payment](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/) and pick your filing status and state.
2. Enter the payment and what you have earned so far this year.
3. Set that amount aside. Repeat for each payment, or replay the year's payments at once.
4. Put the estimated-payment dates on your calendar: [tax deadline calendar](https://krishnachagti-sudo.github.io/toll-preview/deadlines/).

- [Keeper homepage and pricing (read 2026-11-05)](https://keepertax.com/)
- [Keeper self-employment tax rate calculator, updated October 11, 2026 (read 2026-11-05)](https://www.keepertax.com/self-employment-tax-rate-calculator)

## Questions

### Is there a free alternative to Keeper for tax set-asides?

Keeper's set-aside calculator is on its site and the page does not say whether it costs anything. Tax set-aside per payment returns the percentage for a payment without an account on the web, and its next-due date, safe-harbor amount and rates are free. It does not file your return.

### How much does Keeper cost?

Its site lists Standard at $199 a year, Premium at $399 a year and Business at $1,199 a year, with a 14-day free trial. Read November 5, 2026.

### Do Keeper and Endwise give the same set-aside?

On the case Keeper publishes (a single freelancer, standard deduction, federal tax only), the whole-year percentages match to the tenth of a percent at 6 income levels. The table on this page shows them.

### Does Endwise include state tax?

Yes, for the states it covers, with the state's own brackets (see the Texas and California examples on the Tax set-aside per payment page). Keeper's page says to add your state's income tax on top.

## Related

- [Quarterly estimated tax 2026](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/quarterly-estimated-tax-calculator/)
- [Self-employment tax calculator](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/self-employment-tax-calculator/)
- [Tax deadline calendar](https://krishnachagti-sudo.github.io/toll-preview/deadlines/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/compare/keeper/  
Data as of: 2026-11-05
