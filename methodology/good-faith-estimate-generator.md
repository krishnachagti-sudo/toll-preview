# How Good Faith Estimates are built: 45 CFR 149.610

A self-pay Good Faith Estimate is due by 11:59 PM 1 business day after scheduling when the service is 3 to 9 business days away, 3 business days after when it is 10 or more away, and 3 business days after a request (45 CFR 149.610(b)). Business days are Monday to Friday without federal holidays. A recurring course of care may cover at most 12 months.

## How does it work?

1. A business day is Monday to Friday, not a federal holiday and not a date in closedDays. The federal holidays are worked out for each year: New Year's Day, Martin Luther King Jr.'s Birthday, Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving and Christmas, with a Saturday holiday observed the Friday before and a Sunday one the Monday after (New Year's Day on a Saturday is observed the December 31 before).
2. The days from scheduling to the service are counted as business days after the scheduling date up to and including the service date (CMS's own example: scheduled Monday January 3, 2022 for Thursday January 6 is 3 business days ahead, due January 4).
3. A new estimate for a change is due 1 business day before the service; that date is given as reissueBy.
4. Sessions are dated from firstDate at the cadence (monthly keeps the day of the month, clamped to the month's last day). They must fall within 12 months of the estimate date, the day before the same date 12 months later: a count that runs past it is refused with how many fit, as is a through date past it (149.610(b)(1)(x)(B)).
5. Each line is the charge for one unit times the quantity, and a line marked perSession is repeated for every session. Money is whole cents.

> Steps 6 to 8, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/good-faith-estimate-generator/#what) below.

## What does it not cover?

- It does not make estimates for insured patients or Advanced EOBs, and Colorado is the only state rule added.
- It checks the format of codes, NPIs and TINs, not whether they are the right ones or registered.
- It does not set charges: the rates are yours.
- Patient details are used only to make the estimate and are not kept. It is not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 12 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The rules were read on November 8, 2026 (rule version 2026.11.08): 45 CFR 149.610 on eCFR, and CMS's model notice, FAQs and dispute page from Internet Archive copies of the cms.gov files. They change only by hand, with the tests that pin every number.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests pin the timing, scope, retention and dispute numbers to the sources, the federal holidays and observed days, business-day counting, CMS's own due-date example and the three bands, Thanksgiving and state holidays, sessions refused past 12 months, the NPI check digit, the $8,000 therapy sample, each missing element named, Colorado's cap, the no-cost form, and that the PDF is the same bytes every time.

- [45 CFR 149.610: Requirements for provision of good faith estimates of expected charges for uninsured (or self-pay) individuals](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-B/part-149/subpart-G/section-149.610), 2021-10-07, read 2026-11-08
- [CMS model notice, Appendix 2: Standard Form: "Good Faith Estimate for Health Care Items and Services" Under the No Surprises Act (OMB 0938-1433, expiration date shown 11/2025), with the abbreviated no-cost form (read from the Internet Archive copy captured 2026-10-20)](https://www.cms.gov/files/document/good-faith-estimate-example.pdf), see the document, read 2026-11-08
- [CMS GFE FAQs Part 2: FAQs about CAA 2021 implementation: GFEs for uninsured (or self-pay) individuals, Part 2 (April 5, 2022) (read from the Internet Archive copy captured 2026-10-26)](https://www.cms.gov/CCIIO/Resources/Regulations-and-Guidance/Downloads/Guidance-Good-Faith-Estimates-FAQ-Part-2.pdf), 2022-04-05, read 2026-11-08
- [CMS GFE FAQs Part 3: FAQs about CAA 2021 implementation: GFEs for uninsured (or self-pay) individuals, Part 3 (December 2, 2022) (read from the Internet Archive copy captured 2026-10-12)](https://www.cms.gov/files/document/good-faith-estimate-uninsured-self-pay-part-3.pdf), 2022-12-02, read 2026-11-08
- [CMS GFE FAQs Part 4: FAQs about CAA 2021 implementation: GFEs for uninsured (or self-pay) individuals, Part 4 (December 27, 2022) (read from the Internet Archive copy captured 2026-10-12)](https://www.cms.gov/files/document/faqs-good-faith-estimate-uninsured-self-pay-part-4.pdf), 2022-12-27, read 2026-11-08
- [CMS GFE FAQs Part 5: FAQs about CAA 2021 implementation: GFEs for uninsured (or self-pay) individuals, Part 5 (read from the Internet Archive copy captured 2025-08-28)](https://www.cms.gov/files/document/faqs-good-faith-estimate-uninsured-self-pay-part-5.pdf), see the document, read 2026-11-08
- [CMS sample notice of the right to a GFE: Sample Notice of Uninsured (or Self-Pay) Individual's Right to Receive a Good Faith Estimate (revision date 8/2023) (read from the Internet Archive copy captured 2025-06-26)](https://www.cms.gov/files/document/nsa-gfe-required-notice.pdf), 2023-08-01, read 2026-11-08
- [CMS: What is a good faith estimate?: CMS Medical Bill Rights guide: What is a good faith estimate? (page last modified November 5, 2024) (read from the Internet Archive copy captured 2026-05-11)](https://www.cms.gov/medical-bill-rights/help/guides/good-faith-estimate), 2024-11-05, read 2026-11-08
- [CMS: Dispute a medical bill: CMS Medical Bill Rights: Dispute a medical bill (page last modified August 17, 2026) (read from the Internet Archive copy captured 2026-08-24)](https://www.cms.gov/medical-bill-rights/help/dispute-a-bill), 2026-08-17, read 2026-11-08
- [CMS AEOB progress report: Progress Toward Advanced Explanation of Benefits (AEOB) Rulemaking and Implementation (April 23, 2024) (read from the Internet Archive copy captured 2025-08-28)](https://www.cms.gov/files/document/progress-aeob-rulemaking-implementation.pdf), 2024-04-23, read 2026-11-08
- [CMS fact sheet on what is health insurance: What is Considered "Health Insurance"? Determining When Uninsured (or Self-Pay) Good Faith Estimate Rules Apply (read from the Internet Archive copy captured 2026-02-05)](https://www.cms.gov/files/document/fact-sheet-what-is-considered-health-insurance.pdf), see the document, read 2026-11-08
- [Colorado HB25-1317: Colorado House Bill 25-1317, signed act (amends C.R.S. 25-49-106(1)(b)), signed June 4, 2025](https://leg.colorado.gov/bills/hb25-1317), 2025-06-04, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the good faith estimate generator compute?

The tool works out the date a Good Faith Estimate for an uninsured or self-pay patient is due, turns a recurring course of care into dated sessions within 12 months of the estimate date, totals the lines of each provider or facility and the whole estimate, gives the bill amount at which each provider's charge can be disputed ($400 over its estimate), adds Colorado's self-pay cap, checks every element 45 CFR 149.610(c)(1) requires, and lays the estimate out like the CMS model notice as a PDF.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `rules`: Returns the rules file: the required elements, the timing rules and their quotes, the 12-month scope, the dispute facts, the Colorado cap and every source with its read date, with the federal holidays of 2026 and 2027. Free.
- `due-date`: Works out when the estimate is due from scheduledOn and serviceDate, or requestedOn, or both, skipping weekends, federal holidays and any closedDays, with the rule paragraph that applies. Free on the tool page; $0.01 a call over the API or MCP.
- `check`: Works out the whole estimate without drawing it: the answer, the lines and totals per provider, the dispute line, the Colorado cap, the sessions, the timing and whether it was on time, and the element-by-element check with what is missing. Free on the tool page; $0.01 a call over the API or MCP.
- `estimate`: Does what check does and returns the estimate as a PDF laid out like the CMS model notice. The clean PDF is refused while a required element is missing and costs $1.00 an estimate; with preview set it is a free watermarked copy that shows what is missing.

Inputs:

- `gfeDate`: The date of the estimate, from 2022 to 2040 (the rule applies from January 1, 2022).
- `scheduledOn, requestedOn, serviceDate, closedDays`: The day the service was scheduled or the patient asked, the service date (for due-date; for an estimate, the first scheduled date), and up to 60 state holidays or other dates to skip as well.
- `patient`: First, middle and last name, date of birth, address, phone, email, contact preference and the last four digits of an account number.
- `primary`: The primary item or service in plain words, its scheduled dates or notScheduled, and up to two diagnoses.
- `recurring`: A course of care: firstDate, cadence (twice-weekly, twice a week; weekly, once a week; every-2-weeks, every 2 weeks; every-4-weeks, every 4 weeks; monthly, once a month), and count or through; for twice a week, the days to the second session (default 3).
- `providers`: Up to 10, the convening provider or facility first: name, type, NPI, TIN, address, a billing contact, phone, email, notes, and up to 40 items each with a description, service code, diagnosis code, quantity, charge and perSession.
- `separate, noCost, preview`: Up to 20 items to be scheduled separately with how to get their estimates; the abbreviated no-cost form; and, for estimate, a watermarked preview.

Outputs:

- answer: who the estimate is for, its date, the sessions, the total and when it is due
- total and providers: each provider's role, lines (quantity, unit and line charges), total, the amount at which a bill can be disputed, and the Colorado cap where it applies
- recurring: the cadence, the number of sessions, the first and last dates, every date and the last day the scope allows
- timing: the band, the due date, the holidays skipped, the date to reissue by, and whether the estimate date is on time
- check: for each element (c)(1)(i) to (xi), ok, missing, warn or added by the tool, with a message
- estimate: the PDF (estimate op)

**Every step in full (8) and the rules**

1. A business day is Monday to Friday, not a federal holiday and not a date in closedDays. The federal holidays are worked out for each year: New Year's Day, Martin Luther King Jr.'s Birthday, Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving and Christmas, with a Saturday holiday observed the Friday before and a Sunday one the Monday after (New Year's Day on a Saturday is observed the December 31 before).
2. The days from scheduling to the service are counted as business days after the scheduling date up to and including the service date (CMS's own example: scheduled Monday January 3, 2022 for Thursday January 6 is 3 business days ahead, due January 4). Fewer than 3: no estimate is required on scheduling, and one given anyway is voluntary. 3 to 9: due 1 business day after scheduling (149.610(b)(1)(vi)(A)). 10 or more: due 3 business days after (vi)(B). A request: due 3 business days after it (vi)(C). With both, the earlier date. Each is due by 11:59 PM.
3. A new estimate for a change is due 1 business day before the service; that date is given as reissueBy.
4. Sessions are dated from firstDate at the cadence (monthly keeps the day of the month, clamped to the month's last day). They must fall within 12 months of the estimate date, the day before the same date 12 months later: a count that runs past it is refused with how many fit, as is a through date past it (149.610(b)(1)(x)(B)). Sessions are calendar dates and are not moved off holidays.
5. Each line is the charge for one unit times the quantity, and a line marked perSession is repeated for every session. Money is whole cents. Each provider's lines are totalled, then the whole estimate.
6. For each provider, the bill amount at which the patient can start dispute resolution is its total plus $400. For a provider in Colorado, the final cost may be higher than its total by the lesser of 15% (rounded to the cent) or $400 (C.R.S. 25-49-106(1)(b), as amended by HB25-1317).
7. Each element is checked: the patient's name and a date of birth not after the estimate; the primary service and its dates (or not yet scheduled); items for every provider; a service code on every item, in the format of a CPT, HCPCS, CDT, DRG or NDC code, and diagnosis codes in ICD-10 format; each provider's name, a 10-digit NPI whose check digit is valid, a 9-digit TIN, a state and an address; and a description and instructions for each separately scheduled item. The four disclaimers are added in the model notice's words.
8. When a scheduling or request date is given, the due date is worked out for the first service date and the estimate is marked late when its date is after it.

**Sources.**

The rule is 45 CFR 149.610 as read on eCFR on November 8, 2026. Every rule here was read on readOn from the regulation (eCFR) or a CMS document. cms.gov refuses scripted reads (HTTP 403), so CMS documents were read from Internet Archive copies of the cms.gov files; each source names the copy and its capture date. The tests pin every number.

**Insured patients.**

Estimates for insured patients and Advanced EOBs are not covered: the Departments and OPM deferred enforcement of GFE requirements for insured individuals and AEOB requirements, pending future rulemaking.

## Which edge cases does it handle?

**The edge cases (6)**

- A service scheduled 3 business days ahead is in the 1-day band; 10 business days ahead is in the 3-day band.
- Over Thanksgiving: scheduled Wednesday, November 25, 2026 for December 10, the estimate is due Tuesday, December 1, with Thanksgiving skipped.
- A state holiday is skipped only when it is given in closedDays.
- The no-cost form is for one provider with no co-providers and lists no items or charges; more providers are refused.
- A line marked perSession with no recurring schedule is refused, as is a first session or a scheduled date before the estimate date.
- With no diagnosis code anywhere, the check warns rather than refuses, since a first evaluation may need none.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Due date over Thanksgiving: scheduled Wednesday, November 25, 2026 for December 10**

Due date over Thanksgiving: scheduled Wednesday, November 25, 2026 for December 10

| Result | Value |
| --- | --- |
| answer | Scheduled 10 business days ahead (10 or more): due by 11:59 PM on Tuesday, December 1, 2026, 3 business days after scheduling. |
| business days ahead | 10 |
| skipped | Thanksgiving Day, 2026-11-26 |
| reissue by | 2026-12-09 |

**The input**

```json
{
  "op": "due-date",
  "scheduledOn": "2026-11-25",
  "serviceDate": "2026-12-10"
}
```

**More worked examples (2)**

**Weekly therapy for 12 months at $150 a session, plus a $200 intake (made-up practice and patient)**

Weekly therapy for 12 months at $150 a session, plus a $200 intake (made-up practice and patient)

| Result | Value |
| --- | --- |
| answer | A Good Faith Estimate for Alex Sample dated November 16, 2026: 52 sessions once a week from November 19, 2026 to November 11, 2027, totals $8,000.00. It is due by 11:59 PM on November 17, 2026. |
| Intake assessment (first visit) | 1 x $200.00 = $200.00 |
| Individual therapy session, about 60 minutes | 52 x $150.00 = $7,800.00 |
| dispute if a bill is at least | $8,400.00 |
| last day of the scope | 2027-11-15 |
| elements missing | 0 |

**The input**

```json
op: "estimate"
gfeDate: "2026-11-16"
scheduledOn: "2026-11-16"
patient: {...}
primary: {...}
recurring: {...}
providers: 1 items
```

**Check an estimate: the same therapy estimate with no NPI and no date of birth**

Check an estimate: the same therapy estimate with no NPI and no date of birth

| Result | Value |
| --- | --- |
| (c)(1)(i) | Give the patient's date of birth. |
| (c)(1)(v) | Sample Counseling PLLC (made up): no NPI. |

**The input**

```json
op: "check"
gfeDate: "2026-11-16"
scheduledOn: "2026-11-16"
patient: {...}
primary: {...}
recurring: {...}
providers: 1 items
```

## How is it tested?

**What its test suite asserts (3)**

- The timing, 12-month scope, 6-year retention and $400 dispute numbers are pinned to the sources read November 8, 2026.
- Federal holidays and observed days, business-day counting, CMS's own due-date example, the three bands, Thanksgiving and state holidays are checked, and sessions past 12 months are refused.
- The NPI check digit, the $8,000 therapy sample, each missing element named with its paragraph, Colorado's cap per provider and the no-cost form are checked, and the PDF is the same bytes every time.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Good Faith Estimate generator tool](https://krishnachagti-sudo.github.io/toll-preview/good-faith-estimate-generator/).

## Questions

### Is there any AI in the good faith estimate generator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the good faith estimate generator refuse to answer?

It does not make estimates for insured patients or Advanced EOBs, and Colorado is the only state rule added. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Good Faith Estimate generator tool](https://krishnachagti-sudo.github.io/toll-preview/good-faith-estimate-generator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/good-faith-estimate-generator/  
Data as of: 2026-11-04
