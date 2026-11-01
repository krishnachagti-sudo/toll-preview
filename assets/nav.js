/* The header's tools menu and search, on every page. Loaded deferred from the shared head
   (routes/pages.js render()), before motion.js.

   - "Tools" opens a panel of every tool in its group, with what it does and where its price
     starts. On a phone the same list heads the menu sheet.
   - The search box (and "/" or Cmd/Ctrl+K anywhere) opens a dialog that finds tools and the guide
     and table pages under them, as you type, from {base}/nav.json.

   The index is fetched once, the first time someone reaches for either. Without JavaScript the
   Tools link and the search box both go to the tools page. */
(function () {
  'use strict';

  var cfg = window.TOLL || {};
  var base = typeof cfg.base === 'string' ? cfg.base : '';
  var head = document.querySelector('.site-head');
  if (!head) return;

  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (attrs[k] == null) continue;
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    [].concat(kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  // ---------- the index ----------
  var index = null, loading = null;
  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch(base + '/nav.json', { credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { index = j; fillTools(); return j; })
        .catch(function (e) { loading = null; throw e; });
    }
    return loading;
  }

  function fillTools() {
    [].forEach.call(document.querySelectorAll('[data-nav-tools]'), function (box) {
      if (box.childNodes.length) return;
      var phone = box.classList.contains('menu-tools');
      index.groups.forEach(function (g) {
        var col = h('div', { class: 'ntp-group' }, h('p', { class: 'ntp-cat hue-' + g.hue }, [h('i'), g.label]));
        g.tools.forEach(function (t) {
          var here = location.pathname === t.href;
          col.appendChild(h('a', { class: 'ntp-tool', href: t.href, 'aria-current': here ? 'page' : null }, phone
            ? [h('span', { class: 'n', text: t.name }), h('span', { class: 'p', text: t.price })]
            : [h('span', { class: 'top' }, [h('span', { class: 'n', text: t.name }), h('span', { class: 'p', text: t.price })]), h('span', { class: 's', text: t.tagline })]));
        });
        box.appendChild(col);
      });
    });
  }

  // ---------- the tools panel ----------
  var toolsBtn = head.querySelector('.nav-tools');
  var panel = document.getElementById('nav-tools-panel');
  function setPanel(open) {
    if (!toolsBtn || !panel) return;
    panel.hidden = !open;
    toolsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    head.classList.toggle('nav-open', open);
    if (open) load().catch(function () {});
  }
  if (toolsBtn && panel) {
    toolsBtn.addEventListener('click', function (e) { e.preventDefault(); setPanel(panel.hidden); });
    toolsBtn.addEventListener('pointerenter', function () { load().catch(function () {}); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !e.target.closest('#nav-tools-panel, .nav-tools')) setPanel(false); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setPanel(false); toolsBtn.focus(); } });
  }
  var menu = head.querySelector('details.menu');
  if (menu) menu.addEventListener('toggle', function () { if (menu.open) load().catch(function () {}); });

  // ---------- search ----------
  var dlg = null, input, list, status, hits = [], sel = 0, lastFocus = null;
  function build() {
    input = h('input', { type: 'search', id: 'nav-q', placeholder: 'Search tools and answers', autocomplete: 'off', spellcheck: 'false',
      role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'nav-results', 'aria-autocomplete': 'list' });
    list = h('div', { class: 'nav-results', id: 'nav-results', role: 'listbox', 'aria-label': 'Results' });
    status = h('p', { class: 'nav-status', role: 'status' });
    var close = h('button', { type: 'button', class: 'nav-close', 'aria-label': 'Close search', text: 'Esc' });
    dlg = h('div', { class: 'nav-pal', 'data-lenis-prevent': '', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search tools and answers', hidden: '' },
      h('div', { class: 'nav-box' }, [
        h('div', { class: 'nav-field' }, [h('label', { class: 'visually-hidden', for: 'nav-q', text: 'Search tools and answers' }), input, close]),
        list, status,
        h('p', { class: 'nav-keys', 'aria-hidden': 'true' }, [h('span', { text: '↑↓ move' }), h('span', { text: '↵ open' }), h('span', { text: 'esc close' })]),
      ]));
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeSearch(); });
    close.addEventListener('click', closeSearch);
    input.addEventListener('input', function () { sel = 0; draw(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(hits.length - 1, sel + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === 'Enter') { var a = list.querySelector('[aria-selected="true"]'); if (a) { e.preventDefault(); location.href = a.href; } }
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
      if (e.key === 'Tab') { e.preventDefault(); input.focus(); } // focus stays in the dialog
    });
  }

  // Every word must appear in the title, the tool name or the tagline; titles that start with
  // a word, and tools, rank first.
  function find(q) {
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var out = [];
    index.groups.forEach(function (g) {
      g.tools.forEach(function (t) {
        var hay = (t.name + ' ' + t.tagline + ' ' + g.label).toLowerCase();
        if (words.every(function (w) { return hay.indexOf(w) >= 0; })) out.push({ kind: 'tool', title: t.name, sub: t.tagline, price: t.price, href: t.href, hue: g.hue, score: 0 });
      });
    });
    if (!words.length) return out;
    var pages = [];
    index.pages.forEach(function (p) {
      var title = p.title.toLowerCase(), hay = title + ' ' + p.tool.toLowerCase();
      if (!words.every(function (w) { return hay.indexOf(w) >= 0; })) return;
      var score = words.reduce(function (s, w) { return s + (new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(title) ? 0 : 1); }, 0);
      pages.push({ kind: 'page', title: p.title, sub: p.tool, href: p.href, score: score, len: p.title.length });
    });
    pages.sort(function (a, b) { return a.score - b.score || a.len - b.len; });
    return out.concat(pages.slice(0, 12));
  }

  function draw() {
    if (!index) { list.textContent = ''; status.textContent = 'Loading.'; return; }
    var q = input.value.trim();
    hits = find(q);
    sel = Math.min(sel, Math.max(0, hits.length - 1));
    list.textContent = '';
    var lastKind = '';
    hits.forEach(function (x, i) {
      if (x.kind !== lastKind) { list.appendChild(h('p', { class: 'nav-h', role: 'presentation', text: x.kind === 'tool' ? 'Tools' : 'Answers' })); lastKind = x.kind; }
      list.appendChild(h('a', { class: 'nav-hit', href: x.href, role: 'option', id: 'nav-hit-' + i, 'aria-selected': i === sel ? 'true' : 'false' }, [
        h('i', { class: 'hue-' + (x.hue || 'none') }),
        h('span', { class: 'g' }, [h('span', { class: 'n', text: x.title }), h('span', { class: 's', text: x.sub })]),
        x.price ? h('span', { class: 'p', text: x.price }) : null,
      ]));
    });
    status.textContent = hits.length ? '' : 'Nothing matches "' + q + '". Try a job, like "1099" or "per diem", or see all tools.';
    if (!hits.length) status.appendChild(h('a', { href: base + '/tools/', text: ' All tools' }));
    mark();
  }
  function mark() {
    [].forEach.call(list.querySelectorAll('[role="option"]'), function (a, i) { a.setAttribute('aria-selected', i === sel ? 'true' : 'false'); });
    var cur = document.getElementById('nav-hit-' + sel);
    if (cur) { input.setAttribute('aria-activedescendant', cur.id); cur.scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }

  function openSearch() {
    if (!dlg) build();
    setPanel(false);
    if (menu) menu.open = false;
    lastFocus = document.activeElement;
    dlg.hidden = false;
    document.documentElement.classList.add('nav-locked');
    input.value = '';
    sel = 0;
    draw();
    input.focus();
    load().then(draw, function () { status.textContent = 'Search could not load. '; status.appendChild(h('a', { href: base + '/tools/', text: 'See all tools' })); });
  }
  function closeSearch() {
    if (!dlg || dlg.hidden) return;
    dlg.hidden = true;
    document.documentElement.classList.remove('nav-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  [].forEach.call(document.querySelectorAll('.nav-search, [data-nav-open-search]'), function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
    a.addEventListener('pointerenter', function () { load().catch(function () {}); });
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (dlg && !dlg.hidden) closeSearch(); else openSearch(); }
    else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape' && panel && !panel.hidden) setPanel(false);
  });
})();
