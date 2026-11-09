# Do I need a PTR record to send email?

Yes: Gmail requires valid forward and reverse DNS for sending IPs ("The sending IP address must match the IP address of the hostname specified in the Pointer (PTR) record"), Yahoo requires a valid forward and reverse DNS record for every sending IP, and Outlook.com says email servers must have valid reverse DNS; in the worked examples 203.0.113.10 has PTR mail.example.com, and mail.example.com resolves back to 203.0.113.10 (forward-confirmed), while 192.0.2.44 has PTR 192-0-2-44.dynamic.example.net, but that name does not resolve back to 192.0.2.44.

## Check the PTR of the server that sent your message

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

## Forward-confirmed reverse DNS

- Reverse: the IP's PTR record names a host (203.0.113.10 -\> mail.example.com).
- Forward: that host's A or AAAA record lists the same IP (mail.example.com -\> 203.0.113.10).
- Both must hold. Google adds that an IPv6 sending IP needs an IPv6 PTR record.

Yahoo also asks for "valid, meaningful, non-generic" PTR names that reflect your domain, not names that look dynamically assigned (a recommendation).

- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Google Workspace: Gmail SMTP errors and codes (last updated 2026-10-26), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Yahoo Sender Hub: Sender Requirements & Recommendations, read November 8, 2026](https://senders.yahooinc.com/best-practices/)
- [Outlook.com Postmaster: Policies, Practices, and Guidelines, read November 8, 2026](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Meeting every rule does not guarantee the inbox; spam rate, volume and unsubscribe handling cannot be judged from one message.

## Questions

### Who sets the PTR record?

Whoever owns the IP address: your email service or hosting company, not your domain's DNS host. Ask them to set it to a name whose A or AAAA record points back to the IP.

### What Gmail error means a PTR problem?

Google lists 451 4.7.23 (rate limited) and 550 5.7.25 (blocked): the sending IP has no PTR record, or its forward DNS entry does not match the sending IP.

## Related

- [Gmail's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)
- [Yahoo's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/yahoo/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/ptr-reverse-dns/  
Data as of: 2026-11-08
