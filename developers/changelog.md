# API changelog

This is the log of changes to the Endwise REST API and MCP server, newest first. The latest change is dated November 4, 2026, and the log starts on October 30, 2026.

## What changed in the API and the MCP server, and when?

Each entry is a change a caller can see. Some are written by hand; others are recorded by the server itself, which compares its OpenAPI document and MCP tool list with the last ones it saw each time it starts. Changes to the data and rules behind the tools are on the [data updates page](https://krishnachagti-sudo.github.io/toll-preview/updates/). Paths below start after the base path of the site.

Changes to the public API

| Date | Area | What changed |
| --- | --- | --- |
| November 4, 2026 | MCP | A tools/call request with no valid sign-in or API key now gets HTTP 401 with a WWW-Authenticate Bearer challenge, so OAuth clients know where to sign in. The body still carries the JSON-RPC error -32001, and its message reads "Sign in to Endwise or add your API key as a Bearer token." |
| November 4, 2026 | Auth | The MCP endpoint accepts OAuth sign-in as well as API keys, so the Claude and ChatGPT apps can connect by signing in. Authorization uses PKCE (S256), dynamic client registration and refresh tokens that rotate. Each connected app has its own monthly limit and shows under Connected apps on the account page. Bearer API keys work as before. Access tokens are accepted on the MCP endpoint only, not on the REST API. |
| November 4, 2026 | MCP | Each tool in the tools/list reply now carries \_meta.securitySchemes with an oauth2 scheme, which tells clients that offer sign-in (ChatGPT does) to ask for it. |
| November 3, 2026 | OpenAPI | The OpenAPI document at /api/v1/openapi.json now has a servers entry with the site origin, so tools that import the document (a GPT Action, code generators) know the host. |
| November 3, 2026 | REST | Prices in the tools list, in the tool descriptions and in the OpenAPI document are in US dollars only. |
| October 31, 2026 | REST | New endpoint: POST /api/v1/tools/{slug}/quote returns what an input would cost your account now, without running, charging or reserving anything. It is also in the OpenAPI document. |
| October 31, 2026 | MCP | New free tool quote\_price: pass a tool name and the arguments you would call it with and it says what the call would cost this account, without running it. |
| October 31, 2026 | REST | Every API tool in GET /api/v1/tools and GET /api/v1/tools/{slug} now has a pricing block that lists the price of each action in words. The MCP and OpenAPI descriptions show the same prices. |
| October 30, 2026 | MCP | The MCP server is published at /mcp: POST, JSON-RPC 2.0 over stateless Streamable HTTP. It answers initialize, tools/list, tools/call and ping, and acknowledges notifications with HTTP 202. Calls use the same Bearer API key, prices and limits as the REST API. |
| October 30, 2026 | REST | The REST API is published under /api/v1: GET /tools, GET /tools/{slug}, POST /tools/{slug} to run a tool with a Bearer API key, GET /me for your balance and spend, and GET /openapi.json. The optional Idempotency-Key header makes a retry safe: a repeated key returns the stored answer, marked Idempotent-Replay: true, and charges nothing more. |
| October 30, 2026 | REST | Errors come back as { ok: false, error: { code, message } }. The codes at launch included: invalid\_input (400), unauthorized (401), insufficient\_balance (402), cap\_reached (402), forbidden (403), unknown\_tool (404), rate\_limited (429) and upstream\_failed (502). Idempotency-Key reuse with different input is refused as idempotency\_mismatch (422). |

## Where can I read how the API works?

See the [docs](https://krishnachagti-sudo.github.io/toll-preview/docs) for keys, errors and idempotency, and the [MCP page](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/) for connecting an AI assistant.

## Questions

### Where is the API documented?

The docs page covers keys, pricing, errors, idempotency and the MCP endpoint. The OpenAPI document at /api/v1/openapi.json lists every tool endpoint. This page lists what changed and when.

### Does this page list changes to prices or data?

No. It lists only changes a caller of the REST API or the MCP server can see. Changes to the data and rules behind the tools are on the data updates page.

### Will a change to the API break my integration?

Each entry says exactly what a caller sees. The REST API is versioned in its path (/api/v1). Read the entries since your integration was last tested.

## Related

- [API and MCP docs](https://krishnachagti-sudo.github.io/toll-preview/docs)
- [Developers](https://krishnachagti-sudo.github.io/toll-preview/developers/)
- [MCP for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/developers/changelog/  
Data as of: 2026-11-04
