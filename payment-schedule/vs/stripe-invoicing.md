# Stripe Invoicing and a payment schedule

Stripe Invoicing charges 0.4% per paid invoice on Starter (0.5% on Plus), which on a $6,000 project is $24.00 across its invoices, plus card fees; it collects the payments, while the schedule ($3,000.00, $1,500.00 and $1,500.00) is worked out here.

## Try the same $6,000 schedule here

[Make the schedule](https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/?total=6000&start=2027-01-04&split=50-25-25&weeks=8&net=7)

## What Stripe Invoicing offers, from its own pages

- No fixed fee: Starter 0.4% per paid invoice, Plus 0.5% (adds quotes), Stripe Payments pricing on top. Stripe served its pricing page for India when we read it; the percentages are the ones shown.
- Partial payments: a large invoice can be paid in several smaller payments, from the Dashboard or the API; turn it on in Invoice settings to accept them on the hosted invoice page.
- A hosted invoice page and reminders.

## What this tool does

- Splits the fee to the cent (any split, percentages, amounts or a balance) and shows where the rounding cent went.
- Puts an invoice date and a due date on every payment, moved off weekends and US or England-and-Wales public holidays.
- Writes every invoice's lines, with a final invoice that subtracts the deposit and milestones already billed.
- Gives a calendar file (.ics) and a CSV, and checks the California, Maryland, Maine and Florida home-improvement deposit rules.
- Charges per project: the schedule is free on the page; the invoice pack is $0.49 per project, with edits free for 90 days.
- Does not send invoices or collect payments: you send them from your own invoicing app or email.

## The same project, worked out here

$6,000 website at 50/25/25 from January 4, 2027, net 7

| Stage | Share | Amount | Invoice date | Terms | Due date | Balance after |
| --- | --- | ---: | --- | --- | --- | ---: |
| 1. Deposit | 50% | $3,000.00 | January 4, 2027 | Net 7 | January 11, 2027 | $3,000.00 |
| 2. Midpoint milestone | 25% | $1,500.00 | February 1, 2027 | Net 7 | February 8, 2027 | $1,500.00 |
| 3. Final delivery | 25% | $1,500.00 | March 1, 2027 | Net 7 | March 8, 2027 | $0.00 |

## When it is the better choice

- You want the client to pay by card or bank on a hosted page with receipts: use Stripe (or your invoicing app) to collect, and this tool to plan the amounts and dates.
- You want a single invoice the client pays off in parts, rather than separate invoices per milestone.

## Sources

- [Stripe Invoicing pricing (read November 8, 2026)](https://stripe.com/invoicing/pricing)
- [Stripe Docs: Accept partial payments (read November 8, 2026)](https://docs.stripe.com/invoicing/partial-payments)

> Facts about other products are from their own pages on the date shown; check them before you decide. Not affiliated with any product named here.

## Related

- [Final invoice after a deposit](https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/guides/final-invoice-after-deposit/)
- [50/25/25 payment schedule](https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/50-25-25/)
- [Compare: Everhour deposit template](https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/vs/everhour/)
- [Compare: accounting apps](https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/vs/accounting-apps/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payment-schedule/vs/stripe-invoicing/  
Data as of: 2026-11-08
