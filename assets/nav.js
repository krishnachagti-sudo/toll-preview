/* The header's tools menu and search, on every page. Loaded deferred from the shared head
   (routes/pages.js render()), before motion.js.

   - "Tools" opens a panel of every tool in its group, with what it does and where its price
     starts. On a phone the same list heads the menu sheet.
   - The search box (and "/" or Cmd/Ctrl+K anywhere) opens a dialog that finds tools and the guide
     and table pages under them, as you type, from {base}/nav.json.

   - On a tool's page (and a long brand page), a bar under the header jumps to its parts (the calculator, the rules,
     the prices, the code, the guides) and marks the one you are reading. When it reaches the header it
     attaches to it: one slim row while reading, the full bar with a tray of parts when reaching up. On a phone a long
     intro folds to a few lines with "Read more", so the calculator is near the top.

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
  // ---------- a tool page's parts ----------
  // A section's name in the bar: its data-jump, else its aria-label or heading, cut at the first
  // comma. The calculator and the code get the same words on every tool.
  function jumpName(sec, i) {
    if (sec.dataset.jump) return sec.dataset.jump;
    if (i === 0) return 'Calculator';
    var label = sec.getAttribute('aria-label') || ((sec.querySelector('h2') || {}).textContent || '');
    if (/^use this from code$/i.test(label.trim())) return 'From code';
    return label.trim().split(/[,:]\s/)[0];
  }
  // A tool's page: every section after the intro. A brand page (pricing, developers and the
  // like): its home-style sections after the opening, named by their eyebrows, without the closing.
  function toolParts() {
    var main = document.getElementById('main');
    if (!main) return;
    var kids = [].filter.call(main.children, function (n) { return n.tagName === 'SECTION'; });
    var intro, secs, name;
    if (cfg.tool) {
      intro = kids.shift(); secs = kids; name = jumpName;
    } else if (document.querySelector('.brand-page')) {
      intro = kids.filter(function (n) { return n.classList.contains('hero'); })[0];
      secs = kids.filter(function (n) { return n.classList.contains('sec') && n.id && n.querySelector('.eyebrow'); });
      name = function (sec) { return sec.dataset.jump || sec.querySelector('.eyebrow').textContent.trim(); };
    } else return;
    if (!intro || secs.length < 3) return;
    var bar = h('nav', { class: 'tool-parts', 'aria-label': 'On this page', 'data-lenis-prevent': '' });
    var row = h('div', { class: 'tp-row' });
    var links = secs.map(function (sec, i) {
      if (!sec.id) sec.id = 'part-' + (i === 0 ? 'calculator' : name(sec, i).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      var a = h('a', { href: '#' + sec.id, text: name(sec, i) });
      row.appendChild(a);
      return a;
    });
    bar.appendChild(row);
    intro.after(bar);
    document.documentElement.classList.add('has-parts');
    docked(bar, row, secs, links);
  }

  // ---------- the parts attach to the bar ----------
  // Once the page's own row of parts reaches the header it rises into it. Reading (scrolling down),
  // the bar is one slim row: the main links fold into Menu and the parts take their place. Reaching
  // (scrolling up past a little travel, resting the pointer on the bar, or Menu) it opens: the main
  // row comes back and the parts sit in a tray under it. On a narrow screen there is no room for
  // the slim row, so docked is always the tray. motion.js reshapes the glass to match (hp-docked,
  // hp-wide); every row of parts marks the one being read with a sliding pill.
  function docked(bar, row, secs, links) {
    var navRow = head.querySelector('.nav-row');
    var mainNav = head.querySelector('.head-nav');
    var search = head.querySelector('.nav-search');
    if (!navRow || !mainNav) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = window.matchMedia('(max-width: 900px)');
    var smooth = function () { return reduce ? 'auto' : 'smooth'; };

    function copyRow(cls) {
      var r = h('div', { class: 'hp-tabs ' + cls });
      r.appendChild(h('span', { class: 'hp-ind', 'aria-hidden': 'true' }));
      links.forEach(function (a, i) {
        var c = h('a', { href: a.getAttribute('href'), tabindex: '-1', text: a.textContent });
        c.style.setProperty('--i', i);
        r.appendChild(c);
      });
      return r;
    }
    var menuBtn = h('button', { type: 'button', class: 'hp-menu', 'aria-label': 'Open the main menu', 'aria-expanded': 'false' }, [
      svgIcon('M3 6h12M3 10h12M3 14h7'), h('span', { text: 'Menu' })]);
    var slimTabs = copyRow('hp-slim-tabs');
    var slim = h('nav', { class: 'hp-slim', 'aria-label': 'On this page' }, [menuBtn, slimTabs]);
    mainNav.after(slim);
    var trayTabs = copyRow('hp-tray-tabs');
    var tray = h('nav', { class: 'hp-tray', 'aria-label': 'On this page' }, [trayTabs]);
    head.appendChild(tray);
    var rows = [row, slimTabs, trayTabs];
    row.insertBefore(h('span', { class: 'hp-ind', 'aria-hidden': 'true' }), row.firstChild);
    links.forEach(function (a, i) { a.style.setProperty('--i', i); });

    // The pill slides to the current part in a row; a row that is not showing hides its pill.
    function place(r) {
      var ind = r.querySelector(':scope > .hp-ind'), on = r.querySelector('a[aria-current]');
      if (!ind) return;
      if (!on || !on.offsetWidth || !r.offsetWidth) { ind.classList.remove('on'); return; }
      ind.style.width = on.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      ind.classList.add('on');
      if (r.scrollWidth > r.clientWidth) r.scrollTo({ left: on.offsetLeft - r.clientWidth / 2 + on.offsetWidth / 2, behavior: smooth() });
    }
    function placeAll() { rows.forEach(place); }

    // The slim row fills the space between the logo and the search, which narrows to its icon.
    function fitSlim() {
      var logo = navRow.querySelector('.logo');
      var left = logo ? logo.offsetLeft + logo.offsetWidth + 18 : 160;
      var right = search ? navRow.clientWidth - (search.offsetLeft + search.offsetWidth) + 42 + 12 : 200;
      slim.style.left = left + 'px';
      slim.style.right = right + 'px';
    }

    var isDocked = false, wide = false, upward = false, hovering = false, travel = 0, lastY = window.scrollY;
    var enterTimer = 0, leaveTimer = 0, bumpTimer = 0;
    function set() {
      var w = isDocked && (narrow.matches || upward || hovering);
      head.classList.toggle('hp-docked', isDocked);
      head.classList.toggle('hp-slim-on', isDocked && !w);
      menuBtn.setAttribute('aria-expanded', w ? 'true' : 'false');
      [].forEach.call(slimTabs.querySelectorAll('a'), function (a) { a.tabIndex = isDocked && !w ? 0 : -1; });
      [].forEach.call(trayTabs.querySelectorAll('a'), function (a) { a.tabIndex = w ? 0 : -1; });
      if (w !== wide) {
        wide = w;
        head.classList.toggle('hp-wide', w);
      }
      setTimeout(placeAll, 80);
    }
    head.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !isDocked) return;
      clearTimeout(leaveTimer);
      // A pointer passing over the bar on its way elsewhere does not open it: it has to rest.
      enterTimer = setTimeout(function () { hovering = true; set(); }, 140);
    });
    head.addEventListener('pointerleave', function () {
      clearTimeout(enterTimer);
      leaveTimer = setTimeout(function () { hovering = false; set(); }, 380);
    });
    menuBtn.addEventListener('click', function () { upward = true; set(); });
    head.addEventListener('focusin', function (e) { if (tray.contains(e.target)) { upward = true; set(); } });

    var cur = -1;
    function tick() {
      var y = window.scrollY, dy = y - lastY;
      lastY = y;
      if ((dy > 0) !== (travel > 0)) travel = 0;
      travel += dy;
      if (travel < -28) upward = true; else if (travel > 28) upward = false;

      // The page's row rises into the bar as it reaches it.
      var limit = navRow.getBoundingClientRect().bottom + 6;
      var top = bar.getBoundingClientRect().top;
      var k = Math.max(0, Math.min(1, (top - limit) / 110));
      row.style.opacity = reduce ? (k > 0 ? 1 : 0) : k;
      row.style.transform = reduce ? '' : 'translateY(' + (-(1 - k) * 14).toFixed(1) + 'px) scale(' + (0.97 + k * 0.03).toFixed(3) + ')';
      row.style.pointerEvents = k > 0.5 ? '' : 'none';
      var now = top < limit;
      if (now !== isDocked) {
        isDocked = now;
        if (!now) upward = false;
        if (now) {
          fitSlim();
          if (!reduce) { head.classList.remove('hp-bump'); void head.offsetWidth; head.classList.add('hp-bump'); clearTimeout(bumpTimer); bumpTimer = setTimeout(function () { head.classList.remove('hp-bump'); }, 800); }
        }
      }
      set();

      // The part nearest the top of the screen is the one being read.
      var line = 170, at = 0;
      secs.forEach(function (sec, i) { if (sec.getBoundingClientRect().top < line) at = i; });
      if (at !== cur) {
        cur = at;
        rows.forEach(function (r) {
          [].forEach.call(r.querySelectorAll('a'), function (a, i) { if (i === at) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        });
        placeAll();
      }
    }
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
    window.addEventListener('resize', function () { if (isDocked) fitSlim(); placeAll(); });
    narrow.addEventListener('change', set);
    tick();
    setTimeout(placeAll, 120);
  }
  function svgIcon(d) {
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), path = document.createElementNS(ns, 'path');
    svg.setAttribute('viewBox', '0 0 18 18'); svg.setAttribute('width', '15'); svg.setAttribute('height', '15'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.7'); svg.setAttribute('stroke-linecap', 'round');
    path.setAttribute('d', d); svg.appendChild(path);
    return svg;
  }

  // On a phone, an intro's long lede folds to four lines behind "Read more".
  function foldIntro() {
    if (!cfg.tool || !window.matchMedia('(max-width: 720px)').matches) return;
    var main = document.getElementById('main');
    var intro = main && main.querySelector(':scope > section');
    var lede = intro && intro.querySelector('.lede');
    if (!lede) return;
    lede.classList.add('folded');
    if (lede.scrollHeight <= lede.clientHeight + 4) { lede.classList.remove('folded'); return; }
    var more = h('button', { type: 'button', class: 'lede-more', 'aria-expanded': 'false', text: 'Read more' });
    more.addEventListener('click', function () { lede.classList.remove('folded'); more.remove(); });
    lede.after(more);
  }
  // The tools page's category chips filter its list.
  function toolFilter() {
    var chips = document.querySelectorAll('[data-tool-filter]');
    if (!chips.length) return;
    [].forEach.call(chips, function (chip) {
      chip.setAttribute('role', 'button');
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        var id = chip.getAttribute('data-tool-filter');
        [].forEach.call(chips, function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        [].forEach.call(document.querySelectorAll('.tool-card[data-group]'), function (card) { card.hidden = !!id && card.getAttribute('data-group') !== id; });
      });
    });
  }
  // The docs' contents list marks the section being read.
  function docsSpy() {
    var links = [].slice.call(document.querySelectorAll('.docs-toc a[href^="#"]'));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    if (!links.length || secs.some(function (s) { return !s; })) return;
    document.documentElement.classList.add('has-parts');
    var ol = links[0].closest('ol'), cur = -1, ticking = false;
    function mark() {
      var at = 0;
      secs.forEach(function (sec, i) { if (sec.getBoundingClientRect().top < 170) at = i; });
      if (at === cur) return;
      cur = at;
      links.forEach(function (a, i) { if (i === at) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      if (ol.scrollWidth > ol.clientWidth) ol.scrollTo({ left: links[at].offsetLeft - 16, behavior: 'smooth' });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; mark(); }); } }, { passive: true });
    mark();
  }
  // "Get started" brings you back to this page after signing up.
  if (window.Toll && window.Toll.signInHref) {
    [].forEach.call(document.querySelectorAll('.site-head a.nav-start, .site-head [data-toll-chip] a.toll-chip-link'), function (a) { a.href = window.Toll.signInHref(); });
  }
  toolParts();
  docsSpy();
  foldIntro();
  toolFilter();
})();
