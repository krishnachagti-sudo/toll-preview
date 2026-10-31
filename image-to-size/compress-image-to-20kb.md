# Compress an image to 20 KB

Image to size makes a JPEG, PNG or WebP image 20 KB or smaller and saves it as a JPEG, in your browser. In our test, a 12-megapixel photo came out at 19.7 KB, at 794 × 595 px, 4% of its pixels, with JPEG quality 38%.

- 12 MP photo became: 19.7 KB
- Its size in pixels: 794 × 595 px
- JPEG quality: 38%
- Limit in bytes: 20,000

## Shrink your photo to 20 KB

[Open the tool at 20 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=20)

## Four photos, made 20 KB

What the tool produced at a 20 KB limit (20,000 bytes)

| Photo | Before | After | Pixels | Quality | Pixels kept |
| --- | --- | ---: | ---: | ---: | ---: |
| Landscape photo, 12 megapixels | 4,032 × 3,024 px, 2.08 MB | 19.7 KB | 794 × 595 px | 38% | 4% |
| Head-and-shoulders portrait, 12 megapixels | 3,024 × 4,032 px, 2.14 MB | 19.9 KB | 366 × 487 px | 46% | 1% |
| Busy outdoor scene, 6 megapixels | 3,008 × 2,000 px, 1.91 MB | 19.8 KB | 428 × 284 px | 41% | 2% |
| Page of typed text, US Letter at 300 dpi | 2,550 × 3,300 px, 1.11 MB | 19.8 KB | 363 × 469 px | 44% | 2% |

> Each result is under 20,000 bytes. Quality is the JPEG quality the tool settled on (35% to 92%).

## What 20 KB does to a photo

20 KB is too small for a 12-megapixel photo at full size, even at the lowest quality the tool will use (35%). So it makes the picture smaller: our landscape photo came out at 794 × 595 px, about 0.5 megapixels instead of 12.2. That is the trade the tool makes on purpose: it will not save below 35% quality, so the picture gets smaller instead.

A page of text at 20 KB came out at 363 × 469 px. That is the detail of a letter-size page scanned at about 43 dpi, against the 300 dpi it was drawn at.

For comparison, the same 12-megapixel photo at [50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-50kb/) came out at 1,521 × 1,141 px, quality 40%.

## Is 20 KB 20,000 or 20,480 bytes?

Forms rarely say. 20 KB is 20,000 bytes when a KB is 1,000 bytes, and 20,480 bytes when it is 1,024. The tool aims under 20,000 bytes, the smaller of the two, so its result passes either way. [Why KB has two meanings](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/).

## How the tool gets to the limit

1. It first saves your photo at its full size at JPEG quality 92%. If that already fits, that is the result.
2. If not, it tries quality levels between 35% and 92% at full size, halving the gap seven times, and keeps the highest quality that fits.
3. Only when even 35% quality is too big does it make the picture 15% narrower and shorter and search the quality again, step by step, down to a tenth of the width. Past that it says the limit is too small for the photo.
4. The result is always a JPEG. See-through areas of a PNG or WebP become white, a sideways phone photo is turned upright, and camera details such as location are not copied into the new file. A JPEG that is already under your limit is handed back as it is, details included.
5. Photos over 16 megapixels are first drawn at 16 megapixels, because phones and some browsers refuse larger canvases.
6. All of it happens inside your browser tab: the page has no code that sends your photo anywhere.

## The test photos

- **Landscape photo, 12 megapixels**: A sunrise over water with a pelican on a dock post, cut to 4:3 and resized to 4032 × 3024 px, then saved as a JPEG at quality 92%, the size and shape a phone camera saves. Source: [NASA, KSC-20210111-PH-JBS01\_0021 (public domain)](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021).
- **Head-and-shoulders portrait, 12 megapixels**: A studio portrait on a plain background, cut to 3:4 and resized to 3024 × 4032 px, then saved as a JPEG at quality 92%, the size and shape a phone camera saves held upright. Source: [NASA, jsc2025e068207\_alt (public domain)](https://images.nasa.gov/details/jsc2025e068207_alt).
- **Busy outdoor scene, 6 megapixels**: Wading birds in rippled water, 3008 × 2000 px, used exactly as published (a 1.9 MB JPEG). Fine detail everywhere, with few plain areas. Source: [NASA, KSC-08pd4102 (public domain)](https://images.nasa.gov/details/KSC-08pd4102).
- **Page of typed text, US Letter at 300 dpi**: A page of dark serif text on off-white paper, 2550 × 3300 px (8.5 × 11 inches at 300 dots per inch), drawn for this test and saved as a JPEG at quality 92%, like a phone scanning app. Source: Drawn for this test; the text is the opening of the US Declaration of Independence (public domain).

> Results from the tool run in Chromium 149.0.7827.55 on 2026-10-31. Other browsers have their own JPEG encoders, so the same photo can come out a few percent different there; it still fits the limit.

## Sources

- [NASA, KSC-20210111-PH-JBS01\_0021 (public domain)](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt (public domain)](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 (public domain)](https://images.nasa.gov/details/KSC-08pd4102)

## Questions

### Does 20 KB mean 20,000 or 20,480 bytes?

It depends on the form. The tool keeps the file under 20,000 bytes, so it fits both readings.

### Will my photo be uploaded to make it 20 KB?

No. The page shrinks the photo inside your browser and has no code that sends it anywhere. Your browser's network panel will show no upload.

## Related

- [Compress an image to 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-50kb/)
- [What every size limit does to a photo](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)
- [KB or KiB: 1,000 or 1,024 bytes](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/)
- [Image to size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-20kb/  
Data as of: 2026-10-31  
CSV: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-20kb.csv
