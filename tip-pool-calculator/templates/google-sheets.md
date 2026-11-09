# Tip pool template for Google Sheets

A spreadsheet splits a tip pool to the cent with five formulas: round each share down, keep the remainders, count the cents left over (3 for this night's $1,240.00), and give one each to the largest remainders, so the F column adds up to exactly $1,240.00; the CSV below is the worked night to import with File, Import.

## Or let the calculator do it

[Open this split](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/?place=US&pool=1240.00&method=hours&staff=Ana%2Cserver%2C7.5%2C10%7CBen%2Cserver%2C6%2C10%7CCarla%2Cserver%2C5.25%2C10%7CCleo%2Cbartender%2C8%2C8%7CDev%2Cbusser%2C6.5%2C5%7CEzra%2Cbusser%2C4%2C5%7CFay%2Chost%2C5%2C3%7CGus%2Crunner%2C5.75%2C4)

## The formulas

```text
G1  1240.00
D2  =ARRAYFORMULA(IF(C2:C9="",,ROUNDDOWN($G$1*C2:C9/SUM(C2:C9),2)))
E2  =ROUND(($G$1*C2/SUM($C$2:$C$9)-D2)*100, 6)
G2  =ROUND(($G$1-SUM(D2:D9))*100,0)
F2  =D2+IF(RANK(E2,$E$2:$E$9,0)+COUNTIF($E$2:E2,E2)-1<=$G$2,0.01,0)
```

In Google Sheets the ARRAYFORMULA in D2 fills the column by itself; fill E2 and F2 down by hand. Import the CSV with File, Import, and choose Replace current sheet.

## The worked night

$1,240.00 by hours, the result the formulas give.

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

> \* got one of the 3 leftover cents. Each share is the pool times that person's part, rounded down to the cent; the cents left over go one each to the largest remainders (ties to the person listed first), so the shares add up exactly.

## What a spreadsheet cannot tell you

A sheet does not know who may be in the pool. With a tip credit, cooks and dishwashers may not share, and managers and supervisors never may (29 CFR 531.54). [Who can be in the pool](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/guides/who-can-be-in-the-pool/) sets out each role.

> Not legal or tax advice. Shares are arithmetic on the hours, points and roles shown; the check applies the quoted rules to those facts. Whether someone is a manager or supervisor, or customarily tipped, depends on their duties. State rules are shown only for states whose own site was read; city rules are not covered.

## Sources

- [29 CFR 531.54, Tip pooling (eCFR, current to November 4, 2026, read November 8, 2026)](https://www.ecfr.gov/current/title-29/section-531.54)

## Steps

1. **Lay out the sheet.** Column A name, B role, C hours, D rounded-down share, E remainder in cents, F final share. Put the pool in G1.
2. **Round down.** In D2: =ARRAYFORMULA(IF(C2:C9="",,ROUNDDOWN($G$1\*C2:C9/SUM(C2:C9),2))) (one formula fills the column).
3. **Keep the remainder.** In E2: =ROUND(($G$1\*C2/SUM($C$2:$C$9)-D2)\*100, 6), filled down.
4. **Count the leftover cents.** In G2: =ROUND(($G$1-SUM(D2:D9))\*100,0).
5. **Hand them out.** In F2: =D2+IF(RANK(E2,$E$2:$E$9,0)+COUNTIF($E$2:E2,E2)-1\<=$G$2,0.01,0), filled down. The F column adds up to G1.

## Related

- [Excel version](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/templates/excel/)
- [Tip-out sheet to print](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/templates/tip-out-sheet/)
- [Tip pooling policy template](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/templates/tip-pooling-policy-template/)
- [Spreadsheet vs calculator](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/vs/spreadsheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/templates/google-sheets/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/templates/google-sheets.csv
