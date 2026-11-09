# How the chargeback evidence packet is built: rules

A reason code is looked up in Stripe's published table to one of 9 dispute categories, and the category gives the evidence that answers it, strongest first, for a physical product, a digital product or an offline service. Fighting pays when your chance of winning is above the extra cost of fighting divided by what a win gives back.

## What does the chargeback evidence packet builder compute?

For a dispute on Stripe, Shopify Payments or PayPal, the tool says what the reason code means, which evidence answers it and which upload slot each piece goes in. It builds the packet: a rebuttal letter from the facts you give (nothing is assumed) and one labelled exhibit PDF per evidence type from your screenshots and typed text, checked against the platform's size, page and file limits. It also works out the fees and the break-even win chance, the days left to the due date with a calendar file, and whether a Visa 10.4 dispute meets Compelling Evidence 3.0. The card issuer decides every dispute.

Operations (the op field):

- `codes`: Returns every code Stripe publishes for one network (Visa, Mastercard, American Express, Discover) or PayPal, each with its Stripe category, and the source with its read date. Free.
- `rules`: Returns the whole rules data: codes, categories, evidence items, platform limits, windows, fees, the CE 3.0 rule and the sources. Free.
- `checklist`: Returns the code's name and category, the claim it makes, the ways it is overturned, the evidence items strongest first with each one's upload slot on the platform, the platform's limits, response window and submission rule, and the sources. Free on the page; $0.01 over the API.
- `worth`: Returns the fees on the platform, the cost if you accept, win or lose, the extra cost of fighting, the break-even win chance with its formula, Stripe's published win-chance ranks against it, and with a win chance, the expected cost and a verdict. Free.
- `deadline`: Returns the days left to the due date and its weekday, or from an open date the platform's window, with a calendar file. Free.
- `ce3`: Returns whether a Visa 10.4 dispute meets Compelling Evidence 3.0 as entered: the qualifying date window, each earlier payment with its matching identifiers and its problems, and the reasons it fails. Free.
- `packet`: Returns the letter, the exhibits with their slots, the text fields to fill, the limits check, warnings and the steps to submit, with the letter and exhibit PDFs. preview: true gives a free watermarked letter and the limits check without the files.

Inputs:

- `platform`: stripe, shopify, paypal (Shopify Payments).
- `network, code, category`: The network (visa, mastercard, amex, discover, paypal) and the reason code as written on the dispute (Visa "13.1", Mastercard "4853", Amex "C08"), or the Stripe category when there is no code (Product not received, Product unacceptable, Fraudulent, Unrecognized, Subscription canceled, Credit not processed, Duplicate, General, Non-compliant).
- `productType`: physical, digital, offline (default physical): a physical product; a digital product or service; an offline service (tickets, bookings, work done in person).
- `amount, winChance, compliance, paypalCase, highVolume, minutes, hourly, packet`: For worth: the disputed amount in dollars, your estimate of the chance of winning, a Stripe compliance case, a PayPal chargeback or dispute and its High Volume fee, and your time and packet cost if you want them counted.
- `opened, dueBy, caseId`: For deadline: the due date on the dispute, or the date it was opened; the case ID for the calendar file.
- `disputeDate, disputed, prior`: For ce3: the day the dispute was submitted, the disputed payment's identifiers (device ID or fingerprint, IP address, login, delivery address, description) and up to 20 earlier payments with their dates.
- `caseId, merchant, customer, transaction, facts, exhibits`: For packet: the case ID, your business, the customer, the transaction date and amount, the facts you can state (shipping, delivery, access, cancellation, refund and the rest), and 1 to 20 exhibits, each an evidence item (23 kinds) with a note, typed text and PDF, JPEG or PNG files (at most 30 files in one packet).

Outputs:

- answer: the code's category and the evidence to lead with, the break-even chance, the days left, the CE 3.0 verdict, or whether the packet fits the limits
- items: per evidence item, its rank, label, what to include, whether it is a file or text, and its slot on the platform
- costIfAccepted, costIfWon, costIfLost, extraToFight, breakEven, math, stripeRanks, verdict (worth)
- dueBy, daysLeft, weekday, late, range and ics (deadline); eligible, window, prior, problems (ce3)
- letter, exhibits, textFields, limits, warnings, steps and files or letterPreview (packet)
- sources with their read dates

## How is it calculated, step by step?

1. The code is normalized the ways people write it (Visa "13.1" or "131", Mastercard "4853", PayPal reason names) and looked up in Stripe's published table for that network. A code not in the table is refused, and the category can be given instead.
2. The category sets the claim the code makes, the ways it is overturned, and the evidence list for the product type, strongest first. Each item has its slot: Stripe's file field and text fields, PayPal's evidence type, or on Shopify its own file typed as that evidence.
3. The fees are the platform's own, in US dollars. Stripe charges $15 when a dispute arrives, never returned, and $15 more to counter, returned on a win ($500 more for a compliance case). Shopify Payments takes a $15 chargeback fee with the amount and returns both on a win. PayPal's chargeback fee is $20 and its dispute fee $15 ($30 High Volume); PayPal's pages do not say whether it is returned, so it is counted as not returned.
4. Break-even = extra cost of fighting / (amount + fees returned on a win). With a win chance p, the expected cost of fighting is p x the cost if won + (1 - p) x the cost if lost, and the verdict compares it with the cost of accepting.
5. The deadline is the due date you give, in whole days from today. From an open date only: PayPal gives 10 days for a card chargeback and 20 days to settle a PayPal dispute; Stripe and Shopify give a range of 7 to 21 days, and the exact date must be read on the dispute.
6. Compelling Evidence 3.0 applies to Visa 10.4 only. It needs 2 earlier payments 121 to 365 days before the dispute, on the same card, not reported as fraud and not disputed, each matching the disputed payment on at least two of device ID or fingerprint, IP address, login and delivery address, one of them the device or the IP. A device ID must be at least 15 characters and a fingerprint at least 20.
7. The letter is written only from the facts given: who paid what and when, the code and its claim, a sentence for each fact you state, your own summary as written, and the exhibits in order.
8. Each uploaded file is typed by its first bytes (PDF, JPEG or PNG); PDF pages are counted and encryption flagged, and PNGs are drawn on white and scaled to a page. Exhibits that share a slot become one PDF; an uploaded PDF passes through alone in its slot.
9. The packet is checked against the platform: file types, combined size, size of each file, combined pages, the Mastercard page limit on Stripe, pages in each PDF, and one file per evidence type on Stripe and Shopify. On Stripe the text fields are filled from the facts and the letter goes in uncategorized\_text.

**Platform limits.**

Stripe: PDF, JPEG or PNG, one file per evidence type, 4.5 MB combined, a 49-page limit (19-page for Mastercard), 150,000 characters of text. Shopify Payments: each file under 2 MB, 4 MB combined, a 49-page limit for each PDF. PayPal: each file under 10 MB, 50 MB per case.

Stripe takes one submission: it forwards the response at once, and you cannot edit it or add files. Shopify takes one submission: it sends your evidence on the due date, or when you click Submit now, and after that you cannot edit it.

**Visa.**

The CE 3.0 test is Visa Core Rules Table 11-29, Dispute Condition 10.4 invalid disputes (Compelling Evidence 3.0), from the Visa rules of October 24, 2026.

**What was not read.**

Mastercard, American Express and Discover codes are shown as Stripe publishes them; those networks' own rule books were not read.

## Which edge cases does it handle?

- Mastercard 4853 has several sub-reasons in one Stripe category; all are listed.
- An exhibit that is not on the evidence list for the category is kept, with a warning that issuers may give it no weight.
- Typed evidence that Stripe already takes in a text field from the facts is not repeated, and the packet says which text was not used.
- An uploaded PDF cannot be combined with other files in one slot; the tool says to merge them or upload screenshots instead.
- A due date that has passed is flagged in the packet and in the deadline answer.
- On Shopify, fighting adds no fee, so the break-even is 0% and any evidence is worth submitting.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Visa 13.1 (not received) on Stripe, physical product**

```json
{
  "op": "checklist",
  "platform": "stripe",
  "network": "visa",
  "code": "13.1",
  "productType": "physical"
}
```

Visa 13.1 (not received) on Stripe, physical product

| Result | Value |
| --- | --- |
| answer | Visa 13.1 (Merchandise/Services Not Received) is in Stripe's "Product not received" category: the customer says they did not receive what they paid for. For a physical product on Stripe, lead with proof of delivery, shipping details and signature or ID at pickup or delivery. Stripe takes one response: one file per evidence type, PDF, JPEG or PNG, 4.5 MB combined, a 50-page limit (a 19-page limit for Mastercard), and no links, audio or video. |
| category | Product not received |
| evidence 1 | Proof of delivery: file field shipping\_documentation |
| evidence 2 | Shipping details: text fields shipping\_address, shipping\_date, shipping\_carrier, shipping\_tracking\_number |
| evidence 3 | Signature or ID at pickup or delivery: file field customer\_signature |

**Is a $40 Stripe dispute worth fighting at a 25% chance?**

```json
{
  "op": "worth",
  "platform": "stripe",
  "amount": 40,
  "winChance": 25
}
```

Is a $40 Stripe dispute worth fighting at a 25% chance?

| Result | Value |
| --- | --- |
| answer | On a $40.00 Stripe dispute, fighting costs $15.00 more than accepting and pays off when your chance of winning is above 27.3%; at 25% the expected cost is $56.25 against $55.00 if you accept. |
| break-even | 27.3% |
| formula | break-even = extra cost of fighting / (amount + fees returned on a win) = $15.00 / $55.00 = 27.3% |
| cost if accepted | $55.00 |
| verdict | accept |

**Visa CE 3.0: two earlier payments with the same device and login**

```json
{
  "op": "ce3",
  "disputeDate": "2026-11-08",
  "disputed": {
    "description": "Annual plan, Pro",
    "ip": "203.0.113.7",
    "deviceFingerprint": "fp-7f3a9c2e81b44d0a9e15",
    "login": "jordan@example.com"
  },
  "prior": [
    {
      "date": "2026-03-02",
      "description": "Monthly plan, Pro",
      "ip": "203.0.113.7",
      "deviceFingerprint": "fp-7f3a9c2e81b44d0a9e15",
      "login": "jordan@example.com"
    },
    {
      "date": "2026-04-02",
      "description": "Monthly plan, Pro",
      "ip": "198.51.100.20",
      "deviceFingerprint": "fp-7f3a9c2e81b44d0a9e15",
      "login": "jordan@example.com"
    }
  ]
}
```

Visa CE 3.0: two earlier payments with the same device and login

| Result | Value |
| --- | --- |
| answer | This Visa 10.4 dispute meets the Compelling Evidence 3.0 test as entered: 2 earlier undisputed payments between November 8, 2025 and July 10, 2026 match on device ID or fingerprint, IP address and account or login ID. |
| qualifying window | November 8, 2025 to July 10, 2026 |
| payment of 2026-03-02 | 251 days before; matches device ID or fingerprint, IP address, account or login ID |
| payment of 2026-04-02 | 220 days before; matches device ID or fingerprint, account or login ID |

**A packet preview for a made-up seller: Visa 13.1 on Stripe**

```json
op: "packet"
platform: "stripe"
network: "visa"
code: "13.1"
productType: "physical"
caseId: "du_SAMPLE0001"
merchant: {...}
customer: {...}
transaction: {...}
dueBy: "2026-11-20"
letterDate: "2026-11-08"
facts: {...}
exhibits: 2 items
preview: true
```

A packet preview for a made-up seller: Visa 13.1 on Stripe

| Result | Value |
| --- | --- |
| dispute | visa 13.1, Merchandise/Services Not Received |
| File types | PDF (limit PDF, JPEG, PNG) |
| Combined size | 3 KB (limit 4.50 MB) |
| Combined pages | 2 (limit under 50) |
| One file per evidence type | yes (limit 1) |
| Text in all fields | 1,197 characters (limit 150,000 characters) |
| text fields | customer\_name, customer\_email\_address, billing\_address, shipping\_address, shipping\_date, shipping\_carrier, shipping\_tracking\_number, uncategorized\_text |

## What does it not do?

- It does not read your platform account; the due date and facts are what you enter.
- Mastercard, American Express and Discover codes are shown as Stripe publishes them; those networks' own rule books were not read.
- It cannot tell you your chance of winning; the break-even shows the chance at which fighting pays.
- Not legal advice. The card issuer (or PayPal, for a PayPal claim) decides every dispute; no packet guarantees a win.

## Where does the data come from, and how fresh is it?

The rules data (version 2026-11-08) was read on November 8, 2026 from Stripe, Shopify, PayPal and Visa pages, each listed with its date. Card networks change their rules in April and October and platforms change fees with notice; the data changes only by hand, with the tests that pin it.

- [Stripe Docs: Dispute reason code categories](https://docs.stripe.com/disputes/categories)
- [Stripe Docs: Dispute reason codes](https://docs.stripe.com/disputes/reason-codes-defense-requirements)
- [Stripe Docs: Respond to disputes](https://docs.stripe.com/disputes/responding)
- [Stripe Docs: Dispute evidence best practices](https://docs.stripe.com/disputes/best-practices)
- [Stripe Docs: Manage disputes programmatically](https://docs.stripe.com/disputes/api)
- [Stripe API: the Dispute object (evidence fields)](https://docs.stripe.com/api/disputes/object)
- [Stripe Support: June 2025 pricing updates for disputes](https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes)
- [Shopify Help Center: Responding to chargebacks and inquiries](https://help.shopify.com/en/manual/payments/chargebacks/chargeback-process)
- [Shopify Help Center: Managing chargebacks in the Shopify admin](https://help.shopify.com/en/manual/payments/chargebacks/chargebacks-in-admin)
- [Shopify Help Center: Resolving a chargeback or inquiry](https://help.shopify.com/en/manual/payments/chargebacks/resolve-chargeback)
- [Shopify Help Center: Reasons for a chargeback or inquiry](https://help.shopify.com/en/manual/payments/chargebacks/chargeback-reasons)
- [PayPal Merchant Fees (US), last updated November 4, 2026](https://www.paypal.com/us/business/paypal-business-fees)
- [PayPal Developer: Disputes overview, last updated November 3, 2026](https://developer.paypal.com/docs/disputes/)
- [PayPal Developer: Disputes and chargebacks FAQ, last updated October 14, 2026](https://developer.paypal.com/limited-release/commerce-platform/manage-risks-liabilities/disputes-chargebacks/faqs/)
- [PayPal Customer Disputes API v1.12 (schema)](https://developer.paypal.com/api/customer-disputes/v1/)
- [Visa Dispute Management Guide for Merchants, October 2026](https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchants-dispute-management-guidelines.pdf)
- [Visa Core Rules and Visa Product and Service Rules, 24 October 2026](https://usa.visa.com/content/dam/VCOM/download/about-visa/visa-rules-public.pdf)

The rules data (version 2026-11-08) was read on November 8, 2026 from Stripe, Shopify, PayPal and Visa pages, each listed with its date. Card networks change their rules in April and October and platforms change fees with notice; the data changes only by hand, with the tests that pin it.

Chargeback evidence packet builder: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Stripe Docs: Dispute reason code categories](https://docs.stripe.com/disputes/categories) | see the document | 2026-11-08 |
| [Stripe Docs: Dispute reason codes](https://docs.stripe.com/disputes/reason-codes-defense-requirements) | see the document | 2026-11-08 |
| [Stripe Docs: Respond to disputes](https://docs.stripe.com/disputes/responding) | see the document | 2026-11-08 |
| [Stripe Docs: Dispute evidence best practices](https://docs.stripe.com/disputes/best-practices) | see the document | 2026-11-08 |
| [Stripe Docs: Manage disputes programmatically](https://docs.stripe.com/disputes/api) | see the document | 2026-11-08 |
| [Stripe API: the Dispute object (evidence fields)](https://docs.stripe.com/api/disputes/object) | see the document | 2026-11-08 |
| [Stripe Support: June 2025 pricing updates for disputes](https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes) | see the document | 2026-11-08 |
| [Shopify Help Center: Responding to chargebacks and inquiries](https://help.shopify.com/en/manual/payments/chargebacks/chargeback-process) | see the document | 2026-11-08 |
| [Shopify Help Center: Managing chargebacks in the Shopify admin](https://help.shopify.com/en/manual/payments/chargebacks/chargebacks-in-admin) | see the document | 2026-11-08 |
| [Shopify Help Center: Resolving a chargeback or inquiry](https://help.shopify.com/en/manual/payments/chargebacks/resolve-chargeback) | see the document | 2026-11-08 |
| [Shopify Help Center: Reasons for a chargeback or inquiry](https://help.shopify.com/en/manual/payments/chargebacks/chargeback-reasons) | see the document | 2026-11-08 |
| [PayPal Merchant Fees (US), last updated November 4, 2026](https://www.paypal.com/us/business/paypal-business-fees) | updated 2026-11-04 | 2026-11-08 |
| [PayPal Developer: Disputes overview, last updated November 3, 2026](https://developer.paypal.com/docs/disputes/) | updated 2026-11-03 | 2026-11-08 |
| [PayPal Developer: Disputes and chargebacks FAQ, last updated October 14, 2026](https://developer.paypal.com/limited-release/commerce-platform/manage-risks-liabilities/disputes-chargebacks/faqs/) | updated 2026-10-14 | 2026-11-08 |
| [PayPal Customer Disputes API v1.12 (schema)](https://developer.paypal.com/api/customer-disputes/v1/) | see the document | 2026-11-08 |
| [Visa Dispute Management Guide for Merchants, October 2026](https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchants-dispute-management-guidelines.pdf) | updated 2026-10 | 2026-11-08 |
| [Visa Core Rules and Visa Product and Service Rules, 24 October 2026](https://usa.visa.com/content/dam/VCOM/download/about-visa/visa-rules-public.pdf) | updated 2026-10-24 | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check every code row against Stripe's table, each platform's limits, windows and fees, codes written the ways people write them, the Visa 13.1 checklist on Stripe, the break-even on each platform, deadlines and the calendar file, the CE 3.0 test at its day and length boundaries, a letter built only from the facts given, file typing and page counts, packets on Stripe, Shopify and PayPal with their refusals and warnings, and that each worked example is what the engine returns.

What its test suite asserts:

- Every code row matches Stripe's published table and every source is dated, as read on November 8, 2026.
- Each platform's limits, windows and fees are pinned; the break-even is the countered fee over the amount plus that fee on Stripe, nothing on Shopify, and sunk on PayPal.
- CE 3.0 needs 2 payments 121 to 365 days old with the device or IP plus one more element; the letter uses only the facts given; packets fit each platform's limits.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Chargeback evidence packet builder tool](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/).

## Questions

### Is there any AI in the chargeback evidence packet builder answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the chargeback evidence packet builder refuse to answer?

It does not read your platform account; the due date and facts are what you enter. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Chargeback evidence packet builder tool](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/chargeback-evidence/  
Data as of: 2026-11-04
