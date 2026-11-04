# Use Endwise in Google Sheets: custom functions with Apps Script

Yes, in 5 steps: paste a short Apps Script into the sheet, store your API key as a script property, and call `=BUSINESSDAYS(A2, B2, "US")` or `=FXRATE("USD", "EUR", A2)`. The code sends an Idempotency-Key and caches answers, so recalculating never pays twice for the same question.

## Can I use Endwise in Google Sheets?

Yes. Google Sheets runs short scripts written in Apps Script, and a script can call the Endwise REST API. You can wrap a tool in a custom function, which then works like any built-in formula, or run it from a menu command. Both send a `POST` to `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/TOOL-SLUG` with your key in an `Authorization: Bearer` header. This page is current as of November 2026.

Each call is billed to your balance, the free monthly allowance ($0.25) first. The free runs on the web pages (5 a day) do not apply to API calls, so the cost section below matters.

## What does Google allow in a custom function?

From Google's documentation:

- **UrlFetchApp is allowed.** Google lists it among the services a custom function can use.
- **Properties are allowed, with one catch.** The note in Google's table is that getUserProperties() only gets the properties of the spreadsheet owner. This page uses script properties, which are shared by everyone who runs the script.
- **No sign-in prompts.** Custom functions never ask users to authorize access to personal data. If one calls a service that needs authorization, Sheets shows "You do not have permission to call" that service. UrlFetchApp is not in that group.
- **30 seconds.** A custom function call must return within 30 seconds, or the cell shows #ERROR!.
- **Daily fetch quota.** Google lists 20,000 URL Fetch calls a day for consumer accounts and 100,000 for Google Workspace accounts.
- **Recalculation.** A custom function recalculates when you edit it or change a cell or range passed to it as an argument. Volatile functions such as NOW() cannot be used as arguments.

Google also says the cache works in custom functions but is "not particularly useful" there. It is useful for the cost problem below, because a cached answer needs no network call at all.

## How do I stop paying for the same call twice?

A sheet can ask the same question many times: fill-down over a column, a reopened file, an edited formula that is then undone. Three layers keep each distinct question to one charge:

- **Idempotency-Key.** The code below sends a key built from the tool and the input. The API sends back the stored answer for a repeated key, marks it `Idempotent-Replay: true`, and charges nothing more. The same key with different input is refused with `idempotency_mismatch`. The documentation does not say how long stored answers are kept, so treat this as a safety net, not storage.
- **CacheService.** The code caches each answer for 6 hours, the longest Google allows. Cached repeats make no call at all. Google calls the expiration a suggestion, and entries may go earlier, which the Idempotency-Key covers.
- **A menu command that writes values.** For lists, write the answers into cells as plain values. Nothing recalculates, and the answers stay in the file.

Know the cost before you fill down. Send the same body to `https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/TOOL-SLUG/quote` and the API says what it would charge without running anything. A column of 500 rows is 500 distinct questions, so 500 charges.

**Business days** costs **$0.0005** a call. **Exchange rate on a date** costs **$0.001**. Check each tool page for its current price.

## What is the full code?

In the sheet, choose **Extensions \> Apps Script** and replace the contents of `Code.gs` with this. Then open **Project Settings**, find **Script properties**, choose **Add script property**, and add `ENDWISE_API_KEY` with your key (YOUR\_API\_KEY here) as the value. Create the key on your [account page](https://krishnachagti-sudo.github.io/toll-preview/account), one per spreadsheet, with a low monthly limit.

```javascript
// Endwise for Google Sheets. Paste into Extensions > Apps Script.
// Keep your key in Project Settings > Script properties as ENDWISE_API_KEY, never in a cell.
const ENDWISE_API = 'https://krishnachagti-sudo.github.io/toll-preview/api/v1/tools/';

function endwiseKey_() {
  const key = PropertiesService.getScriptProperties().getProperty('ENDWISE_API_KEY');
  if (!key) throw new Error('Add ENDWISE_API_KEY under Project Settings > Script properties.');
  return key;
}

// The same tool and input always give the same key, so a repeat is answered for free.
function idempotencyKey_(slug, input) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, slug + JSON.stringify(input));
  return 'sheets-' + digest.map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

// One call: cache first, then the API with an Idempotency-Key. Returns the "result" object.
function endwise_(slug, input) {
  const idem = idempotencyKey_(slug, input);
  const cache = CacheService.getScriptCache();
  const hit = cache.get(idem);
  if (hit) return JSON.parse(hit);

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = UrlFetchApp.fetch(ENDWISE_API + slug, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + endwiseKey_(), 'Idempotency-Key': idem },
      payload: JSON.stringify(input),
      muteHttpExceptions: true,
    });
    const body = JSON.parse(response.getContentText());
    if (body.ok) {
      cache.put(idem, JSON.stringify(body.result), 21600); // 6 hours, the longest the cache allows
      return body.result;
    }
    // Busy (the same key is still running) or rate limited: wait and try again. Nothing was charged.
    if (body.error.code === 'in_progress' || body.error.code === 'rate_limited') {
      Utilities.sleep(1000);
      continue;
    }
    throw new Error(body.error.code + ': ' + body.error.message);
  }
  throw new Error('Still busy after 3 tries. Try again in a moment.');
}

// Dates in cells arrive as Date objects. Turn them into 2026-07-01 in the sheet's time zone.
function isoDate_(value) {
  if (value instanceof Date) {
    const zone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    return Utilities.formatDate(value, zone, 'yyyy-MM-dd');
  }
  return String(value).trim();
}

/**
 * Business days between two dates, skipping public holidays.
 * @param {Date|string} start The first date.
 * @param {Date|string} end The last date.
 * @param {string} region "US", "GB-ENG" or "IN-CENTRAL-DELHI".
 * @return {number} The business days.
 * @customfunction
 */
function BUSINESSDAYS(start, end, region) {
  const result = endwise_('business-days', {
    op: 'between',
    region: region || 'US',
    start: isoDate_(start),
    end: isoDate_(end),
  });
  return result.businessDays;
}

/**
 * Exchange rate on a date: how much one unit of base is worth in quote.
 * @param {string} base A currency code such as "USD".
 * @param {string} quote A currency code such as "EUR".
 * @param {Date|string} date The date.
 * @return {number} The rate.
 * @customfunction
 */
function FXRATE(base, quote, date) {
  const result = endwise_('fx-on-date', {
    base: String(base).toUpperCase(),
    quote: String(quote).toUpperCase(),
    date: isoDate_(date),
  });
  return result.rate;
}
```

The `@customfunction` tag in each comment is what makes the function appear in Sheets' autocomplete. The first time you use a function, Sheets asks you to allow the script to connect to an external service.

## What do the functions return?

A cell with =BUSINESSDAYS("2026-07-01", "2026-07-08", "US") sends this body:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

The API answers with this result. The function returns one field from it, `businessDays`, so the cell shows **4**:

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

=FXRATE("USD", "EUR", "2026-10-24") sends this body and shows **0.893416**, the `rate` field. The fixing date and source are in the same answer, in case you want a second function that returns them:

```json
{
  "base": "USD",
  "quote": "EUR",
  "date": "2026-10-24"
}
```

## How do I fill a whole list safely?

Add this to the same script file. Reload the sheet and a Endwise menu appears. Select the rows you want, then choose **Count business days for selected rows**. Columns A to C hold start, end and region, and the answers go in column D.

```javascript
// A menu command: fill column D with business days for the selected rows.
// Column A = start, B = end, C = region. Rows that already have a value in D are skipped.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Endwise')
    .addItem('Count business days for selected rows', 'fillBusinessDays')
    .addToUi();
}

function fillBusinessDays() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const selection = sheet.getActiveRange();
  const first = selection.getRow();
  const count = selection.getNumRows();
  const rows = sheet.getRange(first, 1, count, 4).getValues();

  const out = rows.map(([start, end, region, existing]) => {
    if (existing !== '' || start === '' || end === '') return [existing];
    try {
      const result = endwise_('business-days', {
        op: 'between', region: region || 'US', start: isoDate_(start), end: isoDate_(end),
      });
      Utilities.sleep(150); // stay well under the per-key rate limit
      return [result.businessDays];
    } catch (e) {
      return ['Error: ' + e.message];
    }
  });
  sheet.getRange(first, 4, count, 1).setValues(out);
}
```

The command skips any row that already has a value in column D, so running it twice costs nothing extra. It pauses briefly between rows because each key has a rate limit; a rate-limited call is refused and not charged, and the helper waits and retries. A command run from a menu is not bound by the 30-second custom function limit, but Google lists a 6-minute limit per script execution, so run very long lists in batches.

## How are errors shown?

The helper throws an error that carries the API's code and message, so a bad date shows as `invalid_input` with the reason. Refused calls are not charged. `insufficient_balance` and `cap_reached` mean you need to add money or raise the key's monthly limit on your account page. The full list is in the [API documentation](https://krishnachagti-sudo.github.io/toll-preview/docs).

> If two identical questions reach the API at the same moment, the second gets `in_progress` and the helper retries after a second. It then gets the stored answer without a second charge.

- [Google Apps Script: Custom Functions in Google Sheets](https://developers.google.com/apps-script/guides/sheets/functions)
- [Google Apps Script reference: UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app)
- [Google Apps Script reference: Cache](https://developers.google.com/apps-script/reference/cache/cache)
- [Google Apps Script reference: PropertiesService](https://developers.google.com/apps-script/reference/properties/properties-service)
- [Google Apps Script: Quotas for Google Services](https://developers.google.com/apps-script/guides/services/quotas)

## Steps

1. **Create an API key with a low monthly limit.** On your account page, create a key just for the spreadsheet and set a monthly limit on it.
2. **Open Apps Script.** In the sheet, choose Extensions \> Apps Script and paste in the code from this page.
3. **Store the key as a script property.** In Project Settings, under Script properties, add ENDWISE\_API\_KEY with your key as the value.
4. **Use the functions in a cell.** Type =BUSINESSDAYS(A2, B2, "US") or =FXRATE("USD", "EUR", A2) in a cell. The first time, Sheets asks you to allow the script to call an external service.
5. **Prefer the menu command for big lists.** For many rows, use the Endwise menu command. It writes the answers as plain values, so recalculating the sheet never calls the API again.

## Questions

### Can a Google Sheets custom function call an API?

Yes. Google lists UrlFetchApp, the Apps Script service for fetching URLs, as supported in custom functions. A custom function must finish within 30 seconds, or the cell shows #ERROR!.

### Where should I keep the API key in Apps Script?

In script properties, set under Project Settings, and read with PropertiesService.getScriptProperties(). Do not type it into a cell or into the function call. Anyone who can edit the script can read the property, so use a key with a low monthly limit.

### Will a custom function call the API again every time the sheet recalculates?

Not on every recalculation. Google says a custom function recalculates when you edit it or change a cell passed to it as an argument. Each recalculation is a new paid call unless you cache the answer or send an Idempotency-Key, and the code on this page does both.

### What does a repeated call cost with an Idempotency-Key?

Nothing. If the key was already answered for the same tool, the API sends the stored answer again and charges nothing more. The same key with different input is refused with idempotency\_mismatch.

## Related

- [Use Endwise in Excel](https://krishnachagti-sudo.github.io/toll-preview/guides/excel/)
- [Spreadsheet or Endwise: which to use for what](https://krishnachagti-sudo.github.io/toll-preview/guides/spreadsheet-or-endwise/)
- [Use Endwise in Zapier, Make and n8n](https://krishnachagti-sudo.github.io/toll-preview/guides/zapier-make-n8n/)
- [The REST API](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/guides/google-sheets/  
Data as of: 2026-11-04
