# Compress an image to 100 KB

Image to size makes a JPEG, PNG or WebP image 100 KB or smaller and saves it as a JPEG, in your browser. In our test, a 12-megapixel photo came out at 99.0 KB, at 2,476 × 1,857 px, 38% of its pixels, with JPEG quality 40%.

- 12 MP photo became: 99.0 KB
- Its size in pixels: 2,476 × 1,857 px
- JPEG quality: 40%
- Limit in bytes: 100,000

## Shrink your photo to 100 KB

[Open the tool at 100 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=100)

## Four photos, made 100 KB

What the tool produced at a 100 KB limit (100,000 bytes)

| Photo | Before | After | Pixels | Quality | Pixels kept |
| --- | --- | ---: | ---: | ---: | ---: |
| Landscape photo, 12 megapixels | 4,032 × 3,024 px, 2.08 MB | 99.0 KB | 2,476 × 1,857 px | 40% | 38% |
| Head-and-shoulders portrait, 12 megapixels | 3,024 × 4,032 px, 2.14 MB | 97.7 KB | 1,141 × 1,521 px | 37% | 14% |
| Busy outdoor scene, 6 megapixels | 3,008 × 2,000 px, 1.91 MB | 99.9 KB | 964 × 641 px | 45% | 10% |
| Page of typed text, US Letter at 300 dpi | 2,550 × 3,300 px, 1.11 MB | 98.9 KB | 817 × 1,058 px | 48% | 10% |

> Each result is under 100,000 bytes. Quality is the JPEG quality the tool settled on (35% to 92%).

## What 100 KB does to a photo

100 KB is too small for a 12-megapixel photo at full size, even at the lowest quality the tool will use (35%). So it makes the picture smaller: our landscape photo came out at 2,476 × 1,857 px, about 4.6 megapixels instead of 12.2. That is the trade the tool makes on purpose: it will not save below 35% quality, so the picture gets smaller instead.

A page of text at 100 KB came out at 817 × 1,058 px. That is the detail of a letter-size page scanned at about 96 dpi, against the 300 dpi it was drawn at.

For comparison, the same 12-megapixel photo at [50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-50kb/) came out at 1,521 × 1,141 px, quality 40%, and at [200 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-200kb/) came out at 3,427 × 2,570 px, quality 48%.

## Is 100 KB 100,000 or 102,400 bytes?

Forms rarely say. 100 KB is 100,000 bytes when a KB is 1,000 bytes, and 102,400 bytes when it is 1,024. The tool aims under 100,000 bytes, the smaller of the two, so its result passes either way. [Why KB has two meanings](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/).

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

### Does 100 KB mean 100,000 or 102,400 bytes?

It depends on the form. The tool keeps the file under 100,000 bytes, so it fits both readings.

### Will my photo be uploaded to make it 100 KB?

No. The page shrinks the photo inside your browser and has no code that sends it anywhere. Your browser's network panel will show no upload.

## Related

- [Compress an image to 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-50kb/)
- [Compress an image to 200 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-200kb/)
- [What every size limit does to a photo](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)
- [KB or KiB: 1,000 or 1,024 bytes](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/)
- [Image to size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-100kb/  
Data as of: 2026-10-31  
CSV: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-100kb.csv
