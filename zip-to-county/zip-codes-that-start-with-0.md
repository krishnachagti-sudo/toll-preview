# ZIP codes that start with 0

2,583 of the 33,791 ZIP code areas in the Census 2020 file start with 0, in 10 states and territories, from Puerto Rico (006) to New Jersey (08). A spreadsheet reads 02134 as the number 2134; keep ZIP columns as text, or rebuild them with =TEXT(A2,"00000").

## Where the 0 ZIP codes are

ZCTAs starting with 0, each counted in the state of its largest county (Census 2020 ZCTA file).

| State or territory | ZCTAs | First | Last |
| --- | ---: | --- | --- |
| Puerto Rico | 132 | 00601 | 00987 |
| United States Virgin Islands | 6 | 00802 | 00851 |
| Massachusetts | 539 | 01001 | 02791 |
| Rhode Island | 81 | 02802 | 02921 |
| New Hampshire | 246 | 03031 | 03897 |
| Maine | 427 | 03579 | 04992 |
| Vermont | 265 | 05001 | 05907 |
| Connecticut | 288 | 06001 | 06907 |
| New York | 1 | 06390 | 06390 |
| New Jersey | 598 | 07001 | 08904 |

The Puerto Rico and United States Virgin Islands ZIP codes start with 00, so they lose two digits. A ZIP that shows as 3 or 4 digits was almost certainly cut down this way.

## Keep the 0 when you open a file

- Excel: use Data \> From Text/CSV and set the ZIP column to Text before you load it. Double-clicking a CSV opens it with numbers converted.
- Google Sheets: format the column as Plain text before you paste.
- In code: read the column as a string (in pandas, dtype={"zip": str}).

## Restore a column that lost it

```excel
=TEXT(A2,"00000")
```

This works in Excel and Google Sheets for 5-digit ZIPs. For ZIP+4 stored as a number, use =TEXT(A2,"00000-0000"). Then copy the column and paste it as values, so the result stays text.

## Or let the lookup do it

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=2134)

> Answers come from the Census 2020 ZCTA5-county relationship file, OMB's July 2023 metro area delineation and the ONS Postcode Directory (August 2026). A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. County shares are by land area, not by addresses or population.

## Sources

- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)

## Questions

### Which states have ZIP codes starting with 0?

Puerto Rico, United States Virgin Islands, Massachusetts, Rhode Island, New Hampshire, Maine, Vermont, Connecticut and New Jersey, in the Census 2020 ZCTA file. Puerto Rico and the Virgin Islands start with 00.

### Why does Excel turn 02134 into 2134?

It reads the cell as a number, and a number has no leading zero. Set the column to Text before pasting or importing, or rebuild it with =TEXT(A2,"00000").

### Does a county FIPS code lose its zero the same way?

Yes: Alabama counties start with 01 (Autauga County is 01001). Keep FIPS codes as 5-character text.

### Does the lookup accept a ZIP without its zero?

Yes: 2134 is read as 02134, with a note saying so.

## Related

- [ZIP code to county in Excel](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-county-in-excel/)
- [ZIP to FIPS for a grant report](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-fips-for-grant-reports/)
- [County FIPS codes](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/county-fips-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-codes-that-start-with-0/  
Data as of: 2026-11-07
