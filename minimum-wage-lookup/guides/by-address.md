# How to Find the Minimum Wage at an Exact Address

Use the street address, not the ZIP code: on November 8, 2026 a site inside Los Angeles city limits owes $18.42 an hour while one in unincorporated Los Angeles County owes $18.47, and a ZIP code can hold both.

## Try an address

[Look up the rate](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/?address=200+N+Spring+St%2C+Los+Angeles%2C+CA+90012&date=2026-11-08)

## Why a ZIP code is not enough

ZIP codes are mail delivery routes. The Census Bureau's ZIP code areas (ZCTAs) cross city limits and county lines; ZIP 94025, for example, is about three quarters in Menlo Park, which sets its own rate, and the rest is outside it. The lookup lists each part of such a ZIP with its rate and asks for the address.

## Dates

Each rate is stored with its effective date, so a past payroll date gets the rate then and a future one gets the announced rate, or "not covered" when the city or state has not published it.

> Not legal advice. The rate shown is the highest general minimum wage we hold for the place and date; industry, hotel, health care, youth, training and other special rates can differ. Every rate names the official page it was read from and the date we read it. Places and states whose pages we could not read are listed as not covered, never guessed. Employers covered by the federal Fair Labor Standards Act pay at least the federal $7.25; state laws differ on which employers they cover.

- [U.S. Census Bureau geocoder](https://geocoding.geo.census.gov/geocoder/)
- [Census 2020 ZCTA5 to Place relationship file, read November 8, 2026](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_place20_natl.txt)

## Steps

1. **Use the work address.** Local minimum wages follow where the work is performed, so start from the street address of the work site.
2. **Find the city and county.** The Census Bureau geocoder returns the incorporated place (or none, if the address is unincorporated) and the county.
3. **Stack the rates for the date.** Federal, state, county and city rates in force on that date, with the employer-size tier.
4. **Pay the highest.** The highest applicable rate is the minimum wage; note the next change date.

## Questions

### Can I look up minimum wage by ZIP code?

Only approximately: a ZIP can cross city and county lines, so an address is needed to tell, for example, Los Angeles city from unincorporated Los Angeles County.

## Related

- [Which rate applies](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/which-rate-applies/)
- [Multi-location audit](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/guides/multi-location/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/guides/by-address/  
Data as of: 2026-11-08
