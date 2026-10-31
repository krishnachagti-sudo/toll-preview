# Compress an image to 1 MB

Image to size makes a JPEG, PNG or WebP image 1 MB or smaller and saves it as a JPEG, in your browser. In our test, a 12-megapixel photo came out at 916.5 KB, still at its full 4,032 × 3,024 px, with JPEG quality lowered to 81%.

- 12 MP photo became: 916.5 KB
- Its size in pixels: 4,032 × 3,024 px
- JPEG quality: 81%
- Limit in bytes: 1,000,000

## Shrink your photo to 1 MB

[Open the tool at 1 MB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=1000)

## Four photos, made 1 MB

What the tool produced at a 1 MB limit (1,000,000 bytes)

| Photo | Before | After | Pixels | Quality | Pixels kept |
| --- | --- | ---: | ---: | ---: | ---: |
| Landscape photo, 12 megapixels | 4,032 × 3,024 px, 2.08 MB | 916.5 KB | 4,032 × 3,024 px | 81% | 100% |
| Head-and-shoulders portrait, 12 megapixels | 3,024 × 4,032 px, 2.14 MB | 986.1 KB | 3,024 × 4,032 px | 75% | 100% |
| Busy outdoor scene, 6 megapixels | 3,008 × 2,000 px, 1.91 MB | 986.6 KB | 3,008 × 2,000 px | 72% | 100% |
| Page of typed text, US Letter at 300 dpi | 2,550 × 3,300 px, 1.11 MB | 990.8 KB | 2,550 × 3,300 px | 87% | 100% |

> Each result is under 1,000,000 bytes. Quality is the JPEG quality the tool settled on (35% to 92%).

## What 1 MB does to a photo

1 MB is enough room for a 12-megapixel photo to keep every pixel: the tool only lowers the JPEG quality, to 81% for our landscape photo. The picture stays as large as the original; at lower JPEG quality, smooth areas such as sky can show faint blocks and fine edges soften.

A page of text at 1 MB came out at 2,550 × 3,300 px, its full size. That is the detail of a letter-size page scanned at about 300 dpi.

For comparison, the same 12-megapixel photo at [500 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-500kb/) came out at 4,032 × 3,024 px, quality 65%.

## Is 1 MB 1,000,000 or 1,024,000 bytes?

Forms rarely say. 1 MB is 1,000,000 bytes when a KB is 1,000 bytes, and 1,024,000 bytes when it is 1,024. The tool aims under 1,000,000 bytes, the smaller of the two, so its result passes either way. [Why KB has two meanings](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/).

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

### Does 1 MB mean 1,000,000 or 1,024,000 bytes?

It depends on the form. The tool keeps the file under 1,000,000 bytes, so it fits both readings.

### Will my photo be uploaded to make it 1 MB?

No. The page shrinks the photo inside your browser and has no code that sends it anywhere. Your browser's network panel will show no upload.

## Related

- [Compress an image to 500 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-500kb/)
- [What every size limit does to a photo](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)
- [KB or KiB: 1,000 or 1,024 bytes](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/)
- [Image to size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-1mb/  
Data as of: 2026-10-31  
CSV: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-1mb.csv
