# Opening DMARC report attachments

A DMARC aggregate report attachment is one XML file, either plain (.xml) or compressed with gzip (.xml.gz, which RFC 9990 says it SHOULD be) or, from Google, inside a .zip; its name follows receiver!policy-domain!begin!end\[!unique-id\], and anything else inside (an .exe, a .js, an .html, a password-protected archive) is not a report.

## Skip opening it

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What to expect

From RFC 9990 section 3.5.2 and real reports in the IETF archive.

| Reporter | Attachment |
| --- | --- |
| [Microsoft](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/) | `enterprise.protection.outlook.com!<your domain>!<begin>!<end>.xml.gz` |
| [Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/) | `google.com!<your domain>!<begin>!<end>.zip` |
| [Yahoo](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/yahoo/) | `yahoo.com!<your domain>!<begin>!<end>.xml.gz` |
| [Mail.ru](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/mail-ru/) | `mail.ru!<your domain>!<begin>!<end>.xml.gz` |
| [GMX](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/gmx/) | `gmx.net!<your domain>!<begin>!<end>!<unique-id>.xml.gz` |

## Open it yourself

```sh
gunzip -c "google.com!example.com!1793923200!1794009599.xml.gz" | less
unzip -l "google.com!example.com!1793923200!1794009599.zip"   # list first: one .xml
unzip -p "google.com!example.com!1793923200!1794009599.zip" | less
```

On Windows and macOS, the built-in archive tools open both; open the XML in a text editor or browser, not by running anything.

## Signs an attachment is not a report

- The archive holds more than one file, or any file that is not .xml.
- It asks for a password, or the name does not follow receiver!domain!begin!end.
- The email does not come from the reporter's usual address (see each reporter's page), or asks you to click a link.
- The XML has a DOCTYPE: real reports never do.

## How the analyzer handles files

- At most 50 files a call, 10 MB each.
- Decompression stops at 32 MB per report and 250 times the compressed size, so a decompression bomb is refused before it fills memory (Microsoft's real reports reach about 41 times).
- A zip is read from its directory in memory, at most 20 entries, only .xml entries; encrypted and ZIP64 archives are refused.
- The XML reader refuses DOCTYPEs and unknown entities, so nothing external can be loaded.

## Sources

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [IETF dmarc-report list archive (real reports for ietf.org), read November 8, 2026](https://mailarchive.ietf.org/arch/browse/dmarc-report/)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Related

- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/open-dmarc-attachments/  
Data as of: 2026-11-08
