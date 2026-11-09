# Gmail bounce codes and what they mean

Of the 79 Gmail texts this tool matches (Gmail SMTP errors and codes, updated October 26, 2026), 63 are block or policy rejections about the sender and only 5 mean the address is bad (5 hard, 11 soft, 11 block, 52 policy).

- Texts matched: 79
- Mean the address is bad: 5

## Classify a Gmail bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=450+4.2.1+receiving+email+too+quickly&run=1&provider=gmail)

## Gmail codes with their own page

- [Gmail 550 5.7.26](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/550-5-7-26/): The message passed neither SPF nor DKIM, and Gmail requires one of them.
- [Gmail 421 4.7.28](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-28/): Gmail sees an unusual rate of (unsolicited) mail from your IP, netblock, DKIM or SPF domain, or URL domain, and rate limits it.
- [Gmail 421 4.7.26](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-26/): The message passed neither SPF nor DKIM, so Gmail rate limits it.
- [Gmail 421 4.7.27](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-27/): SPF did not pass, so Gmail rate limits your bulk mail.
- [Gmail 421 4.7.29](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-29/): Gmail requires bulk senders to use TLS and the connection was not encrypted.
- [Gmail 421 4.7.30](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-30/): DKIM did not pass, so Gmail rate limits your bulk mail.
- [Gmail 421 4.7.32](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-32/): The From domain is not aligned with the domain that passed SPF or DKIM, so Gmail rate limits it.
- [Gmail 421 4.7.40](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-40/): Your sending domain has no DMARC record or no DMARC policy, so Gmail rate limits bulk mail.
- [Gmail 550 5.7.40](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/550-5-7-40/): Your sending domain has no DMARC record or no DMARC policy.
- [Gmail 451 4.7.23](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/451-4-7-23/): Your sending IP lacks a matching PTR record, so Gmail rate limits it.
- [Gmail 535 5.7.80](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/535-5-7-80/): The SMTP username or password was not accepted.
- [Gmail 534 5.7.90](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/534-5-7-90/): Google requires an app password or a browser sign-in.

## Common codes Gmail also uses

- [550 5.1.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-1-1/)
- [550 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1/)
- [421 4.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-7-0/)
- [452 4.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-2-2/)
- [552 5.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-2-2/)
- [550 5.2.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-2-1/)
- [553 5.1.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-2/)
- [553 5.1.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-3/)
- [450 4.2.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/450-4-2-1/)
- [451 4.3.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-3-0/)
- [421 4.3.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-3-0/)
- [451 4.4.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-4-2/)
- [421 4.4.5](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-4-5/)
- [452 4.5.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-5-3/)
- [552 5.3.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-3-4/)
- [550 5.4.5](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-5/)
- [554 5.4.6](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-4-6/)
- [503 5.5.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/503-5-5-1/)
- [501 5.5.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/501-5-5-4/)
- [554 5.6.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-6-0/)
- [550 5.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-0/)
- [530 5.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/530-5-7-0/)
- [552 5.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-7-0/)
- [550 5.7.24](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-24/)
- [550 5.7.25](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-25/)
- [550 5.7.27](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-27/)
- [550 5.7.28](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-28/)
- [550 5.7.29](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-29/)
- [550 5.7.30](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-30/)
- [553 5.1.7](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-7/)
- [550 5.5.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-5-3/)
- [451 4.7.24](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-7-24/)

## Every Gmail text

Gmail SMTP errors and codes, updated October 26, 2026; read November 8, 2026. Meanings are paraphrased.

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

- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### How many Gmail bounce texts mean the address is bad?

5 of the 79 this tool matches; the other 74 are soft (11), block (11) or policy (52).

## Related

- [All provider texts in one table](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/provider-strings/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)
- [Microsoft bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/)
- [Yahoo bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/yahoo/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/  
Data as of: 2026-11-08
