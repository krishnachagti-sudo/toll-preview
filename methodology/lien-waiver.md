# How the lien waiver generator works: statutory forms

The waiver is picked from the state, the stage (progress or final) and the payment status: not paid or a check not cleared gives the conditional form, cleared gives the unconditional one. Forms are made for Arizona, California, Florida, Texas and Wyoming (15 statutory forms, copied word for word); an unconditional waiver before the money clears is refused unless you confirm it.

## How does it work?

1. The state is looked up. A state without a statutory form here is answered with the reason and no form is made.
2. The type follows the payment status: cleared gives the unconditional waiver, a check not cleared or no payment gives the conditional one.
3. For Texas, the original contract date picks the version: before January 1, 2022 the same 53.284 forms must be signed and notarized (H.B. 2237).
4. An unconditional waiver for a payment not cleared is blocked: it states you were paid and is effective when signed. In Texas, Property Code 53.283 says no one may require one before payment in good funds. signBeforeCleared overrides the block with a warning.
5. A final waiver while more money is expected is refused unless the form has a space for the disputed amount and it is given; otherwise use a progress waiver.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/lien-waiver/#what) below.

## What does it not cover?

- States other than Arizona, California, Florida, Texas and Wyoming are refused, with the reason, rather than guessed at.
- It does not notarize, does not check whether your contract requires its own form, and is not legal advice.
- Each form is current as of the date its source was read, shown with the source.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 8 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every statutory form and rule was read from the official source on November 2, 2026, with a dated snapshot of each page kept with the tool. A watcher reads each source daily and alerts the owner when one changes; the forms change only by hand, after the statute is read again.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): Each form line is checked word for word against its dated snapshot. The tests cover the choice of type for every payment status, the Texas versions either side of January 1, 2022, the block on unconditional waivers before payment, the free matching unconditional for the same payment, and that every worked example is what the tool returns.

- [Arizona Revised Statutes 33-1008 (Arizona State Legislature)](https://www.azleg.gov/ars/33/01008.htm), see the document, read 2026-11-02
- [California Civil Code 8132, 8134, 8136 and 8138 (Contractors State License Board)](https://www.cslb.ca.gov/consumers/legal_issues_for_consumers/Mechanics_Lien/Conditional_And_Unconditional_Waiver_Release_Form.aspx), see the document, read 2026-11-02
- [Florida Statutes 713.20 (Florida Legislature)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0713/Sections/0713.20.html), see the document, read 2026-11-02
- [Texas Property Code 53.281 to 53.287 (Texas Legislative Council)](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.53.htm), see the document, read 2026-11-02
- [H.B. 2237 (87th Leg., 2021), secs. 35, 37 and 38 (Texas waiver form versions)](https://capitol.texas.gov/tlodocs/87R/billtext/html/HB02237F.htm), see the document, read 2026-11-02
- [Tex. Civ. Prac. & Rem. Code 121.008(b) (Texas certificate of acknowledgment forms)](https://statutes.capitol.texas.gov/Docs/CP/htm/CP.121.htm), see the document, read 2026-11-02
- [Wyoming Statutes 29-10-101(b) (Wyoming Legislature)](https://wyoleg.gov/statutes/compress/title29.pdf), see the document, read 2026-11-02
- [AIA Contract Documents, Types of lien waivers (list of states that require a specific form)](https://learn.aiacontracts.com/types-of-lien-waivers/), see the document, read 2026-11-02

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the lien waiver generator by state compute?

Given the state the property is in, whether the payment is a progress or final payment and whether it has been paid, the tool says which waiver to sign, fills in that state's statutory form in the statute's own words with your job details, and returns a PDF with a record of the source, the form version and a SHA-256 hash of the filled text.

**In detail: operations, inputs and outputs**

Once the payment clears, the matching unconditional waiver for the same payment is made at no new charge.

Operations (the op field):

- `decide`: Returns which waiver to sign now: the form, its statute, whether a notary is needed, whether it is blocked, and the warnings that apply. No names needed. Free.
- `rules`: Returns every state's coverage with the reason for any state refused, or one state's statute, rules, notary requirement and forms with their fields. Free.
- `preview`: Returns the chosen form as a PDF watermarked "PREVIEW - NOT FOR SIGNING", filled with whatever job details are given, blanks left for the rest. Free.
- `waiver`: Returns the filled statutory waiver as a PDF with its record page: the form and cite, the source and the date it was read, the payment id and the document hash. $1.50 per payment; the same payment again within 180 days is free.
- `unconditional`: Returns the matching unconditional waiver once the payment cleared, with the cleared date and amount. Free for a payment already paid for within 180 days.

Inputs:

- `state`: The two-letter code of the state the property is in, or DC.
- `stage`: progress (a payment during the job) or final (the last payment).
- `paymentStatus`: not\_received, check\_received (not cleared yet) or cleared.
- `type, signBeforeCleared`: Leave type out to take the one that matches the payment status. signBeforeCleared makes an unconditional waiver before the money clears, on purpose.
- `originalContractDate`: Texas: the date the owner signed the original contract. Before January 1, 2022 the waiver must be notarized.
- `expectsMoreMoney`: Whether more money is still owed on the job; a final waiver covers the whole job.
- `payment`: For preview, waiver and unconditional: the claimant, customer, owner and amount, plus the job, location, through date, signing date and, where the form has spaces for them, disputed, retainage and unpaid amounts.
- `clearedOn, amountCleared, signerEntity`: For unconditional: the day the payment cleared and how much cleared. signerEntity picks the Texas notary acknowledgment form (individual, corporation or LLC).

Outputs:

- decision: the state, coverage, waiver type, form id and title, statute, form version, notary flag, blocked flag, warnings and a plain explanation
- waiver: the form title, cite, type, stage, version and amount, plus the blanks left to fill by hand
- paymentId and documentHash (SHA-256 of the filled form text)
- pdf: the filled form with its record page, and the sources with the date each was read

**Every step in full (7) and the rules**

1. The state is looked up. A state without a statutory form here is answered with the reason and no form is made.
2. The type follows the payment status: cleared gives the unconditional waiver, a check not cleared or no payment gives the conditional one. Florida and Wyoming have one form per stage, which says the payment was received.
3. For Texas, the original contract date picks the version: before January 1, 2022 the same 53.284 forms must be signed and notarized (H.B. 2237). Without the date, the older rule is used and a warning asks for it.
4. An unconditional waiver for a payment not cleared is blocked: it states you were paid and is effective when signed. In Texas, Property Code 53.283 says no one may require one before payment in good funds. signBeforeCleared overrides the block with a warning.
5. A final waiver while more money is expected is refused unless the form has a space for the disputed amount and it is given; otherwise use a progress waiver.
6. The form lines are filled from the payment details. Anything not given stays a blank line to fill by hand; the signature is always left for the signer.
7. The payment id is a hash of the state, stage, parties, job, through date and amount, so the conditional waiver and its matching unconditional are one payment, paid once within 180 days.

**The forms.**

Every line of the 15 forms is the statute's own wording, checked word for word against a dated snapshot of the official page, read on November 2, 2026.

California's four forms are the copies published by the Contractors State License Board; the Legislature's own site refused the request when read.

**Which states are covered.**

States on the AIA list of states that require a specific waiver form are covered when their statute could be read from an official source: Arizona, California, Florida, Texas and Wyoming.

Georgia, Massachusetts, Michigan, Mississippi, Missouri, Nevada and Utah are on that list but could not be read and cited from an official source, so they are refused with the reason. The other 39 states and DC have no statutory form and are refused rather than given made-up wording.

## Which edge cases does it handle?

**The edge cases (5)**

- A check received but not cleared gets the conditional waiver: it takes effect only when the bank pays the check.
- Florida's forms have no conditional wording, so the tool says to sign once the payment has cleared rather than add words to the statutory form.
- Wyoming's form ends with a notary acknowledgment, so the notary flag is set; the tool does not notarize.
- An unconditional waiver signed before the payment cleared, or for more than cleared, is refused.
- A through date after the signing date is refused: a waiver covers work already furnished.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Texas, a progress check not cleared, original contract signed in 2021**

Texas, a progress check not cleared, original contract signed in 2021

| Result | Value |
| --- | --- |
| explanation | You hold a check that has not cleared, so the conditional waiver is the one that matches: it takes effect only when the bank pays the check. Texas: conditional waiver and release on progress payment (Tex. Prop. Code 53.284(b)). |
| form | Conditional waiver and release on progress payment |
| notary required | yes |

**The input**

```json
{
  "op": "decide",
  "state": "TX",
  "stage": "progress",
  "paymentStatus": "check_received",
  "originalContractDate": "2021-08-16"
}
```

**More worked examples (1)**

**Florida, final payment not received yet**

Florida, final payment not received yet

| Result | Value |
| --- | --- |
| explanation | Florida: waiver and release of lien upon final payment (Fla. Stat. 713.20(5)). The form says the payment has been received, so sign it only after the payment clears. |
| blocked | yes, until the payment clears |

**The input**

```json
{
  "op": "decide",
  "state": "FL",
  "stage": "final",
  "paymentStatus": "not_received"
}
```

## How is it tested?

**What its test suite asserts (3)**

- Every line of the 15 statutory forms is checked word for word against its dated snapshot, read on November 2, 2026.
- The type for each payment status, the Texas versions and the block on unconditional waivers before payment are tested.
- The conditional waiver and its matching unconditional share one payment id and are paid once.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Lien waiver generator by state tool](https://krishnachagti-sudo.github.io/toll-preview/lien-waiver/).

## Questions

### Is there any AI in the lien waiver generator by state answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the lien waiver generator by state refuse to answer?

States other than Arizona, California, Florida, Texas and Wyoming are refused, with the reason, rather than guessed at. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Lien waiver generator by state tool](https://krishnachagti-sudo.github.io/toll-preview/lien-waiver/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/lien-waiver/  
Data as of: 2026-11-04
