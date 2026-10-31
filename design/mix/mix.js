/* Part 1, the bar (variant A's glass capsule) with a reading-progress line on its lower rim. */
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
  var CAP_TOP = 8, CAP_H = 48, CAP_R = 24, SIDE = 10, LOGO_S = 0.9, GAP = 30, PAD_L = 18;
  var W0 = 0, H0 = 0;           // header box
  var capL = 0, capW = 0;       // capsule, in header coordinates
  var groups = [];              // { node, dx, scale }

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
    var key = W0 + 'x' + H0 + ':' + capL + ':' + capW;
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
    f.setAttribute('width', w); f.setAttribute('height', h);
  }

  // ---------- measuring (only here, never inside the animation) ----------
  function visible(n) { return n && n.offsetWidth > 0 && n.offsetHeight > 0; }
  function measure() {
    W0 = head.clientWidth;
    H0 = head.offsetHeight;
    var logo = row.querySelector('.logo');
    var cands = [row.querySelector('.head-nav'), row.querySelector('.nav-cta'), row.querySelector('.menu > summary')].filter(visible);
    if (!visible(logo) || !cands.length) { groups = []; return; }
    var base = row.offsetLeft;
    var lL = base + logo.offsetLeft, lW = logo.offsetWidth;
    var rbL = Infinity, rbR = -Infinity;
    cands.forEach(function (n) { rbL = Math.min(rbL, base + n.offsetLeft); rbR = Math.max(rbR, base + n.offsetLeft + n.offsetWidth); });
    var rbW = rbR - rbL;
    // The right-most control sits concentric in the capsule when it is a pill or a round button.
    var edge = null;
    [].forEach.call(row.querySelectorAll('.nav-cta a, .nav-cta button, .menu > summary'), function (n) {
      if (visible(n) && (!edge || n.getBoundingClientRect().right > edge.getBoundingClientRect().right)) edge = n;
    });
    var lastH = edge ? edge.offsetHeight : 0;
    var padR = lastH >= 28 ? (CAP_H - lastH) / 2 : 16;
    var tLogo, tRb;
    var natural = PAD_L + lW * LOGO_S + GAP + rbW + padR;
    if (mqNarrow.matches || natural > W0 - 2 * SIDE - 24) {
      capL = SIDE; capW = W0 - 2 * SIDE;
      tLogo = capL + 14;
      tRb = capL + capW - padR - rbW;
    } else {
      capW = Math.round(natural);
      capL = Math.round((W0 - capW) / 2);
      tLogo = capL + PAD_L;
      tRb = tLogo + lW * LOGO_S + GAP;
    }
    groups = [{ node: logo, dx: tLogo - lL, scale: true }];
    cands.forEach(function (n) { groups.push({ node: n, dx: tRb - rbL, scale: false }); });
    // Drop transforms left on groups that are no longer shown (after a breakpoint change).
    [row.querySelector('.head-nav'), row.querySelector('.nav-cta'), row.querySelector('.menu > summary')].forEach(function (n) {
      if (n && cands.indexOf(n) < 0) n.style.transform = '';
    });
    if (!lightInit) { lx = tx = capL + capW * 0.32; lightInit = true; }
    buildMap();
  }

  // ---------- springs ----------
  // x: width and horizontal positions (softer, a little overshoot). y: height, radius, opacity.
  var SX = { k: 230, c: 24.5 }, SY = { k: 440, c: 34 };
  var x = 0, vx = 0, y = 0, vy = 0, target = 0;
  var lx = 0, tx = 0, ly = -36, lightInit = false;
  var raf = 0, last = 0, lastDisp = -1;

  function render() {
    if (!W0) return;
    var L = lerp(0, capL, x), R = lerp(W0, capL + capW, x);
    var T = lerp(0, CAP_TOP, y), B = lerp(H0, CAP_TOP + CAP_H, y);
    var h = B - T, w = R - L;
    var r = clamp(lerp(0, CAP_R, y), 0, Math.min(h, w) / 2);
    var a = clamp(Math.min(y * 1.5, x * 2.2), 0, 1);
    glass.style.opacity = a;
    over.style.opacity = a;
    glass.style.clipPath = 'inset(' + T.toFixed(2) + 'px ' + (W0 - R).toFixed(2) + 'px ' + (H0 - B).toFixed(2) + 'px ' + L.toFixed(2) + 'px round ' + r.toFixed(2) + 'px)';
    setRect(rOuter, L - 0.5, T - 0.5, w + 1, h + 1, r + 0.5);
    setRect(rEdge, L + 0.5, T + 0.5, w - 1, h - 1, Math.max(r - 0.5, 0));
    setRect(rLow, L + 0.5, T + 0.5, w - 1, h - 1, Math.max(r - 0.5, 0));
    gL = L; gR = R; gB = B; gr = r; drawProg();
    light.setAttribute('cx', lx.toFixed(1));
    light.setAttribute('cy', ly);
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      g.node.style.transform = 'translate3d(' + (g.dx * x).toFixed(2) + 'px,0,0)' + (g.scale ? ' scale(' + lerp(1, LOGO_S, y).toFixed(4) + ')' : '');
    }
    if (feDisp) {
      // The map is drawn for the settled shape, so the bending fades in as the capsule arrives.
      var t = clamp((Math.min(x, y) - 0.82) / 0.18, 0, 1);
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
    return Math.abs(x - target) < 0.0005 && Math.abs(vx) < 0.0005 && Math.abs(y - target) < 0.0005 && Math.abs(vy) < 0.0005 && Math.abs(lx - tx) < 0.3;
  }
  function frame(now) {
    var dt = Math.min((now - (last || now)) / 1000, 1 / 30);
    last = now;
    // Integrate in small steps so the spring stays stable on slow frames.
    var n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
    for (var i = 0; i < n; i++) {
      vx += (SX.k * (target - x) - SX.c * vx) * h; x += vx * h;
      vy += (SY.k * (target - y) - SY.c * vy) * h; y += vy * h;
    }
    lx += (tx - lx) * Math.min(1, dt * 9);
    if (settled()) { x = y = target; vx = vy = 0; lx = tx; render(); raf = 0; last = 0; return; }
    render();
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function snap() { x = y = target; vx = vy = 0; lx = tx; render(); }

  function setTarget(t) {
    if (t === target) return;
    target = t;
    head.classList.toggle('lg-capsule', t === 1);
    if (reduce) snap(); else kick();
  }
  var docH = document.documentElement.scrollHeight;
  if ('ResizeObserver' in window) new ResizeObserver(function () { docH = document.documentElement.scrollHeight; }).observe(document.body);
  function onScroll() {
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
  onScroll();
  snap();
  // A page opened mid-scroll starts as the capsule, without animating in.
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); snapOrRender(); });
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { measure(); snapOrRender(); });
    [row.querySelector('.logo'), row.querySelector('.nav-cta')].forEach(function (n) { if (n) ro.observe(n); });
  }
  mqReduce.addEventListener && mqReduce.addEventListener('change', function (e) { reduce = e.matches; if (reduce) snap(); });

  addRims();
  if (mqHover.matches) {
    document.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }
})();
/* Part 2, everything below the bar.
   - field():     one slow WebGL field fixed behind the whole page. Each section has a station
                  (where the glow sits, its colours, how bright, how round); the field eases
                  between stations as you scroll and leans toward the pointer. Half resolution,
                  paused in hidden tabs, absent under reduced motion (the CSS glows remain).
   - headlines(): word-by-word reveals; gradient headings keep one continuous gradient.
   - cascade():   groups that reveal together come in one after another.
   - magnets():   the large buttons lean toward a fine pointer.
   - tilt():      the use-case cards tilt toward the pointer.
   - scrolly():   one per-frame scroll pass: the app window settles, the hero grid drifts,
                  the steps light up one by one.
   - counts():    figures count up once when they arrive.
   - band():      the comparison's Toll column gets a band that draws down behind it.
   - switchers(): tab and tool highlights slide between items (view transitions, from C).
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

  /* ---------------- sliding highlights (from C) ---------------- */
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

  /* ---------------- the field ---------------- */
  function field() {
    if (reduce) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'mx-field';
    canvas.setAttribute('aria-hidden', 'true');
    var gl = null;
    try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (err) { gl = null; }
    if (!gl) return;

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
      'uniform vec2 uCore;uniform vec2 uM;uniform float uMA;uniform float uT;uniform float uU;',
      'uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;uniform float uI;uniform float uLine;uniform float uRound;',
      'float h(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);',
      ' for(int i=0;i<4;i++){v+=a*n(p);p=r*p*2.03+3.1;a*=.5;}return v;}',
      'void main(){',
      ' vec2 q=(gl_FragCoord.xy-uCore)/uU;',
      ' vec2 m=(uM-uCore)/uU;float ml=length(m);if(ml>1.3)m*=1.3/ml;',
      ' vec2 d=q-m;float f=exp(-dot(d,d)*2.6)*uMA;',
      ' q-=m*f*.38;q+=vec2(-d.y,d.x)*f*.18;',
      ' float t=uT;',
      ' vec2 w=vec2(fbm(q*1.25+vec2(0.,-t*.055)),fbm(q*1.25+vec2(4.7,1.9)+vec2(t*.045,0.)));',
      ' vec2 r=q+(w-.5)*.95;',
      ' float k=fbm(r*1.7+vec2(t*.03,-t*.05));',
      ' vec2 e=r-vec2(0.,.12*(1.-uRound));',
      ' float wide=exp(-(e.x*e.x*.9+e.y*e.y*mix(2.8,1.1,uRound)));',
      ' vec2 g=r-vec2(0.,.04*(1.-uRound));',
      ' float mid=exp(-(g.x*g.x*mix(2.,1.6,uRound)+g.y*g.y*mix(9.,2.4,uRound)));',
      ' float core=exp(-(r.x*r.x*4.2+(r.y-.015)*(r.y-.015)*mix(34.,7.,uRound)));',
      ' vec3 col=uC1*wide*.09*(.4+1.*k)+uC2*mid*.4*(.35+1.15*k)+uC3*core*.5*(.75+.5*k)*uLine;',
      ' col+=uC2*f*.05*(.5+k);',
      ' col*=uI;',
      ' col+=(h(gl_FragCoord.xy+fract(t))-.5)/255.;',
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
    ['uCore', 'uM', 'uMA', 'uT', 'uU', 'uC1', 'uC2', 'uC3', 'uI', 'uLine', 'uRound'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });

    // The site's own colours, as 0..1 RGB.
    var MAG = [1, .24, .53], EMB = [1, .33, .19], AMB = [1, .72, .45], DATE = [1, .71, .28],
        MONEY = [1, .37, .66], FILE = [.27, .83, 1], AGENT = [.66, .55, 1], WARM = [1, .6, .38];
    // Stations: x and y as fractions of the viewport (the hero's is pinned to the app window),
    // colours for the wide haze, the body and the bright core, brightness, core line, roundness.
    var STATIONS = [
      { sel: '.hero', x: .5, y: null, c: [MAG, EMB, AMB], i: 1, line: 1, round: 0, u: .46 },
      { sel: '#moments', x: .84, y: .32, c: [AGENT, MONEY, MONEY], i: .5, line: .25, round: 1, u: .42 },
      { sel: '#tools', x: .12, y: .5, c: [MONEY, DATE, DATE], i: .46, line: .25, round: 1, u: .42 },
      { sel: '#how', x: .86, y: .42, c: [MAG, EMB, WARM], i: .5, line: .3, round: 1, u: .44 },
      { sel: '#pricing', x: .5, y: .12, c: [MONEY, MONEY, AMB], i: .36, line: .2, round: .7, u: .5 },
      { sel: '#developers', x: .12, y: .5, c: [AGENT, AGENT, FILE], i: .5, line: .25, round: 1, u: .42 },
      { sel: '#why', x: .86, y: .45, c: [FILE, FILE, AGENT], i: .42, line: .25, round: 1, u: .42 },
      { sel: '#faq', x: .5, y: .6, c: [AGENT, MONEY, AMB], i: .2, line: .1, round: 1, u: .5 },
      { sel: '#request', x: .2, y: .5, c: [DATE, EMB, AMB], i: .32, line: .2, round: 1, u: .44 },
      { sel: '.closing', x: .5, y: 'bottom', c: [MAG, EMB, AMB], i: 1.05, line: .75, round: .35, u: .56 }
    ].filter(function (s) { return (s.el = document.querySelector(s.sel)); });
    if (!STATIONS.length) return;
    var win = document.getElementById('app');

    document.body.insertBefore(canvas, document.body.firstChild);
    var S = 0.5, cw = 0, ch = 0, tops = [], bottoms = [], winTop = 0;
    function measure() {
      vw = window.innerWidth; vh = window.innerHeight;
      cw = Math.max(1, Math.round(vw * S)); ch = Math.max(1, Math.round(vh * S));
      canvas.width = cw; canvas.height = ch;
      gl.viewport(0, 0, cw, ch);
      var y0 = window.pageYOffset;
      tops = STATIONS.map(function (s) { return s.el.getBoundingClientRect().top + y0; });
      bottoms = STATIONS.map(function (s) { return s.el.getBoundingClientRect().bottom + y0; });
      winTop = win ? win.getBoundingClientRect().top + y0 : vh * 0.6;
    }

    // Where the field should be for this scroll position: hold each station for the first half
    // of its section, then ease into the next.
    var T = { x: 0, y: 0, i: 0, line: 0, round: 0, u: 0, c1: [0, 0, 0], c2: [0, 0, 0], c3: [0, 0, 0] };
    // y: a fraction of the viewport; null pins it to the app window; 'bottom' to the section's foot.
    function stationAt(j) {
      var s = STATIONS[j];
      return { x: s.x * vw, y: s.y === null ? winTop - sy : s.y === 'bottom' ? bottoms[j] - sy - 40 : s.y * vh, u: clamp(vw * s.u, 300, 720),
        i: s.i, line: s.line, round: s.round, c: s.c };
    }
    function target() {
      var probe = sy + vh * 0.5, k = 0;
      for (var j = 0; j < tops.length; j++) if (probe >= tops[j]) k = j;
      var a = stationAt(k), b = STATIONS[k + 1] ? stationAt(k + 1) : a;
      var span = (tops[k + 1] || tops[k] + vh) - tops[k];
      var t = smooth(((probe - tops[k]) / Math.max(span, 1) - 0.45) / 0.55);
      T.x = mix(a.x, b.x, t); T.y = mix(a.y, b.y, t); T.u = mix(a.u, b.u, t);
      T.i = mix(a.i, b.i, t); T.line = mix(a.line, b.line, t); T.round = mix(a.round, b.round, t);
      for (var c = 0; c < 3; c++) {
        T.c1[c] = mix(a.c[0][c], b.c[0][c], t); T.c2[c] = mix(a.c[1][c], b.c[1][c], t); T.c3[c] = mix(a.c[2][c], b.c[2][c], t);
      }
    }
    // Current values ease toward the target; the hero's y follows the page exactly so the glow
    // stays glued to the app window while it is on screen.
    var C = null;
    function ease(dt) {
      if (!C) { C = JSON.parse(JSON.stringify(T)); return; }
      var k = 1 - Math.exp(-dt * 3.2), ky = 1 - Math.exp(-dt * 9);
      C.x += (T.x - C.x) * k; C.y += (T.y - C.y) * ky; C.u += (T.u - C.u) * k;
      C.i += (T.i - C.i) * k; C.line += (T.line - C.line) * k; C.round += (T.round - C.round) * k;
      for (var c = 0; c < 3; c++) { C.c1[c] += (T.c1[c] - C.c1[c]) * k; C.c2[c] += (T.c2[c] - C.c2[c]) * k; C.c3[c] += (T.c3[c] - C.c3[c]) * k; }
    }

    var mx = 0, my = 0, tx = 0, ty = 0, ma = 0, ta = 0;
    if (fine) {
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        tx = e.clientX * S; ty = (vh - e.clientY) * S; ta = 1;
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
      target(); ease(dt);
      var kp = 1 - Math.exp(-dt * 2.2), ka = 1 - Math.exp(-dt * 1.6);
      mx += (tx - mx) * kp; my += (ty - my) * kp; ma += (ta - ma) * ka;
      gl.uniform2f(U.uCore, C.x * S, (vh - C.y) * S);
      gl.uniform2f(U.uM, mx, my);
      gl.uniform1f(U.uMA, ma);
      gl.uniform1f(U.uT, clock);
      gl.uniform1f(U.uU, C.u * S);
      gl.uniform3fv(U.uC1, C.c1); gl.uniform3fv(U.uC2, C.c2); gl.uniform3fv(U.uC3, C.c3);
      gl.uniform1f(U.uI, C.i); gl.uniform1f(U.uLine, C.line); gl.uniform1f(U.uRound, C.round);
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
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener('load', measure);
    if ('ResizeObserver' in window) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(measure, 150); }).observe(document.body);
    target();
    wake();
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('mx-field-on'); }); });
    window.__mxField = { running: function () { return running; }, now: function () { return C; } };
  }

  /* ---------------- momentum scrolling ---------------- */
  function startLenis() {
    if (!window.Lenis) return;
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
      lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      history.pushState(null, '', url.hash);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

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
