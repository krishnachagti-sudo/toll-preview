# No tax on tips and tip pools

Tips an employee gets from a tip pool count as qualified tips for the federal "no tax on tips" deduction: the IRS includes tips received through tip-sharing arrangements, up to $25,000 a year, phasing out above $150,000 of modified AGI ($300,000 joint), but only in an occupation on the IRS list, so a share paid to a role off the list is not a qualified tip.

““Qualified tips” are voluntary cash or charged tips received from customers including shared tips.”

“Qualified tips are cash tips, which include voluntary cash or charged tips received from customers or, in the case of employees, through tip-sharing arrangements. Mandatory service charges added to the bill are not qualified tips.”

“Maximum annual deduction is $25,000.”

“Phases out if your modified adjusted gross income is over $150,000; $300,000 for joint filers.”

“For tax years beginning after 2024 and ending before 2029, P.L. 119-21 allows certain employees and self-employed individuals to deduct up to $25,000 of qualified tips received in occupations that are listed by the IRS as having customarily and regularly received tips on or before December 31, 2024, on their income tax return.”

## Codes for the roles in a pool

Treasury Tipped Occupation Codes from the IRS list, for the roles this calculator knows.

| Role | TTOC | IRS title |
| --- | --- | --- |
| Server | 102 | Wait staff |
| Bartender | 101 | Bartenders |
| Busser | 104 | Dining room and cafeteria attendants and bartender helpers |
| Counter staff | 107 | Fast food and counter workers |
| Barista | 107 | Fast food and counter workers |
| Stylist | 603 | Barbers, hairdressers, hairstylists, and cosmetologists |
| Barber | 603 | Barbers, hairdressers, hairstylists, and cosmetologists |
| Host | 109 | Host staff, restaurant, lounge, and coffee shop |
| Barback | 104 | Dining room and cafeteria attendants and bartender helpers |
| Nail technician | 605 | Manicurists and pedicurists |
| Salon assistant | 604 | Shampooers |
| Cook | 105 | Chefs and cooks |
| Dishwasher | 108 | Dishwashers |
| Prep cook | 106 | Food preparation workers |

The pay-run record puts the code for each person's role in its irs\_ttoc column. Roles with no code shown (bellhop, food runner, manager, owner, other) were not matched to the list here: look them up on the IRS page.

## A night's shares

The night's shares: each is a tip of the person who keeps it.

| Name | Role | Hours | Points | Share |
| --- | --- | ---: | ---: | ---: |
| Ana | Server | 7.5 | 10 | $193.75 |
| Ben | Server | 6 | 10 | $155.00 |
| Carla | Server | 5.25 | 10 | $135.62 |
| Cleo | Bartender | 8 | 8 | $206.67 \* |
| Dev | Busser | 6.5 | 5 | $167.92 \* |
| Ezra | Busser | 4 | 5 | $103.33 |
| Fay | Host | 5 | 3 | $129.17 \* |
| Gus | Food runner | 5.75 | 4 | $148.54 |

It is an income tax deduction for the employee. Tips are still reported and withheld on as before:

“Tips are generally subject to federal income tax withholding and both the employer share and employee share of social security tax and Medicare tax if the tips received are $20 or more per month.”

> Not legal or tax advice. Shares are arithmetic on the hours, points and roles shown; the check applies the quoted rules to those facts. Whether someone is a manager or supervisor, or customarily tipped, depends on their duties. State rules are shown only for states whose own site was read; city rules are not covered.

## Sources

- [IRS, What the "No Tax on Tips" deduction means for you (updated September 21, 2026; read November 8, 2026)](https://www.irs.gov/newsroom/what-the-no-tax-on-tips-deduction-means-for-you)
- [IRS, Occupations that customarily and regularly received tips on or before Dec. 31, 2024 (updated June 28, 2026; read November 8, 2026)](https://www.irs.gov/forms-pubs/occupations-that-customarily-and-regularly-received-tips-on-or-before-dec-31-2024)
- [IRS, General Instructions for Forms W-2 and W-3 (2026) (read November 8, 2026)](https://www.irs.gov/instructions/iw2w3)

## Questions

### Do tip-pool payouts count as qualified tips for the no tax on tips deduction?

Yes. The IRS says qualified tips include voluntary cash or charged tips received from customers or, for employees, through tip-sharing arrangements; the deduction is capped at $25,000 a year and phases out above $150,000 of modified AGI ($300,000 joint).

## Related

- [W-2 and tips for 2026](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/guides/w2-tips-2026/)
- [Service charge vs tip](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/guides/service-charge-vs-tip/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/guides/no-tax-on-tips-and-tip-pools/  
Data as of: 2026-11-08
