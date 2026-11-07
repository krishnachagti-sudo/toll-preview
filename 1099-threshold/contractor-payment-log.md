# A contractor payment log for 1099s

A contractor payment log needs one row per payment with eight columns: payee, TIN, date, amount, what it was for, how it was paid, the payee's tax type and state. Kept that way, the year-end check is one step: the sample log below, with 7 payments to 4 payees, comes out at 2 forms owed for 2026.

## Which columns, and why?

| Column | Why it matters |
| --- | --- |
| payee | The legal name from the W-9, as it goes on the form. |
| tin | Merges payments under one taxpayer and goes on the form. |
| date | The year of payment decides the line ($600 for 2025, $2,000 for 2026). |
| amount | Each payment; refunds as negative amounts. |
| type | Services, rents, royalties, legal fees, merchandise: decides the form and box. |
| method | Card and payment-app payments are left out of the 1099. |
| payeeType | Individual, partnership, corporation: decides the corporate exemption. |
| state | For the state copy where a state has its own rule. |

The tracker accepts these and more columns (payee, tin, date, amount, type, method, payeeType, state, withheld, address1, address2, city, zip).

## A sample log

```csv
payee,tin,date,amount,type,method,payeeType,state
Northside Cleaning,98-7654321,2026-01-15,450.00,services,check,individual,TX
Northside Cleaning,98-7654321,2026-05-15,450.00,services,ach,individual,TX
Northside Cleaning,98-7654321,2026-09-15,450.00,services,ach,individual,TX
Northside Cleaning,98-7654321,2026-12-15,450.00,services,ach,individual,TX
Blue Oak Properties,45-6789012,2026-01-01,18000.00,rents,ach,partnership,TX
Pacific Legal PC,33-4455667,2026-07-30,2400.00,legal-fees,check,c-corporation,CA
Office Supply Co,11-2233445,2026-03-03,2650.00,merchandise,card,c-corporation,TX
```

## What does the year-end check make of it?

Of 4 payees paid in 2026, 2 need a form (1 Form 1099-NEC, 1 Form 1099-MISC) at the $2,000 line; 2 do not.

| Payee | Counted | Result |
| --- | ---: | --- |
| Blue Oak Properties | $18,000 | Rents: $18,000.00 reaches the $2,000 line (crossed on January 1, 2026): report it in 1099-MISC box 1. |
| Pacific Legal PC | $2,400 | Nonemployee compensation: $2,400.00 reaches the $2,000 line (crossed on July 30, 2026): report it in 1099-NEC box 1a. |
| Northside Cleaning | $1,800 | Nonemployee compensation: $1,800.00 is under the $2,000 line for 1099-NEC box 1a. |
| Office Supply Co | $0 | $2,650.00 left out. Payments for merchandise, telegrams, telephone, freight, storage and similar items are not reported on Form 1099-NEC or 1099-MISC. |

## Check one payee from your log

[Check this payee](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/?year=2026&type=services&payee=individual&method=check&amount=1800)

> Computed from the IRS instructions (revision shown) and the payment details given; not tax or legal advice. Payee type and payment method are your inputs; worker classification is not assessed.

## Sources

- [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. December 2026), read October 31, 2026](https://www.irs.gov/instructions/i1099mec)
- [IRS: E-file information returns with IRIS, read October 31, 2026](https://www.irs.gov/filing/e-file-information-returns-with-iris)

## Questions

### What should a contractor payment log include?

The payee's legal name and TIN from the W-9, the date and amount of each payment, what it was for, how it was paid, the payee's tax classification and state.

### Can I use my accounting export instead?

Yes. The tracker reads common column names (vendor, paid, payment date, category, paid by and others) and works out the same totals.

## Related

- [Adding up payments to one payee](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/adding-up-payments-to-one-payee/)
- [W-9s and backup withholding](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/w-9-and-backup-withholding/)
- [1099 deadline in 2027](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/deadline-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/contractor-payment-log/  
Data as of: 2026-10-31
