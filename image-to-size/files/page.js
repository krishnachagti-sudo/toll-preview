// The Image to size page. Everything happens in this browser tab: the photo is decoded, drawn
// to a canvas and re-encoded here, and nothing is sent anywhere. core.js decides which scale
// and quality to try; this file only knows how to encode and how to show the result.
import { fitToSize, PRESETS, BYTES_PER_KB } from './core.js';

const T = window.Endwise;
const h = T.h;

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_KB = 100000;
// Phones and some browsers refuse canvases past roughly this many pixels.
const MAX_PIXELS = 16000000;

const $ = (id) => document.getElementById(id);
const els = {
  form: $('its-form'), file: $('its-file'), drop: $('its-drop'), dropText: $('its-drop-text'), dropNote: $('its-file-note'),
  dropIcon: document.querySelector('.its-drop-icon'),
  fileErr: $('its-file-err'), chips: $('its-chips'), kb: $('its-kb'), kbErr: $('its-kb-err'),
  go: $('its-go'), status: $('its-status'), out: $('its-out'),
};

const state = {
  file: null, source: null, previewUrl: null, resultUrl: null,
  kb: 50, run: 0, busy: false,
};

// ---------- formatting ----------
// Sizes round down, so a photo that fits is never shown as reaching the limit when it is under it.
function bytesText(n) {
  if (n < BYTES_PER_KB) return `${n} B`;
  if (n < BYTES_PER_KB * BYTES_PER_KB) return `${(Math.floor(n / (BYTES_PER_KB / 10)) / 10).toFixed(1)} KB`;
  return `${(Math.floor(n / (BYTES_PER_KB * BYTES_PER_KB / 100)) / 100).toFixed(2)} MB`;
}
const kbText = (kb) => `${kb.toLocaleString('en-US')} KB`;
const dimsText = (w, hgt) => `${w.toLocaleString('en-US')} × ${hgt.toLocaleString('en-US')} px`;
const stemOf = (name) => (name.replace(/\.[^.]*$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'photo').slice(0, 60);

function say(text) { els.status.textContent = text; }

// ---------- target chips and custom box ----------
function readKb() {
  const raw = els.kb.value.trim();
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= MAX_KB ? n : null;
}

function paintTarget() {
  [].forEach.call(els.chips.children, (b) => b.setAttribute('aria-pressed', String(Number(b.dataset.kb) === state.kb)));
  els.go.textContent = `Shrink to ${kbText(state.kb)}`;
}

function buildChips() {
  PRESETS.forEach((kb) => {
    els.chips.appendChild(h('button', {
      type: 'button', class: 'its-chip', 'data-kb': String(kb), 'aria-pressed': 'false',
      onclick: () => {
        state.kb = kb;
        els.kb.value = String(kb);
        els.kbErr.textContent = '';
        paintTarget();
        if (state.source) shrink();
      },
    }, kbText(kb)));
  });
}

els.kb.addEventListener('input', () => {
  const kb = readKb();
  if (kb === null) {
    els.kbErr.textContent = `Enter a whole number of KB from 1 to ${MAX_KB.toLocaleString('en-US')}.`;
    return;
  }
  els.kbErr.textContent = '';
  state.kb = kb;
  paintTarget();
});

// ---------- picking a photo ----------
async function decode(file) {
  if (window.createImageBitmap) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { image: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch (e) { /* An older browser: fall through to an image element. */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { image: img, width: img.naturalWidth, height: img.naturalHeight, release: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function setDropFile(file, source) {
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = URL.createObjectURL(file);
  els.dropIcon.textContent = '';
  els.dropIcon.classList.add('has-photo');
  els.dropIcon.appendChild(h('img', { src: state.previewUrl, alt: '' }));
  els.dropText.textContent = file.name;
  els.dropNote.textContent = `${bytesText(file.size)}, ${dimsText(source.width, source.height)}. Choose another to replace it.`;
}

async function takeFile(file) {
  els.fileErr.textContent = '';
  if (!file) return;
  if (file.type && !TYPES.includes(file.type)) {
    els.fileErr.textContent = 'That file is not a JPEG, PNG or WebP photo. Choose a different file.';
    return;
  }
  let source;
  try {
    source = await decode(file);
  } catch (e) {
    els.fileErr.textContent = 'We could not read that photo. Try another JPEG, PNG or WebP file.';
    return;
  }
  if (!source.width || !source.height) {
    els.fileErr.textContent = 'We could not read that photo. Try another JPEG, PNG or WebP file.';
    return;
  }
  if (state.source) state.source.release();
  state.file = file;
  state.source = source;
  setDropFile(file, source);
  els.go.disabled = false;
  shrink();
}

els.file.addEventListener('change', () => {
  const file = els.file.files && els.file.files[0];
  takeFile(file);
  els.file.value = '';
});

['dragenter', 'dragover'].forEach((type) => els.drop.addEventListener(type, (ev) => {
  ev.preventDefault();
  els.drop.classList.add('is-over');
}));
['dragleave', 'drop'].forEach((type) => els.drop.addEventListener(type, () => els.drop.classList.remove('is-over')));
els.drop.addEventListener('drop', (ev) => {
  ev.preventDefault();
  takeFile(ev.dataTransfer && ev.dataTransfer.files[0]);
});
// A photo dropped just outside the box would otherwise make the browser open it and leave the page.
['dragover', 'drop'].forEach((type) => window.addEventListener(type, (ev) => ev.preventDefault()));

// ---------- shrinking ----------
function makeEncoder(source, targetBytes, run) {
  const baseScale = Math.min(1, Math.sqrt(MAX_PIXELS / (source.width * source.height)));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const kept = new Map();
  const sizeFor = (scale) => ({
    w: Math.max(1, Math.round(source.width * baseScale * scale)),
    h: Math.max(1, Math.round(source.height * baseScale * scale)),
  });

  async function encode(scale, quality) {
    if (run !== state.run) throw new Error('stale');
    const { w, h: hgt } = sizeFor(scale);
    canvas.width = w;
    canvas.height = hgt;
    // JPEG has no see-through: lay the picture on white so clear areas do not turn black.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, hgt);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source.image, 0, 0, w, hgt);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) throw new Error('encode_failed');
    // Only a blob that fits can be the answer, so only those are kept.
    if (blob.size <= targetBytes) kept.set(`${scale}|${quality}`, { blob, width: w, height: hgt });
    return { size: blob.size };
  }
  return { encode, find: (scale, quality) => kept.get(`${scale}|${quality}`) };
}

async function shrink() {
  const kb = readKb();
  if (kb === null) {
    els.kbErr.textContent = `Enter a whole number of KB from 1 to ${MAX_KB.toLocaleString('en-US')}.`;
    return;
  }
  if (!state.source) return;
  state.kb = kb;
  paintTarget();
  const run = ++state.run;
  const { file, source } = state;
  const targetBytes = kb * BYTES_PER_KB;
  state.busy = true;
  els.go.disabled = true;
  say('Working on it.');
  showWorking();

  try {
    // A JPEG that is already small enough is the best copy: the file you chose, untouched.
    // Any other format still goes through the encoder, since forms usually want a JPEG.
    if (file.type === 'image/jpeg' && file.size <= targetBytes) {
      if (run !== state.run) return;
      showResult({ kb, file, source, blob: file, size: file.size, width: source.width, height: source.height, quality: null, unchanged: true });
      say(`Your photo is already ${bytesText(file.size)}, under the limit.`);
      return;
    }
    const enc = makeEncoder(source, targetBytes, run);
    const fit = await fitToSize({ targetBytes, encode: enc.encode });
    if (run !== state.run) return;
    const found = enc.find(fit.scale, fit.quality);
    showResult({ kb, file, source, blob: found.blob, size: found.blob.size, width: found.width, height: found.height, quality: fit.quality, unchanged: false });
    say(`Done. The new photo is ${bytesText(found.blob.size)}.`);
  } catch (e) {
    if (run !== state.run || e.message === 'stale') return;
    if (e.message === 'too_small') {
      showProblem(`This photo cannot get under ${kbText(kb)}, even at a tenth of its size. Try a larger limit.`);
      say('The photo could not be made that small.');
    } else {
      showProblem('Your browser could not shrink this photo. Try a smaller photo, or another browser.');
      say('Something went wrong.');
    }
  } finally {
    if (run === state.run) {
      state.busy = false;
      els.go.disabled = false;
    }
  }
}

els.form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  shrink();
});

// ---------- the readout ----------
function clearOut() {
  els.out.textContent = '';
  if (state.resultUrl) {
    URL.revokeObjectURL(state.resultUrl);
    state.resultUrl = null;
  }
}

function gauge(pct, label, limitText) {
  const fill = h('div', { class: 'its-gauge-fill' });
  fill.style.width = `${pct}%`;
  const needle = h('span', { class: 'its-gauge-needle' });
  needle.style.left = `${pct}%`;
  return h('div', { class: 'its-gauge', role: 'img', 'aria-label': label }, [
    h('div', { class: 'its-gauge-track' }, [fill, needle]),
    h('div', { class: 'its-gauge-marks', 'aria-hidden': 'true' }, [h('span', null, '0'), h('span', null, `Your limit, ${limitText}`)]),
  ]);
}

function showWorking() {
  clearOut();
  els.out.appendChild(h('div', { class: 'its-working' }, [
    h('div', { class: 'its-gauge', 'aria-hidden': 'true' }, [
      h('div', { class: 'its-gauge-track' }, [h('span', { class: 'its-gauge-needle its-sweep' })]),
    ]),
    h('p', { class: 'muted' }, 'Weighing your photo against the limit.'),
  ]));
}

function showProblem(text) {
  clearOut();
  els.out.appendChild(h('p', { class: 'form-error', role: 'alert' }, text));
}

function bar(label, value, ratio, modifier) {
  const fill = h('span', { class: `its-bar-fill ${modifier}` });
  fill.style.width = `${Math.max(2, Math.min(100, ratio * 100))}%`;
  return h('div', { class: 'its-bar' }, [
    h('span', { class: 'its-bar-label' }, label),
    h('span', { class: 'its-bar-track', 'aria-hidden': 'true' }, [fill]),
    h('span', { class: 'its-bar-value num' }, value),
  ]);
}

function showResult({ kb, file, source, blob, size, width, height, quality, unchanged }) {
  clearOut();
  const targetBytes = kb * BYTES_PER_KB;
  const pct = Math.floor((size / targetBytes) * 100);
  state.resultUrl = URL.createObjectURL(blob);
  const stem = stemOf(file.name);
  const downloadName = unchanged ? file.name : `${stem}-${kb}kb.jpg`;

  const reduced = unchanged
    ? 'Your photo is already under the limit, so we return the original file as it is. Its camera details, including location if your camera saved it, are kept.'
    : `${Math.max(0, Math.floor((1 - size / file.size) * 100))}% smaller than the original.`;

  const afterRows = [
    h('dt', null, 'Size'), h('dd', { class: 'num' }, bytesText(size)),
    h('dt', null, 'Dimensions'), h('dd', { class: 'num' }, dimsText(width, height)),
    h('dt', null, unchanged ? 'Format' : 'Quality used'),
    h('dd', { class: 'num' }, unchanged ? 'Unchanged' : `${Math.round(quality * 100)}%, saved as JPEG`),
  ];

  const preview = h('img', { class: 'its-preview', src: state.resultUrl, alt: 'The shrunk photo, shown as it will download', width: String(width), height: String(height) });
  const download = h('a', { class: 'btn its-download', href: state.resultUrl, download: downloadName }, `Download ${downloadName}`);

  els.out.appendChild(h('div', { class: 'its-result' }, [
    h('p', { class: 'its-stamp' }, unchanged ? 'Already fits' : 'Fits'),
    h('p', { class: 'its-big num' }, [bytesText(size), h('small', null, ` of ${kbText(kb)}`)]),
    gauge(Math.min(100, pct), `The new photo is ${pct}% of your ${kbText(kb)} limit.`, kbText(kb)),
    h('p', { class: 'its-sub' }, `${unchanged ? '' : `It uses ${pct}% of your limit. `}${reduced}`),

    h('div', { class: 'its-ba' }, [
      h('div', { class: 'its-readout' }, [
        h('div', { class: 'its-readout-col' }, [
          h('p', { class: 'its-col-title' }, 'Before'),
          h('dl', null, [
            h('dt', null, 'Size'), h('dd', { class: 'num' }, bytesText(file.size)),
            h('dt', null, 'Dimensions'), h('dd', { class: 'num' }, dimsText(source.width, source.height)),
            h('dt', null, 'Format'), h('dd', null, file.type ? file.type.replace('image/', '').toUpperCase() : 'Photo'),
          ]),
        ]),
        h('div', { class: 'its-readout-col its-after' }, [
          h('p', { class: 'its-col-title' }, 'After'),
          h('dl', null, afterRows),
        ]),
      ]),
    ]),

    h('div', { class: 'its-bars' }, [
      bar('Before', bytesText(file.size), 1, 'is-before'),
      bar('After', bytesText(size), size / file.size, 'is-after'),
    ]),

    h('div', { class: 'its-preview-wrap' }, [preview]),
    h('div', { class: 'its-actions' }, [download]),
  ]));
}

// ---------- the limit from the address ----------
// A link may carry the limit (?kb=240): the page opens with it chosen, so a page about one size
// can hand over to the tool ready to go. Anything that is not a whole number of KB from 1 to the
// maximum is ignored and the default stays.
function kbFromQuery() {
  const raw = (new URLSearchParams(window.location.search).get('kb') || '').trim();
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= MAX_KB ? n : null;
}

// ---------- start ----------
buildChips();
const preset = kbFromQuery();
if (preset !== null) {
  state.kb = preset;
  els.kb.value = String(preset);
}
paintTarget();
