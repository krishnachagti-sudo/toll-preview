# Does Endwise work with ChatGPT? What works today

Not through the ChatGPT app's MCP connector: as of November 2026 OpenAI lists only OAuth and no-authentication options, and Endwise needs an API key. Two things do work: a custom GPT Action with API key authentication (OpenAI has scheduled custom GPT retirement for 11 December 2026), and the OpenAI API's remote MCP tool from your own code.

## Can ChatGPT connect to an MCP server that needs an API key?

No, not today. ChatGPT can add a custom **MCP server** (MCP, the Model Context Protocol, is the standard way an AI app finds and calls outside tools). OpenAI lists three ways to sign in to one: **OAuth**, **no authentication**, and a mix of the two where the tool list needs no sign-in and each tool uses OAuth or none. An API key sent in an `Authorization` header is not on that list.

Endwise's MCP server (https://krishnachagti-sudo.github.io/toll-preview/mcp) lists its tools to anyone, but running one needs an API key as a Bearer token. It does not offer OAuth. So there is no setting in the ChatGPT app that makes the two work together. Do not add it with "No authentication": the tools would show up and every call would be refused.

> This is the state of OpenAI's documentation in November 2026. Connector options change, so check OpenAI's page (linked below) before you give up. If ChatGPT adds a key or header option, the same server address and Bearer key from the [MCP page](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/) are what you would enter.

## Can a custom GPT call Endwise with an API key?

Yes, for now. A custom GPT can have an **Action**: a REST API described by an OpenAPI schema, which the GPT calls when a question needs it. OpenAI's Action settings let you choose "None", "API Key" or "OAuth". API Key is what Endwise needs, because every call is a POST with a Bearer key.

Endwise publishes its OpenAPI document with no key needed:

```text
https://krishnachagti-sudo.github.io/toll-preview/api/v1/openapi.json
```

The document gives each tool's address, its input schema and its price in words. Prices and limits are the same as for any API call, and each key has a monthly spending cap you set on the [account page](https://krishnachagti-sudo.github.io/toll-preview/account).

The document names its server, so the Action editor can import it as it is, either from the address above or pasted in. The steps below go through it.

## What does a GPT get back from an Endwise action?

The GPT sends the tool's input as JSON and gets the tool's answer, what it cost, and your balance. Count the business days from 1 July to 8 July 2026 in the US. The input:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

The result:

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

That call costs $0.0005, taken from your balance. The full response also carries a `charged` block and your new balance. See the [Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/) page for the rules behind the answer.

## Will custom GPTs keep working?

Only for a limited time. OpenAI's help center has a custom GPT retirement and migration FAQ. It gives 11 December 2026 as the scheduled date when custom GPTs stop running, says timing can vary by account and workspace, and says existing GPT Actions do not carry over automatically. They have to be rebuilt as an app or a custom MCP server.

For Endwise that second path has the same limit as the first section: a custom MCP server in ChatGPT cannot send an API key. If you need ChatGPT to use these tools after the GPT is retired, check OpenAI's connector options again at that time. Until then the Action route works, and you should not build anything long-lived on it.

## Can I use Endwise with the OpenAI API?

Yes, and this route has no gap. In the Responses API you add a remote MCP server as a tool. OpenAI's API reference lists an optional `headers` field for it, described as HTTP headers to send to the MCP server, for authentication or other purposes. That is where the Bearer key goes:

```python
from openai import OpenAI
import os

client = OpenAI()

resp = client.responses.create(
    model="gpt-6-astra",
    input="How many US business days are there from 2026-07-01 to 2026-07-08?",
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

By default OpenAI asks for your approval before data goes to a remote MCP server. Setting `require_approval` to `"never"` skips that. Do it only with a key that has a low monthly limit. The [agent guide](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/) covers approvals, quotes before expensive calls and error handling.

## Is my key shared with OpenAI?

In an Action, yes: you type the key into OpenAI's editor, and OpenAI sends it to Endwise with each call. OpenAI's Action docs say it encrypts the secret key in its database. In the API, your code sends the key to OpenAI in the request, and OpenAI's MCP guide says the Responses API does not store the value of its `authorization` field. It does not say the same about `headers`, so assume a key placed there reaches OpenAI.

Either way, make a key for that one use, set a low monthly limit, and revoke it from the [account page](https://krishnachagti-sudo.github.io/toll-preview/account) when you are done. Endwise stores only a fingerprint of a key, so it cannot show it to you again.

## Can ChatGPT do exact date math?

Not by itself. A chat model produces text that looks like an answer, so a date count can be off by a day with no warning. The reason is explained in [why AI gets numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/). If the figure comes from an action, the action call shows the input it sent and the result it got, and you can [check it against the tool page](https://krishnachagti-sudo.github.io/toll-preview/guides/check-numbers-from-ai/). Without any setup you can also use the tools directly on the web: 5 free runs a day, no account.

- [OpenAI: Add custom MCP server (ChatGPT plugins)](https://developers.openai.com/api/docs/guides/custom-mcp-server)
- [OpenAI: GPT Action authentication](https://developers.openai.com/api/docs/actions/authentication)
- [OpenAI: Getting started with GPT Actions](https://developers.openai.com/api/docs/actions/getting-started)
- [OpenAI: MCP servers in the Responses API](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [OpenAI: Responses API reference (the mcp tool and its headers field)](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [OpenAI Help Center: Custom GPT retirement and migration FAQ](https://help.openai.com/en/articles/20001519)

## Steps

1. **Make a key for this GPT.** On your account page, create an API key named for the GPT and give it a small monthly spending limit. A limit stops the GPT spending more than you chose.
2. **Open the Actions section of the GPT editor.** In the editor of the GPT you are building, go to the Action section. OpenAI says to paste your OpenAPI schema there.
3. **Paste the OpenAPI schema.** Open the Endwise OpenAPI document in a browser, copy it, and paste it in.
4. **Set authentication to API Key.** In the GPT editor, set Authentication to API Key and paste your key. If it asks how to send the key, choose Bearer.
5. **Tell the GPT when to use the tool.** In the instructions, say that dates, amounts and other exact figures must come from the Endwise action, never from the model.
6. **Test with a question you can check.** Ask a question with a known answer and compare the result shown in the action call with the tool page.

## Questions

### Can ChatGPT connect to an MCP server that needs an API key?

Not today. OpenAI documents three authentication options for a custom MCP server in ChatGPT: OAuth, no authentication, and OAuth or no authentication. An API key sent as a Bearer header is not one of them, so the Endwise MCP server cannot be added in the ChatGPT app. This is as of November 2026.

### Can a custom GPT call the Endwise API?

Yes, for now. A GPT Action can call a REST API with an OpenAPI schema and API key authentication. OpenAI has announced that custom GPTs are being retired, with 11 December 2026 given as the scheduled date, so treat this route as short-lived.

### Can I use Endwise with the OpenAI API?

Yes. The Responses API has a remote MCP tool with a headers field, so you can send the Endwise key as a Bearer header from your own code. The agent guide has a full sample.

### Is my Endwise key shared with OpenAI?

If you give a key to a GPT Action, you have given it to OpenAI. OpenAI says it encrypts the key when it stores it. Use a key made for that one GPT, with a low monthly limit, and revoke it on your account page if you stop using the GPT.

### Can ChatGPT do exact date math without a tool?

A chat model writes its answer as text, so a date or a sum can come out wrong with no sign that it did. With an Endwise action the figure comes from a tool that gives the same answer for the same input, and the action call shows the input and result.

## Related

- [Give your own AI agent exact tools](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/)
- [Use Endwise with Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/)
- [Why AI gets numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/)
- [MCP server for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/  
Data as of: 2026-11-03
