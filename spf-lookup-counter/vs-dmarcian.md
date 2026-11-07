# dmarcian SPF Surveyor or the Endwise counter

Both count SPF lookups against RFC 7208's limit of 10. dmarcian's SPF Surveyor is a free survey inside a DMARC platform; Endwise's counter costs from $0.002 a check, also answers over an API and MCP, and adds what-if edits, void lookups and the result for one IP. As measured on November 7, 2026, the counter puts [HubSpot's include](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/hubspot/) at 2 lookups.

## Side by side

dmarcian column from dmarcian's SPF Surveyor page, read November 8, 2026. "Not stated" means the page does not say, not that the tool lacks it.

|  | dmarcian SPF Surveyor | Endwise |
| --- | --- | --- |
| Counts every nested lookup and names the 11th | Page says "Each lookup counts towards a limit of 10" and "If a costly mechanism is present, our SPF Surveyor will notify you." | Yes |
| Void lookups (limit 2) | Not stated | Counted and reported |
| What-if: add or remove terms before publishing | Not stated | Yes |
| Result for one sending IP | Not stated | Yes, with the term it matched |
| API and MCP | Not stated | Yes; batches of up to 50 domains |
| Price | Listed under "Free DMARC Tools"; you agree to its Public Tools Policy; no account needed | from $0.002 a check; 5 free runs a day on the web without an account |

dmarcian describes the Surveyor as a way of "easily identifying the third-party email sources and IPs that are authorized to send email", with results you expand node by node.

## When dmarcian is the better pick

- You want a free look at a domain's SPF tree, clicking through each include and its IPv4 addresses.
- You are rolling out DMARC and want reporting and management from one vendor: dmarcian's site offers a DMARC management platform with a 30-day trial, plus DMARC and DKIM inspectors.

## When the Endwise counter fits better

- You need the exact count with nested includes and void lookups, and the term that goes over ([what counts](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)).
- You want to test a change first: add or remove an include and count the draft ([adding a sender](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/add-a-sender/)).
- A script or an AI agent should check domains, through the API or MCP, paying per check.

## Count a domain

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## Sources

- [dmarcian: SPF Surveyor (read November 8, 2026)](https://dmarcian.com/spf-survey/)
- [IETF RFC 7208: Sender Policy Framework (SPF), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7208)

## Questions

### Is dmarcian's SPF Surveyor free?

dmarcian lists it under "Free DMARC Tools"; using it asks you to agree to dmarcian's Public Tools Policy, with no account needed (as read November 8, 2026).

### Does the SPF Surveyor count lookups?

Its page says "Each lookup counts towards a limit of 10" and that it will notify you if a costly mechanism is present.

## Related

- [Kitterman's SPF tools vs Endwise](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/vs-kitterman/)
- [Why two SPF checkers disagree](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/checkers-disagree/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/vs-dmarcian/  
Data as of: 2026-11-08
