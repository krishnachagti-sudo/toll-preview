# DS-160 visa photo size

A DS-160 visa photo must be a square JPEG of 240 kB or less, between 600 × 600 and 1200 × 1200 pixels, according to the State Department (read 31 October 2026). The tool below, preset to 240 KB, brings a square JPEG under that size; it does not crop it or check the pixels.

- Largest file: 240 kB
- Smallest square: 600 × 600 px
- Largest square: 1200 × 1200 px
- Compression: 20:1 or less

## Bring your square photo under 240 kB

[Open the tool at 240 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=240)

## The rules, from the State Department

The Photo Requirements page says the DS-160 online form asks you to upload your digital image as part of the application, and points to the Digital Image Requirements. Those say the image must be:

- In a square aspect ratio: the height equal to the width.
- At least 600 × 600 pixels and at most 1200 × 1200 pixels.
- In colour (24 bits per pixel), in the sRGB colour space.
- In JPEG format.
- Less than or equal to 240 kB (kilobytes) in file size.

The same page adds that the image may need compressing to get under the maximum size, and that the compression ratio should be 20:1 or less.

Whether a photo is accepted is decided by a State Department employee who reviews it; the file rules above are only part of it (the Photo Requirements page also covers the background, facial expression, head coverings and eyeglasses).

## The size window for each square

The compression ratio sets a floor under the 240 kB ceiling. A 24-bit colour image is 3 bytes a pixel before compression, so at 20:1 the file should be at least a twentieth of that. The bigger the square, the narrower the window.

Smallest and largest file for each square size (kB read as 1,000 bytes)

| Square | Uncompressed | Smallest file at 20:1 | Largest file |
| --- | ---: | ---: | ---: |
| 600 × 600 px | 1,080,000 bytes | 54,000 bytes | 240,000 bytes |
| 700 × 700 px | 1,470,000 bytes | 73,500 bytes | 240,000 bytes |
| 800 × 800 px | 1,920,000 bytes | 96,000 bytes | 240,000 bytes |
| 900 × 900 px | 2,430,000 bytes | 121,500 bytes | 240,000 bytes |
| 1000 × 1000 px | 3,000,000 bytes | 150,000 bytes | 240,000 bytes |
| 1100 × 1100 px | 3,630,000 bytes | 181,500 bytes | 240,000 bytes |
| 1200 × 1200 px | 4,320,000 bytes | 216,000 bytes | 240,000 bytes |

> The State Department does not say whether its kB is 1,000 or 1,024 bytes. The tool stays under 240,000 bytes, which passes either way.

## What the tool did with two square photos

A square portrait at the smallest and largest allowed size, run through the tool at 240 KB in Chromium 149.0.7827.55

| Photo | Before | After | Quality | Compression |
| --- | ---: | ---: | ---: | ---: |
| Square portrait, 600 × 600 px | 97.9 KB | 97.9 KB | Unchanged | 11.0:1 |
| Square portrait, 1200 × 1200 px | 302.7 KB | 234.8 KB | 84% | 18.4:1 |

The 600 × 600 photo was already 97.9 KB, under the limit, so the tool handed it back untouched. The 1200 × 1200 photo started at 302.7 KB; the tool kept all its pixels and lowered the JPEG quality to 84%, giving 234.8 KB, a compression of 18.4:1, inside the window of 216,000 to 240,000 bytes.

## What the tool does not do

- It does not crop to a square or resize to a set number of pixels. Start from a square photo of 600 to 1200 pixels a side.
- It does not check the compression ratio. For a large square, check the result is above the floor in the table.
- It does not judge the photo itself: background, expression, head coverings and eyeglasses are for you to check against the Photo Requirements.

## How the tool gets to the limit

1. It first saves your photo at its full size at JPEG quality 92%. If that already fits, that is the result.
2. If not, it tries quality levels between 35% and 92% at full size, halving the gap seven times, and keeps the highest quality that fits.
3. Only when even 35% quality is too big does it make the picture 15% narrower and shorter and search the quality again, step by step, down to a tenth of the width. Past that it says the limit is too small for the photo.
4. The result is always a JPEG. See-through areas of a PNG or WebP become white, a sideways phone photo is turned upright, and camera details such as location are not copied into the new file. A JPEG that is already under your limit is handed back as it is, details included.
5. Photos over 16 megapixels are first drawn at 16 megapixels, because phones and some browsers refuse larger canvases.
6. All of it happens inside your browser tab: the page has no code that sends your photo anywhere.

## Sources

- [U.S. Department of State: Digital Image Requirements (read 31 October 2026)](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html)
- [U.S. Department of State: Photo Requirements, including the DS-160 upload (read 31 October 2026)](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html)
- [NASA, jsc2025e068207\_alt (public domain)](https://images.nasa.gov/details/jsc2025e068207_alt)

## Questions

### What size must a DS-160 photo be?

A JPEG of 240 kB or less, square, from 600 × 600 to 1200 × 1200 pixels, in colour (sRGB), and compressed no more than 20:1. This is the State Department's Digital Image Requirements page, read on 31 October 2026.

### Can a 1200 × 1200 photo be too small a file?

It can be. Before compression it is 4,320,000 bytes, so the State Department's ratio of 20:1 or less means a file of at least 216,000 bytes. Between that and 240 kB the window is narrow. A 600 × 600 photo only needs 54,000 bytes or more.

### Does this tool crop my photo to a square?

No. It changes the file size and saves a JPEG, keeping the shape you give it. Crop to a square first; the State Department's own photo tool crops to exactly 600 × 600 pixels.

## Related

- [Compress an image to 200 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-200kb/)
- [Compress an image to 500 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-500kb/)
- [KB or KiB: 1,000 or 1,024 bytes](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/)
- [What every size limit does to a photo](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)
- [Image to size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/ds-160-photo-size/  
Data as of: 2026-10-31  
CSV: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/ds-160-photo-size.csv
