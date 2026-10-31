# Mileage log template 2026

The 2026 mileage log template has one line per trip (date, start, destination, business purpose, miles) and a rate that switches from 72.5 to 76 cents on July 1, so the same 38-mile trip is $27.55 on June 30 and $28.88 on July 1.

- June 30 trip, 38 miles: $27.55
- July 1 trip, 38 miles: $28.88
- Example business miles: 424.2

[Download the template with the example rows (CSV)](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-log-template.csv). The columns are the ones the calculator reads back, so the finished log can be priced and turned into a PDF in one step.

## The example, priced by date

One car, 2026. Rates from the IRS table; amounts are miles x the rate for the trip date.

| Date | Destination | Business purpose | Miles | Cents | Amount |
| --- | --- | --- | ---: | ---: | ---: |
| 2026-01-12 | Acme Supply, Dayton | Quarterly review | 46.2 | 72.5 | $33.50 |
| 2026-02-03 | Lakeside Clinic, Xenia | Install | 38 | 72.5 | $27.55 |
| 2026-03-17 | Northgate Depot, Fairborn | Parts pickup | 22.5 | 72.5 | $16.31 |
| 2026-04-22 | Riverside Bank, Kettering | Contract signing | 17.4 | 72.5 | $12.62 |
| 2026-05-08 | County Courthouse, Dayton | Permit filing | 12.8 | 72.5 | $9.28 |
| 2026-06-30 | Lakeside Clinic, Xenia | Service visit | 38 | 72.5 | $27.55 |
| 2026-07-01 | Lakeside Clinic, Xenia | Follow-up | 38 | 76 | $28.88 |
| 2026-08-11 | Acme Supply, Dayton | Quarterly review | 46.2 | 76 | $35.11 |
| 2026-09-14 | Northgate Depot, Fairborn | Parts pickup | 22.5 | 76 | $17.10 |
| 2026-10-05 | City Hospital | medical | 14 | 23.5 | $3.29 |
| 2026-11-19 | Trade show, Columbus | Exhibit | 142.6 | 76 | $108.38 |
| 2026-12-08 | Food bank, Dayton | Volunteer driving | 9.5 | 14 | $1.33 |

2026 log for 2022 Ford Transit: 424.2 business miles (174.9 at 72.5 cents, 249.3 at 76 cents) = $316.27 at the standard mileage rate, plus $33.00 business parking and tolls. The medical and charity lines are priced at their own rates and kept out of the business total.

## The formula

With dates in column A and business miles in column E:

```excel
=E2*IF(A2<DATE(2026,7,1),0.725,0.76)
```

It covers business miles by trip date. Medical miles use 0.205 and 0.235, charity 0.14 all year.

## Price a year of miles

[Work out my amount](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/?mode=split&purpose=business&year=2026&m1=2600&m2=1600)

> The standard mileage rate is optional: actual car expenses may be used instead. This page computes amounts from the IRS table; it is not tax or legal advice.

## Sources

- [IRS: Publication 463 (2025), Travel, Gift, and Car Expenses (updated April 30, 2026)](https://www.irs.gov/publications/p463)
- [IRS: Standard mileage rates, all years (updated July 28, 2026, read October 31, 2026)](https://www.irs.gov/tax-professionals/standard-mileage-rates)

## Steps

1. **Download the template.** Open the CSV in Excel or Google Sheets. The example rows show how each column is filled in; delete them and keep the headings.
2. **Log each trip at or near the time.** One line per trip or leg: the date, where you started, the business destination, the business purpose and the miles. Pub 463 treats a log kept weekly as timely.
3. **Add the year totals.** Write down the odometer on January 1 and December 31 and the date the car was first used for business.
4. **Price and check it.** Open the file in the mileage calculator. It prices each line at the rate for its date, checks the Pub 463 elements, and makes the year's log as a PDF.

## Questions

### Does the template work in Google Sheets?

Yes. It is a CSV file: open it in Google Sheets with File, Import, or in Excel directly. The calculator reads the same columns back.

### How does the rate switch on July 1?

Each trip takes the IRS rate for its date: 72.5 cents through June 30, 2026 and 76 cents from July 1. In a spreadsheet, =E2\*IF(A2\<DATE(2026,7,1),0.725,0.76) does it for business miles in column E with dates in column A.

## Related

- [IRS mileage log requirements](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-log-requirements/)
- [IRS mileage rate 2026](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-rate-2026/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-log-template/  
Data as of: 2026-10-31  
CSV: https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-log-template.csv
