# Long and accented names on certificates

Each name is set as large as its line allows: on the achievement design "Al Li" prints at 50 pt, "Maximiliana Featherstonehaugh-Worthington" at 33.25 pt and "Bartholomew Alexander Montgomery-Fitzgerald III" at 29.25 pt; accented Latin letters such as é, ñ and ë print as written, and letters the standard fonts lack are flagged.

## Check your own names

[Open the certificate maker](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/?design=achievement&names=Al+Li%3BJos%C3%A9+N%C3%BA%C3%B1ez%3BZo%C3%AB+Bront%C3%AB%3BD%27Angelo+O%27Brien-Smith%3BNguy%E1%BB%85n+Th%E1%BB%8B+Minh+Khai%3B%C5%81ucja+Wi%C5%9Bniewska%3BMaximiliana+Featherstonehaugh-Worthington%3BBartholomew+Alexander+Montgomery-Fitzgerald+III)

On US Letter landscape, achievement design, from the layout the PDF uses.

| Name | Prints as | Size | Fit | Letters |
| --- | --- | ---: | --- | --- |
| Al Li | Al Li | 50 pt | full size | as written |
| José Núñez | José Núñez | 50 pt | full size | as written |
| Zoë Brontë | Zoë Brontë | 50 pt | full size | as written |
| D'Angelo O'Brien-Smith | D'Angelo O'Brien-Smith | 50 pt | full size | as written |
| Nguyễn Thị Minh Khai | Nguyen Thi Minh Khai | 50 pt | full size | flagged |
| Łucja Wiśniewska | Lucja Wisniewska | 50 pt | full size | flagged |
| Maximiliana Featherstonehaugh-Worthington | Maximiliana Featherstonehaugh-Worthington | 33.25 pt | made smaller | as written |
| Bartholomew Alexander Montgomery-Fitzgerald III | Bartholomew Alexander Montgomery-Fitzgerald III | 29.25 pt | made smaller | as written |
| 王小明 | ??? | 50 pt | full size | flagged |

## How the fit works

- Each name is measured with the font's own character widths.
- If it is too wide at the full size, it is made smaller, a quarter point at a time.
- Below the smallest size, a name with spaces goes onto two lines instead; past that it is cut and listed.
- Every name that changed is listed with its page and row before you print.

## Accents, apostrophes and other scripts

The standard PDF fonts cover the letters of Western European languages (é, è, ñ, ü, ø, å, ç, ß), plus š, ž and œ. Curly apostrophes are printed straight. Letters outside that set, such as Ł, ễ or Chinese, lose their accent if that makes them printable (Ł prints as L) or print as "?", and the certificate is flagged so you can fix it by hand. Right-to-left scripts are not supported.

> Class lists are used to make the PDF and are not kept. The preview and the free proof are made in your browser; the clean PDF is made on the server, in memory, and the list is discarded with the answer.

## Related

- [Fix name capitals before a merge](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/guides/fix-name-capitalisation-before-merge/)
- [Printing certificates on US Letter](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/guides/print-certificates-us-letter/)
- [Word mail merge vs a batch generator](https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/vs/word-mail-merge/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/guides/long-and-accented-names/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/bulk-certificate-generator/guides/long-and-accented-names.csv
