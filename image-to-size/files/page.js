// The Image to size page. Everything happens in this browser tab: the photo is decoded, drawn
// to a canvas and re-encoded here, and nothing is sent anywhere. core.js decides which scale
// and quality to try; this file only knows how to encode and how to show the result.
import { fitToSize, PRESETS, BYTES_PER_KB } from './core.js';

const T = window.Endwise;
const h = T.h;

// ---------- words and number formats, by page language ----------
// The page file for a language (page.<code>.html) sets <html lang>; English is the default and its
// output is the original. Numbers follow the language's own habits: 1,234.5 / 1.234,5 / 1 234,5.
const L = (document.documentElement.lang || 'en').slice(0, 2);
const SEPS = {
  en: { g: ',', d: '.', sp: ' ' }, es: { g: ' ', d: ',', sp: ' ' }, de: { g: '.', d: ',', sp: ' ' },
  fr: { g: ' ', d: ',', sp: ' ' }, pt: { g: '.', d: ',', sp: ' ' }, hi: { g: ',', d: '.', sp: ' ' }, ja: { g: ',', d: '.', sp: ' ' },
};
const SEP = SEPS[L] || SEPS.en;
const UNIT = L === 'fr' ? { B: 'o', KB: 'Ko', MB: 'Mo' } : { B: 'B', KB: 'KB', MB: 'MB' };
const PCT = (L === 'de' || L === 'fr' || L === 'es') ? ' %' : '%';
const num = (n) => (L === 'en' ? n.toLocaleString('en-US') : String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, SEP.g));
const dec = (text) => (SEP.d === '.' ? text : text.replace('.', SEP.d));

const EN = {
  shrinkTo: (k) => `Shrink to ${k}`,
  kbErr: (max) => `Enter a whole number of KB from 1 to ${max}.`,
  fileType: 'That file is not a JPEG, PNG or WebP photo. Choose a different file.',
  noRead: 'We could not read that photo. Try another JPEG, PNG or WebP file.',
  replaceNote: (b, d) => `${b}, ${d}. Choose another to replace it.`,
  working: 'Working on it.',
  alreadySay: (b) => `Your photo is already ${b}, under the limit.`,
  doneSay: (b) => `Done. The new photo is ${b}.`,
  tooSmall: (k) => `This photo cannot get under ${k}, even at a tenth of its size. Try a larger limit.`,
  tooSmallSay: 'The photo could not be made that small.',
  fail: 'Your browser could not shrink this photo. Try a smaller photo, or another browser.',
  failSay: 'Something went wrong.',
  weighing: 'Weighing your photo against the limit.',
  limitMark: (k) => `Your limit, ${k}`,
  gaugeLabel: (p, k) => `The new photo is ${p}% of your ${k} limit.`,
  keptNote: 'Your photo is already under the limit, so we return the original file as it is. Its camera details, including location if your camera saved it, are kept.',
  smaller: (p) => `${p}% smaller than the original.`,
  size: 'Size', dims: 'Dimensions', quality: 'Quality used', format: 'Format', unchanged: 'Unchanged',
  qualityVal: (q) => `${q}%, saved as JPEG`,
  before: 'Before', after: 'After', stampKept: 'Already fits', stampFits: 'Fits',
  of: (k) => ` of ${k}`,
  uses: (p) => `It uses ${p}% of your limit. `,
  previewAlt: 'The shrunk photo, shown as it will download',
  download: (n) => `Download ${n}`,
  photo: 'Photo',
};
const TR = {
  es: {
    shrinkTo: (k) => `Reducir a ${k}`,
    kbErr: (max) => `Escriba un número entero de KB, de 1 a ${max}.`,
    fileType: 'Ese archivo no es una foto JPEG, PNG o WebP. Elija otro archivo.',
    noRead: 'No pudimos leer esa foto. Pruebe con otro archivo JPEG, PNG o WebP.',
    replaceNote: (b, d) => `${b}, ${d}. Elija otra para reemplazarla.`,
    working: 'Trabajando en ello.',
    alreadySay: (b) => `Su foto ya pesa ${b}, por debajo del límite.`,
    doneSay: (b) => `Listo. La foto nueva pesa ${b}.`,
    tooSmall: (k) => `Esta foto no baja de ${k}, ni siquiera con una décima parte de su tamaño. Pruebe con un límite mayor.`,
    tooSmallSay: 'No se pudo reducir la foto a ese tamaño.',
    fail: 'Su navegador no pudo reducir esta foto. Pruebe con una foto más pequeña o con otro navegador.',
    failSay: 'Algo salió mal.',
    weighing: 'Comparando su foto con el límite.',
    limitMark: (k) => `Su límite, ${k}`,
    gaugeLabel: (p, k) => `La foto nueva ocupa el ${p}${PCT} de su límite de ${k}.`,
    keptNote: 'Su foto ya está por debajo del límite, así que devolvemos el archivo original tal cual. Conserva los datos de la cámara, incluida la ubicación si su cámara la guardó.',
    smaller: (p) => `${p}${PCT} más pequeña que la original.`,
    size: 'Tamaño', dims: 'Dimensiones', quality: 'Calidad usada', format: 'Formato', unchanged: 'Sin cambios',
    qualityVal: (q) => `${q}${PCT}, guardada como JPEG`,
    before: 'Antes', after: 'Después', stampKept: 'Ya cumple', stampFits: 'Cumple',
    of: (k) => ` de ${k}`,
    uses: (p) => `Usa el ${p}${PCT} de su límite. `,
    previewAlt: 'La foto reducida, tal como se descargará',
    download: (n) => `Descargar ${n}`,
    photo: 'Foto',
  },
  de: {
    shrinkTo: (k) => `Auf ${k} verkleinern`,
    kbErr: (max) => `Geben Sie eine ganze Zahl in KB von 1 bis ${max} ein.`,
    fileType: 'Diese Datei ist kein JPEG-, PNG- oder WebP-Foto. Wählen Sie eine andere Datei.',
    noRead: 'Wir konnten dieses Foto nicht lesen. Versuchen Sie es mit einer anderen JPEG-, PNG- oder WebP-Datei.',
    replaceNote: (b, d) => `${b}, ${d}. Wählen Sie ein anderes Foto, um es zu ersetzen.`,
    working: 'Wird verarbeitet.',
    alreadySay: (b) => `Ihr Foto ist schon ${b} groß und damit unter dem Limit.`,
    doneSay: (b) => `Fertig. Das neue Foto ist ${b} groß.`,
    tooSmall: (k) => `Dieses Foto kommt nicht unter ${k}, auch nicht bei einem Zehntel seiner Größe. Versuchen Sie ein höheres Limit.`,
    tooSmallSay: 'Das Foto ließ sich nicht so klein machen.',
    fail: 'Ihr Browser konnte dieses Foto nicht verkleinern. Versuchen Sie ein kleineres Foto oder einen anderen Browser.',
    failSay: 'Etwas ist schiefgegangen.',
    weighing: 'Ihr Foto wird mit dem Limit abgeglichen.',
    limitMark: (k) => `Ihr Limit, ${k}`,
    gaugeLabel: (p, k) => `Das neue Foto nutzt ${p}${PCT} Ihres Limits von ${k}.`,
    keptNote: 'Ihr Foto liegt schon unter dem Limit, deshalb geben wir die Originaldatei unverändert zurück. Die Kameradaten bleiben erhalten, auch der Aufnahmeort, falls Ihre Kamera ihn gespeichert hat.',
    smaller: (p) => `${p}${PCT} kleiner als das Original.`,
    size: 'Größe', dims: 'Abmessungen', quality: 'Verwendete Qualität', format: 'Format', unchanged: 'Unverändert',
    qualityVal: (q) => `${q}${PCT}, als JPEG gespeichert`,
    before: 'Vorher', after: 'Nachher', stampKept: 'Passt bereits', stampFits: 'Passt',
    of: (k) => ` von ${k}`,
    uses: (p) => `Es nutzt ${p}${PCT} Ihres Limits. `,
    previewAlt: 'Das verkleinerte Foto, so wie es heruntergeladen wird',
    download: (n) => `${n} herunterladen`,
    photo: 'Foto',
  },
  fr: {
    shrinkTo: (k) => `Réduire à ${k}`,
    kbErr: (max) => `Saisissez un nombre entier de Ko, de 1 à ${max}.`,
    fileType: 'Ce fichier n’est pas une photo JPEG, PNG ou WebP. Choisissez un autre fichier.',
    noRead: 'Nous n’avons pas pu lire cette photo. Essayez un autre fichier JPEG, PNG ou WebP.',
    replaceNote: (b, d) => `${b}, ${d}. Choisissez-en une autre pour la remplacer.`,
    working: 'Traitement en cours.',
    alreadySay: (b) => `Votre photo fait déjà ${b}, sous la limite.`,
    doneSay: (b) => `Terminé. La nouvelle photo fait ${b}.`,
    tooSmall: (k) => `Cette photo ne peut pas passer sous ${k}, même réduite au dixième de sa taille. Essayez une limite plus haute.`,
    tooSmallSay: 'La photo n’a pas pu être réduite à cette taille.',
    fail: 'Votre navigateur n’a pas pu réduire cette photo. Essayez une photo plus petite ou un autre navigateur.',
    failSay: 'Un problème est survenu.',
    weighing: 'Comparaison de votre photo avec la limite.',
    limitMark: (k) => `Votre limite, ${k}`,
    gaugeLabel: (p, k) => `La nouvelle photo représente ${p}${PCT} de votre limite de ${k}.`,
    keptNote: 'Votre photo est déjà sous la limite : nous vous rendons donc le fichier d’origine tel quel. Les données de l’appareil photo, dont le lieu si votre appareil l’a enregistré, sont conservées.',
    smaller: (p) => `${p}${PCT} plus légère que l’originale.`,
    size: 'Poids', dims: 'Dimensions', quality: 'Qualité utilisée', format: 'Format', unchanged: 'Inchangé',
    qualityVal: (q) => `${q}${PCT}, enregistrée en JPEG`,
    before: 'Avant', after: 'Après', stampKept: 'Déjà conforme', stampFits: 'Conforme',
    of: (k) => ` sur ${k}`,
    uses: (p) => `Elle utilise ${p}${PCT} de votre limite. `,
    previewAlt: 'La photo réduite, telle qu’elle sera téléchargée',
    download: (n) => `Télécharger ${n}`,
    photo: 'Photo',
  },
  pt: {
    shrinkTo: (k) => `Reduzir para ${k}`,
    kbErr: (max) => `Digite um número inteiro de KB, de 1 a ${max}.`,
    fileType: 'Esse arquivo não é uma foto JPEG, PNG ou WebP. Escolha outro arquivo.',
    noRead: 'Não conseguimos ler essa foto. Tente outro arquivo JPEG, PNG ou WebP.',
    replaceNote: (b, d) => `${b}, ${d}. Escolha outra para substituir.`,
    working: 'Processando.',
    alreadySay: (b) => `Sua foto já tem ${b}, abaixo do limite.`,
    doneSay: (b) => `Pronto. A nova foto tem ${b}.`,
    tooSmall: (k) => `Esta foto não fica abaixo de ${k}, nem com um décimo do tamanho. Tente um limite maior.`,
    tooSmallSay: 'Não foi possível deixar a foto tão pequena.',
    fail: 'Seu navegador não conseguiu reduzir esta foto. Tente uma foto menor ou outro navegador.',
    failSay: 'Algo deu errado.',
    weighing: 'Comparando sua foto com o limite.',
    limitMark: (k) => `Seu limite, ${k}`,
    gaugeLabel: (p, k) => `A nova foto usa ${p}${PCT} do seu limite de ${k}.`,
    keptNote: 'Sua foto já está abaixo do limite, então devolvemos o arquivo original como está. Os dados da câmera, inclusive a localização se a câmera a gravou, são mantidos.',
    smaller: (p) => `${p}${PCT} menor que o original.`,
    size: 'Tamanho', dims: 'Dimensões', quality: 'Qualidade usada', format: 'Formato', unchanged: 'Sem alteração',
    qualityVal: (q) => `${q}${PCT}, salva como JPEG`,
    before: 'Antes', after: 'Depois', stampKept: 'Já cabe', stampFits: 'Cabe',
    of: (k) => ` de ${k}`,
    uses: (p) => `Usa ${p}${PCT} do seu limite. `,
    previewAlt: 'A foto reduzida, como ela será baixada',
    download: (n) => `Baixar ${n}`,
    photo: 'Foto',
  },
  hi: {
    shrinkTo: (k) => `${k} में बदलें`,
    kbErr: (max) => `KB की पूरी संख्या लिखें, 1 से ${max} तक।`,
    fileType: 'यह फ़ाइल JPEG, PNG या WebP फोटो नहीं है। कोई दूसरी फ़ाइल चुनें।',
    noRead: 'हम यह फोटो नहीं पढ़ सके। कोई दूसरी JPEG, PNG या WebP फ़ाइल आज़माएँ।',
    replaceNote: (b, d) => `${b}, ${d}। बदलने के लिए दूसरी फोटो चुनें।`,
    working: 'काम हो रहा है।',
    alreadySay: (b) => `आपकी फोटो पहले से ${b} की है, यानी सीमा के अंदर।`,
    doneSay: (b) => `हो गया। नई फोटो ${b} की है।`,
    tooSmall: (k) => `यह फोटो ${k} से नीचे नहीं आ सकती, अपने आकार के दसवें हिस्से तक छोटी करने पर भी नहीं। बड़ी सीमा आज़माएँ।`,
    tooSmallSay: 'फोटो इतनी छोटी नहीं हो सकी।',
    fail: 'आपका ब्राउज़र यह फोटो छोटी नहीं कर सका। कोई छोटी फोटो या दूसरा ब्राउज़र आज़माएँ।',
    failSay: 'कुछ गड़बड़ हो गई।',
    weighing: 'आपकी फोटो को सीमा से मिलाया जा रहा है।',
    limitMark: (k) => `आपकी सीमा, ${k}`,
    gaugeLabel: (p, k) => `नई फोटो आपकी ${k} की सीमा का ${p}% है।`,
    keptNote: 'आपकी फोटो पहले से सीमा के अंदर है, इसलिए हम असली फ़ाइल जैसी है वैसी ही लौटाते हैं। कैमरे की जानकारी, और लोकेशन अगर कैमरे ने सेव की थी, बनी रहती है।',
    smaller: (p) => `असली फोटो से ${p}% छोटी।`,
    size: 'साइज़', dims: 'आयाम', quality: 'इस्तेमाल की गई क्वालिटी', format: 'फ़ॉर्मैट', unchanged: 'बिना बदलाव',
    qualityVal: (q) => `${q}%, JPEG के रूप में सेव`,
    before: 'पहले', after: 'बाद में', stampKept: 'पहले से सही', stampFits: 'सीमा में',
    of: (k) => `, सीमा ${k}`,
    uses: (p) => `यह आपकी सीमा का ${p}% इस्तेमाल करती है। `,
    previewAlt: 'छोटी की गई फोटो, जैसी डाउनलोड होगी',
    download: (n) => `${n} डाउनलोड करें`,
    photo: 'फोटो',
  },
  ja: {
    shrinkTo: (k) => `${k}以下にする`,
    kbErr: (max) => `KBは1から${max}までの整数で入力してください。`,
    fileType: 'このファイルはJPEG、PNG、WebPの写真ではありません。別のファイルを選んでください。',
    noRead: 'この写真を読み込めませんでした。別のJPEG、PNG、WebPファイルをお試しください。',
    replaceNote: (b, d) => `${b}、${d}。置き換えるには別の写真を選んでください。`,
    working: '処理しています。',
    alreadySay: (b) => `この写真はすでに${b}で、上限以下です。`,
    doneSay: (b) => `完了しました。新しい写真は${b}です。`,
    tooSmall: (k) => `この写真は、元の大きさの10分の1まで小さくしても${k}以下になりません。上限を大きくしてお試しください。`,
    tooSmallSay: 'その大きさまで小さくできませんでした。',
    fail: 'お使いのブラウザでは、この写真を小さくできませんでした。より小さい写真か、別のブラウザをお試しください。',
    failSay: '問題が発生しました。',
    weighing: '写真のサイズを上限と照らし合わせています。',
    limitMark: (k) => `上限 ${k}`,
    gaugeLabel: (p, k) => `新しい写真は上限${k}の${p}%です。`,
    keptNote: 'この写真はすでに上限以下なので、元のファイルをそのまま返します。カメラの情報は、保存されていれば位置情報も含めて残ります。',
    smaller: (p) => `元の写真より${p}%小さくなりました。`,
    size: 'サイズ', dims: '縦横のピクセル数', quality: '使用した画質', format: '形式', unchanged: '変更なし',
    qualityVal: (q) => `${q}%、JPEGで保存`,
    before: '変更前', after: '変更後', stampKept: 'すでに収まっています', stampFits: '収まりました',
    of: (k) => `（上限 ${k}）`,
    uses: (p) => `上限の${p}%を使っています。`,
    previewAlt: '小さくした写真（ダウンロードされる状態）',
    download: (n) => `${n} をダウンロード`,
    photo: '写真',
  },
};
const tx = (key, ...args) => {
  const v = TR[L] && TR[L][key] !== undefined ? TR[L][key] : EN[key];
  return typeof v === 'function' ? v(...args) : v;
};

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
  kb: 50, run: 0, busy: false, sample: false,
};

// ---------- formatting ----------
// Sizes round down, so a photo that fits is never shown as reaching the limit when it is under it.
function bytesText(n) {
  if (n < BYTES_PER_KB) return `${n}${SEP.sp}${UNIT.B}`;
  if (n < BYTES_PER_KB * BYTES_PER_KB) return `${dec((Math.floor(n / (BYTES_PER_KB / 10)) / 10).toFixed(1))}${SEP.sp}${UNIT.KB}`;
  return `${dec((Math.floor(n / (BYTES_PER_KB * BYTES_PER_KB / 100)) / 100).toFixed(2))}${SEP.sp}${UNIT.MB}`;
}
const kbText = (kb) => `${num(kb)}${SEP.sp}${UNIT.KB}`;
const dimsText = (w, hgt) => `${num(w)} × ${num(hgt)} px`;
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
  els.go.textContent = tx('shrinkTo', kbText(state.kb));
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
    els.kbErr.textContent = tx('kbErr', num(MAX_KB));
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
  els.dropNote.textContent = tx('replaceNote', bytesText(file.size), dimsText(source.width, source.height));
}

async function takeFile(file, sample = false) {
  state.sample = sample;
  els.fileErr.textContent = '';
  if (!file) return;
  if (file.type && !TYPES.includes(file.type)) {
    els.fileErr.textContent = tx('fileType');
    return;
  }
  let source;
  try {
    source = await decode(file);
  } catch (e) {
    els.fileErr.textContent = tx('noRead');
    return;
  }
  if (!source.width || !source.height) {
    els.fileErr.textContent = tx('noRead');
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
    els.kbErr.textContent = tx('kbErr', num(MAX_KB));
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
  say(tx('working'));
  showWorking();

  try {
    // A JPEG that is already small enough is the best copy: the file you chose, untouched.
    // Any other format still goes through the encoder, since forms usually want a JPEG.
    if (file.type === 'image/jpeg' && file.size <= targetBytes) {
      if (run !== state.run) return;
      showResult({ kb, file, source, blob: file, size: file.size, width: source.width, height: source.height, quality: null, unchanged: true });
      say(tx('alreadySay', bytesText(file.size)));
      return;
    }
    const enc = makeEncoder(source, targetBytes, run);
    const fit = await fitToSize({ targetBytes, encode: enc.encode });
    if (run !== state.run) return;
    const found = enc.find(fit.scale, fit.quality);
    showResult({ kb, file, source, blob: found.blob, size: found.blob.size, width: found.width, height: found.height, quality: fit.quality, unchanged: false });
    say(tx('doneSay', bytesText(found.blob.size)));
  } catch (e) {
    if (run !== state.run || e.message === 'stale') return;
    if (e.message === 'too_small') {
      showProblem(tx('tooSmall', kbText(kb)));
      say(tx('tooSmallSay'));
    } else {
      showProblem(tx('fail'));
      say(tx('failSay'));
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
    h('div', { class: 'its-gauge-marks', 'aria-hidden': 'true' }, [h('span', null, '0'), h('span', null, tx('limitMark', limitText))]),
  ]);
}

function showWorking() {
  clearOut();
  els.out.appendChild(h('div', { class: 'its-working' }, [
    h('div', { class: 'its-gauge', 'aria-hidden': 'true' }, [
      h('div', { class: 'its-gauge-track' }, [h('span', { class: 'its-gauge-needle its-sweep' })]),
    ]),
    h('p', { class: 'muted' }, tx('weighing')),
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
    ? tx('keptNote')
    : tx('smaller', Math.max(0, Math.floor((1 - size / file.size) * 100)));

  const afterRows = [
    h('dt', null, tx('size')), h('dd', { class: 'num' }, bytesText(size)),
    h('dt', null, tx('dims')), h('dd', { class: 'num' }, dimsText(width, height)),
    h('dt', null, unchanged ? tx('format') : tx('quality')),
    h('dd', { class: 'num' }, unchanged ? tx('unchanged') : tx('qualityVal', Math.round(quality * 100))),
  ];

  const preview = h('img', { class: 'its-preview', src: state.resultUrl, alt: tx('previewAlt'), width: String(width), height: String(height) });
  const download = h('a', { class: 'btn its-download', href: state.resultUrl, download: downloadName }, tx('download', downloadName));

  els.out.appendChild(h('div', { class: 'its-result' }, [
    h('div', { class: 'its-sum', id: 'its-sum' }, [
    state.sample ? h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', null, `Worked example: a ${dimsText(source.width, source.height)} sample picture drawn by this page, ${bytesText(file.size)}, under ${kbText(kb)}`)]) : null,
    h('p', { class: 'its-stamp' }, unchanged ? tx('stampKept') : tx('stampFits')),
    h('p', { class: 'its-big num' }, [bytesText(size), h('small', null, tx('of', kbText(kb)))]),
    gauge(Math.min(100, pct), tx('gaugeLabel', pct, kbText(kb)), kbText(kb)),
    h('p', { class: 'its-sub' }, `${unchanged ? '' : tx('uses', pct)}${reduced}`),

    h('div', { class: 'its-ba' }, [
      h('div', { class: 'its-readout' }, [
        h('div', { class: 'its-readout-col' }, [
          h('p', { class: 'its-col-title' }, tx('before')),
          h('dl', null, [
            h('dt', null, tx('size')), h('dd', { class: 'num' }, bytesText(file.size)),
            h('dt', null, tx('dims')), h('dd', { class: 'num' }, dimsText(source.width, source.height)),
            h('dt', null, tx('format')), h('dd', null, file.type ? file.type.replace('image/', '').toUpperCase() : tx('photo')),
          ]),
        ]),
        h('div', { class: 'its-readout-col its-after' }, [
          h('p', { class: 'its-col-title' }, tx('after')),
          h('dl', null, afterRows),
        ]),
      ]),
    ]),

    ]),
    h('div', { class: 'its-bars' }, [
      bar(tx('before'), bytesText(file.size), 1, 'is-before'),
      bar(tx('after'), bytesText(size), size / file.size, 'is-after'),
    ]),

    h('div', { class: 'its-preview-wrap' }, [preview]),
    h('div', { class: 'its-actions' }, [download]),
  ]));
}

// ---------- a sample picture ----------
// For a visitor with no photo to hand (and for the page's own screenshot): a 1600 x 1200 picture
// drawn here, a sky, a sun and hills with fine grain so it weighs what a camera photo does. It is
// made in this page like any photo the visitor picks; nothing is fetched.
function samplePicture() {
  const c = document.createElement('canvas');
  c.width = 1600; c.height = 1200;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 1200);
  sky.addColorStop(0, '#2b4a7a'); sky.addColorStop(0.55, '#f2a65a'); sky.addColorStop(1, '#3d2a1f');
  g.fillStyle = sky; g.fillRect(0, 0, 1600, 1200);
  g.fillStyle = '#ffe2a8'; g.beginPath(); g.arc(1120, 560, 110, 0, Math.PI * 2); g.fill();
  [['#4a3b2c', 760, 0.0031], ['#2f2a24', 860, 0.0047], ['#1d1a17', 960, 0.0068]].forEach(([color, base, f]) => {
    g.fillStyle = color; g.beginPath(); g.moveTo(0, 1200);
    for (let x = 0; x <= 1600; x += 8) g.lineTo(x, base + Math.sin(x * f) * 60 + Math.sin(x * f * 3.7) * 18);
    g.lineTo(1600, 1200); g.closePath(); g.fill();
  });
  // Grain from a fixed seed, so the sample is the same picture every time.
  const img = g.getImageData(0, 0, 1600, 1200);
  let seed = 7;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const n = (seed % 41) - 20;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return new Promise((resolve) => {
    const done = (blob) => resolve(new File([blob], 'sample-picture.jpg', { type: 'image/jpeg' }));
    c.toBlob(done, 'image/jpeg', 0.92);
  });
}
const sampleButton = $('its-sample');
if (sampleButton) sampleButton.addEventListener('click', async () => takeFile(await samplePicture(), true));

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
