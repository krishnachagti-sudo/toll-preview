# How the VAT number check works: VIES and receipts

A number is cleaned, read with its 2-letter prefix and checked against the format VIES lists for its state, free. A well-formed number is sent to VIES (the 27 EU states and XI) or, for GB, to HMRC; only a valid or invalid answer is charged, at $0.0025, and every answer comes with a receipt hashed with SHA-256.

## What does the vat number check with receipt compute?

Give a VAT number (and, for a consultation number, your own) and the tool checks it live with the EU's VIES service, or with HMRC for a GB number when that is switched on. It returns what the service answered, with the name and address where the state discloses them, and a receipt of the request and answer as JSON and PDF, hashed and, when the owner has set a key, signed with Ed25519. The receipt can be verified or printed again later.

Operations (the op field):

- `check`: Returns the service's answer: valid, invalid, could not check, rejected, requester invalid or blocked; the name, address and consultation number where given; and the receipt with its files. $0.0025 per valid or invalid answer; everything else is free.
- `format`: Returns whether the number has the shape VIES lists for its state, with the cleaned number and the service that would check it. Nothing is sent. Free.
- `formats`: Returns the format VIES lists for every state, with its pattern and its scheduled downtime. Free.
- `status`: Returns VIES availability right now for each state, with its scheduled window. Free.
- `key`: Returns the public Ed25519 key receipts are signed with, or says none is set up. Free.
- `verify`: Returns whether a receipt is one this tool issued, whether its hash matches its content and whether its signature is valid. Free.
- `render`: Returns the receipt's PDF and JSON again, only for a receipt whose hash and signature check out. Free.

Inputs:

- `vatNumber`: The number with its 2-letter prefix (DE123456789), or without it when countryCode is given. Spaces, dots, dashes and lower case are ignored; GR is read as EL.
- `countryCode`: The issuing state when the number has no prefix: an EU code (EL for Greece), XI or GB.
- `requesterVatNumber`: Your own VAT number. VIES and HMRC return a consultation number only when it is given, and it must be from the same service.
- `trader`: VIES only: name, street, postal code, city and company type to compare with the state's record; each comes back as matching, not matching or not compared.
- `reference`: Your own reference, such as an invoice number, printed on the receipt.
- `receipt`: For verify and render: the JSON receipt exactly as issued.

Outputs:

- status, billed, retryable and the service asked
- valid, name, address, consultationNumber and the official time of the answer
- matches for each trader detail given, and the notes that apply
- receipt: the request, the raw answer, the VIES availability at the time, the outcome, the SHA-256 hash and the signature, with JSON and PDF files

## How is it calculated, step by step?

1. The number is upper-cased and stripped of spaces, dots, dashes, slashes and commas, and its prefix is read; GR becomes EL.
2. It is matched against the pattern VIES lists for that state. A number with the wrong shape is answered at once, without calling anyone, and is free; an Austrian number missing its U is pointed out.
3. GB numbers go to HMRC, not VIES. While HMRC checks are not switched on here, a GB number is answered with a link to GOV.UK's free check, free.
4. A requester number must be from the same service: an EU or XI number for VIES, a GB number for HMRC.
5. The check is sent with a 20 second timeout, together with a read of VIES availability. A valid or invalid answer is charged; a timeout, a service error, a refused requester or a blocked number is not, and only the timeouts and limits say to retry.
6. The receipt holds the request, the answer as received and the outcome. Its canonical JSON (keys sorted) is hashed with SHA-256 and, when a signing key is set, signed with Ed25519.
7. Verify recomputes the hash and checks the signature against the key; any changed field is caught.

**The VIES facts.**

The formats, error codes, availability windows and wording come from the European Commission's VIES API contract and site text, read on November 2, 2026. The error codes are the ones the official VIES test service returned on that day.

VIES treats a valid number as one element of evidence for not charging VAT on a supply to another member state; its answer does not in itself give a right to the exemption.

**HMRC.**

GB numbers have been checked with HMRC, not VIES, since January 1, 2021, through HMRC's Check a UK VAT number API 2.0, read on November 2, 2026. Northern Ireland numbers (XI) are checked with VIES.

## Which edge cases does it handle?

- Greek numbers are EL in VIES; a GR prefix is read as EL and the answer says so.
- A number whose prefix and countryCode disagree is refused, naming both.
- Without your own number there is no consultation number, and the receipt says why.
- If VIES is down for a state, the check is "could not check", free, with that state's scheduled window.
- An unsigned receipt shows only that the file agrees with its own hash, not who issued it.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Is this number written the way VIES expects?**

```json
{
  "op": "format",
  "vatNumber": "de 123.456.789"
}
```

Is this number written the way VIES expects?

| Result | Value |
| --- | --- |
| number | DE123456789 |
| country | Germany |
| checked with | VIES |
| message | DE123456789 has the shape VIES lists for Germany. Only a check with VIES says whether it is registered. |

**An Austrian number without its U**

```json
{
  "op": "format",
  "vatNumber": "AT12345678"
}
```

An Austrian number without its U

| Result | Value |
| --- | --- |
| well formed | no |
| message | AT12345678 does not have the shape VIES lists for Austria: ATU99999999. Austrian numbers keep the U after AT (ATU12345678). |

**Verify the sample receipt from the VIES test service**

```json
op: "verify"
receipt: {...}
```

Verify the sample receipt from the VIES test service

| Result | Value |
| --- | --- |
| hash matches | yes |
| signature | unsigned |
| message | The hash matches the content. It carries no signature, so this shows only that the file agrees with its own hash, not that this tool issued it. |

## What does it not do?

- Only the 27 EU states, XI and GB are checked; any other prefix is refused before any call.
- It passes on what VIES or HMRC answered and cannot correct it; a number shown as not valid must be taken up by its owner with their tax administration. Not tax or legal advice.
- The answers are not kept: save the receipt files yourself.

## Where does the data come from, and how fresh is it?

The VIES facts were read on November 2, 2026 and the HMRC facts on November 2, 2026. A watcher reads the VIES API contract, the VIES site text and HMRC's pages daily and alerts the owner when one changes; the data files change only by hand.

- [European Commission: VIES on-the-Web REST API contract](https://ec.europa.eu/assets/taxud/vow-information/swagger_publicVAT.yaml)
- [European Commission: VIES site text (formats, availability windows and error wording)](https://ec.europa.eu/taxation_customs/vies/assets/i18n/en.json)
- [HMRC Developer Hub: Check a UK VAT number API 2.0](https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/vat-registered-companies-api/2.0)
- [GOV.UK: Check a UK VAT number](https://www.gov.uk/check-uk-vat-number)

The VIES facts were read on November 2, 2026 and the HMRC facts on November 2, 2026. A watcher reads the VIES API contract, the VIES site text and HMRC's pages daily and alerts the owner when one changes; the data files change only by hand.

VAT number check with receipt: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [European Commission: VIES on-the-Web REST API contract](https://ec.europa.eu/assets/taxud/vow-information/swagger_publicVAT.yaml) | see the document | 2026-11-02 |
| [European Commission: VIES site text (formats, availability windows and error wording)](https://ec.europa.eu/taxation_customs/vies/assets/i18n/en.json) | see the document | 2026-11-02 |
| [HMRC Developer Hub: Check a UK VAT number API 2.0](https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/vat-registered-companies-api/2.0) | see the document | 2026-11-02 |
| [GOV.UK: Check a UK VAT number](https://www.gov.uk/check-uk-vat-number) | see the document | 2026-11-02 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check every state's format, the prefix and GR rules, that a wrong shape and GB while HMRC is off never call anyone, which answers are charged and which are free, the HMRC token and lookup, that a changed receipt or another key is caught, and that no worked example calls VIES.

What its test suite asserts:

- Every state's format and the VIES error codes are as read on November 2, 2026.
- A wrong shape and GB while HMRC is off never call anyone; only a valid or invalid answer is charged.
- Any change to a receipt, or a signature by another key, is caught.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the VAT number check with receipt tool](https://krishnachagti-sudo.github.io/toll-preview/vat-number-check/).

## Questions

### Is there any AI in the vat number check with receipt answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the vat number check with receipt refuse to answer?

Only the 27 EU states, XI and GB are checked; any other prefix is refused before any call. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the VAT number check with receipt tool](https://krishnachagti-sudo.github.io/toll-preview/vat-number-check/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/vat-number-check/  
Data as of: 2026-11-04
