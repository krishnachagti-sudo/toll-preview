# How Image to size shrinks a photo to a KB limit

The search tries the original size at quality 0.92 first, then shrinks the scale by 15% at a time and binary-searches JPEG quality in 7 steps, and keeps the highest quality at the largest scale that fits. A KB here is 1000 bytes, so a result that fits also fits a form that counts in 1,024s.

## How does it work?

1. If the photo is already a JPEG no larger than the limit, it is returned untouched.
2. Otherwise the original dimensions are encoded at the top quality (0.92). If that fits, nothing more is changed.
3. If not, the scale is multiplied by 0.85 at a time, from 1 down to a floor of 0.1. At each scale the lowest quality (0.35) is tried first.
4. At the first scale where the lowest quality fits, the quality range from 0.35 to 0.92 is halved 7 times, keeping the highest quality that fits.
5. The search does not know what an image is.

## What does it not cover?

- If the photo cannot get under the limit even at a tenth of its size, the tool says so and suggests a larger limit.
- Browsers refuse canvases past roughly 16 million pixels, so very large photos may fail.
- The result is a JPEG. Transparency is not kept.
- There is no official example to compare with. It does not know any form's other rules, such as pixel dimensions.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 2 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): It uses no outside data, so there is nothing to go out of date.
- [Tested: 1 check in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check that the result fits the target size, never drops below the minimum quality, gives the same answer for the same input, stops its search at a limit, and that the page has no upload code.

- [WHATWG HTML Standard: HTMLCanvasElement toBlob()](https://html.spec.whatwg.org/multipage/canvas.html#dom-canvas-toblob)
- [NIST: Prefixes for binary multiples](https://physics.nist.gov/cuu/Units/binary.html)

> Uses no outside data. The photo is shrunk in your browser and never leaves your device, so there is no source to read and nothing to go out of date.

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the image to size compute?

The tool shrinks a photo to fit under a size limit such as 50 KB or 200 KB for upload forms. It runs in the browser: the photo is decoded, drawn to a canvas and re-encoded on your device, and nothing is sent anywhere.

**In detail: inputs and outputs**

Inputs:

- `photo`: A JPEG, PNG or WebP file.
- `limit`: The target size in KB, from the presets 20, 50, 100, 200, 500 and 1,000 or your own number.

Outputs:

- a JPEG at the least-shrunk setting that fits
- its size, dimensions and quality
- a message when it cannot fit

**Every step in full (5)**

1. If the photo is already a JPEG no larger than the limit, it is returned untouched.
2. Otherwise the original dimensions are encoded at the top quality (0.92). If that fits, nothing more is changed.
3. If not, the scale is multiplied by 0.85 at a time, from 1 down to a floor of 0.1. At each scale the lowest quality (0.35) is tried first. If even that is too big, the picture is shrunk again.
4. At the first scale where the lowest quality fits, the quality range from 0.35 to 0.92 is halved 7 times, keeping the highest quality that fits.
5. The search does not know what an image is. It is handed an encode function that returns a size in bytes, so the same code is tested in Node and run in the browser.

## Which edge cases does it handle?

**The edge cases (4)**

- A JPEG already under the limit is the best copy and is not re-encoded.
- A PNG or WebP always goes through the encoder, since forms usually want a JPEG.
- Bad options (a zero limit, a scale step outside 0 to 1) are refused before the search starts.
- The search is bounded: it stops at the scale floor and at 7 quality steps.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**The search on a stand-in encoder**

The search on a stand-in encoder

| Result | Value |
| --- | --- |
| target | 200 KB = 200,000 bytes |
| original at quality 0.92 | 1,840,000 bytes, too big |
| encoder calls | 13 |
| chosen scale | 0.5220 |
| chosen quality | 0.363 |
| size | 198,024 bytes |

**The input**

```json
{
  "targetKb": 200,
  "encoder": "size = 2,000,000 x scale x scale x quality bytes (made up, to show the steps)"
}
```

## How is it tested?

**What its test suite asserts (1)**

- There is no official example to compare with. The tests check that the result fits the target size, never drops below the minimum quality, gives the same answer for the same input, stops its search at a limit, and that the page has no upload code.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Image to size tool](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/).

## Questions

### Is there any AI in the image to size answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the image to size refuse to answer?

If the photo cannot get under the limit even at a tenth of its size, the tool says so and suggests a larger limit. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Image to size tool](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [KB or KiB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/kb-or-kib/)
- [Reduce image size in KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/image-to-size/  
Data as of: 2026-11-04
