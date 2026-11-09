# How SMTP bounces are classified: rules in fixed order

A bounce gets one of 4 verdicts (hard, soft, block or policy) from the first rule that applies: a provider's published text (171 rules), then the enhanced code's detail in the IANA registry (81 codes), its subject, the RFC reply code (26 codes) and the class digit. A 4xx reply is never hard.

## How does it work?

1. Reading: line endings are evened out. In a DSN (RFC 3464), folded lines are joined and the Status, Action, Final-Recipient (or Original-Recipient), Remote-MTA and Diagnostic-Code fields are read.
2. The first reply code and enhanced code written together (such as 550 5.1.1) are taken, and the repeated prefixes of a multi-line reply are dropped.
3. Provider: the one given, or the first whose mail hosts appear in the remote host or the text (such as gsmtp or protection.outlook.com).
4. A 2xx reply or 2.X.X status is delivered.
5. Rule 1, provider text: the bounce text is matched (lowercase, as a substring) against the phrases from Gmail, Microsoft, Yahoo and Postfix pages (Gmail 79, Microsoft 87, Yahoo 3, Postfix 2).

> Steps 6 to 12, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/smtp-bounce-code-classifier/#what) below.

## What does it not cover?

- A line with no SMTP status code and no known provider text is answered as unknown: nothing is decided.
- Provider texts are read only from Gmail, Microsoft, Yahoo, Postfix; other receivers are decided by the codes.
- The verdicts are the tool's rules, not the provider's; a provider can change its text or reuse a code.
- It does not send mail, test an address or look up a mailbox: it reads only the bounce given.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 11 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The data was read on 2026-11-08: the IANA registry (updated 2024-12-06), RFC 5321, RFC 7504 and RFC 4954, Gmail's page (updated 2026-10-26), Microsoft's pages (updated 2026-08-24), Yahoo's Sender Hub and Postfix postconf(5). Each page is checked daily for changes, and the rules change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests parse a multi-line reply, a DSN and a Postfix line; check that provider text decides before the code and that the IANA detail, subject, reply code and class are tried in that order; check that a 4xx is never hard and the warnings fire; pin the IANA registry (81 detail codes), the 26 reply codes and the provider texts; and check a batch's rows, totals and suppress list.

- [IANA Simple Mail Transfer Protocol (SMTP) Enhanced Status Codes Registry](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml), registry updated 2024-12-06, read 2026-11-08
- [RFC 3463: Enhanced Mail System Status Codes](https://www.rfc-editor.org/rfc/rfc3463), see the document, read 2026-11-08
- [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321.txt), see the document, read 2026-11-08
- [RFC 7504](https://www.rfc-editor.org/rfc/rfc7504.txt), see the document, read 2026-11-08
- [RFC 4954](https://www.rfc-editor.org/rfc/rfc4954.txt), see the document, read 2026-11-08
- [Gmail: Gmail SMTP errors and codes](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en), page updated 2026-10-26, read 2026-11-08
- [Microsoft: Email non-delivery reports and SMTP errors in Exchange Online](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online), page updated 2026-08-24, read 2026-11-08
- [Yahoo: Yahoo Sender Hub: SMTP error codes](https://senders.yahooinc.com/smtp-error-codes/), see the document, read 2026-11-08
- [Postfix: Postfix configuration parameters, postconf(5)](https://www.postfix.org/postconf.5.html), see the document, read 2026-11-08
- [Microsoft: Enhancing mail flow with MTA-STS](https://learn.microsoft.com/en-us/exchange/security-and-compliance/enhance-mail-flow-using-strict-transport-security), page updated 2026-07-21, read 2026-11-08
- [Microsoft: Outlook's new requirements for high-volume senders](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730), page updated 2025-04-30, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the smtp bounce classifier compute?

The tool reads a bounce in any of three forms (a raw SMTP reply, a delivery status notification or a Postfix log line), finds its reply code, enhanced status code, recipient and text, and gives one verdict with the rule that decided it, what the code means, whether to retry and whether to suppress the address. A batch does up to 500 lines and lists the addresses to suppress.

**In detail: operations, inputs and outputs**

The code lookup explains a status code on its own, with every provider text published with it.

Operations (the op field):

- `classify`: Classifies one bounce. The answer has the verdict, label, temporary, retry, suppress, the action to take, the reason, the rule that matched (its id, kind, provider, the phrase matched and its source page), the confidence, the reply code and enhanced code with their official meanings, the provider, what was parsed and any warnings.
- `batch`: Classifies up to 500 lines, one row each, with totals by verdict, the number classified (every line but the unknown ones) and the list of addresses to suppress now.
- `code`: Explains a status code such as "550 5.1.1", "5.7.26" or "421": its meaning and default verdict, plus every provider text published with that code and the verdicts they get.

Inputs:

- `text`: For classify: the bounce, up to 20,000 characters. A multi-line reply, a whole DSN or a Postfix log line can be pasted as it is.
- `lines`: For batch: a list of 1 to 500 bounces, each up to 4,000 characters.
- `provider`: For classify and batch, optional: gmail, microsoft, yahoo, postfix, to say which receiver sent the bounce when the text does not show it.
- `code`: For code: a 3-digit reply code, an enhanced code, or both, such as "550 5.1.1".

Outputs:

- verdict and label: hard, soft, block or policy, or delivered for a 2xx or 2.X.X status and unknown when no code or known text is found
- temporary, retry and suppress: whether the reply is 4xx, whether to retry (no, yes, later or after a fix) and whether to suppress the address (now, after repeated failures, or no)
- action and reason: what to do, and why, from the rule that matched
- rule: its id and kind (provider-text, enhanced-code, enhanced-subject, reply-code, class, log-status or dsn-action), and for a provider text the phrase matched and the page it comes from
- basic and enhanced: the reply code's RFC meaning and class, and the enhanced code's class, subject and IANA detail with its description and references
- parsed: the form read (text, dsn or postfix), recipient, DSN action, Postfix status, remote host and the SMTP command
- warnings and confidence, and for batch the totals, the classified count and the suppress list

**Every step in full (12) and the rules**

1. Reading: line endings are evened out. In a DSN (RFC 3464), folded lines are joined and the Status, Action, Final-Recipient (or Original-Recipient), Remote-MTA and Diagnostic-Code fields are read. In a Postfix line, status=, dsn=, to=\<...\>, relay= and the text after "said:" with the command it replied to are read.
2. The first reply code and enhanced code written together (such as 550 5.1.1) are taken, and the repeated prefixes of a multi-line reply are dropped. Otherwise a reply code and an enhanced code are found separately. A DSN Status or Postfix dsn= value comes before an enhanced code in the text. With no recipient field, the first \<name@domain\> in the bounce is the recipient.
3. Provider: the one given, or the first whose mail hosts appear in the remote host or the text (such as gsmtp or protection.outlook.com).
4. A 2xx reply or 2.X.X status is delivered.
5. Rule 1, provider text: the bounce text is matched (lowercase, as a substring) against the phrases from Gmail, Microsoft, Yahoo and Postfix pages (Gmail 79, Microsoft 87, Yahoo 3, Postfix 2). A rule tied to an enhanced code applies only to that code, the same detail in the other class, or its listed range; a rule tied to a reply code applies only with that reply code. The best match is the one with the exact enhanced code, then the same detail, then the same reply code, then the provider detected, then the longest phrase.
6. Rule 2, the enhanced code's detail: each of the 81 IANA detail codes has a verdict for class 5 and one for class 4. X.7.0 with an SMTP AUTH reply (530, 534, 535, 538, 454 or 432, RFC 4954) is policy.
7. Rule 3, the subject: when the detail is not in the IANA registry (a provider's own code such as 5.7.708), the subject decides: X.1 hard in class 5, X.2, X.3 and X.4 soft, X.5 and X.6 policy, X.7 block.
8. Rule 4, the reply code alone: 26 reply codes have a verdict, such as 550 hard, 552 soft (mailbox full) and 554 block.
9. Rule 5, the class digit: any other 4xx or 5xx reply is soft. Then a Postfix status=deferred or a DSN Action of delayed is soft, and sent, delivered, relayed or expanded is delivered. Anything else is unknown.
10. A 4xx reply or 4.X.X status is temporary, and a temporary bounce is never hard: a hard verdict becomes soft. A temporary block or policy bounce can be retried; a soft verdict on a permanent reply is retried later.
11. Warnings are added when the reply code and enhanced code disagree on the class (the reply code wins), when a provider uses a registered code for something else, when the code is not in the IANA registry, when X.4.6 comes with class 5, and when a bare 550 or 554 is decided by the reply code alone.
12. Confidence: high for a provider text and most IANA details, medium for X.0.0, X.7.0 and X.7.1, low for a subject, reply code or class, none for unknown.

**The four verdicts.**

Hard bounce: Suppress the address now; it does not exist or will never accept mail.

Soft bounce: Retry with backoff; suppress the address only if it keeps failing over several days.

Block: Do not suppress the address: the receiver refused the sender (reputation, content or volume). Fix that, then resend.

Policy: Do not suppress the address: a rule your sending setup breaks (authentication, TLS, format, size or relay) refused it. Fix the setup, then resend.

**IANA registry and RFCs.**

The class, subject and detail names come from the IANA Simple Mail Transfer Protocol (SMTP) Enhanced Status Codes Registry, last updated 2024-12-06, read on 2026-11-08. The reply code meanings come from RFC 5321, RFC 7504 and RFC 4954, and the class meanings from RFC 3463. The verdict for each code is the tool's own rule, not part of the registry or the RFCs.

**Provider texts.**

Each provider rule is a short phrase from the provider's own page, with the codes listed beside it; meanings are paraphrased. Gmail's page was last updated 2026-10-26 and Microsoft's 2026-08-24; all were read on 2026-11-08.

**Sending platforms.**

The guide pages map the bounce labels of 8 sending platforms (such as Twilio SendGrid, Amazon SES, Postmark) to these verdicts, read from each platform's documentation on 2026-11-08. Those labels are not used to classify a bounce.

## Which edge cases does it handle?

**The edge cases (8)**

- A Gmail reply that repeats "550-5.1.1" on every line is read once, and the text after the prefixes is matched.
- 4.1.1 (a mailbox that does not exist, sent as temporary) is soft, not hard.
- 5.7.708 is not in the IANA registry: Microsoft's published text for it decides when present, otherwise subject X.7 makes it a block, and either way the answer warns that the code is a provider's own.
- A bare 550 with no enhanced code and no known text is hard by default, with a warning that 550 is ambiguous.
- "421 5.7.0" is treated as temporary because the reply code is class 4, with a warning that the classes disagree.
- A Postfix line with status=deferred and no code is soft.
- An out-of-office reply has no status code or known text, so it is unknown and nothing is decided.
- In a batch, the same address bouncing hard twice is listed once to suppress, lowercased.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Gmail: the account does not exist (multi-line reply)**

Gmail: the account does not exist (multi-line reply)

| Result | Value |
| --- | --- |
| verdict | Hard bounce |
| rule | gmail-550-5-1-1 |
| text matched | email account that you tried to reach does not exist |
| suppress | now |
| retry | no |
| IANA detail | X.1.1 Bad destination mailbox address |
| confidence | high |

**The input**

```json
{
  "op": "classify",
  "text": "550-5.1.1 The email account that you tried to reach does not exist. Please try\n550-5.1.1 double-checking the recipient's email address for typos or\n550 5.1.1 unnecessary spaces. For more information, go to Fix bounced or rejected emails. - gsmtp"
}
```

**More worked examples (4)**

**A Postfix log line: relay access denied**

A Postfix log line: relay access denied

| Result | Value |
| --- | --- |
| form read | postfix |
| recipient | jane@example.org |
| remote host | mx.example.org |
| command | RCPT TO |
| codes | 554 5.7.1 |
| verdict | Policy |
| rule | microsoft-x-5-4-1-2 |
| action | Check the recipient domain's MX and your relay settings; do not suppress. |

**The input**

```json
{
  "op": "classify",
  "text": "Nov  8 10:12:01 mx postfix/smtp[1234]: 4F3A21C0: to=<jane@example.org>, relay=mx.example.org[192.0.2.25]:25, delay=1.2, delays=0.1/0/0.5/0.6, dsn=5.7.1, status=bounced (host mx.example.org[192.0.2.25] said: 554 5.7.1 <jane@example.org>: Relay access denied (in reply to RCPT TO command))"
}
```

**A DSN from Gmail: 550 5.7.26, the sender is unauthenticated**

A DSN from Gmail: 550 5.7.26, the sender is unauthenticated

| Result | Value |
| --- | --- |
| form read | dsn |
| recipient | sam@gmail.com |
| DSN action | failed |
| verdict | Policy |
| text matched | sender is unauthenticated |
| suppress | no |
| answer | 550 5.7.26 is a policy rejection: Gmail's published text "sender is unauthenticated" means: the message passed neither SPF nor DKIM, and Gmail requires one of them; set up SPF or DKIM for the sending domain; do not suppress the recipient. |

**The input**

```json
{
  "op": "classify",
  "text": "Final-Recipient: rfc822; sam@gmail.com\nAction: failed\nStatus: 5.7.26\nRemote-MTA: dns; gmail-smtp-in.l.google.com\nDiagnostic-Code: smtp; 550-5.7.26 This email has been blocked because the sender is\n unauthenticated. Gmail requires all senders to authenticate with either SPF or DKIM."
}
```

**A batch of five lines: one of each verdict and one that is not a bounce**

A batch of five lines: one of each verdict and one that is not a bounce

| Result | Value |
| --- | --- |
| classified | 4 of 5 |
| totals | hard 1, soft 1, block 1, policy 1, unknown 1 |
| suppress now | ann@example.com |
| line 1 | hard (postfix-x-x-2) |
| line 2 | soft (gmail-452-4-2-2) |
| line 3 | block (microsoft-x-5-7-708) |
| line 4 | policy (microsoft-550-5-7-515) |
| line 5 | unknown (none) |

**The input**

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

**Look up a code: 421 4.7.0**

Look up a code: 421 4.7.0

| Result | Value |
| --- | --- |
| answer | 421 4.7.0 is a block: IANA defines X.7.0 as "Other or undefined security status"; retry later at a lower rate and do not suppress the address; fix the sender's reputation, content or volume. Gmail publishes 8 texts with it, classed soft, block, policy: classify the full reply. |
| temporary | yes |
| confidence | medium |
| provider texts with this code | 8 |

**The input**

```json
{
  "op": "code",
  "code": "421 4.7.0"
}
```

## How is it tested?

**What its test suite asserts (3)**

- The IANA registry (81 detail codes, updated 2024-12-06), the 26 RFC reply codes and the 171 provider text rules are pinned, with their sources and read date.
- A multi-line reply, a DSN and a Postfix line are parsed to the same parts; provider text decides before the IANA detail, then the subject, the reply code and the class.
- A 4xx reply is never hard; the class-mismatch, provider-differs and unregistered-code warnings fire; the code lookup lists every published text; a batch gives its rows, totals and suppress list.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the SMTP bounce classifier tool](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/).

## Questions

### Is there any AI in the smtp bounce classifier answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the smtp bounce classifier refuse to answer?

A line with no SMTP status code and no known provider text is answered as unknown: nothing is decided. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the SMTP bounce classifier tool](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/smtp-bounce-code-classifier/  
Data as of: 2026-11-04
