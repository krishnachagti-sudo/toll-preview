# Characters not allowed in Amazon titles

Amazon titles may not contain the 9 characters ! $ ? \_ { } ^ ¬ ¦ unless they are part of the brand name, under the title rules in force since January 21, 2025; in the worked file, "Harbor & Pine Stoneware Coffee Mug 12 oz - Dishwasher Safe!" is flagged for its !.

## Check a title for these characters

[Count it](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/?title=TaDa%21+Party+Poppers+for+Kids%2C+Confetti+Cannons%2C+Pack+of+12&brand=TaDa%21)

## The rule, in Amazon's words

"The special characters !, $, ?, \_, {, }, ^, ¬, and ¦ are not allowed, unless they are part of the brand name."

## The 9 characters

Each character in a test title, checked by the engine

| Character | Name | Code point | Test title | Result |
| --- | --- | --- | --- | --- |
| ! | exclamation mark | U+0021 | Acme Desk Lamp ! LED | flagged |
| $ | dollar sign | U+0024 | Acme Desk Lamp $ LED | flagged |
| ? | question mark | U+003F | Acme Desk Lamp ? LED | flagged |
| \_ | underscore | U+005F | Acme Desk Lamp \_ LED | flagged |
| { | left curly bracket | U+007B | Acme Desk Lamp { LED | flagged |
| } | right curly bracket | U+007D | Acme Desk Lamp } LED | flagged |
| ^ | caret | U+005E | Acme Desk Lamp ^ LED | flagged |
| ¬ | not sign | U+00AC | Acme Desk Lamp ¬ LED | flagged |
| ¦ | broken bar | U+00A6 | Acme Desk Lamp ¦ LED | flagged |

## The brand name exception

With the brand given as "TaDa!", the title "TaDa! Party Poppers for Kids, Confetti Cannons, Pack of 12" has no banned character outside the brand; without the brand it is flagged for !.

## Lookalikes

The broken bar ¦ (U+00A6) is on the list; the vertical bar \| (U+007C) is not, so "Acme Desk Lamp \| LED \| Dimmable" passes this check. A spreadsheet or feed tool can turn one into the other, so check the code point when a title is refused.

## Sources

- [Amazon Seller Forums, News\_Amazon: "New product title requirements effective January 21, 2025" (January 3, 2025; read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059)

> This checks titles against the rules Amazon published in its Seller Forums announcements on the dates shown: 75 characters including spaces outside media (July 27, 2026), the characters ! $ ? \_ { } ^ ¬ ¦ outside the brand name and no word more than twice (January 21, 2025). Amazon's help page and category style guides can add rules this check does not cover. The split is a mechanical cut at the last whole word that fits, not a rewrite. Not affiliated with Amazon.

## Questions

### Can I use an exclamation mark if it is in my brand name?

Yes. Amazon's rule: "The special characters !, $, ?, \_, {, }, ^, ¬, and ¦ are not allowed, unless they are part of the brand name."

### Are the ampersand, comma, hyphen and parentheses allowed?

They are not on the list in Amazon's January 2025 announcement. Amazon's help page on titles asks for a sign-in, so we could not read whether it says more.

## Related

- [Brand names and the title rules](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/brand-name-rules/)
- [No word more than twice](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/repeat-word-rule/)
- [The 75-character limit](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/character-limit-2026/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/banned-characters/  
Data as of: 2026-11-08
