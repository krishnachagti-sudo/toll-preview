/* The home page. Loaded in <head> so the motion classes are set before the first paint; the
   rest waits for the DOM (and for endwise.js, which loads at the end of the body).

   - Fills every price, tool name and "what $20 buys" figure from GET {base}/api/v1/tools, in the
     page's currency (Endwise.money; dollars unless the server said otherwise). The server prints the
     same values as a no-JavaScript fallback:
       data-price="<slug>"        the per-call price, "from" the lowest action price, or "Free"
       data-tool-name="<slug>"    the tool's name
       data-buys="<slug>"         calls the top-up in the enclosing data-topup pays for
   - Fills the site's own address into the code samples and the MCP URL.
   - The hero chat (its steps come in one by one), the tool group tabs, the request form and
     reveal-on-scroll. The hero window and code tabs are wired only when a page has them.
   - The mockups' inputs: home-try.js, loaded once a mockup is in view or touched. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!reduce) root.classList.add('motion');

  // The top-up "what it buys" divides by the price, when the page does not say (data-topup).
  var TOPUP_USD_MICROS = 20000000;

  function each(selector, fn, scope) {
    [].forEach.call((scope || document).querySelectorAll(selector), fn);
  }

  // ---------- prices and names from the tools API ----------
  function fillFromTools(tools, Endwise) {
    var currency = Endwise.currency;
    var bySlug = {};
    tools.forEach(function (t) { bySlug[t.slug] = t; });
    each('[data-price]', function (el) {
      var t = bySlug[el.getAttribute('data-price')];
      if (!t) return;
      // A tool with several actions has no single price: show its lowest paid price as "from".
      el.textContent = t.price && t.price.display ? Endwise.money(t.price.display)
        : t.pricing && t.pricing.from ? 'from ' + Endwise.money(t.pricing.from.display) : 'Free';
    });
    each('[data-tool-name]', function (el) {
      var t = bySlug[el.getAttribute('data-tool-name')];
      if (t) el.textContent = t.name;
    });
    each('[data-buys]', function (el) {
      var t = bySlug[el.getAttribute('data-buys')];
      var box = el.closest('[data-topup]');
      var topup = box ? Number(box.getAttribute('data-topup')) : TOPUP_USD_MICROS;
      if (!t || !t.price || !(t.price[currency] > 0)) return;
      el.textContent = Math.floor(topup / t.price[currency]).toLocaleString('en-US');
    });
  }

  // ---------- the site's own address ----------
  function fillOrigin(base) {
    each('.js-origin', function (el) { el.textContent = location.origin; });
    each('.js-host', function (el) { el.textContent = location.host; });
    var copyBtn = document.getElementById('mcp-copy');
    var url = document.getElementById('mcp-url');
    if (!copyBtn || !url) return;
    copyBtn.addEventListener('click', function () {
      var text = location.origin + base + '/mcp';
      function said(msg) {
        copyBtn.textContent = msg;
        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600);
      }
      function select() {
        var range = document.createRange();
        range.selectNodeContents(url);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        said('Selected');
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { said('Copied'); }, select);
      else select();
    });
  }

  // ---------- hero: the app window and its replay ----------
  function heroWindow() {
    var app = document.getElementById('app');
    if (!app) return;
    function show(v) {
      each('.view-wrap', function (w) { w.hidden = w.getAttribute('data-for') !== v; }, app);
      each('button.s-item', function (b) { b.setAttribute('aria-current', b.getAttribute('data-view') === v ? 'true' : 'false'); }, app);
      each('.act .feed li', function (li) { li.classList.toggle('hot', li.getAttribute('data-for') === v); }, app);
    }

    var q = document.getElementById('qtext');
    var enter = document.getElementById('enter');
    var btn = document.getElementById('replay');
    var full = q.textContent;
    var timers = [];
    var fxItems = app.querySelectorAll('button.s-item[data-view="fx"]');
    var fxRow = app.querySelector('.act .feed li[data-for="fx"]');
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function state(s) { app.classList.remove('s0', 's1', 's2'); if (s) app.classList.add(s); }
    function unflash() { [].forEach.call(fxItems, function (b) { b.classList.remove('flash'); }); fxRow.classList.remove('flash'); }
    function settle() { clear(); state(''); q.textContent = full; enter.classList.remove('press'); unflash(); }
    function play() {
      clear();
      show('fx');
      // The exchange-rate view goes back to the answer being replayed (home-try.js, once loaded).
      app.dispatchEvent(new CustomEvent('home:replay'));
      if (reduce) { settle(); return; }
      unflash();
      state('s0');
      q.textContent = '';
      var t = 420;
      for (var i = 1; i <= full.length; i++) {
        (function (n) { at(t, function () { q.textContent = full.slice(0, n); }); })(i);
        t += 36 + (full[i - 1] === ' ' ? 34 : 0);
      }
      at(t + 180, function () { enter.classList.add('press'); });
      at(t + 420, function () { enter.classList.remove('press'); state('s1'); [].forEach.call(fxItems, function (b) { b.classList.add('flash'); }); });
      at(t + 1050, function () { state('s2'); });
      at(t + 1800, function () { state(''); fxRow.classList.add('flash'); });
      at(t + 3400, unflash);
    }
    each('button.s-item', function (b) {
      b.addEventListener('click', function () { settle(); show(b.getAttribute('data-view')); });
    }, app);
    btn.addEventListener('click', play);
    if (!reduce && 'IntersectionObserver' in window) {
      state('s0');
      q.textContent = '';
      var seen = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { seen.disconnect(); play(); }
      }, { threshold: 0.2 });
      seen.observe(app);
    }
  }

  // ---------- hero: the chat's steps come in one by one ----------
  // The text is the server's (the tools' own answers); this only times when each step shows.
  // Without motion (or JavaScript) every step is shown from the start.
  function chatSteps() {
    var chat = document.getElementById('chat');
    if (!chat || !root.classList.contains('motion')) return;
    var steps = chat.querySelectorAll('.step');
    var i = 0;
    function next() {
      if (i >= steps.length) return;
      steps[i].classList.add('on');
      i++;
      setTimeout(next, i % 3 === 0 ? 1100 : 750);
    }
    setTimeout(next, 400);
  }

  // ---------- code samples: tabs and a small highlighter ----------
  function codePanel() {
    var code = document.getElementById('code');
    if (!code) return;
    // Start from the tabs the page marked as selected (the home page starts on "bd").
    var epTab = code.querySelector('.tab[data-ep][aria-selected="true"]');
    var ep = epTab ? epTab.getAttribute('data-ep') : 'bd';
    var lang = 'curl';
    function render() {
      each('pre[data-lang]', function (p) { p.hidden = !(p.getAttribute('data-ep') === ep && p.getAttribute('data-lang') === lang); }, code);
      each('pre[data-resp]', function (p) { p.hidden = p.getAttribute('data-resp') !== ep; }, code);
      each('[data-cost]', function (s) { s.hidden = s.getAttribute('data-cost') !== ep; }, code);
      each('.tab[data-ep]', function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-ep') === ep)); }, code);
      each('.tab[data-lang]', function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-lang') === lang)); }, code);
    }
    each('.tab', function (t) {
      t.addEventListener('click', function () {
        if (t.hasAttribute('data-ep')) ep = t.getAttribute('data-ep');
        else lang = t.getAttribute('data-lang');
        render();
      });
    }, code);

    // Runs after the origin is filled in, on plain text, so nothing from the page is parsed as HTML.
    var KW = /^(const|await|import|print|method|headers|body|json|curl)$/;
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    each('pre code', function (el) {
      var src = el.textContent;
      var out = '';
      var i = 0;
      var m;
      var re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(\s*:)?|\b(\d+(?:\.\d+)?)\b|(\s-[A-Za-z]\b)|([A-Za-z_]+)/g;
      while ((m = re.exec(src))) {
        out += esc(src.slice(i, m.index));
        if (m[1]) out += '<span class="' + (m[2] ? 'tk-k' : 'tk-s') + '">' + esc(m[1]) + '</span>' + (m[2] || '');
        else if (m[3]) out += '<span class="tk-n">' + m[3] + '</span>';
        else if (m[4]) out += '<span class="tk-f">' + esc(m[4]) + '</span>';
        else if (m[5]) out += KW.test(m[5]) ? '<span class="tk-w">' + m[5] + '</span>' : m[5];
        i = re.lastIndex;
      }
      el.innerHTML = out + esc(src.slice(i));
    }, code);
  }

  // ---------- "Need a tool we don't have?" ----------
  function requestForm() {
    var form = document.getElementById('req');
    if (!form) return;
    var msg = document.getElementById('req-msg');
    var send = document.getElementById('req-send');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var need = form.elements.need.value.trim();
      var email = form.elements.email.value.trim();
      if (!need) { msg.textContent = 'Tell us what you need first.'; form.elements.need.focus(); return; }
      var body = { need: need };
      if (email) body.email = email;
      msg.textContent = 'Sending...';
      send.disabled = true;
      // Endwise.api posts JSON with the content type the server's same-origin check requires, and
      // rejects with the message from the standard error body (a 429 included).
      window.Endwise.api('/api/requests', { body: body }).then(function (json) {
        if (!json || json.received !== true) throw new Error('That did not go through. Please try again in a moment.');
        form.reset();
        msg.textContent = 'Thanks. We read every request.';
      }).catch(function (err) {
        msg.textContent = (err && err.message) || 'That did not go through. Please try again in a moment.';
      }).then(function () { send.disabled = false; });
    });
  }

  // ---------- the live tools: one group at a time, behind tabs ----------
  // Each .feat row is a group of tools (lib/brand/parts.js), named by its tag. Without JavaScript
  // every group's row is shown, one after another.
  function toolTabs() {
    var sec = document.getElementById('tools');
    if (!sec) return;
    var feats = [].slice.call(sec.querySelectorAll('.feat'));
    if (feats.length < 2) return;
    var list = document.createElement('div');
    list.className = 'feat-tabs rv in';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Live tools');
    var tabs = feats.map(function (f, i) {
      var id = f.getAttribute('data-group') || 'group' + i;
      var name = ((f.querySelector('.tag') || {}).textContent || '').trim() || 'Tools ' + (i + 1);
      var hue = (f.className.match(/hue-\w+/) || [''])[0];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = hue;
      b.id = 'feat-tab-' + id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'feat-' + id);
      b.innerHTML = '<i aria-hidden="true"></i>';
      b.appendChild(document.createTextNode(name));
      f.id = 'feat-' + id;
      f.setAttribute('role', 'tabpanel');
      f.setAttribute('aria-labelledby', b.id);
      b.addEventListener('click', function () { show(i); });
      list.appendChild(b);
      return b;
    });
    function show(n, focus) {
      tabs.forEach(function (b, i) {
        var on = i === n;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        feats[i].hidden = !on;
        if (on) each('.rv', function (el) { el.classList.add('in'); }, feats[i]);
      });
      if (focus) tabs[n].focus();
    }
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement), n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n < 0 || i < 0) return;
      e.preventDefault();
      show(n, true);
    });
    sec.querySelector('.sec-head').after(list);
    sec.classList.add('tabbed');
    show(0);
  }

  // ---------- the mockups: real inputs, worked out in this browser ----------
  // Each [data-try] mockup is a form that hands its inputs to the tool's page. home-try.js (an ES
  // module) makes it work out its answer here, free; it and the engines it imports load only once
  // a mockup comes near the screen or is touched, so a visit that never scrolls loads none of it.
  function tryOut() {
    var roots = document.querySelectorAll('[data-try]');
    if (!roots.length) return;
    var started = false;
    var ready = false;
    var io = null;
    var TOUCH = ['focusin', 'pointerdown', 'input', 'change', 'dragenter'];
    function go(e) {
      if (started) return;
      started = true;
      if (io) io.disconnect();
      TOUCH.forEach(function (type) { document.removeEventListener(type, inTry, true); });
      var from = e && e.target && e.target.closest ? e.target : null;
      import('./home-try.js').then(function (m) { m.start(from); ready = true; }, function () { /* the printed examples stay */ });
    }
    function inTry(e) { if (e.target.closest && e.target.closest('[data-try]')) go(e); }
    TOUCH.forEach(function (type) { document.addEventListener(type, inTry, true); });
    // A photo dropped before the module is ready is kept for it, and never opens in the tab.
    each('[data-try] .drop', function (drop) {
      drop.addEventListener('dragover', function (e) { if (!ready) e.preventDefault(); });
      drop.addEventListener('drop', function (e) {
        if (ready) return;
        e.preventDefault();
        drop.tryFile = e.dataTransfer && e.dataTransfer.files[0];
        go(e);
      });
    });
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) go(); });
      }, { rootMargin: '300px 0px' });
      // The hero's window is on screen from the start; it waits for a touch.
      [].forEach.call(roots, function (r) { if (!r.closest('#app')) io.observe(r); });
    }
  }

  // ---------- small touches ----------
  function spotlight() {
    each('.gcard', function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  function reveal() {
    var els = document.querySelectorAll('.rv');
    if (reduce || !('IntersectionObserver' in window)) { each('.rv', function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    // Its top a little way into the screen, whatever its height (a share of a block taller than the
    // screen never came, and the block stayed blank).
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    [].forEach.call(els, function (el) { io.observe(el); });
  }

  function boot() {
    var Endwise = window.Endwise;
    var base = Endwise ? Endwise.base : '';
    fillOrigin(base);
    heroWindow();
    chatSteps();
    codePanel();
    toolTabs();
    tryOut();
    requestForm();
    spotlight();
    reveal();
    if (!Endwise) return;
    Endwise.api('/api/v1/tools').then(function (json) { fillFromTools(json.tools || [], Endwise); }, function () { /* keep the printed values */ });
    Endwise.me().then(function (account) {
      if (!account) return;
      each('[data-signed-in-text]', function (el) { el.textContent = el.getAttribute('data-signed-in-text'); });
    }, function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
