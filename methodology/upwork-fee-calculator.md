# How the Upwork fee calculator works out what you keep

The Upwork service fee (0% to 15%, 10% when not given) comes off the amount billed, then the withdrawal fee you enter, then the payout provider's published fees; the rest is converted once at the reference rate less the provider's margin. Every fee was read on the company's own page on November 8, 2026.

## How does it work?

1. Amounts are read to whole cents and percentages to hundredths of a percent; a rate is held as millionths, so the conversion is exact before its one rounding, half up to the hundredth.
2. The platform fee: on Upwork, your contract's percentage of the amount billed, 10% (where Upwork's own calculator starts) when none is given and flagged.
3. The withdrawal fee: for Upwork, the fee you typed, times the number of withdrawals, or nothing and a flag saying it is not included. For Freelancer.com, its published table (Express Withdrawal $1.00, PayPal $1.00, Skrill (Moneybookers) $1.00, Payoneer Debit Card $1.00, International Wire $25.00), with a flag when a withdrawal is under its $50.00 minimum after fees.
4. The provider: PayPal uses its published conversion fee for your market (3% in every market read) and its local bank withdrawal fee where the page gives one (50.00 PHP under 7,000 PHP in the Philippines, 125.00 EGP in Egypt).
5. The rate: the one you type, else the latest ECB euro reference rate crossed through the euro (INR, PHP) or the latest US Treasury reporting rate (the others), from the exchange-rate tool's files, else the dated snapshot.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/upwork-fee-calculator/#what) below.

## What does it not cover?

- It does not include Upwork's withdrawal fee unless you type it, because Upwork's own page could not be read; the same goes for Payoneer's marketplace fee, PayPal's fee to receive and a bank's margin.
- Providers convert at their own base rate; the ECB or US Treasury rate stands in for it, so the bank amount is close, not exact.
- It covers the countries IN, PH, PK, BD, NG, NP, EG, LK, US, and Skydo only for Indian accounts.
- It is an estimate from published fees, not a quote from Upwork or any provider, and not tax or financial advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 14 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every fee was read on the company's own page on November 8, 2026 and is held in the tool's data file with the page's own updated date where it shows one. Reference rates come from the exchange-rate tool's ECB and US Treasury files on the day of the call; the snapshot is the ECB fixing of November 6, 2026 and the Treasury report as of September 30, 2026.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests pin every fee figure to the page it was read on, reproduce Upwork's own $500 at 10% leaves $450 example, check exact reading and one rounding, PayPal's Philippine and Egyptian bank fees, Payoneer's range, Skydo's tiers and GST, Wise and bank margins, Freelancer.com's minimum fee, every refusal, that the rate found keeps the target and one cent less does not, Connects, schedules, statements and the reference-rate fallback.

- [Upwork, Upwork Fee Calculator](https://www.upwork.com/tools/upwork-fee-calculator), see the document, read 2026-11-08
- [Upwork, Connects Calculator](https://www.upwork.com/tools/connects-calculator), see the document, read 2026-11-08
- [Freelancer.com, Fees and Charges](https://www.freelancer.com/feesandcharges), see the document, read 2026-11-08
- [PayPal, Consumer fees (United States)](https://www.paypal.com/us/digital-wallet/paypal-consumer-fees), last updated 2026-05-19, read 2026-11-08
- [PayPal, Consumer fees (India)](https://www.paypal.com/in/digital-wallet/paypal-consumer-fees), last updated 2021-05-31, read 2026-11-08
- [PayPal, Consumer fees (Philippines)](https://www.paypal.com/ph/digital-wallet/paypal-consumer-fees), last updated 2026-10-28, read 2026-11-08
- [PayPal, Consumer fees (Nepal)](https://www.paypal.com/np/digital-wallet/paypal-consumer-fees), last updated 2026-10-28, read 2026-11-08
- [PayPal, Consumer fees (Sri Lanka)](https://www.paypal.com/lk/digital-wallet/paypal-consumer-fees), last updated 2026-10-28, read 2026-11-08
- [PayPal, Consumer fees (Nigeria)](https://www.paypal.com/ng/digital-wallet/paypal-consumer-fees), last updated 2026-10-28, read 2026-11-08
- [Payoneer, Pricing](https://www.payoneer.com/pricing/), last updated 2026-01-01, read 2026-11-08
- [Wise, Fees for receiving and adding money](https://wise.com/us/pricing/receive), see the document, read 2026-11-08
- [Skydo, home page pricing](https://www.skydo.com/), see the document, read 2026-11-08
- [European Central Bank euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), snapshot fixing of 2026-11-06, read 2026-11-08
- [U.S. Treasury Reporting Rates of Exchange](https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange), snapshot as of 2026-09-30, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the upwork fee calculator: what reaches your bank compute?

Given what you billed (or an hourly rate and hours), your contract's service fee and how the money reaches you, the tool works out what lands in your bank, in dollars or your own currency, step by step with the source of each fee.

**In detail: operations, inputs and outputs**

It also works out the rate to bill to keep a target, the cost of Connects per job won, the fixed fees a year by how often you withdraw, and a statement of many payments with a CSV. A fee it could not read on the company's own page is something you type, never a guess.

Operations (the op field):

- `net`: What one payment leaves: the amount billed, the platform fee, the withdrawal fee, any provider fee, the dollars before conversion, and, for a local currency, the amount at the reference rate less the provider's margin (a range for Payoneer), with each step, its source and the share of the gross kept.
- `rate`: The smallest amount to bill, an hour or a payment, that keeps a target after the service fee, a share of a fixed fee and a conversion margin, to the cent, with the same target at 0%, 5%, 10% and 15% on Upwork.
- `connects`: What proposals cost in Connects at Upwork's $0.15 a Connect: per proposal, in total and per job won, and with an average contract value, the share of it Connects and the service fee take.
- `schedule`: The fixed fees a year for withdrawing weekly, every two weeks, twice a month, monthly, from a published fixed fee or your own, what monthly saves over weekly, and the withdrawal size above which the fee is under 1%.
- `statement`: Up to 1,000 payments, each worked out as net does with its own fee if given, with totals and a CSV.
- `fees`: The dated fee tables the tool uses, as read on each company's page on November 8, 2026, and the Upwork pages that could not be read.

Inputs:

- `amount, or hourlyRate and hours`: What was billed to the client, in dollars, like 800 or "1,250.50"; or an hourly rate and the hours (two decimals). Not both.
- `platform, feePercent, projectType`: upwork (default) or freelancer-com; your contract's Upwork service fee, 0 to 15 with at most two decimals (default 10); for Freelancer.com, fixed or hourly.
- `withdrawalFee, withdrawalMethod, withdrawals`: For Upwork, the fee per withdrawal your Get Paid page shows (not assumed when left out); for Freelancer.com, one of express, paypal, skrill, payoneer-card, wire; and how many withdrawals the amount is taken out in, 1 to 60.
- `receive, country, currency`: How the money arrives: usd, paypal, payoneer, wise, skydo, bank; the country of the account, IN (INR), PH (PHP), PK (PKR), BD (BDT), NG (NGN), NP (NPR), EG (EGP), LK (LKR), US (USD); and the bank account's currency when it is not the country's own.
- `rate, marginPercent, providerFee, wire`: Local currency per US dollar (left out: the latest reference rate); a conversion margin for Wise, a bank or an exact Payoneer fee; a provider's fee to receive each withdrawal; and, for Wise, whether it arrives as a USD wire.
- `target, per, fixedFee, hoursPerPayment`: For rate: what you want to keep, per hour (default) or per payment, a fixed fee per payment to cover, and the hours each payment covers.
- `connectsPerProposal, proposals, wins, contractValue`: For connects: the Connects each proposal costs, proposals sent, jobs won and the average won contract.
- `method, feePerWithdrawal, monthlyAmount, payments`: For schedule, a published fixed fee or your own, and what you withdraw a month; for statement, the list of payments, each with an amount and optionally a date, its fee and a note.

Outputs:

- answer: the result in one sentence
- net: gross, feePercent, platformFee, afterPlatformFee, withdrawalFee, usdBeforeConversion, net or local (currency, rate, the rate's source, margin, amount or low and high), netPercent, steps, flags and sources
- rate: gross, keeps, the formula and byFee; connects: cost, perProposal, perWin, winRate and, with a contract value, connectsShare and effectivePercent
- schedule: the cost per year for each schedule, weeklyVsMonthly and breakEven; statement: rows, totals and csv; fees: the dated tables

**Every step in full (7) and the rules**

1. Amounts are read to whole cents and percentages to hundredths of a percent; a rate is held as millionths, so the conversion is exact before its one rounding, half up to the hundredth.
2. The platform fee: on Upwork, your contract's percentage of the amount billed, 10% (where Upwork's own calculator starts) when none is given and flagged. On Freelancer.com, 10% or $5.00, whichever is greater, on a fixed-price project, and 10% on an hourly one.
3. The withdrawal fee: for Upwork, the fee you typed, times the number of withdrawals, or nothing and a flag saying it is not included. For Freelancer.com, its published table (Express Withdrawal $1.00, PayPal $1.00, Skrill (Moneybookers) $1.00, Payoneer Debit Card $1.00, International Wire $25.00), with a flag when a withdrawal is under its $50.00 minimum after fees.
4. The provider: PayPal uses its published conversion fee for your market (3% in every market read) and its local bank withdrawal fee where the page gives one (50.00 PHP under 7,000 PHP in the Philippines, 125.00 EGP in Egypt). Payoneer shows its published 1.2% to 4% range unless you give its exact fee. Wise takes 6.11 USD for a USD wire and the conversion fee you type. Skydo takes $19.00 up to $2,000, $29.00 up to $10,000, 0.3% above, plus 18% GST on the fee, per payment.
5. The rate: the one you type, else the latest ECB euro reference rate crossed through the euro (INR, PHP) or the latest US Treasury reporting rate (the others), from the exchange-rate tool's files, else the dated snapshot. The rate and its date are named in the answer.
6. The dollars left are converted once at the rate less the provider's margin and rounded half up; a local bank fee comes off after. The share kept is the result over the gross converted at the same rate.
7. For rate, the bill is the smallest amount, to the cent, whose net after the fee, the fixed share and the margin is at least the target: an estimate, then stepped a cent at a time, so one cent less does not keep the target.

**Upwork.**

The 0% to 15% service fee and Upwork's own example ("If you work on a contract with a 10% fee and bill your client $500, you'll get a $450 payout.") come from Upwork's fee calculator page, and $0.15 a Connect from its Connects calculator, read on November 8, 2026. Upwork's withdrawal fees by method and its client fees could not be read on Upwork's own pages, so they are never assumed: you type the fee your Get Paid page shows.

**Freelancer.com, PayPal, Payoneer, Wise and Skydo.**

Each fee is read on the company's own fee page, with the date the page shows where it gives one. PayPal is not offered for Pakistan or Bangladesh, which its fee pages read do not cover. Payoneer's fee to receive from a marketplace is "Varies by marketplace" on its page, so it is not included unless you type it.

**Reference rates.**

The ECB euro reference rates and the US Treasury Reporting Rates of Exchange stand in for the provider's own base rate, so the amount in your currency is close, not exact. The snapshot used when no newer file is available is the ECB fixing of November 6, 2026 and the Treasury report as of September 30, 2026.

## Which edge cases does it handle?

**The edge cases (5)**

- A Philippine PayPal withdrawal of exactly 7,000 PHP is charged nothing, since PayPal's table names amounts above and below it only, and the answer says so.
- Splitting a payment into several withdrawals takes each fixed fee once per withdrawal, and PayPal's Philippine fee is tested per withdrawal.
- A US account receiving through PayPal keeps dollars: there is no conversion.
- Fees larger than the amount are refused: nothing would be left to withdraw.
- A statement row whose note starts like a spreadsheet formula is written as plain text in the CSV.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**$800 at a 10% fee, withdrawn to PayPal in India at PayPal's 3% (rate given)**

$800 at a 10% fee, withdrawn to PayPal in India at PayPal's 3% (rate given)

| Result | Value |
| --- | --- |
| answer | $800.00 billed at a 10% Upwork fee leaves $720.00; converted through PayPal at its published 3% conversion fee, about 65,595.49 INR reaches the bank at 93.922526 INR per dollar (87.29% of the gross at that rate). |
| platform fee | $80.00 |
| before conversion | $720.00 |
| reaches the bank | 65,595.49 INR |
| share of the gross | 87.29% |

**The input**

```json
{
  "op": "net",
  "amount": "800",
  "feePercent": 10,
  "receive": "paypal",
  "country": "IN",
  "rate": "93.922526"
}
```

**More worked examples (4)**

**$1,000 at a 15% fee through Payoneer to a bank in Pakistan**

$1,000 at a 15% fee through Payoneer to a bank in Pakistan

| Result | Value |
| --- | --- |
| answer | $1,000.00 billed at a 15% Upwork fee leaves $850.00; withdrawn through Payoneer to a PKR bank account at Payoneer's published 1.2% to 4%, about 225,950.40 PKR to 232,540.62 PKR arrives at 276.9 PKR per dollar (81.6% to 83.98% of the gross at that rate). |
| range | 225,950.40 PKR to 232,540.62 PKR |

**The input**

```json
{
  "op": "net",
  "amount": "1000",
  "feePercent": 15,
  "receive": "payoneer",
  "country": "PK",
  "rate": "276.9"
}
```

**What to bill an hour on Upwork to keep $50 at a 10% fee**

What to bill an hour on Upwork to keep $50 at a 10% fee

| Result | Value |
| --- | --- |
| answer | To keep $50.00 an hour after a 10% Upwork service fee, bill $55.56 an hour. |
| bill at a 0% fee | $50.00 |
| bill at a 5% fee | $52.63 |
| bill at a 10% fee | $55.56 |
| bill at a 15% fee | $58.82 |

**The input**

```json
{
  "op": "rate",
  "target": "50",
  "feePercent": 10
}
```

**Connects: 40 proposals at 8 Connects, 3 wins on $600 contracts**

Connects: 40 proposals at 8 Connects, 3 wins on $600 contracts

| Result | Value |
| --- | --- |
| answer | 40 proposals at 8 Connects each use 320 Connects, $48.00 at $0.15 a Connect ($1.20 a proposal); with 3 jobs won that is $16.00 per win, 2.66% of the $600.00 average contract, and 12.66% with the 10% service fee. |
| net after the fee and Connects | $1,572.00 |

**The input**

```json
{
  "op": "connects",
  "connectsPerProposal": 8,
  "proposals": 40,
  "wins": 3,
  "contractValue": "600",
  "feePercent": 10
}
```

**Freelancer.com: a $300 fixed-price project withdrawn by Express Withdrawal**

Freelancer.com: a $300 fixed-price project withdrawn by Express Withdrawal

| Result | Value |
| --- | --- |
| answer | $300.00 billed on Freelancer.com at a 10% fee leaves $270.00, and $269.00 after the $1.00 withdrawal fee: 89.66% of what was billed. |
| project fee | $30.00 |
| withdrawal fee | $1.00 |
| net | $269.00 |

**The input**

```json
{
  "op": "net",
  "platform": "freelancer-com",
  "amount": "300",
  "projectType": "fixed",
  "withdrawalMethod": "express"
}
```

## How is it tested?

**What its test suite asserts (3)**

- Every fee figure is pinned to what the company's page said on November 8, 2026, and Upwork's own example ($500 at a 10% fee leaves $450) is reproduced.
- PayPal's Philippine and Egyptian bank fees, Payoneer's published range, Skydo's tiers with GST, Wise's wire fee and Freelancer.com's minimum fee give the tested amounts.
- The rate to bill keeps the target and one cent less does not; requests the data does not cover are refused, not guessed.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Upwork fee calculator: what reaches your bank tool](https://krishnachagti-sudo.github.io/toll-preview/upwork-fee-calculator/).

## Questions

### Is there any AI in the upwork fee calculator: what reaches your bank answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the upwork fee calculator: what reaches your bank refuse to answer?

It does not include Upwork's withdrawal fee unless you type it, because Upwork's own page could not be read; the same goes for Payoneer's marketplace fee, PayPal's fee to receive and a bank's margin. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Upwork fee calculator: what reaches your bank tool](https://krishnachagti-sudo.github.io/toll-preview/upwork-fee-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/upwork-fee-calculator/  
Data as of: 2026-11-04
