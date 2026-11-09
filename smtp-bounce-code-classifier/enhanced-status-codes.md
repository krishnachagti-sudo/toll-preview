# SMTP enhanced status codes (RFC 3463 and the IANA registry)

The IANA registry defines 81 enhanced status detail codes (updated December 6, 2024); X.1.1 means "Bad destination mailbox address", and 11 of the 81 mean a bad address when they come with class 5.

- Detail codes: 81

## Look up any code

[Look it up (free)](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?code=5.7.1)

## Classes

| Class | Name | Meaning |
| --- | --- | --- |
| `2.XXX.YYY` | Success | Success specifies that the DSN is reporting a positive delivery action. Detail sub-codes may provide notification of transformations required for delivery. |
| `4.XXX.YYY` | Persistent Transient Failure | A persistent transient failure is one in which the message as sent is valid, but persistence of some temporary condition has caused abandonment or delay of attempts to send the message. If this code accompanies a delivery failure report, sending in the future may be successful. |
| `5.XXX.YYY` | Permanent Failure | A permanent failure is one which is not likely to be resolved by resending the message in the current form. Some change to the message or the destination must be made for successful delivery. |

## Subjects

| Subject | Name |
| --- | --- |
| `X.0.YYY` | Other or Undefined Status |
| `X.1.YYY` | Addressing Status |
| `X.2.YYY` | Mailbox Status |
| `X.3.YYY` | Mail System Status |
| `X.4.YYY` | Network and Routing Status |
| `X.5.YYY` | Mail Delivery Protocol Status |
| `X.6.YYY` | Message Content or Media Status |
| `X.7.YYY` | Security or Policy Status |

## All 81 detail codes

IANA registry, updated December 6, 2024; read November 8, 2026. Verdicts are this tool's rules.

| Code | Name | Reply codes | RFC | Class 5 | Class 4 |
| --- | --- | --- | --- | --- | --- |
| `X.0.0` | Other undefined Status | Any | RFC 3463 | soft | soft |
| [X.1.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-1-0/) | Other address status | Not given | RFC 3463 | hard | soft |
| [X.1.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-1-1/) | Bad destination mailbox address | 451, 550 | RFC 3463 | hard | soft |
| [X.1.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-2/) | Bad destination system address | Not given | RFC 3463 | hard | soft |
| [X.1.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-3/) | Bad destination mailbox address syntax | 501 | RFC 3463 | hard | soft |
| `X.1.4` | Destination mailbox address ambiguous | Not given | RFC 3463 | hard | soft |
| `X.1.5` | Destination address valid | 250 | RFC 3463 | soft | soft |
| `X.1.6` | Destination mailbox has moved, No forwarding address | Not given | RFC 3463 | hard | soft |
| [X.1.7](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-7/) | Bad sender's mailbox address syntax | Not given | RFC 3463 | policy | policy |
| `X.1.8` | Bad sender's system address | 451, 501 | RFC 3463 | policy | policy |
| `X.1.9` | Message relayed to non-compliant mailer | Not given | RFC 3886 | policy | policy |
| [X.1.10](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/556-5-1-10/) | Recipient address has null MX | 556 | RFC 7505, RFC 7504 | hard | soft |
| `X.2.0` | Other or undefined mailbox status | Not given | RFC 3463 | soft | soft |
| [X.2.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-2-1/) | Mailbox disabled, not accepting messages | Not given | RFC 3463 | hard | soft |
| [X.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-2-2/) | Mailbox full | 552 | RFC 3463 | soft | soft |
| `X.2.3` | Message length exceeds administrative limit | 552 | RFC 3463 | policy | policy |
| `X.2.4` | Mailing list expansion problem | 450, 452 | RFC 3463 | soft | soft |
| [X.3.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-3-0/) | Other or undefined mail system status | 221, 250, 421, 451, 550, 554 | RFC 3463 | soft | soft |
| `X.3.1` | Mail system full | 452 | RFC 3463 | soft | soft |
| `X.3.2` | System not accepting network messages | 453, 521 | RFC 3463, RFC 7504 | soft | soft |
| `X.3.3` | System not capable of selected features | Not given | RFC 3463 | policy | policy |
| [X.3.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-3-4/) | Message too big for system | 552, 554 | RFC 3463 | policy | policy |
| `X.3.5` | System incorrectly configured | Not given | RFC 3463 | soft | soft |
| `X.3.6` | Requested priority was changed | 250 or 251 | RFC 6710 | soft | soft |
| `X.4.0` | Other or undefined network or routing status | Not given | RFC 3463 | soft | soft |
| [X.4.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-1/) | No answer from host | 451 | RFC 3463 | soft | soft |
| [X.4.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-4-2/) | Bad connection | 421 | RFC 3463 | soft | soft |
| `X.4.3` | Directory server failure | 451, 550 | RFC 3463 | soft | soft |
| [X.4.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-4/) | Unable to route | Not given | RFC 3463 | hard | soft |
| [X.4.5](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-4-5/) | Mail system congestion | 451 | RFC 3463 | soft | soft |
| [X.4.6](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-4-6/) | Routing loop detected | Not given | RFC 3463 | policy | policy |
| `X.4.7` | Delivery time expired | Not given | RFC 3463 | soft | soft |
| `X.5.0` | Other or undefined protocol status | 220, 250, 251, 252, 253, 451, 452, 454, 458, 459, 501, 502, 503, 554 | RFC 3463 | policy | policy |
| [X.5.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/503-5-5-1/) | Invalid command | 430, 500, 501, 503, 530, 550, 554, 555 | RFC 3463 | policy | policy |
| `X.5.2` | Syntax error | 500, 501, 502, 550, 555 | RFC 3463 | policy | policy |
| [X.5.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-5-3/) | Too many recipients | 451 | RFC 3463 | policy | policy |
| [X.5.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/501-5-5-4/) | Invalid command arguments | 451, 501, 502, 503, 504, 550, 555 | RFC 3463 | policy | policy |
| `X.5.5` | Wrong protocol version | Not given | RFC 3463 | policy | policy |
| `X.5.6` | Authentication Exchange line is too long | 500 | RFC 4954 | policy | policy |
| [X.6.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-6-0/) | Other or undefined media error | Not given | RFC 3463 | policy | policy |
| `X.6.1` | Media not supported | Not given | RFC 3463 | policy | policy |
| `X.6.2` | Conversion required and prohibited | Not given | RFC 3463 | policy | policy |
| `X.6.3` | Conversion required but not supported | 554 | RFC 3463 | policy | policy |
| `X.6.4` | Conversion with loss performed | 250 | RFC 3463 | soft | soft |
| `X.6.5` | Conversion Failed | Not given | RFC 3463 | policy | policy |
| `X.6.6` | Message content not available | 554 | RFC 4468 | policy | policy |
| `X.6.7` | Non-ASCII addresses not permitted for that sender/recipient | 553, 550 | RFC 6531 | policy | policy |
| `X.6.8` | UTF-8 string reply is required, but not permitted by the SMTP client | 252, 553, 550 | RFC 6531 | policy | policy |
| `X.6.9` | UTF-8 header message cannot be transferred to one or more recipients, so the message must be rejected | 550 | RFC 6531 | policy | policy |
| `X.6.10` | Deprecated (duplicate of X.6.8) |  | RFC 6531 | policy | policy |
| [X.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-7-0/) | Other or undefined security status | 220, 235, 450, 454, 500, 501, 503, 504, 530, 535, 550 | RFC 3463 | block | block |
| [X.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1/) | Delivery not authorized, message refused | 451, 454, 502, 503, 533, 550, 551 | RFC 3463 | block | block |
| `X.7.2` | Mailing list expansion prohibited | 550 | RFC 3463 | policy | policy |
| `X.7.3` | Security conversion required but not possible | Not given | RFC 3463 | policy | policy |
| `X.7.4` | Security features not supported | 504 | RFC 3463 | policy | policy |
| `X.7.5` | Cryptographic failure | Not given | RFC 3463 | policy | policy |
| `X.7.6` | Cryptographic algorithm not supported | Not given | RFC 3463 | policy | policy |
| `X.7.7` | Message integrity failure | Not given | RFC 3463 | policy | policy |
| [X.7.8](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/535-5-7-8/) | Authentication credentials invalid | 535, 554 | RFC 4954 | policy | policy |
| `X.7.9` | Authentication mechanism is too weak | 534 | RFC 4954 | policy | policy |
| `X.7.10` | Encryption Needed | 523 | RFC 5248 | policy | policy |
| `X.7.11` | Encryption required for requested authentication mechanism | 524, 538 | RFC 4954 | policy | policy |
| `X.7.12` | A password transition is needed | 422, 432 | RFC 4954 | policy | policy |
| `X.7.13` | User Account Disabled | 525 | RFC 5248 | policy | policy |
| `X.7.14` | Trust relationship required | 535, 554 | RFC 5248 | policy | policy |
| `X.7.15` | Priority Level is too low | 450, 550 (other 4XX or 5XX codes are allowed) | RFC 6710 | policy | policy |
| `X.7.16` | Message is too big for the specified priority | 552 (other 4XX or 5XX codes are allowed) | RFC 6710 | policy | policy |
| `X.7.17` | Mailbox owner has changed | 5XX | RFC 7293 | hard | soft |
| `X.7.18` | Domain owner has changed | 5XX | RFC 7293 | hard | soft |
| `X.7.19` | RRVS test cannot be completed | 5XX | RFC 7293 | soft | soft |
| `X.7.20` | No passing DKIM signature found | 550 | RFC 7372, RFC 6376 | policy | policy |
| `X.7.21` | No acceptable DKIM signature found | 550 | RFC 7372, RFC 6376 | policy | policy |
| `X.7.22` | No valid author-matched DKIM signature found | 550 | RFC 7372, RFC 6376 | policy | policy |
| [X.7.23](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-23/) | SPF validation failed | 550 | RFC 7372, RFC 7208 | policy | policy |
| [X.7.24](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-24/) | SPF validation error | 451/550 | RFC 7372, RFC 7208 | policy | policy |
| [X.7.25](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-25/) | Reverse DNS validation failed | 550 | RFC 7372 | policy | policy |
| `X.7.26` | Multiple authentication checks failed | 550 | RFC 7372 | policy | policy |
| [X.7.27](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-27/) | Sender address has null MX | 550 | RFC 7505 | policy | policy |
| [X.7.28](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-28/) | Mail flood detected | . | draft-levine-mailbomb-header-00 | block | block |
| [X.7.29](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-29/) | ARC validation failure | 550 | RFC 8617 | policy | policy |
| [X.7.30](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-30/) | REQUIRETLS support required | 550 | RFC 8689 | policy | policy |

- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)
- [RFC 5248: A Registry for SMTP Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc5248.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### How many SMTP enhanced status codes are there?

The IANA registry lists 81 detail codes, under 3 classes (2, 4, 5) and 8 subjects (X.0 to X.7); it was last updated December 6, 2024.

### What is the format of an enhanced status code?

class.subject.detail, such as 5.1.1: the class is 2 (success), 4 (persistent transient failure) or 5 (permanent failure), and subject and detail are numbers of one to three digits (RFC 3463).

## Related

- [SMTP error codes list](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/smtp-error-codes/)
- [IANA registry vs this classifier](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/iana/)
- [5.7.x codes decoded](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/5-7-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/enhanced-status-codes/  
Data as of: 2024-12-06  
CSV: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/enhanced-status-codes.csv
