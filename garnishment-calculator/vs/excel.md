# Wage garnishment in a spreadsheet

In a spreadsheet the federal creditor limit for a biweekly paycheck is =MIN(0.25\*B2, MAX(0, B2-435)) with disposable earnings in B2, which gives $470.00 on $1,880.00; each state needs its own formula and minimum wage, such as California's $103.04 on the same pay.

## The formulas

```text
Weekly:       =MIN(0.25*B2, MAX(0, B2-30*7.25))
Biweekly:     =MIN(0.25*B2, MAX(0, B2-60*7.25))
Semimonthly:  =MIN(0.25*B2, MAX(0, B2-65*7.25))
Monthly:      =MIN(0.25*B2, MAX(0, B2-130*7.25))
After support in C2: =MAX(0, <limit> - C2)
```

Microsoft's documentation says MIN returns the smallest number in a set of values. The multiples 60, 65 and 130 are 30 times 2, 13/6 and 13/3 weeks, which is how Fact Sheet #30 gets $435.00, $471.25 and $942.50.

## What a spreadsheet must be told

- The federal minimum wage ($7.25 an hour since July 24, 2009), and to change it if Congress does.
- Your state's own formula: for example California uses 20% and 40% of the amount above 48 times the local or state minimum wage; New York adds 10% of gross pay.
- The state minimum wage on the pay date, which changes each January or July in many states.
- Support and earlier orders already withheld, which reduce the limit for a new creditor.

## Check your spreadsheet

[Work out this paycheck](https://krishnachagti-sudo.github.io/toll-preview/garnishment-calculator/?state=CA&freq=biweekly&gross=2350&req=470&support=0)

## When a spreadsheet is better

With a single order in a state that follows the federal rule, a spreadsheet you keep is enough, and you see every cell. It is also the place to keep the running balance owed.

## Sources

- [Microsoft Support: MIN function (read November 8, 2026)](https://support.microsoft.com/en-us/office/min-function-61635d12-920f-4ce2-a70f-96f202dcc152)
- [U.S. Department of Labor: Fact Sheet #30, Wage Garnishment Protections of the CCPA (revised December 2024, read November 8, 2026)](https://www.dol.gov/agencies/whd/fact-sheets/30-cppa)
- [California: Cal. Code Civ. Proc. 706.050, as stated on Judicial Council form WG-002 (Rev. January 1, 2026) (read November 8, 2026)](https://www.courts.ca.gov/documents/wg002.pdf)
- [New York: N.Y. CPLR 5231(b) (read November 8, 2026)](https://www.nysenate.gov/legislation/laws/CVP/5231)

> Not legal advice. Follow the order you were served: where it sets a lower amount, the order controls. Ask the court or agency that issued it, or a lawyer, about anything it does not answer.

## Related

- [CCPA limits by pay period](https://krishnachagti-sudo.github.io/toll-preview/garnishment-calculator/ccpa-limits/)
- [Wage garnishment limits by state](https://krishnachagti-sudo.github.io/toll-preview/garnishment-calculator/limits-by-state/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/garnishment-calculator/vs/excel/  
Data as of: 2026-11-08
