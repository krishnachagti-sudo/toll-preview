# Find the refunds that never came back

Join the refunds to the FBA Customer Returns and Reimbursements reports by order ID: in the sample, 7 of 11 refunded FBA orders were neither returned nor reimbursed, and 4 of them ($146.45 refunded) are inside Amazon's US claim window of days 60 to 120 on November 8, 2026.

## Check your own refunds

[Open the checker with the sample](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/?marketplace=US&asOf=2026-11-08)

## The sample, joined

Every refunded FBA order in the sample, on November 8, 2026

| Order | Refunded | Back | Paid | Status | Window |
| --- | --- | ---: | ---: | --- | --- |
| 112-0000001-0000001 | 2026-06-20 | 0 | 1 | Reimbursed |  |
| 112-0000002-0000002 | 2026-07-01 | 1 | 0 | Returned |  |
| 112-0000003-0000003 | 2026-07-10 | 0 | 0 | Window closed | 2026-09-08 to 2026-11-07 |
| 112-0000004-0000004 | 2026-07-15 | 0 | 0 | Claim now | 2026-09-13 to 2026-11-12 |
| 112-0000005-0000005 | 2026-07-25 | 0 | 0 | Claim now | 2026-09-23 to 2026-11-22 |
| 112-0000006-0000006 | 2026-08-01 | 0 | 1 | Reimbursed below the refund |  |
| 112-0000007-0000007 | 2026-08-10 | 1 | 0 | Claim now | 2026-10-09 to 2026-12-08 |
| 112-0000008-0000008 | 2026-08-20 | 0 | 0 | Claim now | 2026-10-19 to 2026-12-18 |
| 112-0000009-0000009 | 2026-09-05 | 1 | 0 | Returned damaged by the customer or defective |  |
| 112-0000010-0000010 | 2026-09-20 | 0 | 0 | Not yet claimable | 2026-11-19 to 2027-01-18 |
| 112-0000011-0000011 | 2026-10-01 | 1 | 0 | Not yet claimable | 2026-11-30 to 2027-01-29 |

1 seller-fulfilled refund and 1 order row in the sample file are left out: only FBA refunds are covered.

## Sources

- [Seller Central Help (US): Payment Date Range Transaction and Summary reports (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200989190)
- [Seller Central Help (US): FBA Customer Returns report (overview) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/200453320)
- [Seller Central Help (US): Reimbursements report (overview) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200732720)
- [Seller Central Help (US): FBA inventory reimbursement policy: Customer return claims (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G9N934L7Y4SFWPJ4)

> Not legal or accounting advice: Amazon decides every claim. The sample reports are made up; claim windows and report columns are from Amazon's help pages, read November 8, 2026.

## Steps

1. **Download the refunds.** Payments, Reports Repository, Transaction report (CSV), and keep rows of type Refund with fulfillment Amazon. Reports can take up to three hours to generate.
2. **Download the FBA Customer Returns report.** For the same dates and after: a unit received back is in it, with its disposition.
3. **Join by order ID.** Match each refund's order id to the returns report's order-id and count the units back.
4. **Exclude what came back.** A SELLABLE return is not owed. DAMAGED and CARRIER DAMAGED are Amazon's responsibility; CUSTOMER DAMAGED and DEFECTIVE are not eligible.
5. **Check the Reimbursements report.** Match amazon-order-id; count cash and inventory units as paid, and net off reversals.
6. **Wait for the window.** On Amazon's US page, a claim is filed no sooner than day 60 and no later than day 120 after the refund.
7. **List the gaps and prepare the case.** For each order inside its window, write one claim; for a reimbursement below the refund, a valuation dispute within 60 days.

## Related

- [The case text](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/case-text/)
- [Every claim window](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/claim-windows/)
- [By hand with Amazon's reports](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/vs/manual-reports/)
- [The settlement report, column by column](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-report-explained/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/find-unreturned-refunds/  
Data as of: 2026-11-08
