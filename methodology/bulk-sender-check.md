# How the bulk sender check grades one email: method

The message is checked 14 ways (SPF, DKIM, DKIM key length, DMARC record, alignment and result, reverse DNS, TLS, RFC 5322 format, one-click unsubscribe and more), and each of 3 providers' rules takes the worst result of the checks it maps to. Gmail requires a DKIM key of at least 1024 bits, and spam rate and unsubscribe time cannot be judged from one message.

## How does it work?

1. The message is split into headers and body; line endings become CRLF, folded headers are joined, and an mbox "From " separator line is skipped. More than 600 header fields, or none, is refused.
2. The topmost Authentication-Results header is taken as the receiver's, since each receiving server adds its own above the message.
3. With DNS on, the first 5 DKIM signatures have their keys looked up at selector.\_domainkey.domain, DMARC is looked up under \_dmarc for the From domain and then for its organizational domain, the sending IP's PTR names are looked up and up to 3 are checked to resolve back to it, and SPF is re-run for the MAIL FROM domain and the sending IP with the SPF lookup counter's engine. One message may make at most 30 queries in 10 seconds, on public resolvers; private and internal names are never queried.
4. SPF passes when the receiver recorded spf=pass, or, with no receiver result, when the re-check passes.
5. Each DKIM signature is verified under RFC 6376: the tags are checked (v=1, a known algorithm, From signed, i= inside d=), the key record is read, and the signature and body hash are checked with rsa-sha256, rsa-sha1 or ed25519-sha256, simple or relaxed.

> Steps 6 to 11, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/bulk-sender-check/#what) below.

## What does it not cover?

- Spam rate and how fast unsubscribes are handled cannot be seen in one message, so those rules are marked not checkable.
- Providers also judge reputation and content, so a message that meets every rule may still not reach the inbox.
- It never calls the unsubscribe URL: a POST to it would unsubscribe the recipient.
- The body link is found only by the English words unsubscribe, opt out and manage preferences.
- The message is processed in memory and not stored.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 11 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The provider rules and the RFCs were read on 2026-11-08, and the Public Suffix List is version 2026-11-06. The provider pages are checked once a day for changes, and the rules change only by hand, with the tests that pin them. DNS answers are read live for each check unless DNS is turned off.
- [Tested: 4 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests sign real messages and check them on a recorded DNS zone: the three worked examples with their verdicts pinned, header parsing, Gmail, Outlook.com and Yahoo Authentication-Results, organizational domains and alignment, RSA and Ed25519 DKIM with changed headers and bodies, key length, PTR and TLS, DNS turned off, no query for internal names, RFC 8058 one-click, the body link, RFC 5322 format, Gmail From:, and that every rule is sourced, dated and maps to a check the engine runs.

- [Google: Email sender guidelines](https://support.google.com/a/answer/81126?hl=en), see the document, read 2026-11-08
- [Google: Email sender guidelines FAQ](https://support.google.com/a/answer/14229414?hl=en), see the document, read 2026-11-08
- [Google Workspace: Gmail SMTP errors and codes (last updated 2026-10-26)](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en), see the document, read 2026-11-08
- [Yahoo Sender Hub: Sender Requirements & Recommendations](https://senders.yahooinc.com/best-practices/), see the document, read 2026-11-08
- [Outlook.com Postmaster: Policies, Practices, and Guidelines](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies), see the document, read 2026-11-08
- [Microsoft: Outlook's new requirements for high-volume senders (updated Apr 30, 2025)](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730), see the document, read 2026-11-08
- [RFC 5322: Internet Message Format](https://www.rfc-editor.org/rfc/rfc5322), see the document, read 2026-11-08
- [RFC 6376: DomainKeys Identified Mail (DKIM) Signatures](https://www.rfc-editor.org/rfc/rfc6376), see the document, read 2026-11-08
- [RFC 7489: Domain-based Message Authentication, Reporting, and Conformance (DMARC)](https://www.rfc-editor.org/rfc/rfc7489), see the document, read 2026-11-08
- [RFC 8058: Signaling One-Click Functionality for List Email Headers](https://www.rfc-editor.org/rfc/rfc8058), see the document, read 2026-11-08
- [Public Suffix List (Mozilla Public License 2.0)](https://publicsuffix.org/list/public_suffix_list.dat), version 2026-11-06, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the bulk sender check compute?

Given one raw message (an .eml file or the headers and body pasted as text), the tool reads the receiver's Authentication-Results, verifies each DKIM signature itself, looks up the DKIM keys, the DMARC record and the sending IP's reverse DNS, and re-checks SPF. It turns these into 16 checks, each with a status, a reason and a fix, and grades them against the rules Gmail, Yahoo and Microsoft Outlook.com publish for all senders and for bulk senders (Gmail 7 for all senders and 13 for bulk senders, Yahoo 5 for all senders and 10 for bulk senders, Microsoft (Outlook.com) 2 for all senders and 4 for bulk senders). Every rule is quoted from the provider's page with its source and the date it was read.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `check`: Checks one message. The answer has the headline (how many of each provider's checked bulk-sender rules pass and the first check that fails), the verdict per provider and audience with each rule's status, quote, source and bounce codes, every check with its status, summary and fix, what was read from the message (From domain, organizational domain, MAIL FROM, sending IP, the receiver's results, the delivery hop), notes, the DNS used and the date the rules were read.
- `rules`: Returns the providers' rule table: every rule with its quote, the checks it maps to, the bounce codes the provider lists, and the dated sources. Free.
- `sample`: Returns one of the 3 worked example messages (compliant, one-click-missing, not-aligned) with its report, worked out on a recorded zone of documentation domains. Free.

Inputs:

- `eml`: For check: the raw message as text, its headers, a blank line, then the body, at most 150,000 characters. Headers alone can be checked; the body link and DKIM body hash then need the body.
- `messageType`: For check: marketing (the default) or transactional. Rules that apply only to marketing mail (one-click unsubscribe, the body link) are not applicable to transactional mail.
- `dns`: For check: true (the default) to look up DKIM keys, DMARC, reverse DNS and SPF; false to use only the receiver's results and the headers, with no query made.
- `id`: For sample: compliant, one-click-missing, not-aligned.

Outputs:

- answer: how many of the Gmail, Yahoo and Microsoft bulk-sender rules pass, and the first check that fails with why
- verdicts: per provider and audience (all senders, bulk), each rule's status (pass, fail, warn, unknown, n/a or not-checkable), quote, source and bounce codes, with counts of required rules passed, failed and checked
- checks: SPF, DKIM, DKIM key length, SPF or DKIM, DMARC record, alignment and pass, PTR, TLS, format, Gmail From:, one-click unsubscribe, List-Unsubscribe, the body link, spam rate and unsubscribe time, each with its summary and fix
- message: the From and MAIL FROM domains, the organizational domain, the sending IP and where it was found, the receiver's results and the delivery hop
- notes, dns (the resolver, the number of queries and when) and rulesReadOn

**Every step in full (11) and the rules**

1. The message is split into headers and body; line endings become CRLF, folded headers are joined, and an mbox "From " separator line is skipped. More than 600 header fields, or none, is refused.
2. The topmost Authentication-Results header is taken as the receiver's, since each receiving server adds its own above the message. The sending IP is the Received-SPF client-ip, then the IP in the receiver's results, then the first public IP in a Received header; the delivery hop is the Received header with that IP. The envelope sender (MAIL FROM) is the receiver's smtp.mailfrom, else Return-Path.
3. With DNS on, the first 5 DKIM signatures have their keys looked up at selector.\_domainkey.domain, DMARC is looked up under \_dmarc for the From domain and then for its organizational domain, the sending IP's PTR names are looked up and up to 3 are checked to resolve back to it, and SPF is re-run for the MAIL FROM domain and the sending IP with the SPF lookup counter's engine. One message may make at most 30 queries in 10 seconds, on public resolvers; private and internal names are never queried.
4. SPF passes when the receiver recorded spf=pass, or, with no receiver result, when the re-check passes. If the two differ, the summary says the record may have changed since sending.
5. Each DKIM signature is verified under RFC 6376: the tags are checked (v=1, a known algorithm, From signed, i= inside d=), the key record is read, and the signature and body hash are checked with rsa-sha256, rsa-sha1 or ed25519-sha256, simple or relaxed. A signature passes when the receiver said pass (matched by header.b, then domain and selector) or our verification passes. A paste with no body verifies the headers only.
6. The key length is that of the strongest passing signature: 2048 bits or more passes, 1024 to 2047 passes with advice to move to 2048, under 1024 fails, and an Ed25519 key alone is a warning.
7. DMARC: a record is valid when it starts with v=DMARC1 and has p=none, quarantine or reject; two records count as invalid. Alignment follows RFC 7489 Section 3.1: strict needs the same name, relaxed the same organizational domain, found from the Public Suffix List. DMARC passes when an identifier that passed is aligned.
8. Reverse DNS passes when the IP has a PTR name that resolves back to it. TLS passes when the receiving server wrote ESMTPS (or another RFC 3848 TLS keyword) or a TLS version, and fails when it wrote ESMTP or SMTP with no TLS.
9. Format follows RFC 5322 Section 3.6: one From: with one address with a valid domain, a Date:, a Message-ID: in \<left@right\> form, no repeated single-instance header, no malformed header line and no header line over 998 characters. A From: at gmail.com not signed by gmail.com fails the Gmail From: check.
10. One-click unsubscribe follows RFC 8058: exactly one List-Unsubscribe with an HTTPS URI, exactly one List-Unsubscribe-Post of List-Unsubscribe=One-Click (in any case), and both headers in the h= of a passing DKIM signature. The body is searched for a link labelled unsubscribe, opt out or manage preferences.
11. Each provider rule takes the worst status of the checks it maps to (fail, then warn, then unknown, then pass). Marketing-only rules are n/a for transactional mail. Only required rules are counted in passed and checked; a recommended rule is shown but not counted.

**Provider rules.**

Gmail, Yahoo and Microsoft Outlook.com rules are quoted from their own pages, read on 2026-11-08. Gmail's bulk rules are for 5,000 or more messages a day and Microsoft's for more than 5,000 emails a day, as each page states; Yahoo publishes no volume figure.

**Standards.**

RFC 5322 for message format, RFC 6376 for DKIM, RFC 7489 for DMARC and alignment, and RFC 8058 for one-click unsubscribe. RFC 8601 (Authentication-Results), RFC 2369 (List-Unsubscribe) and RFC 3848 (the ESMTPS keyword) are used only to read what the headers say.

**Organizational domains.**

The organizational domain is the public suffix plus one label, by the Public Suffix List version 2026-11-06.

## Which edge cases does it handle?

**The edge cases (7)**

- A copy with no Authentication-Results (from a Sent folder, or before delivery) is checked with our own DKIM verification and today's DNS, and a note says so.
- When the receiver verified a DKIM signature but our check of the pasted copy fails, the receiver's result is used and the summary says the copy was probably changed after delivery.
- A DMARC record found at the organizational domain covers a subdomain From: and is reported as found there.
- A List-Unsubscribe with only a mailto: URI fails RFC 8058 one-click, and is a warning for Yahoo, which accepts mailto.
- Transactional mail is not held to the one-click and body link rules: those rules are n/a.
- With DNS turned off, nothing is queried: DKIM uses the receiver's result, DMARC the receiver's evaluation, PTR the name the receiver recorded, and the key length is unknown.
- A DKIM d= or From domain that is internal (such as corp.internal) is never queried.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A compliant newsletter received by Gmail**

A compliant newsletter received by Gmail

| Result | Value |
| --- | --- |
| answer | This message passes 11 of 11 checked Gmail bulk-sender rules, 8 of 8 Yahoo and 3 of 3 Microsoft: nothing fails. Spam rate and unsubscribe handling cannot be judged from one message. |
| Gmail bulk rules | 11 of 11 pass |
| checks that fail | none |
| sending IP | 203.0.113.10 (from Received-SPF client-ip) |
| DKIM key | 2048 bits |
| DNS | example zone (documentation domains), recorded 2026-11-08, 5 queries |

**The input**

```json
{
  "op": "sample",
  "id": "compliant"
}
```

**More worked examples (2)**

**A promotion received by Outlook.com with no one-click unsubscribe**

A promotion received by Outlook.com with no one-click unsubscribe

| Result | Value |
| --- | --- |
| answer | This message passes 10 of 11 checked Gmail bulk-sender rules, 7 of 8 Yahoo and 3 of 3 Microsoft: it fails one-click unsubscribe because List-Unsubscribe has only a mailto: URI; RFC 8058 requires one HTTPS URI, and Google says mailto does not meet its one-click requirement. |
| Gmail bulk rules | 10 of 11 pass |
| checks that fail | one-click unsubscribe |
| sending IP | 198.51.100.25 (from Received-SPF client-ip) |
| DKIM key | 1024 bits |
| DNS | example zone (documentation domains), recorded 2026-11-08, 5 queries |

**The input**

```json
{
  "op": "sample",
  "id": "one-click-missing"
}
```

**SPF and DKIM pass but DMARC fails because nothing aligns with the From: domain**

SPF and DKIM pass but DMARC fails because nothing aligns with the From: domain

| Result | Value |
| --- | --- |
| answer | This message passes 7 of 11 checked Gmail bulk-sender rules, 4 of 8 Yahoo and 2 of 3 Microsoft: it fails DMARC alignment because neither the DKIM domain (mailer.example.net) nor the SPF domain (mailer.example.net) is in shop.example.com's organizational domain, example.com, and 5 more checks fail (DMARC pass, reverse DNS (PTR), TLS, one-click unsubscribe, List-Unsubscribe). |
| Gmail bulk rules | 7 of 11 pass |
| checks that fail | DMARC alignment, DMARC pass, reverse DNS (PTR), TLS, one-click unsubscribe, List-Unsubscribe |
| sending IP | 192.0.2.44 (from Received-SPF client-ip) |
| DKIM key | 2048 bits |
| DNS | example zone (documentation domains), recorded 2026-11-08, 6 queries |

**The input**

```json
{
  "op": "sample",
  "id": "not-aligned"
}
```

## How is it tested?

**What its test suite asserts (4)**

- The three worked examples are real DKIM-signed messages checked on a recorded DNS zone, with their answers and verdicts pinned.
- RSA and Ed25519 DKIM verify, and a changed header or body fails; key length, RFC 7489 alignment with organizational domains from the Public Suffix List, PTR, TLS, RFC 5322 format and Gmail From: impersonation are checked.
- RFC 8058 one-click is checked at MUST level with transactional mail exempt; with DNS off nothing is queried, and internal names are never queried.
- Every provider rule is sourced, dated 2026-11-08 and maps to a check the engine runs.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Bulk sender check tool](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/).

## Questions

### Is there any AI in the bulk sender check answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the bulk sender check refuse to answer?

Spam rate and how fast unsubscribes are handled cannot be seen in one message, so those rules are marked not checkable. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Bulk sender check tool](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/bulk-sender-check/  
Data as of: 2026-11-04
