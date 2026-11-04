# How to use Endwise with ChatGPT

Yes, in 3 steps: in ChatGPT on the web, add Endwise as a custom MCP server with OAuth, sign in to Endwise, and approve ChatGPT with a monthly limit. From your own code, the OpenAI API's remote MCP tool can send an API key instead.

## Can ChatGPT connect to the Endwise MCP server?

Yes. ChatGPT can add a custom **MCP server** (MCP, the Model Context Protocol, is the standard way an AI app finds and calls outside tools). OpenAI lists three ways to sign in to one: **OAuth**, **no authentication**, and a mix of the two. Endwise offers OAuth sign-in, so you choose **OAuth** and sign in to Endwise when ChatGPT asks.

OpenAI's page says custom MCP servers are added in ChatGPT on the web, and that workspace permissions and security settings apply. If you do not see the option in a work or school workspace, ask its admin.

## How do I add it?

In ChatGPT on the web, go to **Plugins**, select the plus button, then **Add custom MCP server**. Give it a name and enter this as the Server URL:

```text
https://krishnachagti-sudo.github.io/toll-preview/mcp
```

Set authentication to **OAuth**. ChatGPT reads Endwise's sign-in details from the server itself, so leave any client ID and secret empty. Review the warning, choose **Create as a plugin**, and install the plugin before you use it in a conversation.

## What does the sign-in look like?

ChatGPT opens a Endwise page. If you are not signed in, you sign in or create an account first and come straight back. The page names the app asking (chatgpt.com), says what it will be able to do, and where you go back to after you approve.

- It can list the tools and their prices, run tools and pay for each run from your balance, and ask what a run would cost.
- It cannot see your password, add money, change your account or make API keys.
- You set its monthly limit on that page. Runs past the limit are refused and not billed.

After you approve, ChatGPT shows up on your [account page](https://krishnachagti-sudo.github.io/toll-preview/account) under Connected apps, with its limit and what it has spent this month. Choose Disconnect there to stop it at once.

OpenAI's page says ChatGPT treats a tool as a write action unless the tool says otherwise, and asks you to confirm write actions by default. A choice you make for one conversation can carry through that conversation.

## What does ChatGPT get back from an Endwise tool?

ChatGPT sends the tool's input as JSON and gets the tool's answer. Count the business days from 1 July to 8 July 2026 in the US. The input:

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

That call costs $0.0005, taken from your balance. See the [Business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/) page for the rules behind the answer.

## What about custom GPTs?

You do not need one. OpenAI's help center has a custom GPT retirement and migration FAQ. It gives 11 December 2026 as the scheduled date when custom GPTs stop running, says timing can vary by account and workspace, and says existing GPT Actions do not carry over automatically. They have to be rebuilt as an app or a custom MCP server, which is the route above.

## Can I use Endwise with the OpenAI API?

Yes. In the Responses API you add a remote MCP server as a tool. OpenAI's API reference lists an optional `headers` field for it, described as HTTP headers to send to the MCP server, for authentication or other purposes. That is where an API key from your [account page](https://krishnachagti-sudo.github.io/toll-preview/account) goes:

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

## What does OpenAI hold?

With sign-in, ChatGPT holds a token that works only for the Endwise MCP server and only for that connection. It lasts an hour, and ChatGPT can renew it with a refresh token until you disconnect. No password or API key is given to OpenAI, and disconnecting on your account page ends the token at once.

With the API, your code sends the key to OpenAI in the request. OpenAI's MCP guide says the Responses API does not store the value of its `authorization` field. It does not say the same about `headers`, so assume a key placed there reaches OpenAI. Make a key for that one use, set a low monthly limit, and revoke it when you are done.

## Can ChatGPT do exact date math?

Not by itself. A chat model produces text that looks like an answer, so a date count can be off by a day with no warning. The reason is explained in [why AI gets numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/). If the figure comes from a tool, the tool call shows the input it sent and the result it got, and you can [check it against the tool page](https://krishnachagti-sudo.github.io/toll-preview/guides/check-numbers-from-ai/). Without any setup you can also use the tools directly on the web: 5 free runs a day, no account.

- [OpenAI: Add custom MCP server (ChatGPT plugins)](https://developers.openai.com/api/docs/guides/custom-mcp-server)
- [OpenAI Apps SDK: Authentication](https://developers.openai.com/apps-sdk/build/auth)
- [OpenAI: MCP servers in the Responses API](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [OpenAI: Responses API reference (the mcp tool and its headers field)](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [OpenAI Help Center: Custom GPT retirement and migration FAQ](https://help.openai.com/en/articles/20001519)

## Steps

1. **Add a custom MCP server.** In ChatGPT on the web, go to Plugins, select the plus button, then Add custom MCP server.
2. **Enter the server address.** Give it a name, such as Endwise, and enter the Endwise MCP server address as the Server URL.
3. **Choose OAuth.** Set authentication to OAuth. ChatGPT finds the Endwise sign-in page by itself, so there is no client ID or secret to enter.
4. **Create and install it.** Review the warning, select Create as a plugin, then install the plugin from your plugins.
5. **Sign in to Endwise and approve.** ChatGPT opens an Endwise page. Sign in, check that the app named is chatgpt.com, set a monthly limit for it, and choose Approve.
6. **Test with a question you can check.** Ask a question with a known answer and compare the result in the tool call with the tool page.

## Questions

### Can ChatGPT connect to the Endwise MCP server?

Yes. OpenAI lists OAuth as a way to sign in to a custom MCP server in ChatGPT, and Endwise offers OAuth sign-in. Add the server with OAuth, then approve ChatGPT on the Endwise page that opens.

### Do I need an API key for ChatGPT?

No. Signing in makes a connection that works like a key: it has its own monthly limit and shows under Connected apps on your account page, where you can disconnect it. Nothing to copy or paste.

### Can I use Endwise with the OpenAI API?

Yes. The Responses API has a remote MCP tool with a headers field, so you can send an Endwise API key as a Bearer header from your own code. The agent guide has a full sample.

### Do I still need a custom GPT with an Action?

No. OpenAI has scheduled custom GPTs to stop running on 11 December 2026, and says their Actions do not carry over by themselves. A custom MCP server with OAuth is the route that lasts.

### Can ChatGPT do exact date math without a tool?

A chat model writes its answer as text, so a date or a sum can come out wrong with no sign that it did. With the Endwise tools the figure comes from a tool that gives the same answer for the same input, and the tool call shows the input and result.

## Related

- [Give your own AI agent exact tools](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/)
- [Use Endwise with Claude](https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-claude/)
- [Why AI gets numbers wrong](https://krishnachagti-sudo.github.io/toll-preview/guides/why-ai-gets-numbers-wrong/)
- [MCP server for AI agents](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/use-with-chatgpt/  
Data as of: 2026-11-04
