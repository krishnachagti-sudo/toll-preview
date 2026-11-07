# Connecticut: counties vs planning regions

This lookup places Connecticut ZIP codes in the 8 counties of the Census 2020 file (FIPS 09001 to 09015): 06103 is Hartford County, CT, 09003. Census data from 2022 on uses Connecticut's 9 planning regions (09110 to 09190) as county equivalents instead, so use them when you join to newer data.

## What changed

The Census Bureau says its 2022 ACS data products generally reflect Connecticut's nine Councils of Governments (planning regions) as county-equivalent units, replacing the eight counties, which ceased to function as governmental and administrative entities in 1960. The 2022 TIGER/Line files include the planning regions, and the Bureau published special 2022 relationship files for Connecticut.

## The 8 counties this lookup uses

Census 2020 county codes; ZCTAs with any land in each (288 Connecticut ZCTAs in all, 11 of them in more than one county or state).

| FIPS | County | ZCTAs |
| --- | --- | ---: |
| 09001 | Fairfield County | 46 |
| 09003 | Hartford County | 61 |
| 09005 | Litchfield County | 42 |
| 09007 | Middlesex County | 25 |
| 09009 | New Haven County | 41 |
| 09011 | New London County | 34 |
| 09013 | Tolland County | 18 |
| 09015 | Windham County | 32 |

## The 9 planning regions in newer Census data

As listed by the Census Bureau's TIGERweb (ACS 2026 vintage). Planning regions do not follow county lines, so there is no one-to-one table between the two.

| FIPS | Planning region |
| --- | --- |
| 09110 | Capitol Planning Region |
| 09120 | Greater Bridgeport Planning Region |
| 09130 | Lower Connecticut River Valley Planning Region |
| 09140 | Naugatuck Valley Planning Region |
| 09150 | Northeastern Connecticut Planning Region |
| 09160 | Northwest Hills Planning Region |
| 09170 | South Central Connecticut Planning Region |
| 09180 | Southeastern Connecticut Planning Region |
| 09190 | Western Connecticut Planning Region |

## Which to use

- **Joining to ACS 2022 or later, or 2022 TIGER/Line:** planning regions. Use the Census Bureau's 2022 Connecticut relationship files to place areas in them.
- **Joining to the 2020 Census or older files kept by county:** the 2020 counties, as this lookup gives them.
- **Metro areas:** OMB's 2023 delineation is built from the planning regions, so this lookup gives no CBSA for a Connecticut county. See [ZIP code to metro area](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-cbsa/).

## Look up a Connecticut ZIP

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=06103)

> Answers come from the Census 2020 ZCTA5-county relationship file, OMB's July 2023 metro area delineation and the ONS Postcode Directory (August 2026). A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. County shares are by land area, not by addresses or population.

## Sources

- [U.S. Census Bureau: Change to County-Equivalents in the State of Connecticut for 2022 ACS (user note, revised December 1, 2023; read November 8, 2026)](https://www.census.gov/programs-surveys/acs/technical-documentation/user-notes/2023-01.html)
- [U.S. Census Bureau: Final Change to County Equivalents in Connecticut](https://www2.census.gov/geo/pdfs/reference/ct_county_equiv_change.pdf)
- [U.S. Census Bureau TIGERweb: Connecticut county equivalents, ACS 2026 vintage (read November 8, 2026)](https://tigerweb.geo.census.gov/tigerwebmain/Files/acs26/tigerweb_acs26_county_ct.html)
- [U.S. Census Bureau: 2022 relationship files (special Connecticut files)](https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2022.html)
- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)

## Questions

### Does Connecticut still have counties?

The eight counties ceased to function as governmental and administrative entities in 1960, in the Census Bureau's words. Census data from 2022 on uses the nine planning regions as county equivalents instead.

### What county is ZIP 06103 in?

ZIP 06103 is in Hartford County, CT (FIPS 09003): all of its land, by the Census 2020 ZCTA file.

### Why does the lookup give no metro area for Connecticut?

OMB's 2023 metro areas are built from the planning regions, not from the 2020 counties this lookup uses, so a Connecticut county has no CBSA here.

### Which should I use?

Match the data you join to. Data from 2022 on (ACS 2022 and later, 2022 TIGER/Line) uses planning regions; the 2020 Census and older files use the counties.

## Related

- [Connecticut ZIP code to county crosswalk](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/connecticut/)
- [County FIPS codes](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/county-fips-codes/)
- [How current the data is](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/how-current-is-the-data/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/connecticut-planning-regions/  
Data as of: 2026-11-07
