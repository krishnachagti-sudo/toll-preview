/* Motion for every page. Loaded deferred from the shared head (routes/pages.js render()), after
   each page's own scripts; motion.css carries the styles it keys on. Two parts:

   1. The bar: clear and full width at the top of the page; after a short scroll it condenses into
      a floating glass pill (with refraction in Chromium) around the links and search, lit by the
      pointer, with a reading-progress line along its lower rim. Two springs drive it; per frame it
      only writes transforms, a clip-path, opacity and an SVG rim. Positions are measured up front.
   2. The page: a smoky glow lit from the page's own content, word-by-word headlines, reveals and
      cascades, magnetic buttons, tilting cards, scroll-linked panels and steps, counting figures,
      sliding tab highlights, and momentum scrolling.

   Under prefers-reduced-motion everything rests at once and the glow is not drawn; without
   JavaScript the page reads in full. */
(function () {
  'use strict';

  var root = document.documentElement;
  var head = document.querySelector('.site-head');
  var row = head && head.querySelector('.nav-row');
  if (!head || !row) return;

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqNarrow = window.matchMedia('(max-width: 900px)');
  var mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduce = mqReduce.matches;

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---------- capsule geometry (the shape it settles into) ----------
  var CAP_TOP = 10, CAP_H = 60, CAP_R = 30, GAP = 28;
  // When a page's parts attach to the bar (nav.js: hp-docked, hp-wide) the capsule widens to the
  // full row and grows down over the tray; two more springs carry it there.
  var fullL = 0, fullW = 0, TRAY_H = 0;
  var W0 = 0, H0 = 0;           // header box
  var capL = 0, capW = 0;       // the pill, in header coordinates
  var groups = [];              // { node, dx }: the left and right clusters slide in to meet

  // ---------- layers ----------
  root.classList.add('lg', 'mx');
  var glass = document.createElement('div');
  glass.className = 'lg-glass';
  glass.setAttribute('aria-hidden', 'true');
  var over = el('svg', { class: 'lg-over', 'aria-hidden': 'true', focusable: 'false' });
  var defs = el('defs', {}, over);
  var light = el('radialGradient', { id: 'lg-light', gradientUnits: 'userSpaceOnUse', r: '220' }, defs);
  el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '.85' }, light);
  el('stop', { offset: '.35', 'stop-color': '#ffe2c4', 'stop-opacity': '.4' }, light);
  el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '.1' }, light);
  var low = el('linearGradient', { id: 'lg-low', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
  el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '0' }, low);
  el('stop', { offset: '.6', 'stop-color': '#fff', 'stop-opacity': '0' }, low);
  el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '.16' }, low);
  var rOuter = el('rect', { class: 'lg-outer', fill: 'none' }, over);
  var rEdge = el('rect', { class: 'lg-edge', fill: 'none', stroke: 'url(#lg-light)' }, over);
  var rLow = el('rect', { class: 'lg-lowedge', fill: 'none', stroke: 'url(#lg-low)' }, over);
  var pg = el('linearGradient', { id: 'mx-prog', gradientUnits: 'userSpaceOnUse' }, defs);
  el('stop', { offset: '0', 'stop-color': '#ff3d86' }, pg);
  el('stop', { offset: '.5', 'stop-color': '#ff5a36' }, pg);
  el('stop', { offset: '1', 'stop-color': '#ffb03f' }, pg);
  var rProg = el('line', { class: 'lg-prog', stroke: 'url(#mx-prog)' }, over);
  // Reading progress, 0..1, drawn along the bottom of whatever shape the bar has right now.
  var prog = 0, gL = 0, gR = 0, gB = 0, gr = 0;
  function drawProg() {
    var x1 = gL + gr, span = Math.max(gR - gr - x1, 0), x2 = x1 + span * prog;
    rProg.setAttribute('x1', x1.toFixed(1)); rProg.setAttribute('x2', x2.toFixed(1));
    rProg.setAttribute('y1', (gB - 0.75).toFixed(1)); rProg.setAttribute('y2', (gB - 0.75).toFixed(1));
    pg.setAttribute('x1', x1.toFixed(1)); pg.setAttribute('x2', (x1 + span).toFixed(1));
    rProg.style.opacity = prog > 0.002 ? 1 : 0;
  }
  head.insertBefore(over, head.firstChild);
  head.insertBefore(glass, head.firstChild);

  // ---------- refraction (Chromium renders SVG filters inside backdrop-filter) ----------
  var brands = navigator.userAgentData && navigator.userAgentData.brands;
  var refract = !!(brands && brands.some(function (b) { return /Chromium|Google Chrome|Microsoft Edge/.test(b.brand); }));
  var feImg = null, feDisp = null, REFRACT_PX = 24, mapKey = '';
  if (refract) {
    var fsvg = el('svg', { width: '0', height: '0', 'aria-hidden': 'true', focusable: 'false' });
    fsvg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    var filt = el('filter', { id: 'lg-refract', filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB', x: '0', y: '0' }, fsvg);
    feImg = el('feImage', { x: '0', y: '0', preserveAspectRatio: 'none', result: 'map' }, filt);
    feDisp = el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: '0', xChannelSelector: 'R', yChannelSelector: 'G' }, filt);
    document.body.appendChild(fsvg);
    root.classList.add('lg-refract');
  }

  // Rounded-rectangle signed distance, negative inside.
  function sdf(x, y, cx, cy, hx, hy, r) {
    var qx = Math.abs(x - cx) - (hx - r), qy = Math.abs(y - cy) - (hy - r);
    var ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
  }
  // A displacement map for the settled capsule: neutral grey everywhere, and in a 14px band inside
  // the rim each pixel samples from further out along the edge normal, strongest at the edge.
  function buildMap() {
    if (!refract || !W0) return;
    var key = W0 + 'x' + H0 + ':' + capL + ':' + capW + ':' + TRAY_H;
    if (key === mapKey) return;
    mapKey = key;
    var w = W0, h = H0, c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
    var cx = capL + capW / 2, cy = CAP_TOP + CAP_H / 2, hx = capW / 2, hy = CAP_H / 2, band = 14;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4, rr = 128, gg = 128;
        var px = x + 0.5, py = y + 0.5, s = sdf(px, py, cx, cy, hx, hy, CAP_R);
        if (s < 0 && s > -band) {
          var nx = sdf(px + 1, py, cx, cy, hx, hy, CAP_R) - sdf(px - 1, py, cx, cy, hx, hy, CAP_R);
          var ny = sdf(px, py + 1, cx, cy, hx, hy, CAP_R) - sdf(px, py - 1, cx, cy, hx, hy, CAP_R);
          var len = Math.sqrt(nx * nx + ny * ny) || 1, f = 1 + s / band;
          f = f * f;
          rr = 128 + 127 * (nx / len) * f;
          gg = 128 + 127 * (ny / len) * f;
        }
        d[i] = rr; d[i + 1] = gg; d[i + 2] = 128; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    feImg.setAttribute('width', w); feImg.setAttribute('height', h);
    feImg.setAttribute('href', c.toDataURL('image/png'));
    var f = feImg.parentNode;
    // The filter region also covers the tray under the bar, or the glass would stop at the bar's
    // edge; the map is not drawn there, which is fine because the bending is off while it is open.
    f.setAttribute('width', w); f.setAttribute('height', h + TRAY_H);
  }

  // ---------- measuring (only here, never inside the animation) ----------
  // At the top the row is a full-width bar (base.css lays it out). The pill keeps the row's height
  // and hugs its two clusters, the logo and links on the left and search and buttons on the right,
  // which slide toward each other; on a narrow screen, or when they barely fit, it is the row's box.
  function visible(n) { return n && n.offsetWidth > 0 && n.offsetHeight > 0; }
  function measure() {
    W0 = head.clientWidth;
    H0 = head.offsetHeight;
    if (!row.offsetWidth) return;
    CAP_TOP = row.offsetTop; CAP_H = row.offsetHeight; CAP_R = CAP_H / 2;
    var base = row.offsetLeft;
    var left = [row.querySelector('.logo'), row.querySelector('.head-nav')].filter(visible);
    var right = [row.querySelector('.nav-search'), row.querySelector('.nav-cta'), row.querySelector('.menu > summary')].filter(visible);
    var cs = getComputedStyle(row), padL = parseFloat(cs.paddingLeft) || 0, padR = parseFloat(cs.paddingRight) || 0;
    var span = function (ns) { var a = Infinity, b = -Infinity; ns.forEach(function (n) { a = Math.min(a, base + n.offsetLeft); b = Math.max(b, base + n.offsetLeft + n.offsetWidth); }); return [a, b]; };
    capL = base; capW = row.offsetWidth;
    fullL = base; fullW = row.offsetWidth;
    var tray = head.querySelector('.hp-tray');
    TRAY_H = tray ? tray.offsetHeight : 0;
    if (glass) glass.style.bottom = -TRAY_H + 'px';
    groups = [];
    if (left.length && right.length && !mqNarrow.matches) {
      var l = span(left), r = span(right);
      var natural = padL + (l[1] - l[0]) + GAP + (r[1] - r[0]) + padR;
      if (natural < capW - 40) {
        capW = Math.round(natural);
        capL = Math.round(base + (row.offsetWidth - capW) / 2);
        var dl = capL + padL - l[0], dr = capL + capW - padR - r[1];
        left.forEach(function (n) { groups.push({ node: n, dx: dl }); });
        right.forEach(function (n) { groups.push({ node: n, dx: dr }); });
      }
    }
    [].forEach.call(row.querySelectorAll('.logo, .head-nav, .nav-search, .nav-cta, .menu > summary'), function (n) {
      if (!groups.some(function (g) { return g.node === n; })) n.style.transform = '';
    });
    if (!lightInit) { lx = tx = capL + capW * 0.32; lightInit = true; }
    buildMap();
  }

  // ---------- springs ----------
  // x: width and horizontal positions (softer, a little overshoot). y: height, radius, opacity.
  var SX = { k: 230, c: 24.5 }, SY = { k: 440, c: 34 };
  var x = 0, vx = 0, y = 0, vy = 0, target = 0;
  var sw = 0, vsw = 0, swT = 0, ex = 0, vex = 0, exT = 0;
  var lx = 0, tx = 0, ly = -36, lightInit = false;
  var raf = 0, last = 0, lastDisp = -1;

  function render() {
    if (!W0) return;
    var cl = lerp(capL, fullL, sw), cw = lerp(capW, fullW, sw);
    var L = lerp(0, cl, x), R = lerp(W0, cl + cw, x);
    var T = lerp(0, CAP_TOP, y), B = lerp(H0, CAP_TOP + CAP_H, y) + TRAY_H * ex * y;
    var HG = H0 + TRAY_H;
    var h = B - T, w = R - L;
    var r = clamp(lerp(0, CAP_R, y) - 4 * ex, 0, Math.min(h, w) / 2);
    var a = clamp(Math.min(y * 1.5, x * 2.2), 0, 1);
    glass.style.opacity = a;
    over.style.opacity = a;
    glass.style.clipPath = 'inset(' + T.toFixed(2) + 'px ' + (W0 - R).toFixed(2) + 'px ' + (HG - B).toFixed(2) + 'px ' + L.toFixed(2) + 'px round ' + r.toFixed(2) + 'px)';
    setRect(rOuter, L - 0.5, T - 0.5, w + 1, h + 1, r + 0.5);
    setRect(rEdge, L + 0.5, T + 0.5, w - 1, h - 1, Math.max(r - 0.5, 0));
    setRect(rLow, L + 0.5, T + 0.5, w - 1, h - 1, Math.max(r - 0.5, 0));
    gL = L; gR = R; gB = B; gr = r; drawProg();
    light.setAttribute('cx', lx.toFixed(1));
    light.setAttribute('cy', ly);
    for (var i = 0; i < groups.length; i++) groups[i].node.style.transform = 'translate3d(' + (groups[i].dx * x * (1 - sw)).toFixed(2) + 'px,0,0)';
    if (feDisp) {
      // The map is drawn for the settled shape, so the bending fades in as the capsule arrives.
      var t = clamp((Math.min(x, y) - 0.82) / 0.18, 0, 1) * clamp(1 - Math.max(sw, ex) * 4, 0, 1);
      var disp = Math.round(REFRACT_PX * t * t * (3 - 2 * t) * 2) / 2;
      if (disp !== lastDisp) { feDisp.setAttribute('scale', disp); lastDisp = disp; }
    }
  }
  function setRect(n, X, Y, w, h, r) {
    n.setAttribute('x', X.toFixed(2)); n.setAttribute('y', Y.toFixed(2));
    n.setAttribute('width', Math.max(w, 0).toFixed(2)); n.setAttribute('height', Math.max(h, 0).toFixed(2));
    n.setAttribute('rx', r.toFixed(2));
  }
  function settled() {
    return Math.abs(x - target) < 0.0005 && Math.abs(vx) < 0.0005 && Math.abs(y - target) < 0.0005 && Math.abs(vy) < 0.0005 && Math.abs(lx - tx) < 0.3
      && Math.abs(sw - swT) < 0.0005 && Math.abs(vsw) < 0.0005 && Math.abs(ex - exT) < 0.0005 && Math.abs(vex) < 0.0005;
  }
  function frame(now) {
    var dt = Math.min((now - (last || now)) / 1000, 1 / 30);
    last = now;
    // Integrate in small steps so the spring stays stable on slow frames.
    var n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
    for (var i = 0; i < n; i++) {
      vx += (SX.k * (target - x) - SX.c * vx) * h; x += vx * h;
      vy += (SY.k * (target - y) - SY.c * vy) * h; y += vy * h;
      vsw += (SX.k * (swT - sw) - SX.c * vsw) * h; sw += vsw * h;
      vex += (SY.k * (exT - ex) - SY.c * vex) * h; ex += vex * h;
    }
    lx += (tx - lx) * Math.min(1, dt * 9);
    if (settled()) { x = y = target; vx = vy = 0; sw = swT; ex = exT; vsw = vex = 0; lx = tx; render(); raf = 0; last = 0; return; }
    render();
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function snap() { x = y = target; vx = vy = 0; sw = swT; ex = exT; vsw = vex = 0; lx = tx; render(); }

  function follow() {
    var s1 = head.classList.contains('hp-docked') ? 1 : 0, e1 = head.classList.contains('hp-wide') ? 1 : 0;
    if (s1 === swT && e1 === exT) return;
    swT = s1; exT = e1;
    // The bending is invisible while the parts are attached, so the costly filter is switched off.
    if (refract) root.classList.toggle('lg-refract', !s1);
    if (TRAY_H === 0 && e1) measure();
    if (reduce) snap(); else kick();
  }
  if ('MutationObserver' in window) new MutationObserver(follow).observe(head, { attributes: true, attributeFilter: ['class'] });

  function setTarget(t) {
    if (t === target) return;
    target = t;
    head.classList.toggle('lg-capsule', t === 1);
    if (reduce) snap(); else kick();
  }

  var docH = document.documentElement.scrollHeight;
  if ('ResizeObserver' in window) new ResizeObserver(function () { docH = document.documentElement.scrollHeight; }).observe(document.body);
  // Scroll events can come several times a frame; the work runs once per frame.
  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () { scrollQueued = false; scrolled(); });
  }
  function scrolled() {
    var s = window.scrollY || window.pageYOffset;
    var p = clamp(s / Math.max(1, docH - window.innerHeight), 0, 1);
    if (Math.abs(p - prog) > 0.0005) { prog = p; drawProg(); }
    if (s > 28) setTarget(1);
    else if (s < 10) setTarget(0);
  }

  // ---------- light that follows the pointer ----------
  var rimEls = [];
  var onScreen = new Set();
  var px = -9999, py = -9999, lightRaf = 0;
  function addRims() {
    var sel = '.win, .gcard, .panel, .code, .tbl, .terms, .compare, .buys';
    [].forEach.call(document.querySelectorAll(sel), function (n) {
      if (n.querySelector(':scope > .lg-rim')) return;
      var s = document.createElement('span');
      s.className = 'lg-rim';
      s.setAttribute('aria-hidden', 'true');
      n.appendChild(s);
      n.classList.add('lg-lit');
      rimEls.push(n);
    });
    [].forEach.call(document.querySelectorAll('.btn, .replay, .copy, .pill'), function (n) {
      n.classList.add('lg-lit'); rimEls.push(n);
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) onScreen.add(e.target); else { onScreen.delete(e.target); e.target.style.setProperty('--lg-near', 0); } });
      }, { rootMargin: '120px' });
      rimEls.forEach(function (n) { io.observe(n); });
    } else rimEls.forEach(function (n) { onScreen.add(n); });
  }
  function paintLight() {
    lightRaf = 0;
    var list = [], rects = [];
    onScreen.forEach(function (n) { list.push(n); rects.push(n.getBoundingClientRect()); }); // reads
    for (var i = 0; i < list.length; i++) {                                                 // writes
      var r = rects[i], n = list[i];
      var dx = Math.max(r.left - px, 0, px - r.right), dy = Math.max(r.top - py, 0, py - r.bottom);
      var near = clamp(1 - Math.sqrt(dx * dx + dy * dy) / 220, 0, 1);
      n.style.setProperty('--lg-near', near.toFixed(3));
      if (near > 0) {
        n.style.setProperty('--lx', (px - r.left).toFixed(1) + 'px');
        n.style.setProperty('--ly', (py - r.top).toFixed(1) + 'px');
      }
    }
  }
  function onPointer(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    px = e.clientX; py = e.clientY;
    if (!lightRaf) lightRaf = requestAnimationFrame(paintLight);
    if (W0 && py < 140) {
      tx = clamp(px, capL + 20, capL + capW - 20);
      if (reduce) { lx = tx; render(); } else kick();
    }
  }
  function onLeave() { px = py = -9999; if (!lightRaf) lightRaf = requestAnimationFrame(paintLight); }

  // ---------- boot ----------
  var resizeT = 0;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { measure(); tx = clamp(tx, capL + 20, capL + capW - 20); snapOrRender(); }, 120);
  }
  function snapOrRender() { if (raf) return; render(); }

  measure();
  scrolled();
  // A page opened mid-scroll starts as the pill, without animating in.
  snap();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); snapOrRender(); });
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { measure(); snapOrRender(); });
    ro.observe(row);
  }
  mqReduce.addEventListener && mqReduce.addEventListener('change', function (e) { reduce = e.matches; if (reduce) snap(); });

  addRims();
  if (mqHover.matches) {
    document.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }
})();
/* Part 2, everything below the bar.
   - field():     the smoky glow behind the page, lit from the content in view (see below).
   - headlines(): word-by-word reveals; gradient headings keep one continuous gradient.
   - cascade():   groups that reveal together come in one after another.
   - magnets():   the large buttons lean toward a fine pointer.
   - tilt():      the use-case cards tilt toward the pointer.
   - scrolly():   one per-frame scroll pass: the app window settles, the hero grid drifts,
                  the steps light up one by one.
   - counts():    figures count up once when they arrive.
   - band():      the comparison's Endwise column gets a band that draws down behind it.
   - switchers(): tab and tool highlights slide between items (view transitions).
   - reveals():   pages without the home page's script still reveal their .rv blocks.
   - lenis():     momentum scrolling, and in-page links that glide. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fine = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var hasIO = 'IntersectionObserver' in window;
  var lenis = null;

  function each(sel, fn, scope) { [].forEach.call((scope || document).querySelectorAll(sel), fn); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  /* ---------------- one scroll pass per frame ---------------- */
  var sy = window.pageYOffset || 0, vw = window.innerWidth, vh = window.innerHeight;
  var onFrame = [], queued = false;
  function emit() { queued = false; for (var i = 0; i < onFrame.length; i++) onFrame[i](sy); }
  function scrolled(y) { sy = y; if (!queued) { queued = true; requestAnimationFrame(emit); } }
  window.addEventListener('scroll', function () { if (!lenis) scrolled(window.pageYOffset); }, { passive: true });
  window.addEventListener('resize', function () { vw = window.innerWidth; vh = window.innerHeight; scrolled(window.pageYOffset); });

  /* ---------------- headlines ---------------- */
  function headlines() {
    function split(el) {
      var n = 0;
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var parts = c.textContent.split(/(\s+)/);
            if (parts.length === 1 && !parts[0]) return;
            var frag = document.createDocumentFragment();
            parts.forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
              var s = document.createElement('span');
              s.className = 'w';
              s.style.setProperty('--i', n++);
              s.textContent = p;
              frag.appendChild(s);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1 && c.tagName !== 'BR' && c.tagName !== 'SVG') walk(c);
        });
      })(el);
      el.classList.add('split');
    }
    function paint(el) {
      var h = el.offsetHeight, x0 = el.offsetLeft, y0 = el.offsetTop;
      each('.w', function (w) {
        w.style.backgroundSize = el.offsetWidth + 'px ' + h + 'px';
        w.style.backgroundPosition = (x0 - w.offsetLeft) + 'px ' + (y0 - w.offsetTop) + 'px';
      }, el);
    }
    var heads = [].slice.call(document.querySelectorAll('.hero .h1, main .h2, .closing h2'));
    if (reduce) return;
    heads.forEach(split);
    var grad = heads.filter(function (h) { return h.matches('.h1, .closing h2'); });
    function repaint() { grad.forEach(paint); }
    repaint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint);
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(repaint); grad.forEach(function (h) { ro.observe(h); }); }
    var h1 = document.querySelector('.hero .h1');
    if (!hasIO) { heads.forEach(function (h) { h.classList.add('on'); }); return; }
    if (h1) { h1.style.setProperty('--d0', '150ms'); requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add('on'); }); }); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
    heads.forEach(function (h) { if (h !== h1) io.observe(h); });
    window.addEventListener('beforeprint', function () { heads.forEach(function (h) { h.classList.add('on'); }); });
  }

  /* ---------------- cascades ---------------- */
  function cascade() {
    if (reduce) return;
    each('.moments, .price-grid, .faq-grid, .dev, .exact, .pay, .feat', function (group) {
      var k = 0;
      each(':scope > .rv', function (el) { el.style.setProperty('--rd', (k++ * 90) + 'ms'); }, group);
    });
    if (!hasIO) return;
    // The delay is for the entrance only: once a card has landed, hover answers at once.
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        setTimeout(function () { el.style.removeProperty('--rd'); }, 1600);
      });
    }, { threshold: 0.05 });
    each('[style*="--rd"]', function (el) { io.observe(el); });
  }

  /* ---------------- magnetic buttons ---------------- */
  function magnets() {
    if (!fine || reduce) return;
    each('.btn-lg, .nav-cta .btn', function (b) {
      if (b.closest('.menu-panel')) return;
      var inner = document.createElement('span');
      inner.className = 'bi';
      while (b.firstChild) inner.appendChild(b.firstChild);
      b.appendChild(inner);
      var raf = 0, ex = 0, ey = 0;
      function apply() {
        raf = 0;
        var r = b.getBoundingClientRect();
        var mx = clamp((ex - (r.left + r.width / 2)) * 0.28, -9, 9), my = clamp((ey - (r.top + r.height / 2)) * 0.38, -6, 6);
        b.style.setProperty('--bx', mx.toFixed(2) + 'px');
        b.style.setProperty('--by', my.toFixed(2) + 'px');
        inner.style.setProperty('--ix', (mx * 0.45).toFixed(2) + 'px');
        inner.style.setProperty('--iy', (my * 0.45).toFixed(2) + 'px');
      }
      b.addEventListener('pointermove', function (e) {
        ex = e.clientX; ey = e.clientY;
        b.classList.add('magnet-live');
        if (!raf) raf = requestAnimationFrame(apply);
      });
      b.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        b.classList.remove('magnet-live');
        ['--bx', '--by'].forEach(function (p) { b.style.removeProperty(p); });
        ['--ix', '--iy'].forEach(function (p) { inner.style.removeProperty(p); });
      });
    });
  }

  /* ---------------- tilting cards ---------------- */
  function tilt() {
    if (!fine || reduce) return;
    each('.gcard.moment', function (c) {
      var raf = 0, ex = 0, ey = 0;
      function apply() {
        raf = 0;
        var r = c.getBoundingClientRect();
        var nx = clamp((ex - r.left) / r.width, 0, 1) - 0.5, ny = clamp((ey - r.top) / r.height, 0, 1) - 0.5;
        // Larger cards tilt less, so the far edge never swings more than a few pixels.
        var k = clamp(420 / Math.max(r.width, 1), 0.45, 1);
        c.style.setProperty('--ry', (nx * 7 * k).toFixed(2) + 'deg');
        c.style.setProperty('--rx', (-ny * 6 * k).toFixed(2) + 'deg');
        c.style.setProperty('--ty', '-4px');
      }
      c.addEventListener('pointerenter', function () { c.classList.add('mx-tilting'); });
      c.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        ex = e.clientX; ey = e.clientY;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      c.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        c.classList.remove('mx-tilting');
        ['--rx', '--ry', '--ty'].forEach(function (p) { c.style.removeProperty(p); });
      });
    });
  }

  /* ---------------- scroll-linked pieces ---------------- */
  function scrolly() {
    if (reduce) return;
    var hero = document.querySelector('.hero');
    var win = document.getElementById('app');
    var grid = document.querySelector('.hero-grid');
    var heroOn = true;
    if (hero && hasIO) new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; }, { rootMargin: '120px 0px' }).observe(hero);
    onFrame.push(function (y) {
      if (!heroOn) return;
      var p = clamp(y / (vh * 0.75), 0, 1), e = 1 - Math.pow(1 - p, 2);
      if (win) {
        win.style.setProperty('--tilt', (6 * (1 - e)).toFixed(3) + 'deg');
        win.style.setProperty('--lift', (-30 * e).toFixed(2) + 'px');
        win.style.setProperty('--wsc', (0.965 + 0.035 * e).toFixed(4));
      }
      if (grid) grid.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
    });

    var steps = document.querySelector('.steps');
    if (steps) {
      var items = [].slice.call(steps.children);
      steps.classList.add('mx-steps');
      var stepsOn = !hasIO;
      if (hasIO) new IntersectionObserver(function (es) { stepsOn = es[0].isIntersecting; if (stepsOn) scrolled(sy); }, { rootMargin: '80px 0px' }).observe(steps);
      onFrame.push(function () {
        if (!stepsOn) return;
        var line = vh * 0.7;
        var rects = items.map(function (li) { return li.getBoundingClientRect(); });   // reads
        items.forEach(function (li, i) { li.classList.toggle('lit', rects[i].top + rects[i].height * 0.6 < line); }); // writes
      });
    }
  }

  /* ---------------- figures that count up ---------------- */
  function counts() {
    if (reduce || !hasIO) return;
    var els = [].slice.call(document.querySelectorAll('.buys [data-buys], .acct-top .tile .v'));
    function run(el) {
      var text = el.textContent;
      var m = text.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var pre = m[1], num = m[2], post = m[3];
      var dec = (num.split('.')[1] || '').length, comma = num.indexOf(',') >= 0;
      var to = parseFloat(num.replace(/,/g, ''));
      if (!isFinite(to) || to === 0) return;
      el.classList.add('mx-count');
      var t0 = 0, dur = 1400, wrote = text;
      function fmt(v) {
        var s = v.toFixed(dec);
        if (comma) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = p.join('.'); }
        return pre + s + post;
      }
      function step(now) {
        // Someone else (the page's own price loader) changed it: stop and leave theirs.
        if (el.textContent !== wrote) return;
        if (!t0) t0 = now;
        var t = clamp((now - t0) / dur, 0, 1), e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        wrote = t === 1 ? text : fmt(to * e);
        el.textContent = wrote;
        if (t < 1) requestAnimationFrame(step);
      }
      wrote = fmt(0); el.textContent = wrote;
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- the comparison's band ---------------- */
  function band() {
    var cmp = document.querySelector('.compare');
    var us = cmp && cmp.querySelector('.us');
    if (!us) return;
    var b = document.createElement('span');
    b.className = 'mx-band';
    b.setAttribute('aria-hidden', 'true');
    cmp.insertBefore(b, cmp.firstChild);
    function place() {
      var c = cmp.getBoundingClientRect(), u = us.getBoundingClientRect();
      b.style.left = (u.left - c.left - 8).toFixed(1) + 'px';
      b.style.width = (u.width + 16).toFixed(1) + 'px';
    }
    place();
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(cmp);
  }

  /* ---------------- sliding highlights ---------------- */
  function switchers() {
    var vtOK = !reduce && typeof document.startViewTransition === 'function';
    function enter(els) {
      if (reduce) return;
      els.forEach(function (el) {
        el.classList.remove('lq-enter');
        void el.offsetWidth;
        el.classList.add('lq-enter');
        el.addEventListener('animationend', function done() { el.classList.remove('lq-enter'); el.removeEventListener('animationend', done); });
      });
    }
    function indicator(group, itemSel, attr, name) {
      var ind = document.createElement('span');
      ind.className = 'lq-ind';
      ind.setAttribute('aria-hidden', 'true');
      ind.style.viewTransitionName = name;
      function place() {
        var cur = group.querySelector(itemSel + '[' + attr + '="true"]');
        if (cur && ind.parentNode !== cur) cur.insertBefore(ind, cur.firstChild);
      }
      place();
      new MutationObserver(place).observe(group, { subtree: true, attributes: true, attributeFilter: [attr] });
      return { el: ind, place: place };
    }
    function morph(box, itemSel, inds, panesSel) {
      box.classList.add('lq-sw');
      var passing = false;
      box.addEventListener('click', function (e) {
        if (passing) return;
        var t = e.target.closest && e.target.closest(itemSel);
        if (!t || !box.contains(t)) return;
        var before = [].filter.call(box.querySelectorAll(panesSel), function (p) { return !p.hidden; });
        function after() {
          inds.forEach(function (i) { i.place(); });
          enter([].filter.call(box.querySelectorAll(panesSel), function (p) { return !p.hidden && before.indexOf(p) < 0; }));
        }
        if (!vtOK) { requestAnimationFrame(after); return; }
        e.stopImmediatePropagation();
        e.preventDefault();
        // Only the highlight morphs; the page itself must not crossfade.
        root.classList.add('mx-vt-local');
        var vt = document.startViewTransition(function () {
          passing = true;
          try { t.click(); } finally { passing = false; }
          after();
        });
        vt.finished.finally(function () { root.classList.remove('mx-vt-local'); });
      }, true);
    }
    var code = document.getElementById('code');
    if (code) {
      var inds = [];
      var ep = code.querySelector('.tabs.ep'), lang = code.querySelector('.tabs:not(.ep)');
      if (ep) inds.push(indicator(ep, '.tab', 'aria-selected', 'mx-tab-ep'));
      if (lang) inds.push(indicator(lang, '.tab', 'aria-selected', 'mx-tab-lang'));
      morph(code, '.tab', inds, 'pre[data-lang], pre[data-resp], [data-cost]');
    }
    var app = document.getElementById('app');
    if (app) {
      var hi = [];
      var side = app.querySelector('.side'), tabs = app.querySelector('.m-tabs');
      if (side) hi.push(indicator(side, 'button.s-item', 'aria-current', 'mx-tool-side'));
      if (tabs) hi.push(indicator(tabs, 'button.s-item', 'aria-current', 'mx-tool-tabs'));
      morph(app, 'button.s-item', hi, '.view-wrap');
    }
  }

  /* ---------------- gliding pills ----------------
     Anywhere the page picks one of a few things (a tool's choice pills, the code tabs, the tools
     page's filter, the docs contents, the search results) a highlight glides to the chosen one
     instead of jumping, in the shape that group already uses: a solid pill, a soft pill, an
     underline or a bar down the side. The group's own highlight hands over to it (motion.css,
     .gl-*). Groups that appear later (the search dialog) are picked up when they do. */
  var GLIDE = [
    { group: '.choice-row', cur: '.choice input:checked + span', kind: 'solid' },
    { group: '.endwise-code-tabs', cur: '[aria-selected="true"]', kind: 'line' },
    { group: '.tool-jump', cur: '.cat-chip[aria-pressed="true"]', kind: 'soft' },
    { group: '.docs-toc ol', cur: 'a[aria-current]', kind: 'side' },
    { group: '.nav-pal-list, .nav-pal [role="listbox"]', cur: '[aria-selected="true"]', kind: 'soft' }
  ];
  function glide(g, spec) {
    if (g.glReady) return;
    g.glReady = true;
    g.classList.add('gl-group', 'gl-' + spec.kind);
    var ind = document.createElement('span');
    ind.className = 'gl-ind';
    ind.setAttribute('aria-hidden', 'true');
    var queued = false;
    function place() {
      queued = false;
      if (ind.parentNode !== g) g.insertBefore(ind, g.firstChild);
      var cur = g.querySelector(spec.cur);
      if (!cur || !cur.offsetWidth || !g.offsetWidth) { ind.style.opacity = '0'; return; }
      // Layout offsets, not screen boxes, so a reveal or a press that scales things on the way in
      // cannot knock the highlight off its item.
      var x = 0, y = 0, n = cur;
      while (n && n !== g) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      if (n !== g) { var gr = g.getBoundingClientRect(), r = cur.getBoundingClientRect(); x = r.left - gr.left + g.scrollLeft; y = r.top - gr.top + g.scrollTop; }
      ind.style.width = cur.offsetWidth + 'px';
      ind.style.height = cur.offsetHeight + 'px';
      ind.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      ind.style.opacity = '1';
      if (!g.classList.contains('gl-ready')) requestAnimationFrame(function () { g.classList.add('gl-ready'); });
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(place); } }
    new MutationObserver(queue).observe(g, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-selected', 'aria-pressed', 'aria-current', 'hidden'] });
    g.addEventListener('change', queue);
    window.addEventListener('resize', queue);
    if ('ResizeObserver' in window) new ResizeObserver(queue).observe(g);
    place();
  }
  function glideAll(scope) {
    GLIDE.forEach(function (spec) { [].forEach.call((scope || document).querySelectorAll(spec.group), function (g) { glide(g, spec); }); });
  }
  glideAll();
  if ('MutationObserver' in window) {
    // The search dialog and the code panel are built after load.
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) if (list[i].addedNodes.length) { glideAll(); return; }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------------- the field: a smoky glow lit from the page's own content ---------------- */
  // One WebGL canvas fixed behind the page. Each important thing on the page (the app window, a
  // card, a tool's form, a table, a code sample) has its own light behind it, in its own colour.
  // A light fades in while its thing is near the middle of the screen and out as you leave; up to
  // three are drawn at once over one shared field of slowly rising smoke. A rising light starts a
  // little toward the one that is leaving and glides home, so a hand-over reads as a short slide.
  // The cursor leans and curls the smoke, scrolling stirs it, and every light breathes on its own.
  // Half resolution, paused in hidden tabs, absent under reduced motion or without WebGL (the
  // page's own CSS glows stay as the fallback).
  function field() {
    if (reduce) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'mx-field';
    canvas.setAttribute('aria-hidden', 'true');
    var gl = null;
    try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (err) { gl = null; }
    if (!gl) return;

    // The site's own colours, as 0..1 RGB.
    var MAG = [1, .24, .53], EMB = [1, .33, .19], AMB = [1, .72, .45], DATE = [1, .71, .28],
        MONEY = [1, .37, .66], FILE = [.27, .83, 1], AGENT = [.66, .55, 1], WARM = [1, .6, .38];
    // Light sources, in page order. at: 'top' lights from the element's top edge (the home page's
    // app window), 'foot' from its bottom edge (a closing band), 'body' from behind its upper part.
    // i is brightness, u the light's width relative to the element, hue the colour when the element
    // has no --hue of its own; warm sources use the brand's magenta, ember and amber.
    var SOURCES = [
      // home and brand pages
      { sel: '#app', at: 'top', i: 1, line: 1, round: 0, warm: true },
      { sel: '.hero.sub .h1', at: 'body', i: .24, line: .3, round: .6, u: .6, hue: EMB },
      { sel: '.moments .gcard', at: 'body', i: .55, line: .3, round: 1, u: .62 },
      { sel: '.feat .panel', at: 'body', i: .62, line: .3, round: 1, u: .6 },
      { sel: '.pay .panel', at: 'body', i: .55, line: .3, round: 1, u: .6, hue: WARM },
      { sel: '.buys', at: 'body', i: .3, line: .2, round: 1, u: .4, hue: DATE },
      { sel: '.tbl', at: 'body', i: .45, line: .25, round: 1, u: .55, hue: MONEY },
      { sel: '.terms', at: 'body', i: .35, line: .2, round: 1, u: .6, hue: DATE },
      { sel: '.dev .mcp', at: 'body', i: .4, line: .2, round: 1, u: .6, hue: AGENT },
      { sel: '.code', at: 'body', i: .55, line: .3, round: 1, u: .55, hue: AGENT },
      { sel: '.compare', at: 'body', i: .45, line: .25, round: 1, u: .55, hue: FILE },
      { sel: '.sources', at: 'body', i: .3, line: .2, round: 1, u: .6, hue: FILE },
      { sel: '.dev-list', at: 'body', i: .3, line: .2, round: 1, u: .6, hue: AGENT },
      { sel: '.faq', at: 'body', i: .2, line: .1, round: 1, u: .5, hue: AGENT },
      { sel: '.req', at: 'body', i: .4, line: .25, round: 1, u: .55, hue: DATE },
      // a tool's page: its heading, its form and answer, its API sample
      { sel: 'main section[class*="-intro"] h1', at: 'body', i: .18, line: .2, round: .6, u: .6, hue: EMB },
      { sel: 'main section[class*="-desk"]', at: 'body', i: .34, line: .2, round: 1, u: .4, hue: WARM },
      { sel: 'main section[class$="-code"]', at: 'body', i: .45, line: .25, round: 1, u: .55, hue: AGENT },
      // a content page (tables, guides): its header, the tool box beside it, its tables
      { sel: '.cp-head', at: 'body', i: .22, line: .2, round: .6, u: .6, hue: EMB },
      { sel: '.cp-tool', at: 'body', i: .5, line: .25, round: 1, u: .7, hue: WARM },
      { sel: '.cp-table', at: 'body', i: .3, line: .2, round: 1, u: .55, hue: DATE },
      // docs, privacy, account
      { sel: '.page-head', at: 'body', i: .22, line: .2, round: .6, u: .6, hue: EMB },
      { sel: '.closing', at: 'foot', i: 1.05, line: .75, round: .35, warm: true }
    ];
    function parseColor(str) {
      var m = /^#([0-9a-f]{6})$/i.exec(str);
      if (m) { var n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
      m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(str);
      return m ? [m[1] / 255, m[2] / 255, m[3] / 255] : null;
    }
    var LIGHTS = [];
    SOURCES.forEach(function (s) {
      each(s.sel, function (el) {
        var hue = s.hue || WARM;
        if (!s.warm) {
          var own = parseColor(getComputedStyle(el).getPropertyValue('--hue').trim());
          if (own) hue = own;
        }
        var pal = s.warm ? [MAG, EMB, AMB]
          : [[hue[0] * .85 + EMB[0] * .15, hue[1] * .85 + EMB[1] * .15, hue[2] * .85 + EMB[2] * .15], hue, [mix(hue[0], 1, .35), mix(hue[1], 1, .35), mix(hue[2], 1, .35)]];
        LIGHTS.push({ el: el, s: s, c: pal, a: 0, wt: 0, ox: 0, oy: 0, born: false });
      });
    });
    if (!LIGHTS.length) return;

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
      'uniform vec2 uM;uniform float uMA;uniform float uT;uniform float uI;uniform float uStir;uniform float uSwirl;uniform float uU0;',
      'uniform vec2 uLP[3];uniform float uLU[3];uniform float uLI[3];uniform float uLL[3];uniform float uLR[3];uniform vec3 uLA[3];uniform vec3 uLB[3];uniform vec3 uLC[3];',
      'float h(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);',
      ' for(int i=0;i<4;i++){v+=a*n(p);p=r*p*2.03+3.1;a*=.5;}return v;}',
      'void main(){',
      ' float t=uT;vec3 col=vec3(0.);',
      // the smoke: one shared field in screen space, carried upward (smoke rises) with a sway
      ' vec2 P=gl_FragCoord.xy/uU0;',
      ' vec2 W=vec2(fbm(P*1.25+vec2(0.,-t*.07)),fbm(P*1.25+vec2(4.7,1.9)+vec2(t*.06,0.)));',
      ' vec2 sp=P*2.1+(W-.5)*2.+vec2(sin(t*.11+P.y*1.3)*.25,-t*.14);',
      ' float s1=fbm(sp+W*1.4);',
      ' float s2=fbm(sp*1.9+vec2(3.1,-t*.08)+s1*1.2);',
      ' float wisp=smoothstep(.28,.78,s1*.6+s2*.4);',
      ' float k=fbm(P*1.7+(W-.5)*1.6+vec2(t*.045,-t*.07));',
      // each light: a soft glow whose thin edges the smoke frays into wisps
      ' for(int i=0;i<3;i++){',
      '  if(uLI[i]<.002)continue;',
      '  vec2 qi=(gl_FragCoord.xy-uLP[i])/uLU[i];qi.y+=uStir*.14;',
      '  vec2 mi=(uM-uLP[i])/uLU[i];float ml=length(mi);if(ml>1.3)mi*=1.3/ml;',
      '  vec2 di=qi-mi;float fi=exp(-dot(di,di)*2.6)*uMA;',
      '  qi-=mi*fi*(.38+uSwirl*.2);qi+=vec2(-di.y,di.x)*fi*(.18+uSwirl*.8);',
      '  vec2 r=qi+(W-.5)*.95;float R=uLR[i];',
      '  vec2 e=r-vec2(0.,.12*(1.-R));float wide=exp(-(e.x*e.x*.9+e.y*e.y*mix(2.8,1.1,R)));',
      '  vec2 g=r-vec2(0.,.04*(1.-R));float mid=exp(-(g.x*g.x*mix(2.,1.6,R)+g.y*g.y*mix(9.,2.4,R)));',
      '  float core=exp(-(r.x*r.x*4.2+(r.y-.015)*(r.y-.015)*mix(34.,7.,R)));',
      '  float midS=smoothstep(0.,1.,mid*(.55+.9*wisp));float wideS=wide*(.35+.95*wisp);',
      '  col+=(uLA[i]*wideS*.1*(.4+k)+uLB[i]*midS*.4*(.35+1.15*k)+uLC[i]*core*.32*(.75+.5*k)*uLL[i]*(.8+.3*wisp)+uLB[i]*fi*.05*(.5+k))*uLI[i];',
      ' }',
      ' col*=uI;',
      // fine grain keeps the soft gradients from banding
      ' col+=(h(gl_FragCoord.xy+fract(t*7.13)*91.)-.5)*1.5/255.;',
      ' col=max(col,0.);',
      ' gl_FragColor=vec4(col,clamp(max(col.r,max(col.g,col.b)),0.,1.));',
      '}'
    ].join('\n');
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uM', 'uMA', 'uT', 'uI', 'uStir', 'uSwirl', 'uU0', 'uLP', 'uLU', 'uLI', 'uLL', 'uLR', 'uLA', 'uLB', 'uLC'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });

    document.body.insertBefore(canvas, document.body.firstChild);
    var S = 0.5, GAIN = 0.58;
    function measure() {
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = Math.max(1, Math.round(vw * S)); canvas.height = Math.max(1, Math.round(vh * S));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Where each light sits and how bright it wants to be: bright while its thing spans the middle
    // of the screen, fading with distance from it.
    // Each lit thing's box on the page is measured once and again when the page's size changes;
    // a frame only subtracts the scroll (reading every box each frame forced a layout per frame).
    var boxesAt = -1;
    function boxes() {
      var y = window.scrollY || window.pageYOffset, x0 = window.scrollX || 0;
      for (var j = 0; j < LIGHTS.length; j++) {
        var b = LIGHTS[j].el.getBoundingClientRect();
        LIGHTS[j].box = { left: b.left + x0, top: b.top + y, width: b.width, height: b.height };
      }
      boxesAt = 1;
    }
    if ('ResizeObserver' in window) new ResizeObserver(function () { boxesAt = -1; }).observe(document.body);
    window.addEventListener('resize', function () { boxesAt = -1; });
    // The scroll position as of the scroll event, read before anything is written that frame;
    // reading it inside the frame, after the bar has moved, would lay the page out again.
    var sy = window.scrollY || 0, sx = window.scrollX || 0;
    window.addEventListener('scroll', function () { sy = window.scrollY; sx = window.scrollX; }, { passive: true });
    function aim() {
      if (boxesAt < 0) boxes();
      for (var j = 0; j < LIGHTS.length; j++) {
        var L = LIGHTS[j], B = L.box, s = L.s;
        var r = { left: B.left - sx, top: B.top - sy, width: B.width, height: B.height, bottom: B.top - sy + B.height };
        L.wt = 0;
        if (r.bottom < -vh * 0.3 || r.top > vh * 1.3 || !r.width) continue;
        var x = r.left + r.width / 2, y, u, d;
        if (s.at === 'top') { y = r.top; u = clamp(vw * 0.46, 300, 720); d = (y - vh * 0.55) / vh * 0.55; }
        else if (s.at === 'foot') { y = r.bottom - 40; u = clamp(vw * 0.56, 300, 760); d = (y - vh * 0.55) / vh * 0.55; }
        else {
          y = r.top + Math.min(r.height * 0.32, 170); u = clamp(r.width * s.u * 1.45, 320, 860);
          var mid = vh * 0.5;
          d = (mid < r.top ? r.top - mid : mid > r.bottom ? mid - r.bottom : 0) / vh;
        }
        L.x = x; L.y = y; L.u = u;
        L.wt = Math.exp(-(d * d) / 0.035) * s.i * (s.warm ? 1 : 1.75);
      }
    }

    // Fade each light toward what it wants (out a little quicker than in, so two never pile up),
    // start a rising light part of the way toward the light that is leaving, and hand the three
    // brightest to the shader. Every light breathes and wanders on its own phase.
    var LP = new Float32Array(6), LU = new Float32Array(3), LI = new Float32Array(3), LL = new Float32Array(3),
        LR = new Float32Array(3), LA = new Float32Array(9), LB = new Float32Array(9), LC = new Float32Array(9);
    function lightsUp(dt, clock) {
      var kin = 1 - Math.exp(-dt * 2.2), kout = 1 - Math.exp(-dt * 3.2), kslide = Math.exp(-dt * 1.9);
      var cx = 0, cy = 0, cw = 0;
      LIGHTS.forEach(function (M) {
        if (M.a > 0.05 && M.u) { cx += (M.x + M.ox) * M.a; cy += (M.y + M.oy) * M.a; cw += M.a; }
      });
      LIGHTS.forEach(function (L) {
        var want = L.wt, was = L.a;
        if (!L.born && want > 0.02 && was < 0.02 && L.u) {
          L.born = true;
          if (cw > 0.05) { L.ox = (cx / cw - L.x) * 0.45; L.oy = (cy / cw - L.y) * 0.45; }
        }
        if (was < 0.005 && want < 0.005) { L.born = false; L.ox = L.oy = 0; }
        L.a = was + (want - was) * (want > was ? kin : kout);
        L.ox *= kslide; L.oy *= kslide;
      });
      var top = LIGHTS.filter(function (L) { return L.a > 0.003 && L.u; }).sort(function (p, q) { return q.a - p.a; }).slice(0, 3);
      for (var n = 0; n < 3; n++) {
        var L = top[n];
        if (!L) { LI[n] = 0; continue; }
        var ph = LIGHTS.indexOf(L) * 1.37;
        var breath = 1 + 0.13 * Math.sin(clock * 0.9 + ph) + 0.06 * Math.sin(clock * 0.37 + 1.7 + ph);
        var dx = L.u * 0.06 * Math.sin(clock * 0.31 + ph), dy = L.u * 0.04 * Math.cos(clock * 0.23 + 0.8 + ph);
        LP[n * 2] = (L.x + L.ox + dx) * S; LP[n * 2 + 1] = (vh - L.y - L.oy - dy) * S;
        LU[n] = L.u * (1 + 0.035 * Math.sin(clock * 0.9 - 0.6 + ph)) * S;
        LI[n] = L.a * breath; LL[n] = L.s.line; LR[n] = L.s.round;
        for (var c = 0; c < 3; c++) { LA[n * 3 + c] = L.c[0][c]; LB[n * 3 + c] = L.c[1][c]; LC[n * 3 + c] = L.c[2][c]; }
      }
      gl.uniform2fv(U.uLP, LP); gl.uniform1fv(U.uLU, LU); gl.uniform1fv(U.uLI, LI); gl.uniform1fv(U.uLL, LL);
      gl.uniform1fv(U.uLR, LR); gl.uniform3fv(U.uLA, LA); gl.uniform3fv(U.uLB, LB); gl.uniform3fv(U.uLC, LC);
    }

    // The cursor: its position leans the smoke, its speed winds up a swirl that relaxes at rest.
    // Scrolling: its speed hurries the smoke along, leaves it a beat behind the page and dims it a
    // little in flight.
    var mx = 0, my = 0, tx = 0, ty = 0, ma = 0, ta = 0;
    var pTravel = 0, swirl = 0, lastSy = sy, svel = 0, stir = 0, phase = 0;
    if (fine) {
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var nx = e.clientX * S, ny = (vh - e.clientY) * S;
        pTravel += Math.min(Math.sqrt((nx - tx) * (nx - tx) + (ny - ty) * (ny - ty)), 80);
        tx = nx; ty = ny; ta = 1;
        if (!mx && !my) { mx = tx; my = ty; }
        wake();
      }, { passive: true });
      document.addEventListener('pointerleave', function () { ta = 0; });
    }

    var running = false, last = 0, clock = 0;
    function frame(now) {
      if (!running) return;
      if (document.hidden) { running = false; return; }
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now; clock += dt;
      var kp = 1 - Math.exp(-dt * 2.2), ka = 1 - Math.exp(-dt * 1.6);
      mx += (tx - mx) * kp; my += (ty - my) * kp; ma += (ta - ma) * ka;
      var pspeed = pTravel / dt; pTravel = 0;
      swirl += (clamp(pspeed / 500, 0, 1) - swirl) * (1 - Math.exp(-dt * (pspeed > 40 ? 4 : 1.2)));
      var raw = clamp((sy - lastSy) / dt, -6000, 6000); lastSy = sy;
      svel += (raw - svel) * (1 - Math.exp(-dt * 5));
      stir += (clamp(svel / 2200, -1, 1) - stir) * (1 - Math.exp(-dt * 3));
      phase += Math.min(Math.abs(svel), 4000) / 1000 * dt * 5;
      aim();
      lightsUp(dt, clock);
      gl.uniform2f(U.uM, mx, my);
      gl.uniform1f(U.uMA, ma);
      gl.uniform1f(U.uT, clock + phase);
      gl.uniform1f(U.uI, GAIN * (1 - 0.3 * Math.abs(stir)));
      gl.uniform1f(U.uStir, stir); gl.uniform1f(U.uSwirl, swirl);
      gl.uniform1f(U.uU0, clamp(vw * 0.36, 300, 560) * S);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    }
    function wake() {
      if (running || document.hidden) return;
      running = true; last = performance.now();
      requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', wake);
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); running = false; root.classList.remove('mx-field-on'); });

    measure();
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 150); });
    wake();
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('mx-field-on'); }); });
  }

  /* ---------------- reveals on pages without home.js ---------------- */
  function reveals() {
    var els = document.querySelectorAll('.rv:not(.in)');
    if (!els.length) return;
    if (reduce || !hasIO) { each('.rv', function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    [].forEach.call(els, function (el) { io.observe(el); });
  }

  /* ---------------- momentum scrolling ---------------- */
  function startLenis() {
    if (!window.Lenis) return;
    // Things that scroll on their own (wide tables, code, text boxes) keep native scrolling.
    each('.table-scroll, pre, textarea, select, .resp', function (el) { el.setAttribute('data-lenis-prevent', ''); });
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', function (l) { scrolled(l.scroll); });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.classList.contains('skip') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
      var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 96), duration: 1.4 });
      history.pushState(null, '', url.hash);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  reveals();
  headlines();
  cascade();
  magnets();
  tilt();
  scrolly();
  counts();
  band();
  switchers();
  field();
  if (!reduce) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = startLenis;
    document.head.appendChild(s);
  }
  scrolled(sy);
})();
