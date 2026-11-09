# Two 1099-Ks for one sale

If two Forms 1099-K report the same sales, count them once and ask the second filer for a corrected form showing zero: two forms of $12,480.00 each are $24,960.00 in Box 1a, but $12,480.00 of gross receipts.

- Box 1a, both forms: $24,960.00
- Gross receipts: $12,480.00
- Kept: $10,672.40

The tool flags it: "Marketplace and Payment processor show the same Box 1a ($12,480.00): if they report the same sales, the IRS says to ask the issuer for a corrected form showing zero, and count the sales once."

## Check two forms against each other

[Reconcile it](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/?year=2025&type=sole-proprietor&kind=tpso&run=1&filer=&box1a=12480&box3=230)

Two forms reporting the same 2025 sales (made-up amounts, worked by the engine)

| Line | Amount | Where it goes |
| --- | ---: | --- |
| Box 1a gross (2 forms) | $24,960.00 | Form 1099-K |
| Less: Sales also on another Form 1099-K (a duplicate) | -$12,480.00 | Count each sale once: ask the issuer for a corrected form showing zero |
| Business gross receipts from these forms | $12,480.00 | Schedule C line 1, gross receipts |
| Less: Refunds to customers | -$310.00 | Schedule C line 2, returns and allowances |
| Net sales after returns and allowances | $12,170.00 | Schedule C line 3 |
| Less: Platform and processing fees | -$1,497.60 | Schedule C line 10, commissions and fees |
| What you kept from these sales before other costs | $10,672.40 | Should be close to what the platform paid out to you |

- [IRS: What to do with Form 1099-K, read November 8, 2026](https://www.irs.gov/businesses/what-to-do-with-form-1099-k)
- [IRS: Instructions for Form 1099-K (Rev. 12/2026), read November 8, 2026](https://www.irs.gov/instructions/i1099k)
- [eBay Help: Form 1099-K, read November 8, 2026](https://www.ebay.com/help/selling/fees-credits-invoices/form-1099k?id=4794)

> Computed from IRS instructions and FAQs (each cited with the date read) and the amounts you enter. Not tax or legal advice. You decide which payments are business, personal or in error; the tool applies the IRS reporting text to your classification. State 1099-K thresholds are not covered: check your state revenue department.

## Steps

1. **Compare the forms.** Same Box 1a, same monthly Boxes 5a to 5l or the same transactions in the detail reports are the signs.
2. **Find who should file.** The Instructions for Form 1099-K say that when two parties qualify for one transaction, the one that submits the instruction to transfer the funds files.
3. **Ask for a correction.** Contact the filer of the duplicate and ask for a corrected form showing zero; keep the correspondence.
4. **Count once.** Report the sales once. If the correction does not come, file anyway and enter the duplicate in the space at the top of Schedule 1.

## Questions

### Why did I get two 1099-Ks?

Separate platforms each report their own payments, so two forms are normal when they cover different sales. eBay says that if PayPal or another provider processed some eBay payments, that provider sends its own form. A duplicate is the same sales on both.

### What does the IRS say to do?

A form that duplicates one you already received is one you should not have received: contact the issuer, ask for a corrected form showing zero, keep copies, and do not wait to file.

## Related

- [1099-K vs 1099-NEC](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/1099-k-vs-1099-nec/)
- [Where to get the data per platform](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/guides/where-to-get-1099-k-data/)
- [A wrong 1099-K: what to do](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/wrong-1099-k/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/guides/duplicate-1099-k/  
Data as of: 2026-11-08
