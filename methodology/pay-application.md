# How the pay application and retainage tool works

Each line's total completed and stored is previous work plus this period plus materials stored; retainage is the rate on that total (or a separate rate on stored materials); the current payment due is the total earned less retainage less previous certificates, in whole cents, with rates in basis points (10% is 1,000).

## What does the pay application and retainage (g702/g703-style) compute?

Enter the schedule of values with each line's previous work, this period and stored materials, the change orders and the retainage terms, and the tool works out every G703-style column and the G702-style summary to the cent, checks the application for what a general contractor sends back, and writes a PDF and CSV to submit. Separate calculators work retainage forward and in reverse, a reduction at a percent complete and a release, and the state rule checks the rate against the statute where it was read (Arizona, Florida, Kansas, Minnesota, Texas, Virginia, Washington).

Operations (the op field):

- `check`: Returns the summary, every column and the checks. Free.
- `preview`: The same totals and checks as check, as the page shows them. Free.
- `payapp`: Does what check does and also returns the PDF and CSV to submit. Corrections to the same application are free for 60 days.
- `retainage`: Retainage forward (held on a gross), in reverse (the gross a net check was billed as, exact to the cent) or with a reduction at a percent complete.
- `release`: The retainage released, partial or final, and what is left held.
- `state`: The retainage limit and release rule for a state, project type and contract value, quoted from the statute with its read date.

Inputs:

- `lines`: Up to 200 lines of the schedule of values: scheduled value, work from previous applications, this period, materials stored, and an optional rate for the line.
- `changeOrders`: Up to 100 change orders; one not signed yet is listed but not billed or added to the contract sum.
- `retainage`: The rate, a different rate on stored materials, a reduced rate and the percent complete at which it applies, and any amount released.
- `contract, previousCertificates`: The original contract sum, to check the lines add up, and the payments certified on earlier applications.
- `state, projectType, contractValue`: To check the rate against the state's statute; some turn on the contract value.

Outputs:

- summary and display: original contract sum, change orders, contract sum to date, total completed and stored, retainage, earned less retainage, previous certificates, current payment due and balance to finish
- rows: every column per line; checks: what to fix before sending
- payapp: the PDF and CSV

## How is it calculated, step by step?

1. Money is whole cents and rates are basis points (10% is 1,000); nothing is a float until it is shown.
2. For each line: total completed and stored is previous plus this period plus stored materials; percent is the total over the scheduled value; balance to finish is the scheduled value less the total. These are the columns AIA's published G703 instructions describe; the layout and wording are this tool's own.
3. Signed change orders are added to the contract sum; unsigned ones are listed only.
4. Retainage is the rate on completed work and the stored-materials rate on stored materials, or each line's own rate; with a reduction, the reduced rate applies to work after the percent complete is reached. Releases are subtracted.
5. Total earned less retainage, less previous certificates, is the current payment due; the balance to finish includes retainage.
6. Checks flag what a general contractor sends back: lines that do not add up to the contract sum, a negative total or negative work this period, previous certificates missing or different from the earlier applications, a change order not yet signed, a negative payment due, and a rate over the state limit where the statute was read.

**State retainage rules.**

Each covered state's rule is quoted word for word from the statute on the state's own site, read on 2026-11-08. Every other state and DC is shown as not covered rather than guessed.

## Which edge cases does it handle?

- Reverse retainage gives the gross a net check was billed as, exact to the cent.
- Stored materials incorporated this period move from stored to this period's work.
- Texas public works change limit at $5 million and Florida rules turn on $200,000, so the contract value is asked for.
- The PDF and CSV are the same bytes for the same input.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Application 3 on a $240,000 electrical subcontract at 10% retainage**

```json
op: "check"
project: "Sample Medical Office Building (made-up)"
projectNumber: "2026-114"
contractor: "Sample Electric LLC (made-up)"
to: "Sample Builders Inc. (made-up)"
owner: "Sample Owner LP (made-up)"
applicationNumber: 3
periodTo: "2026-11-30"
applicationDate: "2026-11-25"
contractDate: "2026-08-03"
contractSum: "240,000.00"
retainage: {...}
lines: 5 items
changeOrders: 2 items
previousCertificates: "46,800.00"
state: "TX"
projectType: "private"
```

Application 3 on a $240,000 electrical subcontract at 10% retainage

| Result | Value |
| --- | --- |
| Original contract sum | $240,000.00 |
| Net change by change orders | $8,500.00 |
| Contract sum to date | $248,500.00 |
| Total completed and stored to date | $99,250.00 |
| Retainage held | $9,925.00 |
| Total earned less retainage | $89,325.00 |
| Less previous certificates for payment | $46,800.00 |
| Current payment due | $42,525.00 |
| Balance to finish, including retainage | $159,175.00 |

**Reverse retainage: a $45,000 check net of 10% retainage**

```json
{
  "op": "retainage",
  "mode": "reverse",
  "rate": 10,
  "net": "45,000.00"
}
```

Reverse retainage: a $45,000 check net of 10% retainage

| Result | Value |
| --- | --- |
| net | $45,000.00 |
| gross | $50,000.00 |
| held | $5,000.00 |

## What does it not do?

- A pay application whose lines do not tie out is refused before any charge, with the line.
- State rules are held only for Arizona, Florida, Kansas, Minnesota, Texas, Virginia, Washington; it says when a state is not covered.
- Not legal or accounting advice: whether the numbers match your contract is yours to check.

## Where does the data come from, and how fresh is it?

The state statutes were read on each state's own site, and the G703 column logic on AIA's published instructions, on 2026-11-08. The pages are checked daily for changes.

- [A.R.S. 34-221(C) (Arizona)](https://www.azleg.gov/ars/34/00221.htm)
- [Fla. Stat. 715.12(7) (Florida)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0715/Sections/0715.12.html)
- [Fla. Stat. 255.078 (Florida)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0255/Sections/0255.078.html)
- [Fla. Stat. 218.735(8) (Florida)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0218/Sections/0218.735.html)
- [K.S.A. 16-1803 (Kansas)](https://www.ksrevisor.gov/statutes/chapters/ch16/016_018_0003.html)
- [K.S.A. 16-1904 (Kansas)](https://www.ksrevisor.gov/statutes/chapters/ch16/016_019_0004.html)
- [K.S.A. 16-1901 (Kansas)](https://www.ksrevisor.gov/statutes/chapters/ch16/016_019_0001.html)
- [Minn. Stat. 337.10, subd. 4 (Minnesota)](https://www.revisor.mn.gov/statutes/cite/337.10)
- [Minn. Stat. 15.72, subd. 2 (Minnesota)](https://www.revisor.mn.gov/statutes/cite/15.72)
- [Tex. Prop. Code 53.101 and 28.002 (Texas)](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.53.htm)
- [Tex. Prop. Code 28.002 (Texas)](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.28.htm)
- [Tex. Gov't Code 2252.032 (Texas)](https://statutes.capitol.texas.gov/Docs/GV/htm/GV.2252.htm)
- [Va. Code 2.2-4333 (Virginia)](https://law.lis.virginia.gov/vacode/title2.2/chapter43/section2.2-4333/)
- [RCW 60.28.011 (Washington)](https://app.leg.wa.gov/RCW/default.aspx?cite=60.28.011)
- [AIA: Instructions, G703-1992 Continuation Sheet](https://help.aiacontracts.com/hc/en-us/articles/1500009308302-Instructions-G703-1992-Continuation-Sheet)
- [AIA: G702 store page](https://aiacontracts.com/documents/g702-1992)

The state statutes were read on each state's own site, and the G703 column logic on AIA's published instructions, on 2026-11-08. The pages are checked daily for changes.

Pay application and retainage (G702/G703-style): sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [A.R.S. 34-221(C) (Arizona)](https://www.azleg.gov/ars/34/00221.htm) | see the document | 2026-11-08 |
| [Fla. Stat. 715.12(7) (Florida)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0715/Sections/0715.12.html) | see the document | 2026-11-08 |
| [Fla. Stat. 255.078 (Florida)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0255/Sections/0255.078.html) | see the document | 2026-11-08 |
| [Fla. Stat. 218.735(8) (Florida)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0218/Sections/0218.735.html) | see the document | 2026-11-08 |
| [K.S.A. 16-1803 (Kansas)](https://www.ksrevisor.gov/statutes/chapters/ch16/016_018_0003.html) | see the document | 2026-11-08 |
| [K.S.A. 16-1904 (Kansas)](https://www.ksrevisor.gov/statutes/chapters/ch16/016_019_0004.html) | see the document | 2026-11-08 |
| [K.S.A. 16-1901 (Kansas)](https://www.ksrevisor.gov/statutes/chapters/ch16/016_019_0001.html) | see the document | 2026-11-08 |
| [Minn. Stat. 337.10, subd. 4 (Minnesota)](https://www.revisor.mn.gov/statutes/cite/337.10) | see the document | 2026-11-08 |
| [Minn. Stat. 15.72, subd. 2 (Minnesota)](https://www.revisor.mn.gov/statutes/cite/15.72) | see the document | 2026-11-08 |
| [Tex. Prop. Code 53.101 and 28.002 (Texas)](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.53.htm) | see the document | 2026-11-08 |
| [Tex. Prop. Code 28.002 (Texas)](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.28.htm) | see the document | 2026-11-08 |
| [Tex. Gov't Code 2252.032 (Texas)](https://statutes.capitol.texas.gov/Docs/GV/htm/GV.2252.htm) | see the document | 2026-11-08 |
| [Va. Code 2.2-4333 (Virginia)](https://law.lis.virginia.gov/vacode/title2.2/chapter43/section2.2-4333/) | see the document | 2026-11-08 |
| [RCW 60.28.011 (Washington)](https://app.leg.wa.gov/RCW/default.aspx?cite=60.28.011) | see the document | 2026-11-08 |
| [AIA: Instructions, G703-1992 Continuation Sheet](https://help.aiacontracts.com/hc/en-us/articles/1500009308302-Instructions-G703-1992-Continuation-Sheet) | see the document | 2026-11-08 |
| [AIA: G702 store page](https://aiacontracts.com/documents/g702-1992) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check the sample application to the cent in every column, stored-materials and per-line rates, reductions, rounding and releases, the reverse calculator, every check, that each state quote is word for word in its dated snapshot, and that the PDF and CSV are deterministic.

What its test suite asserts:

- The sample application is checked to the cent in every column and the summary.
- Each state quote is word for word in its dated snapshot, read on 2026-11-08.
- Retainage forward, in reverse, reduced and released is exact to the cent; the PDF and CSV are deterministic.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Pay application and retainage (G702/G703-style) tool](https://krishnachagti-sudo.github.io/toll-preview/pay-application/).

## Questions

### Is there any AI in the pay application and retainage (g702/g703-style) answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the pay application and retainage (g702/g703-style) refuse to answer?

A pay application whose lines do not tie out is refused before any charge, with the line. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Pay application and retainage (G702/G703-style) tool](https://krishnachagti-sudo.github.io/toll-preview/pay-application/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/pay-application/  
Data as of: 2026-11-04
