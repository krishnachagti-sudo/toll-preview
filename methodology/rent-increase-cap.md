# How rent increase caps are checked: state and local method

The figure is the one published for the window the effective date falls in, applied to the rent and rounded down to the cent: in Oregon, $2,000 rent may rise at most 10% for 2027, to $2,200, with 90 days' written notice. 4 jurisdictions set a percentage (California, Oregon, Washington and District of Columbia); 4 set notice rules only (New York, Maine, Delaware and Virginia). Not legal advice.

## How does it work?

1. The state code picks the rule row, and a locality its local row.
2. An exemption you name, or an age exemption worked out from builtDate (Oregon under 15 years, California within 15 years, Washington 12 or fewer years), takes the unit outside the cap; the notice rule still applies.
3. A local ordinance that covers the unit is used before the state cap.
4. The figure is the one published for the window the effective date falls in: California by CPI region for increases from August 1 to July 31, Oregon and Washington by calendar year, DC by Rent Control Year, New York City by the Rent Guidelines Board order for the lease start.
5. The increase is the base rent times the percentage, rounded down to the cent, so the result is never above the limit. California and Washington measure from the lowest rent in the 12 months before; the others from the current rent.

> Steps 6 to 9, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/rent-increase-cap/#what) below.

## What does it not cover?

- Figures are as published on the dates shown, for the windows shown; an increase taking effect outside a published window is refused, not guessed.
- Exemptions (building age, owner occupancy, local coverage) are applied from your answers; the tool does not check public records.
- Local ordinances other than the City of Los Angeles, unincorporated Los Angeles County, New York City and Montgomery County, Maryland were not checked.
- States without a row are not covered: the tool refuses them rather than guess.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 30 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every rule row and local row was read on November 8, 2026 (rule version 2026.11.08). A new figure is added by hand when its agency publishes it, with the tests that pin each figure and quote.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests pin the 8 state rows and 5 local rows as read on November 8, 2026, every other state as not covered, the published figures and windows, the BLS CPI changes that reproduce them, and each quote word for word.

- [California: Limits on Rent Increases (regional chart and local ordinances)](https://oag.ca.gov/rentcaps), read on the state agency's page, read 2026-11-08
- [California: Landlord-Tenant Issues (notice, exemptions)](https://oag.ca.gov/tenants), read on the state agency's page, read 2026-11-08
- [California: CPI-U regional series (CUURS49ASA0, CUURS49BSA0, CUURS49CSA0, CUURS49ESA0) via the BLS public API](https://api.bls.gov/publicAPI/v1/timeseries/data/), read on the state agency's page, read 2026-11-08
- [Oregon: Oregon Revised Statutes chapter 90](https://www.oregonlegislature.gov/bills_laws/ors/ors090.html), read from an Internet Archive copy of the official page, read 2026-11-08
- [Oregon: Rent Stabilization (2027: 10%; 2026: 9.5%) and the 2027 workbook (published September 30, 2026)](https://www.oregon.gov/das/oea/pages/rent-stabilization.aspx), read from an Internet Archive copy of the official page, read 2026-11-08
- [Washington: Prohibition on certain rent increases](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.700), read on the official site, read 2026-11-08
- [Washington: Exemptions](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.710), read on the official site, read 2026-11-08
- [Washington: Notice of rent increases, form](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.720), read on the official site, read 2026-11-08
- [Washington: Written notice of increase in rent](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.140), read on the official site, read 2026-11-08
- [Washington: Commerce announces 10% rent cap for 2027 (bulletin of July 15, 2026)](https://content.govdelivery.com/accounts/WADOC/bulletins/420afb7), read on the official site, read 2026-11-08
- [Washington: Commerce announces 9.683% rent cap for 2026 (July 18, 2025)](https://www.commerce.wa.gov/commerce-announces-9-683-rent-cap-for-2026/), read on the official site, read 2026-11-08
- [District of Columbia: Increases above base rent](https://code.dccouncil.gov/us/dc/council/code/sections/42-3502.08), read on the official site, read 2026-11-08
- [District of Columbia: Service (60-day rule)](https://code.dccouncil.gov/us/dc/council/code/sections/42-3509.04), read on the official site, read 2026-11-08
- [District of Columbia: Coverage and exemptions](https://code.dccouncil.gov/us/dc/council/code/sections/42-3502.05), read on the official site, read 2026-11-08
- [District of Columbia: RHC publishes new rent increase caps (February 2, 2026)](https://ota.dc.gov/node/1816006), read on the official site, read 2026-11-08
- [New York: Notice of rent increase (version in effect from August 18, 2024)](https://www.nysenate.gov/legislation/laws/RPP/226-C), read on the official site, read 2026-11-08
- [Maine: Notice of rent or mandatory recurring fee increase](https://legislature.maine.gov/statutes/14/title14sec6015-2.html), read on the official site, read 2026-11-08
- [Maine: Rent increase limitation](https://legislature.maine.gov/statutes/14/title14sec6016.html), read on the official site, read 2026-11-08
- [Delaware: Renewals of rental agreements with modifications](https://delcode.delaware.gov/title25/c051/sc01/index.html), read on the official site, read 2026-11-08
- [Virginia: Terms and conditions of rental agreement (both versions)](https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1204/), read on the official site, read 2026-11-08
- [City of Los Angeles: Allowable Rent Increase bulletin (2026-27: 3%)](https://housing.lacity.gov/wp-content/uploads/2022/01/Allowable-Rent-Increase-Bulletin-English.pdf), read on the official site, read 2026-11-08
- [City of Los Angeles: RSO overview (coverage; last modified September 22, 2026)](https://housing.lacity.gov/residents/rso-overview), read on the official site, read 2026-11-08
- [Unincorporated Los Angeles County: Rent Stabilization Program (maximum allowable rent increase table)](https://dcba.lacounty.gov/rentstabilizationprogram/), read on the official site, read 2026-11-08
- [Unincorporated Los Angeles County: Understanding Rent Increases (August 5, 2026)](https://dcba.lacounty.gov/news/understanding-rent-increases/), read on the official site, read 2026-11-08
- [New York City: Apartment and Loft Order #58 (June 25, 2026)](https://rentguidelinesboard.cityofnewyork.us/2026-27-apartment-loft-order-58/), read on the official site, read 2026-11-08
- [New York City: Apartment and Loft Order #57 (June 30, 2025)](https://rentguidelinesboard.cityofnewyork.us/2025-26-apartment-loft-order-57/), read on the official site, read 2026-11-08
- [New York City: Good Cause Eviction Law notice (posted July 16, 2026, reposted August 17, 2026)](https://hcr.ny.gov/good-cause-eviction-law-notice-august-2026), read on the official site, read 2026-11-08
- [New York City: Definitions (inflation index, local rent standard)](https://www.nysenate.gov/legislation/laws/RPP/211), read on the official site, read 2026-11-08
- [Montgomery County, Maryland: Rent Stabilization Increases and Limitations](https://www.montgomerycountymd.gov/department-housing-community-affairs/rent-stabilization/rent-stabilization-increases-limitations), read on the official site, read 2026-11-08
- [Montgomery County, Maryland: Rent Stabilization (coverage)](https://www.montgomerycountymd.gov/department-housing-community-affairs/rent-stabilization), read on the official site, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the rent increase cap calculator and notice compute?

Given a state (and, where it matters, a county or a local ordinance), the current rent and the day the increase takes effect, the tool gives the most the rent may rise to, whether a proposed rent is within it, the written notice owed and the last day to serve it, each with the rule it rests on and the date it was read. It also makes a rent increase notice PDF, refused while the increase breaks the rule. Covered: California, Oregon, Washington, District of Columbia, New York, Maine, Delaware, Virginia and Montgomery County, Maryland. The other 43 states are refused rather than guessed. Not legal advice. We are not a law firm, and this tool does not review your lease, your building or your case.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `rules`: Returns the rule row for one state, with its quotes, sources and local rows; for a state not covered, the reason; with no state, every covered row and the list not covered. Free.
- `percent`: Works out the change from one monthly rent to another as a percentage, with the increase a month and a year. Free.
- `check`: Works out the cap in force on the effective date, the most the rent may be with the arithmetic, a verdict on any proposed rent, the timing rules (first year, once in 12 months, end of the lease term), the notice owed and its serve-by date, with each reason's citation.
- `notice`: Runs the check and returns the notice text and a PDF. The clean notice is refused while the increase is over the cap, late or for a date whose figure is not published; a preview is free, watermarked and shows what the check found.

Inputs:

- `state, locality, county`: A two-letter code: CA, OR, WA, DC, NY, ME, DE, VA, or MD with locality "montgomery-county". Localities: los-angeles, los-angeles-county-unincorporated, san-diego, new-york-city, montgomery-county. California needs the county, which picks the CPI region.
- `rent, newRent or increasePct, baseRent`: The current monthly rent; the proposed new rent or the increase in percent (not both); and, in California and Washington, the lowest rent in the 12 months before the increase.
- `effectiveDate, noticeDate`: The day the new rent takes effect, and the day written notice is or was given. Dates are written like 2027-02-01.
- `builtDate, exemption`: The first certificate of occupancy, for the age exemptions and local coverage, or an exemption id from the state's rules, from your own knowledge of the unit.
- `tenancyStart, lastIncreaseDate, leaseEnd, leaseMonths`: For the first-year and once-in-12-months rules, the end of the lease term (Washington, Delaware, Virginia) and the New York notice length.
- `weekToWeek, subsidized, elderly, rentDay, stabilized, leaseYears, goodCause, rstpoClass, localCovered, largeLandlord`: The answers the state and local rules turn on: Oregon week-to-week, Washington subsidized, DC elderly or disabled and its rent day, New York City stabilized or Good Cause, the LA County class, outside the local ordinance, and a Virginia landlord with more than four units.
- `landlord, tenants, property, exemptionFacts, replyBy, preview`: For notice: the landlord's name and address, one to six tenants, the rental address, any exemption facts, a reply date, and preview for the free watermarked copy.

Outputs:

- answer: the most the rent may rise to on that date and the notice owed, and the verdict on a proposed rent in a sentence
- verdict and verdictWords: Within the cap; Over the cap; Maximum worked out; Exempt from the cap; No cap; notice rules only; Figure not published yet; No increase in the first year; Too soon after the last increase; Above the local rent standard
- cap: the percentage, the base it applies to, the increase, the new rent, the arithmetic and the window the figure is published for
- proposed: the new rent, its increase and percentage, and the amount over the cap
- notice: the days, the serve-by date, whether a notice already given is in time, and the rule
- reasons, notes and sources with the dates read; for notice, the paragraphs and the PDF with its SHA-256

**Every step in full (9) and the rules**

1. The state code picks the rule row, and a locality its local row. A state with no row is refused with the reason; Maryland is answered only for Montgomery County.
2. An exemption you name, or an age exemption worked out from builtDate (Oregon under 15 years, California within 15 years, Washington 12 or fewer years), takes the unit outside the cap; the notice rule still applies.
3. A local ordinance that covers the unit is used before the state cap. In a notice-only state (New York, Maine, Delaware and Virginia) no percentage is given.
4. The figure is the one published for the window the effective date falls in: California by CPI region for increases from August 1 to July 31, Oregon and Washington by calendar year, DC by Rent Control Year, New York City by the Rent Guidelines Board order for the lease start. An effective date outside every published window is refused as not published, not guessed.
5. The increase is the base rent times the percentage, rounded down to the cent, so the result is never above the limit. California and Washington measure from the lowest rent in the 12 months before; the others from the current rent.
6. Timing: no increase in the first year of the tenancy where the state says so, only one in 12 months, and in Washington not before the lease term ends.
7. A proposed rent above the most allowed is over the cap, with the amount over. In New York City outside rent stabilization, the Good Cause local rent standard is used, and a rent above it must be justified in the notice.
8. The notice owed is counted back from the effective date: tiered by the size of the increase in California (30 days up to 10%, 90 over), 90 days in Oregon and Washington, the first rent day more than 60 days after notice in DC, by tenure in New York (Real Prop. Law 226-c), and the longer of a local and a state rule.
9. The notice PDF is made only when no rule fails and the figure is published. Nothing in it is dated by the clock, so the same notice gives the same bytes.

**The rule rows.**

Every row was read on November 8, 2026 (rule version 2026.11.08), with the sentences each rule rests on copied word for word. Each row says how it was read: read on the state agency's page; read from an Internet Archive copy of the official page; read on the official site.

**Local ordinances.**

Local rows: City of Los Angeles, Unincorporated Los Angeles County, San Diego, New York City and Montgomery County, Maryland. Other cities and counties were not checked.

## Which edge cases does it handle?

**The edge cases (5)**

- A California increase needs the county; a county that is not in California is refused.
- A new rent below the current rent is a decrease, which no rule here limits, and is refused; so is a new rent given with a percentage.
- A notice dated after the effective date, or a base rent above the current rent, is refused naming the field.
- An Oregon notice dated in one year for an increase in the next is flagged when the increase is above the notice year's figure, since ORS 90.324 does not say which year governs.
- A week-to-week Oregon tenancy is outside the cap and needs 7 days' notice.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Oregon, $2,000 rent, increase on March 1, 2027: the most and the notice deadline**

Oregon, $2,000 rent, increase on March 1, 2027: the most and the notice deadline

| Result | Value |
| --- | --- |
| answer | For $2,000 rent in Oregon, the most it may rise for an increase taking effect March 1, 2027 is 10% ($200), to $2,200. Written notice: 90 days, served by December 1, 2026. Your $2,190 is within it. |
| verdict | Within the cap |
| law | ORS 90.323 and 90.324 |
| most the rent may be | $2,200 (10% of $2,000 = $200; $2,000 + $200 = $2,200) |
| figure in force | 10% for calendar year 2027 |
| written notice | 90 days, by December 1, 2026 (ORS 90.323) |

**The input**

```json
{
  "op": "check",
  "state": "OR",
  "rent": 2000,
  "newRent": 2190,
  "effectiveDate": "2027-03-01",
  "noticeDate": "2026-11-20"
}
```

**More worked examples (4)**

**Los Angeles County, California: $2,300 on $2,000 from January 1, 2027**

Los Angeles County, California: $2,300 on $2,000 from January 1, 2027

| Result | Value |
| --- | --- |
| answer | For $2,000 rent in Los Angeles County, California, the most it may rise for an increase taking effect January 1, 2027 is 8.7% ($174), to $2,174. Written notice: 90 days, served by October 3, 2026. Your $2,300 is $126 over it. |
| verdict | Over the cap |
| law | Civ. Code § 1947.12 (Tenant Protection Act) |
| most the rent may be | $2,174 (8.7% of $2,000 = $174; $2,000 + $174 = $2,174) |
| figure in force | 8.7% for increases taking effect August 1, 2026 to July 31, 2027 |
| written notice | 90 days, by October 3, 2026 (Civ. Code § 827) |
| over by | $126 |

**The input**

```json
{
  "op": "check",
  "state": "CA",
  "county": "Los Angeles",
  "rent": 2000,
  "newRent": 2300,
  "effectiveDate": "2027-01-01"
}
```

**District of Columbia, rent-controlled, $2,000 rent from March 1, 2027**

District of Columbia, rent-controlled, $2,000 rent from March 1, 2027

| Result | Value |
| --- | --- |
| answer | For $2,000 rent in the District of Columbia, the most it may rise for an increase taking effect March 1, 2027 is 4.1% ($82), to $2,082. Written notice: 60 days, served by December 30, 2026. |
| verdict | Maximum worked out |
| law | D.C. Code § 42-3502.08 |
| most the rent may be | $2,082 (4.1% of $2,000 = $82; $2,000 + $82 = $2,082) |
| figure in force | 4.1% for Rent Control Year 2026 |
| written notice | 60 days, by December 30, 2026 (D.C. Code § 42-3509.04(b)) |

**The input**

```json
{
  "op": "check",
  "state": "DC",
  "rent": 2000,
  "effectiveDate": "2027-03-01"
}
```

**A sample Oregon notice, 9.5% from March 1, 2027 (made-up names)**

A sample Oregon notice, 9.5% from March 1, 2027 (made-up names)

| Result | Value |
| --- | --- |
| answer | For $2,000 rent in Oregon, the most it may rise for an increase taking effect March 1, 2027 is 10% ($200), to $2,200. Written notice: 90 days, served by December 1, 2026. Your $2,190 is within it. |
| verdict | Within the cap |
| PDF | rent-increase-or-45-made-up-avenue-unit-2-portland-or-972-2027-03-01.pdf |

**The input**

```json
{
  "op": "notice",
  "state": "OR",
  "rent": 2000,
  "newRent": 2190,
  "effectiveDate": "2027-03-01",
  "noticeDate": "2026-11-20",
  "tenancyStart": "2023-06-01",
  "landlord": {
    "name": "Sample Landlord LLC (made up)",
    "address": "100 Example Street; Portland, OR 97201"
  },
  "tenants": [
    "Alex Sample"
  ],
  "property": "45 Made-Up Avenue, Unit 2, Portland, OR 97202"
}
```

**Raising $1,850 to $1,980: the percentage**

Raising $1,850 to $1,980: the percentage

| Result | Value |
| --- | --- |
| answer | Raising $1,850 to $1,980 is a 7.03% increase ($130 a month, $1,560 a year). |

**The input**

```json
{
  "op": "percent",
  "rent": 1850,
  "newRent": 1980
}
```

## How is it tested?

They work each state's cap and notice, the local ordinances, rounding, the refusals, the percentage calculator and the notice PDF (the same bytes every time, refused while over the cap or late).

**What its test suite asserts (3)**

- The 8 state rows and 5 local rows are pinned as read on 2026-11-08, with every other state listed as not covered, the published figures and windows, and each quote word for word.
- The BLS CPI changes reproduce the published percentages, and each state's cap, timing rules and notice are worked, with the local ordinances and rounding down to the cent.
- The refusals, the percentage calculator, the examples and the notice PDF (the same bytes every time, refused while over the cap or late, watermarked as a preview) are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Rent increase cap calculator and notice tool](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/).

## Questions

### Is there any AI in the rent increase cap calculator and notice answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the rent increase cap calculator and notice refuse to answer?

Figures are as published on the dates shown, for the windows shown; an increase taking effect outside a published window is refused, not guessed. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Rent increase cap calculator and notice tool](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/rent-increase-cap/  
Data as of: 2026-11-04
