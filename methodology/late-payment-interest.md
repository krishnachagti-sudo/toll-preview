# How late payment interest is calculated: each law

Under the UK Act, interest is 8% over the Bank Rate on the reference date (December 31 or June 30) before the day interest starts, fixed for the debt, simple, on a 365-day year, plus £40 for a debt up to £999.99, £70 for £1,000 to £9,999.99 and £100 for £10,000 or more, once for each payment. Ireland, Germany and the EU minimum use their reference rate for each half-year of the delay; US federal agencies compound every 30 days on a 360-day year.

## How does it work?

1. The due date is the one given, or the invoice date plus the terms days (30 by default).
2. UK: the reference date is December 31 for interest that starts January 1 to June 30, and June 30 for July 1 to December 31.
3. UK compensation: £40 for a debt up to £999.99, £70 for £1,000 to £9,999.99 and £100 for £10,000 or more, once for each payment.
4. Ireland and the EU minimum: the ECB main refinancing rate on January 1 or July 1 plus 8 points. Germany: the Basiszinssatz plus 9 points.
5. US federal: the Prompt Payment rate in effect the day after the due date, on a 360-day year, compounded every 30 days, for at most 365 days: amount x (1 + r/12)^months x (1 + r/360 x the days left) - amount.

> Steps 6 to 9, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/late-payment-interest/#what) below.

## What does it not cover?

- Business-to-business debts only: a consumer debt or a disputed invoice is refused for the statutory laws.
- It does not work out the reasonable recovery costs the UK Act also allows beyond the fixed sum, or court interest after a judgment.
- US public-body rules apply only to payments by those bodies; it does not apply a state usury or late-fee limit to your own terms.
- It is computed from the official rules and rates quoted, read on the date shown. It is not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 21 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The rules and rate tables were read on November 8, 2026: the Bank of England Bank Rate history (latest decision November 5, 2026, next December 17, 2026), the ECB key rates, the Bundesbank Basiszinssatz, the Treasury's Prompt Payment rates and the Texas Comptroller's rate, with GOV.UK, the Irish Statute Book, EUR-Lex, the eCFR and the Texas and Florida statutes for the rules. They change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check the rate tables against the official figures as read, the Bundesbank rate against § 247 BGB, the UK reference date and fixed rate, GOV.UK's worked example (0.5% base rate, £1,000, 50 days), the £40, £70 and £100 bands with VAT included, the 6-year limit, every UK half-year from 2003, the half-year split for Ireland, Germany and the EU, the Treasury formula with its one-year limit, the Texas and Florida formulas, your own terms, batches from a CSV and the claim letter.

- [GOV.UK: Late commercial payments, interest on late commercial payments](https://www.gov.uk/late-commercial-payments-interest-debt-recovery/charging-interest-commercial-debt), see the document, read 2026-11-08
- [GOV.UK: Claim debt recovery costs on late payments](https://www.gov.uk/late-commercial-payments-interest-debt-recovery/claim-debt-recovery-costs), see the document, read 2026-11-08
- [GOV.UK: When a payment becomes late](https://www.gov.uk/late-commercial-payments-interest-debt-recovery), see the document, read 2026-11-08
- [GOV.UK (BIS, October 2014): A users' guide to the recast Late Payment Directive](https://assets.publishing.service.gov.uk/media/5a7d8d41ed915d3fb9594718/bis-14-1116-a-users-guide-to-the-recast-late-payment-directive.pdf), see the document, read 2026-11-08
- [Office of the Small Business Commissioner: Interest Calculator Guidance](https://www.smallbusinesscommissioner.gov.uk/interest-calculator-guidance-page/), see the document, read 2026-11-08
- [Bank of England: Official Bank Rate history](https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp), see the document, read 2026-11-08
- [Irish Statute Book: S.I. No. 580/2012](https://www.irishstatutebook.ie/eli/2012/si/580/made/en/print), see the document, read 2026-11-08
- [European Central Bank: Key ECB interest rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html), see the document, read 2026-11-08
- [gesetze-im-internet.de: § 288 BGB Verzugszinsen und sonstiger Verzugsschaden](https://www.gesetze-im-internet.de/bgb/__288.html), see the document, read 2026-11-08
- [gesetze-im-internet.de: § 247 BGB Basiszinssatz](https://www.gesetze-im-internet.de/bgb/__247.html), see the document, read 2026-11-08
- [Deutsche Bundesbank: Basiszinssatz nach § 247 BGB](https://www.bundesbank.de/de/bundesbank/organisation/agb-und-regelungen/basiszinssatz-607820), see the document, read 2026-11-08
- [EUR-Lex: Directive 2011/7/EU of 16 February 2011](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011L0007), see the document, read 2026-11-08
- [Bureau of the Fiscal Service: Prompt Payment interest rates](https://fiscal.treasury.gov/payments-from-government/prompt-payment/rates), see the document, read 2026-11-08
- [Bureau of the Fiscal Service: Monthly compounding interest calculator](https://fiscal.treasury.gov/payments-from-government/prompt-payment/monthly-interest), see the document, read 2026-11-08
- [eCFR: 5 CFR 1315.10 Late payment interest penalties](https://www.ecfr.gov/current/title-5/chapter-III/subchapter-B/part-1315/section-1315.10), see the document, read 2026-11-08
- [Texas Constitution and Statutes: Government Code chapter 2251](https://tcss.legis.texas.gov/resources/GV/htm/GV.2251.htm), see the document, read 2026-11-08
- [Texas Comptroller, eXpendit: Interest Rate](https://fmx.cpa.texas.gov/fm/pubs/purchase/prompt_pay/?section=overview&page=rate), see the document, read 2026-11-08
- [Texas Comptroller, eXpendit: How to Calculate Interest](https://fmx.cpa.texas.gov/fm/pubs/purchase/prompt_pay/index.php?section=overview&page=calculate), see the document, read 2026-11-08
- [Florida Statutes 2026: section 218.74](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0218/Sections/0218.74.html), see the document, read 2026-11-08
- [Florida Statutes 2026: section 218.735](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0218/Sections/0218.735.html), see the document, read 2026-11-08
- [Bank of England: Interest rates and Bank Rate, our latest decision](https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the late payment interest calculator and claim letter compute?

Given an invoice total, its due date (or the invoice date and terms) and the day it was paid or the day to work out to, the tool applies the law you choose and returns the interest, the fixed compensation, the total claim, the daily amount and each period with its rate and reference date. It covers the UK Late Payment Act, Ireland (S.I. 580/2012), Germany (§ 288 BGB), the EU directive minimum, the US federal Prompt Payment Act, Texas and Florida public bodies, or a rate from your own terms. It also writes a claim letter and interest invoice PDF, and works out many invoices at once from a CSV.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `calculate`: Returns the interest, compensation and total for one invoice, with the due date and where it came from, the days late, each period with its rate, base rate and reference date, the daily amount, any notes and the sources. Free on the page; $0.02 over the API.
- `rates`: Returns one law's rate table (every UK half-year from 2003, the ECB and Basiszinssatz half-years, the federal and Texas periods), or every table with the rules. Free.
- `notice`: Does what calculate does to the letter date and returns the claim letter and interest invoice: its title, claim number, paragraphs and method, with the PDF. preview: true gives a free watermarked copy.
- `batch`: Works out each invoice of a list or CSV (at most 500) alone under one law, then totals them, and returns the rows, the totals and a claims CSV.

Inputs:

- `jurisdiction`: uk, ie, de, eu, us-federal, us-tx, us-fl, terms.
- `amount`: The invoice total, including VAT or sales tax, as a number or text such as "1,500.00".
- `dueDate, or invoiceDate and termsDays`: The last day of the payment terms; or the day the customer received the invoice and the days of terms (default 30, the statutory period).
- `paidDate, asOf`: The day it was paid; or, when unpaid, the day to work interest out to (the letter date for notice).
- `disputed, debtorIsConsumer, contractRate`: A disputed invoice, a consumer debt, or a contract with its own late-payment rate are refused for the statutory laws, with the reason.
- `rate, per, method, graceDays, flatFee, currency`: For terms only: your rate in percent, per month (default) or per year, simple (default) or compounded every 30 days, grace days, a flat late fee, and USD, GBP or EUR.
- `invoiceNumber, creditor, debtor, payBy, payTo, preview`: For notice: the invoice number, both parties' names and addresses, the date to pay by, how to pay, and whether it is a free preview.
- `invoices or csv`: For batch: a list of invoices, or a CSV of at most 60,000 characters whose header names the columns (invoice, amount, dueDate, invoiceDate, termsDays, paidDate).

Outputs:

- answer: what may be claimed, in the invoice's own figures and currency
- interest, compensation, flatFee, total and owed, in minor units and as display text
- periods: each with its from and to dates, days, rate, base rate and reference date
- dueDate, dueFrom, daysLate, days, daily, capped and notes
- title, claimNumber, paras, method and the PDF (notice); rows, totals and the CSV (batch)
- sources with their read dates, and disclaimers

**Every step in full (9) and the rules**

1. The due date is the one given, or the invoice date plus the terms days (30 by default). Interest starts the day after the due date and runs to the day paid, or to the as-of date when unpaid. Paid on or before the due date is not late.
2. UK: the reference date is December 31 for interest that starts January 1 to June 30, and June 30 for July 1 to December 31. The rate is 8% plus the Bank Rate in force on that date, fixed for the whole debt. Interest is amount x rate x days / 365, simple, for at most 6 years.
3. UK compensation: £40 for a debt up to £999.99, £70 for £1,000 to £9,999.99 and £100 for £10,000 or more, once for each payment. Ireland: €40 for a debt not exceeding €1,000, €70 above €1,000 up to €10,000 and €100 above €10,000. Germany: a €40 lump sum (Pauschale) per claim. EU minimum: a fixed sum of at least €40.
4. Ireland and the EU minimum: the ECB main refinancing rate on January 1 or July 1 plus 8 points. Germany: the Basiszinssatz plus 9 points. The delay is split at each half-year, and each part is worked out at its own half-year's rate, simple, on a 365-day year.
5. US federal: the Prompt Payment rate in effect the day after the due date, on a 360-day year, compounded every 30 days, for at most 365 days: amount x (1 + r/12)^months x (1 + r/360 x the days left) - amount.
6. Texas: the rate of the fiscal year (September 1 to August 31) in which the payment became overdue, x days / 365, simple. Florida: 1% a month from 30 days after the due date, compounded monthly, a part month counted as a whole month.
7. Your own terms: a monthly rate is prorated by day on a 30-day month, a yearly rate by day on a 365-day year, or the balance is compounded every 30 days; grace days and a flat fee are applied as your terms state.
8. Money is whole pence or cents and rates are thousandths of a percent; simple interest is computed exactly and rounded half up once.
9. A batch works out each invoice alone with the same law and date, then adds them up. The claims CSV is formula-safe, so no cell can run when it is opened.

**UK.**

GOV.UK: "The Bank of England base rate on 31 December will be the "reference rate" for 1 January to 30 June. The Bank of England base rate on 30 June will be the "reference rate" for 1 July to 31 December." The Bank Rate is 4.00% since November 5, 2026; a half-year whose reference date is after the rates were read is refused until it is known.

Small Business Commissioner: "You cannot charge interest and compensation on an invoice which has been paid late due to a dispute."

**Ireland, Germany and the EU.**

European Communities (Late Payment in Commercial Transactions) Regulations 2012 (S.I. No. 580 of 2012); § 288 BGB (Verzugszinsen), with the Basiszinssatz of § 247 BGB; Directive 2011/7/EU on combating late payment in commercial transactions. The ECB rates and the Basiszinssatz are copied by hand from the European Central Bank and the Deutsche Bundesbank.

**US public bodies.**

Prompt Payment Act (31 U.S.C. 3901-3907), 5 CFR 1315.10; Texas Prompt Payment Act, Government Code chapter 2251; Florida Local Government Prompt Payment Act, section 218.74 Florida Statutes. Between businesses in the US, only the rate in your agreed terms applies, within your state's limits.

## Which edge cases does it handle?

**The edge cases (6)**

- A UK debt is charged interest for at most 6 years from the day after the terms end, and the answer says where it stopped.
- A delay that crosses June 30 or December 31 is worked out in two parts at two rates under Irish, German and EU law; under the UK Act the rate stays fixed.
- A federal interest penalty under $1 is noted as one that need not be paid, and interest stops after one year.
- A Texas delay that runs into a later fiscal year uses only the first fiscal year's rate, as the Comptroller says.
- A Florida payment late by less than 30 days is late but owes no interest yet, and the answer gives the day interest starts.
- An invoice inside your terms' grace period shows no charge and says when the grace period ends.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**UK: £4,800 due August 31, 2026, paid November 2**

UK: £4,800 due August 31, 2026, paid November 2

| Result | Value |
| --- | --- |
| answer | On a £4,800.00 invoice due August 31, 2026 and paid November 2, 2026 (63 days late), you can claim £97.35 statutory interest at 11.75% (8% plus the 3.75% Bank Rate on June 30, 2026) and £70 fixed compensation: £167.35 in all. |
| rate | 11.75% |
| reference date | 2026-06-30 |
| interest | £97.35 |
| compensation | £70 |
| total | £167.35 |

**The input**

```json
{
  "op": "calculate",
  "jurisdiction": "uk",
  "amount": 4800,
  "dueDate": "2026-08-31",
  "paidDate": "2026-11-02"
}
```

**More worked examples (3)**

**Ireland: €5,000 due May 15, 2026, paid September 30, across two half-years**

Ireland: €5,000 due May 15, 2026, paid September 30, across two half-years

| Result | Value |
| --- | --- |
| answer | On a €5,000.00 invoice due May 15, 2026 and paid September 30, 2026 (138 days late), you can claim €195.03 statutory interest at 10.15%, then 10.4% by half-year and €70 fixed compensation: €265.03 in all. |
| 2026-05-16 to 2026-06-30 | 46 days at 10.15% |
| 2026-07-01 to 2026-09-30 | 92 days at 10.4% |

**The input**

```json
{
  "op": "calculate",
  "jurisdiction": "ie",
  "amount": 5000,
  "dueDate": "2026-05-15",
  "paidDate": "2026-09-30"
}
```

**A federal agency pays a $1,500 invoice 76 days late**

A federal agency pays a $1,500 invoice 76 days late

| Result | Value |
| --- | --- |
| answer | A federal agency paying a $1,500.00 invoice due July 1, 2026 on September 15, 2026 (76 days of interest) owes $15.09 Prompt Payment interest at 4.75%, compounded every 30 days. |
| months compounded | 2 |
| days left over | 16 |
| interest | $15.09 |

**The input**

```json
{
  "op": "calculate",
  "jurisdiction": "us-federal",
  "amount": 1500,
  "dueDate": "2026-07-01",
  "paidDate": "2026-09-15"
}
```

**Three overdue invoices from one customer, as a CSV**

Three overdue invoices from one customer, as a CSV

| Result | Value |
| --- | --- |
| INV-1001 | due 2026-07-31, 100 days: £65.75 |
| INV-1007 | due 2026-09-14, 55 days: £158.53 |
| INV-1013 | due 2026-09-15, 54 days: £308.60 |
| total claim | £532.88 |

**The input**

```json
{
  "op": "batch",
  "jurisdiction": "uk",
  "asOf": "2026-11-08",
  "csv": "invoice,amount,invoice date,terms\r\nINV-1001,800,2026-07-01,30\r\nINV-1007,\"5,000.00\",2026-08-15,30\r\nINV-1013,12000,2026-09-01,14\r\n"
}
```

## How is it tested?

**What its test suite asserts (3)**

- The rate tables are pinned to the official figures as read on November 8, 2026, and the Basiszinssatz follows § 247 BGB from the ECB rate.
- GOV.UK's worked example is reproduced, with the reference date, the fixed rate, the compensation bands and the 6-year limit.
- The half-year split, the federal 30-day compounding with its one-year limit, the Texas and Florida formulas, your own terms and CSV batches are each checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Late payment interest calculator and claim letter tool](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/).

## Questions

### Is there any AI in the late payment interest calculator and claim letter answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the late payment interest calculator and claim letter refuse to answer?

Business-to-business debts only: a consumer debt or a disputed invoice is refused for the statutory laws. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Late payment interest calculator and claim letter tool](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/late-payment-interest/  
Data as of: 2026-11-04
