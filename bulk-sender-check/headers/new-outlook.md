# View email headers in the new Outlook

In the new Outlook for Windows, select More actions at the top of the message, then View, then View message details; copy the headers into the checker to see whether the message meets the bulk-sender rules of all 3 providers: Outlook.com (more than 5,000 a day), Gmail and Yahoo.

## Then check it

[Show a worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=one-click-missing)

## What to look for

Look for the Authentication-Results line near the top: Outlook.com writes spf=, dkim=, dmarc= and compauth= results there, without a server name in front.

```
Authentication-Results: spf=pass (sender IP is 198.51.100.25)
 smtp.mailfrom=bounce.example.org; dkim=pass (signature was verified)
 header.d=example.org;dmarc=pass action=none
 header.from=example.org;compauth=pass reason=100
```

That is the receiver's line from the worked example "A promotion received by Outlook.com with no one-click unsubscribe". [How to read it](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/read-email-headers-spf-dkim-dmarc/).

- [Microsoft Support: View internet message headers in Outlook, read November 8, 2026](https://support.microsoft.com/en-us/office/view-internet-message-headers-in-outlook-cd039382-dc6e-4264-ac74-c048563d212c)

## Steps

1. **Open the message.** Open the message in the new Outlook.
2. **View message details.** Select More actions at the top of the message window, then View, then View message details.
3. **Copy.** Select the header text and copy it.
4. **Check it.** Paste it into the bulk sender check.

## Related

- [Read SPF, DKIM and DMARC in the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/read-email-headers-spf-dkim-dmarc/)
- [Gmail: get the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/gmail/)
- [Outlook: get the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/outlook/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/new-outlook/  
Data as of: 2026-11-08
