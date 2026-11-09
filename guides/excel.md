# Use Endwise in Excel with Power Query (POST with a JSON body)

Yes, with Power Query in 4 parts: `Web.Contents` sends a POST, a `Headers` record carries `Authorization: Bearer YOUR_API_KEY`, `Json.FromValue` builds the body, and `Json.Document` reads the answer. The WEBSERVICE function cannot do this, because it takes only a URL.

## Can Excel call the Endwise API?

Yes, through Power Query, the data tool built into Excel (the Get Data button on the Data tab). Its `Web.Contents` function sends a `POST` with headers and a body, which is what the Endwise API needs: an `Authorization: Bearer` header and a JSON body. This page is current as of November 2026.

Each call is billed to your balance, the free monthly allowance ($0.25) first.

## Why not use the WEBSERVICE function?

Because it cannot send what the API needs. Microsoft documents the syntax as `WEBSERVICE(url)`, one argument, a URL. There is nowhere to put an `Authorization` header or a JSON body. Microsoft's page does not mention headers at all. It also says WEBSERVICE returns `#VALUE!` when a URL is over 2,048 characters or the answer is over 32,767 characters, and that on Mac it relies on Windows features and will not return results. Use Power Query instead.

## What does the Power Query code look like?

In Excel, choose **Data \> Get Data \> From Other Sources \> Blank Query**. In the Power Query editor choose **Advanced Editor**, replace the contents with the code below, and put your key in place of `YOUR_API_KEY`. Create the key on your [account page](https://krishnachagti-sudo.github.io/toll-preview/account).

```powerquery
let
    // Your key. It is saved inside the workbook, so use a key with a low monthly limit.
    apiKey = "YOUR_API_KEY",

    startDate = "2026-07-01",
    endDate = "2026-07-08",
    region = "US",

    body = Json.FromValue([op = "between", region = region, start = startDate, end = endDate]),

    response = Web.Contents(
        "https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/business-days",
        [
            Headers = [
                #"Content-Type" = "application/json",
                Authorization = "Bearer " & apiKey,
                #"Idempotency-Key" = "excel-bd-" & region & "-" & startDate & "-" & endDate
            ],
            Content = body,
            ManualStatusHandling = {400, 401, 402, 409, 422, 429, 502}
        ]
    ),

    json = Json.Document(response),
    result = if json[ok] then json[result] else error json[error][message]
in
    result
```

What each part does, from Microsoft's documentation:

- `Json.FromValue` turns an M record into JSON and returns it as binary. A record becomes a JSON object, text stays text and numbers stay numbers.
- `Content` in the options record changes the request from a GET to a POST and uses the value as the body.
- `Headers` in the options record supplies the extra headers. This is where the Bearer key and the Idempotency-Key go.
- `ManualStatusHandling` lists status codes Power Query should not handle itself, so a refused call returns the API's error message instead of a generic failure.
- `Json.Document` reads the binary response as JSON into a record.

## What comes back?

With the dates in the code above, the body sent is:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

The query returns the `result` part of the answer, a record you can expand in the editor or reach with `result[businessDays]`:

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

That call costs **$0.0005**. The tool's page says exactly how the range is counted.

## How do I run it for every row of a table?

Make a reusable function, then add a column that calls it. First, create a blank query named `fnEndwise` with this code:

```powerquery
// Query 1, named fnEndwise: any tool, any input record, a key built from the input.
(slug as text, input as record, idempotencyKey as text) as record =>
let
    apiKey = "YOUR_API_KEY",
    response = Web.Contents(
        "https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/" & slug,
        [
            Headers = [
                #"Content-Type" = "application/json",
                Authorization = "Bearer " & apiKey,
                #"Idempotency-Key" = idempotencyKey
            ],
            Content = Json.FromValue(input),
            ManualStatusHandling = {400, 401, 402, 409, 422, 429, 502}
        ]
    ),
    json = Json.Document(response),
    result = if json[ok] then json[result] else error json[error][message]
in
    result
```

Then turn your data into an Excel table named `Dates` (Insert \> Table, name it on the Table Design tab) and add a second query:

```powerquery
// Query 2: read an Excel table named Dates (columns Start, End), add the answer.
let
    Source = Excel.CurrentWorkbook(){[Name = "Dates"]}[Content],
    Text = Table.TransformColumns(Source, {
        {"Start", each Date.ToText(Date.From(_), "yyyy-MM-dd"), type text},
        {"End", each Date.ToText(Date.From(_), "yyyy-MM-dd"), type text}
    }),
    Answers = Table.AddColumn(Text, "BusinessDays", each
        fnEndwise(
            "business-days",
            [op = "between", region = "US", start = [Start], end = [End]],
            "excel-bd-US-" & [Start] & "-" & [End]
        )[businessDays], Int64.Type)
in
    Answers
```

Each row is one call. The Idempotency-Key is built from the row's own values, so two rows with the same dates share one charge.

## What does Excel ask me when I run it?

- **Credentials.** Microsoft documents that POST requests made with Web.Contents may only be made anonymously. Choose Anonymous when Excel asks, and keep the key in the Headers record. The Web.Contents ApiKeyName option puts the key in the URL, and the Endwise API takes the key only in the `Authorization` header, so that option does not apply. Microsoft's page does not show an Authorization header example, so make one test call and look at the first answer before you fill a column.
- **Privacy levels.** When a query combines your workbook data with a web source, Power Query may show a warning that data privacy information is required and open the Privacy levels dialog. Microsoft describes four levels: None, Private, Organizational and Public. Setting levels is the safe route. The workbook-wide option "Ignore the Privacy Levels and potentially improve performance" (Data \> Get Data \> Query Options \> Privacy) skips the checks, and Microsoft warns it can expose sensitive data. Your dates are sent to Endwise either way, because that is the call.
- **Timeout.** Web.Contents waits 100 seconds by default, and a Timeout option changes it.

## How do I avoid paying again on every refresh?

A refresh runs every query in the workbook again, and each run sends its calls again. Excel can also refresh when the file opens or on a timer, if you turn those on in the connection properties. Three habits keep this cheap:

**Read the rest: How do I avoid paying again on every refresh?**

- **Keep the Idempotency-Key line.** If the key was already answered for the same tool, the API returns the stored answer, marks it `Idempotent-Replay: true` and charges nothing more. The same key with different input is refused with `idempotency_mismatch`, so build the key from the input, as the code does. The documentation does not say how long stored answers are kept, so use it as a safety net.
- **Turn off automatic refresh.** Open the query's Connection Properties, go to the Usage tab, and clear "Refresh data when opening the file" and "Refresh every n minutes".
- **Copy results as values.** When the answers are final, paste them as values or remove the query. Nothing then runs again.

To see a price before a big refresh, send the same body to `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/TOOL-SLUG/quote`. It says what the call would cost and runs nothing.

## What if a call is refused?

The code turns the API's message into the query error, for example `invalid_input` for a date that is not real. Refused calls are not charged. `insufficient_balance` and `cap_reached` mean you need to add money or raise the key's monthly limit. See the [API documentation](https://krishnachagti-sudo.github.io/toll-preview/docs) for every code.

- [Power Query M: Web.Contents](https://learn.microsoft.com/en-us/powerquery-m/web-contents)
- [Power Query M: Json.FromValue](https://learn.microsoft.com/en-us/powerquery-m/json-fromvalue)
- [Power Query M: Json.Document](https://learn.microsoft.com/en-us/powerquery-m/json-document)
- [Power Query: Privacy levels](https://learn.microsoft.com/en-us/power-query/privacy-levels)
- [Microsoft Support: WEBSERVICE function](https://support.microsoft.com/en-us/office/webservice-function-0546a35a-ecc6-4739-aed7-c0b7ce1562c4)
- [Microsoft Support: Refresh an external data connection in Excel](https://support.microsoft.com/en-us/excel/refresh-an-external-data-connection-in-excel)
- [Microsoft Support: Connection properties](https://support.microsoft.com/en-us/office/connection-properties-9d3599a9-e9b3-461d-99b2-c5505ddae6e0)

## Steps

1. **Create an API key with a low monthly limit.** On your account page, create a key just for this workbook and set a monthly limit on it.
2. **Open a blank query.** In Excel, choose Data \> Get Data \> From Other Sources \> Blank Query, then open the Advanced Editor.
3. **Paste the M code.** Replace the contents with the code from this page and put your key in place of YOUR\_API\_KEY.
4. **Set the data source to Anonymous.** When Excel asks how to connect, choose Anonymous. The key travels in the request header you wrote.
5. **Load the result and refresh with care.** Choose Close & Load. Every refresh runs the query again, so keep the Idempotency-Key line in the code.

## Questions

### Can Excel call a POST API with headers?

Yes, with Power Query. Web.Contents takes a Headers record and a Content value; giving it Content turns the request from a GET into a POST. The WEBSERVICE worksheet function cannot, because it takes only a URL.

### Why does Excel ask for credentials when I use Web.Contents with POST?

Microsoft documents that POST requests made with Web.Contents may only be made anonymously. Choose Anonymous in the prompt and send the API key in the Headers record.

### Will refreshing the workbook charge me again?

Refreshing runs the query again, which sends the calls again. With an Idempotency-Key built from the input, a repeated question is answered from the stored answer and charges nothing more. Without it, each refresh is a new charge.

### Is it safe to put the API key in the query?

The key is saved as text inside the workbook, so anyone who can open the file can read it. Use a key made for the workbook with a low monthly limit, and revoke it on your account page if the file travels.

## Related

- [Use Endwise in Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/guides/google-sheets/)
- [Spreadsheet or Endwise: which to use for what](https://krishnachagti-sudo.github.io/toll-preview/guides/spreadsheet-or-endwise/)
- [Use Endwise in Zapier, Make and n8n](https://krishnachagti-sudo.github.io/toll-preview/guides/zapier-make-n8n/)
- [The REST API](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/excel/  
Data as of: 2026-11-04
