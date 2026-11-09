# Microsoft bounce codes and what they mean

Of the 86 Microsoft texts this tool matches (Email non-delivery reports and SMTP errors in Exchange Online, updated August 24, 2026), 71 are block or policy rejections about the sender and only 8 mean the address is bad (8 hard, 7 soft, 15 block, 56 policy).

- Texts matched: 86
- Mean the address is bad: 8

## Classify a Microsoft bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=432+4.3.2+recipient+thread+limit+exceeded&run=1&provider=microsoft)

## Microsoft codes with their own page

- [Microsoft 550 5.1.10](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-1-10/): Microsoft's SMTP address lookup did not find the recipient.
- [Microsoft 550 5.7.708](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-7-708/): Microsoft does not accept traffic from this IP (reputation).
- [Microsoft 550 5.7.515](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-7-515/): Outlook.com rejected mail from a domain sending over 5,000 messages a day that does not meet its SPF, DKIM and DMARC requirements.
- [Microsoft 5.4.8](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-4-8/): The destination MX host is not listed in the domain's MTA-STS policy.
- [Microsoft 5.7.5](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-5/): The destination server's certificate failed the domain's MTA-STS check.
- [Microsoft 5.7.509](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-509/): The From domain failed DMARC and its policy is reject.
- [Microsoft 5.7.511](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-511/): Your sending IP is banned.
- [Microsoft 5.7.606-649](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-606/): The sending IP is banned.
- [Microsoft 5.7.513](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-513/): The recipient domain added your IP to its own block list.
- [Microsoft 5.7.507](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-507/): The recipient's organization blocked your sending IP.
- [Microsoft 5.7.501](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-501/): The sending account was banned for spam.
- [Microsoft 5.1.8](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-1-8/): The sending account was blocked for sending spam (often a compromised account).
- [Microsoft 5.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-2-2/): The sender passed Microsoft's recipient or message rate limit.
- [Microsoft 5.7.57](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-57/): A device or app relaying through smtp.office365.com is not set up correctly.
- [Microsoft 5.7.12](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-12/): The recipient accepts mail only from inside its organization.
- [Microsoft 5.7.134](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-134/): The mailbox rejects mail from outside its organization.
- [Microsoft 5.7.124](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-124/): You are not on the group's allowed-senders list.
- [Microsoft 5.7.750](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-750/): Too much mail from domains not added to the tenant.
- [Microsoft 5.7.705](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-705/): Most traffic from the tenant looked suspicious, so its sending is banned.
- [Microsoft 5.7.367](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-367/): SPF or DKIM failed on forwarded or relayed mail.
- [Microsoft 5.4.14](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-4-14/): A configuration error caused a mail loop in Exchange Online.
- [Microsoft 4.7.500-699](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/4-7-500/): Microsoft saw suspicious activity and temporarily restricted sending.
- [Microsoft 5.7.520](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-520/): The sender's organization blocks automatic external forwarding.
- [Microsoft 5.7.512](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-512/): The message has no valid From address.
- [Microsoft 5.7.133](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/5-7-133/): The group rejects mail from outside its organization.

## Common codes Microsoft also uses

- [550 5.1.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-1-1/)
- [550 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1/)
- [554 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-7-1/)
- [550 5.4.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-1/)
- [552 5.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-2-2/)
- [452 4.5.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-5-3/)
- [554 5.4.6](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-4-6/)
- [550 5.7.23](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-23/)
- [550 5.7.25](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-25/)
- [550 5.1.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-1-0/)
- [556 5.1.10](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/556-5-1-10/)

## Every Microsoft text

Email non-delivery reports and SMTP errors in Exchange Online, updated August 24, 2026; read November 8, 2026. Meanings are paraphrased.

| Provider | Code | Published text | Verdict | Meaning |
| --- | --- | --- | --- | --- |
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

- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)
- [Microsoft Learn: Enhancing mail flow with MTA-STS (dated July 21, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/exchange/security-and-compliance/enhance-mail-flow-using-strict-transport-security)
- [Microsoft Tech Community: Outlook's new requirements for high-volume senders (updated April 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)
- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### How many Microsoft bounce texts mean the address is bad?

8 of the 86 this tool matches; the other 78 are soft (7), block (15) or policy (56).

## Related

- [All provider texts in one table](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/provider-strings/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)
- [Gmail bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/)
- [Yahoo bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/yahoo/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/  
Data as of: 2026-11-08
