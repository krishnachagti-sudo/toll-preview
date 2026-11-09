# How the real estate commission split works: net and cap

Your side is the price times your rate (or the commission given); the referral fee comes off first, then the royalty and the team's share in the order your plan says, then the brokerage split until the cap is reached (the crossing deal split at both rates), then the per-deal fees. Each step is rounded once, half up, to the cent; on a 70/30 split, 30% of each deal goes to the brokerage until the cap.

## How does it work?

1. Money is whole cents and percentages thousandths of a percent, so any rate with up to three decimals is exact; each product is worked in BigInt and rounded once, half up.
2. Your side is price times rate, or the commission given. A referral fee is taken off your side first.
3. A royalty is a percent of the commission after the referral fee, off the top or from your share, up to its cap.
4. A team share is taken before the brokerage split (team-first) or of your share after it (brokerage-first), up to its cap.
5. The brokerage share is its split of what is left until the cap is reached; the deal that crosses the cap pays the brokerage only up to the cap and the rest at your post-cap share.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/real-estate-commission-split/#what) below.

## What does it not cover?

- A plan or deal with a missing or impossible field is refused with the field named.
- Every split, cap and fee is what you enter; published plans are only presets, each dated.
- Not tax or legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 8 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The IRS thresholds, dates and quotes were read on irs.gov on 2026-11-08, and the published brokerage plans on each brokerage's own site with their dates. The pages are checked daily for changes.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check the IRS thresholds and quotes, exact cents and percentages rounded once, the crossing deal at both rates and exactly at the cap, cap periods from the anniversary and February 29, every deal step, a year across two cap years with 1099 totals, the forecast, compare and goal.

- [IRS Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), see the document, read 2026-11-08
- [IRS Publication 15-A](https://www.irs.gov/publications/p15a), see the document, read 2026-11-08
- [IRS Form 1040-ES (2026)](https://www.irs.gov/pub/irs-pdf/f1040es.pdf), see the document, read 2026-11-08
- [12 CFR 1024.14 (RESPA section 8)](https://www.law.cornell.edu/cfr/text/12/1024.14), see the document, read 2026-11-08
- [Real Brokerage agent plan](https://www.joinreal.com/), see the document, read 2026-11-08
- [NAR settlement practice changes](https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers), see the document, read 2026-11-08
- [NAR consumer guide to written buyer agreements](https://www.nar.realtor/the-facts/consumer-guide-to-written-buyer-agreements), see the document, read 2026-11-08
- [Paperless Pipeline pricing](https://www.paperlesspipeline.com/pricing), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the real estate commission split and cap tracker compute?

Enter your plan (split, cap and anniversary, royalty, team share and fees) and a deal, and the tool works out what you net, step by step, and how much is left to your cap. A year of deals (up to 500) is worked out in date order across anniversary caps, with the 1099 total per calendar year and a CSV.

**In detail: operations, inputs and outputs**

It can also compare up to 4 plans at a deal count and find the deals needed for a net goal. Every split, cap and fee is the plan you enter.

Operations (the op field):

- `deal`: Returns one deal: gross, referral fee, royalty, team share, brokerage split, fees, net, cap left and whether it crossed the cap, with the steps.
- `year`: Returns every deal in date order across cap years, the cap periods, the forecast of deals left to cap, the 1099 total per calendar year and a CSV.
- `compare`: Returns what each plan nets at a number of deals of an average commission, and the break-even between them.
- `goal`: Returns how many deals of an average commission reach a net goal under a plan.
- `plans`: Returns the published brokerage plans held as presets, each with the date it was read. Free.

Inputs:

- `plan`: Your split before the cap, the cap and its anniversary, your share after the cap, a royalty with its cap and whether it comes off the top or from your share, a team share and whether it comes before or after the brokerage split, per-deal fees (always, pre-cap or post-cap), and a monthly fee.
- `deal`: The price and rate, or your side's commission, the closing date, and a referral fee you pay out.
- `paidSoFar`: What you have paid toward the cap so far this cap year.
- `deals, averageCommission, goal`: For year, compare and goal: the deals, or a count and an average, and a net goal.

Outputs:

- answer: what you net and how much is left to your cap
- gross, referral, royalty, team, brokerage, fees, net and the steps
- year: periods, forecast, years with the 1099 total, CSV

**Every step in full (7) and the rules**

1. Money is whole cents and percentages thousandths of a percent, so any rate with up to three decimals is exact; each product is worked in BigInt and rounded once, half up.
2. Your side is price times rate, or the commission given. A referral fee is taken off your side first.
3. A royalty is a percent of the commission after the referral fee, off the top or from your share, up to its cap.
4. A team share is taken before the brokerage split (team-first) or of your share after it (brokerage-first), up to its cap.
5. The brokerage share is its split of what is left until the cap is reached; the deal that crosses the cap pays the brokerage only up to the cap and the rest at your post-cap share.
6. Per-deal fees are taken always, only before the cap, or only after it, and may count toward the cap.
7. For a year, deals run in date order; the cap resets on the anniversary (February 29 is handled), and the 1099 total per calendar year is what was paid to you.

**IRS rules quoted.**

The 1099-NEC threshold and due date, licensed agents as statutory nonemployees, and the estimated tax dates are read on irs.gov on 2026-11-08.

## Which edge cases does it handle?

**The edge cases (3)**

- A deal that lands exactly on the cap pays the brokerage to the cap and nothing more.
- A cap anniversary on February 29 falls on February 28 in other years.
- A pending deal is forecast, not counted as closed.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A $400,000 sale at 3% on a 70/30 split with a $20,000 cap and a $300 fee**

A $400,000 sale at 3% on a 70/30 split with a $20,000 cap and a $300 fee

| Result | Value |
| --- | --- |
| answer | On a $400,000 sale at 3%, your side is $12,000.00; after the $3,600.00 brokerage split and $300.00 in fees, you net $8,100.00. $16,400.00 is left to your $20,000 cap. |

**The input**

```json
{
  "op": "deal",
  "plan": {
    "split": "70",
    "cap": "20000",
    "capStart": "03-15",
    "fees": [
      {
        "name": "Transaction fee",
        "amount": "300"
      }
    ]
  },
  "deal": {
    "price": "400000",
    "rate": "3"
  }
}
```

**More worked examples (2)**

**The deal that crosses the cap**

The deal that crosses the cap

| Result | Value |
| --- | --- |
| answer | Your side is $10,000.00; after the $2,000.00 brokerage split and $300.00 in fees, you net $7,700.00. This deal crosses your $20,000 cap. |

**The input**

```json
{
  "op": "deal",
  "plan": {
    "split": "70",
    "cap": "20000",
    "capStart": "03-15",
    "fees": [
      {
        "name": "Transaction fee",
        "amount": "300"
      }
    ]
  },
  "deal": {
    "commission": "10000"
  },
  "paidSoFar": {
    "cap": "18000"
  }
}
```

**Two plans at 12 deals a year of $9,000**

Two plans at 12 deals a year of $9,000

| Result | Value |
| --- | --- |
| answer | At 12 deals a year of $9,000.00 each, 85/15 with a $12,000 cap nets the most: $96,000.00 (70/30 with a $20,000 cap $88,000.00). |

**The input**

```json
{
  "op": "compare",
  "deals": 12,
  "averageCommission": "9000",
  "plans": [
    {
      "label": "70/30 with a $20,000 cap",
      "split": "70",
      "cap": "20000"
    },
    {
      "label": "85/15 with a $12,000 cap",
      "split": "85",
      "cap": "12000"
    }
  ]
}
```

## How is it tested?

**What its test suite asserts (3)**

- IRS thresholds, dates and quotes are as read on irs.gov on 2026-11-08.
- The crossing deal is split at both rates and a deal exactly at the cap stops there.
- A year across two cap years gives the 1099 total per calendar year.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Real estate commission split and cap tracker tool](https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/).

## Questions

### Is there any AI in the real estate commission split and cap tracker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the real estate commission split and cap tracker refuse to answer?

A plan or deal with a missing or impossible field is refused with the field named. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Real estate commission split and cap tracker tool](https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/real-estate-commission-split/  
Data as of: 2026-11-04
