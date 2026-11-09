# Subdomains and parked domains

A domain that never sends mail should publish the SPF record v=spf1 -all and the DMARC record v=DMARC1; p=reject (Microsoft's parked-domain guidance); under RFC 9989, sp= sets the policy for existing subdomains and np= for non-existent ones, each falling back to p= when absent, so any report you get for a parked domain is mail someone else sent in its name.

## Records for a domain that sends nothing

```dns
example.net         TXT  "v=spf1 -all"
_dmarc.example.net  TXT  "v=DMARC1; p=reject;"
```

Microsoft adds that rua and ruf are arguably not needed for a parked domain, because no valid mail should ever come from it; keep rua if you want to see who is trying.

## sp= and np=

From RFC 9989 section 4.7.

| Tag | Applies to | If absent |
| --- | --- | --- |
| `p` | The domain and its subdomains, unless sp or np says otherwise | Treated as p=none |
| `sp` | Existing subdomains of the organizational domain | p applies |
| `np` | Non-existent subdomains (names with no DNS records) | sp applies, or p if there is no sp |
| `t` | Test mode: y applies one level below the policy | n |

## Common mistakes

- Leaving a parked domain with no DMARC record at all, or with p=none for good.
- Forgetting subdomains: each subdomain needs its own SPF record, while DMARC policy is inherited (Microsoft).
- Leaving a permissive SPF record (+all or ?all) on a domain that sends nothing.
- Forgetting the \*.onmicrosoft.com domain in Microsoft 365 if you do not send from it.

## A checklist for every non-sending domain

- SPF: v=spf1 -all.
- DMARC: v=DMARC1; p=reject; (add sp=reject only if you want it explicit).
- No MX record if it receives no mail either.
- Read any reports that arrive: every message in them is someone else using your name.

## Sources

- [RFC 9989: DMARC (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9989.html)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)
- [Microsoft Learn: Set up SPF (parked domains scenario), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Related

- [From p=none to p=reject](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/none-to-reject-timeline/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/subdomains-and-parked-domains/  
Data as of: 2026-11-08
