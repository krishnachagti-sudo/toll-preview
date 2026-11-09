# Postmaster Tools, SNDS or a bounce classifier

Postmaster Tools and SNDS tell you why your reputation is what it is at Gmail and Outlook.com; a classifier tells you what one bounce says: Gmail's "very low reputation of the sending domain" 550 5.7.1, for example, is a block, so keep the address and open Postmaster Tools.

## Side by side

From Google's "Set up Postmaster Tools" help page and Microsoft's SNDS page (announcements updated September 22, 2026), read November 8, 2026.

|  | Google Postmaster Tools | Microsoft SNDS | Classifier |
| --- | --- | --- | --- |
| Answers | How Gmail sees your domain and IPs | How Outlook.com sees your IPs | What one bounce means and what to do |
| Data | Spam rate, reputation, authentication, delivery errors | Per-IP data and junk reports | Your pasted bounce text |
| Scope | Mail to personal Gmail accounts | IPs you are authorized for | Any receiver |
| Setup | Verify your sending domain | Microsoft Account, request IP access | None; an API key for code |
| Price | Not stated on the page | Not stated on the page | $0.0005 a bounce; code lookups free |

## When Postmaster Tools or SNDS is the better pick

- Your bounces are blocks for reputation, and you need the trend and the cause: spam rate, complaint data, IP status.
- You want feedback-loop reports of users marking your mail as junk (SNDS's Junk Email Reporting Program).

## When the classifier fits better

- You have a bounce and must decide now: suppress, retry or fix the sender.
- The receiver is not Gmail or Outlook.com, or the bounce came through a platform's webhook.

## Classify a reputation bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=550+5.7.1+This+message+is+likely+suspicious+due+to+the+very+low+reputation+of+the+sending+domain&run=1)

- [Google: Set up Postmaster Tools, read November 8, 2026](https://support.google.com/mail/answer/9981691?hl=en)
- [Microsoft: Outlook.com Smart Network Data Services, read November 8, 2026](https://sendersupport.olc.protection.outlook.com/snds/)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)

## Questions

### What does Google Postmaster Tools show?

Dashboards on spam rate, reputation, message authentication and delivery errors, for mail sent to personal Gmail accounts, after you verify your sending domain (the DKIM d= domain or the SPF Return-Path domain).

### What is Microsoft SNDS?

Outlook.com Smart Network Data Services: data about individual sending IPs you are authorized for, plus the Junk Email Reporting Program; you sign in with a Microsoft Account and request access to your IPs.

## Related

- [5.7.x codes decoded](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/5-7-codes/)
- [Gmail bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/)
- [Microsoft bounce codes](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/postmaster-tools/  
Data as of: 2026-11-08
