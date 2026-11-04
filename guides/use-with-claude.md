# How to use Endwise with Claude (Claude apps and Claude Code)

Yes, in 3 steps: in claude.ai or Claude Desktop, add Endwise as a custom connector at `https://krishnachagti-sudo.github.io/toll-preview/mcp`, sign in to Endwise, and approve Claude with a monthly limit. In Claude Code, run `claude mcp add --transport http` with the same address and sign in with `/mcp`, or send an API key as a header.

## Can Claude connect to Endwise?

Yes. Endwise is a remote MCP server (MCP is a standard way for an AI app to call outside tools) at `https://krishnachagti-sudo.github.io/toll-preview/mcp`. Claude can list its tools without signing in. To run one, Claude asks you to sign in to Endwise and approve it, the usual OAuth sign-in. Claude then shows up on your [account page](https://krishnachagti-sudo.github.io/toll-preview/account) under Connected apps, with its own monthly limit, like an API key.

This page is current as of November 2026. Claude's features change, so the sources at the bottom are the final word.

## How do I add it to claude.ai or Claude Desktop?

On a Free, Pro, Max or Ultra plan, go to **Customize \> Connectors**, choose **Add custom connector**, and enter the server address:

```text
https://krishnachagti-sudo.github.io/toll-preview/mcp
```

Leave the OAuth client ID and secret empty. If the dialog asks how to sign in, **Sign in when needed** lets Claude list the tools first and ask you to sign in when it calls one. For the OAuth client, Anthropic recommends **Use Claude's published identity**; Endwise also accepts **Register automatically**.

On a Team or Enterprise plan, an Owner adds it for the organization at **Organization settings \> Connectors** by choosing **Add**, then **Custom**. On Enterprise, a member whose custom role includes managing the organization's libraries can add one too. Members then connect from **Customize \> Connectors** with their own Endwise account.

## What does the sign-in look like?

Claude opens a Endwise page. If you are not signed in, you sign in or create an account first and come straight back. The page then says which app is asking (for Claude, claude.ai), what it will be able to do, and where you go back to after you approve.

- It can list the tools and their prices, run tools and pay for each run from your balance, and ask what a run would cost.
- It cannot see your password, add money, change your account or make API keys.
- You set its monthly limit on that page. Runs past the limit are refused and not billed.

Choose **Approve** and Claude carries on. Approving Claude again later keeps the same connection, its limit and its spending history.

## How do I add it to Claude Code?

Run one command in your terminal:

```bash
claude mcp add --transport http endwise https://krishnachagti-sudo.github.io/toll-preview/mcp
```

Then type `/mcp` inside Claude Code and choose to sign in. A browser page opens on Endwise as above. Claude Code runs on your computer, so the page adds a line asking you to approve only if you started the connection yourself.

Claude Code can also send an API key instead of signing in. Create a key on your [account page](https://krishnachagti-sudo.github.io/toll-preview/account) and add the server with a header:

```bash
claude mcp add --transport http endwise https://krishnachagti-sudo.github.io/toll-preview/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

Check it worked:

```bash
claude mcp list
claude mcp get endwise
# inside Claude Code:
/mcp
```

## Which scope should I use in Claude Code?

Claude Code stores a server at one of three scopes. Pass --scope (or -s) to choose. Local is the default.

| Scope | Loads in | Shared with your team | Stored in |
| --- | --- | --- | --- |
| local | This project only | No | ~/.claude.json |
| project | This project only | Yes, through version control | .mcp.json in the project root |
| user | All your projects | No | ~/.claude.json |

With sign-in there is no key in the file, so any scope is safe to share. With an API key, avoid `--scope project` and a literal key, because that file is meant to be committed. Claude Code expands environment variables in a project file, so you can write the header like this and keep the key in your shell:

```json
{
  "mcpServers": {
    "endwise": {
      "type": "http",
      "url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
      "headers": {
        "Authorization": "Bearer ${ENDWISE_API_KEY}"
      }
    }
  }
}
```

> Set `ENDWISE_API_KEY` in your environment first. Claude Code's documentation says an unset variable with no default is left as the literal ${VAR} text, so the call would fail with an invalid key.

## What should I ask first?

Ask something with one right answer. Try: "Count the business days from 1 July to 8 July 2026 in the US."

Claude first asks the server what it offers (a `tools/list` request, which needs no sign-in). It then picks the `business-days` tool and calls it with arguments like these:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

The tool returns the same answer every time for the same input:

```json
{
  "businessDays": 4,
  "holidaysSkipped": [
    {
      "date": "2026-07-03",
      "name": "Independence Day (observed)"
    }
  ]
}
```

Claude then words the answer for you. Nothing in the figure came from a language model. This call costs **$0.0005**. Claude asks your permission before calling a tool, unless you chose to always allow it.

## How do I keep spending under control?

- **Set a monthly limit when you approve.** A call that would pass it is refused and not billed. Change it later on your account page.
- **Keep apps apart.** Claude in the apps and Claude Code are separate connections, each with its own limit.
- **Ask for a quote.** The free `quote_price` tool says what a call would cost your account without running it. Try: "Use quote\_price to tell me what that would cost before you run it."
- **Keep approval on.** Claude asks before it calls a tool. Avoid "always allow" with a high limit.

## How do I disconnect Claude?

Open your [account page](https://krishnachagti-sudo.github.io/toll-preview/account), find Claude under Connected apps and choose Disconnect. It asks you to click again to confirm. Calls from Claude then fail. Remove the connector in Claude too, under **Customize \> Connectors** (Owners use **Organization settings \> Connectors**). For Claude Code:

```bash
claude mcp remove endwise
```

An API key is revoked the same way, under API keys on the account page.

## What can go wrong?

- **Claude asks you to sign in again.** The connection was disconnected, or not used for 60 days. Sign in again; the limit you set is kept.
- **The Endwise page says the app cannot connect.** Remove the connector and add it again. If the OAuth client setting is Use Claude's published identity, try Register automatically.
- **Limit reached.** The connection or the account hit its monthly limit. Raise it on your account page. Nothing was charged.
- **Unauthorized in Claude Code with a key.** The key is missing, wrong or revoked. Check that the header says "Bearer " then the key.

- [Claude docs: Add a connector that isn't in the directory](https://claude.com/docs/connectors/custom)
- [Claude docs: Authentication for connectors](https://claude.com/docs/connectors/building/authentication)
- [Claude Code docs: Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)

## Steps

1. **Add a custom connector.** In claude.ai or Claude Desktop, go to Customize \> Connectors and choose Add custom connector. On Team and Enterprise plans an Owner adds it for the organization.
2. **Enter the server address.** Enter the Endwise MCP server address. Leave the OAuth client ID and secret empty.
3. **Sign in to Endwise and approve.** Claude opens an Endwise page. Sign in, check that the app named is Claude, set a monthly limit for it, and choose Approve.
4. **Ask a question that needs an exact answer.** Ask for a date count, an exchange rate or a mileage figure. Claude lists the tools, picks one and calls it.
5. **Watch spend and disconnect if needed.** Ask Claude to run quote\_price first for a call you are unsure about. Disconnect Claude from your account page at any time.

## Questions

### Can Claude connect to Endwise?

Yes. Add Endwise as a custom connector by its address, and sign in to Endwise when Claude asks. You approve Claude on an Endwise page and give it a monthly limit. You do not need to copy an API key into Claude.

### Who can add a custom connector in the Claude apps?

According to Anthropic's documentation, a remote server can be added as a custom connector on Free, Pro, Max, Ultra, Team and Enterprise plans. On Team and Enterprise an Owner adds it for the organization, and each member then connects with their own account. The Free plan allows one custom connector.

### Will Claude charge me for each tool call?

Claude does not. The tools charge your prepaid balance per call, the same as the API. Each connected app has a monthly limit, and a call past the limit is refused and not billed.

### How do I stop Claude using Endwise?

Open your account page, find Claude under Connected apps and choose Disconnect. Calls from Claude fail from then on. You can also remove the connector in Claude under Customize \> Connectors.

### Can I still use an API key with Claude Code?

Yes. Claude Code accepts a header option on claude mcp add, so a Bearer API key works there as before.

## Related

- [Use the tools in Cursor and VS Code](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/)
- [Build an agent on exact tools](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/)
- [MCP for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Your account and connected apps](https://krishnachagti-sudo.github.io/toll-preview/account)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/  
Data as of: 2026-11-04
