# Transposition error checker

A difference of $90.00 is divisible by 9 ($90.00 / 9 = $10.00), so a swap of two adjacent digits that differ by 1 is likely; candidate entries: $450.00 (entered or meant as $540.00).

## Check a difference

[Open the check with this difference](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?diff=90.00&amounts=450.00%3B1245.90%3B312.75)

## The rule in one line

Swap two neighbouring digits a and b in a number and it changes by 9 x (a - b) x the place value of the lower digit. So the gap is always a multiple of 9, and the quotient tells you how far apart the digits are and where: $10.00 means digits 1 apart in the $100 and $10 places, as in 450 and 540.

Differences worked out by the checker

| Difference | Divisible by 9 | Difference / 9 | One adjacent swap? |
| ---: | --- | ---: | --- |
| $9.00 | yes | $1.00 | 1 apart, $10 and $1 places |
| $18.00 | yes | $2.00 | 2 apart, $10 and $1 places |
| $27.00 | yes | $3.00 | 3 apart, $10 and $1 places |
| $90.00 | yes | $10.00 | 1 apart, $100 and $10 places |
| $180.00 | yes | $20.00 | 2 apart, $100 and $10 places |
| $450.00 | yes | $50.00 | 5 apart, $100 and $10 places |
| $900.00 | yes | $100.00 | 1 apart, $1,000 and $100 places |
| $4,500.00 | yes | $500.00 | 5 apart, $1,000 and $100 places |
| $9,000.00 | yes | $1,000.00 | 1 apart, $10,000 and $1,000 places |
| $13,500.00 | yes | $1,500.00 | not one adjacent swap |
| $105.00 | no |  | not a transposition |
| $1,188.00 | yes | $132.00 | not one adjacent swap |

## Three other patterns it checks

- Half the difference: an amount entered the wrong way round (a deposit as a payment) moves the balance by twice it. A $900.00 difference with a $450.00 line is the classic case.
- A slide: 120.00 for 1,200.00 is off by 1,080.00, nine times the smaller amount, so it is a multiple of 9 too.
- The difference itself: a line missing on one side leaves exactly its amount.

> The full tool runs these checks on every unmatched pair in your statement and ledger, so a fee or a second error mixed into the total does not hide a transposition.

## Sources

- [AccountingTools: Transposition error, February 13, 2026 (read November 8, 2026)](https://accountingtools.com/articles/transposition-error)

## Questions

### What is a transposition error in accounting?

AccountingTools: "A transposition error occurs when two adjacent digits in a number are accidentally reversed during data entry." Typing 540 as 450 is one.

### Is every difference divisible by 9 a transposition?

No. It is a clue, not proof: $105.00 is not divisible by 9, yet the worked bakery month holds a transposition inside it, because a $15.00 fee is mixed in. A slide (an extra zero) also gives a multiple of 9.

### What about divisible by 3?

Every multiple of 9 is a multiple of 3, so divisible by 3 alone proves nothing. $27.00 is divisible by both, the swap of 6 and 3 in 63 and 36 (AccountingTools' example).

### Transposition error vs transcription error?

A transposition swaps two digits that are there (540 for 450). A transcription error copies a digit wrong (538 for 540): the gap need not be a multiple of 9, and the checker reports it as not a transposition.

## Related

- [The divisible-by-9 rule, with the proof](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/divisible-by-nine-rule/)
- [Difference is twice an amount](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/difference-is-double-a-transaction/)
- [Why a reconciliation does not balance](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/why-bank-reconciliation-not-balancing/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/transposition-error-checker/  
Data as of: 2026-11-08
