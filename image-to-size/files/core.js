// Image to size: the search that squeezes a picture under a byte limit. Pure, no imports, so
// the page loads this very file in the browser and the tests run it in Node.
//
// The search does not know what an image is. It is handed encode(scale, quality), which
// returns the size in bytes a picture would have at that scale (1 = original dimensions) and
// JPEG quality (0 to 1), and it finds the least-shrunk setting that fits.

// Target sizes in KB offered as presets. A KB here is 1000 bytes, so a result that fits also
// fits a form that counts in 1024s.
export const PRESETS = [20, 50, 100, 200, 500, 1000];
export const BYTES_PER_KB = 1000;

const SEARCH_STEPS = 7;

export async function fitToSize({
  targetBytes,
  encode,
  minQuality = 0.35,
  maxQuality = 0.92,
  scaleStep = 0.85,
  minScale = 0.1,
}) {
  // Bad options would make the scale loop run forever or never start, so refuse them up front.
  if (typeof targetBytes !== 'number' || !Number.isFinite(targetBytes) || targetBytes <= 0) {
    throw new RangeError('targetBytes must be a positive, finite number of bytes');
  }
  if (typeof encode !== 'function') throw new TypeError('encode must be a function');
  if (!(scaleStep > 0 && scaleStep < 1)) throw new RangeError('scaleStep must be above 0 and below 1');
  if (!(minScale > 0 && minScale <= 1)) throw new RangeError('minScale must be above 0 and at most 1');
  if (!(minQuality > 0 && minQuality <= maxQuality && maxQuality <= 1)) {
    throw new RangeError('quality must satisfy 0 < minQuality <= maxQuality <= 1');
  }
  const fits = (r) => r.size <= targetBytes;

  // The original dimensions at the top quality: if that already fits, change nothing more.
  const original = await encode(1, maxQuality);
  if (fits(original)) return { scale: 1, quality: maxQuality, size: original.size };

  for (let scale = 1; scale >= minScale; scale *= scaleStep) {
    // Even the lowest quality is too big at this scale: shrink the picture and try again.
    const floor = await encode(scale, minQuality);
    if (!fits(floor)) continue;

    // Halve the quality range seven times, keeping the highest quality that fits.
    let best = { scale, quality: minQuality, size: floor.size };
    let low = minQuality;
    let high = maxQuality;
    for (let i = 0; i < SEARCH_STEPS; i++) {
      const quality = (low + high) / 2;
      const r = await encode(scale, quality);
      if (fits(r)) {
        best = { scale, quality, size: r.size };
        low = quality;
      } else {
        high = quality;
      }
    }
    return best;
  }
  throw new Error('too_small');
}
