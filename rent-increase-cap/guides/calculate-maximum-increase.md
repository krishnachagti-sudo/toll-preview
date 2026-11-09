# How the maximum rent increase is calculated

Multiply the base rent by the cap in force on the start date and add it. On $2,000 rent from March 1, 2027: Oregon 10% gives $2,200, Washington 10% gives $2,200, Los Angeles County 8.7% gives $2,174 and DC rent control 4.1% gives $2,082.

- Oregon on $2,000: $2,200

$2,000 rent, new rent from March 1, 2027

| Place | Formula | Cap | Working |
| --- | --- | ---: | --- |
| [California](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/california/) | 5% plus the regional change in the cost of living, at most 10%, over any 12-month period, measured from the lowest rent charged in the 12 months before the increase | 8.7% | 8.7% of $2,000 = $174; $2,000 + $174 = $2,174 |
| [Oregon](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/oregon/) | the lesser of 10% or 7% plus the West Region CPI change, set each calendar year by the Department of Administrative Services | 10% | 10% of $2,000 = $200; $2,000 + $200 = $2,200 |
| [Washington](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/washington/) | the lesser of 7% plus the Seattle-area CPI change, or 10%, during any 12-month period, set each calendar year by the Department of Commerce | 10% | 10% of $2,000 = $200; $2,000 + $200 = $2,200 |
| [District of Columbia](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/district-of-columbia/) | the adjustment of general applicability (CPI-W) plus 2%, at most 10%, for a rent-controlled unit; for a registered elderly tenant or tenant with a disability, the lowest of the Social Security COLA, CPI-W or 5% | 4.1% | 4.1% of $2,000 = $82; $2,000 + $82 = $2,082 |

## The CPI behind each figure

- Los Angeles Area: BLS CUURS49ASA0 (Los Angeles-Long Beach-Anaheim, CA), April 2025 to April 2026: 3.678%, so 8.7%.
- Riverside Area: BLS CUURS49CSA0 (Riverside-San Bernardino-Ontario, CA), March 2025 to March 2026: 3.089%, so 8.1%.
- San Diego Area: BLS CUURS49ESA0 (San Diego-Carlsbad, CA), March 2025 to March 2026: 3.223%, so 8.2%.
- San Francisco Area: BLS CUURS49BSA0 (San Francisco-Oakland-Hayward, CA), April 2025 to April 2026: 3.798%, so 8.8%.
- California, all other counties: 8.6% (the Attorney General's figure from the Department of Industrial Relations CPI; not recomputed).
- Oregon: West Region CPI, 12-month average change through August 2026: 3.116% (DAS workbook), so 7% + CPI is above 10% and the cap is 10%.
- Washington: Seattle area, June 2025 to June 2026 (BLS CUURS49DSA0): 4.530%, so 10%; for 2026, 2.683% gave 9.683%.

## The 12-month rule

In Washington the cap applies to the total over any 12 months, so a rent that was $1,900 earlier in the year can reach only $2,090 (10% of $1,900 = $190; $1,900 + $190 = $2,090), not 10% on $2,000. California measures the same way from the lowest rent of the past 12 months.

## Check a Washington rent increase

[Check the increase](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/?state=WA&rent=2000&effectiveDate=2027-03-01)

> Not legal advice. This page applies the published rules as read on the date shown; your lease, a local ordinance not listed here and later changes in the law can change the answer.

## Please read

- Not legal advice. We are not a law firm, and this tool does not review your lease, your building or your case.
- Figures are as published on the dates shown, for the windows shown; an increase taking effect outside a published window is refused, not guessed.
- Exemptions (building age, owner occupancy, local coverage) are applied from your answers; the tool does not check public records.
- Local ordinances other than the City of Los Angeles, unincorporated Los Angeles County, New York City and Montgomery County, Maryland were not checked.
- States without a row are not covered: the tool refuses them rather than guess.

## Steps

1. **Find the figure in force.** Take the published percentage for the window that contains the day the new rent starts.
2. **Pick the base.** California and Washington measure from the lowest rent in the 12 months before the increase; the others from the current rent.
3. **Multiply.** Base times the percentage is the most the increase may be (this tool rounds down to the cent).
4. **Add.** Base plus that increase is the highest lawful new rent.

## Questions

### How is the AB 1482 maximum calculated?

5% plus the regional CPI change, at most 10%. For the Los Angeles Area from August 1, 2026: 5% + 3.67% (April 2025 to April 2026, BLS) = 8.7%.

### Why is Washington 10% in 2027?

7% plus the Seattle-area CPI change (June 2025 to June 2026: 4.530%) is above 10%, so the 10% ceiling applies.

## Related

- [Percentage calculator](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/percentage-calculator/)
- [Rent cap states 2027](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/guides/rent-cap-states-2027/)
- [San Diego rent increase cap](https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/california/san-diego/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/rent-increase-cap/guides/calculate-maximum-increase/  
Data as of: 2026-11-08
