# From p=none to p=reject

Move from p=none to p=quarantine and then p=reject only once your reports show every legitimate sender passing DMARC aligned; in the sample, 4 sources still fail (Amazon SES, Unnamed (203.0.113.9), Unnamed (192.0.2.44), A server at Amazon Web Services (EC2) (35.174.145.124)), so the domain should stay at p=none until Amazon SES is aligned and the rest are confirmed as not yours. Microsoft advises moving gradually, none to quarantine to reject.

## Check where you stand

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What changed in May 2026

- RFC 9989 removed the pct tag (Appendix A.6): operational experience showed it was usually not applied as a percentage.
- Its replacement for testing is t=y: receivers apply one level below your policy (quarantine is treated as none, reject as quarantine) while you test.
- Microsoft's guide (updated July 17, 2026) still shows pct=10, 25, 50, 75, 100 as steps; receivers that follow RFC 9989 ignore pct.

## The sample: what still fails

| Source | IPs | Messages | Failed | Why |
| --- | --- | ---: | ---: | --- |
| Amazon SES | 54.240.8.17 | 57 | 57 | DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns. |
| Unnamed (203.0.113.9) | 203.0.113.9 | 23 | 23 | The mail was not DKIM-signed, and SPF softfail for example.com: this IP is not authorized to send as example.com. |
| Unnamed (192.0.2.44) | 192.0.2.44 | 6 | 6 | A DKIM signature for example.com did not verify (fail), and SPF did not pass for example.com. The message was probably changed on the way (forwarding, a mailing list, a security gateway) or the published key does not match. The receiver gave a reason: local\_policy: the receiver's own policy exempted it ("arc=pass"). |
| A server at Amazon Web Services (EC2) (35.174.145.124) | 35.174.145.124 | 4 | 4 | The mail was not DKIM-signed, and SPF fail for example.com: this IP is not authorized to send as example.com. |

## Sources

- [RFC 9989: DMARC (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9989.html)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)
- [Microsoft Tech Community: Outlook's new requirements for high-volume senders (posted April 2, 2025, updated April 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Steps

1. **Publish p=none with rua.** v=DMARC1; p=none; rua=mailto:\<address\>. Collect reports for a few weeks so every sender shows up.
2. **Inventory every sender.** Read the reports by source: each named service must pass aligned DKIM (best) or aligned SPF.
3. **Fix the failing services.** Turn on custom DKIM and a custom bounce domain at each service; leave forwarders and unknown IPs alone.
4. **Quarantine, then reject.** Move to p=quarantine and watch the reports; under RFC 9989 you can add t=y to have receivers apply one step less while you test. Then p=reject.
5. **Keep reading reports.** A new service someone signs up for will show up as a failing source before customers notice.

## Related

- [Parked domains and sp=](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/subdomains-and-parked-domains/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/none-to-reject-timeline/  
Data as of: 2026-11-08
