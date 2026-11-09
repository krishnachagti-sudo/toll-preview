# Clearing account reconciliation

In this worked card-processor clearing account, 6 days of sales totaling $6,707.75 sit against 3 bank payouts, and each payout is matched by exactly one set of sales once fees of 2.91% to 2.92% are allowed: Card sales #S-1001 $1,240.00 (2026-10-01) + Card sales #S-1002 $412.50 (2026-10-02) = $1,652.50, paid out as $1,604.28, a fee of $48.22.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Date%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CAmount%0D%0A10%2F01%2F2026%2CSales+Receipt%2CS-1001%2CCard+sales%2CDaily+card+sales%2C%221%2C240.00%22%0D%0A10%2F02%2F2026%2CSales+Receipt%2CS-1002%2CCard+sales%2CDaily+card+sales%2C412.50%0D%0A10%2F05%2F2026%2CSales+Receipt%2CS-1003%2CCard+sales%2CDaily+card+sales%2C980.00%0D%0A10%2F06%2F2026%2CSales+Receipt%2CS-1004%2CCard+sales%2CDaily+card+sales%2C%222%2C115.00%22%0D%0A10%2F07%2F2026%2CSales+Receipt%2CS-1005%2CCard+sales%2CDaily+card+sales%2C655.25%0D%0A10%2F08%2F2026%2CSales+Receipt%2CS-1006%2CCard+sales%2CDaily+card+sales%2C%221%2C305.00%22%0D%0A&bank=Date%2CDescription%2CAmount%0D%0A10%2F05%2F2026%2CCARD+PROCESSOR+PAYOUT%2C%221%2C604.28%22%0D%0A10%2F09%2F2026%2CCARD+PROCESSOR+PAYOUT%2C%223%2C004.94%22%0D%0A10%2F12%2F2026%2CCARD+PROCESSOR+PAYOUT%2C%221%2C903.10%22%0D%0A&fee=3.5&after=0)

## The worked file

A made-up shop records each day's card sales into a clearing account at their gross amount. The processor pays out every few days, net of its fees. No payout equals a set of sales exactly, so with exact matching only, nothing matches; with a fee allowance of 3.5% of the set, and sales dated no later than the payout, each payout has one set.

Payouts and the sales they paid

| Bank deposit | Result | The sets |
| --- | --- | --- |
| 2026-10-05: $1,604.28 | fits only after a fee | Card sales #S-1001 $1,240.00 (2026-10-01) + Card sales #S-1002 $412.50 (2026-10-02) = $1,652.50, fee $48.22 (2.92%) |
| 2026-10-09: $3,004.94 | fits only after a fee | Card sales #S-1003 $980.00 (2026-10-05) + Card sales #S-1004 $2,115.00 (2026-10-06) = $3,095.00, fee $90.06 (2.91%) |
| 2026-10-12: $1,903.10 | fits only after a fee | Card sales #S-1005 $655.25 (2026-10-07) + Card sales #S-1006 $1,305.00 (2026-10-08) = $1,960.25, fee $57.15 (2.92%) |

The fee each match implies is shown, never posted. Recorded as Intuit describes for a deposit, the fee is a negative line under "Add funds to this deposit", in an account such as Bank Charges & Fees.

## Why a search is needed

For automatic payouts, Stripe shows which transactions each payout holds. For manual payouts it says: "Stripe can't identify which transactions are included in each payout." With an export of the sales and the bank lines, the tool finds the sets that fit.

## Sources

- [Stripe Docs: Payout reconciliation (read November 8, 2026)](https://docs.stripe.com/payouts/reconciliation)
- [Intuit QuickBooks: Record and make bank deposits in QuickBooks Online, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)

## Related

- [Which payments make up this deposit?](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/match-deposit/)
- [Suspense accounts](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/suspense-account/)
- [The aging template](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/template/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/clearing-account/  
Data as of: 2026-11-08
