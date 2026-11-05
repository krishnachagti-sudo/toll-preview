# Endwise vs XE and OANDA for historical exchange rates

Use OANDA when you need rates back to 1990 from many market sources, or XE for a broad table of currencies. Use Endwise when a rule names the source (ECB, IRS, US Treasury or HMRC) or a program needs the same answer every time ($0.001 a call, 5 free runs a day on the page).

## How do Endwise, XE and OANDA differ for historical rates?

All three give an exchange rate for a past date. They differ in what the rate is, whether the source is named, how far back they go and how you pay. Facts about XE and OANDA come from their own pages, as of November 2026. Anything not listed was not checked.

|  | Endwise | XE | OANDA |
| --- | --- | --- | --- |
| What the rate is | The official reference rate from a table you choose: ECB, US Treasury, IRS yearly average or HMRC monthly. | Mid-market rates, per its tables page. | The daily average of bid and ask rates OANDA receives from many data sources, per its converter page. |
| Source named | Yes, on every answer, with the fixing date actually used. | No source named on its tables page. | Describes OANDA Rates and "many data sources". |
| History | ECB rates for any day since January 1999. | Pick a date on its tables page. | Back to 1990; free tier up to 180 days. |
| Same answer every time | Yes. A fixed published table, no AI. | Not checked. | Not checked. |
| Account needed | No. 5 free runs a day on the web. | Not stated on the tables page. | Not stated on the converter page; a paid plan for older data. |
| Price model | Pay per call: $0.001 over the API or MCP. | Tables page points to a paid XE Currency Data API for commercial use. | Free tier plus paid plans; API plans. |
| API and AI-assistant access | REST API and MCP connector. | XE Currency Data API. | API plans. |
| Export | JSON over the API; the answer as text. | No download option shown on its tables page. | CSV download on the paid plan, per its FAQ. |

## When are XE or OANDA the better choice?

- You need rates before 1999. OANDA says its data goes back to 1990.
- You want a wide list of currencies in one table. XE's tables page lists well over 150 entries against the US dollar, including metals and cryptocurrencies.
- You need a rate built from many market sources rather than a central bank's reference rate, and you are happy to pay for older data and CSV download.
- The number is for planning or a quick check, not for a tax return or a contract.

## When is Endwise the better choice?

- A rule names the source, such as the IRS yearly average or the US Treasury reporting rate, and you need to show you used it.
- You need to know which day's fixing was used when the date was a weekend or a holiday.
- A program or AI assistant must get the same answer every time without a monthly plan.
- You look up a few rates a year and do not want a subscription.

## What does Endwise return for a real case?

US dollars to euros on Saturday 24 October 2026: 0.893416 euros per US dollar (the inverse is 1.1193). The European Central Bank did not publish on the Saturday, so the answer uses the fixing of 2026-10-23, and says so. Source: European Central Bank euro foreign exchange reference rates.

The same tool can return another named table. For euros to US dollars under the IRS yearly average for 2023, it returns 1.082251 (IRS yearly average currency exchange rates).

XE and OANDA do not show a published result for these exact cases on a page we could quote, so no side-by-side figures are given. Their rates are built differently, so two tools can differ for the same day without either being wrong.

## How do you switch to Endwise?

Open [exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/), choose the two currencies and the date, and pick the source your rule names. For the tax question, read [which exchange rate to use for US taxes](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/which-exchange-rate-for-us-taxes/).

- [XE: Currency Exchange Rate Tables (Historical Currency Rates)](https://www.xe.com/currencytables/)
- [OANDA: Currency Converter (historical rates, source wording)](https://www.oanda.com/currency-converter/en/)
- [OANDA: Historical currency converter (history, free limit, CSV download)](https://www.oanda.com/foreign-exchange-data-services/en/historical-currency-converter/)
- [European Central Bank: euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)

> XE and OANDA are trademarks of their owners, named here only to identify the products. Endwise is not affiliated with either. Checked as of November 2026.

## Questions

### Is there a free alternative to XE and OANDA for historical exchange rates?

Endwise runs lookups on its page without an account, within a daily free limit, then $0.001 per call over the API or MCP. It gives the official rate from a named source, such as the ECB, for one date.

### How far back do OANDA historical rates go?

OANDA's page says its converter covers data dating back to 1990 and the free tier provides up to 180 days of history; older data needs a paid plan (as of November 2026).

### Which exchange rate should I use for US taxes?

It depends on the form and the rule. The IRS publishes yearly average rates, and the US Treasury publishes reporting rates for its own purposes. Endwise returns each one from its own published table so you can match the rule you are following.

### Do XE and OANDA name where their rates come from?

OANDA's converter page says its values are the daily average of the bid and ask rates it receives from many data sources. XE's historical tables page states that all figures are mid-market rates and does not name a data source.

## Related

- [Exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/)
- [Which exchange rate to use for US taxes](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/which-exchange-rate-for-us-taxes/)
- [Spreadsheet or Endwise](https://krishnachagti-sudo.github.io/toll-preview/guides/spreadsheet-or-endwise/)
- [Compare Endwise with other tools](https://krishnachagti-sudo.github.io/toll-preview/compare/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/compare/xe-oanda/  
Data as of: 2026-11-05
