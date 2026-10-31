# Business days in Python, with holidays

`np.busday_offset("2026-07-01", 10, roll="backward", holidays=US_HOLIDAYS)` returns 2026-07-16: 10 business days after Wednesday, July 1, 2026, skipping the US federal holidays, the same date this tool gives.

- Result: 2026-07-16

## The code

```python
import numpy as np

# US federal holidays, 2026 to 2027: the days off, observed days included.
US_HOLIDAYS = [
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-05-25",
    "2026-06-19", "2026-07-03", "2026-09-07", "2026-10-12",
    "2026-11-11", "2026-11-26", "2026-12-25", "2027-01-01",
    "2027-01-18", "2027-02-15", "2027-05-31", "2027-06-18",
    "2027-07-05", "2027-09-06", "2027-10-11", "2027-11-11",
    "2027-11-25", "2027-12-24", "2027-12-31",
]
ONE_DAY = np.timedelta64(1, "D")


def add_business_days(start, n, holidays=US_HOLIDAYS):
    """The date n business days after start (before, if n is negative); start is not counted."""
    if n == 0:
        return np.datetime64(start)
    roll = "backward" if n > 0 else "forward"
    return np.busday_offset(start, n, roll=roll, holidays=holidays)


def business_days_between(start, end, holidays=US_HOLIDAYS):
    """Business days after start, up to and including end."""
    return int(np.busday_count(np.datetime64(start) + ONE_DAY, np.datetime64(end) + ONE_DAY, holidays=holidays))


print(add_business_days("2026-07-01", 10))  # 2026-07-16
print(business_days_between("2026-07-01", "2026-07-08"))  # 4
```

It runs on NumPy alone. The holidays are only the ones in the list: for other years, take the dates from the [holiday calendar pages](https://krishnachagti-sudo.github.io/toll-preview/business-days/us-federal-holidays-2026/) (each has a CSV), and for England and Wales use their bank holidays.

## Two details that change the answer

- `busday_count` counts the begin date but not the end date. This tool counts the days after the start up to and including the end, so the function above moves both dates on by one day.
- `busday_offset` refuses a start that is not a business day unless you give `roll`. Rolling backward before adding (and forward before going back) makes day 1 the next business day after any start, weekend or holiday, which is how this tool and Excel's WORKDAY count.

## Or call the API from Python

```python
import os
import requests

res = requests.post(
    "https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days",
    headers={"Authorization": f"Bearer {os.environ['API_KEY']}"},
    json={"op": "add", "region": "US", "start": "2026-07-01", "days": 10},
    timeout=30,
)
data = res.json()
if not data["ok"]:
    raise RuntimeError(data["error"]["message"])
print(data["result"]["date"])  # 2026-07-16
```

The API keeps the holiday lists for you, from 1971 to 2100, names each holiday it skips and knows England and Wales too. See the [API guide](https://krishnachagti-sudo.github.io/toll-preview/business-days/api/).

## Sources

- [NumPy: numpy.busday\_offset](https://numpy.org/doc/stable/reference/generated/numpy.busday_offset.html)
- [NumPy: numpy.busday\_count](https://numpy.org/doc/stable/reference/generated/numpy.busday_count.html)
- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103)

## Related

- [Business days API](https://krishnachagti-sudo.github.io/toll-preview/business-days/api/)
- [Add business days in Excel with WORKDAY](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-workday/)
- [US federal holidays 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/us-federal-holidays-2026/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/python/  
Data as of: 2026-10-30
