# The IANA registry or the classifier

The IANA registry is the normative list of 81 enhanced status detail codes (updated December 6, 2024), free and machine-readable; Endwise's classifier reads that list plus Gmail's, Microsoft's and Yahoo's published texts and returns a verdict and an action, at $0.0005 a bounce.

- Codes in the registry: 81

## Side by side

IANA column from the registry page and XML, read November 8, 2026.

|  | IANA registry | Classifier |
| --- | --- | --- |
| What it is | The registry of SMTP enhanced status codes (RFC 5248) | Rules that turn a bounce into hard, soft, block or policy |
| Codes | 81 detail codes, 3 classes, 8 subjects | The same 81, plus 171 provider texts |
| Provider meanings | No (a provider can use a code differently, such as Microsoft 5.1.10) | Yes, and flagged when they differ from IANA |
| Suppress or not | Not stated | Yes, per bounce |
| Format | Web page, XML, CSV | Web, REST API, MCP |
| Price | Free | $0.0005 a bounce, at most $29 a month; code lookups free |

## When the registry is the better source

- You need the normative definition of a code, its reference RFC and its associated reply codes.
- You maintain your own rules and want the raw list to diff against (the XML is machine-readable).

## When the classifier fits better

- You need to decide what to do with an address, and the same code means different things by text ([421 4.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-7-0/)).
- You process bounces from code or an agent and want a rule id for every decision.

## Look up a code

[Look it up (free)](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?code=5.1.10)

- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [RFC 5248: A Registry for SMTP Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc5248.txt)

## Questions

### Does the IANA registry say whether to suppress an address?

No. It defines what each code means (with its associated reply codes and RFC); it says nothing about what a sender should do with the address.

## Related

- [Every IANA enhanced status code](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/enhanced-status-codes/)
- [Postmark bounce types vs this classifier](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/postmark/)
- [Postmaster Tools and SNDS vs this classifier](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/postmaster-tools/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/iana/  
Data as of: 2026-11-08
