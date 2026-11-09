# Final paycheck rules over the API and MCP

POST the state, how the job ended, the last day and the next payday, and the answer is the due date with the statute quoted: Texas, fired November 13, 2026, returns 2026-11-19. A lookup costs $0.01; a batch costs $0.005 a separation, at least $0.05.

## One separation

```json
{
  "op": "deadline",
  "state": "TX",
  "separation": "discharge",
  "separatedAt": "2026-11-13T16:00",
  "nextPayday": "2026-11-20"
}
```

The answer's `due` is the date (and time where the state counts hours), `quotes` the state's words with the link and the date read, and `needs` anything missing to date the rule (a payday, the end of the pay period).

```json
{
  "due": {
    "date": "2026-11-19",
    "time": null,
    "how": "6 calendar days after separation",
    "text": "the end of Thursday, November 19, 2026"
  },
  "rule": "by the sixth day after the discharge",
  "cite": "Tex. Lab. Code 61.014(a)"
}
```

## Many separations

A batch takes up to 500 rows and answers each one; a state we have not read answers "not covered" in its row. This batch answers 4 of 5 rows with a date.

```csv
row,state,separation,covered,due_date,due_time,rule,cite,error
1,NY,quit,true,2026-12-11,,by the payday on which the next pay would have been due,N.Y. Labor Law 191(3),
2,CT,discharge,true,2026-12-28,,by the next business day,C.G.S. 31-71c(b),
3,VT,discharge,true,2026-12-07,15:30,within 72 hours of the discharge,21 V.S.A. 342(c),
4,DE,layoff,true,2027-01-06,,on the later of the next regular payday and 3 business days after the last day worked,19 Del. C. 1103(a),
5,CA,discharge,false,,,,,
```

## Deductions and penalties

Send `"op": "deductions"` with a state, a topic (equipment, advance, shortage, overpayment, benefits, other), the amount and the final week, or `"op": "penalty"` with the unpaid wages, the due and paid dates and the rate.

[Authentication, errors and MCP setup](https://krishnachagti-sudo.github.io/toll-preview/docs).

> Worked out from each state's own published text, quoted with the date we read it. Not legal advice. Business days skip weekends and US federal holidays; add your state's holidays and closed days if they differ. Local ordinances, union contracts, employment contracts and industry rules can be stricter.

## Sources

Each state's own source is linked on its page and in the [final paycheck laws by state chart](https://krishnachagti-sudo.github.io/toll-preview/final-paycheck-deadline/laws-by-state/) (read November 8, 2026).

## Related

- [Laws by state](https://krishnachagti-sudo.github.io/toll-preview/final-paycheck-deadline/laws-by-state/)
- [Developers](https://krishnachagti-sudo.github.io/toll-preview/developers/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/final-paycheck-deadline/api/  
Data as of: 2026-11-08
