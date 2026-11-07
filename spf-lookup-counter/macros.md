# SPF macros, expanded

SPF macros are placeholders RFC 7208 Section 7 fills in at check time: %{i} is the sending IP, %{d} the domain, %{s} the sender; for sender strong-bad@email.example.com and IP 192.0.2.3, %{ir}.%{v}.\_spf.%{d2} becomes 3.2.0.192.in-addr.\_spf.example.com.

## Expand your own macro

[Expand it](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?macro=%25%7Bir%7D.%25%7Bv%7D._spf.%25%7Bd2%7D&mdomain=email.example.com&mip=192.0.2.3&msender=strong-bad%40email.example.com)

## RFC 7208 Section 7.4, expanded

Sender strong-bad@email.example.com, domain email.example.com

| Macro | Connection | Expansion |
| --- | --- | --- |
| `%{s}` | IPv4 192.0.2.3 | `strong-bad@email.example.com` |
| `%{o}` | IPv4 192.0.2.3 | `email.example.com` |
| `%{d}` | IPv4 192.0.2.3 | `email.example.com` |
| `%{d4}` | IPv4 192.0.2.3 | `email.example.com` |
| `%{d3}` | IPv4 192.0.2.3 | `email.example.com` |
| `%{d2}` | IPv4 192.0.2.3 | `example.com` |
| `%{d1}` | IPv4 192.0.2.3 | `com` |
| `%{dr}` | IPv4 192.0.2.3 | `com.example.email` |
| `%{d2r}` | IPv4 192.0.2.3 | `example.email` |
| `%{l}` | IPv4 192.0.2.3 | `strong-bad` |
| `%{l-}` | IPv4 192.0.2.3 | `strong.bad` |
| `%{lr}` | IPv4 192.0.2.3 | `strong-bad` |
| `%{lr-}` | IPv4 192.0.2.3 | `bad.strong` |
| `%{l1r-}` | IPv4 192.0.2.3 | `strong` |
| `%{ir}.%{v}._spf.%{d2}` | IPv4 192.0.2.3 | `3.2.0.192.in-addr._spf.example.com` |
| `%{lr-}.lp._spf.%{d2}` | IPv4 192.0.2.3 | `bad.strong.lp._spf.example.com` |
| `%{lr-}.lp.%{ir}.%{v}._spf.%{d2}` | IPv4 192.0.2.3 | `bad.strong.lp.3.2.0.192.in-addr._spf.example.com` |
| `%{ir}.%{v}.%{l1r-}.lp._spf.%{d2}` | IPv4 192.0.2.3 | `3.2.0.192.in-addr.strong.lp._spf.example.com` |
| `%{d2}.trusted-domains.example.net` | IPv4 192.0.2.3 | `example.com.trusted-domains.example.net` |
| `%{ir}.%{v}._spf.%{d2}` | IPv6 2001:db8::cb01 | `1.0.b.c.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6._spf.example.com` |

## The letters

- s: the sender; l: its local part; o: its domain
- d: the domain being checked
- i: the sending IP (IPv6 as 32 dotted nibbles); v: "in-addr" or "ip6"
- h: the HELO name; p: the validated reverse name (do not use)
- c, r, t: only in exp text
- A digit keeps that many right-hand parts; r reverses; a capital letter URL-escapes the result

Why it matters for counting: a checker that does not expand macros cannot follow a term like include:%{ir}.%{v}.\_spf.example.com, so it either skips what that include costs or guesses. The counter counts the term and, given a sending IP, follows it.

- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)
- [RFC 7208 Section 7.4](https://www.rfc-editor.org/rfc/rfc7208#section-7.4)

## Questions

### What does %{i} mean in an SPF record?

It is the sending IP address, filled in when the record is checked (RFC 7208 Section 7.2). %{ir} is the same address reversed, so 192.0.2.3 becomes 3.2.0.192.

### Does a term with a macro count toward the 10 lookups?

Yes. exists:%{i}.\_spf.example.com is one exists term, so it costs 1 lookup whatever name it builds.

## Related

- [Why two SPF checkers disagree](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/checkers-disagree/)
- [Void lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/void-lookups/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/macros/  
Data as of: 2026-11-07  
CSV: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/macros.csv
