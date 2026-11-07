# ZIP code vs ZCTA

A ZIP code is a USPS delivery route; a ZCTA is the Census Bureau's area for it, built from census blocks, and there are 33,791 ZCTAs in the 2020 file. County lookups differ because a ZIP with no area (such as 00501) has no ZCTA, and because a ZIP across a county line, such as 10463, can be placed by land area, by addresses or by population.

## Three ZIP codes, three cases

Worked out by the lookup from the Census 2020 ZCTA file.

| ZIP | What the file says |
| --- | --- |
| 00501 | ZIP 00501 has no ZCTA in the Census 2020 file. ZIP codes used only for PO boxes or one large organization have no area of their own, and a ZIP created after 2020 is not in the file. Find the county from the street address. |
| 10463 | ZIP 10463 crosses 2 counties: 95.75% of its land is in Bronx County, NY (FIPS 36005), then New York County, NY (36061) 4.25%, by the Census 2020 ZCTA file. |
| 77002 | ZIP 77002 is in Harris County, TX (FIPS 48201): all of its land, by the Census 2020 ZCTA file. |

## Which one to use

- **Reporting by county:** use the county with the largest share, and say which file and share you used.
- **Splitting counts:** multiply by each county's share; land share is not a share of people.
- **Mailing and tax:** place each street address; a ZIP-level answer is not enough where the county decides a rate.

## Check your ZIP codes

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=10463)

> Answers come from the Census 2020 ZCTA5-county relationship file, OMB's July 2023 metro area delineation and the ONS Postcode Directory (August 2026). A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. County shares are by land area, not by addresses or population.

## Sources

- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)
- [U.S. Census Bureau: 2020 relationship files](https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2020.html)

## Questions

### What is a ZCTA?

A ZIP Code Tabulation Area: the Census Bureau's area for a ZIP code, built from census blocks. The 2020 ZCTA-county file has 33,791.

### Why is ZIP 00501 not found?

It has no ZCTA in the Census 2020 file. ZIP codes used only for PO boxes or by one organization have no area of their own.

### Should I use land share or address share?

Land share (this tool, from the Census file) suits maps and area statistics. Address share (HUD's USPS crosswalk, behind a login) suits counting people or customers. For one address, place the street address itself.

## Related

- [ZIP codes that cross county lines](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zips-that-cross-county-lines/)
- [ZIP to county in Excel](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-county-in-excel/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-vs-zcta/  
Data as of: 2026-11-07
