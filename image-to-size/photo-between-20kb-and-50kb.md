# How to make a photo between 20 KB and 50 KB

Set the limit to the top of the range. With 50 KB set, every test photo came out between 49.0 KB and 50 KB, so it also clears a 20 KB minimum; a 12-megapixel portrait came out at 49.9 KB.

## Fit a photo under 50 KB

[Open the tool at 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=50)

## Tested results at 50 KB

| Photo | Result | Pixels | JPEG quality |
| --- | ---: | --- | ---: |
| Landscape photo, 12 megapixels | 49.0 KB | 1,521 × 1,141 px | 40% |
| Head-and-shoulders portrait, 12 megapixels | 49.9 KB | 700 × 934 px | 41% |
| Busy outdoor scene, 6 megapixels | 49.3 KB | 697 × 463 px | 40% |
| Page of typed text, US Letter at 300 dpi | 49.2 KB | 591 × 764 px | 37% |

> Results from the tool run in Chromium 149.0.7827.55 on 2026-10-31. Other browsers have their own JPEG encoders, so a result can differ by a few percent; it still fits the limit.

## Why aim for the top?

More bytes means more detail kept. Aiming for the maximum gives the clearest photo the form allows, and it leaves a wide margin over the minimum.

## When a file is below the minimum

Forms set a minimum so a photo is not too small to recognise. If yours is below it, start again from the original photo (or scan at a higher resolution) and set the limit to the maximum. Making an already small file bigger does not add detail.

## Does the form count 1,000 or 1,024 bytes?

Forms rarely say. The tool counts 1 KB as 1,000 bytes, so a file under 50 KB is under the limit either way. [KB or KiB, explained](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/).

## Questions

### How do I make a photo between 20 KB and 50 KB?

Set the limit to the top of the range, 50 KB. The tool keeps the highest quality that fits, so the result lands just under it: in our tests, between 49.0 KB and 50 KB.

### What if my photo is already under the minimum?

Image to size only makes files smaller; it hands back a JPEG that is already under your limit untouched. Start from the original photo from your camera rather than a copy that was already shrunk.

## Related

- [Compress an image to 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/compress-image-to-50kb/)
- [Why a photo upload is refused](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/photo-upload-rejected/)
- [JEE (Main) 2027 photo size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/jee-main-2027-photo-size/)
- [Image to size or ImResizer?](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/vs-imresizer/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/photo-between-20kb-and-50kb/  
Data as of: 2026-10-31
