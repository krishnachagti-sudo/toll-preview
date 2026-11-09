# Apify Minimum Wage Actor vs Endwise Minimum Wage Lookup

The Apify actor sells minimum wage lookups from $3.00 / 1,000 rule lookups on Apify (its page, read November 8, 2026); this lookup costs $0.002 a place answered ($0.001 past 10,000 a month), one place is free on the web, and places we do not cover are not charged.

## What the actor's page says

- Rate at an address, city, county or state on a date: the highest of federal, state, county and city, with the minimum cash wage for tipped staff.
- Addresses resolved with the U.S. Census Bureau geocoder.
- A mode listing scheduled changes in a date window.
- Industry rates such as health care, and up to 1,000 lookups in one run.
- Price: from $3.00 / 1,000 rule lookups.

## Where this lookup differs

- Human pages for every state and every city we read, with each rate's source and read date.
- A free single lookup on the web, without an Apify account.
- ZIP codes split by the Census ZCTA-place file: a ZIP that crosses a city line lists each part.
- No industry rates (health care, fast food) yet.

## When the actor is the better choice

When you already run your automations on Apify, or you need the industry rates it lists, the actor fits better.

> Not legal advice. The rate shown is the highest general minimum wage we hold for the place and date; industry, hotel, health care, youth, training and other special rates can differ. Every rate names the official page it was read from and the date we read it. Places and states whose pages we could not read are listed as not covered, never guessed. Employers covered by the federal Fair Labor Standards Act pay at least the federal $7.25; state laws differ on which employers they cover.

- [the Apify actor "US Minimum Wage by Address and Date" (nerolabs/us-minimum-wage), read November 8, 2026](https://apify.com/nerolabs/us-minimum-wage)

## Related

- [Minimum wage API](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/api/)
- [Symmetry comparison](https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/vs/symmetry/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/minimum-wage-lookup/vs/apify/  
Data as of: 2026-11-08
