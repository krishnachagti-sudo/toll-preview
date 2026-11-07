# ZIP code to county crosswalk

The Census 2020 ZCTA-county file pairs 33,791 ZIP code areas (ZCTAs) with 3,232 counties in 46,953 land parts; this crosswalk gives each part's county FIPS, share of the ZCTA's land and metro area, largest county first, as one CSV.

- ZCTAs: 33,791
- Counties with ZCTA land: 3,232
- ZCTA-county parts: 46,953

## Look up a list instead

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=10463)

## What is in the CSV

One row per ZCTA and county with land in it; a ZCTA's rows are largest share first.

| Column | What it holds |
| --- | --- |
| zcta | The 5-digit ZCTA, as text (keep the leading zero). |
| county\_fips | The 5-digit county FIPS code (state 2 + county 3). |
| county\_name, state | The county's name and state abbreviation. |
| share\_percent | The county's share of the ZCTA's land, two decimals. |
| largest | yes for the county with the most of the ZCTA's land. |
| land\_m2 | The land area of the part in square metres, from the Census file. |
| cbsa\_code | The county's metro or micro area (OMB July 2023), blank outside one. |

## By state

Each state page has its own crosswalk CSV.

- [Alabama](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/alabama/)
- [Alaska](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/alaska/)
- [Arizona](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/arizona/)
- [Arkansas](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/arkansas/)
- [California](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/california/)
- [Colorado](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/colorado/)
- [Connecticut](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/connecticut/)
- [Delaware](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/delaware/)
- [District of Columbia](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/district-of-columbia/)
- [Florida](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/florida/)
- [Georgia](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/georgia/)
- [Hawaii](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/hawaii/)
- [Idaho](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/idaho/)
- [Illinois](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/illinois/)
- [Indiana](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/indiana/)
- [Iowa](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/iowa/)
- [Kansas](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/kansas/)
- [Kentucky](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/kentucky/)
- [Louisiana](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/louisiana/)
- [Maine](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/maine/)
- [Maryland](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/maryland/)
- [Massachusetts](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/massachusetts/)
- [Michigan](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/michigan/)
- [Minnesota](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/minnesota/)
- [Mississippi](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/mississippi/)
- [Missouri](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/missouri/)
- [Montana](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/montana/)
- [Nebraska](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/nebraska/)
- [Nevada](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/nevada/)
- [New Hampshire](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/new-hampshire/)
- [New Jersey](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/new-jersey/)
- [New Mexico](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/new-mexico/)
- [New York](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/new-york/)
- [North Carolina](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/north-carolina/)
- [North Dakota](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/north-dakota/)
- [Ohio](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/ohio/)
- [Oklahoma](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/oklahoma/)
- [Oregon](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/oregon/)
- [Pennsylvania](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/pennsylvania/)
- [Puerto Rico](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/puerto-rico/)
- [Rhode Island](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/rhode-island/)
- [South Carolina](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/south-carolina/)
- [South Dakota](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/south-dakota/)
- [Tennessee](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/tennessee/)
- [Texas](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/texas/)
- [Utah](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/utah/)
- [Vermont](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/vermont/)
- [Virginia](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/virginia/)
- [Washington](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/washington/)
- [West Virginia](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/west-virginia/)
- [Wisconsin](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/wisconsin/)
- [Wyoming](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/state/wyoming/)

## The first rows

The first 12 parts, in ZCTA order.

| ZCTA | County FIPS | County | Share |
| --- | --- | --- | ---: |
| 00601 | 72001 | Adjuntas Municipio, PR | 98.76% |
| 00601 | 72141 | Utuado Municipio, PR | 1.24% |
| 00602 | 72003 | Aguada Municipio, PR | 99.98% |
| 00602 | 72011 | Añasco Municipio, PR | 0.02% |
| 00603 | 72005 | Aguadilla Municipio, PR | 99.76% |
| 00603 | 72099 | Moca Municipio, PR | 0.24% |
| 00606 | 72093 | Maricao Municipio, PR | 82.27% |
| 00606 | 72153 | Yauco Municipio, PR | 11.67% |
| 00606 | 72121 | Sabana Grande Municipio, PR | 6.06% |
| 00610 | 72011 | Añasco Municipio, PR | 96.76% |
| 00610 | 72099 | Moca Municipio, PR | 2.8% |
| 00610 | 72083 | Las Marías Municipio, PR | 0.36% |

> Answers come from the Census 2020 ZCTA5-county relationship file, OMB's July 2023 metro area delineation and the ONS Postcode Directory (August 2026). A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. County shares are by land area, not by addresses or population.

## Sources

- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)
- [OMB July 2023 delineation, Census list 1 (read 2026-11-07)](https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx)
- [U.S. Census Bureau: 2020 relationship files](https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2020.html)

## Questions

### Where can I download a ZIP to county crosswalk?

The CSV on this page has every ZCTA-county part from the Census 2020 ZCTA5-county relationship file, with shares worked out. The Census file itself is free at www2.census.gov; HUD publishes a quarterly USPS ZIP crosswalk with address ratios behind a login.

### Is a ZCTA the same as a ZIP code?

Nearly: a ZCTA is the Census Bureau's area for a ZIP code, built from census blocks. ZIP codes used only for PO boxes or one organization have no ZCTA.

## Related

- [ZIP codes that cross county lines](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zips-that-cross-county-lines/)
- [ZIP to county in Excel](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-county-in-excel/)
- [ZIP code to metro area (CBSA)](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-cbsa/)
- [UK postcode to local authority](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/uk-postcode-to-local-authority/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/crosswalk/  
Data as of: 2026-11-07  
CSV: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/crosswalk.csv
