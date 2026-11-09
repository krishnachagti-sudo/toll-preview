# How the minimum wage at a US work place is found

The rate is the highest of the federal $7.25 (since July 24, 2009), the state rate and any county or city rate in force at the place on the date. Los Angeles, California on November 8, 2026, for example, is $18.42 an hour, set by the city over the state's $16.90. Places whose official pages could not be read are not covered, never guessed.

## What does the minimum wage lookup by address compute?

Given a street address, a ZIP code, or a state with an optional city or county, and a date, the tool gives the legal minimum wage and the tipped cash wage there: the highest of the federal, state, county and city rates, which government sets it, since when, and the next scheduled change, each rate with the official page it was read from and the date. It also lists every known change in a date window. Rates come from the U.S. Department of Labor's state and tipped tables, 16 state pages, and 51 city and county pages read on November 8, 2026. Not legal advice. The rate shown is the highest general minimum wage we hold for the place and date; industry, hotel, health care, youth, training and other special rates can differ.

Operations (the op field):

- `lookup`: Answers up to 1,000 places for one date (today when none is given), each with its rate, the government that sets it, the date it started, the tipped cash wage, every layer from federal to city, rates that may also apply, places not covered, notes and the next change; a summary of how many were answered, and a CSV.
- `changes`: Lists every dated minimum wage change in the state and local data in a window of at most 800 days, for one state or all of them with the cities and counties covered: the date, the place, the new and previous rate, the tipped cash wage, any size tiers or regions, and the source page.

Inputs:

- `places`: For lookup: 1 to 1,000 places, each given one way only: address (a full street address, at most 100 in one call), zip (a 5-digit ZIP code), or state (a two-letter code or name) with an optional city or county.
- `county, unincorporated`: A county by name or 5-digit FIPS code from the Census 2020 county list; unincorporated true means outside any city, and needs the county.
- `label`: An optional name for a place, such as a store number, carried into the answer and the CSV.
- `date`: The day to answer for, written like 2027-01-01, from 2009-07-24 to 2030-12-31. Today when left out.
- `employees`: The number of employees, for places that set rates by employer size.
- `from, to, state`: For changes: the first and last day of the window (at most 800 days apart) and an optional two-letter state.

Outputs:

- answer: the rate in a sentence, who sets it and since when, the tipped cash wage and the next change
- rate, setBy, since and tippedCash, with status: answered, depends (a higher rate may apply) or not-covered
- layers: the federal, state, county and city rates in force, each with its tier, region and source page
- possible and notCovered: rates that apply only in part of the place, and places or states we could not read, with the reason
- next: the date and rate of the next change, or that the new rate is not covered yet
- for a ZIP code across a city or county line: each part's answer and the low and high rate
- summary and csv (lookup), changes and notCovered (changes)

## How is it calculated, step by step?

1. Where the work is: a street address goes to the U.S. Census Bureau geocoder, which returns the state, the county and the incorporated place, or none when the address is unincorporated (four addresses at a time, 10 seconds each). A ZIP code is read with the Census 2020 ZCTA files: its counties, and the cities with their own rate it has land in, with the share of land in each (722 ZIP code areas). A state with a city or county is read from the names.
2. The layers: the federal $7.25 under the FLSA; the state rate, which is DOL's table on its page date (November 5, 2026) with any dated step or announced change from the state's own page; then each covered county and city ordinance that reaches the place.
3. A city ordinance applies inside that city. A county-wide ordinance applies across the county; an ordinance for unincorporated areas applies only outside any city. A county ordinance a city may opt out of is shown as possible inside a city, and a city with its own ordinance (Chicago) follows its own.
4. The rate is the highest layer; on a tie, the more local government is named as setting it. "Since" is the first day of the run of steps with that same rate, so a restated rate does not restart it.
5. Employer size: with employees given, the tier that fits is used and the other tiers are listed as notes. Regions: New York by county (New York City, Long Island and Westchester and Remainder of New York State), and Oregon by county, where the Portland metro rate inside the urban growth boundary is shown as possible.
6. The tipped cash wage of each layer is its stated cash wage, the full rate where the state allows no tip credit (AK, CA, MN, MT, NV, OR and WA), or the rate less the city's tip credit; the highest is shown, and unknown if any layer's is not stated.
7. The next change is the first later date on which the highest rate changes, within the data held. A local rate is known to the day before its next yearly adjustment after the last step read; past that the answer says the rate changes but the new rate is not covered yet.
8. If a layer that applies could not be read, the status is not-covered and the answer says the rate is at least the rate of the other layers. A ZIP code that crosses a city or county line gives each part's answer and the range, and asks for the street address.
9. Rates are worked in thousandths of a dollar, because South Dakota's tipped cash wage is $5.925. The change list keeps a step whose rate equals the previous one only when a size tier changes.

**Federal and state rates.**

The federal $7.25 and $2.13 tipped cash wage, and each state's basic rate and tipped wage, are DOL's tables, updated November 5, 2026 and read November 8, 2026. The state table is shared, read-only, with the cleaning bid calculator, so both show the same rates.

Dated steps and announced changes come from 16 state pages, each read November 8, 2026 with the sentence quoted. 13 states' own pages could not be read (AZ, CA, CO, CT, DC, DE, HI, MI, MO, NE, NM, NV and RI): their rate in force comes from DOL's table, and dates past the last one held are not covered.

**City and county rates.**

51 cities and counties, each read on its own official page on November 8, 2026 with the sentence quoted. The UC Berkeley Labor Center inventory (updated July 23, 2026) was the list of places to read, not a source of rates.

19 places with an ordinance could not be read and are named with the reason: Belmont, Fremont, Mountain View, Novato, Redwood City, San Carlos, San Jose, Santa Clara, Sunnyvale, West Hollywood, Foster City, Edgewater, Las Cruces, Portland, Omaha, Lincoln, San Leandro, Bernalillo County (unincorporated) and Prince George's County.

## Which edge cases does it handle?

- Los Angeles from July 1, 2027: the city adjusts its rate every July 1 and had not published the new one, so the answer says the rate changes but is not covered yet.
- Montgomery County, Maryland sets three rates by employer size; with 8 employees it is the small employer rate, and the others are listed.
- Evanston, Illinois: Cook County's ordinance applies only if the city has not opted out, so the answer is the state rate with the county rate as possible.
- A date before the first rate held for a state or city, or outside 2009-07-24 to 2030-12-31, is not covered or refused. A ZIP code not in the Census 2020 files (such as a PO box ZIP) is not found.
- When the geocoder fails or finds no match, that address is reported, not guessed, and not charged; the other places still answer.
- A CSV cell starting with =, +, - or @ is prefixed so a spreadsheet does not run it.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Los Angeles on November 8, 2026**

```json
{
  "op": "lookup",
  "places": [
    {
      "state": "CA",
      "city": "Los Angeles"
    }
  ],
  "date": "2026-11-08"
}
```

Los Angeles on November 8, 2026

| Result | Value |
| --- | --- |
| answer | In Los Angeles, California on November 8, 2026 the minimum wage is $18.42 an hour, set by Los Angeles (since July 1, 2026). Tipped employees get the full rate: no tip credit. The rate changes on July 1, 2027, but the new rate is not covered yet. |
| rate | $18.42 |
| set by | Los Angeles (city), since July 1, 2026 |
| layers | federal $7.25, state $16.90, city $18.42 |
| tipped cash wage | $18.42 |

**Montgomery County, Maryland, for an employer of 8**

```json
{
  "op": "lookup",
  "places": [
    {
      "state": "MD",
      "county": "Montgomery County"
    }
  ],
  "date": "2026-11-08",
  "employees": 8
}
```

Montgomery County, Maryland, for an employer of 8

| Result | Value |
| --- | --- |
| answer | In Montgomery County, Maryland on November 8, 2026 the minimum wage is $15.95 an hour, set by Montgomery County (since July 1, 2026). Tipped employees: at least $4.00 an hour in cash wages, with tips making up the rest. The rate changes on July 1, 2027, but the new rate is not covered yet. |
| tier | Small employers (10 or fewer employees) |
| layers | federal $7.25, state $15.00, county $15.95 |
| note 1 | Montgomery County: Mid-sized employers (11 to 50 employees), $16.50. |
| note 2 | Tipped employees: the employer pays at least $4.00 an hour and tips must bring pay to the county rate. |

**ZIP 94025 (Menlo Park) on January 1, 2027, across a city line**

```json
{
  "op": "lookup",
  "places": [
    {
      "zip": "94025"
    }
  ],
  "date": "2027-01-01"
}
```

ZIP 94025 (Menlo Park) on January 1, 2027, across a city line

| Result | Value |
| --- | --- |
| answer | ZIP 94025 crosses a city or county line, so the rate depends on the street address: part of ZIP 94025 in Menlo Park (76% of its land): $18.05; rest of ZIP 94025 in San Mateo County, California (outside Menlo Park): $17.40, or $18.58 in unincorporated San Mateo County (outside any city). Give the street address for the exact rate. |
| status | depends |
| range | $17.40 to $18.58 |

**Five stores in one call on January 1, 2027**

```json
{
  "op": "lookup",
  "date": "2027-01-01",
  "places": [
    {
      "label": "Store 1",
      "state": "WA",
      "city": "Seattle"
    },
    {
      "label": "Store 2",
      "state": "WA",
      "city": "Spokane"
    },
    {
      "label": "Store 3",
      "state": "NY",
      "county": "Kings County"
    },
    {
      "label": "Store 4",
      "state": "IL",
      "city": "Chicago"
    },
    {
      "label": "Store 5",
      "state": "TX",
      "city": "Austin"
    }
  ]
}
```

Five stores in one call on January 1, 2027

| Result | Value |
| --- | --- |
| answer | 5 of 5 places answered for January 1, 2027. |
| Store 1 | $22.14, set by Seattle |
| Store 2 | $17.73, set by Washington |
| Store 3 | $17.00, set by New York |
| Store 4 | $17.05, set by Chicago |
| Store 5 | $7.25, set by Texas |

**Every California change on January 1, 2027**

```json
{
  "op": "changes",
  "from": "2027-01-01",
  "to": "2027-01-01",
  "state": "CA"
}
```

Every California change on January 1, 2027

| Result | Value |
| --- | --- |
| answer | 17 known minimum wage changes between January 1, 2027 and January 1, 2027 in California, from the official pages we read on November 8, 2026. |
| California | $16.90 to $17.40 |
| Burlingame | $17.86 to $18.47 |
| Cupertino | $18.70 to $19.25 |
| Daly City | $17.50 to $18.10 |
| El Cerrito | $18.82 to $19.36 |
| Half Moon Bay | $17.91 to $18.52 |
| Hayward | $17.79 to $18.39 |
| Los Altos | $19.25 |
| Menlo Park | $17.55 to $18.05 |
| Palo Alto | $18.70 to $19.25 |
| Petaluma | $18.31 to $18.93 |
| Richmond | $19.18 to $19.61 |
| San Diego | $17.75 to $18.35 |
| San Mateo | $18.60 to $19.25 |
| San Mateo County (unincorporated) | $17.95 to $18.58 |
| Santa Rosa | $18.21 to $18.83 |
| South San Francisco | $18.75 |

## What does it not do?

- Not legal advice. The rate shown is the highest general minimum wage we hold for the place and date; industry, hotel, health care, youth, training and other special rates can differ.
- 32 states and places are listed as not covered rather than filled in from another source. Employers covered by the federal FLSA pay at least $7.25; state laws differ on which employers they cover.
- A ZIP code that crosses a city or county line cannot be answered exactly without the street address. Not legal advice.

## Where does the data come from, and how fresh is it?

DOL's state and tipped tables were updated November 5, 2026 and read November 8, 2026; state pages were read November 8, 2026 and city and county pages November 8, 2026. Each source page is checked once a day for changes; a change is read again by a person before a data file is edited, with the tests that pin it. Dates past a place's last known rate are answered as not covered.

- [U.S. Department of Labor, Wage and Hour Division: State Minimum Wage Laws (basic minimum rate, non-farm employment) (updated November 5, 2026, read November 8, 2026)](https://www.dol.gov/agencies/whd/minimum-wage/state)
- [U.S. Department of Labor, Wage and Hour Division: Minimum Wages for Tipped Employees (updated November 5, 2026, read November 8, 2026)](https://www.dol.gov/agencies/whd/state/minimum-wage/tipped)
- [Alaska: Alaska Department of Labor and Workforce Development: Wage and Hour (read November 8, 2026)](https://labor.alaska.gov/lss/whhome.htm)
- [California: Office of Governor Gavin Newsom: California will raise statewide minimum wage (July 31, 2026) (read November 8, 2026)](https://www.gov.ca.gov/2026/07/31/governor-newsom-announces-california-will-raise-statewide-minimum-wage/)
- [Massachusetts: Mass.gov: Massachusetts law about minimum wage (read November 8, 2026)](https://www.mass.gov/info-details/massachusetts-law-about-minimum-wage)
- [Maine: Maine Department of Labor: Maine's Minimum Wage to Increase to $15.70 Per Hour in 2027 (read November 8, 2026)](https://www.maine.gov/labor/news_events/article.shtml?id=13362373)
- [Minnesota: Minnesota Department of Labor and Industry: Minimum wage in Minnesota (read November 8, 2026)](https://www.dli.mn.gov/business/employment-practices/minimum-wage-minnesota)
- [Montana: Montana Department of Labor and Industry: Montana's Minimum Wage (read November 8, 2026)](https://erd.dli.mt.gov/labor-standards/wage-and-hour-payment-act/state-minimum-wage)
- [New Jersey: New Jersey Department of Labor: Wage and Hour laws (read November 8, 2026)](https://www.nj.gov/labor/wageandhour/tools-resources/laws/)
- [New York: New York State Department of Labor: Minimum Wage (read November 8, 2026)](https://dol.ny.gov/minimum-wage-0)
- [Ohio: Ohio Department of Commerce: Ohio Minimum Wage to Increase by 3.5% in 2027 (read November 8, 2026)](https://com.ohio.gov/about-us/media-center/news/Ohio-Minimum-Wage-to-Increase-in-2027)
- [Oregon: Oregon Bureau of Labor and Industries: Minimum wage (read November 8, 2026)](https://www.oregon.gov/boli/workers/pages/minimum-wage.aspx)
- [South Dakota: South Dakota Department of Labor and Regulation: Minimum Wage (read November 8, 2026)](https://dlr.sd.gov/employment_laws/minimum_wage.aspx)
- [Virginia: Virginia Department of Labor and Industry: Payment of Wage (read November 8, 2026)](https://doli.virginia.gov/programs/labor-law/payment-of-wage/)
- [Vermont: Vermont Department of Labor: Minimum Wage Increase Starting January 2026 (read November 8, 2026)](https://labor.vermont.gov/press-release/vermont-department-labor-announces-minimum-wage-increase-starting-january-2026)
- [Washington: Washington State Department of Labor and Industries: Minimum wage (read November 8, 2026)](https://lni.wa.gov/workers-rights/wages/minimum-wage/)
- [Illinois: Illinois Department of Labor: Minimum Wage Law (read November 8, 2026)](https://labor.illinois.gov/laws-rules/fls/minimum-wage-law.html)
- [Maryland: Maryland Department of Labor: Wage and Hour Facts (read November 8, 2026)](https://labor.maryland.gov/labor/wages/wagehrfacts.shtml)
- [Alameda, California: City of Alameda: Minimum Wage (read November 8, 2026)](https://www.alamedaca.gov/Departments/Community-Development/Minimum-Wage)
- [Berkeley, California: City of Berkeley: Workforce Standards and Enforcement (read November 8, 2026)](https://berkeleyca.gov/doing-business/operating-berkeley/workforce-standards-and-enforcement)
- [Burlingame, California: City of Burlingame: Minimum Wage Information (read November 8, 2026)](https://burlingame.org/307/Minimum-Wage-Information)
- [Cupertino, California: City of Cupertino: Cupertino Minimum Wage (read November 8, 2026)](https://www.cupertino.org/our-city/city-news/cupertino-minimum-wage)
- [Daly City, California: City of Daly City: Minimum Wage (read November 8, 2026)](https://www.dalycity.org/388/Minimum-Wage)
- [East Palo Alto, California: City of East Palo Alto: Local Minimum Wage (read November 8, 2026)](https://www.ci.east-palo-alto.ca.us/econdev/page/local-minimum-wage)
- [El Cerrito, California: City of El Cerrito: Minimum Wage (read November 8, 2026)](https://www.elcerrito.gov/940/Minimum-Wage-Ordinance)
- [Emeryville, California: City of Emeryville: Minimum Wage Ordinance (read November 8, 2026)](https://www.emeryville.org/Services/Business/Labor-Standards/Minimum-Wage-Ordinance)
- [Half Moon Bay, California: City of Half Moon Bay: Minimum Wage (read November 8, 2026)](https://www.half-moon-bay.ca.us/659/Minimum-Wage)
- [Hayward, California: City of Hayward: Local Minimum Wage (read November 8, 2026)](https://www.hayward-ca.gov/local-minimum-wage)
- [Los Altos, California: City of Los Altos: Minimum Wage (read November 8, 2026)](https://www.losaltosca.gov/511/Minimum-Wage)
- [Los Angeles, California: City of Los Angeles Office of Wage Standards (read November 8, 2026)](https://wagesla.lacity.gov/)
- [Los Angeles County (unincorporated), California: Los Angeles County Department of Consumer and Business Affairs: Minimum Wage (read November 8, 2026)](https://dcba.lacounty.gov/minimum-wage/)
- [Malibu, California: City of Malibu: Minimum Wage (read November 8, 2026)](https://www.malibucity.org/793/Minimum-Wage)
- [Menlo Park, California: City of Menlo Park: Local minimum wage ordinance (read November 8, 2026)](https://menlopark.gov/Government/Departments/City-Managers-Office/Economic-development/Local-minimum-wage-ordinance)
- [Milpitas, California: City of Milpitas: Minimum Wage (read November 8, 2026)](https://www.milpitas.gov/688/Minimum-Wage)
- [Oakland, California: City of Oakland: Minimum Wage, Sick Leave, and Other Labor Laws (read November 8, 2026)](https://www.oaklandca.gov/Government/Departments/Workplace-Employment-Standards/Oakland-Minimum-Wage-Sick-Leave-and-Other-Labor-Laws)
- [Palo Alto, California: City of Palo Alto: Minimum Wage (read November 8, 2026)](https://www.cityofpaloalto.org/Business/Business-Resources/Minimum-Wage)
- [Pasadena, California: City of Pasadena: Official Notice, Pasadena Minimum Wage, effective July 1, 2026 (PDF) (read November 8, 2026)](https://www.cityofpasadena.net/planning/wp-content/uploads/sites/30/OFFICIAL-NOTICE-EFFECTIVE-JULY-1-2026-ENGLISH.pdf)
- [Petaluma, California: City of Petaluma: Minimum Wage (read November 8, 2026)](https://cityofpetaluma.org/minimum-wage/)
- [Richmond, California: City of Richmond: Minimum Wage Ordinance (read November 8, 2026)](https://www.ci.richmond.ca.us/2615/Minimum-Wage-Ordinance)
- [San Diego, California: City of San Diego OLSE: Earned Sick Leave and Minimum Wage Ordinance (read November 8, 2026)](https://www.sandiego.gov/olse/minimum-wage/earned-sick-leave)
- [San Francisco, California: City and County of San Francisco: Understanding the Minimum Wage Ordinance (read November 8, 2026)](https://sf.gov/information/understanding-minimum-wage-ordinance)
- [San Mateo, California: City of San Mateo: Minimum Wage (read November 8, 2026)](https://www.cityofsanmateo.org/3278/Minimum-Wage)
- [San Mateo County (unincorporated), California: County of San Mateo: Minimum Wage in Unincorporated Areas (read November 8, 2026)](https://www.smcgov.org/ceo/minimum-wage-increase-unincorporated-areas)
- [Santa Monica, California: City of Santa Monica: Minimum Wage (read November 8, 2026)](https://www.santamonica.gov/minimum-wage)
- [Santa Rosa, California: City of Santa Rosa: Minimum Wage (read November 8, 2026)](https://srcity.org/3164/Minimum-Wage)
- [Sonoma, California: City of Sonoma: Minimum Wage (read November 8, 2026)](https://www.sonomacity.org/wages/)
- [South San Francisco, California: City of South San Francisco: Local Minimum Wage (read November 8, 2026)](https://www.ssfca.gov/Departments/City-Manager/Local-Minimum-Wage)
- [Seattle, Washington: City of Seattle Office of Labor Standards: Minimum Wage (read November 8, 2026)](https://www.seattle.gov/laborstandards/ordinances/minimum-wage)
- [Tukwila, Washington: City of Tukwila: Labor Standards, Minimum Wage Ordinance (read November 8, 2026)](https://www.tukwilawa.gov/departments/finance/minimum-wage-and-fair-access-to-additional-hours-of-work/)
- [Burien, Washington: City of Burien: Minimum Wage (read November 8, 2026)](https://www.burienwa.gov/city_hall/laws_regulations/minimum_wage)
- [Everett, Washington: City of Everett: Minimum wage (read November 8, 2026)](https://www.everettwa.gov/3287/Minimum-wage)
- [Renton, Washington: City of Renton: Labor Standards (read November 8, 2026)](https://www.rentonwa.gov/City-Services/Tax-and-Licensing/Labor-Standards)
- [King County (unincorporated), Washington: King County Department of Local Services: Minimum wage in unincorporated King County (read November 8, 2026)](https://kingcounty.gov/en/dept/local-services/governance-leadership/local-government-for-unincorporated-king-county/minimum-wage)
- [Bellingham, Washington: City of Bellingham: City Minimum Wage (read November 8, 2026)](https://cob.org/services/business/city-minimum-wage)
- [Denver, Colorado: City and County of Denver: Citywide Minimum Wage (read November 8, 2026)](https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Auditors-Office/Denver-Labor/Citywide-Minimum-Wage/)
- [Boulder, Colorado: City of Boulder: Local Minimum Wage (read November 8, 2026)](https://bouldercolorado.gov/local-minimum-wage)
- [Boulder County (unincorporated), Colorado: Boulder County: Local Minimum Wage (read November 8, 2026)](https://bouldercounty.gov/departments/commissioners/local-minimum-wage/)
- [Chicago, Illinois: City of Chicago BACP: Minimum Wage Information (read November 8, 2026)](https://www.chicago.gov/city/en/depts/bacp/supp_info/minimumwageinformation.html)
- [Cook County, Illinois: Cook County: Minimum Wage Ordinance and Regulations (read November 8, 2026)](https://www.cookcountyil.gov/service/minimum-wage-ordinance-and-regulations)
- [Minneapolis, Minnesota: City of Minneapolis: Minimum Wage (read November 8, 2026)](https://minimumwage.minneapolismn.gov/)
- [Saint Paul, Minnesota: City of Saint Paul: Minimum Wage Ordinance (read November 8, 2026)](https://www.stpaul.gov/departments/human-rights-equal-economic-opportunity/15-minimum-wage)
- [Flagstaff, Arizona: City of Flagstaff: Minimum Wage (read November 8, 2026)](https://www.flagstaff.az.gov/3520/Minimum-Wage)
- [Tucson, Arizona: City of Tucson: Tucson Minimum Wage Act (read November 8, 2026)](https://www.tucsonaz.gov/Departments/Business-Services-Department/Tucson-Minimum-Wage-Act)
- [Howard County, Maryland: Howard County: Minimum Wage (read November 8, 2026)](https://www.howardcountymd.gov/finance/minimum-wage)
- [Montgomery County, Maryland: Montgomery County Office of Human Rights: Minimum Wage Increase (read November 8, 2026)](https://www.montgomerycountymd.gov/office-human-rights/minimum-wage-increase)
- [Albuquerque, New Mexico: City of Albuquerque: Minimum Wage Information (read November 8, 2026)](https://www.cabq.gov/legal/albuquerque-minimum-wage-information)
- [Santa Fe, New Mexico: City of Santa Fe: Living Wage in the City of Santa Fe (read November 8, 2026)](https://santafenm.gov/economic-development/living-wage-in-the-city-of-santa-fe)
- [Santa Fe County (unincorporated), New Mexico: Santa Fe County: Living Wage (read November 8, 2026)](https://www.santafecountynm.gov/livingwage)
- [Rockland, Maine: City of Rockland: Minimum Wage (read November 8, 2026)](https://www.rocklandmaine.gov/m/newsflash/home/detail/115)
- [UC Berkeley Labor Center: Inventory of US City and County Minimum Wage Ordinances (updated July 23, 2026, the list of places to read; read November 8, 2026)](https://laborcenter.berkeley.edu/inventory-of-us-city-and-county-minimum-wage-ordinances/)
- [Census 2020 ZCTA5 to Place relationship file (read November 8, 2026)](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_place20_natl.txt)
- [U.S. Census Bureau Geocoder](https://geocoding.geo.census.gov/geocoder/)

DOL's state and tipped tables were updated November 5, 2026 and read November 8, 2026; state pages were read November 8, 2026 and city and county pages November 8, 2026. Each source page is checked once a day for changes; a change is read again by a person before a data file is edited, with the tests that pin it. Dates past a place's last known rate are answered as not covered.

Minimum wage lookup by address: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [U.S. Department of Labor, Wage and Hour Division: State Minimum Wage Laws (basic minimum rate, non-farm employment)](https://www.dol.gov/agencies/whd/minimum-wage/state) | updated 2026-11-05 | 2026-11-08 |
| [U.S. Department of Labor, Wage and Hour Division: Minimum Wages for Tipped Employees](https://www.dol.gov/agencies/whd/state/minimum-wage/tipped) | updated 2026-11-05 | 2026-11-08 |
| [Alaska: Alaska Department of Labor and Workforce Development: Wage and Hour](https://labor.alaska.gov/lss/whhome.htm) | see the document | 2026-11-08 |
| [California: Office of Governor Gavin Newsom: California will raise statewide minimum wage (July 31, 2026)](https://www.gov.ca.gov/2026/07/31/governor-newsom-announces-california-will-raise-statewide-minimum-wage/) | see the document | 2026-11-08 |
| [Massachusetts: Mass.gov: Massachusetts law about minimum wage](https://www.mass.gov/info-details/massachusetts-law-about-minimum-wage) | see the document | 2026-11-08 |
| [Maine: Maine Department of Labor: Maine's Minimum Wage to Increase to $15.70 Per Hour in 2027](https://www.maine.gov/labor/news_events/article.shtml?id=13362373) | see the document | 2026-11-08 |
| [Minnesota: Minnesota Department of Labor and Industry: Minimum wage in Minnesota](https://www.dli.mn.gov/business/employment-practices/minimum-wage-minnesota) | see the document | 2026-11-08 |
| [Montana: Montana Department of Labor and Industry: Montana's Minimum Wage](https://erd.dli.mt.gov/labor-standards/wage-and-hour-payment-act/state-minimum-wage) | see the document | 2026-11-08 |
| [New Jersey: New Jersey Department of Labor: Wage and Hour laws](https://www.nj.gov/labor/wageandhour/tools-resources/laws/) | see the document | 2026-11-08 |
| [New York: New York State Department of Labor: Minimum Wage](https://dol.ny.gov/minimum-wage-0) | see the document | 2026-11-08 |
| [Ohio: Ohio Department of Commerce: Ohio Minimum Wage to Increase by 3.5% in 2027](https://com.ohio.gov/about-us/media-center/news/Ohio-Minimum-Wage-to-Increase-in-2027) | see the document | 2026-11-08 |
| [Oregon: Oregon Bureau of Labor and Industries: Minimum wage](https://www.oregon.gov/boli/workers/pages/minimum-wage.aspx) | see the document | 2026-11-08 |
| [South Dakota: South Dakota Department of Labor and Regulation: Minimum Wage](https://dlr.sd.gov/employment_laws/minimum_wage.aspx) | see the document | 2026-11-08 |
| [Virginia: Virginia Department of Labor and Industry: Payment of Wage](https://doli.virginia.gov/programs/labor-law/payment-of-wage/) | see the document | 2026-11-08 |
| [Vermont: Vermont Department of Labor: Minimum Wage Increase Starting January 2026](https://labor.vermont.gov/press-release/vermont-department-labor-announces-minimum-wage-increase-starting-january-2026) | see the document | 2026-11-08 |
| [Washington: Washington State Department of Labor and Industries: Minimum wage](https://lni.wa.gov/workers-rights/wages/minimum-wage/) | see the document | 2026-11-08 |
| [Illinois: Illinois Department of Labor: Minimum Wage Law](https://labor.illinois.gov/laws-rules/fls/minimum-wage-law.html) | see the document | 2026-11-08 |
| [Maryland: Maryland Department of Labor: Wage and Hour Facts](https://labor.maryland.gov/labor/wages/wagehrfacts.shtml) | see the document | 2026-11-08 |
| [Alameda, California: City of Alameda: Minimum Wage](https://www.alamedaca.gov/Departments/Community-Development/Minimum-Wage) | see the document | 2026-11-08 |
| [Berkeley, California: City of Berkeley: Workforce Standards and Enforcement](https://berkeleyca.gov/doing-business/operating-berkeley/workforce-standards-and-enforcement) | see the document | 2026-11-08 |
| [Burlingame, California: City of Burlingame: Minimum Wage Information](https://burlingame.org/307/Minimum-Wage-Information) | see the document | 2026-11-08 |
| [Cupertino, California: City of Cupertino: Cupertino Minimum Wage](https://www.cupertino.org/our-city/city-news/cupertino-minimum-wage) | see the document | 2026-11-08 |
| [Daly City, California: City of Daly City: Minimum Wage](https://www.dalycity.org/388/Minimum-Wage) | see the document | 2026-11-08 |
| [East Palo Alto, California: City of East Palo Alto: Local Minimum Wage](https://www.ci.east-palo-alto.ca.us/econdev/page/local-minimum-wage) | see the document | 2026-11-08 |
| [El Cerrito, California: City of El Cerrito: Minimum Wage](https://www.elcerrito.gov/940/Minimum-Wage-Ordinance) | see the document | 2026-11-08 |
| [Emeryville, California: City of Emeryville: Minimum Wage Ordinance](https://www.emeryville.org/Services/Business/Labor-Standards/Minimum-Wage-Ordinance) | see the document | 2026-11-08 |
| [Half Moon Bay, California: City of Half Moon Bay: Minimum Wage](https://www.half-moon-bay.ca.us/659/Minimum-Wage) | see the document | 2026-11-08 |
| [Hayward, California: City of Hayward: Local Minimum Wage](https://www.hayward-ca.gov/local-minimum-wage) | see the document | 2026-11-08 |
| [Los Altos, California: City of Los Altos: Minimum Wage](https://www.losaltosca.gov/511/Minimum-Wage) | see the document | 2026-11-08 |
| [Los Angeles, California: City of Los Angeles Office of Wage Standards](https://wagesla.lacity.gov/) | see the document | 2026-11-08 |
| [Los Angeles County (unincorporated), California: Los Angeles County Department of Consumer and Business Affairs: Minimum Wage](https://dcba.lacounty.gov/minimum-wage/) | see the document | 2026-11-08 |
| [Malibu, California: City of Malibu: Minimum Wage](https://www.malibucity.org/793/Minimum-Wage) | see the document | 2026-11-08 |
| [Menlo Park, California: City of Menlo Park: Local minimum wage ordinance](https://menlopark.gov/Government/Departments/City-Managers-Office/Economic-development/Local-minimum-wage-ordinance) | see the document | 2026-11-08 |
| [Milpitas, California: City of Milpitas: Minimum Wage](https://www.milpitas.gov/688/Minimum-Wage) | see the document | 2026-11-08 |
| [Oakland, California: City of Oakland: Minimum Wage, Sick Leave, and Other Labor Laws](https://www.oaklandca.gov/Government/Departments/Workplace-Employment-Standards/Oakland-Minimum-Wage-Sick-Leave-and-Other-Labor-Laws) | see the document | 2026-11-08 |
| [Palo Alto, California: City of Palo Alto: Minimum Wage](https://www.cityofpaloalto.org/Business/Business-Resources/Minimum-Wage) | see the document | 2026-11-08 |
| [Pasadena, California: City of Pasadena: Official Notice, Pasadena Minimum Wage, effective July 1, 2026 (PDF)](https://www.cityofpasadena.net/planning/wp-content/uploads/sites/30/OFFICIAL-NOTICE-EFFECTIVE-JULY-1-2026-ENGLISH.pdf) | see the document | 2026-11-08 |
| [Petaluma, California: City of Petaluma: Minimum Wage](https://cityofpetaluma.org/minimum-wage/) | see the document | 2026-11-08 |
| [Richmond, California: City of Richmond: Minimum Wage Ordinance](https://www.ci.richmond.ca.us/2615/Minimum-Wage-Ordinance) | see the document | 2026-11-08 |
| [San Diego, California: City of San Diego OLSE: Earned Sick Leave and Minimum Wage Ordinance](https://www.sandiego.gov/olse/minimum-wage/earned-sick-leave) | see the document | 2026-11-08 |
| [San Francisco, California: City and County of San Francisco: Understanding the Minimum Wage Ordinance](https://sf.gov/information/understanding-minimum-wage-ordinance) | see the document | 2026-11-08 |
| [San Mateo, California: City of San Mateo: Minimum Wage](https://www.cityofsanmateo.org/3278/Minimum-Wage) | see the document | 2026-11-08 |
| [San Mateo County (unincorporated), California: County of San Mateo: Minimum Wage in Unincorporated Areas](https://www.smcgov.org/ceo/minimum-wage-increase-unincorporated-areas) | see the document | 2026-11-08 |
| [Santa Monica, California: City of Santa Monica: Minimum Wage](https://www.santamonica.gov/minimum-wage) | see the document | 2026-11-08 |
| [Santa Rosa, California: City of Santa Rosa: Minimum Wage](https://srcity.org/3164/Minimum-Wage) | see the document | 2026-11-08 |
| [Sonoma, California: City of Sonoma: Minimum Wage](https://www.sonomacity.org/wages/) | see the document | 2026-11-08 |
| [South San Francisco, California: City of South San Francisco: Local Minimum Wage](https://www.ssfca.gov/Departments/City-Manager/Local-Minimum-Wage) | see the document | 2026-11-08 |
| [Seattle, Washington: City of Seattle Office of Labor Standards: Minimum Wage](https://www.seattle.gov/laborstandards/ordinances/minimum-wage) | see the document | 2026-11-08 |
| [Tukwila, Washington: City of Tukwila: Labor Standards, Minimum Wage Ordinance](https://www.tukwilawa.gov/departments/finance/minimum-wage-and-fair-access-to-additional-hours-of-work/) | see the document | 2026-11-08 |
| [Burien, Washington: City of Burien: Minimum Wage](https://www.burienwa.gov/city_hall/laws_regulations/minimum_wage) | see the document | 2026-11-08 |
| [Everett, Washington: City of Everett: Minimum wage](https://www.everettwa.gov/3287/Minimum-wage) | see the document | 2026-11-08 |
| [Renton, Washington: City of Renton: Labor Standards](https://www.rentonwa.gov/City-Services/Tax-and-Licensing/Labor-Standards) | see the document | 2026-11-08 |
| [King County (unincorporated), Washington: King County Department of Local Services: Minimum wage in unincorporated King County](https://kingcounty.gov/en/dept/local-services/governance-leadership/local-government-for-unincorporated-king-county/minimum-wage) | see the document | 2026-11-08 |
| [Bellingham, Washington: City of Bellingham: City Minimum Wage](https://cob.org/services/business/city-minimum-wage) | see the document | 2026-11-08 |
| [Denver, Colorado: City and County of Denver: Citywide Minimum Wage](https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Auditors-Office/Denver-Labor/Citywide-Minimum-Wage/) | see the document | 2026-11-08 |
| [Boulder, Colorado: City of Boulder: Local Minimum Wage](https://bouldercolorado.gov/local-minimum-wage) | see the document | 2026-11-08 |
| [Boulder County (unincorporated), Colorado: Boulder County: Local Minimum Wage](https://bouldercounty.gov/departments/commissioners/local-minimum-wage/) | see the document | 2026-11-08 |
| [Chicago, Illinois: City of Chicago BACP: Minimum Wage Information](https://www.chicago.gov/city/en/depts/bacp/supp_info/minimumwageinformation.html) | see the document | 2026-11-08 |
| [Cook County, Illinois: Cook County: Minimum Wage Ordinance and Regulations](https://www.cookcountyil.gov/service/minimum-wage-ordinance-and-regulations) | see the document | 2026-11-08 |
| [Minneapolis, Minnesota: City of Minneapolis: Minimum Wage](https://minimumwage.minneapolismn.gov/) | see the document | 2026-11-08 |
| [Saint Paul, Minnesota: City of Saint Paul: Minimum Wage Ordinance](https://www.stpaul.gov/departments/human-rights-equal-economic-opportunity/15-minimum-wage) | see the document | 2026-11-08 |
| [Flagstaff, Arizona: City of Flagstaff: Minimum Wage](https://www.flagstaff.az.gov/3520/Minimum-Wage) | see the document | 2026-11-08 |
| [Tucson, Arizona: City of Tucson: Tucson Minimum Wage Act](https://www.tucsonaz.gov/Departments/Business-Services-Department/Tucson-Minimum-Wage-Act) | see the document | 2026-11-08 |
| [Howard County, Maryland: Howard County: Minimum Wage](https://www.howardcountymd.gov/finance/minimum-wage) | see the document | 2026-11-08 |
| [Montgomery County, Maryland: Montgomery County Office of Human Rights: Minimum Wage Increase](https://www.montgomerycountymd.gov/office-human-rights/minimum-wage-increase) | see the document | 2026-11-08 |
| [Albuquerque, New Mexico: City of Albuquerque: Minimum Wage Information](https://www.cabq.gov/legal/albuquerque-minimum-wage-information) | see the document | 2026-11-08 |
| [Santa Fe, New Mexico: City of Santa Fe: Living Wage in the City of Santa Fe](https://santafenm.gov/economic-development/living-wage-in-the-city-of-santa-fe) | see the document | 2026-11-08 |
| [Santa Fe County (unincorporated), New Mexico: Santa Fe County: Living Wage](https://www.santafecountynm.gov/livingwage) | see the document | 2026-11-08 |
| [Rockland, Maine: City of Rockland: Minimum Wage](https://www.rocklandmaine.gov/m/newsflash/home/detail/115) | see the document | 2026-11-08 |
| [UC Berkeley Labor Center: Inventory of US City and County Minimum Wage Ordinances](https://laborcenter.berkeley.edu/inventory-of-us-city-and-county-minimum-wage-ordinances/) | updated 2026-07-23 | 2026-11-08 |
| [Census 2020 ZCTA5 to Place relationship file](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_place20_natl.txt) | SHA-256 698a5dad71ed | 2026-11-08 |
| [U.S. Census Bureau Geocoder](https://geocoding.geo.census.gov/geocoder/) | Public\_AR\_Current benchmark, Current\_Current vintage | asked live for each street address |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests pin DOL's tables as read, check that every state step and covered local rate has an official source read on 2026-11-08 with a quote (the Los Angeles, Seattle, Denver, California and New York quotes hold their rates), and pin the Census ZCTA file by its SHA-256. They check Los Angeles city over state over federal, the geocoder deciding city limits against unincorporated county, opt-out and county-wide ordinances, employer-size tiers, New York and Oregon regions, announced 2027 state rates, tipped wages, places not covered, ZIP codes across a line, the change list, and that private and metadata network addresses are refused.

What its test suite asserts:

- DOL's state and tipped tables are pinned as updated 2026-11-05, and every state step and city or county rate must carry an official source read on 2026-11-08 with a quote.
- Los Angeles city over state over federal, unincorporated and opt-out county ordinances, employer-size tiers, New York and Oregon regions, announced 2027 state rates, tipped wages and places not covered are each checked.
- ZIP codes across a city line, the change list, refused inputs, the refusal of private and metadata network addresses, and every worked example against a fresh run are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Minimum wage lookup by address tool](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/).

## Questions

### Is there any AI in the minimum wage lookup by address answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the minimum wage lookup by address refuse to answer?

Not legal advice. The rate shown is the highest general minimum wage we hold for the place and date; industry, hotel, health care, youth, training and other special rates can differ. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Minimum wage lookup by address tool](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/minimum-wage-lookup/  
Data as of: 2026-11-04
