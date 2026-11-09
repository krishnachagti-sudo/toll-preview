# Give your own AI agent exact tools: 3 ways

Connect your agent to Endwise one of 3 ways: Anthropic's MCP connector, OpenAI's remote MCP tool, or plain function calling over REST. Each uses an API key sent as a Bearer token, and you should give every agent its own key with a monthly spending limit.

## How do I give my AI agent exact tools?

Connect it to Endwise one of three ways. Each one ends in the same place: your agent asks for a tool by name, Endwise runs it and returns the result, and the cost comes out of one prepaid balance. No AI is involved in the answer, so the same input gives the same result.

Three ways to connect an agent

| Route | Use it when | How the key is sent |
| --- | --- | --- |
| Anthropic Messages API, MCP connector | Your agent runs on Claude and you want no tool code | `authorization_token` on the server entry |
| OpenAI Responses API, remote MCP tool | Your agent runs on an OpenAI model and you want no tool code | `headers` on the tool |
| Function calling over REST | You want control of retries, logging and approval, or use any other model | `Authorization: Bearer` on your own request |

MCP is the Model Context Protocol, a standard way for an AI app to find and call outside tools. The first two routes let the model provider connect to the Endwise MCP server for you. The third calls the REST API from your own code. [Claude Desktop, Cursor and VS Code](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/) use the same server.

## Which API key should each agent use?

Make one key per agent. Keys are created on the [account page](https://krishnachagti-sudo.github.io/toll-preview/account), start with `tk_live_`, and are shown once. Each key has its own monthly spending limit, and you can set one for the whole account too. A call that would pass either limit is refused with `cap_reached` and charges nothing. Limits count from the 1st of each month (UTC).

**Read the rest: Which API key should each agent use?**

- Put the key in an environment variable or a secrets store on your server. Never put it in a web page, a mobile app or a public repository.
- Give an experimental agent a small limit. Raise it once you have seen what it spends.
- Revoke a key on the account page and the agent stops at once. Other agents are not affected.
- Check a key with GET /api/v1/me. It returns the balance and how much this key has spent against its limit this month.

## How do I use Claude with the MCP connector?

The Anthropic Messages API can connect to a remote MCP server without your own MCP client. You pass the server in `mcp_servers` and enable its tools with an `mcp_toolset` entry in `tools`. As of November 2026 it is a beta feature and needs a beta header, `mcp-client-2025-11-20`. Anthropic also documents a newer one, `mcp-client-2026-09-15`, that includes everything in the older one and adds pinning of the server's tool list.

```python
import os, anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1000,
    messages=[{"role": "user", "content": "Count the business days from 1 July to 8 July 2026 in the US."}],
    mcp_servers=[{
        "type": "url",
        "url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
        "name": "endwise",
        "authorization_token": os.environ["ENDWISE_API_KEY"],
    }],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "endwise"}],
    betas=["mcp-client-2025-11-20"],
)
print(response)
```

Anthropic's documentation describes `authorization_token` as an OAuth token for servers that need one. A Endwise key is a bearer token too, and the MCP server reads it from an `Authorization: Bearer` header.

Anthropic's page does not say whether a token that is not from an OAuth flow is accepted, so test with one cheap call and a low-limit key. If the connector refuses it, use the REST route below, which has no such question.

## How do I use an OpenAI model with a remote MCP tool?

In the Responses API, add a tool of `type: "mcp"` with your `server_url`. OpenAI's API reference lists an optional `headers` map for it, described as HTTP headers to send to the MCP server, for authentication or other purposes. Send the key as a Bearer header:

```python
import os
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-6-astra",
    input="Count the business days from 1 July to 8 July 2026 in the US.",
    tools=[{
        "type": "mcp",
        "server_label": "endwise",
        "server_url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
        "headers": {"Authorization": "Bearer " + os.environ["ENDWISE_API_KEY"]},
        "require_approval": "never",
    }],
)
print(resp.output_text)
```

By default OpenAI asks for approval before data is sent to a remote MCP server. `require_approval` can be `"always"`, `"never"`, or an object that lists the tools to skip approval for. `"never"` is fine for read-only lookups on a key with a low limit. For anything else, keep approval on and have your code or a person confirm.

## How do I give any model the tools by plain function calling?

This route works with any model that supports function calling, and it is the one that gives you the most control. The tool list at `GET /api/v1/tools` needs no key and gives each tool's name, summary, prices in words and JSON input schema. Turn each entry into a function definition. When the model calls one, make a single POST to `/toll-preview/api/v1/tools/<slug>` with the arguments as the JSON body.

```python
import json, os, uuid, requests
from openai import OpenAI

BASE = "https://krishnachagti-sudo.github.io/toll-preview/api/v1"
HEADERS = {"Authorization": "Bearer " + os.environ["ENDWISE_API_KEY"]}

# 1. Build the function list from the public tool list (needs no key).
listed = requests.get(BASE + "/tools").json()["tools"]
tools = []
for t in listed:
    if t["kind"] != "api":
        continue
    schema = {k: v for k, v in t["inputSchema"].items() if k != "$schema"}
    tools.append({"type": "function", "name": t["slug"], "description": t["summary"], "parameters": schema})

# 2. One POST per call. Reuse the key when you retry the same call.
def run_tool(slug, args, call_key):
    r = requests.post(f"{BASE}/tools/{slug}", json=args,
                      headers={**HEADERS, "Idempotency-Key": call_key}, timeout=30)
    return r.json()   # {"ok": true, "result": ...} or {"ok": false, "error": {...}}

client = OpenAI()
input_list = [{"role": "user", "content": "Count the business days from 1 July to 8 July 2026 in the US."}]
response = client.responses.create(model="gpt-6-astra", tools=tools, input=input_list)
input_list += response.output
for item in response.output:
    if item.type == "function_call":
        out = run_tool(item.name, json.loads(item.arguments), item.call_id)
        input_list.append({"type": "function_call_output", "call_id": item.call_id, "output": json.dumps(out)})
response = client.responses.create(model="gpt-6-astra", tools=tools, input=input_list)
print(response.output_text)
```

The sample uses OpenAI's function format (`type: "function"`, `name`, `parameters`, and a `function_call_output` item returned with the call's `call_id`). Other providers use a different wrapper around the same JSON schema.

## What does a real call look like?

Count the business days from 1 July to 8 July 2026 in the US. One POST to https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days with the key in the Authorization header and this body:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

The tool's result:

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

The full response wraps the result with `ok: true`, a `charged` block (the cost as a number and as text), your new balance, and a `dataVersion` naming the reference data used. This tool costs $0.0005 per call. See the [Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/) page.

## How does my agent check the price before an expensive call?

Ask for a quote. Send the same body to the tool's `/quote` address. It returns the amount as a number (whole micro-units, where one dollar is 1,000,000) and as text, plus the price in words, and it runs, charges and reserves nothing.

```text
POST https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days/quote
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{"op":"between","region":"US","start":"2026-07-01","end":"2026-07-08"}
```

Over MCP, a free `quote_price` tool does the same, with the arguments `tool` and `arguments`. It is listed when some tool prices by what you ask for, so check `tools/list` before relying on it.

Most tools have one fixed price, shown on their pages. Some price per row or per document, and those are the calls worth quoting. A simple rule for an agent: quote first whenever the input has a list, a batch or a file, and refuse to go ahead if the quote is above a number you set.

## How should my agent handle errors?

Every REST error has the same shape, and every refused call is not charged. Over MCP the same message comes back as tool-result text that the model can read.

```json
{
  "ok": false,
  "error": { "code": "cap_reached", "message": "..." }
}
```

Errors an agent should handle

| Status | Code | What the agent should do |
| ---: | --- | --- |
| 400 | `invalid_input` | Read error.fields, fix the arguments and try again. Not charged. |
| 401 | `unauthorized` | Stop. The key is missing, wrong or revoked. |
| 402 | `insufficient_balance` | Stop and tell a person to add money. Retrying will not help. |
| 402 | `cap_reached` | Stop until the 1st of the month or until a person raises the limit. Not charged. |
| 409 | `in_progress` | The same Idempotency-Key is still running. Wait a moment and retry. |
| 422 | `idempotency_mismatch` | You reused a key with different input. Use a new key per distinct call. |
| 422 | `not_available` | The tool cannot answer this exactly. Do not retry; tell the user. |
| 429 | `rate_limited` | Wait briefly and retry. A key can make 10 requests a second, with bursts up to 20. |
| 502 | `upstream_failed` | The tool failed and the charge was refunded. Safe to retry. |

For retries, send an `Idempotency-Key` header, 1 to 200 characters, unique per logical call. If that key was already answered for the same tool, you get the stored answer back marked `Idempotent-Replay: true` and nothing more is charged. The sample above uses the model's own `call_id` as the key, so a retried tool call can never be billed twice.

The full list of codes is in the [docs](https://krishnachagti-sudo.github.io/toll-preview/docs). Free tools in a browser need none of this: without an account you get 5 free runs a day on the web.

- [Anthropic: MCP connector (Messages API)](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
- [OpenAI: MCP servers in the Responses API](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [OpenAI: Responses API reference (the mcp tool and its headers field)](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [Model Context Protocol: authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)

## Questions

### How do I give an AI agent access to an API with a key?

Three ways work with Endwise. Pass the MCP server address and your key to the Anthropic Messages API (mcp\_servers) or the OpenAI Responses API (an mcp tool with headers), or define each tool as a function in your agent and make one POST per call to the REST API with the key as a Bearer token.

### How do I stop an agent from overspending?

Give each agent its own API key with a monthly spending limit. A call that would pass the limit is refused with cap\_reached and charges nothing. Ask for a quote before expensive calls, and set an account-wide limit as a second guard.

### What should my agent do when a call fails?

Retry rate\_limited after a short wait, reusing the same Idempotency-Key. Stop and tell a person on insufficient\_balance and cap\_reached, because retrying cannot fix them. Fix the arguments on invalid\_input. upstream\_failed is refunded and is safe to retry.

### Does the agent pay for failed calls?

No. A call with invalid input is refused before any charge. If a tool fails while it runs, the charge is refunded straight away and the response says so.

## Related

- [REST API for developers](https://krishnachagti-sudo.github.io/toll-preview/developers/)
- [MCP server for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Use Endwise with ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/)
- [Use Endwise with Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/)
- [Docs: keys, errors and limits](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/  
Data as of: 2026-11-03
