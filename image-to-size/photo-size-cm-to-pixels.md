# Photo size in cm to pixels

Divide the centimeters by 2.54 to get inches, then multiply by the dots per inch. A 3.5 × 4.5 cm photo is 413 × 531 pixels at 300 dpi and 276 × 354 pixels at 200 dpi.

```text
pixels = round(cm ÷ 2.54 × dpi)
3.5 cm at 300 dpi = 3.5 ÷ 2.54 × 300 = 413.4 → 413 px
```

## Common sizes in pixels

Width × height in pixels, rounded to the nearest pixel

| Size | 200 dpi | 300 dpi | 600 dpi |
| --- | ---: | ---: | ---: |
| 3.5 × 4.5 cm | 276 × 354 | 413 × 531 | 827 × 1063 |
| 2 × 2 in (5.08 × 5.08 cm) | 400 × 400 | 600 × 600 | 1200 × 1200 |
| 3.5 × 3.5 cm | 276 × 276 | 413 × 413 | 827 × 827 |
| 5 × 5 cm | 394 × 394 | 591 × 591 | 1181 × 1181 |
| 6 × 2 cm | 472 × 157 | 709 × 236 | 1417 × 472 |
| 4 × 2 cm | 315 × 157 | 472 × 236 | 945 × 472 |

The inch is exactly 2.54 cm (NIST), so the only rounding is to a whole pixel. The sizes here are examples; use the size your form states.

## Pixels or kilobytes: which does the form check?

Many upload forms check only the file size in KB and the format. A file can have the right pixels and still be too many KB, or the other way round. Image to size works on the KB: it keeps the most pixels and quality that fit your limit. For the meaning of KB on a form, see [KB or KiB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/).

## Fit a photo under a KB limit

[Open the tool at 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=50)

## Sources

- [NIST Guide to the SI, Appendix B.8: inch to centimeter, 2.54 exactly (read 6 November 2026)](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8)

## Questions

### How many pixels is 3.5 × 4.5 cm?

At 300 dpi, 413 × 531 pixels; at 200 dpi, 276 × 354; at 600 dpi, 827 × 1063. Pixels = cm ÷ 2.54 × dpi, rounded.

### Which dpi should I use?

The one your form names. If it gives only centimeters, any common print resolution works, because a screen or portal counts pixels, not centimeters. Many forms care only about the file size in KB.

### Does reducing the KB change the size in cm?

Not by itself. The size in cm is pixels divided by the dpi written in the file. Shrinking a file's KB may also reduce its pixels, which a form that checks pixels will notice.

## Related

- [JEE (Main) 2027 photo size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/jee-main-2027-photo-size/)
- [Why a photo upload is refused](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/photo-upload-rejected/)
- [DS-160 visa photo size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/ds-160-photo-size/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/photo-size-cm-to-pixels/  
Data as of: 2026-11-06
