# A DMARC report example, parsed

This report from google.com covers 2026-11-06 (UTC) for example.com: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns. (A made-up report for example.com in Google's format; the IPs are inside each named provider's published ranges.)

## Open this example in the analyzer

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## The XML

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<feedback>
  <version>1.0</version>
  <report_metadata>
    <org_name>google.com</org_name>
    <email>noreply-dmarc-support@google.com</email>
    <extra_contact_info>https://support.google.com/a/answer/2466580</extra_contact_info>
    <report_id>7212384403927146551</report_id>
    <date_range>
      <begin>1793923200</begin>
      <end>1794009599</end>
    </date_range>
  </report_metadata>
  <policy_published>
    <domain>example.com</domain>
    <adkim>r</adkim>
    <aspf>r</aspf>
    <p>none</p>
    <sp>none</sp>
    <pct>100</pct>
    <np>none</np>
  </policy_published>
  <record>
    <row>
      <source_ip>209.85.220.41</source_ip>
      <count>412</count>
      <policy_evaluated>
        <disposition>none</disposition>
        <dkim>pass</dkim>
        <spf>pass</spf>
      </policy_evaluated>
    </row>
    <identifiers>
      <header_from>example.com</header_from>
    </identifiers>
    <auth_results>
      <dkim>
        <domain>example.com</domain>
        <selector>google</selector>
        <result>pass</result>
      </dkim>
      <spf>
        <domain>example.com</domain>
        <result>pass</result>
      </spf>
    </auth_results>
  </record>
  <record>
    <row>
      <source_ip>40.107.22.55</source_ip>
      <count>130</count>
      <policy_evaluated>
        <disposition>none</disposition>
        <dkim>pass</dkim>
        <spf>pass</spf>
      </policy_evaluated>
    </row>
    <identifiers>
      <header_from>example.com</header_from>
    </identifiers>
  ...
```

## Every record, parsed

| IP | Source | Count | Disposition | DKIM aligned | SPF aligned | DKIM raw | SPF raw | Reason |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| 54.240.8.17 | Amazon SES | 57 | none | fail | fail | amazonses.com pass | us-east-1.amazonses.com pass | third-party-not-aligned |
| 203.0.113.9 | Unnamed (203.0.113.9) | 23 | none | fail | fail | none | example.com softfail | no-dkim |
| 192.0.2.44 | Unnamed (192.0.2.44) | 6 | none | fail | fail | example.com fail | lists.example.org none | dkim-broken |
| 35.174.145.124 | A server at Amazon Web Services (EC2) (35.174.145.124) | 4 | none | fail | fail | none | example.com fail | no-dkim |
| 209.85.220.41 | Google Workspace | 412 | none | pass | pass | example.com pass | example.com pass | pass-both |
| 40.107.22.55 | Microsoft 365 | 130 | none | pass | pass | example.com pass | example.com pass | pass-both |
| 149.72.134.20 | HubSpot | 38 | none | pass | fail | example.com pass | 1234567.hubspotemail.net pass | pass-dkim |

## By source

| Source | IPs | Messages | Failed | Why |
| --- | --- | ---: | ---: | --- |
| Amazon SES | 54.240.8.17 | 57 | 57 | DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns. |
| Unnamed (203.0.113.9) | 203.0.113.9 | 23 | 23 | The mail was not DKIM-signed, and SPF softfail for example.com: this IP is not authorized to send as example.com. |
| Unnamed (192.0.2.44) | 192.0.2.44 | 6 | 6 | A DKIM signature for example.com did not verify (fail), and SPF did not pass for example.com. The message was probably changed on the way (forwarding, a mailing list, a security gateway) or the published key does not match. The receiver gave a reason: local\_policy: the receiver's own policy exempted it ("arc=pass"). |
| A server at Amazon Web Services (EC2) (35.174.145.124) | 35.174.145.124 | 4 | 4 | The mail was not DKIM-signed, and SPF fail for example.com: this IP is not authorized to send as example.com. |
| Google Workspace | 209.85.220.41 | 412 | 0 | Passed DMARC. |
| Microsoft 365 | 40.107.22.55 | 130 | 0 | Passed DMARC. |
| HubSpot | 149.72.134.20 | 38 | 0 | Passed DMARC. |

## The same report under RFC 9990

RFC 9990 reports put everything in the namespace `urn:ietf:params:xml:ns:dmarc-2.0`, drop pct, and may add np, testing, discovery\_method and extensions; GMX already sends this format (see [reports from GMX](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/gmx/)). The analyzer reads both and gives the same answer.

## Sources

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [RFC 7489: DMARC (2015, now obsolete), Appendix C schema, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7489.txt)
- [Sending providers' SPF records, measured November 7, 2026 (the SPF lookup counter's data)](https://conyso.com/endwise/spf-lookup-counter/)
- [AWS IP address ranges (ip-ranges.json, EC2), read November 8, 2026](https://docs.aws.amazon.com/vpc/latest/userguide/aws-ip-ranges.html)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Related

- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)
- [The same mail in GMX's RFC 9990 format](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/gmx/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/dmarc-report-example/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/dmarc-report-example.csv
