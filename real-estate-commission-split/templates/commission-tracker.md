# Commission tracker spreadsheet

6 deals: $77,062.50 on your side, you net $52,887.50. You capped on February 19, 2027 (Birch Ln). Paid to you in 2027: $10,865.00 (the 1099 basis; $11,165.00 before fees charged to you). Download this example as CSV, or paste your own deals into the tracker to get the same columns for your year.

## Fill it from your deals

[Open the tracker with these deals](https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/?mode=year&split=70&cap=20000&start=03-15&fee=300&deals=2026-04-10%2CMaple+St%2C420000%2C2.5%3B2026-06-02%2COak+Ave%2C610000%2C3%3B2026-08-21%2CReferral+in+from+Ohio%2C%244500%3B2026-10-05%2CPine+Ct%2C380000%2C2.5%2C25%3B2026-12-11%2CElm+Rd%2C725000%2C3%3B2027-02-19%2CBirch+Ln%2C455000%2C2.75)

## The columns, filled for an example year

Example plan: 70/30 split, $20,000 cap from March 15, $300.00 transaction fee per deal. The CSV link beside this page has the same rows.

| Date | Deal | Commission | Referral | Brokerage | Fees | Net | Cap left |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-04-10 | Maple St | $10,500.00 | $0.00 | $3,150.00 | $300.00 | $7,050.00 | $16,850.00 |
| 2026-06-02 | Oak Ave | $18,300.00 | $0.00 | $5,490.00 | $300.00 | $12,510.00 | $11,360.00 |
| 2026-08-21 | Referral in from Ohio | $4,500.00 | $0.00 | $1,350.00 | $300.00 | $2,850.00 | $10,010.00 |
| 2026-10-05 | Pine Ct | $9,500.00 | $2,375.00 | $2,137.50 | $300.00 | $4,687.50 | $7,872.50 |
| 2026-12-11 | Elm Rd | $21,750.00 | $0.00 | $6,525.00 | $300.00 | $14,925.00 | $1,347.50 |
| 2027-02-19 | Birch Ln | $12,512.50 | $0.00 | $1,347.50 | $300.00 | $10,865.00 | $0.00 |

## What the formulas would have to do

- Reset the cap paid on your anniversary, not on January 1, and start the new year with the deal on the anniversary itself.
- Split the crossing deal at both rates: the pre-cap rate on the part that fills the cap, the post-cap rate on the rest.
- Keep per-deal fees going after the cap if your plan says so, and count them toward the cap only if it says so.
- Total the 1099 by calendar year, separately from the cap year.

> Arithmetic on the plan shown, rounded to the cent at each step. Your brokerage's commission statement and your agreements decide what you are paid. The splits, caps, fees and rates on this page are worked examples, not typical or recommended figures. Not tax or legal advice.

One deal, a comparison or a goal is free on the calculator's page and $0.002 a call over the API or MCP; the year tracker (every deal in date order, cap progress, the 1099 total and a CSV) is $3.99 per agent cap year, free to re-run for 12 months.

## Related

- [Spreadsheet vs this tracker](https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/vs/spreadsheet-commission-tracker/)
- [Cap tracker](https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/cap-tracker/)
- [Agent 1099s in 2026](https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/guides/real-estate-agent-1099/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/templates/commission-tracker/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/real-estate-commission-split/templates/commission-tracker.csv
