# What each provider's SPF include costs

As measured on November 7, 2026, 6 of these 10 provider includes cost 1 of your 10 SPF lookups (Amazon SES, Google Workspace, Microsoft 365, Microsoft 365 GCC High and DoD, Postmark, Zendesk); the dearest, Zoho's include:one.zoho.com, costs 4.

- Includes costing 1: 6
- Dearest (Zoho): 4
- Measured: November 7, 2026

## Count your own record

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## Lookup cost by provider

Measured November 7, 2026

| Provider | Include | Lookups | Left of 10 | Nested includes |
| --- | --- | ---: | ---: | --- |
| [Amazon SES (custom MAIL FROM domain)](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/amazon-ses/) | `include:amazonses.com` | 1 | 9 | none |
| [Google Workspace](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/google-workspace/) | `include:_spf.google.com` | 1 | 9 | none |
| [Microsoft 365](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365/) | `include:spf.protection.outlook.com` | 1 | 9 | none |
| [Microsoft 365 GCC High and DoD](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365-gcc-high/) | `include:spf.protection.office365.us` | 1 | 9 | none |
| [Postmark](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/postmark/) | `include:spf.mtasv.net` | 1 | 9 | none |
| [Zendesk](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zendesk/) | `include:mail.zendesk.com` | 1 | 9 | none |
| [HubSpot](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/hubspot/) | `include:shared.hubspot.com` | 2 | 8 | shared1.hubspot.com |
| [Microsoft 365 operated by 21Vianet](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365-21vianet/) | `include:spf.protection.partner.outlook.cn` | 2 | 8 | spfa.protection.partner.outlook.cn |
| [Zoho Mail](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zoho-mail/) | `include:zohomail.com` | 2 | 8 | spf.zohomail.com |
| [Zoho (several Zoho services)](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zoho-one/) | `include:one.zoho.com` | 4 | 6 | spf.zoho.com, zeptomail.net, zcsend.net |

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

An include costs 1 for itself plus every include, a, mx, ptr, exists and redirect inside the record it points at ([RFC 7208 Section 4.6.4](https://www.rfc-editor.org/rfc/rfc7208#section-4.6.4)). ip4 and ip6 ranges cost nothing, which is why a provider that lists its ranges directly costs exactly 1.

## Providers not listed

A provider is listed here only when its own setup page names the include to use and we could read that page. Mailchimp's domain authentication page asks for two CNAME records and a DMARC record, and does not ask for an SPF include. For any other provider, add its include to your record in the counter with "What if I add".

- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)
- [Google Workspace: SPF setup page, read November 7, 2026](https://knowledge.workspace.google.com/admin/security/set-up-spf)
- [Microsoft 365 operated by 21Vianet: SPF setup page, read November 7, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure)
- [Amazon SES: SPF setup page, read November 7, 2026](https://docs.aws.amazon.com/ses/latest/dg/mail-from.html)
- [Zendesk: SPF setup page, read November 7, 2026](https://support.zendesk.com/hc/en-us/articles/4408832543770)
- [HubSpot: SPF setup page, read November 7, 2026](https://knowledge.hubspot.com/marketing-email/manage-email-authentication-in-hubspot)
- [Postmark: SPF setup page, read November 7, 2026](https://postmarkapp.com/support/article/1092-how-do-i-set-up-spf-for-postmark)
- [Zoho: SPF setup page, read November 7, 2026](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does include:\_spf.google.com use?

One, as measured on November 7, 2026: include:\_spf.google.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges).

### How many SPF lookups does Microsoft 365 use?

include:spf.protection.outlook.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), as measured on November 7, 2026.

## Related

- [Google Workspace SPF include](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/google-workspace/)
- [Microsoft 365 SPF include](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365/)
- [Microsoft 365 GCC High and DoD SPF include](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365-gcc-high/)
- [Microsoft 365 operated by 21Vianet SPF include](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365-21vianet/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [Why two SPF checkers disagree](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/checkers-disagree/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/  
Data as of: 2026-11-07  
CSV: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs.csv
