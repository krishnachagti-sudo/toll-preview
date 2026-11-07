# How current is the ZIP and postcode data?

The US answers come from the Census 2020 ZCTA-county file (33,791 ZCTAs) and OMB's July 2023 metro areas; the UK answers from the ONS Postcode Directory, August 2026 (1,749,110 live and 903,514 terminated postcodes). ONS releases quarterly, in February, May, August and November; the ZCTA-county file used here is the 2020 vintage.

## Each source and its date

Downloaded and checked on the dates shown; every answer names its file.

| Source | Vintage | Read | What it holds |
| --- | --- | --- | --- |
| Census ZCTA5 to County relationship file | 2020 | 2026-11-07 | 33,791 ZCTAs in 46,953 land parts, 10,180 in more than one county |
| Census national county codes | 2020 | 2026-11-07 | 3,234 counties and equivalents |
| OMB metro and micro area delineation | July 2023 | 2026-11-07 | 928 CBSAs |
| ONS Postcode Directory | August 2026 | 2026-11-07 | 1,749,110 live and 903,514 terminated postcodes in 350 local authorities |

## What a code newer than the file returns

- **A US ZIP with no ZCTA:** the lookup says so and asks for the street address. For example: "ZIP 00501 has no ZCTA in the Census 2020 file. ZIP codes used only for PO boxes or one large organization have no area of their own, and a ZIP created after 2020 is not in the file. Find the county from the street address."
- **A UK postcode issued after the release:** not in the directory; ONS adds it in a later release.
- **A terminated UK postcode:** kept by ONS with the areas of its last location, and marked terminated.

Not-found codes are not charged. For one address that must be placed exactly, geocode it: see [the Census Geocoder comparison](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/vs-census-geocoder/).

## Known gaps

- Connecticut: the 2020 counties, not the planning regions newer Census data uses ([details](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/connecticut-planning-regions/)).
- Northern Ireland (BT) postcodes are not covered.
- County shares are by land area, not by addresses or population.

## Check a code

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=77002)

## Sources

- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)
- [OMB July 2023 delineation, Census list 1 (read 2026-11-07)](https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx)
- [ONS Postcode Directory (August 2026), ONS Open Geography Portal (read 2026-11-07)](https://geoportal.statistics.gov.uk/)
- [ONS: Postcode products (read November 8, 2026)](https://www.ons.gov.uk/methodology/geography/geographicalproducts/postcodeproducts)

## Questions

### How often does the UK postcode data change?

ONS releases its postcode products quarterly, in February, May, August and November. The lookup moves to a new release with a deploy, and every answer names the release it used.

### Why is a new ZIP code not found?

ZIP 00501 has no ZCTA in the Census 2020 file. ZIP codes used only for PO boxes or one large organization have no area of their own, and a ZIP created after 2020 is not in the file. Find the county from the street address.

### Is a 2020 file too old for ZIP to county?

County lines rarely move, so most ZIP code areas still fall where they did. The risks are ZIPs created since 2020 and Connecticut, whose newer Census data uses planning regions.

## Related

- [ZIP code vs ZCTA](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-vs-zcta/)
- [Connecticut counties vs planning regions](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/connecticut-planning-regions/)
- [UK postcode to local authority](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/uk-postcode-to-local-authority/)
- [Compared with the Census Geocoder](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/vs-census-geocoder/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/how-current-is-the-data/  
Data as of: 2026-11-07
