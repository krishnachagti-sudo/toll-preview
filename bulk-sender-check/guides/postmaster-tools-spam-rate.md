# Reading the Postmaster Tools spam rate

Gmail's spam rate is on the Spam rate dashboard of Postmaster Tools: the share of DKIM-authenticated messages delivered to an engaged recipient's inbox that the recipient then marked as spam, calculated daily; Google says to keep it below 0.1% and never reach 0.3%, and it is the one Gmail rule no message check can show.

## Check the rules one message can show

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=compliant)

## How Google calculates it

- Only messages authenticated with DKIM count.
- Messages delivered to spam and then marked not spam count as delivered to the inbox.
- Data is in UTC, usually updated within 24 hours, and may be missing on low-volume days.
- Bulk senders become eligible for mitigation again after 7 consecutive days below 0.3%.

- [Google: Postmaster Tools dashboards, read November 8, 2026](https://support.google.com/mail/answer/14668346?hl=en)
- [Google: Set up Postmaster Tools, read November 8, 2026](https://support.google.com/mail/answer/9981691?hl=en)
- [Google: Email sender guidelines FAQ, read November 8, 2026](https://support.google.com/a/answer/14229414?hl=en)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Meeting every rule does not guarantee the inbox; spam rate, volume and unsubscribe handling cannot be judged from one message.

## Steps

1. **Add your domain.** Sign in to Postmaster Tools and add the domain you authenticate with: the DKIM d= domain or the SPF (Return-Path) domain.
2. **Verify it.** Add the TXT or CNAME record it gives you at your DNS host, then click Verify.
3. **Open Spam rate.** Pick the domain, the Spam rate dashboard and a time range (7 to 120 days).
4. **Act on a rise.** Use the Feedback loop dashboard to find the campaigns people mark as spam.

## Questions

### What spam rate does Gmail require?

Below 0.3%. Google's FAQ: keep the user-reported spam rate below 0.1% and prevent it from reaching 0.3% or higher; bulk senders above 0.3% are ineligible for mitigation until they stay below it for 7 consecutive days.

### Why is my spam rate missing?

Google: dashboards might not include all data on days when your outgoing volume is low, to protect users' privacy.

## Related

- [Gmail's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)
- [Postmaster Tools vs this check](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/google-postmaster/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/postmaster-tools-spam-rate/  
Data as of: 2026-11-08
