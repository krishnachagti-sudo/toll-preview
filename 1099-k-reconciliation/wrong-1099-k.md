# A wrong Form 1099-K: what to do

Ask the filer, not the IRS, for a corrected Form 1099-K; if it does not come, file anyway and enter the wrong amount in the space at the top of Schedule 1, so $11,000.00 of a roommate's rent shares nets to $0.00 of income.

- Box 1a: $11,000.00
- Income: $0.00
- Who corrects it: The filer

The IRS lists three cases of a form you should not have received: it reports personal payments from family or friends (gifts, reimbursements), it does not belong to you, or it duplicates a form you already received. A form can also be wrong in the payee TIN or the gross amount.

## Take the wrong amount out

[Reconcile it](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/?year=2025&type=individual&kind=tpso&run=1&filer=&box1a=11000&box3=12&personal=11000)

## The roommate example

The IRS FAQ example: a Form 1099-K for $11,000.00 your roommate sent for their share of rent. It is a reimbursement, not income. The FAQ shows it on Schedule 1, line 8z ("Form 1099-K received in error") and again on line 24z, for a net effect of $0; for 2024 and later the IRS says to put the combined Form 1099-K amounts in the entry space at the top of Schedule 1.

The roommate example, worked by the engine

| Line | Amount | Where it goes |
| --- | ---: | --- |
| Box 1a gross | $11,000.00 | Form 1099-K |
| Less: Personal payments (gifts, reimbursements, shared costs) | -$11,000.00 | Not income: ask the issuer for a corrected form; if it does not come, enter it in the space at the top of Schedule 1 (Form 1040) |
| Left after personal amounts (business income if any remains) | $0.00 | Schedule 1 (Form 1040), Form 8949 and Schedule D |
| What you kept from these sales before other costs | $0.00 | Should be close to what the platform paid out to you |

- [IRS: What to do with Form 1099-K, read November 8, 2026](https://www.irs.gov/businesses/what-to-do-with-form-1099-k)
- [IRS: Form 1099-K FAQs, What to do if you receive a Form 1099-K, read November 8, 2026](https://www.irs.gov/newsroom/form-1099-k-faqs-what-to-do-if-you-receive-a-form-1099-k)
- [IRS: Form 1099-K FAQs, Common situations, read November 8, 2026](https://www.irs.gov/newsroom/form-1099-k-faqs-common-situations)

> Computed from IRS instructions and FAQs (each cited with the date read) and the amounts you enter. Not tax or legal advice. You decide which payments are business, personal or in error; the tool applies the IRS reporting text to your classification. State 1099-K thresholds are not covered: check your state revenue department.

## Steps

1. **Find the filer.** Contact the issuer named as FILER at the top left of the form (or the payment settlement entity at the bottom left if you do not recognise the filer).
2. **Ask for a correction.** Ask for a corrected Form 1099-K; for a form you should not have received (personal payments, not yours, a duplicate), ask for one showing a zero amount.
3. **Keep copies.** Keep a copy of the original, the corrected form and all correspondence.
4. **Not the IRS.** Do not contact the IRS: it cannot correct a Form 1099-K.
5. **File on time.** Do not wait to file: report an incorrect gross amount in the entry space at the top of Schedule 1 (Form 1040).

## Questions

### Can the IRS correct my 1099-K?

No. The IRS says not to contact it: only the filer can correct a Form 1099-K.

### What if the corrected form does not arrive in time?

Do not wait to file. If the gross amount is wrong, report the amount from the incorrect form in the entry space at the top of Schedule 1 (Form 1040).

### What if the form has my name but my business has an EIN?

If your name and TIN are on the form but you report the business income on Form 1120, 1120-S or 1065, the IRS says you need the form corrected.

## Related

- [Two 1099-Ks for the same sales](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/guides/duplicate-1099-k/)
- [1099-K vs 1099-NEC](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/1099-k-vs-1099-nec/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/wrong-1099-k/  
Data as of: 2026-11-08
