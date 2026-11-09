# The state leave overlay over the API and MCP

POST the state, reason, dates, hours and headcount and the answer lists the laws, how each runs with the FMLA, and the weeks: New Jersey bonding at a 20-person employer returns 12 weeks protected and 12 weeks paid. A lookup costs $0.01; a batch $0.01 an employee (at least $0.10); a case plan $1.00.

## One employee

```json
{
  "op": "overlay",
  "state": "NJ",
  "reason": "bonding",
  "startDate": "2026-12-14",
  "hireDate": "2026-08-03",
  "hours12": 600,
  "employees": 20
}
```

The answer's `laws` gives each state law with `job` and `paid` (yes, if, no), its weeks and the state's words; `parts` the weeks protected and paid for each part of the leave; `federal` the FMLA answer from the eligibility checker.

```json
{
  "totals": {
    "protectedWeeks": 12,
    "paidWeeks": 12,
    "paidAtLeast": false,
    "unprotected": []
  },
  "parts": [
    {
      "reason": "bonding",
      "weeks": 12,
      "protectedWeeks": 12,
      "paidWeeks": 12,
      "protectedBy": [
        {
          "id": "NJ-FLA",
          "short": "NJFLA",
          "weeks": 12
        },
        {
          "id": "NJ-FLI",
          "short": "FLI",
          "weeks": 12
        }
      ],
      "paidBy": [
        {
          "id": "NJ-FLI",
          "short": "FLI",
          "weeks": 12
        }
      ]
    }
  ]
}
```

## Many employees

A batch takes up to 500 rows, one employee each, in any state; a state we have not read answers with the FMLA alone in its row. This batch has 4 rows.

```csv
row,state,covered,reason,fmla,state_laws,protected_weeks,paid_weeks
1,CO,covered,own,yes,FAMLI,12,12
2,NY,covered,care,yes,PFL,12,12
3,OR,covered,birth,yes,Paid Leave Oregon; OFLA,22,12
4,TX,not-read,own,yes,,12,0

```

## Case plan

Send `"op": "plan"` with an `employee` label: the answer adds `notice` (the designation note) and `csv`. Reasons: `own`, `care`, `bonding`, `birth`, `military`.

[Authentication, errors and MCP setup](https://krishnachagti-sudo.github.io/toll-preview/docs).

> Not legal advice. Worked out from each state's own published text, quoted with the date we read it, and from 29 CFR Part 825. States whose official sites we could not read are named as not covered, never filled in from someone else's chart. Whether a condition qualifies, the earnings test and benefit amounts are decided by the employer and the state program; local ordinances and contracts can give more.

## Related

- [States with paid family leave](https://krishnachagti-sudo.github.io/toll-preview/fmla-state-leave-overlay/states-with-paid-family-leave/)
- [Developers](https://krishnachagti-sudo.github.io/toll-preview/developers/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fmla-state-leave-overlay/api/  
Data as of: 2026-11-08
