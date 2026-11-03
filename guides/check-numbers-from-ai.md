# How to check a number an AI gives you

Check a number from an AI in 5 steps: ask for its source and date, rerun the same inputs in a tool that applies a fixed rule, test the edge cases, compare the working, and keep a record. A matching answer with matching working is a pass; a difference points to the step that went wrong.

## How do you check a number an AI gives you?

Do not ask the same assistant again. Redo the calculation by a different method, one that applies a fixed rule to a published source, and compare. The steps below take a few minutes.

## What should you check for each kind of number?

The same few places go wrong. These cases are computed by the tools themselves, so you can reproduce each one.

Edge cases to test, by kind of number

| Kind of number | Check this | Worked case |
| --- | --- | --- |
| Dates | A holiday that falls on a weekend | US business days from July 1 to July 8, 2026: 4 business days, skipping Independence Day (observed) (July 3, 2026) |
| Dates | A deadline on a weekend | IFTA third quarter 2026: statutory date October 31, 2026, due November 2, 2026 |
| Money and rates | A rate on a day with no published rate | US dollar to euro on Saturday, October 24, 2026: rate from the fixing of October 23, 2026, not the weekend date |
| Money and rates | A rate that changes mid-year | IRS business mileage, June 30, 2026: 72.5 cents a mile; July 1, 2026: 76 cents a mile |
| Tax thresholds | The year the figure applies to | Form 1099-NEC reporting line: $600 for 2025 payments, $2,000 for 2026 payments |

## Which tool checks which number?

- [Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/): business days between two dates, a date after a number of business days, with every skipped holiday named. Covers observed and substitute days.
- [Exchange rate on a date](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/): an exchange rate on a given date, with the date of the fixing it used.
- [Mileage reimbursement and IRS mileage log](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/): the IRS mileage rate in force on each trip date.
- [1099 threshold tracker](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/): whether a payee needs a Form 1099, by payment year.
- [IFTA quarterly return calculator](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/): IFTA due dates and rates by quarter.
- [Tax set-aside per payment](https://krishnachagti-sudo.github.io/toll-preview/tax-set-aside/): how much of a payment to set aside for tax, with each constant cited.

## Can you check it without opening a website?

Yes. If your assistant is connected to the tools, it can call them itself and show you the output. The setup guides cover [Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/) and [ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/). Each tool also runs 5 times a day on its page without an account.

To see why these mistakes happen, read [why AI assistants get dates and numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/).

## Steps

1. **Ask for the source and the date.** Ask the assistant which published source the number comes from and which date it applies to. A rule or a rate needs both: the rule in force on that day. If it names no source, or only says "generally", treat the number as unchecked.
2. **Rerun the exact case in an exact tool.** Enter the same inputs in a tool that applies a fixed method to a named source, and compare. For dates use the business days tool; for a rate on a day use the exchange rate tool; for tax lines and rates use the tool for that form. The same input always gives the same answer.
3. **Test the edge cases.** Change the input to the cases a quick guess misses: a start or end date on a weekend, a holiday that is observed on a different day, a range that crosses a year boundary, a payment on the day a rate changes. If the answer changes, ask the assistant why.
4. **Compare the working, not only the answer.** A tool that shows its working lists the days it skipped, the date of the rate it used, or the line of the IRS instructions behind a figure. If the assistant's answer and the tool's answer differ, the working shows where.
5. **Keep a record.** Save the inputs, the answer, the source and the date you checked. Rules and rates change, so the record shows what was true on the day you relied on it.

## Questions

### How do I know if an AI answer about dates is correct?

Rerun the same dates in a tool that applies the rule. For business days, compare the count and the list of skipped holidays. If the assistant gave no list of skipped days, you cannot check its count without redoing it.

### Should I trust a tax figure from a chatbot?

Treat it as a draft. Ask for the source and the tax year, then check the figure against the IRS publication or a tool that cites it. Thresholds and rates change from year to year.

### What is the fastest way to check an exchange rate on a date?

Look it up in the table the rate comes from. Central bank reference rates are published on business days only, so for a weekend or holiday the right answer is the last published rate before the date, named as such.

### Can the AI check its own numbers?

Not reliably by asking it again. A second answer from the same method can repeat the same mistake. A check needs a different method: a rule applied step by step, or a published source.

## Related

- [Why AI assistants get dates and numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/)
- [Use exact tools from Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/)
- [Use exact tools from ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/)
- [Why exact answers](https://krishnachagti-sudo.github.io/toll-preview/why-exact/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/check-numbers-from-ai/  
Data as of: 2026-11-03
