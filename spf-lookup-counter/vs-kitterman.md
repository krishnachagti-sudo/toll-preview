# Kitterman's SPF tools or the Endwise counter

Use kitterman.com's forms to check a record's syntax or test one IP, Mail From and HELO; use Endwise's counter (from $0.002 a check) for the lookup count, include by include: "v=spf1 include:\_spf.google.com ~all" uses 1 of 10 as measured on November 7, 2026. See [record examples](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/record-examples/).

## Side by side

Kitterman column from the page, read November 8, 2026. "Not stated" means the page does not say.

|  | kitterman.com SPF page | Endwise |
| --- | --- | --- |
| Counts every nested lookup and names the 11th | Says it will "dynamically test for processing limit errors"; no count shown on the page | Yes |
| Void lookups (limit 2) | Not stated | Counted and reported |
| What-if: add or remove terms before publishing | Validates a pasted record's syntax without looking up the domain | Yes |
| Result for one sending IP | Yes: IP address, Mail From address and HELO/EHLO address | Yes, with the term it matched |
| API and MCP | Not stated | Yes; batches of up to 50 domains |
| Price | Not stated | from $0.002 a check; 5 free runs a day on the web without an account |

## When Kitterman's forms are the better pick

- You want to know whether a pasted record is syntactically valid, without any DNS lookups.
- You are testing one incoming message by hand: its IP, Mail From and HELO.

## When the Endwise counter fits better

- You need the number: every lookup counted, nested includes and void lookups included, with the 11th term named ([fix too many lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)).
- You are about to add a provider and want the new total first ([adding a sender](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/add-a-sender/)).
- You check many domains or want an agent to check them: batches of up to 50 through the API or MCP.

## Count a domain

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## Sources

- [kitterman.com: SPF validation page (read November 8, 2026)](https://www.kitterman.com/spf/validate.html)
- [IETF RFC 7208: Sender Policy Framework (SPF), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7208)

## Questions

### What does the Kitterman SPF validator do?

Its page has three forms: retrieve a domain's record and check it is valid; check a pasted record's syntax ("This test does NOT look up the record for the supplied domain"); and test a record against an IP address, Mail From and HELO (as read November 8, 2026).

### Does it count DNS lookups?

The page says it will "dynamically test for processing limit errors"; it does not say how lookups are counted or show a count.

## Related

- [dmarcian SPF Surveyor vs Endwise](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/vs-dmarcian/)
- [~all vs -all vs ?all](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/all-qualifiers/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/vs-kitterman/  
Data as of: 2026-11-08
