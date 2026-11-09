# How rent late fees are checked: state statute method

The fee is checked against the statute row for the state, 22 rows in all, 17 of which set a number, plus Chicago's ordinance. Texas, for example, takes 12% of the rent in a building of 4 or fewer units and 10% above that as the limit, and only once rent is unpaid two full days after the due date. Not legal advice.

## What does the rent late fee checker and late notice compute?

Given a state, the rent and the due date, the tool gives the first day a late fee may be charged, the most the statute allows, and whether a fee the landlord charges is within it, with the sentence of the statute each rule rests on, quoted word for word with its source and the date it was read. It also makes a late rent notice PDF with the fee already checked. Covered: Arizona, California, Colorado, Connecticut, Delaware, District of Columbia, Hawaii, Iowa, Maine, Maryland, Massachusetts, Minnesota, Nevada, New Jersey, New Mexico, New York, North Carolina, Oregon, Tennessee, Texas, Virginia and Washington, and the city of Chicago. Every other state is refused rather than guessed. Not legal advice. We are not a law firm, and this tool does not review your lease or your case.

Operations (the op field):

- `rules`: Returns the statute row for one state, with its quotes, sources and the date read; for Illinois, the reason it is not covered and Chicago's row; with no state, every covered row and the list of states not covered. Free.
- `check`: Works out the first day a fee may be charged, the most allowed with the arithmetic, and, with a fee, a verdict: within the limit, over it, too early, not allowed without the lease term, no number in the statute, or the maximum only. Each reason carries its citation and quote.
- `notice`: Runs the check as of the notice date, with the fee set to the maximum unless one is given, and returns a late rent notice PDF. A fee that breaks the statute is refused; a preview is free, watermarked and shows what the check found.

Inputs:

- `state, city`: A two-letter code: AZ, CA, CO, CT, DE, DC, HI, IA, ME, MD, MA, MN, NV, NJ, NM, NY, NC, OR, TN, TX, VA, WA, or IL with city "chicago". Any other state is refused with the reason.
- `rent, period`: The rent for one period, in dollars, and month (the default) or week.
- `dueDate, paidDate`: The day rent was due, and the day it was paid or the fee is being charged. Dates are written like 2026-11-01.
- `fee, inLease`: The late fee charged, in dollars (the total, with any daily fees), and whether the written lease has the late-fee term the statute requires.
- `units, pastDue, tenantShare`: Dwelling units in the building (Texas sets its limit by it); the rent still unpaid when less than the full rent; and for subsidized rent, the part the tenant pays.
- `noLocalOffice, ownerOccupied`: Delaware: the landlord has no office in the county where rent can be paid. Chicago: the owner lives in the building.
- `noticeDate, landlord, tenants, tenantAddress, property, payBy, payTo, preview`: For notice: the date on it, the landlord's name and address, one to six tenants, the addresses, the date and way to pay, and preview for the free watermarked copy.

Outputs:

- answer: the most allowed and from which day, and the verdict on the fee in a sentence
- verdict and verdictWords: within, over, too-early, not-in-lease, no-number or max-only
- firstFeeDate, maxFee (the amount, the statute's words and the arithmetic), fee and over
- reasons: each rule (when, lease, amount, and any limit on repeat fees, subsidies, eviction, written notice or penalties) with its citation and quote
- notes, quality (how the statute text was read) and sources with the date read
- notice: the paragraphs, the fee and the total due, and the PDF with its SHA-256

## How is it calculated, step by step?

1. The state code picks the statute row. Illinois needs city "chicago" for the Chicago ordinance; a state with no row is refused with the reason and the list covered.
2. Weekly rent is refused where the limit is written per month (Delaware, Iowa, Maine, New Jersey, New York and Chicago, Illinois); Maryland and North Carolina have their own weekly limit.
3. Where the statute works the fee out on the tenant's share of subsidized rent (Colorado, Connecticut, District of Columbia, Minnesota and North Carolina), the share is used; elsewhere the full rent is used and the answer says so. The past-due amount defaults to the rent.
4. The first fee day is the due date plus the waiting period the statute sets: New Jersey counts five business days for rent due on the first, skipping weekends and federal holidays (5 U.S.C. 6103, with observed days); Delaware adds three days when the landlord keeps no office in the county; Tennessee counts the due date itself and moves a Sunday last grace day on by one day; Connecticut has a shorter period for a one-week tenancy.
5. Rent paid before the first fee day makes any fee too early. Where the statute needs the fee in the lease, a lease without it means no fee; a lease not stated is marked to check.
6. The limit is worked out the way the statute writes it: a percent of the rent or of the past-due rent, a flat sum, the lesser or greater of two, a daily amount up to a monthly total (Iowa by rent tier, Connecticut), Texas by building size, Chicago's $10 plus 5% above $500, and Oregon's 5% for each five-day period up to the end of the rental period. Percentages are rounded down to the cent, so the figure is never above the limit.
7. Where the statute sets no number (a "reasonable" fee, the general rule on agreed damages, or a waiting period only), no amount is given and the answer says a court decides.
8. The verdict is, in order: not allowed without the lease term, too early, over the limit, no number, the maximum only (no fee given), or within the limit.
9. The notice uses the maximum fee unless one is given, adds it to the rent unpaid for the total, and is made only when no rule fails. Its footer names the statute and the date read. Nothing in it is dated by the clock, so the same notice gives the same bytes.

**The statute rows.**

Each covered state has one row, read on November 8, 2026, with every sentence a rule rests on copied word for word and checked against the saved text. Kinds: Cap set by statute; Waiting period only, no amount; "Reasonable" fee, no number; General contract rule, no number.

Each row says how it was read: read on the official site; read from an Internet Archive copy of the official page; read from a Public.Law or Cornell copy of the official text; read from an Internet Archive copy of a Justia page. Rows read from a copy say so in the answer.

**Chicago.**

The Chicago figure comes from the City's official summary of the Residential Landlord and Tenant Ordinance; owner-occupied buildings of six or fewer units are outside it and refused. Illinois state law and other cities were not read.

## Which edge cases does it handle?

- A Colorado rent paid on day 5 is too early for any fee: the first fee day is seven calendar days late.
- Texas needs the number of units: 4 or fewer units allows 12%, more than 4 allows 10%.
- A New Jersey grace period that crosses a federal holiday moves the first fee day a business day later; a New Jersey State holiday was not read.
- Iowa, Connecticut and Oregon limits grow with the days late; with no payment date the most they can reach is given.
- A paid date before the due date, a past-due amount above the rent, or a tenant share above the rent is refused.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Texas, $1,500 rent in a 4-unit building: a $200 late fee is over the limit**

```json
{
  "op": "check",
  "state": "TX",
  "rent": 1500,
  "units": 4,
  "dueDate": "2026-11-01",
  "paidDate": "2026-11-05",
  "fee": 200,
  "inLease": true
}
```

Texas, $1,500 rent in a 4-unit building: a $200 late fee is over the limit

| Result | Value |
| --- | --- |
| answer | For $1,500 monthly rent in Texas (a building of 4 units), the most a landlord may charge as a late fee is $180 as of November 5, 2026, and only from Wednesday, November 4, 2026 for rent due November 1, 2026 (Tex. Prop. Code § 92.019). Your $200 is $20 over it. |
| verdict | Over the limit |
| first fee day | November 4, 2026 |
| most allowed | $180 (12% of $1,500 (building of 4 units, 4 or fewer) = $180) |
| law | Tex. Prop. Code § 92.019 |
| over by | $20 |

**Colorado, $1,500 rent paid on day 5: too early for any late fee**

```json
{
  "op": "check",
  "state": "CO",
  "rent": 1500,
  "dueDate": "2026-11-01",
  "paidDate": "2026-11-06",
  "fee": 75
}
```

Colorado, $1,500 rent paid on day 5: too early for any late fee

| Result | Value |
| --- | --- |
| answer | For $1,500 monthly rent in Colorado, the most a landlord may charge as a late fee is $75, and only from Sunday, November 8, 2026 for rent due November 1, 2026 (Colo. Rev. Stat. § 38-12-105). Rent paid on November 6, 2026 is not late enough for a fee. |
| verdict | Too early for a late fee |
| first fee day | November 8, 2026 |
| most allowed | $75 (the greater of $50 and 5% of $1,500 = $75: $75) |
| law | Colo. Rev. Stat. § 38-12-105 |

**Chicago, $1,800 rent: the ordinance figure of $10 plus 5% above $500**

```json
{
  "op": "check",
  "state": "IL",
  "city": "chicago",
  "rent": 1800,
  "dueDate": "2026-11-01"
}
```

Chicago, $1,800 rent: the ordinance figure of $10 plus 5% above $500

| Result | Value |
| --- | --- |
| answer | For $1,800 monthly rent in Chicago, the most a landlord may charge as a late fee is $75, and only from Monday, November 2, 2026 for rent due November 1, 2026 (Chicago Municipal Code § 5-12-140(h) (RLTO)). |
| verdict | Maximum worked out |
| first fee day | November 2, 2026 |
| most allowed | $75 ($10 + 5% of $1,300 (the rent above $500) = $75) |
| law | Chicago Municipal Code § 5-12-140(h) (RLTO) |

**A sample Texas late notice with the fee checked (made-up names)**

```json
{
  "op": "notice",
  "state": "TX",
  "rent": 1500,
  "units": 4,
  "dueDate": "2026-11-01",
  "noticeDate": "2026-11-05",
  "inLease": true,
  "landlord": {
    "name": "Sample Landlord LLC (made up)",
    "address": "100 Example Street; Austin, TX 78701"
  },
  "tenants": [
    "Alex Sample"
  ],
  "property": "45 Made-Up Avenue, Unit 2, Austin, TX 78702",
  "payBy": "2026-11-10",
  "payTo": "the tenant portal or a check to Sample Landlord LLC"
}
```

A sample Texas late notice with the fee checked (made-up names)

| Result | Value |
| --- | --- |
| answer | For $1,500 monthly rent in Texas (a building of 4 units), the most a landlord may charge as a late fee is $180 as of November 5, 2026, and only from Wednesday, November 4, 2026 for rent due November 1, 2026 (Tex. Prop. Code § 92.019). Your $180 is within the limit. |
| late fee | $180 |
| total due | $1,680 |
| PDF | late-notice-tx-45-made-up-avenue-unit-2-austin-tx-78702-2026-11-01.pdf |

## What does it not do?

- City and county ordinances other than Chicago's, and federal subsidy program rules, were not checked.
- Where a statute asks for a "reasonable" fee or sets no number, a court decides; the tool does not. It cannot judge the Texas damages rule above 12% or 10%.
- A later amendment can change an answer; each row is as of its reading date. It does not review a lease or a case and is not legal advice.

## Where does the data come from, and how fresh is it?

Every statute row was read on November 8, 2026 (rule version 2026-11-08). The official pages are checked once a day for changes; a change means a person reads the row again before the data file is edited, with the tests that pin each quote.

- [Arizona: Ariz. Rev. Stat. § 33-1368 (read November 8, 2026)](https://www.azleg.gov/ars/33/01368.htm)
- [California: Cal. Civ. Code § 1671 (read November 8, 2026, from Public.Law copy of the official text)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1671)
- [Colorado: Colo. Rev. Stat. § 38-12-105 (read November 8, 2026, from Public.Law copy of the official 2024 C.R.S. (copy dated May 26, 2025))](https://leg.colorado.gov/sites/default/files/images/olls/crs2024-title-38.pdf)
- [Connecticut: Conn. Gen. Stat. § 47a-15a (read November 8, 2026, from Internet Archive copy of the official General Statutes page, saved October 9, 2026)](https://www.cga.ct.gov/current/pub/chap_830.htm)
- [Delaware: 25 Del. C. § 5501 (read November 8, 2026)](https://delcode.delaware.gov/title25/c055/index.html)
- [District of Columbia: D.C. Code § 42-3505.31 (read November 8, 2026)](https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.31)
- [Hawaii: Haw. Rev. Stat. § 521-21 (read November 8, 2026, from Internet Archive copy of the official HRS page, saved April 3, 2025)](https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0021.htm)
- [Iowa: Iowa Code § 562A.9 (read November 8, 2026)](https://www.legis.iowa.gov/docs/code/562A.9.pdf)
- [Maine: 14 M.R.S. § 6028 (read November 8, 2026)](https://legislature.maine.gov/statutes/14/title14sec6028.html)
- [Maryland: Md. Code, Real Prop. § 8-208 (read November 8, 2026)](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-208&enactments=false)
- [Massachusetts: Mass. Gen. Laws ch. 186, § 15B (read November 8, 2026, from Internet Archive copy of the official General Laws page, saved October 26, 2026)](https://malegislature.gov/Laws/GeneralLaws/PartII/TitleI/Chapter186/Section15B)
- [Minnesota: Minn. Stat. § 504B.177 (read November 8, 2026)](https://www.revisor.mn.gov/statutes/cite/504B.177)
- [Nevada: Nev. Rev. Stat. § 118A.210 (read November 8, 2026, from Public.Law copy of the official NRS (copy dated May 26, 2025))](https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec210)
- [New Jersey: N.J. Stat. § 2A:42-6.1 (read November 8, 2026, from Internet Archive copy (saved June 15, 2025) of Justia's 2024 New Jersey Revised Statutes)](https://lis.njleg.state.nj.us/nxt/gateway.dll?f=templates&fn=default.htm&vid=Publish:10.1048/Enu)
- [New Jersey: 5 U.S.C. § 6103(a) (read November 8, 2026)](https://www.law.cornell.edu/uscode/text/5/6103)
- [New Mexico: N.M. Stat. § 47-8-15 (read November 8, 2026, from Internet Archive copy (saved January 4, 2026) of Justia's 2024 New Mexico Statutes)](https://nmonesource.com/nmos/nmsa/en/item/4408/index.do)
- [New York: N.Y. Real Prop. Law § 238-a (read November 8, 2026, from Internet Archive copy of the official NY Senate page (revision of October 17, 2025), saved February 13, 2026)](https://www.nysenate.gov/legislation/laws/RPP/238-A)
- [North Carolina: N.C. Gen. Stat. § 42-46 (read November 8, 2026, from Internet Archive copy of the official General Statutes page, saved July 28, 2026)](https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-46.html)
- [Oregon: Or. Rev. Stat. § 90.260 (read November 8, 2026, from Internet Archive copy of the official ORS chapter 90 page, saved September 23, 2026)](https://www.oregonlegislature.gov/bills_laws/ors/ors090.html)
- [Tennessee: Tenn. Code Ann. § 66-28-201 (read November 8, 2026, from Internet Archive copy (saved July 10, 2025) of Justia's 2024 Tennessee Code)](https://law.justia.com/codes/tennessee/title-66/chapter-28/part-2/section-66-28-201/)
- [Texas: Tex. Prop. Code § 92.019 (read November 8, 2026, from Public.Law copy of the official text (copy dated May 26, 2025))](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.92.htm#92.019)
- [Virginia: Va. Code § 55.1-1204 (read November 8, 2026)](https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1204/)
- [Washington: Rev. Code Wash. § 59.18.170 (read November 8, 2026)](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.170)
- [Chicago, Illinois: Chicago RLTO summary (Mun. Code ch. 5-12) (read November 8, 2026, from Internet Archive copy of the City of Chicago summary PDF, saved March 25, 2025)](https://www.chicago.gov/content/dam/city/depts/doh/RLTO/RLTO%20Summary_2023_EN_FINAL.pdf)

Every statute row was read on November 8, 2026 (rule version 2026-11-08). The official pages are checked once a day for changes; a change means a person reads the row again before the data file is edited, with the tests that pin each quote.

Rent late fee checker and late notice: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Arizona: Ariz. Rev. Stat. § 33-1368](https://www.azleg.gov/ars/33/01368.htm) | read on the official site | 2026-11-08 |
| [California: Cal. Civ. Code § 1671](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1671) | Public.Law copy of the official text | 2026-11-08 |
| [Colorado: Colo. Rev. Stat. § 38-12-105](https://leg.colorado.gov/sites/default/files/images/olls/crs2024-title-38.pdf) | Public.Law copy of the official 2024 C.R.S. (copy dated May 26, 2025) | 2026-11-08 |
| [Connecticut: Conn. Gen. Stat. § 47a-15a](https://www.cga.ct.gov/current/pub/chap_830.htm) | Internet Archive copy of the official General Statutes page, saved October 9, 2026 | 2026-11-08 |
| [Delaware: 25 Del. C. § 5501](https://delcode.delaware.gov/title25/c055/index.html) | read on the official site | 2026-11-08 |
| [District of Columbia: D.C. Code § 42-3505.31](https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.31) | read on the official site | 2026-11-08 |
| [Hawaii: Haw. Rev. Stat. § 521-21](https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0021.htm) | Internet Archive copy of the official HRS page, saved April 3, 2025 | 2026-11-08 |
| [Iowa: Iowa Code § 562A.9](https://www.legis.iowa.gov/docs/code/562A.9.pdf) | read on the official site | 2026-11-08 |
| [Maine: 14 M.R.S. § 6028](https://legislature.maine.gov/statutes/14/title14sec6028.html) | read on the official site | 2026-11-08 |
| [Maryland: Md. Code, Real Prop. § 8-208](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-208&enactments=false) | read on the official site | 2026-11-08 |
| [Massachusetts: Mass. Gen. Laws ch. 186, § 15B](https://malegislature.gov/Laws/GeneralLaws/PartII/TitleI/Chapter186/Section15B) | Internet Archive copy of the official General Laws page, saved October 26, 2026 | 2026-11-08 |
| [Minnesota: Minn. Stat. § 504B.177](https://www.revisor.mn.gov/statutes/cite/504B.177) | read on the official site | 2026-11-08 |
| [Nevada: Nev. Rev. Stat. § 118A.210](https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec210) | Public.Law copy of the official NRS (copy dated May 26, 2025) | 2026-11-08 |
| [New Jersey: N.J. Stat. § 2A:42-6.1](https://lis.njleg.state.nj.us/nxt/gateway.dll?f=templates&fn=default.htm&vid=Publish:10.1048/Enu) | Internet Archive copy (saved June 15, 2025) of Justia's 2024 New Jersey Revised Statutes | 2026-11-08 |
| [New Jersey: 5 U.S.C. § 6103(a)](https://www.law.cornell.edu/uscode/text/5/6103) | read from an Internet Archive copy of a Justia page | 2026-11-08 |
| [New Mexico: N.M. Stat. § 47-8-15](https://nmonesource.com/nmos/nmsa/en/item/4408/index.do) | Internet Archive copy (saved January 4, 2026) of Justia's 2024 New Mexico Statutes | 2026-11-08 |
| [New York: N.Y. Real Prop. Law § 238-a](https://www.nysenate.gov/legislation/laws/RPP/238-A) | Internet Archive copy of the official NY Senate page (revision of October 17, 2025), saved February 13, 2026 | 2026-11-08 |
| [North Carolina: N.C. Gen. Stat. § 42-46](https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-46.html) | Internet Archive copy of the official General Statutes page, saved July 28, 2026 | 2026-11-08 |
| [Oregon: Or. Rev. Stat. § 90.260](https://www.oregonlegislature.gov/bills_laws/ors/ors090.html) | Internet Archive copy of the official ORS chapter 90 page, saved September 23, 2026 | 2026-11-08 |
| [Tennessee: Tenn. Code Ann. § 66-28-201](https://law.justia.com/codes/tennessee/title-66/chapter-28/part-2/section-66-28-201/) | Internet Archive copy (saved July 10, 2025) of Justia's 2024 Tennessee Code | 2026-11-08 |
| [Texas: Tex. Prop. Code § 92.019](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.92.htm#92.019) | Public.Law copy of the official text (copy dated May 26, 2025) | 2026-11-08 |
| [Virginia: Va. Code § 55.1-1204](https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1204/) | read on the official site | 2026-11-08 |
| [Washington: Rev. Code Wash. § 59.18.170](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.170) | read on the official site | 2026-11-08 |
| [Chicago, Illinois: Chicago RLTO summary (Mun. Code ch. 5-12)](https://www.chicago.gov/content/dam/city/depts/doh/RLTO/RLTO%20Summary_2023_EN_FINAL.pdf) | Internet Archive copy of the City of Chicago summary PDF, saved March 25, 2025 | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Each quote is pinned word for word. The tests work each formula on $1,500 rent as the statute writes it, the limits that grow with the days, the first fee day in each state (Tennessee's Sunday, New Jersey's business days), every verdict, subsidized rent, the refusals, and the Texas notice, refused while the fee breaks the statute.

What its test suite asserts:

- Every statute quote of the 22 rows and Chicago's ordinance is pinned word for word as read on 2026-11-08, and every other state is listed as not covered.
- Each formula is worked on $1,500 rent as the statute writes it, with the limits that grow with the days and the first fee day in each state.
- Every verdict, subsidized rent, the refusals and the notice (refused while the fee breaks the statute, watermarked as a preview) are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Rent late fee checker and late notice tool](https://krishnachagti-sudo.github.io/toll-preview/late-fee-checker/).

## Questions

### Is there any AI in the rent late fee checker and late notice answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the rent late fee checker and late notice refuse to answer?

City and county ordinances other than Chicago's, and federal subsidy program rules, were not checked. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Rent late fee checker and late notice tool](https://krishnachagti-sudo.github.io/toll-preview/late-fee-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/late-fee-checker/  
Data as of: 2026-11-04
