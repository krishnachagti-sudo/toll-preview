# Bounce classification API and MCP

POST /api/v1/tools/smtp-bounce-code-classifier with {"op":"batch","lines":\[...\]} (up to 500 lines) returns one verdict per line with its rule id, totals and the addresses to suppress, at $0.0005 a line ($0.50 per 1,000) and at most $29 a month; lines with no code are free.

## One bounce

```json
{
  "op": "classify",
  "text": "550-5.1.1 The email account that you tried to reach does not exist. Please try\n550-5.1.1 double-checking the recipient's email address for typos or\n550 5.1.1 unnecessary spaces. For more information, go to Fix bounced or rejected emails. - gsmtp"
}
```

returns (trimmed):

```json
{
  "verdict": "hard",
  "suppress": "now",
  "retry": "no",
  "rule": {
    "id": "gmail-550-5-1-1",
    "kind": "provider-text",
    "provider": "gmail",
    "providerName": "Gmail",
    "matched": "email account that you tried to reach does not exist",
    "source": "https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en",
    "readOn": "2026-11-08"
  },
  "basic": "550",
  "enhanced": "5.1.1",
  "answer": "550 5.1.1 is a hard bounce: Gmail's published text \"email account that you tried to reach does not exist\" means: the Gmail address does not exist; suppress the address now; check it for typos."
}
```

## A batch

```json
{
  "op": "batch",
  "lines": [
    "550 5.1.1 <ann@example.com>: Recipient address rejected: User unknown",
    "452 4.2.2 The recipient's inbox is out of storage space. Please direct the recipient to Manage files in your Google Drive storage.",
    "550 5.7.708 Access denied, traffic not accepted from this IP",
    "550 5.7.515 Access denied, sending domain [example.com] does not meet the required authentication level.",
    "Thanks for your message, I am out of the office"
  ]
}
```

returns (trimmed):

```json
{
  "lines": 5,
  "classified": 4,
  "totals": {
    "hard": 1,
    "soft": 1,
    "block": 1,
    "policy": 1,
    "delivered": 0,
    "unknown": 1
  },
  "suppress": [
    "ann@example.com"
  ],
  "rows": [
    {
      "line": 1,
      "verdict": "hard",
      "rule": "postfix-x-x-2"
    },
    {
      "line": 2,
      "verdict": "soft",
      "rule": "gmail-452-4-2-2"
    }
  ]
}
```

That batch costs 4 x $0.0005: the out-of-office line has no status code, so it is classed unknown and refunded.

## Fields

| Field | Values |
| --- | --- |
| verdict | hard, soft, block, policy, delivered, unknown |
| suppress | now, after-repeats, no |
| retry | yes, later, after-fix, no |
| rule.kind | provider-text, enhanced-code, enhanced-subject, reply-code, class, log-status, dsn-action, none |
| confidence | high, medium, low, none |
| warnings\[\].code | class-mismatch, provider-differs, unregistered, iana-transient, ambiguous-reply |

Docs for keys, errors, idempotency and MCP: [the docs](https://krishnachagti-sudo.github.io/toll-preview/docs).

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Steps

1. **Get a key.** Create an API key on your account page; a top-up starts at $20 and every account gets $0.25 free each month.
2. **Send one bounce.** POST {"op":"classify","text":"..."} with the raw reply, the DSN or the log line.
3. **Or a batch.** POST {"op":"batch","lines":\[...\]} with up to 500 lines; you pay only for lines where a code or known text was found.
4. **Act on the verdict.** Suppress when suppress is "now"; retry when retry is "yes"; otherwise fix the sender or the setup. Store rule.id so you can audit or override.

## Questions

### Is the same bounce always classified the same way?

Yes. The rules are fixed data and code; every response carries the rule id and the data version.

### Can an AI agent use it?

Yes, through MCP: the same tool and price, plus quote\_price to price a batch before running it.

## Related

- [SMTP error codes list](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/smtp-error-codes/)
- [Parse a DSN](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/parse-dsn/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/api/  
Data as of: 2026-11-08
