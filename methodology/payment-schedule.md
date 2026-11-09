# How the deposit and milestone payment schedule works

Each stage's share is an exact fraction of the total, rounded half up to the cent; the cents the rounding leaves go to one stage (the last by default), so the stages add up to the total exactly. Presets include 50-50, 50-25-25, 30-30-40, 40-30-30, or give your own.

## How does it work?

1. Money is read exactly into whole minor units and worked as BigInt, never floats; a share is an exact fraction (50% is a half, a third is 1/3).
2. Each share is rounded half up to the cent; the leftover cents go to the last stage (or the first) and the answer says so.
3. The deposit is invoiced at the start; the other stages are spread over the weeks, or set by offsets in days, weeks, months or business days.
4. Each due date is the invoice date plus the terms, moved to the next (or previous) business day when it falls on a weekend or a holiday of the chosen region; holidays come from the business days engine and are named.
5. Tax is rounded on each invoice; the last takes the cent so the taxes equal tax on the total.

> Step 6, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/payment-schedule/#what) below.

## What does it not cover?

- Stages that do not add up, a date out of range or an overpayment are refused with the field.
- It sends nothing: the invoices are lines to paste or import and the calendar file is for your own calendar.
- Deposit rules are held only for the states named; not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 4 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The state deposit rules were read on each state's official page on 2026-11-08, with a dated snapshot each quote is checked against. The pages are checked daily for changes. Holidays come from the business days tool's data.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check that every preset adds up to the total to the cent, the rounding rule, custom stages, dates and due dates moved off weekends and holidays, tax on each invoice, that each state quote is word for word in its dated snapshot, the pack and the final invoice.

- [CSLB, Learn About Home Improvement Contracts (California down payment limit)](https://www.cslb.ca.gov/Consumers/Hire_A_Contractor/Home_Improvement_Contracts/What_Is_A_Contract.aspx), see the document, read 2026-11-08
- [Md. Code, Business Regulation 8-617 (home improvement deposits)](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gbr&section=8-617&enactments=false), see the document, read 2026-11-08
- [10 M.R.S. 1487, Home construction contracts](https://legislature.maine.gov/statutes/10/title10sec1487.html), see the document, read 2026-11-08
- [Fla. Stat. 489.126, Moneys received by contractors](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0489/Sections/0489.126.html), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the deposit and milestone payment schedule compute?

Give the total fee, the start date, the split and the length of the project and the tool works out each stage's amount to the cent, its invoice date and its due date (moved off weekends and holidays), the invoice-ready lines for every stage with the last one netting off what was paid, a calendar file and a CSV.

**In detail: operations, inputs and outputs**

For home improvement work it checks the deposit against the state's limit where it was read (CA, MD, ME, FL).

Operations (the op field):

- `schedule`: Returns the stages with amounts, invoice and due dates, the check that they add up, the warnings, the contract wording and, with a state, the deposit rule.
- `pack`: Does what schedule does and also returns every invoice (the last netting the earlier ones), the .ics calendar file and the CSV, paid once per project with free edits.
- `final`: Returns the final invoice: the total less each payment received, with tax on the whole; an overpayment is refused.
- `rules`: Returns the state deposit rules held, each quoted from its official page with the read date. Free.

Inputs:

- `total, currency`: The fee (up to 100,000,000 in the currency's units) and its currency: USD, CAD, AUD, NZD, GBP, EUR, SGD, ZAR, JPY.
- `start, weeks, split`: The start date, the project length in weeks (up to 260) and a preset split or your own stages (up to 12) by percent, amount or the balance.
- `net, terms, region`: Payment terms (up to 120 days, or business days, weeks or months), how to move a due date off a weekend or holiday, and whose holidays (US, England, or none).
- `state, capDeposit`: A state to check the deposit against, and whether to lower the deposit to its limit.
- `project, client, invoice, tax`: For the pack and final invoice: names, invoice numbers and a tax rate.

Outputs:

- stages: each with share, amount, invoice date, due date, paid before and balance after
- check: the stages add up to the total; warnings; wording for the contract
- pack: invoices, the .ics file and the CSV; final: the balance due

**Every step in full (6) and the rules**

1. Money is read exactly into whole minor units and worked as BigInt, never floats; a share is an exact fraction (50% is a half, a third is 1/3).
2. Each share is rounded half up to the cent; the leftover cents go to the last stage (or the first) and the answer says so.
3. The deposit is invoiced at the start; the other stages are spread over the weeks, or set by offsets in days, weeks, months or business days.
4. Each due date is the invoice date plus the terms, moved to the next (or previous) business day when it falls on a weekend or a holiday of the chosen region; holidays come from the business days engine and are named.
5. Tax is rounded on each invoice; the last takes the cent so the taxes equal tax on the total.
6. With a state, the deposit is checked against the rule quoted from its official page; with capDeposit it is lowered to the limit and the balance moves to the next stage.

**State deposit rules.**

California (CSLB: $1,000 or 10%, whichever is less), Maryland and Maine (one-third) and Florida (a rule over 10%) are quoted word for word from each state's official page, read on 2026-11-08. Other states are shown as not covered.

## Which edge cases does it handle?

**The edge cases (4)**

- Custom stages that do not add up to the total are refused.
- A due date on a holiday names the holiday it moved for.
- Currencies without cents, such as JPY, are rounded to the whole unit.
- The final invoice refuses payments that add up to more than the total.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A $6,000 website split 50/25/25 over 8 weeks, net 7**

A $6,000 website split 50/25/25 over 8 weeks, net 7

| Result | Value |
| --- | --- |
| Deposit (50%) | $3,000.00, invoiced 2026-12-01, due 2026-12-08 |
| Midpoint milestone (25%) | $1,500.00, invoiced 2026-12-29, due 2027-01-05 |
| Final delivery (25%) | $1,500.00, invoiced 2027-01-26, due 2027-02-02 |

**The input**

```json
{
  "op": "schedule",
  "total": "6000",
  "start": "2026-12-01",
  "split": "50-25-25",
  "weeks": 8,
  "net": 7
}
```

**More worked examples (1)**

**The final invoice after a $2,000 deposit on a $6,000 project**

The final invoice after a $2,000 deposit on a $6,000 project

| Result | Value |
| --- | --- |
| answer | Bill the total of $6,000.00, subtract the $2,000.00 already received, and the balance due is $4,000.00. |

**The input**

```json
{
  "op": "final",
  "total": "6000",
  "project": "Website build",
  "payments": [
    {
      "label": "Deposit",
      "amount": "2000",
      "date": "2026-12-01",
      "invoice": "INV-1001"
    }
  ],
  "issueDate": "2027-01-29",
  "net": 7
}
```

## How is it tested?

**What its test suite asserts (3)**

- Every preset adds up to the total exactly, with the leftover cent on one stage.
- Each state deposit quote is word for word in the dated snapshot of its official page, read on 2026-11-08.
- Due dates move off weekends and named holidays; the final invoice nets every payment received.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Deposit and milestone payment schedule tool](https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/).

## Questions

### Is there any AI in the deposit and milestone payment schedule answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the deposit and milestone payment schedule refuse to answer?

Stages that do not add up, a date out of range or an overpayment are refused with the field. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Deposit and milestone payment schedule tool](https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/payment-schedule/  
Data as of: 2026-11-04
