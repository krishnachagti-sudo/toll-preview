# How Amazon titles are checked: 75 characters and rules

A title outside media must be 75 characters or less, spaces included (from July 27, 2026); none of ! $ ? \_ { } ^ ¬ ¦ may appear outside the brand name; and no word may appear more than twice, articles, prepositions and conjunctions excepted. A title over the limit is cut at the last whole word that fits, and the rest is a draft for Item Highlights (125).

## How does it work?

1. Titles are read from the list, the rows or the file. A file's separator is whichever of tab, comma and semicolon is most used in its first line; quotes and a byte order mark are handled. The heading row is looked for in the first 5 rows, so the template rows above an Amazon flat file's heading are skipped; headings such as item\_name, item-name and Product Name are matched with case and punctuation ignored. A file with no heading row is read as one title per line.
2. The length is counted in Unicode code points, spaces included, so an accented letter or a CJK character is one. Over 75 fails with how many characters over.
3. Every occurrence of the brand name (in any case) is masked, and the rest of the title is searched for each of ! $ ? \_ { } ^ ¬ ¦, with how many times each appears.
4. Words are split at spaces and , / \| ; : +, with punctuation at their ends dropped and letters lowercased; a hyphenated word is one word, and a token with no letter (a number or size) is not a word. A word used more than 2 times fails, except the 3 articles, 58 prepositions and 17 conjunctions on the tool's English list. Plurals count as other words.
5. Item Highlights given beside a title fail over 125 characters.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/amazon-title-checker/#what) below.

## What does it not cover?

- Rules that only Amazon's signed-in help page states are not checked: it asks for a Seller Central sign-in, so it was not read. Category style guides are not checked either.
- The cut is a mechanical cut at the last whole word that fits, not a rewrite.
- Plural and other forms of a word count as other words, since Amazon's posts say "the same word".
- Not affiliated with Amazon.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 3 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Amazon's July 27, 2026 and January 21, 2025 announcements and the July 2026 Engage post were read on 2026-11-08. The posts are checked once a day for changes, and the rules change only by hand, with the tests that pin them.
- [Tested: 4 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests pin the rules to Amazon's quoted posts and read date, read CSV with each separator, quotes and a byte order mark and find a flat file's heading under its template rows, check 75 and 76 characters and code point counts, each of the 9 banned characters with the brand exception, repeats with case, exempt words, hyphens, numbers and plurals, the cut at the last whole word, the brand warning, the summary and answer, and the fix list.

- [Updates to improve your product titles begin on July 27 (News\_Amazon, Amazon Seller Forums (News and Announcements))](https://sellercentral.amazon.com/seller-forums/discussions/t/145b6d0f-999c-4555-896c-c694bda2e470), published 2026-06-10, read 2026-11-08
- [Engage With Amazon: Get your Product Title Update Questions Answered! (Dougal\_Amazon, Amazon Seller Forums)](https://sellercentral.amazon.com/seller-forums/discussions/t/ac660707-60c7-43e3-a3fd-420d7321cc4e), published 2026-06-02, read 2026-11-08
- [New product title requirements effective January 21, 2025 (News\_Amazon, Amazon Seller Forums)](https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059), published 2025-01-03, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the amazon title checker compute?

Given titles as a list, rows or a file (an Amazon flat file or listings report saved as CSV or tab-separated text), the tool checks each against the three rules Amazon published in its Seller Forums announcements: the 75-character limit from July 27, 2026, and the banned characters and repeated words from January 21, 2025.

**In detail: operations, inputs and outputs**

Each title gets its count, what breaks which rule, where a cut to 75 falls, the overflow measured against Item Highlights' 125 characters, and a warning when the cut would lose the brand. A fix list CSV covers every title.

Operations (the op field):

- `check`: Checks every title. The answer has the headline, a summary (titles, fail, warn and ok counts, and how many are long, have a banned character, repeat a word, have Item Highlights over the limit, would lose the brand, are media, or overflow past Item Highlights), each title's result (count, limit, characters over, verdict, findings with a fix and the source, notes, the cut and the brand position), the fix list CSV and the columns used.
- `rules`: Returns the rule numbers, the banned characters, the exempt words, Amazon's quoted text with its sources and read date, and what is not checked. Free.

Inputs:

- `titles, rows or csv`: One of the three: a list of titles, rows of objects with a title (and sku, brand, media, Item Highlights) keyed by field or by heading, or CSV text of at most 2,500,000 characters. At most 10,000 titles in one call, each at most 5,000 characters.
- `columns`: Names the heading that holds a field (title, sku, brand, media, highlights) when the tool does not recognize it.
- `brand`: One brand name for every title; a brand column in the file wins for its row.
- `media`: true to mark every title as media, to which the 75-character rule does not apply. A media column (yes, true, 1, x) marks single rows.

Outputs:

- answer: how many titles break the rules and how (over the limit, a banned character, a repeated word), or for one title its count and its cut
- summary: titles, fail, warn, ok, long, chars, repeat, highlights, brandCut, media and overflowTooLong
- results: per title, line, sku, title, length, limit, over, media, verdict (ok, warn or fail), findings, notes, cut (title, overflow and their lengths, whether the overflow fits Item Highlights) and brandAt
- fixCsv: one row per title with its count, characters over, verdict, problems, the cut title and the overflow

**Every step in full (7) and the rules**

1. Titles are read from the list, the rows or the file. A file's separator is whichever of tab, comma and semicolon is most used in its first line; quotes and a byte order mark are handled. The heading row is looked for in the first 5 rows, so the template rows above an Amazon flat file's heading are skipped; headings such as item\_name, item-name and Product Name are matched with case and punctuation ignored. A file with no heading row is read as one title per line.
2. The length is counted in Unicode code points, spaces included, so an accented letter or a CJK character is one. Over 75 fails with how many characters over. A title marked media is not held to the limit. Spaces at the ends, two spaces in a row, and emoji, joiners or combining marks get a note on how they count.
3. Every occurrence of the brand name (in any case) is masked, and the rest of the title is searched for each of ! $ ? \_ { } ^ ¬ ¦, with how many times each appears. Lookalike characters and characters not on the list (\| & ( ) - : ; / % and others) are allowed.
4. Words are split at spaces and , / \| ; : +, with punctuation at their ends dropped and letters lowercased; a hyphenated word is one word, and a token with no letter (a number or size) is not a word. A word used more than 2 times fails, except the 3 articles, 58 prepositions and 17 conjunctions on the tool's English list. Plurals count as other words.
5. Item Highlights given beside a title fail over 125 characters.
6. A title over the limit is cut at the last whole word that fits in 75 (a first word longer than the limit is cut at 75), separators are trimmed from both sides of the cut, and the rest is measured against Item Highlights.
7. When the brand ends past character 75, a warning says the cut would lose it. A title fails if any rule is broken, is a warning if only the brand warning applies, and is ok otherwise.

**Amazon's announcements.**

Length: "Starting July 27, 2026, titles in all categories except for media will need to be 75 characters or less including spaces." Item Highlights: Amazon's post gives 125 characters. Both from the July 2026 post, read on 2026-11-08.

Characters and repeats: "The special characters !, $, ?, \_, {, }, ^, ¬, and ¦ are not allowed, unless they are part of the brand name." "Titles may not contain the same word more than twice. Prepositions, articles, and conjunctions are exceptions." From the January 2025 post, read on 2026-11-08.

Amazon names only the word classes that are exempt from the repeat rule; the English word list is the tool's own, from standard grammar, and a word not on it counts.

## Which edge cases does it handle?

**The edge cases (7)**

- Exactly 75 characters passes; 76 fails by 1.
- A banned character inside the brand name is allowed, in any case, but the same character elsewhere in the title is still flagged.
- "Glass Set, Glass Tumblers and Glass Coasters" repeats glass 3 times and fails; "BPA-Free Bottle, Free Lid, Free Straw" uses free twice, since BPA-Free is one word.
- A word ending exactly at character 75 is kept whole; one word longer than 75 is cut at 75.
- A media title is not held to 75; past 200 characters a note names the limit Amazon's January 2025 post set for most categories.
- A brand that is not in the title gets a note, not a finding.
- A cell that starts like a formula is written as text in the fix list CSV.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Six listings from a flat file: which titles break which rule and where each is cut**

Six listings from a flat file: which titles break which rule and where each is cut

| Result | Value |
| --- | --- |
| answer | 4 of your 6 titles break Amazon's title rules: 2 are over 75 characters, 1 contains a banned character, 1 repeats a word more than twice. |
| line 2 (BTL-32) | 85 characters, fail: length; cut to "Harbor & Pine Insulated Water Bottle 32 oz, Leakproof Lid, Keeps Drinks", 13 characters left for Item Highlights |
| line 3 (MUG-12) | 59 characters, fail: chars |
| line 4 (SET-03) | 68 characters, fail: repeat |
| line 5 (KNF-08) | 91 characters, fail: length, brand-cut; cut to "Chef Knife 8 Inch High Carbon Stainless Steel, Ergonomic Handle, Gift Box", 16 characters left for Item Highlights |
| line 6 (BRD-01) | 52 characters, ok |
| line 7 (BK-101) | 100 characters, ok |

**The input**

```json
{
  "op": "check",
  "csv": "sku,item_name,brand_name,media\r\nBTL-32,\"Harbor & Pine Insulated Water Bottle 32 oz, Leakproof Lid, Keeps Drinks Cold 24 Hours\",Harbor & Pine,\r\nMUG-12,Harbor & Pine Stoneware Coffee Mug 12 oz - Dishwasher Safe!,Harbor & Pine,\r\nSET-03,\"Harbor & Pine Glass Set, Glass Tumblers and Glass Coasters, 6 Pieces\",Harbor & Pine,\r\nKNF-08,\"Chef Knife 8 Inch High Carbon Stainless Steel, Ergonomic Handle, Gift Box, by Harbor & Pine\",Harbor & Pine,\r\nBRD-01,Harbor & Pine Acacia Cutting Board with Juice Groove,Harbor & Pine,\r\nBK-101,\"The Harbor & Pine Kitchen Book: 101 Recipes for Small Kitchens, Slow Weekends and Big Family Dinners\",Harbor & Pine,yes"
}
```

**More worked examples (2)**

**Amazon's own "before" title from its July 2026 Engage post: its count and its cut**

Amazon's own "before" title from its July 2026 Engage post: its count and its cut

| Result | Value |
| --- | --- |
| answer | This title is 99 characters, 24 over Amazon's 75-character limit. Cut at the last whole word it reads "Premium Stainless Steel Insulated Water Bottle – Keeps Drinks Cold 24" (69), leaving 29 characters for Item Highlights. |
| line 1 | 99 characters, fail: length; cut to "Premium Stainless Steel Insulated Water Bottle – Keeps Drinks Cold 24", 29 characters left for Item Highlights |

**The input**

```json
{
  "op": "check",
  "titles": [
    "Premium Stainless Steel Insulated Water Bottle – Keeps Drinks Cold 24 Hours, Hot 12 Hours, BPA-Free"
  ]
}
```

**A pasted list with one brand for all, a brand that holds a banned character**

A pasted list with one brand for all, a brand that holds a banned character

| Result | Value |
| --- | --- |
| answer | 2 of your 3 titles break Amazon's title rules: 0 are over 75 characters, 1 contains a banned character, 1 repeats a word more than twice. |
| line 1 | 58 characters, ok |
| line 2 | 60 characters, fail: repeat |
| line 3 | 30 characters, fail: chars |

**The input**

```json
{
  "op": "check",
  "titles": [
    "TaDa! Party Poppers for Kids, Confetti Cannons, Pack of 12",
    "TaDa! Party Popper Party Favors, Party Supplies for Birthday",
    "Confetti Poppers {Gold} 6 Pack"
  ],
  "brand": "TaDa!"
}
```

## How is it tested?

**What its test suite asserts (4)**

- The rules are pinned to Amazon's quoted announcements, read on 2026-11-08.
- Exactly 75 characters passes and 76 fails; counts are in code points; media is not held to the limit.
- Each of the 9 banned characters is flagged with its count and allowed inside the brand; repeats are case-insensitive with exempt words, hyphens, numbers and plurals checked.
- The cut falls at the last whole word with separators trimmed, the brand warning fires past the limit, and the worked examples equal what run() returns.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Amazon title checker tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/).

## Questions

### Is there any AI in the amazon title checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the amazon title checker refuse to answer?

Rules that only Amazon's signed-in help page states are not checked: it asks for a Seller Central sign-in, so it was not read. Category style guides are not checked either. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Amazon title checker tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/amazon-title-checker/  
Data as of: 2026-11-04
