# How to use Endwise with Claude (Claude Code and apps)

In Claude Code it takes 1 command: `claude mcp add --transport http` with the Endwise server address and your API key as a Bearer header, then check it with `claude mcp list`. The Claude apps can connect too where an organization has the Request headers option, which Anthropic says is in beta for a limited set of organizations as of November 2026.

## Can Claude connect to an API with a key?

Yes, in Claude Code. In the Claude apps it depends on your account. Endwise is a remote MCP server (MCP is a standard way for an AI app to call outside tools) at `https://krishnachagti-sudo.github.io/toll-preview/mcp`. It takes your API key as a Bearer token. Listing the tools needs no key. Calling one does.

This page is current as of November 2026. Claude's features change, so the sources at the bottom are the final word.

## How do I add it to Claude Code?

Run one command in your terminal. Replace `YOUR_API_KEY` with a key from your [account page](https://krishnachagti-sudo.github.io/toll-preview/account).

```bash
claude mcp add --transport http endwise https://krishnachagti-sudo.github.io/toll-preview/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

Claude Code's documentation shows this form for a Bearer token: `claude mcp add --transport http <name> <url> --header "Authorization: Bearer your-token"`. HTTP is the transport it recommends for remote servers.

Check it worked:

```bash
claude mcp list
claude mcp get endwise
# inside Claude Code:
/mcp
```

## Which scope should I use?

Claude Code stores a server at one of three scopes. Pass --scope (or -s) to choose. Local is the default.

| Scope | Loads in | Shared with your team | Stored in |
| --- | --- | --- | --- |
| local | This project only | No | ~/.claude.json |
| project | This project only | Yes, through version control | .mcp.json in the project root |
| user | All your projects | No | ~/.claude.json |

Use `--scope user` for a key you want everywhere. Avoid `--scope project` with a literal key, because that file is meant to be committed. Claude Code expands environment variables in a project file, so you can write the header like this and keep the key in your shell:

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

## Can I use it in the Claude apps (claude.ai and Claude Desktop)?

Only if your account has the Request headers section. Anthropic documents it as in beta and available to a limited set of organizations.

Here is what Anthropic's documentation says. Custom connectors by URL work on Free, Pro, Max, Ultra, Team and Enterprise plans. On a Free, Pro, Max or Ultra plan you go to **Customize \> Connectors**, choose **Add custom connector**, and enter the server address. The Free plan can add one.

On a Team or Enterprise plan, an Owner adds it for the organization at **Organization settings \> Connectors** by choosing **Add**, then **Custom**. On Enterprise, a member whose custom role includes managing the organization's libraries can add one too. Other members cannot, and need to ask an Owner. Members then connect from **Customize \> Connectors**.

For an API key, the documentation says to set Authentication to **No sign-in** and add the key under **Request headers**. Pick the header name `authorization` and enter the value with the scheme included:

```text
Bearer YOUR_API_KEY
```

Claude sends the value exactly as you enter it and adds no prefix, so leave out "Bearer " and the call fails. You can add up to four headers. You cannot change a header later: remove the connector and add it again.

If you do not see **Request headers** in the dialog, Anthropic says your organization does not have access yet. In that case this route is not open to you. Use Claude Code instead.

## Is there a workaround for Claude Desktop?

One, with a caveat. The [mcp-remote](https://github.com/geelen/mcp-remote) npm package is a local bridge that runs on your computer and forwards to a remote server. Its README documents a `--header` option and a Claude Desktop config file at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS and `%APPDATA%\Claude\claude_desktop_config.json` on Windows. It is a third-party package, not made by Anthropic or by Endwise. Read it before you run it, since it runs with your user permissions.

Its README says Claude Desktop on Windows has a bug where spaces inside args are not escaped, and shows a workaround that keeps the space in an env value. This is the shape it gives:

```json
{
  "mcpServers": {
    "endwise": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://krishnachagti-sudo.github.io/toll-preview/mcp",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

> This config keeps your key in a plain file on your computer. We have not tested it against Claude Desktop, so if it fails, use Claude Code.

## What should I ask first?

Ask something with one right answer. Try: "Count the business days from 1 July to 8 July 2026 in the US."

Claude first asks the server what it offers (a `tools/list` request, which needs no key). It then picks the `business-days` tool and calls it with arguments like these:

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

- **Give each key a monthly limit.** Set it when you create the key. A call that would pass it is refused and not billed.
- **Make one key per tool or agent.** Then you can limit or revoke each on its own.
- **Ask for a quote.** The free `quote_price` tool says what a call would cost your account without running it. Try: "Use quote\_price to tell me what that would cost before you run it."
- **Keep approval on.** Claude asks before it calls a tool. Avoid "always allow" on a key with a high limit.

## How do I revoke a key?

Open your [account page](https://krishnachagti-sudo.github.io/toll-preview/account), find the key under API keys and choose Revoke. It asks you to click again to confirm. Calls with that key then fail. Remove the entry from Claude too:

```bash
claude mcp remove endwise
```

In the Claude apps, remove the connector under **Customize \> Connectors** (Owners use **Organization settings \> Connectors**).

## What can go wrong?

- **Unauthorized.** The key is missing, wrong or revoked. Check that the header says "Bearer " then the key.
- **Limit reached.** The key or the account hit its monthly limit. Raise it on your account page. Nothing was charged.
- **The server is not listed.** Run claude mcp list. If the name is missing, repeat the add command. A name can be added only once per scope.

- [Claude Code docs: Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [Claude docs: Add a connector that isn't in the directory](https://claude.com/docs/connectors/custom)
- [mcp-remote on GitHub (README)](https://github.com/geelen/mcp-remote)

## Steps

1. **Make an API key.** Open your account page, create a key, give it a name and a monthly limit, and copy it. It is shown once.
2. **Add the server to Claude Code.** Run claude mcp add with --transport http, the server address and a --header "Authorization: Bearer YOUR\_API\_KEY" option.
3. **Check the connection.** Run claude mcp list, or type /mcp inside Claude Code, and confirm the server is listed as connected.
4. **Ask a question that needs an exact answer.** Ask for a date count, an exchange rate or a mileage figure. Claude lists the tools, picks one and calls it.
5. **Watch spend and revoke if needed.** Ask Claude to run quote\_price first for a call you are unsure about. Revoke a key from your account page at any time.

## Questions

### Can Claude connect to an API that needs a key?

Claude Code can, today, with a header option on one command. The Claude apps (claude.ai and Claude Desktop) have a Request headers section for API keys, but Anthropic says it is in beta and open to a limited set of organizations as of November 2026.

### Who can add a custom connector in the Claude apps?

According to Anthropic's documentation, a remote server can be added as a custom connector on Free, Pro, Max, Ultra, Team and Enterprise plans. On Team and Enterprise an Owner adds it for the organization. The Free plan allows one custom connector.

### Will Claude charge me for each tool call?

Claude does not. The tools charge your prepaid balance per call, the same as the API. Each key has a monthly limit, and a call past the limit is refused and not billed.

### How do I stop using a key?

Open your account page, find the key and choose Revoke. Calls made with it fail from then on. Then run claude mcp remove on your computer to drop the server entry.

## Related

- [Use the tools in Cursor and VS Code](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/)
- [Build an agent on exact tools](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/)
- [MCP for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Create an API key](https://krishnachagti-sudo.github.io/toll-preview/account)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/  
Data as of: 2026-11-03
