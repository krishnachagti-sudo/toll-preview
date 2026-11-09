# Guides

Practical guides to getting exact answers from your AI assistant, your code editor, your spreadsheet, your automations, your own agent or the tools directly. Every tool they use runs free 5 times a day without an account.

## Deciding and checking

- [Pay per use or a subscription: which costs less](https://krishnachagti-sudo.github.io/toll-preview/guides/pay-per-use-or-subscription/): Pay per use costs less when your price per use times your uses a month is below the subscription fee.
- [A spreadsheet or Endwise: which to use](https://krishnachagti-sudo.github.io/toll-preview/guides/spreadsheet-or-endwise/): A spreadsheet is enough for a simple one-off count, and Endwise is better when the answer depends on a rule or rate that changes.
- [How to check a number an AI gives you](https://krishnachagti-sudo.github.io/toll-preview/guides/check-numbers-from-ai/): Check a number from an AI in 5 steps: ask for its source and date, rerun the same inputs in a tool that applies a fixed rule, test the edge cases, compare the working, and keep a record.
- [Why AI assistants get dates and numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/): An AI assistant predicts likely text.

## With your AI assistant

- [How to use Endwise with Claude (Claude apps and Claude Code)](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/): Yes, in 3 steps: in claude.ai or Claude Desktop, add Endwise as a custom connector at https://krishnachagti-sudo.github.io/toll-preview/mcp, sign in to Endwise, and approve Claude with a monthly limit.
- [How to use Endwise with ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/): Yes, in 3 steps: in ChatGPT on the web, add Endwise as a custom MCP server with OAuth, sign in to Endwise, and approve ChatGPT with a monthly limit.

## In spreadsheets and automations

- [Use Endwise in Google Sheets: custom functions with Apps Script](https://krishnachagti-sudo.github.io/toll-preview/guides/google-sheets/): Yes, in 5 steps: paste a short Apps Script into the sheet, store your API key as a script property, and call =BUSINESSDAYS(A2, B2, "US") or =FXRATE("USD", "EUR", A2).
- [Use Endwise in Excel with Power Query (POST with a JSON body)](https://krishnachagti-sudo.github.io/toll-preview/guides/excel/): Yes, with Power Query in 4 parts: Web.Contents sends a POST, a Headers record carries Authorization: Bearer YOUR\_API\_KEY, Json.FromValue builds the body, and Json.Document reads the answer.
- [Use Endwise in Zapier, Make and n8n (one HTTP step)](https://krishnachagti-sudo.github.io/toll-preview/guides/zapier-make-n8n/): Yes, with 1 HTTP step in each: Zapier's Webhooks by Zapier (Custom Request), Make's HTTP \> Make a request, or n8n's HTTP Request node.

## For developers

- [How to add Endwise to Cursor and VS Code (MCP)](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/): In Cursor, add the server to .cursor/mcp.json (one project) or ~/.cursor/mcp.json (all projects) with an Authorization header.
- [Give your own AI agent exact tools: 3 ways](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/): Connect your agent to Endwise one of 3 ways: Anthropic's MCP connector, OpenAI's remote MCP tool, or plain function calling over REST.

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/  
Data as of: 2026-11-04
