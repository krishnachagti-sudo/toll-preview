# Find the service behind an IP

Match the source\_ip against the ranges each sending provider publishes in its own SPF record, then check the DKIM d= and SPF domains in the same record: 54.240.8.17 is inside 54.240.0.0/18, so it is Amazon SES; an IP only inside AWS or Google Cloud's published ranges is a rented server there, which says where the mail came from but not who sent it.

## Name IPs from your report

[Name these IPs](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?ips=54.240.8.17+149.72.134.20+35.174.145.124)

## Three IPs, named

| IP | Service | Confidence | Evidence |
| --- | --- | --- | --- |
| `54.240.8.17` | Amazon SES | high | 54.240.8.17 is inside 54.240.0.0/18, which Amazon SES publishes in its SPF record |
| `149.72.134.20` | HubSpot | high | 149.72.134.20 is inside 149.72.0.0/16, which HubSpot publishes in its SPF record |
| `35.174.145.124` | A server at Amazon Web Services (EC2) | hosting | 35.174.145.124 is inside 35.160.0.0/12, which Amazon Web Services (EC2) publishes as its own; anyone can rent a server there |

## What the analyzer can name

- 10 sending providers by their published SPF ranges, measured November 7, 2026: Google Workspace, Microsoft 365, Microsoft 365 GCC High and DoD, Microsoft 365 operated by 21Vianet, Amazon SES, Zendesk, HubSpot, Postmark, Zoho Mail, Zoho (several Zoho services).
- 6 signing or bounce domains that providers document: Microsoft 365 (onmicrosoft.com); Amazon SES (amazonses.com); SendGrid (Twilio) (sendgrid.net); Mailgun (mailgun.org); Postmark (mtasv.net); Zendesk (zendesk.com).
- Amazon Web Services (EC2) (2,665 ranges, syncToken 1794080825, created 2026-11-07-19-47-05) and Google Cloud (495 ranges, syncToken 1794082896919, created 2026-11-07T12:21:36.919497), as hosting only.
- Nothing else is guessed: no reverse DNS or ASN lookups are made, so an IP outside these lists is "not named".

## Why naming can be uncertain

- One range can be published by several providers (shared infrastructure): the analyzer then names all of them and says "shared".
- A signature for a provider's domain names who signed, which is usually who sent.
- A cloud server can be anyone's: a forwarder, a CRM, or a spoofer.

## Sources

- [Sending providers' SPF records, measured November 7, 2026 (the SPF lookup counter's data)](https://conyso.com/endwise/spf-lookup-counter/)
- [AWS IP address ranges (ip-ranges.json, EC2), read November 8, 2026](https://docs.aws.amazon.com/vpc/latest/userguide/aws-ip-ranges.html)
- [Google Cloud IP ranges (cloud.json), read November 8, 2026](https://cloud.google.com/compute/docs/faq#find_ip_range)
- [Microsoft 365: Mail from the initial \*.onmicrosoft.com domain is DKIM-signed with that domain automatically. (read November 8, 2026)](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dkim-configure)
- [Amazon SES: Messages sent through SES use a subdomain of amazonses.com as the default MAIL FROM domain. (read November 8, 2026)](https://docs.aws.amazon.com/ses/latest/dg/mail-from.html)
- [SendGrid (Twilio): Domain authentication points CNAME records at \[u00000000\].\[wl000\].sendgrid.net; SPF include is sendgrid.net. (read November 8, 2026)](https://www.twilio.com/docs/sendgrid/ui/account-and-settings/how-to-set-up-domain-authentication)
- [Mailgun: SPF include is mailgun.org; unverified domains show "sent via Mailgun.org". (read November 8, 2026)](https://documentation.mailgun.com/docs/mailgun/user-manual/domains/domains-verify)
- [Postmark: The default Return-Path is pm\_bounces@pm.mtasv.net. (read November 8, 2026)](https://postmarkapp.com/support/article/910-adding-a-custom-return-path-domain)
- [Zendesk: Without a custom domain, notifications are sent from a zendesk.com address. (read November 8, 2026)](https://support.zendesk.com/hc/en-us/articles/4408832543770)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Steps

1. **Check published ranges.** Look the IP up in the ip4: and ip6: ranges of the SPF records your services publish (Google, Microsoft, Amazon SES, HubSpot, Zendesk, Postmark, Zoho and others).
2. **Check the signing domain.** In auth\_results, a passing DKIM signature names who signed: d=amazonses.com is Amazon SES, d=\<tenant\>.onmicrosoft.com is Microsoft 365.
3. **Check the bounce domain.** The SPF domain (envelope\_from) is the service's bounce domain when you have not set a custom one, such as a subdomain of amazonses.com.
4. **Check cloud ranges.** AWS and Google Cloud publish their ranges; an IP there is a rented server, so look at the signatures before deciding.
5. **Decide and fix.** If it is yours, add the service's SPF include and turn on its DKIM signing for your domain; if not, it may be spoofing or a forwarder, which your DMARC policy handles.

## Related

- [SPF pass but DMARC fail](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/spf-pass-dmarc-fail/)
- [Forwarding and mailing lists](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/forwarding-mailing-lists/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/find-sender-from-ip/  
Data as of: 2026-11-08
