# View email headers in Outlook

In classic Outlook for Windows, open the message in its own window and choose File, then Properties: the headers are in the Internet headers box; in Outlook on the web and Outlook.com, choose More actions, then View, then View message details; paste the headers into the checker to grade the message against Outlook.com's rules for domains sending more than 5,000 emails a day.

## Then check it

[Show a worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=one-click-missing)

## What to look for

These views give the headers without the body, so the checker verifies the DKIM signature over the headers but cannot check the body hash or the unsubscribe link in the body.

```
Authentication-Results: spf=pass (sender IP is 198.51.100.25)
 smtp.mailfrom=bounce.example.org; dkim=pass (signature was verified)
 header.d=example.org;dmarc=pass action=none
 header.from=example.org;compauth=pass reason=100
```

That is the receiver's line from the worked example "A promotion received by Outlook.com with no one-click unsubscribe". [How to read it](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/read-email-headers-spf-dkim-dmarc/).

- [Microsoft Support: View internet message headers in Outlook, read November 8, 2026](https://support.microsoft.com/en-us/office/view-internet-message-headers-in-outlook-cd039382-dc6e-4264-ac74-c048563d212c)

## Steps

1. **Classic Outlook: open the message.** Double-click the message to open it outside the Reading Pane.
2. **Classic Outlook: Properties.** Click File, then Properties. The headers are in the Internet headers box; select them and copy.
3. **Outlook on the web or Outlook.com.** Select More actions at the top of the message, then View, then View message details.
4. **Check them.** Paste the headers into the bulk sender check.

## Related

- [Read SPF, DKIM and DMARC in the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/read-email-headers-spf-dkim-dmarc/)
- [Gmail: get the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/gmail/)
- [New Outlook: get the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/new-outlook/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/outlook/  
Data as of: 2026-11-08
