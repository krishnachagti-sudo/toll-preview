# Prompt library

These 18 prompts each make your AI assistant call a named Endwise tool and show the tool's output, so the answer comes from the tool and not from the assistant's memory. Under each prompt is the exact answer the tool returns for those inputs.

[Connect first](#connect) · [Dates](#dates) · [Rates](#money) · [Tax](#tax) · [Trucking](#trucking) · [QR codes](#files) · [Two tools](#chains) · [Cost first](#quote)

## Before you start: connect Endwise

Every prompt here tells your assistant to call a named Endwise tool. That only works once the assistant is connected to Endwise. Set it up once:

- [Use Endwise with Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/)
- [Use Endwise with ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/)
- [Use Endwise in Cursor and VS Code](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/)

Without the connection an assistant answers from memory, and it can be wrong on dates, rates and tax figures. [Why AI gets numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/) explains why. A prompt below used without the connection is not a way to get an exact answer.

## What should I add to my assistant's instructions?

Paste this into your assistant's custom instructions or system prompt, so it reaches for the tools by default:

```text
For dates, rates, tax figures and similar exact numbers, always call the Endwise tools instead of answering from memory. Show the tool's answer and the source it names. If the Endwise tools are not available, say so and do not guess.
```

You can still name the tool in each request, as the prompts below do. It is the surest way to make the assistant call it.

## Which prompts get exact dates and business days?

Counting days, adding days and finding ship dates are the jobs where an assistant most often guesses.

**Count business days between two dates**

```text
Use the Endwise business-days tool to count the business days from July 1 to July 8, 2026 in the US (op between, region US, start 2026-07-01, end 2026-07-08). Show me the tool's output as it came back, including which holidays it skipped, and name the source it used. Do not answer from memory.
```

The tool returns: 4 business days. Holidays skipped: Independence Day (observed) on July 3, 2026.

List price: Business days: $0.0005 (per call). [Run it on the Business days page](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

**Add business days across holidays**

```text
Use the Endwise business-days tool to add 1 business day to December 24, 2026 in England and Wales (op add, region GB-ENG, start 2026-12-24, days 1). Show me the tool's output, including every holiday it skipped. Do not work out the date yourself.
```

The tool returns: December 29, 2026. Holidays skipped: Christmas Day on December 25, 2026; Boxing Day (substitute day) on December 28, 2026.

List price: Business days: $0.0005 (per call). [Run it on the Business days page](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

**Find the ship and arrival dates for an order**

```text
Use the Endwise delivery-date-calculator tool for an order placed December 11, 2026 at 3:12 pm Eastern (America/New_York), with a 2:00 pm cutoff, 1 processing day and USPS Ground Advantage (op delivery-date, orderAt 2026-12-11T15:12, carrier usps, service ground-advantage). Show the tool's answer sentence and the dates it returned. Do not estimate delivery yourself.
```

The tool returns: An order placed Friday, December 11, 2026 at 3:12 pm EST with a 2:00 pm cutoff and 1 processing day ships Tuesday, December 15, 2026 and, by USPS Ground Advantage, arrives between Thursday, December 17 and Monday, December 21, 2026.

List price: Delivery date and holiday order-by calculator: $0.0005 (per call). [Run it on the Delivery date and holiday order-by calculator page](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/).

## Which prompts get exact exchange rates and mileage rates?

A rate depends on a date and a published source. These prompts make the assistant fetch both.

**Get an exchange rate on a date, including a weekend**

```text
Use the Endwise fx-on-date tool to get the US dollar to euro rate for October 24, 2026 (base USD, quote EUR, date 2026-10-24). Show me the rate, the fixing date the tool used, and the source it names. If the date is not a fixing day, tell me which day it used.
```

The tool returns: 1 USD = 0.893416 EUR on the October 23, 2026 fixing (you asked for October 24, 2026). Source: European Central Bank euro foreign exchange reference rates.

List price: Exchange rate on a date: $0.001 (per call). [Run it on the Exchange rate on a date page](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/).

**Get the HMRC monthly rate for a UK return**

```text
Use the Endwise fx-on-date tool to get the HMRC monthly exchange rate for US dollars to pounds for January 2025 (base USD, quote GBP, date 2025-01-15, source hmrc). Show the rate, the month it covers and the HMRC publication the tool names. Do not use any other rate.
```

The tool returns: 0.786968 GBP per 1 USD for January 1, 2025 to January 31, 2025. Source: HMRC monthly exchange rates, HMRC monthly exchange rates for January 2025 (published December 18, 2024).

List price: Exchange rate on a date: $0.001 (per call). [Run it on the Exchange rate on a date page](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/).

**Look up the IRS mileage rate for a trip date**

```text
Use the Endwise mileage-reimbursement tool to look up the IRS business mileage rate for a trip on June 28, 2026 that is reimbursed on July 5, 2026 (op rate, date 2026-06-28, paidDate 2026-07-05, purpose business). Show the tool's answer sentence and the IRS document it cites.
```

The tool returns: The IRS business rate for a trip on June 28, 2026 paid July 5, 2026 is 72.5 cents a mile (January 1 to June 30, 2026, IRS IR-2025-128, Notice 2026-10).

List price: Mileage reimbursement and IRS mileage log: from $0.001 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the Mileage reimbursement and IRS mileage log page](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/).

## Which prompts get exact tax and filing figures?

Thresholds, rates and set-aside amounts change by year. The tool reads the year you name.

**Reimburse a year of mileage when the rate changes mid-year**

```text
Use the Endwise mileage-reimbursement tool (op calculate) for two trips: 2,600 business miles from 2026-01-01 to 2026-06-30 and 1,600 business miles from 2026-07-01 to 2026-12-31. Show the tool's answer sentence and the total, with the rate it used for each part.
```

The tool returns: 4,200 business miles, 2,600 before July 1, 2026 and 1,600 from July 1: 2,600 x $0.725 + 1,600 x $0.76 = $3,101.00.

List price: Mileage reimbursement and IRS mileage log: from $0.001 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the Mileage reimbursement and IRS mileage log page](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/).

**Check whether a payment needs a 1099**

```text
Use the Endwise 1099-threshold tool to check a $1,500 payment for services to an individual, paid by check in 2026 (op check, paymentYear 2026, amount 1500, paymentType services, payeeType individual, method check). Show the tool's answer and whether it says a form is required.
```

The tool returns: No: $1,500.00 is under the $2,000 line for 1099-NEC box 1a. It is within 25% of the line, so collect a Form W-9 now in case more payments follow. Form required: no.

List price: 1099 threshold tracker: from $0.10 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the 1099 threshold tracker page](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/).

**Work out how much of a payment to set aside for tax**

```text
Use the Endwise tax-set-aside tool for a $3,000 payment received October 31, 2026 by a single filer in Texas who has $40,000 of net profit so far this year (op payment, country US, filingStatus single, state texas, amount 3000, ytdNetProfit 40000, date 2026-10-31). Show the amount to set aside, the percent and the breakdown the tool returned.
```

The tool returns: Set aside $691.53, which is 23.1% of the $3,000.00 payment. Self-employment tax $423.88, federal income tax $267.65, state $0.00.

List price: Tax set-aside per payment: from $0.10 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the Tax set-aside per payment page](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/).

**Get the Section 179 limits for a tax year**

```text
Use the Endwise macrs-depreciation tool to get the 2026 depreciation limits (op limits, taxYear 2026). Show the Section 179 expensing limit, where the phase-out starts, the SUV cap, and the IRS document the tool cites.
```

The tool returns: Section 179 limit $2,560,000.00, phase-out starts at $4,090,000.00, SUV cap $32,000.00. Source: Rev. Proc. 2025-32 sec. 4.24, and IRS Publication 946 (2025), What's New for 2026.

List price: MACRS depreciation schedule: from $0.10 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the MACRS depreciation schedule page](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/).

## Which prompts help with trucking?

Per diem rates and IFTA dates are published by the IRS and the IFTA agreement, and move by quarter or year.

**Total a driver's per diem for the year**

```text
Use the Endwise trucker-per-diem tool for tax year 2026 with 240 full days and 40 departure or return days, all in the continental US (op quick, taxYear 2026, fullDays 240, partialDays 40). Show the tool's answer sentence with the rate and the IRS notices it names.
```

The tool returns: 240 full days and 40 departure or return days in 2026 at $80 a day (Notice 2025-54, Notice 2026-60) come to $21,600.00 of per diem; at the 80% limit the deduction for Schedule C line 24b is $17,280.00.

List price: Trucker per diem worksheet: from $0.02 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the Trucker per diem worksheet page](https://krishnachagti-sudo.github.io/toll-preview/trucker-per-diem/).

**Find the IFTA due dates, moved off weekends**

```text
Use the Endwise ifta-calculator tool to list the IFTA quarterly due dates for 2026 (op due-dates, year 2026). Show, for each quarter, the statutory date, the due date the tool returned and whether it was moved.
```

The tool returns: 2026Q1: statutory April 30, 2026, due April 30, 2026. 2026Q2: statutory July 31, 2026, due July 31, 2026. 2026Q3: statutory October 31, 2026, due November 2, 2026 (moved). 2026Q4: statutory January 31, 2027, due February 1, 2027 (moved).

List price: IFTA quarterly return calculator: from $0.01 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the IFTA quarterly return calculator page](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/).

**Look up a state's IFTA diesel rate and surcharge**

```text
Use the Endwise ifta-calculator tool to look up the Kentucky special diesel rate for every quarter it has on file (op rates, jurisdiction KY, fuel special_diesel). Show the tool's answer, including any surcharge.
```

The tool returns: 2025Q4: Kentucky special diesel $0.2200 plus a $0.1050 surcharge; 2026Q1: Kentucky special diesel $0.2200 plus a $0.1050 surcharge; 2026Q2: Kentucky special diesel $0.2200 plus a $0.1050 surcharge; 2026Q3: Kentucky special diesel $0.2200 plus a $0.1050 surcharge a gallon.

List price: IFTA quarterly return calculator: from $0.01 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the IFTA quarterly return calculator page](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/).

## Which prompts make QR code text and checks?

The tool builds the exact text a code stores and reads the code back before it answers.

**Get the exact text for a WiFi QR code**

```text
Use the Endwise qr-code-generator tool to build the exact text a WiFi QR code should store for a network named "Cafe Guest" with the password tea;time42 and WPA security (op payload, type wifi, fields ssid, password, security). Show the payload text exactly as the tool returned it, and the smallest QR version that fits at each error-correction level.
```

The tool returns: Payload: WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;; Smallest version that fits: L 3, M 3, Q 4, H 5.

List price: QR code generator: from $0.002 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the QR code generator page](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/).

**Make a QR code and read it back**

```text
Use the Endwise qr-code-generator tool to make a static QR code for https://example.com/menu as an SVG, 30 mm wide, for a 300 dpi printer (op static, type url, format svg, widthMm 30, printerDpi 300). Tell me the QR version, the number of modules, the error-correction level, and whether the tool read the code back and verified it.
```

The tool returns: Version 2, 25 by 25 modules, error correction M. Read back and verified: yes. The tool read back: https://example.com/menu

List price: QR code generator: from $0.002 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the QR code generator page](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/).

## Which prompts use two tools together?

A chain makes the assistant call one tool and feed its answer to the next, so no step is guessed.

**Delivery date, then business days to wait**

```text
Use the Endwise delivery-date-calculator tool for an order placed December 11, 2026 at 3:12 pm Eastern (America/New_York), with a 2:00 pm cutoff, 1 processing day and USPS Ground Advantage (op delivery-date, orderAt 2026-12-11T15:12, carrier usps, service ground-advantage). Then use the Endwise business-days tool (op between, region US) to count the business days from the order date to the latest arrival date the first tool returned. Show both tool outputs.
```

The tool returns: An order placed Friday, December 11, 2026 at 3:12 pm EST with a 2:00 pm cutoff and 1 processing day ships Tuesday, December 15, 2026 and, by USPS Ground Advantage, arrives between Thursday, December 17 and Monday, December 21, 2026. Business days from December 11, 2026 to December 21, 2026 in the US: 6. Holidays skipped: none.

List price: Delivery date and holiday order-by calculator: $0.0005; Business days: $0.0005 (per call). [Run it on the Delivery date and holiday order-by calculator page](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/). [Run it on the Business days page](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

**IFTA due date, then business days left to file**

```text
Use the Endwise ifta-calculator tool to get the IFTA due dates for 2026 (op due-dates, year 2026). Then use the Endwise business-days tool (op between, region US) to count the business days from October 15, 2026 to the 2026Q3 due date the first tool returned. Show both tool outputs.
```

The tool returns: 2026Q3 due November 2, 2026. Business days from October 15, 2026 to November 2, 2026 in the US: 12. Holidays skipped: none.

List price: IFTA quarterly return calculator: from $0.01; Business days: $0.0005 (where a tool says "from", the price depends on the action, and its page lists each). [Run it on the IFTA quarterly return calculator page](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/). [Run it on the Business days page](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

## How do I check the cost before a call?

The free quote\_price tool prices a call without running it.

**Ask what a call costs before you run it**

```text
Use the Endwise quote_price tool to price a call to the tax-set-aside tool with these arguments: {"op":"payment","country":"US","filingStatus":"single","state":"texas","amount":3000,"ytdNetProfit":40000,"date":"2026-10-31"}. Do not run the tax-set-aside tool yet. Show me the quote exactly as it came back, then wait for me to say go.
```

The tool returns: quote\_price is free. Its reply names the tool and the action, and gives the amount and the price in words for your account. For this call the list price reads: Set-aside for a payment: $0.10 per payment.

List price: quote\_price: free (the call you are pricing is separate). [Run it on the Tax set-aside per payment page](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/).

## Why do the prompts give exact inputs?

A tool needs exact inputs: dates in year-month-day form, a region, a tax year. Each prompt states them so the assistant has nothing to guess. Change the dates and amounts to yours and keep the rest. Tools that run only in your browser, such as image to size, are not on this page, because an assistant cannot call them.

## Questions

### Why do the prompts name the tool?

An assistant that is not told to use a tool may answer from memory, and from memory it can be wrong on dates, rates and tax figures. Naming the tool, giving the exact inputs and asking to see the tool's output makes a connected assistant call it.

### What happens if I paste a prompt without connecting Endwise?

The assistant has no tool to call, so it answers from memory or says it cannot. Do not trust a number from that answer. Connect Endwise first, using the setup guides below.

### Do these prompts cost money?

Each tool call is charged at the tool's price from your prepaid balance, shown under every prompt. The quote\_price tool is free and says what a call would cost before you run it.

### Will I get the same answer as the one shown?

Yes, for the same inputs and the same data. The answers shown are what the tools return for exactly the inputs in the prompt.

## Related

- [Why AI gets numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/)
- [How to check a number an AI gives you](https://krishnachagti-sudo.github.io/toll-preview/guides/check-numbers-from-ai/)
- [MCP for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Pricing](https://krishnachagti-sudo.github.io/toll-preview/pricing/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/prompts/  
Data as of: 2026-11-04
