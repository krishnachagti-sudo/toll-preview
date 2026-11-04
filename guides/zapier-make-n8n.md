# Use Endwise in Zapier, Make and n8n (one HTTP step)

Yes, with 1 HTTP step in each: Zapier's Webhooks by Zapier (Custom Request), Make's HTTP \> Make a request, or n8n's HTTP Request node. POST to `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/TOOL-SLUG` with an `Authorization: Bearer YOUR_API_KEY` header and a JSON body, then map the `result` field.

## Can Zapier, Make and n8n call Endwise?

Yes. Each has a step that sends an HTTP `POST` with headers and a JSON body, and that is all the Endwise API needs. Every call goes to `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/TOOL-SLUG`, carries `Authorization: Bearer YOUR_API_KEY`, and returns JSON with the answer under `result`. Create the key on your [account page](https://krishnachagti-sudo.github.io/toll-preview/account), one key per automation, with a monthly limit. This page is current as of November 2026.

The examples use the business days tool. The body is the same in all three tools:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

A successful call answers like this (the full response also has `ok`, `charged` and `balance`):

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

Each call costs **$0.0005**, taken from your balance, with the free monthly allowance ($0.25) spent first.

## How do I stop automations paying twice?

Automations retry, replay and re-run. Send an `Idempotency-Key` header (1 to 200 characters) made from the input, such as `zap-2026-07-01-2026-07-08`. If that key was already answered for the same tool, the API returns the stored answer, marks it `Idempotent-Replay: true` and charges nothing more. The same key with different input is refused with `idempotency_mismatch`, so include every input that changes the answer. The documentation does not say how long stored answers are kept.

A run that is refused (bad input, no balance, a monthly limit) is not charged. A `409 in_progress` or `429 rate_limited` means retry in a moment with the same key.

## How do I do it in Zapier?

Use **Webhooks by Zapier**. Zapier's help pages say it is available on the Professional, Team and Enterprise plans, and not on Free. Add an action step, choose **Webhooks by Zapier**, and set the **Event** to **Custom Request**. Zapier's help says that with Custom Request you type the raw JSON into the **Data** field and it is sent exactly as entered, without Zapier parsing or formatting it.

- **Method:** `POST`
- **URL:** `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days`
- **Data:** the JSON below, with the mapped fields from earlier steps in place of the placeholders
- **Headers:** `Authorization` set to `Bearer YOUR_API_KEY`; `Content-Type` set to `application/json`; `Idempotency-Key` set to text plus the mapped dates

```json
{
  "op": "between",
  "region": "US",
  "start": "<Start Date from an earlier step>",
  "end": "<End Date from an earlier step>"
}
```

Validate the JSON before you save, because Zapier does not check it. Then test the step. Zapier shows the response, and later steps can use its fields; the answer is under `result`.

> Zapier says Webhooks by Zapier supports basic authentication or none and stores credentials in step fields in plain text that anyone with access to the Zap can read. A header value is kept the same way. Zapier's other app, API by Zapier, keeps API keys in an app connection (static header keys are one of its options) and has an API Request action. Zapier's page does not list that action's field names, so follow the editor.

## How do I do it in Make?

Add the **HTTP** app and choose the **Make a request** module. Make's documentation describes these fields:

- **URL:** `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days` (it must begin with https://)
- **Method:** `POST`
- **Authentication type:** API key. In the credentials, put `Bearer YOUR_API_KEY` as the key value (Make says to include any required prefix), choose "In the header" for the placement, and enter `Authorization` as the key name. Make's page says to use its authentication fields, not the Headers field, for credentials.
- **Headers:** add `Idempotency-Key` with the input-based value.
- **Body content type:** `application/JSON`
- **Body input method:** Data structure to map each field (Make escapes reserved characters for you), or JSON string to paste the body above (you escape them yourself).
- **Parse response:** Yes. This structures the output so you can map it.

Run the module once. The fields of the response, including `result` and its `businessDays` value, then appear in the mapping panel of later modules. Under the advanced settings, Make lets you set a timeout between 1 and 300 seconds.

## How do I do it in n8n?

Add an **HTTP Request** node. The documented parameters are:

- **Method:** `POST`
- **URL:** `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days`
- **Authentication:** use generic credentials and choose Header Auth. Create the credential with **Name** `Authorization` and **Value** `Bearer YOUR_API_KEY`. n8n keeps it in its credential store, not in the workflow.
- **Send Headers:** on, then add `Idempotency-Key` under Header Parameters.
- **Send Body:** on, with **Body Content Type** JSON and **Specify Body** Using JSON.

In the JSON field, switch to an expression. n8n marks an expression with double curly braces, and `$json` is the previous node's output. Write the body like this:

```json
{
  "op": "between",
  "region": "US",
  "start": "{{ $json.start }}",
  "end": "{{ $json.end }}"
}
```

The node outputs the API's JSON. In a later node, the expression `{{ $json.result.businessDays }}` reads the value. n8n's expressions page documents this form for reading earlier node data.

## What if a call fails?

Every error has the same shape: `{ "ok": false, "error": { "code": "...", "message": "..." } }`. Check `ok` before you use `result`, and send failures to an alert step. Stop and tell a person on `insufficient_balance` and `cap_reached`, because retrying cannot fix them. Fix the input on `invalid_input`. The full list is in the [API documentation](https://krishnachagti-sudo.github.io/toll-preview/docs).

- [Zapier Help: Send webhooks in Zap workflows](https://help.zapier.com/hc/en-us/articles/8496326446989-Send-webhooks-in-Zap-workflows)
- [Zapier Help: How to get started with Webhooks by Zapier](https://help.zapier.com/hc/en-us/articles/8496083355661-How-to-get-started-with-Webhooks-by-Zapier)
- [Zapier Help: Ways to make API requests in Zapier](https://help.zapier.com/hc/en-us/articles/44391646192397-Ways-to-make-API-requests-in-Zapier)
- [Make Apps Documentation: HTTP](https://apps.make.com/http)
- [Make Apps Documentation: API key authentication type](https://apps.make.com/api-key-authentication-type)
- [n8n Docs: HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [n8n Docs: HTTP Request credentials](https://docs.n8n.io/credentials/httprequest/)
- [n8n Docs: Expressions](https://docs.n8n.io/code/expressions/)

## Steps

1. **Create an API key with a low monthly limit.** On your account page, create a key for the automation and set a monthly limit on it.
2. **Add one HTTP step.** Use Webhooks by Zapier (Custom Request), Make's HTTP \> Make a request module, or n8n's HTTP Request node.
3. **Set the URL, header and JSON body.** POST to the tool's address with an Authorization: Bearer header and the tool's input as JSON.
4. **Add an Idempotency-Key header.** Build it from the input so a retry or replay returns the stored answer and charges nothing more.
5. **Map the result into the next step.** Run the step once, then pick the field you need from the result object.

## Questions

### Can Zapier, Make or n8n call the Endwise API?

Yes. All three can send a POST with headers and a JSON body, which is all the API needs: an Authorization: Bearer header and the tool's input as JSON. Zapier uses Webhooks by Zapier, Make uses the HTTP module and n8n uses the HTTP Request node.

### Which Zapier plans include Webhooks by Zapier?

Zapier's help pages say Webhooks by Zapier is available on the Professional, Team and Enterprise plans and is not included in the Free plan. Check Zapier's pricing page for what your plan includes today.

### Will a retried or replayed run charge me twice?

Not if you send an Idempotency-Key built from the input. The API returns the stored answer for a repeated key and charges nothing more. Without the header, each run is a new charge.

### Where do I keep the API key?

In the tool's credential store where it has one: a Make connection or an n8n Header Auth credential. Zapier's Webhooks step keeps header values in the step itself, where anyone with access to the Zap can read them. Use a key with a low monthly limit.

## Related

- [Use Endwise in Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/guides/google-sheets/)
- [Use Endwise in Excel](https://krishnachagti-sudo.github.io/toll-preview/guides/excel/)
- [Build an agent on exact tools](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/)
- [The REST API](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/zapier-make-n8n/  
Data as of: 2026-11-04
