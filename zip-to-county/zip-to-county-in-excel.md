# ZIP code to county in Excel

To add a county to a column of ZIP codes in Excel, download your state's crosswalk CSV, import its zcta and county\_fips columns as text, and look each ZIP up with =XLOOKUP(TEXT(A2,"00000"), Crosswalk!A:A, Crosswalk!C:C): the first match is the county with the largest share, so 2134 becomes 02134, Suffolk County, MA.

## The formulas

```excel
=XLOOKUP(TEXT(A2,"00000"), Crosswalk!A:A, Crosswalk!C:C, "not found")
```

```excel
=COUNTIF(Crosswalk!A:A, TEXT(A2,"00000")) > 1
```

In Google Sheets, XLOOKUP works the same way; on older Excel use =INDEX(Crosswalk!C:C, MATCH(TEXT(A2,"00000"), Crosswalk!A:A, 0)).

## Two ZIP codes, worked out

From the lookup, with the Census 2020 ZCTA file.

| You typed | ZIP | County | FIPS | Share |
| --- | --- | --- | --- | ---: |
| 2134 | 02134 | Suffolk County, MA | 25025 | 100% |
| 10463 | 10463 | Bronx County, NY | 36005 | 95.75% |
| 10463 | 10463 | New York County, NY | 36061 | 4.25% |

## Or skip the formulas

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=2134)

> Answers come from the Census 2020 ZCTA5-county relationship file, OMB's July 2023 metro area delineation and the ONS Postcode Directory (August 2026). A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. County shares are by land area, not by addresses or population.

## Sources

- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)

## Steps

1. **Download the crosswalk.** Open your state's page (or the national crosswalk) and download "The table as CSV".
2. **Import it as text.** In Excel use Data \> From Text/CSV, and set the zcta and county\_fips columns to Text so 02134 keeps its 0. Name the sheet Crosswalk.
3. **Repair your ZIP column.** If your ZIPs lost their zeros, use =TEXT(A2,"00000") in a new column; for ZIP+4 use =LEFT(A2,5).
4. **Look up the county.** Use =XLOOKUP(TEXT(A2,"00000"), Crosswalk!A:A, Crosswalk!C:C, "not found") for the county name, or column B for the FIPS code. The first match is the largest county.
5. **Flag split ZIPs.** Add =COUNTIF(Crosswalk!A:A, TEXT(A2,"00000")) \> 1: TRUE means the ZIP has land in more than one county, so check those addresses or split the counts by share\_percent.

## Questions

### Why did Excel turn 02134 into 2134?

It read the ZIP as a number. Format the column as Text before pasting, or rebuild it with =TEXT(A2,"00000").

### What does XLOOKUP return for a ZIP in two counties?

The first row, which in these CSVs is the county with the largest share. ZIP 10463 gives Bronx County, NY (95.75%); New York County, NY has the rest.

### Can I do it without a spreadsheet formula?

Yes: paste the column into the lookup and download the result as a CSV, one row per ZIP and county.

## Related

- [ZIP code to county crosswalk](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/crosswalk/)
- [ZIP codes that cross county lines](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zips-that-cross-county-lines/)
- [ZIP code vs ZCTA](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-vs-zcta/)
- [ZIP codes that start with 0](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-codes-that-start-with-0/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-county-in-excel/  
Data as of: 2026-11-07
