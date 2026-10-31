/* Variant a, "Liquid glass". Loaded at the end of the body, after home.js and toll.js.

   1. The header: clear at the top of the page. After a short scroll it condenses into a floating
      glass capsule. Two springs drive it (a stiff one for height and corner radius, a softer one
      for width), so it rounds off first and then pulls in from the sides. Per frame it only
      writes: the glass layer's clip-path and opacity, an SVG rim's geometry, and transforms on the
      four nav groups. Nothing is read during the animation; positions are measured up front.
   2. Refraction: in Chromium the glass also runs an SVG displacement map built for the
      capsule's exact shape, so the page bends at its rim. Other browsers get blur and saturation.
   3. Light: one pointer position lights the capsule's rim and the edges of every nearby card,
      button and panel, as if the light source moves across the page.
   4. Reveals: siblings that reveal together are staggered. */
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
  root.classList.add('lg');
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
  function onScroll() {
    var s = window.scrollY || window.pageYOffset;
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

  // ---------- reveals: stagger siblings that come in together ----------
  function stagger() {
    if (reduce) return;
    var seen = new Map();
    [].forEach.call(document.querySelectorAll('.rv'), function (n) {
      var p = n.parentNode, i = seen.get(p) || 0;
      seen.set(p, i + 1);
      if (!i || n.classList.contains('in')) return;
      n.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
      // The delay is for the entrance only; hover transitions afterwards start at once.
      var off = function () { n.style.transitionDelay = ''; n.removeEventListener('transitionend', off); };
      n.addEventListener('transitionend', off);
    });
  }

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
  stagger();
})();
