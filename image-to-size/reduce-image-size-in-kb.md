# Reduce an image to a size in KB

To reduce an image to a size in KB, set the limit and let the tool keep the highest JPEG quality that fits, shrinking the picture only when it must. In our test a 12-megapixel photo kept its full 4,032 × 3,024 px from 240 KB up, and had to be made smaller at 200 KB and below.

## Reduce your photo to a size in KB

[Open the tool at 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=50)

## Each limit, four photos

Pixels and JPEG quality the tool settled on at each limit (Chromium 149.0.7827.55, 2026-10-31)

| Limit | Landscape photo | Head-and-shoulders portrait | Busy outdoor scene | Page of typed text |
| --- | ---: | ---: | ---: | ---: |
| [20 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-20kb/) | 794 × 595 px, 38% | 366 × 487 px, 46% | 428 × 284 px, 41% | 363 × 469 px, 44% |
| [50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-50kb/) | 1,521 × 1,141 px, 40% | 700 × 934 px, 41% | 697 × 463 px, 40% | 591 × 764 px, 37% |
| [100 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-100kb/) | 2,476 × 1,857 px, 40% | 1,141 × 1,521 px, 37% | 964 × 641 px, 45% | 817 × 1,058 px, 48% |
| [200 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-200kb/) | 3,427 × 2,570 px, 48% | 1,857 × 2,476 px, 35% | 1,570 × 1,044 px, 35% | 1,331 × 1,723 px, 44% |
| [240 KB (US visa photo)](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/ds-160-photo-size/) | 4,032 × 3,024 px, 40% | 1,857 × 2,476 px, 46% | 1,570 × 1,044 px, 47% | 1,566 × 2,027 px, 38% |
| [500 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-500kb/) | 4,032 × 3,024 px, 65% | 3,024 × 4,032 px, 41% | 2,557 × 1,700 px, 43% | 2,550 × 3,300 px, 38% |
| [1 MB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-1mb/) | 4,032 × 3,024 px, 81% | 3,024 × 4,032 px, 75% | 3,008 × 2,000 px, 72% | 2,550 × 3,300 px, 87% |

> Starting sizes: landscape photo 4,032 × 3,024 px (2.08 MB), head-and-shoulders portrait 3,024 × 4,032 px (2.14 MB), busy outdoor scene 3,008 × 2,000 px (1.91 MB) and page of typed text 2,550 × 3,300 px (1.11 MB).

## Reading the table

Quality never goes below 35%, so at small limits the pixels go first. Between neighbouring limits the tool can trade one for the other: a 12-megapixel photo at 200 KB came out at 3,427 × 2,570 px and 48% quality, and at 240 KB at its full size and 40%.

Photos with detail everywhere need more bytes for the same pixels than photos with plain areas, which is why the busy scene shrinks furthest.

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

## Steps

1. **Choose the photo.** Open Image to size and drop in a JPEG, PNG or WebP. It stays in your browser.
2. **Set the limit.** Pick a size such as 50 KB, or type the limit the form gives you in KB.
3. **Let it search.** The tool keeps the full size and lowers JPEG quality as far as 35%; only if that is not enough does it make the picture smaller.
4. **Download.** Download the JPEG. The result shows its size, pixels and quality next to the original.

## Related

- [Compress an image to 20 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-20kb/)
- [Compress an image to 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-50kb/)
- [Compress an image to 100 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-100kb/)
- [Compress an image to 200 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-200kb/)
- [Compress an image to 500 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-500kb/)
- [Compress an image to 1 MB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-1mb/)
- [DS-160 visa photo: 240 kB or less](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/ds-160-photo-size/)
- [KB or KiB: 1,000 or 1,024 bytes](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/  
Data as of: 2026-10-31
