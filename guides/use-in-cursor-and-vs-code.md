# How to add Endwise to Cursor and VS Code (MCP)

In Cursor, add the server to `.cursor/mcp.json` (one project) or `~/.cursor/mcp.json` (all projects) with an Authorization header. In VS Code, add it to `.vscode/mcp.json` under "servers" with "type": "http". Either way it is 1 short block of JSON, and the key can come from an environment variable or a password prompt instead of the file.

## Can Cursor and VS Code connect to a tool server with an API key?

Yes. Both read a JSON config file that lists MCP servers (MCP is a standard way for an editor's AI to call outside tools), and both let you send a header with your key. The Endwise server is at `https://krishnachagti-sudo.github.io/toll-preview/mcp`. Listing its tools needs no key. Calling one takes your key as a Bearer token.

This page is current as of November 2026. Editors change often, so check the sources at the bottom if a setting looks different.

## How do I add Endwise to Cursor?

Cursor reads `.cursor/mcp.json` in your project for tools that only that project needs, or `~/.cursor/mcp.json` in your home folder for tools in every project.

Cursor expands `${env:NAME}` in the `url` and `headers` values, and its documentation says to use environment variables for secrets and never hardcode them. Export the key in your shell profile first (`export ENDWISE_API_KEY=...`), then use this file:

```json
{
  "mcpServers": {
    "endwise": {
      "url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
      "headers": {
        "Authorization": "Bearer ${env:ENDWISE_API_KEY}"
      }
    }
  }
}
```

Restart Cursor after you save, so it starts with the variable set. An editor opened from the dock or Start menu can miss variables that are set only in a terminal.

> Cursor's documentation says remote servers do not support envFile, so the variable has to be in the environment Cursor starts with.

## How do I add Endwise to VS Code?

VS Code reads `.vscode/mcp.json` in your workspace, or an mcp.json in your user profile. Its format differs from Cursor's: the top-level key is `servers`, not `mcpServers`, and a remote server has `"type": "http"`.

VS Code documents an `inputs` array for sensitive values. An input with `"password": true` hides what you type. You refer to it as `${input:id}`. VS Code prompts you for the value when the server starts for the first time, then stores it securely for later. The key never appears in the file:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "endwise-key",
      "description": "Endwise API key",
      "password": true
    }
  ],
  "servers": {
    "endwise": {
      "type": "http",
      "url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
      "headers": {
        "Authorization": "Bearer ${input:endwise-key}"
      }
    }
  }
}
```

You can also run **MCP: Add Server** from the Command Palette, choose **HTTP** and enter the address, then add the header by hand in the file it opens.

Your organization can restrict which MCP servers are available. If the server is blocked, that is a policy question for your admin, not a setting in this file.

## What about Claude Code?

Claude Code is set up with a terminal command, not one of these files. Run `claude mcp add --transport http` with the same address and a Bearer header. The steps, the scopes and the Claude apps are in the [Claude guide](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/).

## How do I check it worked?

- **Cursor:** open the Output panel (Cmd+Shift+U on a Mac), choose MCP Logs, and look for connection or authentication errors. Cursor's documentation lists this as the way to debug.
- **VS Code:** open the tools picker in chat and look for the server's tools. VS Code's documentation says to send a prompt that names the server, then confirm a tool from it was called and returned output without errors. A plausible answer alone is not proof.

A good first prompt is: "Count the business days from 1 July to 8 July 2026 in the US." The editor lists the tools, calls `business-days` with arguments like these, and shows the call so you can see it ran:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

The answer is the same every time for the same input:

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

This call costs **$0.0005**. The free `quote_price` tool tells you the cost of a call before you make it.

## How do I keep the key out of git?

- Do not write the key into any file you commit. Use the variable (Cursor) or the hidden prompt (VS Code) shown above.
- **Check before you commit.** Run `git diff --staged` and look for the key. Keys on this site start with `tk_live_`.
- **Limit the damage.** Give each editor its own key with a low monthly limit on your [account page](https://krishnachagti-sudo.github.io/toll-preview/account). A call past the limit is refused and not billed.
- **If a key leaks, revoke it.** Choose Revoke next to the key on your account page, then make a new one.

- [Cursor docs: Model Context Protocol (MCP)](https://cursor.com/docs/context/mcp)
- [VS Code docs: Use MCP servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
- [VS Code docs: MCP configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration)
- [Claude Code docs: Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)

## Steps

1. **Make an API key.** Create a key on your account page with a monthly limit, and copy it. It is shown once.
2. **Put the key in an environment variable or a prompt.** In Cursor, export ENDWISE\_API\_KEY in your shell. In VS Code, use an input that asks for the key and hides what you type.
3. **Add the server to the config file.** Cursor reads .cursor/mcp.json or ~/.cursor/mcp.json. VS Code reads .vscode/mcp.json. Use the JSON on this page.
4. **Restart the editor and check the tools.** Cursor: open the MCP Logs in the Output panel. VS Code: open the tools picker in chat. Then ask a question that needs an exact answer.
5. **Keep the key out of git.** Commit only config that points to the variable or prompt. Never write the key in a file you commit.

## Questions

### Where does Cursor read its MCP servers from?

From .cursor/mcp.json in a project, for tools only in that project, or ~/.cursor/mcp.json in your home folder, for tools in every project.

### Does VS Code use the same mcp.json format as Cursor?

No. VS Code uses a top-level "servers" object in .vscode/mcp.json, with "type": "http" on each remote server. Cursor uses "mcpServers".

### How do I keep my API key out of git?

Reference the key from an environment variable in Cursor with ${env:NAME}, or from a hidden prompt in VS Code with an inputs entry. Commit the file only when it holds no literal key.

### Does Claude Code work with the same server?

Yes, with one command and a Bearer header. The Claude guide has the steps.

## Related

- [Use the tools with Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/)
- [Build an agent on exact tools](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/)
- [MCP for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Docs](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/  
Data as of: 2026-11-03
