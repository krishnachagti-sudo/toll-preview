# Why a form refuses your photo upload

Most refusals come down to 3 things: the size in KB, the file format, or the photo itself. Check them in that order; for size, a photo shrunk for a 50 KB limit should be just under it (our test photo came out at 49.0 KB).

## The checks, in order

| What the form says | Likely cause | Fix |
| --- | --- | --- |
| File too large | Over the maximum KB | Shrink it to the maximum with Image to size |
| File too small | Under the minimum KB | Start from the original photo; a shrunk copy cannot get its detail back |
| Invalid file type | PNG, WebP or HEIC where JPG is asked | Save as JPEG; Image to size always outputs JPEG |
| Invalid dimensions | Pixel size outside the form's range | Crop or resize to the pixels stated; see cm to pixels |
| Photo not clear or not acceptable | Background, face size, glasses, mask or blur | Retake as the form describes |

## Shrink a photo to the form's maximum

[Open the tool at 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/?kb=50)

## Where to read the real limits

On the issuing body's own notice, bulletin or form page, which can change between years. For example, the JEE (Main) 2027 limits are in NTA's bulletin: [JEE (Main) 2027 photo size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/jee-main-2027-photo-size/); the US visa photo limits are on [DS-160 photo size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/ds-160-photo-size/).

> Results from the tool run in Chromium 149.0.7827.55 on 2026-10-31. Other browsers have their own JPEG encoders, so a result can differ by a few percent; it still fits the limit.

## Steps

1. **Read the limits again.** Note the minimum and maximum size, the format, and any pixel size, from the notice or bulletin, not from a third-party page.
2. **Check the file size.** Look at the file's size in your file manager. Over the maximum: shrink it. Under the minimum: start from the original photo.
3. **Check the format.** If the form asks for JPG or JPEG, a PNG, WebP or HEIC file is refused even at the right size. Save or convert it as JPEG.
4. **Check the content.** Background color, face size, glasses or a mask, and a signature on plain white paper, as the form describes.
5. **Upload the new file.** Make sure you choose the new file, not the old one with a similar name.

## Questions

### Can I upload a PNG if the form says JPG?

Usually not: the form checks the format. Image to size always saves a JPEG, so a PNG or WebP you put in comes out as a JPEG.

### My file is 50 KB but the form says it is too big. Why?

Some forms count 1 KB as 1,024 bytes and some as 1,000, and a file manager may round. Aim just under the limit in bytes, such as under 50,000 bytes for 50 KB.

## Related

- [A photo between 20 KB and 50 KB](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/photo-between-20kb-and-50kb/)
- [Photo size in cm to pixels](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/photo-size-cm-to-pixels/)
- [JEE (Main) 2027 photo size](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/jee-main-2027-photo-size/)
- [What every size limit does to a photo](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/image-to-size/photo-upload-rejected/  
Data as of: 2026-11-06
