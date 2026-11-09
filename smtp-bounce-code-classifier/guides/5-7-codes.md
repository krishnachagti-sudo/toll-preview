# 5.7.x codes: authentication, policy and reputation

Subject 7 is "Security or Policy Status" (RFC 3463): IANA lists 31 X.7 codes, and of the 108 4.7 and 5.7 texts Gmail and Microsoft publish, 77 are policy and 25 block rejections, with only 2 meaning a bad address, so fix the sender instead of suppressing.

- IANA X.7 codes: 31

## Classify your 5.7.x bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=550+5.7.1+This+message+is+likely+unsolicited+email&run=1)

## The ones people search for

| Code | Who | Meaning | Verdict |
| --- | --- | --- | --- |
| [550 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1/) | Any | Delivery not authorized (IANA); read the text | block |
| [550 5.7.26](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/550-5-7-26/) | Gmail | Unauthenticated: no SPF or DKIM pass, SPF -all fail, or DMARC | policy |
| [550 5.7.515](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-7-515/) | Outlook.com | High-volume domain does not meet SPF, DKIM, DMARC | policy |
| [5.7.509](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-509/) | Microsoft | DMARC fail with p=reject | policy |
| [550 5.7.708](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-7-708/) | Microsoft | Traffic not accepted from this IP | block |
| [421 4.7.28](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-28/) | Gmail | Unusual rate of (unsolicited) mail | block |

## All 108 provider texts

| Provider | Code | Published text | Verdict | Meaning |
| --- | --- | --- | --- | --- |
| Gmail | `421 4.7.0` | `Connection expired, try reconnecting` | soft | The SMTP connection expired. |
| Gmail | `421 4.7.0` | `IP not in whitelist for RCPT domain` | block | The recipient's Workspace domain accepts mail only from IPs on its allowlist, and yours is not on it. |
| Gmail | `421 4.7.0` | `Try again later, closing connection` | soft | Gmail closed the connection and asked you to try again later. |
| Gmail | `421 4.7.0` | `does not have a PTR record, or the corresponding forward DNS entry` | policy | Your sending IP has no PTR record, or the PTR name does not resolve back to the IP, so Gmail rate limits it. |
| Gmail | `454 4.7.0` | `Too many sign-in attempts` | policy | Too many SMTP sign-in attempts to Google's relay. |
| Gmail | `454 4.7.0` | `Cannot sign in due to a temporary system problem` | soft | Sign-in to Google's relay failed for a temporary reason. |
| Gmail | `421 4.7.0` | `TLS required for RCPT domain` | policy | The recipient domain requires TLS and the connection was not encrypted. |
| Gmail | `421 4.7.0` | `very low reputation of the sending IP address` | block | Gmail rate limits your sending IP because of its very low reputation. |
| Gmail | `421 4.7.0` | `very low reputation of the sending domain` | block | Gmail blocked the message because your sending domain has a very low reputation. |
| Gmail | `421 4.7.0` | `nature of the content or the links within` | block | Gmail blocked the message for its content or links. |
| Gmail | `451 4.7.23` | `doesn't have a PTR record, or the PTR record's forward DNS entry` | policy | Your sending IP lacks a matching PTR record, so Gmail rate limits it. |
| Gmail | `451 4.7.24` | `SPF record of the sending domain has one or more suspicious entries` | policy | Gmail found suspicious entries in your SPF record and rate limits you. |
| Gmail | `451 4.7.26` | `temporary DNS failures prevent authentication` | soft | The sender domain's DMARC policy rejects unauthenticated mail, but a temporary DNS failure stopped Gmail from checking. |
| Gmail | `421 4.7.26` | `rate limited because it is unauthenticated` | policy | The message passed neither SPF nor DKIM, so Gmail rate limits it. |
| Gmail | `421 4.7.27` | `SPF authentication didn't pass for this message` | policy | SPF did not pass, so Gmail rate limits your bulk mail. |
| Gmail | `421 4.7.28` | `detected an unusual rate of` | block | Gmail sees an unusual rate of (unsolicited) mail from your IP, netblock, DKIM or SPF domain, or URL domain, and rate limits it. |
| Gmail | `421 4.7.28` | `quota for sending messages that have the same Message-ID` | policy | Too many messages with the same Message-ID header. |
| Gmail | `421 4.7.29` | `you're not using a TLS connection` | policy | Gmail requires bulk senders to use TLS and the connection was not encrypted. |
| Gmail | `421 4.7.30` | `DKIM authentication didn't pass for this message` | policy | DKIM did not pass, so Gmail rate limits your bulk mail. |
| Gmail | `421 4.7.40` | `doesn't have a DMARC record, or the DMARC record doesn't specify a DMARC policy` | policy | Your sending domain has no DMARC record or no DMARC policy, so Gmail rate limits bulk mail. |
| Gmail | `421 4.7.32` | `isn't aligned with either the authenticated SPF or DKIM` | policy | The From domain is not aligned with the domain that passed SPF or DKIM, so Gmail rate limits it. |
| Gmail | `421 5.7.32` | `isn't aligned with either the authenticated SPF or DKIM` | policy | Gmail blocked the message: the From domain is not aligned with the domain that passed SPF or DKIM. |
| Gmail | `552 5.7.0` | `content presents a potential security issue` | block | Gmail blocked the message because its content or attachment looks like a security risk. |
| Gmail | `503 5.7.0` | `No identity changes permitted` | policy | The session tried to change identity after signing in. |
| Gmail | `550 5.7.0` | `Invalid credentials for relay for one of the domains` | policy | Google's SMTP relay does not recognise your IP or domain for this Workspace account. |
| Gmail | `550 5.7.0` | `temporarily suspended due to abuse` | block | The sending account was suspended for abuse. |
| Gmail | `550 5.7.0` | `Email sending denied` | policy | Google denied sending from this account. |
| Gmail | `554 5.7.0` | `Too many unauthenticated commands` | policy | Too many commands before authenticating. |
| Gmail | `530 5.7.0` | `Authentication required` | policy | Google requires authentication or STARTTLS first. |
| Gmail | `550 5.7.1` | `has a policy that prohibits the email that you sent` | policy | The recipient (or the sender's own) domain has a rule that prohibits this message. |
| Gmail | `550 5.7.1` | `Invalid credentials for relay` | policy | The IP registered in Google's SMTP relay does not match the sending account's domain. |
| Gmail | `550 5.7.1` | `This message is likely unsolicited email` | block | Gmail blocked the message as likely spam. |
| Gmail | `550 5.7.1` | `does not meet IPv6 sending guidelines` | policy | Mail sent over IPv6 needs a PTR record and authentication. |
| Gmail | `550 5.7.1` | `very low reputation of the sending IP address` | block | Gmail blocked the message because of the sending IP's or domain's very low reputation. |
| Gmail | `550 5.7.1` | `missing a valid address in the From: header` | policy | The message headers break RFC 5322 or Gmail's header rules. |
| Gmail | `550 5.7.1` | `This email has been rate limited` | block | Gmail rate limited this mail. |
| Gmail | `550 5.7.1` | `not authorized to send email directly to our servers` | policy | Your IP may not send straight to Gmail; it must go through your provider's relay. |
| Gmail | `550 5.7.1` | `Daily SMTP relay sending limit exceeded for this customer` | policy | Your Workspace account reached its daily relay limit. |
| Gmail | `523 5.7.10` | `no commands allowed to pipeline after STARTTLS` | policy | Commands were pipelined after STARTTLS. |
| Gmail | `501 5.7.11` | `Syntax error (no parameters allowed)` | policy | STARTTLS was sent with parameters. |
| Gmail | `534 5.7.14` | `Please log in through your web browser` | policy | Google wants the account to sign in through a browser first. |
| Gmail | `550 5.7.24` | `SPF record of the sending domain has one or more suspicious entries` | policy | Gmail found suspicious entries in your SPF record. |
| Gmail | `550 5.7.25` | `sending IP address doesn't have a PTR record` | policy | Your sending IP has no matching PTR record, which Gmail requires. |
| Gmail | `550 5.7.26` | `sender is unauthenticated` | policy | The message passed neither SPF nor DKIM, and Gmail requires one of them. |
| Gmail | `550 5.7.26` | `has an SPF record with a hard fail policy` | policy | Your MAIL FROM domain publishes SPF with -all and the sending IP is not in it. |
| Gmail | `550 5.7.26` | `is not accepted due to domain's DMARC policy. Contact` | policy | The From domain's DMARC policy rejects unauthenticated mail and this message failed DMARC. |
| Gmail | `550 5.7.27` | `didn't pass SPF authentication` | policy | SPF did not pass; Gmail requires SPF from bulk senders. |
| Gmail | `550 5.7.28` | `unusual rate of unsolicited email originating from your IP address` | block | Gmail blocked your IP for an unusual rate of unsolicited mail. |
| Gmail | `550 5.7.29` | `wasn't sent over a TLS connection` | policy | Gmail requires bulk senders to use TLS. |
| Gmail | `550 5.7.30` | `didn't pass DKIM authentication` | policy | DKIM did not pass; Gmail requires DKIM from bulk senders. |
| Gmail | `550 5.7.40` | `sending domain doesn't have a DMARC record` | policy | Your sending domain has no DMARC record or no DMARC policy. |
| Gmail | `504 5.7.40` | `Unrecognized authentication type` | policy | The SMTP authentication method is not supported. |
| Gmail | `535 5.7.80` | `Username and Password not accepted` | policy | The SMTP username or password was not accepted. |
| Gmail | `534 5.7.90` | `Application-specific password required` | policy | Google requires an app password or a browser sign-in. |
| Microsoft | `4.7.5` | `Remote certificate failed MTA-STS validation` | policy | The destination server's certificate failed the domain's MTA-STS check. |
| Microsoft | `4.7.26` | `must pass either SPF or DKIM validation` | policy | Mail sent over IPv6 must pass SPF or DKIM. |
| Microsoft | `4.7.321` | `starttls-not-supported` | policy | The destination server does not complete STARTTLS. |
| Microsoft | `4.7.322` | `certificate-expired` | policy | The destination server's certificate has expired. |
| Microsoft | `4.7.323` | `tlsa-invalid` | policy | The domain failed DANE validation. |
| Microsoft | `4.7.324` | `dnssec-invalid` | policy | The destination domain's DNSSEC records could not be verified. |
| Microsoft | `4.7.325` | `certificate-host-mismatch` | policy | The destination certificate does not match the host name (DANE). |
| Microsoft | `4.7.500-699` | `Access denied, please try again later` | block | Microsoft saw suspicious activity and temporarily restricted sending. |
| Microsoft | `4.7.850-899` | `Access denied, please try again later` | block | Microsoft temporarily restricted the sending IP after suspicious activity. |
| Microsoft | `5.7.1` | `Delivery not authorized` | policy | You are not allowed to send to this recipient (for example a restricted group). |
| Microsoft | `5.7.1` | `Unable to relay` | policy | The receiving system does not accept mail for that domain from you (it is not the final destination). |
| Microsoft | `5.7.1` | `Client was not authenticated` | policy | The receiving server needs authentication before it accepts mail. |
| Microsoft | `5.7.5` | `Remote certificate failed MTA-STS validation` | policy | The destination server's certificate failed the domain's MTA-STS check. |
| Microsoft | `5.7.12` | `Sender was not authenticated by organization` | policy | The recipient accepts mail only from inside its organization. |
| Microsoft | `5.7.23` | `Sender Policy Framework violation` | policy | The message failed the destination's SPF check. |
| Microsoft | `5.7.25` | `must have a reverse DNS record` | policy | The sending IPv6 address has no reverse DNS record. |
| Microsoft | `5.7.57` | `Client was not authenticated to send anonymous mail during MAIL FROM` | policy | A device or app relaying through smtp.office365.com is not set up correctly. |
| Microsoft | `5.7.64` | `TenantAttribution; Relay Access Denied` | policy | The inbound connector from your on-premises system no longer matches. |
| Microsoft | `5.7.124` | `Sender not in allowed-senders list` | policy | You are not on the group's allowed-senders list. |
| Microsoft | `5.7.133` | `Sender not authenticated for group` | policy | The group rejects mail from outside its organization. |
| Microsoft | `5.7.134` | `Sender was not authenticated for mailbox` | policy | The mailbox rejects mail from outside its organization. |
| Microsoft | `5.7.135` | `Sender was not authenticated for public folder` | policy | The public folder rejects mail from outside its organization. |
| Microsoft | `5.7.136` | `Sender was not authenticated` | policy | The mail user rejects mail from outside its organization. |
| Microsoft | `5.7.232` | `trial tenant has exceeded its daily limit` | policy | The trial tenant passed its daily external recipient limit. |
| Microsoft | `5.7.233` | `tenant exceeded its daily limit for sending email to external recipients` | policy | The tenant passed its daily external recipient limit. |
| Microsoft | `5.7.236` | `onmicrosoft.com domains` | policy | Sending from an onmicrosoft.com domain is limited to 100 external recipients a day. |
| Microsoft | `5.7.321` | `starttls-not-supported` | policy | The destination server does not complete STARTTLS. |
| Microsoft | `5.7.322` | `certificate-expired` | policy | The destination server's certificate has expired. |
| Microsoft | `5.7.323` | `tlsa-invalid` | policy | The domain failed DANE validation. |
| Microsoft | `5.7.324` | `dnssec-invalid` | policy | The destination domain's DNSSEC records could not be verified. |
| Microsoft | `5.7.325` | `certificate-host-mismatch` | policy | The destination certificate does not match the host name (DANE). |
| Microsoft | `5.7.367` | `Remote server returned not permitted to relay` | policy | SPF or DKIM failed on forwarded or relayed mail. |
| Microsoft | `5.7.501` | `spam abuse detected` | block | The sending account was banned for spam. |
| Microsoft | `5.7.502` | `Access denied, banned sender` | block | The sending account was banned for spam. |
| Microsoft | `5.7.503` | `Access denied, banned sender` | block | The sending account was banned for spam. |
| Microsoft | `5.7.504` | `Recipient address rejected: Access denied` | hard | The recipient address is not valid. |
| Microsoft | `5.7.505` | `Access denied, banned recipient` | hard | The recipient is not valid. |
| Microsoft | `5.7.506` | `Access Denied, Bad HELO` | policy | Your server introduced itself (HELO) as the receiving server. |
| Microsoft | `5.7.507` | `Access denied, rejected by recipient` | block | The recipient's organization blocked your sending IP. |
| Microsoft | `5.7.508` | `has exceeded permitted limits within` | block | Your IPv6 range sent too much mail too fast. |
| Microsoft | `5.7.509` | `does not pass DMARC verification and has a DMARC policy of reject` | policy | The From domain failed DMARC and its policy is reject. |
| Microsoft | `5.7.510` | `does not accept email over IPv6` | policy | The recipient does not accept mail over IPv6. |
| Microsoft | `5.7.511` | `Access denied, banned sender` | block | Your sending IP is banned. |
| Microsoft | `5.7.512` | `must be RFC 5322 section 3.6.2 compliant` | policy | The message has no valid From address. |
| Microsoft | `5.7.513` | `using Customer Block list` | block | The recipient domain added your IP to its own block list. |
| Microsoft | `550 5.7.515` | `does not meet the required authentication level` | policy | Outlook.com rejected mail from a domain sending over 5,000 messages a day that does not meet its SPF, DKIM and DMARC requirements. |
| Microsoft | `5.7.520` | `does not allow external forwarding` | policy | The sender's organization blocks automatic external forwarding. |
| Microsoft | `5.7.606-649` | `banned sending IP` | block | The sending IP is banned. |
| Microsoft | `5.7.703` | `Tenant Allow Block List` | policy | Your own organization blocked the recipient in its Tenant Allow/Block List. |
| Microsoft | `5.7.705` | `tenant has exceeded threshold` | block | Most traffic from the tenant looked suspicious, so its sending is banned. |
| Microsoft | `5.7.708` | `traffic not accepted from this IP` | block | Microsoft does not accept traffic from this IP (reputation). |
| Microsoft | `5.7.750` | `Client blocked from sending from unregistered domains` | block | Too much mail from domains not added to the tenant. |
| Microsoft | `5.7.800` | `Access denied, banned sender` | block | The sender domain was banned for spam. |
| Microsoft | `550 5.7.240` | `application is not allowed for use with an HVE account` | policy | A High Volume Email restriction refused the message. |

## Block or policy: the difference

- Policy: your setup breaks a rule you can check and fix yourself (SPF, DKIM, DMARC, TLS, PTR, header format, relay credentials).
- Block: the receiver judges the sender (IP or domain reputation, spam-like content, unusual volume). You fix it by sending better, more slowly, to people who asked.
- Neither says anything about the address, so neither should suppress it.

- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)
- [Microsoft Tech Community: Outlook's new requirements for high-volume senders (updated April 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What does 5.7.1 mean?

IANA X.7.1 is "Delivery not authorized, message refused": the sender is not allowed to send to the destination. It covers both policy rules and reputation blocks, so the text after the code decides.

### Should I remove an address after a 5.7.x bounce?

Almost never: of the 108 X.7 texts Gmail and Microsoft publish, 2 mean the address is bad. They are about the sender: 77 policy and 25 block.

## Related

- [Gmail 550 5.7.26](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/550-5-7-26/)
- [Microsoft 550 5.7.515](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-7-515/)
- [Every provider text](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/provider-strings/)
- [Reputation data: Postmaster Tools and SNDS](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/postmaster-tools/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/5-7-codes/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/5-7-codes.csv
