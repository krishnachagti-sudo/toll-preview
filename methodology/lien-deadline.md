# How lien deadlines are worked out: state statute method

Each date comes from the state's own statute text, read on November 8, 2026: 10 jurisdictions plus the federal Miller Act are computed, and the other 41 are listed as not covered with the reason. Arizona, for example, gives a subcontractor 20 days after first furnishing for the preliminary notice, 120 days after completion to record the lien and six months after recording to sue. Not legal advice.

## How does it work?

1. The state code picks the row. The 10 covered jurisdictions and the federal Miller Act have rules; every other code returns "not covered" with the reason and no dates.
2. Some roles get no lien at all and are told so: in Arizona, anyone without a written contract directly with an owner-occupant on the owner's dwelling (A.R.S. 33-1002(B)); in the District of Columbia, sub-subcontractors and suppliers to a subcontractor, whom the D.C. Code read does not name; and on a federal project, the prime contractor, who furnishes the payment bond.
3. The steps are picked by role and project, and by the state's own tests where it has them: Texas and Kansas "residential" definitions, Texas retainage, the Minnesota large-project exception, and notices that apply only to some roles (for example, Florida's notice to owner is not for the prime or for laborers).
4. The lien date is worked out first, then the suit date, which counts from the day the lien was recorded. With no recorded date, the suit is counted from the last day to record and the answer says so; Texas counts the suit from the last day to file the affidavit, and the Florida prime contractor's final payment affidavit counts back 5 days from the suit date.
5. Dates are counted the way each statute writes them: days; calendar months, landing on the same day of the month or the last day of a shorter month; years; the 15th day of the second, third or fourth month after a month (Texas); 90 days after the last day of the month of last work (Virginia); business days that skip weekends and US federal holidays (the District of Columbia copy); and the Washington look-back, where the date shown is the last day the notice still covers your first day.

> Steps 6 to 10, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/lien-deadline/#what) below.

## What does it not cover?

- States whose own statute site we could not read are listed as not covered, not guessed. Public projects are bond claims, not liens; only the federal Miller Act is computed, and state public project bond statutes are not.
- Not modeled: the Virginia lien agent rule (43-4.01) and the Kansas 60-1103a warning statement. Texas state holidays and District holidays were not read; only US federal holidays are skipped.
- Deadlines are strict: a lien recorded one day late is usually lost. Act before the date shown, and earlier when it falls on a weekend or holiday. For disputes, large amounts or anything unusual about your job, ask a construction attorney licensed in the project's state.
- A later amendment can change a date; each rule is as of its reading date. It does not review a contract or a case and is not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 35 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every rule was read on November 8, 2026 from the state's own statute site (data version lien-statutes-read-2026-11-08). The 35 official pages are checked once a day for changes; a change means a person reads the section again, refreshes its snapshot and rebuilds the rule before the data file is edited.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): Every quote and every notice form line is checked word for word against its dated snapshot.

- [A.R.S. 33-992.01, Preliminary twenty day notice](https://www.azleg.gov/ars/33/00992-01.htm), Arizona State Legislature (azleg.gov), read 2026-11-08
- [A.R.S. 33-992.02, Proof of mailing of preliminary twenty day notice](https://www.azleg.gov/ars/33/00992-02.htm), Arizona State Legislature (azleg.gov), read 2026-11-08
- [A.R.S. 33-993, Procedure to perfect lien](https://www.azleg.gov/ars/33/00993.htm), Arizona State Legislature (azleg.gov), read 2026-11-08
- [A.R.S. 33-998, Limitation of action to foreclose lien](https://www.azleg.gov/ars/33/00998.htm), Arizona State Legislature (azleg.gov), read 2026-11-08
- [A.R.S. 33-1002, Owner-occupied dwelling](https://www.azleg.gov/ars/33/01002.htm), Arizona State Legislature (azleg.gov), read 2026-11-08
- [Texas Property Code chapter 53, Mechanic's, Contractor's, or Materialman's Lien](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.53.htm), Texas Legislative Council (statutes.capitol.texas.gov), read 2026-11-08
- [Fla. Stat. 713.06, Liens of persons not in privity](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0713/Sections/0713.06.html), The Florida Legislature (leg.state.fl.us), read 2026-11-08
- [Fla. Stat. 713.08, Claim of lien](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0713/Sections/0713.08.html), The Florida Legislature (leg.state.fl.us), read 2026-11-08
- [Fla. Stat. 713.22, Duration of lien](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0713/Sections/0713.22.html), The Florida Legislature (leg.state.fl.us), read 2026-11-08
- [RCW 60.04.031, Notices](https://app.leg.wa.gov/RCW/default.aspx?cite=60.04.031), Washington State Legislature (app.leg.wa.gov), read 2026-11-08
- [RCW 60.04.091, Recording, time, contents of lien](https://app.leg.wa.gov/RCW/default.aspx?cite=60.04.091), Washington State Legislature (app.leg.wa.gov), read 2026-11-08
- [RCW 60.04.141, Lien duration](https://app.leg.wa.gov/RCW/default.aspx?cite=60.04.141), Washington State Legislature (app.leg.wa.gov), read 2026-11-08
- [Code of Virginia 43-4, Perfection of lien by general contractor](https://law.lis.virginia.gov/vacode/title43/chapter1/section43-4/), Virginia General Assembly (law.lis.virginia.gov), read 2026-11-08
- [Code of Virginia 43-7, Perfection of lien by subcontractor](https://law.lis.virginia.gov/vacode/title43/chapter1/section43-7/), Virginia General Assembly (law.lis.virginia.gov), read 2026-11-08
- [Code of Virginia 43-9, Perfection of lien by person furnishing for a subcontractor](https://law.lis.virginia.gov/vacode/title43/chapter1/section43-9/), Virginia General Assembly (law.lis.virginia.gov), read 2026-11-08
- [Code of Virginia 43-17, Limitation on suit to enforce lien](https://law.lis.virginia.gov/vacode/title43/chapter1/section43-17/), Virginia General Assembly (law.lis.virginia.gov), read 2026-11-08
- [Md. Code, Real Property 9-101, Definitions](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=9-101&enactments=false), Maryland General Assembly (mgaleg.maryland.gov), read 2026-11-08
- [Md. Code, Real Property 9-104, Notice by subcontractor](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=9-104&enactments=false), Maryland General Assembly (mgaleg.maryland.gov), read 2026-11-08
- [Md. Code, Real Property 9-105, Petition to establish lien](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=9-105&enactments=false), Maryland General Assembly (mgaleg.maryland.gov), read 2026-11-08
- [Md. Code, Real Property 9-109, Enforcement](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=9-109&enactments=false), Maryland General Assembly (mgaleg.maryland.gov), read 2026-11-08
- [Minn. Stat. 514.011, Notices](https://www.revisor.mn.gov/statutes/cite/514.011), Minnesota Office of the Revisor of Statutes (revisor.mn.gov), read 2026-11-08
- [Minn. Stat. 514.08, Lien statement](https://www.revisor.mn.gov/statutes/cite/514.08), Minnesota Office of the Revisor of Statutes (revisor.mn.gov), read 2026-11-08
- [Minn. Stat. 514.12, Enforcement action](https://www.revisor.mn.gov/statutes/cite/514.12), Minnesota Office of the Revisor of Statutes (revisor.mn.gov), read 2026-11-08
- [K.S.A. 60-1102, Lien statement](https://www.ksrevisor.gov/statutes/chapters/ch60/060_011_0002.html), Kansas Office of Revisor of Statutes (ksrevisor.gov), read 2026-11-08
- [K.S.A. 60-1103, Liens of suppliers and subcontractors](https://www.ksrevisor.gov/statutes/chapters/ch60/060_011_0003.html), Kansas Office of Revisor of Statutes (ksrevisor.gov), read 2026-11-08
- [K.S.A. 60-1105, Action to foreclose](https://www.ksrevisor.gov/statutes/chapters/ch60/060_011_0005.html), Kansas Office of Revisor of Statutes (ksrevisor.gov), read 2026-11-08
- [D.C. Code 40-301.01, Lien of contractor](https://code.dccouncil.gov/us/dc/council/code/sections/40-301.01), Council of the District of Columbia (code.dccouncil.gov), read 2026-11-08
- [D.C. Code 40-301.02, Notice of intent](https://code.dccouncil.gov/us/dc/council/code/sections/40-301.02), Council of the District of Columbia (code.dccouncil.gov), read 2026-11-08
- [D.C. Code 40-303.01, Subcontractors, materialmen and laborers](https://code.dccouncil.gov/us/dc/council/code/sections/40-303.01), Council of the District of Columbia (code.dccouncil.gov), read 2026-11-08
- [D.C. Code 40-303.13, Suit to enforce](https://code.dccouncil.gov/us/dc/council/code/sections/40-303.13), Council of the District of Columbia (code.dccouncil.gov), read 2026-11-08
- [Mont. Code 71-3-531, Notice of right to claim lien](https://mca.legmt.gov/bills/mca/title_0710/chapter_0030/part_0050/section_0310/0710-0030-0050-0310.html), Montana Legislature (mca.legmt.gov), read 2026-11-08
- [Mont. Code 71-3-533, Notice of completion](https://mca.legmt.gov/bills/mca/title_0710/chapter_0030/part_0050/section_0330/0710-0030-0050-0330.html), Montana Legislature (mca.legmt.gov), read 2026-11-08
- [Mont. Code 71-3-535, Attachment of lien, filing](https://mca.legmt.gov/bills/mca/title_0710/chapter_0030/part_0050/section_0350/0710-0030-0050-0350.html), Montana Legislature (mca.legmt.gov), read 2026-11-08
- [Mont. Code 71-3-562, Limitation on actions](https://mca.legmt.gov/bills/mca/title_0710/chapter_0030/part_0050/section_0620/0710-0030-0050-0620.html), Montana Legislature (mca.legmt.gov), read 2026-11-08
- [40 U.S.C. 3133, Rights of persons furnishing labor or material (Miller Act)](https://www.govinfo.gov/content/pkg/USCODE-2023-title40/html/USCODE-2023-title40-subtitleII-partA-chap31-subchapIII-sec3133.htm), U.S. Government Publishing Office (govinfo.gov), United States Code 2023 edition, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the lien deadline calculator compute?

Given a state, your role on the job, the kind of project and your furnishing and completion dates, the tool gives the last day to send the preliminary notice, record the lien and sue to enforce it, each with the statute sentence it rests on, quoted word for word from the state's own statute site with the date it was read.

**In detail: operations, inputs and outputs**

It also says what a late notice still protects, works out the Texas notice for each month of work and the federal Miller Act bond claim dates, and fills in the state's statutory notice as a PDF with a proof-of-service record. Covered: Arizona, Texas, Florida, Washington, Virginia, Maryland, Minnesota, Kansas, District of Columbia and Montana, and federal projects under the Miller Act. States whose own statute site we could not read are listed as not covered, not guessed. Not legal advice and not a law firm. Dates are worked out from each state's own statute text, quoted with the date we read it.

Operations (the op field):

- `deadlines`: Works out every step for one job (notice, lien, suit and any copy or affidavit step the statute sets), with each date, the rule in words, the citation and the quotes, plus what a late notice still protects and a calendar file of the dates.
- `batch`: Runs the same deadlines for up to 500 jobs in one call and returns one row per job (notice, lien and suit dates, the citations, any missing dates or the error) and the same rows as a CSV.
- `rules`: With a state, returns that state's steps in words for a role and project (subcontractor and commercial unless given), its notes and sources, or the reason it is not covered. With no state, lists all 52 codes and which of them are covered.
- `notice`: Fills in the state's statutory preliminary notice (7 forms) with the parties and the computed last day to serve it, and returns the PDF with a service record page, the blanks left and a SHA-256 of the filled text. Refused where no form was read, the state is not covered or your role sends no notice.

Inputs:

- `state`: A two-letter code, DC, or US for a federal project. Computed: AZ, TX, FL, WA, VA, MD, MN, KS, DC and MT and US. Any other code is answered as not covered, with the reason.
- `role`: One of prime (original (prime) contractor), sub (subcontractor), sub-sub (sub-subcontractor), supplier-prime (supplier to the prime contractor), supplier-sub (supplier to a subcontractor), laborer (laborer paid wages).
- `project`: One of commercial (commercial (or anything other than a home)), new-home (new home), home-improvement (repair or remodel of an existing home).
- `ownerOccupied, largeProject, retainage`: The owner lives in the home (defaults to true for the two home projects); Minnesota: more than four family units or nonresidential work of more than 5,000 usable square feet; Texas: your contract has retainage.
- `agreed, firstFurnish, lastFurnish, ownContractEnd, completion, noticeOfCompletion, recorded`: The dates the rules count from: the day the work was agreed (Minnesota contractor notice), your first and last day of work or delivery, the end of your own contract (Texas retainage), project completion, a recorded notice of completion (Arizona, Montana) and the day your lien was recorded. Dates are written like 2026-03-03.
- `noticeSent, asOf, label`: The day you sent the preliminary notice (to check whether it was late), today for a days-left count, and a job name for the calendar file.
- `rows`: For batch: one to 500 jobs, each with the fields above.
- `notice, forMonth, parties`: For notice: "notice" (the state's preliminary notice) or "retainage" (the Texas retainage notice), the Texas month of work, and the parties: claimant name and the property, plus owner, contractor, lender, description, amount and the rest the form asks for.

Outputs:

- answer: the notice, lien and suit dates for this job in one sentence, with the citations
- steps: each step's name, rule, citation, quotes with source and read date, due date, the statutory date, the weekday, and any move, weekend flag, assumption or missing date
- lateNotice: whether the notice was in time and, if late, from which day it still protects or that it is fatal
- needs, notes, weekendRule, sources and disclaimers
- ics: a calendar file with one all-day event per due date (deadlines)
- rows, answered and csv (batch); coverage or the state's rule rows (rules)
- notice: the form, its due date, blanks left to fill by hand, any late warning, the document hash, and the PDF with its pages, size and SHA-256

**Every step in full (10) and the rules**

1. The state code picks the row. The 10 covered jurisdictions and the federal Miller Act have rules; every other code returns "not covered" with the reason and no dates.
2. Some roles get no lien at all and are told so: in Arizona, anyone without a written contract directly with an owner-occupant on the owner's dwelling (A.R.S. 33-1002(B)); in the District of Columbia, sub-subcontractors and suppliers to a subcontractor, whom the D.C. Code read does not name; and on a federal project, the prime contractor, who furnishes the payment bond.
3. The steps are picked by role and project, and by the state's own tests where it has them: Texas and Kansas "residential" definitions, Texas retainage, the Minnesota large-project exception, and notices that apply only to some roles (for example, Florida's notice to owner is not for the prime or for laborers).
4. The lien date is worked out first, then the suit date, which counts from the day the lien was recorded. With no recorded date, the suit is counted from the last day to record and the answer says so; Texas counts the suit from the last day to file the affidavit, and the Florida prime contractor's final payment affidavit counts back 5 days from the suit date.
5. Dates are counted the way each statute writes them: days; calendar months, landing on the same day of the month or the last day of a shorter month; years; the 15th day of the second, third or fourth month after a month (Texas); 90 days after the last day of the month of last work (Virginia); business days that skip weekends and US federal holidays (the District of Columbia copy); and the Washington look-back, where the date shown is the last day the notice still covers your first day.
6. Where a statute says "whichever is earlier" or "later" and one date is missing, the date from the side given is shown and marked as possibly earlier or later. A date the rule needs and you did not give is named, not guessed.
7. Weekends and holidays: Texas moves a deadline on a Saturday, Sunday or legal holiday to the next day that is none of these (53.003(e)), skipping US federal holidays (5 U.S.C. 6103). Every other text read does not move it, so the statutory date is kept and flagged with the business day before it.
8. A notice sent after its date is checked against the statute: Arizona and Montana count it for what was furnished in the 20 days before it; Washington for what was supplied after 60 days before it (10 days on a new single-family home); Florida treats a late notice as a complete defense; Texas loses the months whose notice day has passed and keeps the open ones.
9. With an as-of date, each due date says how many days are left, that today is the last day, or how many days ago it passed; for Texas the first open month leads and the missed months are named.
10. The notice is the statute's own form words with your details filled in and blanks left where nothing was given. A service record page shows the last day to serve, who to serve and how, where the words were copied from, the notice id and the SHA-256 of the filled text. Nothing is dated by the clock, so the same input gives the same bytes.

**The statute rows.**

Every rule is quoted from the state's own statute site, read on November 8, 2026 (data version lien-statutes-read-2026-11-08), and kept as a text snapshot; the tests check each quote word for word against its snapshot. Each answer carries the citation of the subsection it rests on.

The federal row is Federal project (Miller Act): Federal projects carry no mechanics' lien: the claim is against the prime contractor's payment bond. State public projects have their own bond statutes, which this tool does not compute.

**The notice forms.**

The forms filled in are the statutory ones: Arizona Preliminary Twenty Day Lien Notice (A.R.S. 33-992.01(D)), Notice to Owner (Fla. Stat. 713.06(2)(c)), Notice of Claim for Unpaid Labor or Materials (Tex. Prop. Code 53.056(a-2)), Notice of Claim for Unpaid Retainage (Tex. Prop. Code 53.057(a-2)), Notice to Owner (RCW 60.04.031(4)), Notice to Owner or Owner's Agent of Intention to Claim a Lien (Md. Code, Real Prop. 9-104(b)) and Pre-lien notice to owner (Minn. Stat. 514.011, subd. 2(a)). Virginia, Kansas, District of Columbia, Montana and the Miller Act have no form read, so no notice PDF is made for them; their dates are still given.

**Not covered.**

Blocked (the state's own statute site refused our requests): AK, CA, CO, HI, NC, NV, NY and WV (8). Unreachable (the site did not answer from our network): AR, CT, ID, IL, LA, MA, MI, MO, NE, NH, NJ, OH, OR, RI, UT, VT, WI and WY (18). No official text we can read and cite: GA, MS and TN (3). Not yet read into checked rules: AL, DE, IA, IN, KY, ME, ND, NM, OK, PA, SC and SD (12). None of their rules are copied from mirrors or vendor charts.

## Which edge cases does it handle?

**The edge cases (6)**

- An Arizona notice due on a Sunday is not moved; the answer says to do it by the Friday before.
- A Texas monthly notice due on February 15, 2027 (Washington's Birthday) moves to February 16.
- The Washington copy of the claim of lien due on Columbus Day 2026 is flagged with October 9, 2026, not moved.
- Maryland counts its notice from your last day, and also gives the safest day, 120 days after your first day.
- Kansas gives five months with a notice of extension, but not on residential property.
- A Texas job of more than 36 months of work, a last day before the first day, or a lien recorded before the first day of work is refused with the reason.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Arizona subcontractor on a commercial job: notice, lien and suit dates**

Arizona subcontractor on a commercial job: notice, lien and suit dates

| Result | Value |
| --- | --- |
| answer | As a subcontractor on a commercial project in Arizona, your preliminary twenty day notice is due March 23, 2026, the lien must be recorded by January 28, 2027 and the suit to enforce it must be filed by July 28, 2027 (if recorded on the last day, January 28, 2027) (A.R.S. 33-992.01(B), (C); A.R.S. 33-993(A); A.R.S. 33-998(A)). |
| notice due | March 23, 2026 |
| lien due | January 28, 2027 |
| suit by | July 28, 2027 |

**The input**

```json
{
  "op": "deadlines",
  "state": "AZ",
  "role": "sub",
  "project": "commercial",
  "firstFurnish": "2026-03-03",
  "lastFurnish": "2026-08-14",
  "completion": "2026-09-30"
}
```

**More worked examples (5)**

**Texas supplier to a subcontractor: one notice for each month of work**

Texas supplier to a subcontractor: one notice for each month of work

| Result | Value |
| --- | --- |
| answer | As a supplier to a subcontractor on a commercial project in Texas, your first open monthly notice (for March 2026) is due June 15, 2026, the lien affidavit must be filed by October 15, 2026 and the suit to enforce it must be filed by October 15, 2027 (Tex. Prop. Code 53.056(a-1)(1); Tex. Prop. Code 53.052(b); Tex. Prop. Code 53.158(a)). |
| notice due | June 15, 2026 |
| lien due | October 15, 2026 |
| suit by | October 15, 2027 |
| monthly notices | June 15, 2026; July 15, 2026; August 17, 2026; September 15, 2026 |

**The input**

```json
{
  "op": "deadlines",
  "state": "TX",
  "role": "supplier-sub",
  "project": "commercial",
  "firstFurnish": "2026-03-03",
  "lastFurnish": "2026-06-19"
}
```

**Florida supplier whose notice to owner went out late**

Florida supplier whose notice to owner went out late

| Result | Value |
| --- | --- |
| answer | As a supplier to the prime contractor on a commercial project in Florida, your notice to owner is due June 16, 2026, the lien must be recorded by December 17, 2026 and the suit to enforce it must be filed by December 17, 2027 (if recorded on the last day, December 17, 2026) (Fla. Stat. 713.06(2)(a); Fla. Stat. 713.08(5); Fla. Stat. 713.22(1), (2)). |
| notice due | June 16, 2026 |
| lien due | December 17, 2026 |
| suit by | December 17, 2027 |
| late notice | Sent on June 22, 2026, after the June 16, 2026 deadline. Florida is strict: failing to serve the notice, or serving it late, is a complete defense to enforcing the lien (713.06(2)(a)). |

**The input**

```json
{
  "op": "deadlines",
  "state": "FL",
  "role": "supplier-prime",
  "project": "commercial",
  "firstFurnish": "2026-05-02",
  "lastFurnish": "2026-09-18",
  "noticeSent": "2026-06-22"
}
```

**Washington sub-subcontractor: what a notice sent July 1 still protects**

Washington sub-subcontractor: what a notice sent July 1 still protects

| Result | Value |
| --- | --- |
| answer | As a sub-subcontractor on a commercial project in Washington, your notice to owner covers your first day if given by June 4, 2026, the lien must be recorded by September 28, 2026 and the suit to enforce it must be filed by May 28, 2027 (if recorded on the last day, September 28, 2026) (RCW 60.04.031(1); RCW 60.04.091; RCW 60.04.141). |
| notice due | June 4, 2026 |
| lien due | September 28, 2026 |
| suit by | May 28, 2027 |
| protects from | May 3, 2026 |

**The input**

```json
{
  "op": "deadlines",
  "state": "WA",
  "role": "sub-sub",
  "project": "commercial",
  "firstFurnish": "2026-04-06",
  "lastFurnish": "2026-06-30",
  "noticeSent": "2026-07-01"
}
```

**Federal project (Miller Act): second-tier supplier**

Federal project (Miller Act): second-tier supplier

| Result | Value |
| --- | --- |
| answer | As a supplier to a subcontractor on a federal project, your notice is due December 14, 2026 and the suit on the payment bond must be filed by September 15, 2027 (40 U.S.C. 3133(b)(2); 40 U.S.C. 3133(b)(4)). |
| notice due | December 14, 2026 |
| lien due | no lien step |
| suit by | September 15, 2027 |

**The input**

```json
{
  "op": "deadlines",
  "state": "US",
  "role": "supplier-sub",
  "project": "commercial",
  "firstFurnish": "2026-02-09",
  "lastFurnish": "2026-09-15"
}
```

**Arizona preliminary twenty day notice PDF for a made-up job**

Arizona preliminary twenty day notice PDF for a made-up job

| Result | Value |
| --- | --- |
| last day to serve | March 23, 2026 |
| form | Arizona Preliminary Twenty Day Lien Notice (A.R.S. 33-992.01(D)) |
| PDF | az-20-day.pdf |
| pages | 3 |

**The input**

```json
{
  "op": "notice",
  "state": "AZ",
  "role": "sub",
  "project": "commercial",
  "firstFurnish": "2026-03-03",
  "parties": {
    "owner": "Sample Owner LLC (made-up), 100 Example Street, Mesa, Arizona",
    "contractor": "Sample Builders Inc. (made-up), 200 Sample Road, Phoenix, Arizona",
    "lender": "None known",
    "hiringParty": "Sample Builders Inc. (made-up)",
    "claimantName": "Sample Drywall LLC (made-up)",
    "claimantAddress": "300 Demo Avenue, Tempe, Arizona",
    "description": "Drywall and framing labor and materials, floors 1 and 2",
    "property": "100 Example Street, Mesa, Arizona (clinic)",
    "legal": "Lot 12, Example Business Park (made-up)",
    "county": "Maricopa",
    "amount": "84,500.00",
    "date": "2026-03-10",
    "signerTitle": "Manager"
  }
}
```

## How is it tested?

The tests work each covered state's dates on fixed jobs (Arizona, Texas month by month with the weekend and holiday move, Florida, Washington, Virginia, Maryland, Minnesota, Kansas, the District of Columbia, Montana and the Miller Act), the late-notice rules, the refusals, the calendar file, the batch CSV and the notice PDF, which gives the same bytes for the same input.

**What its test suite asserts (3)**

- Every statute quote and every notice form line is pinned word for word to its snapshot as read on 2026-11-08, and every jurisdiction without a row is listed with its reason.
- Each covered state's notice, lien and suit dates are checked on fixed jobs, with the Texas weekend and holiday move, the weekend flags elsewhere and what a late notice still protects.
- The refusals, the calendar file, the batch CSV and the notice PDF (the same bytes every time, refused where no form applies) are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Lien deadline calculator tool](https://krishnachagti-sudo.github.io/toll-preview/lien-deadline/).

## Questions

### Is there any AI in the lien deadline calculator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the lien deadline calculator refuse to answer?

States whose own statute site we could not read are listed as not covered, not guessed. Public projects are bond claims, not liens; only the federal Miller Act is computed, and state public project bond statutes are not. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Lien deadline calculator tool](https://krishnachagti-sudo.github.io/toll-preview/lien-deadline/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/lien-deadline/  
Data as of: 2026-11-04
