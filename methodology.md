# Methodology: how each tool calculates its answers

Each page below sets out the rules one tool applies, in the order it applies them, with the official rule each comes from, as of 2026-11-04. Every page was written from the tool's code and data files and has a worked example computed by the engine.

## Which tools have a methodology page?

Methodology by tool

| Method | What it explains | Tool |
| --- | --- | --- |
| [1099 threshold tracker](https://krishnachagti-sudo.github.io/toll-preview/methodology/1099-threshold/) | How each payee is tested against the 1099-NEC and 1099-MISC lines for a payment year, and why a form is or is not needed. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/) |
| [Business days](https://krishnachagti-sudo.github.io/toll-preview/methodology/business-days/) | How a business-day count or a date shifted by business days is worked out, and exactly which holidays are skipped. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/business-days/) |
| [Natural-language date resolver](https://krishnachagti-sudo.github.io/toll-preview/methodology/date-resolver/) | How a date phrase becomes one exact date: the grammar, the counting rules, business days, rolling and the second reading of an ambiguous phrase. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/) |
| [Delivery date and holiday order-by calculator](https://krishnachagti-sudo.github.io/toll-preview/methodology/delivery-date-calculator/) | How an arrival date or a last-order date is worked out from a cutoff, processing days and the store and carrier calendars. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/) |
| [Fix a CSV export (leading zeros, dates, encoding) with a saved recipe](https://krishnachagti-sudo.github.io/toll-preview/methodology/fix-csv-export/) | How a CSV export is decoded, parsed and fixed: leading zeros, DD/MM and MM/DD dates, long IDs, garbled accents and the saved recipe. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/) |
| [FMLA eligibility checker](https://krishnachagti-sudo.github.io/toll-preview/methodology/fmla-eligibility-checker/) | How the three FMLA eligibility tests, the notice due date and the leave balance under each 12-month method are worked out. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/) |
| [Exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/methodology/fx-on-date/) | How an exchange rate for a date is cross-calculated from an official table, and what happens on days with no fixing. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/) |
| [GPSR listing checker](https://krishnachagti-sudo.github.io/toll-preview/methodology/gpsr-listing-checker/) | How each SKU in a listing export is checked against the four items Article 19 of the GPSR says an online offer must show. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/) |
| [Hours calculator and timesheet](https://krishnachagti-sudo.github.io/toll-preview/methodology/hours-calculator/) | How punches become hours: breaks, overnight and daylight-saving shifts, overtime per fixed workweek and the time-clock rounding check. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/) |
| [IFTA quarterly return calculator](https://krishnachagti-sudo.github.io/toll-preview/methodology/ifta-calculator/) | How an IFTA quarterly return is worked out per jurisdiction and fuel, with Form 9740 rounding, surcharges, due dates and late cost. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/) |
| [Image to size](https://krishnachagti-sudo.github.io/toll-preview/methodology/image-to-size/) | How a photo is shrunk to fit under an exact size in KB, entirely in your browser. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/) |
| [MACRS depreciation schedule](https://krishnachagti-sudo.github.io/toll-preview/methodology/macrs-depreciation/) | How a year's additions are run through the mid-quarter test, Section 179, the special allowance and the IRS percentage tables. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/) |
| [Mileage reimbursement and IRS mileage log](https://krishnachagti-sudo.github.io/toll-preview/methodology/mileage-reimbursement/) | How a trip is priced at the IRS or GSA mileage rate in force on its date, including mid-year changes and employer allowances. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/) |
| [Name tag generator](https://krishnachagti-sudo.github.io/toll-preview/methodology/name-tag-generator/) | How a guest list becomes badges at the exact label positions of an Avery badge template, each name fitted as large as it can be. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/name-tag-generator/) |
| [QR code generator](https://krishnachagti-sudo.github.io/toll-preview/methodology/qr-code-generator/) | How text becomes a QR Code symbol: mode, version, error correction, mask choice, and the read-back check before a file is returned. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/) |
| [Recipe cost calculator and menu re-coster](https://krishnachagti-sudo.github.io/toll-preview/methodology/recipe-cost-calculator/) | How one ingredient price list costs every recipe and sub-recipe, the food cost % and the price that meets a target. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/) |
| [Bulk redirect chain checker](https://krishnachagti-sudo.github.io/toll-preview/methodology/redirect-chain-checker/) | How each URL is followed hop by hop and judged: loops, chains, temporary redirects, plain HTTP and the expected target. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/) |
| [Sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/methodology/sitemap-validator/) | How a sitemap or sitemap index is read and judged: the schema, the size limits, lastmod, URL scope, robots.txt and live URL checks. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/) |
| [SPF lookup counter](https://krishnachagti-sudo.github.io/toll-preview/methodology/spf-lookup-counter/) | How the DNS lookups of an SPF record are counted against the limit of 10, nested includes and void lookups included. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/) |
| [Tax set-aside per payment](https://krishnachagti-sudo.github.io/toll-preview/methodology/tax-set-aside/) | How the share of one payment to set aside for tax is found as the difference between two full-year tax runs. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/) |
| [Trucker per diem worksheet](https://krishnachagti-sudo.github.io/toll-preview/methodology/trucker-per-diem/) | How the IRS transportation-industry meals rate is applied day by day, with the partial-day and deduction-limit rules. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/trucker-per-diem/) |
| [Year-end giving statements](https://krishnachagti-sudo.github.io/toll-preview/methodology/year-end-giving-statements/) | How a year of gift rows becomes one statement per donor, with the IRS goods-or-services sentence and the $75 disclosure. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/year-end-giving-statements/) |
| [ZIP code and UK postcode to county lookup](https://krishnachagti-sudo.github.io/toll-preview/methodology/zip-to-county/) | How a ZIP code becomes every county it touches, with land shares, and a UK postcode its local authority and county. | [Open the tool](https://krishnachagti-sudo.github.io/toll-preview/zip-to-county/) |

## What does each methodology page cover?

- What the tool computes, with its inputs and outputs in plain words.
- The steps in the order the code applies them, with the official rule each comes from.
- The edge cases the code handles, with a worked example computed by the engine.
- What the tool does not do.
- The data, when it was read, and how it is tested.

## Where are the sources and the update log?

[Sources and how we check the answers](https://krishnachagti-sudo.github.io/toll-preview/sources/) lists every source with its edition and read date. [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/) logs each change to data or rules.

## Questions

### How does Endwise calculate its answers?

By fixed rules applied to dated data from named official sources. There is no AI in the answer, so the same input gives the same answer. Each tool has a methodology page with the steps.

### Can I check a result by hand?

Yes. Each page lists the steps in order and a worked example with figures from the engine, so you can repeat it with the cited rule.

## Related

- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Why exact answers matter](https://krishnachagti-sudo.github.io/toll-preview/why-exact/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/  
Data as of: 2026-11-04
