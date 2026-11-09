# DMARC report API

POST up to 50 report files (base64, or the XML as text) to /api/v1/tools/dmarc-report-analyzer with op "analyze": each comes back with its reporter, period, policy and a table of sending sources, each named from published provider data with a reason and a fix; it costs $0.01 a report file for the first 1,000 a month and $0.002 after that, files with no readable report are not charged, and naming IPs (op "identify") is free.

## Request

```sh
curl -X POST https://conyso.com/endwise/api/v1/tools/dmarc-report-analyzer \
  -H "Authorization: Bearer $ENDWISE_KEY" -H "Content-Type: application/json" \
  -d '{"op":"analyze","files":[{"name":"google.com!example.com!1793923200!1794009599.zip","base64":"<the file, base64>"}]}'
```

## Response (shortened)

```json
{
  "answer": "This report from google.com covers 2026-11-06 (UTC) for example.com: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.",
  "reports": [
    {
      "reporter": {
        "orgName": "google.com",
        "email": "noreply-dmarc-support@google.com",
        "known": {
          "id": "google",
          "name": "Google",
          "page": "/dmarc-report-analyzer/from/google/"
        }
      },
      "period": {
        "begin": "2026-11-06T00:00:00Z",
        "end": "2026-11-06T23:59:59Z",
        "days": 1,
        "words": "2026-11-06 (UTC)"
      },
      "totals": {
        "messages": 670,
        "passed": 580,
        "failed": 90,
        "passRate": 86.6,
        "sources": 7,
        "failingSources": 4,
        "records": 7,
        "dispositions": {
          "none": 670
        }
      },
      "sources": [
        {
          "name": "Amazon SES",
          "services": [
            {
              "id": "amazon-ses",
              "name": "Amazon SES"
            }
          ],
          "confidence": "high",
          "hostedAt": null,
          "ips": [
            "54.240.8.17"
          ],
          "messages": 57,
          "passed": 0,
          "failed": 57,
          "dispositions": {
            "none": 57
          },
          "headerFroms": [
            "example.com"
          ],
          "dkimDomains": [
            "amazonses.com:pass"
          ],
          "spfDomains": [
            "us-east-1.amazonses.com:pass"
          ],
          "reasons": [
            {
              "code": "third-party-not-aligned",
              "messages": 57,
              "words": "DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.",
              "fix": "Set up the sender's custom DKIM so it signs with d=example.com (or a subdomain), or a custom MAIL FROM (return-path) under example.com."
            }
          ],
          "evidence": [
            {
              "service": "amazon-ses",
              "how": "ip-range",
              "detail": "54.240.8.17 is inside 54.240.0.0/18, which Amazon SES publishes in its SPF record"
            },
            {
              "service": "amazon-ses",
              "how": "dkim-domain",
              "detail": "a DKIM signature from d=amazonses.com passed; Amazon SES's own documentation names that domain for sending"
            },
            {
              "service": "amazon-ses",
              "how": "spf-domain",
              "detail": "SPF passed for us-east-1.amazonses.com; Amazon SES's own documentation names that domain for sending"
            }
          ],
          "label": "Amazon SES",
          "status": "fail",
          "passRate": 0,
          "reason": "DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.",
          "fix": "Set up the sender's custom DKIM so it signs with d=example.com (or a subdomain), or a custom MAIL FROM (return-path) under example.com.",
          "moreRows": 0
        }
      ]
    }
  ],
  "billable": 1
}
```

## Inputs and limits

- files: 1 to 50, each { name, base64 } or { name, xml }; at most 10 MB per file and 14 MB per request.
- Formats: .xml, .xml.gz or .gz, .zip (its .xml entries) and .eml (its report attachments); RFC 9990 and RFC 7489.
- A report may unpack to at most 32 MB and at most 250 times its compressed size; DOCTYPEs and entities are refused.
- op "identify" with ips: up to 100 IPs, free: the named service and the evidence for each.
- The same tool is available over MCP for agents.

## Prices

| Reports a month | Cost |
| --- | --- |
| 30 | $0.30 |
| 300 | $3.00 |
| 1,000 | $10.00 |
| 5,000 | $18.00 |
| 10,000 | $28.00 |

> Graduated: the first 1,000 report files in a UTC month are $0.01 each, every one after that $0.002. Prices are per account across the page, REST and MCP.

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Related

- [parsedmarc and a per-report API](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/vs/self-hosted/)
- [A DMARC report example, parsed](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/dmarc-report-example/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/api/  
Data as of: 2026-11-08
