# Why AI assistants get dates and numbers wrong

An AI assistant predicts likely text. It does not look up a rule or a published figure, its knowledge ends at a cutoff date, and it may not show its working. So it can state a business-day count, an observed holiday or an exchange rate that is off by 1 day or 1 decimal, in a confident sentence. Check the number, or give the assistant a tool that returns it exactly.

## Why does an AI assistant get dates and numbers wrong?

A language model writes the most likely next words. That works well for prose. It is a poor fit for a question that has one right answer defined by a rule or a published table, such as "how many business days between these dates" or "what was the euro rate on that Saturday".

**Read the rest: Why does an AI assistant get dates and numbers wrong?**

Three things go wrong, and they stack.

- **It predicts text, it does not run the rule.** A business-day count needs each day checked against weekends and every holiday, including the ones moved to a Friday or a Monday. A model can write a tidy answer without doing that check.
- **Its knowledge stops at a cutoff.** Anthropic's model documentation separates a reliable knowledge cutoff, "the date through which the model's knowledge is most extensive and reliable", from the wider range of training data. OpenAI's model pages list a knowledge cutoff for each model too. A rate, threshold or deadline that changed after that date may not be in the model at all, and the model will not always tell you so.
- **It may not show its working.** A single number with no list of skipped days, no rate date and no named source gives you nothing to check.

Model makers say this about their own products. Anthropic's guide to reducing hallucinations says these techniques don't eliminate them entirely and adds "Always validate critical information". Both companies also document ways to connect a model to outside tools and search, which is the fix this page ends with. Sources are listed below.

## Which dates and numbers are easiest to get wrong?

The ones where a small rule decides the answer. Here are cases worked out by the tools themselves. Each answer below is the tool's own output for the question shown, so you can run it again and get the same result.

## Example: US business days from July 1 to July 8, 2026

**Exact answer:** 4 business days. Skipped: Independence Day (observed) (July 3, 2026).

**Read the rest: Example: US business days from July 1 to July 8, 2026**

**Why it is easy to get wrong:** July 4, 2026 is a Saturday, so the federal holiday is observed on Friday, July 3. Skip only the 4th, a weekend day anyway, and you count 5.

Source: 5 U.S.C. 6103, OPM observed-day rules. [Run it yourself in Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

## Example: One working day after December 24, 2026, in England and Wales

**Exact answer:** December 29, 2026. Skipped: Christmas Day (December 25, 2026); Boxing Day (substitute day) (December 28, 2026).

**Read the rest: Example: One working day after December 24, 2026, in England and Wales**

**Why it is easy to get wrong:** Christmas Day is a Friday and Boxing Day falls on a Saturday, so its bank holiday moves to Monday, December 28. One working day on is Tuesday, not Monday.

Source: GOV.UK bank holidays for England and Wales. [Run it yourself in Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

## Example: US dollar to euro on Saturday, October 24, 2026

**Exact answer:** 1 USD = 0.893416 EUR, from the fixing of October 23, 2026.

**Read the rest: Example: US dollar to euro on Saturday, October 24, 2026**

**Why it is easy to get wrong:** The ECB publishes no reference rates at weekends. The answer uses the last fixing before the date and names it, rather than giving a rate for a day that has none.

Source: European Central Bank reference rates. [Run it yourself in Exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/).

## Example: Pound to yen on Christmas Day 2024

**Exact answer:** 1 GBP = 197.149931 JPY, from the fixing of December 24, 2024.

**Read the rest: Example: Pound to yen on Christmas Day 2024**

**Why it is easy to get wrong:** The ECB did not publish on December 25, 2024, and it has no direct pound to yen rate. The tool takes both rates against the euro from the last fixing and works out the cross rate.

Source: European Central Bank reference rates. [Run it yourself in Exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/).

## Example: An order placed at 4:30 pm Central the day before Thanksgiving 2026, by USPS Priority Mail

**Exact answer:** An order placed Wednesday, November 25, 2026 at 4:30 pm CST with a 12:00 pm cutoff and 1 processing day ships Monday, November 30, 2026 and, by Priority Mail, arrives between Wednesday, December 2 and Thursday, December 3, 2026.

**Read the rest: Example: An order placed at 4:30 pm Central the day before Thanksgiving 2026, by USPS Priority Mail**

**Why it is easy to get wrong:** The order misses the noon cutoff, and the next day is Thanksgiving, a federal holiday the store does not ship on. So it is received on Friday, and with a weekend after it, handed over on Monday.

Source: USPS service standards and postal holidays. [Run it yourself in Delivery date and holiday order-by calculator](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/).

## What about tax rates and deadlines?

The same problem is worse where figures change every year. A threshold or a mileage rate can differ between one year and the next, and some change in the middle of a year.

**Read the rest: What about tax rates and deadlines?**

A model whose knowledge ends before the change will quote the old figure in a confident sentence. Due dates also move: a deadline on a weekend rolls to the next business day, and that is a rule to apply, not a sentence to recall.

- [1099 threshold tracker](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/): the Form 1099-NEC reporting line is $2,000 for 2026 payments and $600 for 2025 payments, from the IRS instructions. A model whose knowledge predates the change would give $600 for a 2026 payment.
- [Mileage reimbursement and IRS mileage log](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/): the IRS business rate for a trip on June 30, 2026 is 72.5 cents a mile, and 76 cents a mile from July 1. One rate for the whole year is wrong for half of it.
- [IFTA quarterly return calculator](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/): the third quarter 2026 IFTA return is due November 2, 2026, not October 31, 2026, because the statutory date falls on a weekend. The date in the rules is not always the date to file by.

## How do you fix it?

Give the assistant a tool for the exact part, and keep the model for the rest. The model decides which tool to call and explains the result. The tool applies the rule and returns the figure, with its source.

**Read the rest: How do you fix it?**

The tools here work that way. They run over a standard connector called MCP (Model Context Protocol, a common way for an AI assistant to call outside tools), and over a plain REST API. There is no AI in the answers: the same input gives the same answer. Setup guides: [Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/), [ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/) and [Cursor and VS Code](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/). For your own code, see [building an agent](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/).

Each tool runs 5 times a day on its page without an account, so you can compare it with your assistant's answer. [How to check a number an AI gives you](https://krishnachagti-sudo.github.io/toll-preview/guides/check-numbers-from-ai/) sets out the steps.

> Start with [Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/) if your numbers are dates.

- [Anthropic: Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Anthropic: Models overview (reliable knowledge cutoff and training data cutoff)](https://platform.claude.com/docs/en/models/overview)
- [OpenAI: Models (knowledge cutoff listed per model, as of November 2026)](https://developers.openai.com/api/docs/models)

## Questions

### Why does ChatGPT get dates wrong?

It predicts likely text instead of running a date rule. A count of business days needs every holiday and weekend checked in turn, and a text predictor can skip that step and still write a confident answer. Check any date it gives you, or give it a tool that computes dates.

### Can an AI assistant look up today's exchange rate?

Only if it has a tool or search that fetches a published rate. Without one, it answers from what it learned in training, which ends at a cutoff date. A rate for a given day is a fact in a published table, not something to recall.

### What is a knowledge cutoff?

The date after which a model has little or no training data. Anthropic defines a reliable knowledge cutoff as the date through which the model's knowledge is most extensive and reliable. Tax thresholds and mileage rates that changed after that date can be wrong.

### How do I stop an AI from guessing numbers?

Give it a tool that returns the answer from a named source, and ask it to show the tool's output. Then it reports the figure instead of producing one.

## Related

- [How to check a number an AI gives you](https://krishnachagti-sudo.github.io/toll-preview/guides/check-numbers-from-ai/)
- [Use exact tools from Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/)
- [Use exact tools from ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/)
- [Use exact tools in Cursor and VS Code](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/)
- [Why exact answers](https://krishnachagti-sudo.github.io/toll-preview/why-exact/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/  
Data as of: 2026-11-03
