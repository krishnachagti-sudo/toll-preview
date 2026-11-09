# Get the raw message in Gmail

In Gmail on the web, open the message, click More next to Reply, choose Show original, then Copy to clipboard: paste that into the checker to grade it against Gmail's 13 bulk-sender rules and Yahoo's and Outlook.com's.

## Then check it

[Show a worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=compliant)

## What to look for

Send the message to a Gmail address you own and use the copy that arrived: it carries Gmail's own SPF, DKIM and DMARC results (Authentication-Results: mx.google.com).

```
Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com header.s=s2026 header.b=QfKQJFCl;
       spf=pass (google.com: domain of bounces@example.com designates 203.0.113.10 as permitted sender) smtp.mailfrom=bounces@example.com;
       dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=example.com
```

That is the receiver's line from the worked example "A compliant newsletter received by Gmail". [How to read it](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/read-email-headers-spf-dkim-dmarc/).

- [Gmail Help: Trace an email with its full header, read November 8, 2026](https://support.google.com/mail/answer/29436?hl=en)

## Steps

1. **Open Gmail in a browser.** From a browser, open Gmail and the message you want to check.
2. **Show original.** Next to Reply, click More, then Show original. The full header opens in a new window.
3. **Copy it.** Click Copy to clipboard.
4. **Check it.** Paste it into the bulk sender check.

## Related

- [Read SPF, DKIM and DMARC in the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/read-email-headers-spf-dkim-dmarc/)
- [Outlook: get the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/outlook/)
- [New Outlook: get the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/new-outlook/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/gmail/  
Data as of: 2026-11-08
