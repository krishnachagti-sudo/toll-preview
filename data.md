# Free data downloads

1819 tables can be downloaded as CSV, each with the same rows as its page, a data date and a named official source.

## What is in the files?

Each file is the table from the page next to it, as a CSV: a header row, then one row per line. Text is UTF-8. Fields with a comma, a quote or a line break are put in quotes, and line ends are CRLF, so Excel, Google Sheets and most code read the files as they are.

A cell that a spreadsheet would run as a formula (one starting with =, +, -, @, a tab or a carriage return) is written with a leading apostrophe, so opening a file never runs one. Plain numbers are left as they are.

## Where does the data come from?

Each table page names its official source and the date of its data, and the CSV has the same rows as the table on the page. The [sources page](https://krishnachagti-sudo.github.io/toll-preview/sources/) lists where each tool's data comes from, and the [updates page](https://krishnachagti-sudo.github.io/toll-preview/updates/) says what changed and when.

## Can you get the same data from code?

The tools behind these tables can be called over the REST API and over MCP, with an API key, and are paid per use. A tool also runs 5 times a day on its own page without an account. See the [docs](https://krishnachagti-sudo.github.io/toll-preview/docs) for how.

## Which files can you download?

Each tool's page lists every one of its tables with the CSV next to it.

CSV downloads by tool

| Tool | Files | Data date |
| --- | --- | --- |
| [1099 threshold tracker](https://krishnachagti-sudo.github.io/toll-preview/data/1099-threshold/) | 3 CSVs | 2026-10-31 |
| [1099-K reconciliation](https://krishnachagti-sudo.github.io/toll-preview/data/1099-k-reconciliation/) | 3 CSVs | 2026-11-08 |
| [Amazon Error 8572 checker](https://krishnachagti-sudo.github.io/toll-preview/data/amazon-error-8572-checker/) | 4 CSVs | 2026-11-08 |
| [Amazon low-inventory-level fee and reorder planner](https://krishnachagti-sudo.github.io/toll-preview/data/amazon-low-inventory-fee-calculator/) | 8 CSVs | 2026-11-08 |
| [Amazon settlement reconciliation](https://krishnachagti-sudo.github.io/toll-preview/data/amazon-settlement-reconciliation/) | 3 CSVs | 2026-11-08 |
| [Amortization schedule to journal entries](https://krishnachagti-sudo.github.io/toll-preview/data/amortization-schedule-journal-entries/) | 3 CSVs | 2026-11-08 |
| [Bank reconciliation difference finder](https://krishnachagti-sudo.github.io/toll-preview/data/bank-reconciliation-difference-finder/) | 3 CSVs | 2026-11-08 |
| [Bank-feed duplicate finder for QuickBooks Online and Xero](https://krishnachagti-sudo.github.io/toll-preview/data/bank-feed-duplicate-finder/) | 1 CSV | 2026-11-08 |
| [Bulk certificate generator](https://krishnachagti-sudo.github.io/toll-preview/data/bulk-certificate-generator/) | 3 CSVs | 2026-11-08 |
| [Bulk redirect chain checker](https://krishnachagti-sudo.github.io/toll-preview/data/redirect-chain-checker/) | 2 CSVs | 2026-11-07 (most) |
| [Bulk sender check](https://krishnachagti-sudo.github.io/toll-preview/data/bulk-sender-check/) | 5 CSVs | 2026-11-08 |
| [Business days](https://krishnachagti-sudo.github.io/toll-preview/data/business-days/) | 140 CSVs | 2026-10-30 (most) |
| [Chargeback evidence packet builder](https://krishnachagti-sudo.github.io/toll-preview/data/chargeback-evidence/) | 8 CSVs | 2026-11-08 |
| [Cleaning bid calculator (commercial and post-construction)](https://krishnachagti-sudo.github.io/toll-preview/data/cleaning-bid-calculator/) | 3 CSVs | 2026-11-08 |
| [Clearing account cleanup: aging and exact deposit matches](https://krishnachagti-sudo.github.io/toll-preview/data/clearing-account-cleanup/) | 2 CSVs | 2026-11-08 |
| [Cron expression checker and next run times](https://krishnachagti-sudo.github.io/toll-preview/data/cron/) | 52 CSVs | 2026-11-08 |
| [Delivery date and holiday order-by calculator](https://krishnachagti-sudo.github.io/toll-preview/data/delivery-date-calculator/) | 11 CSVs | 2026-10-31 (most) |
| [Deposit and milestone payment schedule](https://krishnachagti-sudo.github.io/toll-preview/data/payment-schedule/) | 9 CSVs | 2026-11-08 |
| [DMARC report analyzer](https://krishnachagti-sudo.github.io/toll-preview/data/dmarc-report-analyzer/) | 1 CSV | 2026-11-08 |
| [Donor acknowledgment letters](https://krishnachagti-sudo.github.io/toll-preview/data/donor-acknowledgment-letter/) | 3 CSVs | 2026-11-08 |
| [eBay transaction report flattener](https://krishnachagti-sudo.github.io/toll-preview/data/ebay-transaction-report-flattener/) | 3 CSVs | 2026-11-08 |
| [Exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/data/fx-on-date/) | 26 CSVs | 2026-11-06 (most) |
| [FBA prep checker](https://krishnachagti-sudo.github.io/toll-preview/data/fba-prep-checker/) | 6 CSVs | 2026-11-08 |
| [Final paycheck deadline by state](https://krishnachagti-sudo.github.io/toll-preview/data/final-paycheck-deadline/) | 11 CSVs | 2026-11-08 |
| [FMLA eligibility checker](https://krishnachagti-sudo.github.io/toll-preview/data/fmla-eligibility-checker/) | 9 CSVs | 2026-11-08 |
| [Good Faith Estimate generator](https://krishnachagti-sudo.github.io/toll-preview/data/good-faith-estimate-generator/) | 14 CSVs | 2026-11-08 |
| [GPSR listing checker](https://krishnachagti-sudo.github.io/toll-preview/data/gpsr-listing-checker/) | 4 CSVs | 2026-11-08 |
| [Hours calculator and timesheet](https://krishnachagti-sudo.github.io/toll-preview/data/hours-calculator/) | 6 CSVs | 2026-11-07 |
| [HS, HTS, NAICS and SIC code checker](https://krishnachagti-sudo.github.io/toll-preview/data/industry-code-lookup/) | 1,117 CSVs | 2026-11-08 |
| [IFTA quarterly return calculator](https://krishnachagti-sudo.github.io/toll-preview/data/ifta-calculator/) | 5 CSVs | 2026-11-02 |
| [Image to size](https://krishnachagti-sudo.github.io/toll-preview/data/image-to-size/) | 7 CSVs | 2026-10-31 |
| [Inbound placement fee calculator](https://krishnachagti-sudo.github.io/toll-preview/data/inbound-placement-fee-calculator/) | 3 CSVs | 2026-11-08 |
| [Late payment interest calculator and claim letter](https://krishnachagti-sudo.github.io/toll-preview/data/late-payment-interest/) | 5 CSVs | 2026-11-08 |
| [Lien deadline calculator](https://krishnachagti-sudo.github.io/toll-preview/data/lien-deadline/) | 2 CSVs | 2026-11-08 |
| [Lien waiver generator by state](https://krishnachagti-sudo.github.io/toll-preview/data/lien-waiver/) | 1 CSV | 2026-11-02 |
| [MACRS depreciation schedule](https://krishnachagti-sudo.github.io/toll-preview/data/macrs-depreciation/) | 1 CSV | 2026-11-02 |
| [Mileage reimbursement and IRS mileage log](https://krishnachagti-sudo.github.io/toll-preview/data/mileage-reimbursement/) | 4 CSVs | 2026-10-31 |
| [Minimum wage lookup by address](https://krishnachagti-sudo.github.io/toll-preview/data/minimum-wage-lookup/) | 4 CSVs | 2026-11-08 |
| [Name tag generator](https://krishnachagti-sudo.github.io/toll-preview/data/name-tag-generator/) | 9 CSVs | 2026-11-08 |
| [Natural-language date resolver](https://krishnachagti-sudo.github.io/toll-preview/data/date-resolver/) | 25 CSVs | 2026-11-07 (most) |
| [Ontario rent increase calculator (N1)](https://krishnachagti-sudo.github.io/toll-preview/data/ontario-rent-increase/) | 9 CSVs | 2026-11-08 |
| [Overtime auditor for timesheet CSVs](https://krishnachagti-sudo.github.io/toll-preview/data/overtime-auditor/) | 1 CSV | 2026-11-08 |
| [Pay application and retainage (G702/G703-style)](https://krishnachagti-sudo.github.io/toll-preview/data/pay-application/) | 7 CSVs | 2026-11-08 |
| [Payout reconciliation: split a payout into sales, refunds, fees and tax](https://krishnachagti-sudo.github.io/toll-preview/data/payout-reconciliation/) | 4 CSVs | 2026-11-08 |
| [PTO and sick leave accrual by state](https://krishnachagti-sudo.github.io/toll-preview/data/pto-accrual/) | 2 CSVs | 2026-11-08 |
| [Quid pro quo receipt checker](https://krishnachagti-sudo.github.io/toll-preview/data/quid-pro-quo-receipt-checker/) | 12 CSVs | 2026-11-08 |
| [Real estate commission split and cap tracker](https://krishnachagti-sudo.github.io/toll-preview/data/real-estate-commission-split/) | 10 CSVs | 2026-11-08 |
| [Recipe cost calculator and menu re-coster](https://krishnachagti-sudo.github.io/toll-preview/data/recipe-cost-calculator/) | 5 CSVs | 2026-11-08 |
| [Refunded but never returned: FBA customer return reimbursement checker](https://krishnachagti-sudo.github.io/toll-preview/data/fba-refund-not-returned/) | 4 CSVs | 2026-11-08 |
| [Rent increase cap calculator and notice](https://krishnachagti-sudo.github.io/toll-preview/data/rent-increase-cap/) | 1 CSV | 2026-11-08 |
| [Rent late fee checker and late notice](https://krishnachagti-sudo.github.io/toll-preview/data/late-fee-checker/) | 16 CSVs | 2026-11-08 |
| [Rolled-up holiday pay calculator (UK, 12.07%)](https://krishnachagti-sudo.github.io/toll-preview/data/rolled-up-holiday-pay-calculator/) | 6 CSVs | 2026-11-08 |
| [Security deposit return deadline and itemized letter](https://krishnachagti-sudo.github.io/toll-preview/data/security-deposit-letter/) | 2 CSVs | 2026-11-02 |
| [Sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/data/sitemap-validator/) | 4 CSVs | 2026-11-08 |
| [SMTP bounce classifier](https://krishnachagti-sudo.github.io/toll-preview/data/smtp-bounce-code-classifier/) | 7 CSVs | 2026-11-08 (most) |
| [SPF lookup counter](https://krishnachagti-sudo.github.io/toll-preview/data/spf-lookup-counter/) | 3 CSVs | 2026-11-07 |
| [State family and medical leave overlay](https://krishnachagti-sudo.github.io/toll-preview/data/fmla-state-leave-overlay/) | 2 CSVs | 2026-11-08 |
| [Statistical tables: control chart constants and critical values](https://krishnachagti-sudo.github.io/toll-preview/data/stats-tables/) | 7 CSVs | 2026-11-08 |
| [Tax set-aside per payment](https://krishnachagti-sudo.github.io/toll-preview/data/tax-set-aside/) | 24 CSVs | 2026-10-31 (most) |
| [Teacher license renewal hours tracker](https://krishnachagti-sudo.github.io/toll-preview/data/teacher-license-renewal-tracker/) | 1 CSV | 2026-11-08 |
| [Time export to invoice lines](https://krishnachagti-sudo.github.io/toll-preview/data/time-export-to-invoice/) | 2 CSVs | 2026-11-08 |
| [Tip pool calculator](https://krishnachagti-sudo.github.io/toll-preview/data/tip-pool-calculator/) | 19 CSVs | 2026-11-08 |
| [Trucker per diem worksheet](https://krishnachagti-sudo.github.io/toll-preview/data/trucker-per-diem/) | 5 CSVs | 2026-10-31 |
| [Upwork fee calculator: what reaches your bank](https://krishnachagti-sudo.github.io/toll-preview/data/upwork-fee-calculator/) | 16 CSVs | 2026-11-08 |
| [US import duty estimator by HTS code](https://krishnachagti-sudo.github.io/toll-preview/data/hts-duty-estimator/) | 14 CSVs | 2026-11-08 |
| [USPS adjustment dispute checker](https://krishnachagti-sudo.github.io/toll-preview/data/usps-adjustment-dispute/) | 6 CSVs | 2026-11-08 |
| [Wage garnishment calculator for employers](https://krishnachagti-sudo.github.io/toll-preview/data/garnishment-calculator/) | 21 CSVs | 2026-11-08 |
| [WARN Act checker](https://krishnachagti-sudo.github.io/toll-preview/data/warn-act-checker/) | 15 CSVs | 2026-11-08 |
| [XRechnung and ZUGFeRD viewer and validator](https://krishnachagti-sudo.github.io/toll-preview/data/xrechnung-viewer/) | 3 CSVs | 2026-11-08 |
| [Year-end giving statements](https://krishnachagti-sudo.github.io/toll-preview/data/year-end-giving-statements/) | 4 CSVs | 2026-11-07 |
| [ZIP code and UK postcode to county lookup](https://krishnachagti-sudo.github.io/toll-preview/data/zip-to-county/) | 57 CSVs | 2026-11-07 |

**Site-wide tables: 1 download**, data date 2026-10-31.

- [IRS mileage rate history 2011 to 2026](https://krishnachagti-sudo.github.io/toll-preview/irs-mileage-rate-history/) ([CSV](https://krishnachagti-sudo.github.io/toll-preview/irs-mileage-rate-history.csv))

## Can you reuse these files?

Yes. You may copy, share and use these files, including in commercial work, as long as you link to the page each file came from. [How to cite Endwise](https://krishnachagti-sudo.github.io/toll-preview/cite/) shows the wording.

The figures themselves come from the official sources named on each table page, which may set their own terms for reuse.

## Questions

### What format are the downloads?

Plain CSV: a header row, then one row per line of the table, with commas between fields. Fields that contain a comma, a quote or a line break are quoted, and line ends are CRLF.

### Where does the data come from?

Each table page names its official source. The CSV has the same rows as the table on the page.

### Can I get the same data from code?

The tools that produce these figures can be called over the REST API and over MCP. See the docs for how.

### Will a cell that starts with an equals sign run as a formula?

No. A cell that a spreadsheet would run as a formula is written with a leading apostrophe, so opening a file never runs one. Plain numbers such as -0.25 are left alone.

## Related

- [Sources](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Docs](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/data/  
Data as of: 2026-11-04
