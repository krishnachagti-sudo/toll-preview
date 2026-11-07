# ZIP to county FIPS for a grant or census report

Look up each ZIP's counties, then either count every client in the ZIP's largest county or split each ZIP by its counties' shares. In this 10-ZIP example of 885 households, 6 ZIPs cross a county line, and Travis County (48453) gets 650 households by largest county or 628.6 split by land share.

## The 10 ZIPs

Made-up households served; counties and shares from the lookup (Census 2020 ZCTA file, shares by land area).

| ZIP | Households | Counties (FIPS, share of land) |
| --- | ---: | --- |
| 78701 | 40 | Travis County 48453 100% |
| 78704 | 220 | Travis County 48453 100% |
| 78613 | 90 | Williamson County 48491 88.63%; Travis County 48453 11.37% |
| 78660 | 150 | Travis County 48453 100% |
| 78641 | 75 | Travis County 48453 62.88%; Williamson County 48491 37.12% |
| 78664 | 60 | Williamson County 48491 85.63%; Travis County 48453 14.37% |
| 78617 | 110 | Travis County 48453 78.41%; Bastrop County 48021 21.59% |
| 78610 | 85 | Hays County 48209 71.42%; Travis County 48453 26.21%; Caldwell County 48055 2.36% |
| 78734 | 30 | Travis County 48453 100% |
| 78652 | 25 | Travis County 48453 56.42%; Hays County 48209 43.58% |

## Totals by county, both methods

Largest county: each ZIP's whole count to the county with the most of its land. Split: count × share, rounded to one decimal.

| County FIPS | County | Largest county | Split by share |
| --- | --- | ---: | ---: |
| 48021 | Bastrop County, TX | 0 | 23.7 |
| 48055 | Caldwell County, TX | 0 | 2 |
| 48209 | Hays County, TX | 85 | 71.6 |
| 48453 | Travis County, TX | 650 | 628.6 |
| 48491 | Williamson County, TX | 150 | 159 |

Both columns add up to the same total. The gap between them is the uncertainty a ZIP-level method carries; if it matters for the report, geocode the addresses in the split ZIPs.

## How to state the method

```text
Clients were assigned to counties by ZIP code using the U.S. Census Bureau 2020 ZCTA-to-county relationship file. ZIP codes spanning more than one county were assigned to the county containing the largest share of the ZIP code's land area. ZIP codes with no ZCTA (PO box and single-organization ZIPs) were placed from street addresses.
```

## Look up your list

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=78701%2C+78704%2C+78613%2C+78660%2C+78641%2C+78664%2C+78617%2C+78610%2C+78734%2C+78652)

> Answers come from the Census 2020 ZCTA5-county relationship file, OMB's July 2023 metro area delineation and the ONS Postcode Directory (August 2026). A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. County shares are by land area, not by addresses or population.

## Sources

- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)
- [U.S. Census Bureau: 2020 relationship files](https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2020.html)

## Steps

1. **Clean the ZIPs.** Keep them as 5-character text (restore lost leading zeros) and cut ZIP+4 to the first 5 digits.
2. **Look them up.** Paste the list into the lookup and download the CSV: one row per ZIP and county, with the county FIPS, its share and a largest flag.
3. **Choose a method.** Either count each ZIP in its largest county, or split each ZIP's count across its counties by share.
4. **Total by county FIPS.** Sum your counts per county\_fips with a pivot table.
5. **Check what was not found.** PO-box and single-organization ZIPs have no area; place those records from their street address.
6. **State the method.** Name the file, its year, the method and that shares are by land area.

## Questions

### Should a split ZIP go to one county or be divided?

Either is defensible if you say which. One county per ZIP keeps whole people in one place; splitting by share keeps county totals closer when many records sit in split ZIPs. Ask the funder if they have a rule.

### Is the share a share of people?

No. In this lookup it is the share of the ZIP code area's land in each county, from the Census 2020 ZCTA file. Land share is not population share: a ZIP's homes can sit mostly in its smaller county.

### What if the funder wants exact counties?

Then a ZIP is not enough for records in split ZIPs: geocode those street addresses (the Census Geocoder does this) and use the county it returns.

## Related

- [ZIP codes that cross county lines](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zips-that-cross-county-lines/)
- [Every ZIP code in a county](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-codes-in-a-county/)
- [ZIP codes that start with 0](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-codes-that-start-with-0/)
- [ZIP code vs ZCTA](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-vs-zcta/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-fips-for-grant-reports/  
Data as of: 2026-11-07
