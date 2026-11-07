# How ZIP to county works: Census and ONS method

A US ZIP code is looked up as its ZCTA in the Census 2020 ZCTA to county file: 33,791 ZCTAs, 10,180 of them in more than one county, each county's share given by land area. A UK postcode is looked up in the ONS Postcode Directory (August 2026), which places 2,652,624 Great Britain postcodes, live and terminated, in their local authority.

## What does the zip code and uk postcode to county lookup compute?

Given ZIP codes or UK postcodes, one or a list, the tool says for each ZIP every county it has land in, with the county FIPS code, the share of the land, the metro or micro area and the Census region, and for each postcode its local authority, county, region and nation. Given a county FIPS code, it lists every ZCTA with land in that county.

Operations (the op field):

- `lookup`: Looks up a list of ZIP codes and postcodes (at most 10,000 in one call). Each result says whether it was found, with its counties or areas and notes; codes not found are named with the reason. country is auto (digits are a ZIP, letters a postcode), us or gb.
- `county`: Lists every ZCTA with land in a county, given its 5-digit FIPS code, with the county's share of each ZCTA's land, the other counties a shared ZCTA touches, and the county's metro or micro area.

Inputs:

- `codes`: ZIP codes or UK postcodes as typed or pasted, each at most 40 characters. ZIP+4, ZIPs that lost a leading zero and postcodes in any case or spacing are read.
- `country`: auto, us or gb (default auto).
- `fips`: For county: a 5-digit county FIPS code, such as 48201, that is in the Census 2020 file.

Outputs:

- For a ZIP: the county with the most land, every county with its FIPS code, land in square meters, share percent and metro area, the states crossed, the Census region and division, and the land area
- For a postcode: the local authority, the county (two-tier areas), the county or unitary authority ONS reports, the region (England), the nation, and whether the postcode is live or terminated
- summary: codes, found, not found, unreadable, US and GB found, and ZIPs crossing a county line
- sources: the files used, with their vintage and read date, and the ONS attribution for postcodes

## How is it calculated, step by step?

1. Each entry is read. Digits are a ZIP code: 3 or 4 digits are padded with leading zeros (a spreadsheet drops them), and ZIP+4 keeps its first five digits, each with a note. Letters are a postcode, read in any case or spacing and written back as outward and inward code, such as SW1A 1AA. Anything else is reported as not readable.
2. A ZIP is looked up as the ZCTA of the same number. A ZIP with no ZCTA, such as a PO-box-only ZIP or one created after 2020, is reported as not found, with the advice to use the street address.
3. The ZCTA's land parts are listed largest first (ties by FIPS code), and each county's share is its land over the ZCTA's land, as a percentage with two decimals. Parts that are water only are left out.
4. Each county gets its OMB July 2023 metro or micro area and its state's Census region and division. A ZIP that crosses a state line, a state outside the Census regions and a Connecticut county are noted.
5. A postcode in Northern Ireland, Guernsey, Jersey or the Isle of Man is named and not covered. Any other postcode is found in the ONS Postcode Directory, with its local authority and so its county, region and nation. A terminated postcode keeps the areas of its last location, and a postcode ONS has not placed has no local authority yet.
6. A list is summarized, and the sources used are attached to the answer.

**ZCTAs and ZIP codes.**

A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. The file read on 2026-11-07 has 46,953 ZCTA-county land parts across 3,234 counties; 7 parts with water only are left out.

County shares are by land area, not by addresses or population.

**Connecticut and Puerto Rico.**

Connecticut answers use the 8 counties of the 2020 file. Census and federal data from 2022 on use 9 planning regions instead, and OMB's 2023 metro areas are built from them, so no metro area is given for a Connecticut county. Census regions cover the 50 states and DC, so Puerto Rico has no region.

**Great Britain postcodes.**

The ONS Postcode Directory (August 2026) has 1,749,110 live and 903,514 terminated postcodes in 350 local authorities. A single-tier council has no county above it, so it is also the county or unitary authority ONS reports. Northern Ireland (BT) postcodes need a separate Land and Property Services license for commercial use, so they are not covered.

## Which edge cases does it handle?

- ZIP 39573 in Mississippi has land in six counties: each is listed with its share, largest first.
- ZIP 2134 is read as 02134, and 10463-2201 as 10463, each with a note saying so.
- ZIP 00501 has no ZCTA in the Census 2020 file, so it is reported as not found and not charged.
- A ZCTA with land in two states lists both states.
- GIR 0AA is in the directory but not placed in a local authority, and says so.
- A postcode issued after the directory's release is reported as not in it.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**ZIP 77002: one county, all of its land**

```json
{
  "op": "lookup",
  "codes": [
    "77002"
  ]
}
```

ZIP 77002: one county, all of its land

| Result | Value |
| --- | --- |
| county | Harris County, TX |
| FIPS | 48201 |
| share of land | 100% |
| metro area | Houston-Pasadena-The Woodlands, TX |

**ZIP 39573: six counties, by share of land**

```json
{
  "op": "lookup",
  "codes": [
    "39573"
  ]
}
```

ZIP 39573: six counties, by share of land

| Result | Value |
| --- | --- |
| Stone County, MS (28131) | 58.96% |
| George County, MS (28039) | 15.98% |
| Hancock County, MS (28045) | 11.49% |
| Jackson County, MS (28059) | 8.2% |
| Pearl River County, MS (28109) | 2.84% |
| Harrison County, MS (28047) | 2.53% |

**Postcode SW1A 1AA: a single-tier council**

```json
{
  "op": "lookup",
  "codes": [
    "SW1A 1AA"
  ]
}
```

Postcode SW1A 1AA: a single-tier council

| Result | Value |
| --- | --- |
| local authority | Westminster (E09000033) |
| county | none (single-tier) |
| region | London |
| nation | England |

**A pasted list with a lost leading zero, a ZIP+4 and a Northern Ireland postcode**

```json
{
  "op": "lookup",
  "codes": [
    "2134",
    "10463-2201",
    "00501",
    "ME14 1XQ",
    "cf10 1ep",
    "BT1 5GS"
  ]
}
```

A pasted list with a lost leading zero, a ZIP+4 and a Northern Ireland postcode

| Result | Value |
| --- | --- |
| found | 4 of 6 |
| not found | 2 |
| ZIPs crossing a county line | 1 |
| answer | 4 of 6 codes found; 1 ZIP crosses a county line; 2 not in the official files. |

## What does it not do?

- It answers for ZCTAs, not USPS delivery routes, so a new ZIP or a PO-box-only ZIP is not found. Use the street address for those.
- Shares are by land area, not by addresses or population.
- Northern Ireland, the Channel Islands and the Isle of Man are not covered.
- It does not geocode street addresses or give a postcode's coordinates.

## Where does the data come from, and how fresh is it?

The US files are the Census 2020 ZCTA to county relationship file, Census 2020 county and state codes, the Census regions and OMB's July 2023 delineation, read on 2026-11-07. The postcode file is the ONS Postcode Directory, August 2026, read on 2026-11-07. Each file is recorded with its address and SHA-256 hash.

- [Census 2020 ZCTA5 to County relationship file](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)
- [OMB July 2023 metropolitan and micropolitan delineation (Census list 1)](https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx)
- [Census Bureau regions and divisions](https://www2.census.gov/geo/docs/maps-data/maps/reg_div.txt)
- [ONS Postcode Directory (August 2026)](https://geoportal.statistics.gov.uk/)
- [ONS: Postcode products](https://www.ons.gov.uk/methodology/geography/geographicalproducts/postcodeproducts)
- [ONS: Licences](https://www.ons.gov.uk/methodology/geography/licences)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The counts are pinned against the files: 33,791 ZCTAs and 10,180 in more than one county, 2,652,624 postcodes decoded back to the counts the build wrote. Answers are checked for one-county and six-county ZIPs, a state line, Connecticut, Puerto Rico, two-tier and single-tier councils, Scotland, Wales, London, terminated and unplaced postcodes.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the ZIP code and UK postcode to county lookup tool](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/).

## Questions

### Is there any AI in the zip code and uk postcode to county lookup answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the zip code and uk postcode to county lookup refuse to answer?

It answers for ZCTAs, not USPS delivery routes, so a new ZIP or a PO-box-only ZIP is not found. Use the street address for those. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the ZIP code and UK postcode to county lookup tool](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [County FIPS codes](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/county-fips-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/zip-to-county/  
Data as of: 2026-11-04
