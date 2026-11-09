# No word more than twice in an Amazon title

An Amazon title may not use the same word more than twice, except prepositions, articles and conjunctions (rule since January 21, 2025); "Harbor & Pine Glass Set, Glass Tumblers and Glass Coasters, 6 Pieces" is flagged because "glass" appears 3 times.

## Check a title for repeats

[Count it](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/?title=Harbor+%26+Pine+Glass+Set%2C+Glass+Tumblers+and+Glass+Coasters%2C+6+Pieces&brand=)

## The rule, in Amazon's words

"Titles may not contain the same word more than twice. Prepositions, articles, and conjunctions are exceptions."

## Worked titles

Each checked by the engine

| Title | Words over twice | Result |
| --- | --- | --- |
| Glass Set, Glass Tumblers and Glass Coasters | "glass" 3 times | flagged |
| Glass Set, glass Tumblers, GLASS Coasters | "glass" 3 times | flagged |
| Glass Set, Glass Tumblers and Glasses | none | passes |
| Dog Toy for Dogs and Toy Box for Toys and Dog | none | passes |
| Stand for Phone, Stand for Tablet, Stand for Laptop | "stand" 3 times | flagged |
| BPA-Free Bottle, Free Lid, Free Straw | none | passes |

## How the checker counts

- Upper and lower case are the same word: Glass, glass and GLASS are 3 uses.
- Words are split at spaces and at , / \| ; : +; a hyphenated word such as BPA-Free is one word.
- Numbers and sizes (24, 12) are not counted as words.
- Plurals and other forms are different words: Amazon's post says "the same word".
- Exempt: the articles a, an, the; the conjunctions and, but, or, nor, so, yet, both, either, neither, because, although, though, while, whereas, if, unless, whether; and 58 prepositions (about, above, across, after, against, along, amid, among, around, as, at, before and the rest in the rule set). Amazon names the word classes; the word list is ours.

## Sources

- [Amazon Seller Forums, News\_Amazon: "New product title requirements effective January 21, 2025" (January 3, 2025; read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059)

> This checks titles against the rules Amazon published in its Seller Forums announcements on the dates shown: 75 characters including spaces outside media (July 27, 2026), the characters ! $ ? \_ { } ^ ¬ ¦ outside the brand name and no word more than twice (January 21, 2025). Amazon's help page and category style guides can add rules this check does not cover. The split is a mechanical cut at the last whole word that fits, not a rewrite. Not affiliated with Amazon.

## Questions

### Does "and" or "for" count as a repeat?

No. Amazon's rule: "Titles may not contain the same word more than twice. Prepositions, articles, and conjunctions are exceptions." "and" is a conjunction and "for" a preposition.

### Do plurals count as the same word?

Amazon's announcement says "the same word" and does not mention plurals. The checker counts "glass" and "glasses" as different words, and says so.

## Related

- [Characters not allowed in titles](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/banned-characters/)
- [How to shorten a title to 75](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/shorten-to-75/)
- [Brand names and the title rules](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/brand-name-rules/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/repeat-word-rule/  
Data as of: 2026-11-08
