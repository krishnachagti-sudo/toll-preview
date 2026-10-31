/* Variant b, "Fluid motion". Loads after home.js and toll.js.

   - The shrinking header and its reading-progress line.
   - Lenis momentum scrolling (pinned 1.1.13, injected so it never blocks the page).
   - Headlines revealed word by word; sections staggered as they ease in.
   - Magnetic buttons (fine pointers only).
   - The app window lifting with a gentle parallax.
   - The signature: a slow WebGL gradient field behind the hero that bends toward the cursor.
     Rendered at half resolution, paused offscreen and in hidden tabs; the CSS glow stays as
     the fallback when WebGL is missing or motion is reduced. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var finePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  root.classList.add('lq');

  var head = document.querySelector('.site-head');
  var hero = document.querySelector('.hero');
  var win = document.getElementById('app');
  var lenis = null;

  function each(sel, fn, scope) { [].forEach.call((scope || document).querySelectorAll(sel), fn); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------- scroll state, read once per frame ---------------- */
  var scrollY = window.pageYOffset || 0;
  var vh = window.innerHeight;
  var docH = document.documentElement.scrollHeight;
  var listeners = [];
  function onScroll(fn) { listeners.push(fn); }
  var ticking = false;
  function emit() { ticking = false; for (var i = 0; i < listeners.length; i++) listeners[i](scrollY); }
  function scrolled(y) {
    scrollY = y;
    if (!ticking) { ticking = true; requestAnimationFrame(emit); }
  }
  window.addEventListener('scroll', function () { if (!lenis) scrolled(window.pageYOffset); }, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; docH = document.documentElement.scrollHeight; scrolled(window.pageYOffset); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { docH = document.documentElement.scrollHeight; }).observe(document.body);

  /* ---------------- header: shrink + progress ---------------- */
  var bar = null;
  if (head) {
    var line = document.createElement('span');
    line.className = 'nav-line';
    line.setAttribute('aria-hidden', 'true');
    bar = document.createElement('i');
    line.appendChild(bar);
    head.appendChild(line);
    var compact = false;
    onScroll(function (y) {
      // a little hysteresis so the bar never flutters at the threshold
      if (!compact && y > 28) { compact = true; head.classList.add('compact'); }
      else if (compact && y < 8) { compact = false; head.classList.remove('compact'); }
      var max = Math.max(1, docH - vh);
      bar.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')';
    });
    // the mobile menu closes when one of its links is used
    each('.menu-panel a', function (a) {
      a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.open = false; });
    });
  }

  /* ---------------- headlines, word by word ---------------- */
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
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.classList.add('split');
    return el;
  }
  // Gradient headings: give each word the slice of the gradient its line sits on.
  function paintGradient(el) {
    // offsets, not rects: they ignore the words' own reveal transforms
    var h = el.offsetHeight, x0 = el.offsetLeft, y0 = el.offsetTop;
    each('.w', function (w) {
      w.style.backgroundSize = el.offsetWidth + 'px ' + h + 'px';
      w.style.backgroundPosition = (x0 - w.offsetLeft) + 'px ' + (y0 - w.offsetTop) + 'px';
    }, el);
  }
  var heads = [].slice.call(document.querySelectorAll('.hero .h1, main .h2, .closing h2'));
  heads.forEach(split);
  var gradHeads = heads.filter(function (h) { return h.matches('.h1, .closing h2'); });
  function repaint() { gradHeads.forEach(paintGradient); }
  repaint();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint);
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(repaint); gradHeads.forEach(function (h) { ro.observe(h); }); }

  var h1 = document.querySelector('.hero .h1');
  if (reduce || !('IntersectionObserver' in window)) {
    heads.forEach(function (h) { h.classList.add('on'); });
  } else {
    if (h1) { h1.style.setProperty('--d0', '150ms'); requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add('on'); }); }); }
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); hio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
    heads.forEach(function (h) { if (h !== h1) hio.observe(h); });
    window.addEventListener('beforeprint', function () { heads.forEach(function (h) { h.classList.add('on'); }); });
  }

  /* ---------------- section stagger ---------------- */
  // siblings that reveal together get a short cascade; the delay is dropped once they land,
  // so hover never waits on it
  each('.moments, .price-grid, .faq-grid, .dev, .exact, .pay', function (group) {
    var k = 0;
    each(':scope > .rv', function (el) { el.style.setProperty('--rd', (k++ * 90) + 'ms'); }, group);
  });
  if (!reduce && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        sio.unobserve(el);
        setTimeout(function () { el.style.removeProperty('--rd'); }, 1800);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    each('[style*="--rd"]', function (el) { sio.observe(el); });
  }

  /* ---------------- magnetic buttons ---------------- */
  if (finePointer && !reduce) {
    each('.btn-lg, .nav-cta .btn', function (b) {
      if (b.closest('.menu-panel')) return;
      // wrap the label so it can drift a little further than the pill
      var inner = document.createElement('span');
      inner.className = 'bi';
      while (b.firstChild) inner.appendChild(b.firstChild);
      b.appendChild(inner);
      var raf = 0, ex = 0, ey = 0;
      function apply() {
        raf = 0;
        var r = b.getBoundingClientRect();
        var dx = ex - (r.left + r.width / 2), dy = ey - (r.top + r.height / 2);
        var mx = clamp(dx * 0.28, -9, 9), my = clamp(dy * 0.38, -6, 6);
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

  /* ---------------- app window parallax ---------------- */
  var heroVisible = true;
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }, { rootMargin: '120px 0px' }).observe(hero);
  }
  if (win && !reduce) {
    onScroll(function (y) {
      if (!heroVisible) return;
      var p = clamp(y / (vh * 0.75), 0, 1);
      var e = 1 - Math.pow(1 - p, 2);
      win.style.setProperty('--tilt', (5 * (1 - e)).toFixed(3) + 'deg');
      win.style.setProperty('--lift', (-30 * e).toFixed(2) + 'px');
    });
  }

  /* ---------------- the fluid field ---------------- */
  if (hero && !reduce) window.__lqFluid = makeFluid();

  function makeFluid() {
    var canvas = document.createElement('canvas');
    canvas.className = 'fluid';
    canvas.setAttribute('aria-hidden', 'true');
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    } catch (err) { gl = null; }
    if (!gl) return null;

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
      'uniform vec2 uCore;uniform vec2 uM;uniform float uMA;uniform float uT;uniform float uU;',
      'float h(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);',
      ' for(int i=0;i<4;i++){v+=a*n(p);p=r*p*2.03+3.1;a*=.5;}return v;}',
      'void main(){',
      ' vec2 q=(gl_FragCoord.xy-uCore)/uU;',      // units of uU px, origin at the window's top edge, y up
      ' vec2 m=(uM-uCore)/uU;float ml=length(m);if(ml>1.3)m*=1.3/ml;',
      ' vec2 d=q-m;float f=exp(-dot(d,d)*2.6)*uMA;',
      ' q-=m*f*.38;',                               // the glow leans out toward the cursor
      ' q+=vec2(-d.y,d.x)*f*.18;',                  // with a slow curl around it
      ' float t=uT;',
      ' vec2 w=vec2(fbm(q*1.25+vec2(0.,-t*.055)),fbm(q*1.25+vec2(4.7,1.9)+vec2(t*.045,0.)));',
      ' vec2 r=q+(w-.5)*.95;',
      ' float k=fbm(r*1.7+vec2(t*.03,-t*.05));',
      ' vec2 e=r-vec2(0.,.12);',
      ' float wide=exp(-(e.x*e.x*.9+e.y*e.y*2.8));',
      ' vec2 g=r-vec2(0.,.04);',
      ' float mid=exp(-(g.x*g.x*2.+g.y*g.y*9.));',
      ' float core=exp(-(r.x*r.x*4.2+(r.y-.015)*(r.y-.015)*34.));',
      ' vec3 mag=vec3(1.,.24,.53),emb=vec3(1.,.33,.19),amb=vec3(1.,.72,.45);',
      ' vec3 col=mag*wide*.09*(.4+1.*k)+emb*mid*.4*(.35+1.15*k)+amb*core*.5*(.75+.5*k);',
      ' col+=emb*f*.05*(.5+k);',
      ' col+=(h(gl_FragCoord.xy+fract(t))-.5)/255.;', // dither against banding
      ' col=max(col,0.);',
      ' float a=clamp(max(col.r,max(col.g,col.b)),0.,1.);',
      ' gl_FragColor=vec4(col,a);',
      '}'
    ].join('\n');

    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uCore', 'uM', 'uMA', 'uT', 'uU'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });

    hero.insertBefore(canvas, hero.firstChild);

    var SCALE = 0.5;            // render at half the CSS size; the field is soft by nature
    var cw = 0, ch = 0, coreX = 0, coreY = 0, unit = 600;
    function measure() {
      var hr = hero.getBoundingClientRect();
      var wr = (win || hero).getBoundingClientRect();
      var top = wr.top - hr.top;
      var cssH = Math.round(top + Math.min(520, wr.height * 0.6));
      canvas.style.height = cssH + 'px';
      cw = Math.max(1, Math.round(hr.width * SCALE));
      ch = Math.max(1, Math.round(cssH * SCALE));
      canvas.width = cw; canvas.height = ch;
      gl.viewport(0, 0, cw, ch);
      coreX = (wr.left - hr.left + wr.width / 2) * SCALE;
      coreY = (cssH - top) * SCALE;           // GL y runs up from the canvas bottom
      unit = clamp(hr.width * 0.46, 330, 720) * SCALE;
      if (!mx) { mx = tx = coreX; my = ty = coreY + unit * 0.6; }
    }

    // pointer, eased: target (tx,ty,ta) -> current (mx,my,ma)
    var mx = 0, my = 0, tx = 0, ty = 0, ma = 0, ta = 0;
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        if (!fieldVisible || e.pointerType === 'touch') return;
        var r = canvas.getBoundingClientRect();
        var inside = e.clientY >= r.top && e.clientY <= r.bottom;
        tx = (e.clientX - r.left) * SCALE;
        ty = (r.bottom - e.clientY) * SCALE;
        ta = inside ? 1 : 0;
        wake();
      }, { passive: true });
      document.addEventListener('pointerleave', function () { ta = 0; });
    }

    // the field only draws while its own canvas is on screen and the tab is visible
    var fieldVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { fieldVisible = es[0].isIntersecting; if (fieldVisible) wake(); }).observe(canvas);
    }
    var running = false, last = 0, clock = 0, drawnY = -1;
    function frame(now) {
      if (!running) return;
      if (!fieldVisible || document.hidden) { running = false; return; }
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      clock += dt;
      var kpos = 1 - Math.exp(-dt * 2.2), kamt = 1 - Math.exp(-dt * 1.6);
      mx += (tx - mx) * kpos; my += (ty - my) * kpos; ma += (ta - ma) * kamt;
      gl.uniform2f(U.uCore, coreX, coreY);
      gl.uniform2f(U.uM, mx, my);
      gl.uniform1f(U.uMA, ma);
      gl.uniform1f(U.uT, clock);
      gl.uniform1f(U.uU, unit);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // the field drifts slower than the page: a little depth
      if (scrollY !== drawnY) { drawnY = scrollY; canvas.style.transform = 'translate3d(0,' + (scrollY * 0.15).toFixed(1) + 'px,0)'; }
      requestAnimationFrame(frame);
    }
    function wake() {
      if (running || !fieldVisible || document.hidden) return;
      running = true; last = performance.now();
      requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', wake);
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); running = false; hero.classList.remove('fluid-on');
    });
    canvas.addEventListener('webglcontextrestored', function () { location.reload(); });

    measure();
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    // first frame drawn, then fade the field in over the static glow
    wake();
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('fluid-on'); }); });
    return { clock: function () { return clock; }, running: function () { return running; } };
  }

  /* ---------------- Lenis: smooth momentum scrolling ---------------- */
  function startLenis() {
    if (!window.Lenis) return;
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    window.__lenis = lenis;
    root.classList.add('lq-smooth');
    lenis.on('scroll', function (l) { scrolled(l.scroll); });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    // in-page links glide instead of jumping, and still move focus for keyboard users
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.classList.contains('skip') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
      var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: 1.4 });
      history.pushState(null, '', url.hash);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }
  if (!reduce) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = startLenis;
    document.head.appendChild(s);
  }

  scrolled(scrollY);
})();
