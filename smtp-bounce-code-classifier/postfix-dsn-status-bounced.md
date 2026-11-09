# Postfix dsn= and status= explained

Postfix logged dsn=5.7.1 status=bounced: IANA defines X.7.1 as "Delivery not authorized, message refused", so on its own it is a block; paste the full log line, and the remote server's text decides (in the example below, "Relay access denied" makes it policy).

## Classify your log line

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=Nov++8+10%3A12%3A01+mx+postfix%2Fsmtp%5B1234%5D%3A+4F3A21C0%3A+to%3D%3Cjane%40example.org%3E%2C+relay%3Dmx.example.org%5B192.0.2.25%5D%3A25%2C+delay%3D1.2%2C+delays%3D0.1%2F0%2F0.5%2F0.6%2C+dsn%3D5.7.1%2C+status%3Dbounced+%28host+mx.example.org%5B192.0.2.25%5D+said%3A+554+5.7.1+%3Cjane%40example.org%3E%3A+Relay+access+denied+%28in+reply+to+RCPT+TO+command%29%29&run=1)

## One line, part by part

```
Nov  8 10:12:01 mx postfix/smtp[1234]: 4F3A21C0: to=<jane@example.org>, relay=mx.example.org[192.0.2.25]:25, delay=1.2, delays=0.1/0/0.5/0.6, dsn=5.7.1, status=bounced (host mx.example.org[192.0.2.25] said: 554 5.7.1 <jane@example.org>: Relay access denied (in reply to RCPT TO command))
```

| Part | Here | Meaning |
| --- | --- | --- |
| to= | `jane@example.org` | The recipient |
| relay= | `mx.example.org` | The server Postfix talked to |
| delay=, delays= | 1.2; 0.1/0/0.5/0.6 | Seconds in total, and before the queue manager / in it / connecting / transmitting |
| dsn= | `5.7.1` | The enhanced status code (RFC 3463) |
| status= | bounced | bounced, deferred or sent |
| said: | `554 5.7.1 ... Relay access denied` | The remote server's own reply |
| in reply to | RCPT TO | The SMTP command that was refused |

The classifier reads it as: 554 5.7.1 is a policy rejection: Microsoft's published text "Relay Access Denied" means: the receiving server is not a destination or relay for that domain (often a wrong MX or a missing relay permission); check the recipient domain's MX and your relay settings; do not suppress.

## Common dsn= values

Each worked by the classifier from the dsn= value alone; the remote text, when present, can change the verdict.

| dsn= | status= | IANA meaning | Verdict | Suppress? |
| --- | --- | --- | --- | --- |
| `5.1.1` | bounced | Bad destination mailbox address | hard | now |
| `5.1.2` | bounced | Bad destination system address | hard | now |
| `5.1.10` | bounced | Recipient address has null MX | hard | now |
| `5.2.2` | bounced | Mailbox full | soft | after-repeats |
| `5.4.4` | bounced | Unable to route | hard | now |
| `5.4.6` | bounced | Routing loop detected | policy | no |
| `5.7.1` | bounced | Delivery not authorized, message refused | block | no |
| `5.7.26` | bounced | Multiple authentication checks failed | policy | no |
| `5.0.0` | bounced | Other undefined Status | soft | after-repeats |
| `4.4.1` | deferred | No answer from host | soft | after-repeats |
| `4.4.2` | deferred | Bad connection | soft | after-repeats |
| `4.7.0` | deferred | Other or undefined security status | block | no |
| `4.2.2` | deferred | Mailbox full | soft | after-repeats |
| `4.4.7` | deferred | Delivery time expired | soft | after-repeats |

## Your own server's "User unknown"

When the bounce comes from your own Postfix, "User unknown in local recipient table" means the address is not in local\_recipient\_maps. Postfix's docs say its default reply code for that is 550, and suggest 450 while you check the tables are right; with 450 the classifier says soft.

- [Postfix: postconf(5) configuration parameters, read November 8, 2026](https://www.postfix.org/postconf.5.html)
- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What does status=bounced mean in a Postfix log?

Postfix gave up on that recipient and sends (or has sent) a bounce to the sender; status=deferred means it will try again, and status=sent means the next server accepted it.

### What does dsn=5.4.6 status=bounced mean?

IANA X.4.6 is "Routing loop detected"; IANA says it is useful only as a persistent transient error, but Postfix reported it with class 5. It is classed policy: fix the forwarding loop, do not suppress the address.

### How long does Postfix keep retrying a deferred message?

By default 5 days (maximal\_queue\_lifetime = 5d), with retries between 300 seconds (minimal\_backoff\_time) and 4000 seconds (maximal\_backoff\_time) apart.

## Related

- [SMTP error codes list](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/smtp-error-codes/)
- [Parse a DSN](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/parse-dsn/)
- [4xx deferrals: when to retry](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/4xx-retry/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/postfix-dsn-status-bounced/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/postfix-dsn-status-bounced.csv
