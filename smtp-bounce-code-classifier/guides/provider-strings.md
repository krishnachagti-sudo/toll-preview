# Provider bounce strings, dated

This classifier matches 171 published bounce texts (Gmail 79, Microsoft 87, Yahoo 3, Postfix 2), read November 8, 2026: 16 mean the address is bad, 18 are soft, 28 blocks and 109 policy rejections.

- Texts: 171

## Classify against all of them

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## Every text

Short phrases from each provider's page; meanings paraphrased. Verdicts are this tool's rules.

| Provider | Code | Published text | Verdict | Meaning |
| --- | --- | --- | --- | --- |
| Gmail | `450 4.2.1` | `receiving email too quickly` | soft | The Gmail recipient is getting mail faster than Gmail lets one mailbox receive it. |
| Gmail | `450 4.2.1` | `Peak SMTP relay limit exceeded` | policy | Your Google Workspace account hit its peak SMTP relay limit. |
| Gmail | `452 4.2.2` | `inbox is out of storage space. Please` | soft | The Gmail mailbox is full. |
| Gmail | `451 4.3.0` | `Email server has temporarily rejected this message` | soft | Gmail rejected the message for a temporary reason. |
| Gmail | `451 4.3.0` | `Multiple destination domains per transaction is unsupported` | policy | Gmail does not accept recipients in several domains in one SMTP transaction. |
| Gmail | `421 4.3.0` | `Temporary System Problem` | soft | A temporary problem on Gmail's side. |
| Gmail | `451 4.4.2` | `Timeout - closing connection` | soft | The connection timed out. |
| Gmail | `421 4.4.5` | `Server busy, try again later` | soft | Gmail's server was busy. |
| Gmail | `451 4.5.0` | `SMTP protocol violation` | policy | Your server broke the SMTP protocol (RFC 5321). |
| Gmail | `452 4.5.3` | `Domain policy size per transaction exceeded` | policy | Too many recipients in one transaction for Gmail's limits. |
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
| Gmail | `550 5.1.1` | `email account that you tried to reach does not exist` | hard | The Gmail address does not exist. |
| Gmail | `553 5.1.2` | `weren't able to find the recipient domain` | hard | The recipient domain could not be found. |
| Gmail | `553 5.1.3` | `is not a valid RFC 5321 address` | hard | The recipient address is not a valid address. |
| Gmail | `553 5.1.7` | `The sender address` | policy | Your sender address is not a valid address. |
| Gmail | `550 5.2.1` | `email account that you tried to reach is inactive` | hard | The Gmail account is inactive. |
| Gmail | `550 5.2.1` | `receiving email at a rate that prevents` | soft | The Gmail recipient is getting mail too fast. |
| Gmail | `552 5.2.2` | `out of storage space and inactive` | hard | The Gmail mailbox is full and the account is inactive. |
| Gmail | `552 5.3.4` | `exceeded Google's message size limits` | policy | The message, its attachments or its headers are over Gmail's size limits. |
| Gmail | `550 5.4.5` | `Daily user sending limit exceeded` | policy | Your Google account reached its daily sending or relay limit. |
| Gmail | `554 5.4.6` | `Message exceeded 50 hops` | policy | The message passed through more than 50 hops: probably a mail loop. |
| Gmail | `5.5.1` | `Bad sequence of commands` | policy | Your server sent SMTP commands Gmail did not expect. |
| Gmail | `5.5.2` | `Syntax error, cannot decode response` | policy | Gmail could not parse a command from your server. |
| Gmail | `550 5.5.3` | `Too many recipients for this sender` | policy | Too many recipients for this sender. |
| Gmail | `501 5.5.4` | `HELO/EHLO argument` | policy | Your server's HELO/EHLO name is invalid or empty. |
| Gmail | `554 5.6.0` | `Email message is malformed` | policy | The message is malformed (RFC 5322). |
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
| Microsoft | `432 4.3.2` | `recipient thread limit exceeded` | soft | The recipient mailbox is throttled because it is receiving too much mail too fast. |
| Microsoft | `4.4.7` | `Message expired` | soft | The message expired in the queue before it could be delivered. |
| Microsoft | `4.4.8` | `failed MTA-STS validation` | policy | The destination MX host is not listed in the domain's MTA-STS policy. |
| Microsoft | `4.4.316` | `Connection refused` | soft | Every connection attempt to the external server was refused. |
| Microsoft | `450 4.4.317` | `Message=UntrustedRoot` | policy | The remote server sent a certificate without its full chain. |
| Microsoft | `4.5.3` | `Too many recipients` | policy | More than 200 envelope recipients from the same domain in one message. |
| Microsoft | `4.7.5` | `Remote certificate failed MTA-STS validation` | policy | The destination server's certificate failed the domain's MTA-STS check. |
| Microsoft | `4.7.26` | `must pass either SPF or DKIM validation` | policy | Mail sent over IPv6 must pass SPF or DKIM. |
| Microsoft | `4.7.321` | `starttls-not-supported` | policy | The destination server does not complete STARTTLS. |
| Microsoft | `4.7.322` | `certificate-expired` | policy | The destination server's certificate has expired. |
| Microsoft | `4.7.323` | `tlsa-invalid` | policy | The domain failed DANE validation. |
| Microsoft | `4.7.324` | `dnssec-invalid` | policy | The destination domain's DNSSEC records could not be verified. |
| Microsoft | `4.7.325` | `certificate-host-mismatch` | policy | The destination certificate does not match the host name (DANE). |
| Microsoft | `4.7.500-699` | `Access denied, please try again later` | block | Microsoft saw suspicious activity and temporarily restricted sending. |
| Microsoft | `4.7.850-899` | `Access denied, please try again later` | block | Microsoft temporarily restricted the sending IP after suspicious activity. |
| Microsoft | `5.0.350` | `x-dg-ref header is too long` | policy | A generic error from the recipient's organization, or a policy violation it detected. |
| Microsoft | `5.1.0` | `Sender denied` | hard | The recipient address could not be resolved as written. |
| Microsoft | `5.1.1` | `Bad destination mailbox address` | hard | The recipient address does not exist in the destination system. |
| Microsoft | `5.1.8` | `bad outbound sender` | block | The sending account was blocked for sending spam (often a compromised account). |
| Microsoft | `5.1.10` | `Recipient not found` | hard | Microsoft's SMTP address lookup did not find the recipient. |
| Microsoft | `550 5.1.20` | `Multiple From addresses are not allowed without Sender address` | policy | Several From addresses but no Sender header. |
| Microsoft | `5.1.90` | `you've reached your daily limit for message recipients` | policy | The sending account passed its daily recipient limit. |
| Microsoft | `5.2.2` | `Submission quota exceeded` | policy | The sender passed Microsoft's recipient or message rate limit. |
| Microsoft | `5.2.121` | `per hour message receive limit from specific sender exceeded` | soft | You sent more messages per hour to this recipient than Exchange Online accepts. |
| Microsoft | `5.2.122` | `per hour message receive limit exceeded` | soft | The recipient received more messages this hour than Exchange Online accepts. |
| Microsoft | `5.3.190` | `Journaling on-premises messages` | policy | Journaling to Microsoft 365 is not enabled for this organization. |
| Microsoft | `5.4.1` | `Recipient address rejected: Access denied` | hard | The recipient address does not exist (Directory Based Edge Blocking). |
| Microsoft | `5.4.6` | `Routing loop detected` | policy | A configuration error caused a mail loop. |
| Microsoft | `5.4.14` | `Routing loop detected` | policy | A configuration error caused a mail loop in Exchange Online. |
| Microsoft | `5.4.8` | `failed MTA-STS validation` | policy | The destination MX host is not listed in the domain's MTA-STS policy. |
| Microsoft | `5.4.300` | `Message expired` | soft | The message was not delivered in time. |
| Microsoft | `5.5.0` | `Requested action not taken: mailbox unavailable` | hard | The @hotmail.com or @outlook.com address was not found. |
| Microsoft | `5.6.11` | `Invalid characters` | policy | Your mail program added bare line feeds to the message. |
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
| Microsoft | `421 4.3.240` | `maximum number of concurrent server connections` | soft | Too many simultaneous authenticated connections (limit 250). |
| Microsoft | `450 4.4.244` | `HVE message can't be submitted` | policy | High Volume Email recipient rate limit reached. |
| Microsoft | `535` | `XOAUTH2 authentication failed` | policy | OAuth authentication for High Volume Email failed. |
| Microsoft | `550 5.1.241` | `recipient is an HVE account` | hard | The recipient is a send-only High Volume Email account. |
| Microsoft | `550 5.2.240` | `not set up properly for the HVE service` | policy | The sending account is not set up for High Volume Email. |
| Microsoft | `550 5.2.241` | `not properly set up for billing` | policy | The HVE account has no billing policy. |
| Microsoft | `550 5.6.240` | `One of MIME Headers is not allowed` | policy | A MIME header is not allowed. |
| Microsoft | `550 5.6.241` | `Mandatory From Header is missing or invalid` | policy | The From header is missing or invalid. |
| Microsoft | `550 5.7.240` | `application is not allowed for use with an HVE account` | policy | A High Volume Email restriction refused the message. |
| Yahoo | `554` | `doesn't have a yahoo.com account` | hard | The Yahoo account does not exist. |
| Yahoo | `(any)` | a TS error code such as \[TS01\] | block | Yahoo temporarily deferred the message (TS errors): complaints, spam-like content, poor IP reputation or unusual traffic. |
| Yahoo | `(any)` | a PH error code such as \[PH01\] | block | Yahoo refused the message for its content (PH errors: viruses, phishing, malicious links). |
| Postfix | `(any)` | `User unknown in local recipient table` | hard | Postfix has no such recipient in its lookup table (local\_recipient\_maps or similar). |
| Postfix | `(any)` | `Recipient address rejected: User unknown` | hard | The receiving Postfix server does not know the recipient. |
| Microsoft | `5.4.1` | `Relay Access Denied` | policy | The receiving server is not a destination or relay for that domain (often a wrong MX or a missing relay permission). |

A text matches when its phrase appears in the reply (ignoring case) and the reply's codes fit the codes the provider lists with it. The page checks each provider's source daily and the rules are re-dated when one changes.

- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)
- [Microsoft Learn: Enhancing mail flow with MTA-STS (dated July 21, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/exchange/security-and-compliance/enhance-mail-flow-using-strict-transport-security)
- [Microsoft Tech Community: Outlook's new requirements for high-volume senders (updated April 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)
- [Yahoo Sender Hub: SMTP error codes, read November 8, 2026](https://senders.yahooinc.com/smtp-error-codes/)
- [Postfix: postconf(5) configuration parameters, read November 8, 2026](https://www.postfix.org/postconf.5.html)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### Where do these texts come from?

Each provider's own page: Gmail's SMTP errors and codes (last updated October 26, 2026), Microsoft's Exchange Online NDR table (dated August 24, 2026) and MTA-STS page, Microsoft's Outlook.com high-volume sender post, Yahoo's Sender Hub error codes and Postfix's postconf(5), all read November 8, 2026.

## Related

- [Gmail bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/)
- [Microsoft bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/)
- [Yahoo bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/yahoo/)
- [5.7.x codes decoded](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/5-7-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/provider-strings/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/provider-strings.csv
