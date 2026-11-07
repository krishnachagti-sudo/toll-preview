# Endwise ZIP to county vs the Census Geocoder

The Census Geocoder places a full street address in its county, with an upper limit of 10,000 records per batch file; it needs the street. A ZIP lookup needs only the ZIP: 77002 gives Harris County, TX (48201), and a ZIP across county lines gives each county with its share.

## Side by side

Census Geocoder facts from the Census Bureau's own pages, read November 8, 2026.

| What | Census Geocoder | Endwise ZIP to county |
| --- | --- | --- |
| Input | A street address (structure number and street name required), or coordinates | A ZIP code (ZIP+4 and lost zeros accepted) or a UK postcode |
| Answer | The county and other Census geographies of the matched point | Every county the ZIP code area touches, with FIPS, share of land, metro area and region |
| Batch | Up to 10,000 records per batch file | Up to 10,000 codes per call |
| Coverage | The United States, Puerto Rico and the U.S. Island Areas | US ZIP code areas (Census 2020) and Great Britain postcodes |
| Cost | Not stated on its page; our test request on November 8, 2026 needed no API key | One code or one county list free on the page; lists, REST and MCP paid per code found |

## When the Census Geocoder is better

- You have full street addresses and need the exact county of each, for example for a tax rate or an eligibility rule.
- A record sits in a ZIP that crosses a county line, and a share is not good enough.
- You also want the census tract or block of each address.

## When a ZIP lookup is better

- You only have ZIP codes, such as from a form, a survey or a sales report.
- You want to know how much of a ZIP falls in each county before deciding a method (see [the grant report method](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-fips-for-grant-reports/)).
- You also have UK postcodes in the same list.

A common pattern uses both: look up every ZIP, then geocode only the addresses in ZIPs that cross a county line ([the list of those ZIPs](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zips-that-cross-county-lines/)).

## Try a ZIP

[Look them up](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/?q=77002)

> Answers come from the Census 2020 ZCTA5-county relationship file, OMB's July 2023 metro area delineation and the ONS Postcode Directory (August 2026). A ZCTA is the Census Bureau's area for a ZIP code; USPS ZIP codes are delivery routes and change. County shares are by land area, not by addresses or population.

## Sources

- [U.S. Census Bureau: Census Geocoder (read November 8, 2026)](https://geocoding.geo.census.gov/geocoder/)
- [U.S. Census Bureau: Geocoding Services API documentation, last updated 02/2026 (read November 8, 2026)](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.pdf)
- [U.S. Census Bureau: 2020 ZCTA5 to County relationship file (read 2026-11-07)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt)

## Questions

### Can the Census Geocoder take just a ZIP code?

Its API documentation lists the structure number and street name as required; city, state and ZIP are optional. So it places addresses, not bare ZIP codes.

### How many addresses can the Census Geocoder do at once?

Its documentation gives an upper limit of 10,000 records per batch file.

### Which is more exact?

The Geocoder, for a street address it can match: it returns the county of that point. A ZIP lookup gives every county the ZIP touches, with shares.

## Related

- [ZIP to FIPS for a grant report](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-to-fips-for-grant-reports/)
- [How current the data is](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/how-current-is-the-data/)
- [ZIP code vs ZCTA](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/zip-vs-zcta/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/vs-census-geocoder/  
Data as of: 2026-11-08
