# How HS, HTS, NAICS and SIC codes are checked: method

A code is read as its digits and checked in every table a code of that length belongs to: NAICS 2022, HS (6-digit), US HTS, Schedule B, US SIC 1987, UK SIC 2007, Schedule C business code. The tables are NAICS 2022 (2,125 codes), the US HTS 2026 HTS Revision 22 effective 10/30/2026, Schedule B 2026 (9,779 numbers), UK SIC 2007 and the IRS Schedule C codes, read on 2026-11-08.

## What does the hs, hts, naics and sic code checker compute?

The tool checks up to 5,000 codes in one call against the official tables and says for each whether it is valid, its official title, the table and its edition. A NAICS code also gets its place in the hierarchy, its Census definition and index entries, its SBA size standard, the NAICS 2017 and 1987 SIC codes it came from and its status in the proposed NAICS 2027. A NAICS 2017 code that NAICS 2022 replaced is named with its replacements. The search finds the official lines that contain every word you type.

Operations (the op field):

- `check`: Checks a list of codes (1 to 5,000) in one system or, with system auto, in every system a code of that length fits. Returns one result per code with its status (valid, retired, not-found or malformed), title, edition, notes and sources, and a summary of the counts.
- `search`: Finds the lines of one table (naics by default, or hs, hts, schedule-b, uk-sic or schedule-c) that contain every word of the query, ranked, with at most 25 shown and the total found.

Inputs:

- `codes`: For check: a list of codes as text, such as "722511" or "6109.10.00.12" (at most 40 characters each), or whole numbers. Dots, spaces and dashes are ignored. A number loses its leading zeros, so write a code like 0101 as text.
- `system`: For check: auto (the default) or one of naics, hs, hts, schedule-b, us-sic, uk-sic, schedule-c. For search: naics (the default), hs, hts, schedule-b, uk-sic or schedule-c; US SIC cannot be searched.
- `query`: For search: the words to look for, at most 120 characters, such as "landscaping" or "cotton t-shirts".

Outputs:

- answer: one sentence for the whole list (how many are valid, retired, not in a code format, or have a proposed NAICS 2027 change), or for a search, how many lines matched and the first
- results: per code, the input, system, code as written officially, valid, status, title, level, edition, answer and notes
- NAICS: path from sector down, description, Census index entries, SBA size standard with any footnote, NAICS 2017 codes, 1987 SIC codes, the Schedule C code when it is the same number, and next (the proposed 2027 change)
- HS and HTS: the subheadings under a heading, the count of HTS and Schedule B lines under a subheading, the general duty rate and unit of an HTS line, its 10-digit statistical numbers, and the HS 2028 note
- Schedule B, US SIC, UK SIC and Schedule C: the NAICS code in the Schedule B concordance, the NAICS 2022 codes a SIC code maps to, the UK SIC section, the Schedule C category
- misses: the nearest valid parent code or line, the statistical numbers or Schedule B numbers that do exist, and the NAICS 2022 codes that replaced a 2017 code
- sources: the official tables used, each with its edition and read date

## How is it calculated, step by step?

1. Each entry is trimmed and its dots, spaces and dashes are removed. A two-digit range such as 31-33 is kept as a NAICS sector.
2. With system auto, the digit count picks the tables to try: 2 digits NAICS and HS; 3 NAICS; 4 NAICS, HS, HTS, US SIC and UK SIC; 5 NAICS and UK SIC; 6 NAICS, Schedule C, HS and HTS; 8 HTS; 10 HTS and Schedule B. Every table where the code is valid is returned. A 4 or 6 digit HTS match is left out when the same digits are a valid HS code, so the HS answer is given once. A code valid nowhere but found in NAICS 2017 is returned as retired.
3. NAICS: the code is looked up among all 2,125 NAICS 2022 codes of 2 to 6 digits; sectors 31, 32 and 33 are read as 31-33, 44 and 45 as 44-45, 48 and 49 as 48-49. A six-digit code gets its Census description and index entries, its SBA size standard, the NAICS 2017 codes it came from (2017 to 2022 concordance), the 1987 SIC codes reached by chaining the Census concordances 2022 to 2017 to 2012 to 2007 to 2002 to SIC, and the same number on the Schedule C list.
4. NAICS 2027: OMB's proposed changes (Table 1 of the July 13, 2026 notice, 52 codes) say whether a code is combined, split, partly moved or retitled; every other code shows no change proposed.
5. A six-digit code not in NAICS 2022 but in NAICS 2017 is retired, with the NAICS 2022 codes the concordance maps it to. Any other miss names its longest valid parent.
6. HS: chapters, headings and subheadings (2, 4 or 6 digits) are read from the US HTS, which carries every HS subheading; chapter 77 and the US-only chapters 98 and 99 are not HS. An 8 or 10 digit number is checked at its first 6 digits, with a note. A valid subheading says how many HTS statistical numbers and Schedule B numbers start with it.
7. HS 2028: the WCO accepted the amendments on January 21, 2026, in force January 1, 2028. The tool names the headings whose change is published (2107, 3002, 3007, 3008, 3915); for every other code it says the correlation tables are not published yet.
8. HTS: a 4, 6, 8 or 10 digit number is looked up in 2026 HTS Revision 22. An 8-digit number whose only line is a 10-digit row ending in 00 is matched to that row. The general duty rate comes from the line, or from its 8-digit parent for a 10-digit number. An 8-digit line lists its 10-digit statistical numbers, since an entry needs one. Chapters 98 and 99 get their own notes. A miss names the nearest line above it.
9. Schedule B: a 10-digit number is looked up in the 2026 export concordance, with its NAICS code and whether the same digits are a US HTS import number. A miss lists up to 12 Schedule B numbers with the same first 6 digits.
10. US SIC: a 4-digit code is valid when the Census concordances link it to NAICS 2022, and the NAICS 2022 codes it maps to are listed. UK SIC: a 4-digit code is read with a final 0, since Companies House takes 5 digits. Schedule C: a 6-digit code must be on the IRS list; a NAICS code that is not on it is named as such.
11. Search: the query is lowercased, a hyphen between letters is dropped (t-shirts becomes tshirts), common words (a, the, code, naics, business and others) are dropped and plural endings are trimmed. A line matches only when it contains every word as a whole word. NAICS searches six-digit titles and Census index entries, ranked by how many of a code's lines match, titles first; HTS and HS search 8 and 10 digit lines (not chapter 99), ranked by how high in the hierarchy the word appears; Schedule B, UK SIC and Schedule C rank shorter lines first. Ties go to the lower code, so the order is the same every time.

**The official tables.**

Every table is built by the tool's build script from the official download named in its sources file, with the file's SHA-256 hash and the read date 2026-11-08: NAICS 2022 and the Census concordances, the SBA Table of Size Standards effective March 17, 2023, the USITC HTS JSON export (2026 HTS Revision 22, 35,805 lines), the Census Schedule B concordance (9,779 numbers), the Companies House condensed UK SIC 2007 list (731 codes, Open Government Licence v3.0) and the IRS Schedule C instructions for 2025 (304 codes).

**What a valid code means.**

Reference, not a customs ruling or tax advice: a code that exists may still be the wrong one for your goods or business. Only U.S. Customs and Border Protection (by a binding ruling) decides an import classification, and the IRS decides what goes on a return.

**Left out.**

India NIC 2008 and NIC 2025 (MoSPI): MoSPI's website allows reproduction only after taking permission by email.

WCO HS legal text, explanatory notes and HS 2028 correlation tables: WCO copyright; the HS 2028 correlation tables are not published yet (WCO, 21 January 2026).

## Which edge cases does it handle?

- 722511 is valid in three tables at once: NAICS (full-service restaurants), Schedule C and HS 7225.11; all three are returned and the answer asks for a system to check just one.
- 454110, a NAICS 2017 code, is reported as retired with the NAICS 2022 codes that replaced it, not as an unknown code.
- Sector 32 is read as 31-33, with a note that it is part of that sector.
- An 8-digit HTS number with a single statistical line is matched to that 10-digit line, with a note to use the 10 digits on an entry.
- A 10-digit number can be an HTS import number, a Schedule B export number, or both; each answer says which.
- A 4-digit UK SIC code is read with a final 0: 6201 becomes 62010, which is not on the list, so the answer names 62011 and 62012, the codes that start 6201.
- A NAICS code that is not on the IRS list is refused as a Schedule C code and named as a NAICS code.
- Chapter 99 lines are valid HTS numbers but carry the note that they are reported alongside a chapter 1 to 97 number.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A pasted list: NAICS, a retired NAICS 2017 code, HTS, Schedule B and a code that does not exist**

```json
{
  "op": "check",
  "codes": [
    "722511",
    "454110",
    "6109.10.00.12",
    "8471.30.0100",
    "999999"
  ]
}
```

A pasted list: NAICS, a retired NAICS 2017 code, HTS, Schedule B and a code that does not exist

| Result | Value |
| --- | --- |
| answer | 3 of 5 valid; 1 retired (NAICS 2017). |
| 722511 | valid in NAICS 2022, Schedule C business code, HS (6-digit) |
| 454110 | retired: replaced by 42 NAICS 2022 codes |
| 6109.10.00.12 | valid US HTS: T-shirts, singlets, tank tops and similar garments, knitted or crocheted: Of cotton: Men's or boys': Other T-shirts: Men's (338) |
| 8471.30.0100 | valid in US HTS, Schedule B |
| 999999 | not-found |

**NAICS 541511 with its SBA size standard, SIC code and NAICS 2027 status**

```json
{
  "op": "check",
  "codes": [
    "541511"
  ],
  "system": "naics"
}
```

NAICS 541511 with its SBA size standard, SIC code and NAICS 2027 status

| Result | Value |
| --- | --- |
| title | Custom Computer Programming Services |
| level | national industry |
| path | 54 \> 541 \> 5415 \> 54151 \> 541511 |
| SBA size standard | $34 million in average annual receipts |
| NAICS 2017 | 541511 |
| 1987 SIC | 7371 Computer Programming Services |
| NAICS 2027 | no change proposed |

**Is 6109.10 a valid HS code? The US lines under it**

```json
{
  "op": "check",
  "codes": [
    "6109.10"
  ],
  "system": "hs"
}
```

Is 6109.10 a valid HS code? The US lines under it

| Result | Value |
| --- | --- |
| valid | yes |
| title | T-shirts, singlets, tank tops and similar garments, knitted or crocheted: Of cotton |
| HTS statistical numbers under it | 14 |
| Schedule B numbers under it | 10 |
| HS 2028 | the WCO has not yet published the correlation tables that say which codes change. |

**The NAICS codes whose title or Census index entries contain "landscaping"**

```json
{
  "op": "search",
  "query": "landscaping",
  "system": "naics"
}
```

The NAICS codes whose title or Census index entries contain "landscaping"

| Result | Value |
| --- | --- |
| answer | 1 line in NAICS 2022 titles and Census index entries contains "landscaping"; the first is 561730 Landscaping Services. |
| matched in | title |
| matching lines for that code | 5 |
| SBA size standard | $9.5 million in average annual receipts |

**The Schedule C business code for couriers**

```json
{
  "op": "check",
  "codes": [
    "492000"
  ],
  "system": "schedule-c"
}
```

The Schedule C business code for couriers

| Result | Value |
| --- | --- |
| answer | 492000 is on the IRS list of Schedule C activity codes (2025 instructions): Couriers & messengers, under Transportation & Warehousing. |
| category | Transportation & Warehousing |
| edition | Schedule C instructions, 2025 |

## What does it not do?

- It does not classify goods or a business: it checks codes and finds official lines that contain your words. A code that exists may still be the wrong one, and only a CBP binding ruling decides an import classification.
- NAICS 2027 is shown only as OMB's proposal; HS 2028 changes are shown only for the headings named, because the WCO correlation tables are not published.
- India's NIC codes and the WCO's HS legal text and explanatory notes are not included.
- A US SIC code counts as valid only when the Census concordances link it to NAICS 2022; SIC 1987 is no longer revised.
- Only the general duty rate of an HTS line is shown; special program rates and chapter 99 duties are not added up.

## Where does the data come from, and how fresh is it?

The tables were read on 2026-11-08: NAICS 2022 from the Census Bureau, the SBA size standards effective March 17, 2023, 2026 HTS Revision 22 (effective 10/30/2026) from the USITC, the Schedule B 2026 concordance, the UK SIC 2007 list from GOV.UK and the IRS Schedule C instructions for 2025 (page updated 30-Apr-2026). They change only when the build script is run again on a new download, such as a new HTS revision or the January and July Schedule B updates.

- [Census Bureau: NAICS 2022 codes, descriptions and index](https://www.census.gov/naics/)
- [SBA: Table of Size Standards, effective March 17, 2023](https://www.sba.gov/document/support-table-size-standards)
- [OMB: NAICS updates for 2027 (proposed), 91 FR 42976, July 13, 2026](https://www.govinfo.gov/content/pkg/FR-2026-07-13/pdf/2026-14086.pdf)
- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22](https://hts.usitc.gov/)
- [Census Bureau: Schedule B export codes (2026 concordance)](https://www.census.gov/foreign-trade/schedules/b/index.html)
- [Companies House: condensed SIC 2007 list (Open Government Licence v3.0)](https://www.gov.uk/government/publications/standard-industrial-classification-of-economic-activities-sic)
- [IRS: Instructions for Schedule C (Form 1040) (2025), activity codes](https://www.irs.gov/instructions/i1040sc)
- [Census Bureau: NAICS concordances 2022 to 2002 and 2002 NAICS to 1987 SIC](https://www.census.gov/naics/?68967)

The tables were read on 2026-11-08: NAICS 2022 from the Census Bureau, the SBA size standards effective March 17, 2023, 2026 HTS Revision 22 (effective 10/30/2026) from the USITC, the Schedule B 2026 concordance, the UK SIC 2007 list from GOV.UK and the IRS Schedule C instructions for 2025 (page updated 30-Apr-2026). They change only when the build script is run again on a new download, such as a new HTS revision or the January and July Schedule B updates.

HS, HTS, NAICS and SIC code checker: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Census: 2-6 digit 2022 NAICS codes](https://www.census.gov/naics/2022NAICS/2-6%20digit_2022_Codes.xlsx) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [Census: 2022 NAICS descriptions](https://www.census.gov/naics/2022NAICS/2022_NAICS_Descriptions.xlsx) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [Census: 2022 NAICS index file](https://www.census.gov/naics/2022NAICS/2022_NAICS_Index_File.xlsx) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [Census: 2017 to 2022 NAICS concordance](https://www.census.gov/naics/concordances/2017_to_2022_NAICS.xlsx) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [Census: 2012 to 2017 NAICS concordance](https://www.census.gov/naics/concordances/2012_to_2017_NAICS.xlsx) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [Census: 2007 to 2012 NAICS concordance](https://www.census.gov/naics/concordances/2007_to_2012_NAICS.xls) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [Census: 2002 to 2007 NAICS concordance](https://www.census.gov/naics/concordances/2002_to_2007_NAICS.xls) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [Census: 2002 NAICS to 1987 SIC](https://www.census.gov/naics/concordances/2002_NAICS_to_1987_SIC.xls) | NAICS 2022 and the Census concordances | 2026-11-08 |
| [SBA: Table of Size Standards, effective March 17, 2023](https://legacy.sba.gov/sites/default/files/2023-06/Table%20of%20Size%20Standards_Effective%20March%2017%2C%202023_.xlsx) | as dated in its title | 2026-11-08 |
| [OMB: NAICS updates for 2027, request for comments, 91 FR 42976 (July 13, 2026), Table 1](https://www.govinfo.gov/content/pkg/FR-2026-07-13/pdf/2026-14086.pdf) | as dated in its title | 2026-11-08 |
| [USITC: Harmonized Tariff Schedule, JSON export](https://hts.usitc.gov/reststop/exportList?from=0101&to=9999.99.99&format=JSON&styles=false) | 2026 HTS Revision 22, effective 10/30/2026 | 2026-11-08 |
| [USITC: HTS release list](https://hts.usitc.gov/reststop/releaseList) | 2026 HTS Revision 22, effective 10/30/2026 | 2026-11-08 |
| [USITC: HTS sections and chapter titles, as listed by the hts.usitc.gov app (main.05b4b9b929111922.js)](https://hts.usitc.gov/) | 2026 HTS Revision 22, effective 10/30/2026 | 2026-11-08 |
| [Census: Schedule B export concordance (sbsdf.zip, econcord.txt)](https://www.census.gov/foreign-trade/schedules/b/2026/sbsdf.zip) | Schedule B 2026 | 2026-11-08 |
| [Companies House: condensed SIC 2007 list (GOV.UK CSV)](https://assets.publishing.service.gov.uk/media/5a7f8639e5274a2e87db65e1/SIC07_CH_condensed_list_en.csv) | UK SIC 2007, Open Government Licence v3.0 | 2026-11-08 |
| [IRS: Instructions for Schedule C (Form 1040) (2025), Principal Business or Professional Activity Codes](https://www.irs.gov/instructions/i1040sc) | 2025 instructions, page updated 30-Apr-2026 | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The data files are pinned to their sources, read date, SHA-256 hashes and sizes, and the counts to the official totals (2,125 NAICS codes, 35,805 HTS lines, 9,779 Schedule B numbers, 731 UK SIC and 304 Schedule C codes). Each table is checked on valid codes, misses and their nearest line; NAICS 2027 is checked against OMB Table 1; the search is checked to be deterministic; a list of 5,000 codes runs in well under a second.

What its test suite asserts:

- The data files are pinned to their source URLs, read date (2026-11-08), SHA-256 hashes and sizes, and the counts to the official totals: 2,125 NAICS 2022 codes, 35,805 HTS lines in 2026 HTS Revision 22, 9,779 Schedule B numbers, 731 UK SIC and 304 Schedule C codes.
- NAICS is checked on every level, range sectors, retired 2017 codes, SBA size standards, SIC links and the proposed 2027 changes from OMB Table 1; HS, HTS and Schedule B on valid numbers, combined 8 and 10 digit rows, chapter 99 and misses with the nearest line.
- Auto mode returns every table a code fits, the search is whole-word and gives the same order every time, and a list of 5,000 codes runs in well under a second.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the HS, HTS, NAICS and SIC code checker tool](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/).

## Questions

### Is there any AI in the hs, hts, naics and sic code checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the hs, hts, naics and sic code checker refuse to answer?

It does not classify goods or a business: it checks codes and finds official lines that contain your words. A code that exists may still be the wrong one, and only a CBP binding ruling decides an import classification. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the HS, HTS, NAICS and SIC code checker tool](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/industry-code-lookup/  
Data as of: 2026-11-04
