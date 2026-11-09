/* The header's tools menu and search, on every page. Loaded deferred from the shared head
   (routes/pages.js render()), before motion.js.

   - "Tools" opens a panel of every tool in its group, with what it does and where its price
     starts. On a phone the same list heads the menu sheet.
   - The search box (and "/" or Cmd/Ctrl+K anywhere) opens a dialog that finds tools and the guide
     and table pages under them, as you type, from {base}/nav.json.

   - On a tool's page (and a long brand page), a bar under the header jumps to its parts (the calculator, the rules,
     the prices, the code, the guides) and marks the one you are reading. When it reaches the header it
     attaches to it: one slim row while reading, the full bar with a tray of parts when reaching up. On a phone a long
     intro folds to a few lines with "Read more", so the calculator is near the top. A tool page's bar
     shows at most three short names; the other parts sit under More, and a part moves there too
     rather than be cut off when the row runs out of room.

   The index is fetched once, the first time someone reaches for either. Without JavaScript the
   Tools link and the search box both go to the tools page. */
(function () {
  'use strict';

  var cfg = window.ENDWISE || {};
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
    if (!open) byHover = false;
    toolsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    head.classList.toggle('nav-open', open);
    if (open) load().catch(function () {});
  }
  // With a mouse the panel opens on hover, after a short pause so passing over Tools on the way
  // elsewhere does not flash it, and closes a moment after the pointer leaves both the button and
  // the panel, so a diagonal move into the panel keeps it open. A click on Tools then goes to the
  // tools page, as the link says. By touch or keyboard a click opens and closes it instead.
  var canHover = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var openTimer = 0, closeTimer = 0, byHover = false;
  function hoverIn() {
    clearTimeout(closeTimer);
    if (!panel.hidden) return;
    openTimer = setTimeout(function () { byHover = true; setPanel(true); }, 120);
  }
  function hoverOut() {
    clearTimeout(openTimer);
    if (panel.hidden || !byHover) return;
    closeTimer = setTimeout(function () { setPanel(false); }, 260);
  }
  function firstLink() { return panel.querySelector('a'); }
  if (toolsBtn && panel) {
    toolsBtn.addEventListener('click', function (e) {
      // A mouse click on a panel the hover already opened follows the link.
      if (canHover && e.detail > 0 && !panel.hidden && byHover) return;
      e.preventDefault();
      clearTimeout(openTimer);
      byHover = false;
      setPanel(panel.hidden);
    });
    toolsBtn.addEventListener('pointerenter', function (e) { load().catch(function () {}); if (canHover && e.pointerType === 'mouse') hoverIn(); });
    toolsBtn.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hoverOut(); });
    panel.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') clearTimeout(closeTimer); });
    panel.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hoverOut(); });
    // Down arrow opens it from the keyboard and moves into the list.
    toolsBtn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown') return;
      e.preventDefault();
      byHover = false;
      setPanel(true);
      load().then(function () { var a = firstLink(); if (a) a.focus(); }, function () {});
    });
    // Up and down arrows step through the panel's links.
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setPanel(false); toolsBtn.focus(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var links = [].slice.call(panel.querySelectorAll('a'));
      var i = links.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      links[(i + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus();
    });
    // Tabbing out of the button and the panel closes it.
    [toolsBtn, panel].forEach(function (el) {
      el.addEventListener('focusout', function (e) {
        var to = e.relatedTarget;
        if (to && !panel.contains(to) && to !== toolsBtn) setPanel(false);
      });
    });
    document.addEventListener('click', function (e) { if (!panel.hidden && !e.target.closest('#nav-tools-panel, .nav-tools')) setPanel(false); });
  }
  // The phone menu closes on Escape, on a tap outside it, and when one of its links is followed.
  var menu = head.querySelector('details.menu');
  if (menu) {
    menu.addEventListener('toggle', function () { if (menu.open) load().catch(function () {}); });
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    menu.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    menu.addEventListener('click', function (e) { if (e.target.closest('.menu-panel a')) menu.open = false; });
  }

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
    return shortTab(label.trim().split(/[,:]\s/)[0]);
  }
  // A long name cut down for the bar, by the same rules as the server's (lib/brand/tab-labels.js,
  // which also names the guide and table sections): drop a leading "The"/"A", cut at " by ",
  // " for ", " and ", " in " and a trailing year, then keep the first word if it is still long.
  function shortTab(s) {
    if (s.length <= 13) return s;
    var t = s.replace(/^(the|a|an)\s+/i, '').split(/ by | for | and | in /i)[0].replace(/\s+\d{4}$/, '').trim();
    if (t.length > 13) { var w = t.split(/\s+/)[0]; if (w.length >= 4) t = w; }
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  // A part's name in the More menu, where there is room for more words: a guide or table section's
  // own heading, a page's catch-all "More" section by its label; else its name in the bar.
  function menuName(sec, label) {
    var full = sec.getAttribute('aria-label') || ((sec.querySelector('h2') || {}).textContent || '');
    full = full.trim().split(/[,:]\s/)[0];
    if (/^more$/i.test(label)) return full && !/^more$/i.test(full) ? full : 'More pages';
    if (sec.classList.contains('cp-index') && full && full.length <= 34) return full;
    return label;
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
    var parts = secs.map(function (sec, i) {
      var label = name(sec, i);
      if (!sec.id) sec.id = 'part-' + (i === 0 ? 'calculator' : label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      return { href: '#' + sec.id, label: label, menu: menuName(sec, label) };
    });
    // A tool page shows at most three parts; the rest go under More. A page's own catch-all section
    // named "More" goes there first, so the bar never shows two Mores.
    var shown = parts.map(function () { return true; });
    if (cfg.tool && parts.length > 3) {
      var room = 3;
      shown = parts.map(function (p) { var on = room > 0 && !/^more$/i.test(p.label); if (on) room -= 1; return on; });
    }
    parts.forEach(function (p, i) { p.shown = shown[i]; });
    var links = fillRow(row, parts);
    bar.appendChild(row);
    intro.after(bar);
    document.documentElement.classList.add('has-parts');
    docked(bar, row, secs, links, parts);
    fitRow(row);
    window.addEventListener('resize', function () { fitRow(row); });
  }

  // ---------- the parts' rows: at most three, then More ----------
  // A row gets a link per part (those not shown carry tp-off) and, at the end, a More button that
  // opens the menu of the parts it is not showing.
  function fillRow(r, parts) {
    var links = parts.map(function (p, i) {
      var a = h('a', { href: p.href, text: p.label, class: p.shown ? null : 'tp-off' });
      a.style.setProperty('--i', i);
      r.appendChild(a);
      return a;
    });
    var more = h('button', { type: 'button', class: 'tp-more', 'aria-haspopup': 'true', 'aria-expanded': 'false' }, [h('span', { text: 'More' }), svgIcon('M5 7l4 4 4-4')]);
    more.style.setProperty('--i', parts.length);
    more.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(more, r, parts); });
    r.appendChild(more);
    r._parts = parts;
    r._more = more;
    syncMore(r);
    return links;
  }
  function syncMore(r) {
    r._more.hidden = !r.querySelector(':scope > a.tp-off');
  }
  // Never cut off: while the row is wider than its room, the last part shown moves under More.
  function fitRow(r) {
    if (!r._parts || !r.clientWidth) return;
    var links = [].slice.call(r.querySelectorAll(':scope > a'));
    links.forEach(function (a, i) { a.classList.toggle('tp-off', !r._parts[i].shown); });
    syncMore(r);
    for (var i = links.length - 1; i > 0 && r.scrollWidth > r.clientWidth + 1; i--) {
      if (links[i].classList.contains('tp-off')) continue;
      links[i].classList.add('tp-off');
      syncMore(r);
    }
  }
  var menu = null, menuFor = null;
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    if (menuFor) menuFor.setAttribute('aria-expanded', 'false');
    menuFor = null;
  }
  function toggleMenu(btn, r, parts) {
    if (menuFor === btn) { closeMenu(); return; }
    closeMenu();
    if (!menu) {
      menu = h('div', { class: 'tp-menu', hidden: '' });
      document.body.appendChild(menu);
      document.addEventListener('click', function (e) { if (!menu.contains(e.target)) closeMenu(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { var b = menuFor; closeMenu(); if (b) b.focus(); } });
      window.addEventListener('scroll', closeMenu, { passive: true });
      window.addEventListener('resize', closeMenu);
    }
    menu.textContent = '';
    var links = [].slice.call(r.querySelectorAll(':scope > a'));
    links.forEach(function (a, i) {
      if (!a.classList.contains('tp-off')) return;
      var item = h('a', { href: parts[i].href, text: parts[i].menu });
      if (a.hasAttribute('aria-current')) item.setAttribute('aria-current', 'location');
      item.addEventListener('click', closeMenu);
      menu.appendChild(item);
    });
    menu.hidden = false;
    menuFor = btn;
    btn.setAttribute('aria-expanded', 'true');
    var box = btn.getBoundingClientRect();
    var w = menu.offsetWidth;
    menu.style.top = Math.round(box.bottom + 6) + 'px';
    menu.style.left = Math.round(Math.max(8, Math.min(box.right - w, window.innerWidth - w - 8))) + 'px';
    var first = menu.querySelector('a');
    if (first && document.activeElement === btn && btn.matches(':focus-visible')) first.focus();
  }

  // ---------- the parts attach to the bar ----------
  // Once the page's own row of parts reaches the header it rises into it. Reading (scrolling down),
  // the bar is one slim row: the main links fold into Menu and the parts take their place. Reaching
  // (scrolling up past a little travel, resting the pointer on the bar, or Menu) it opens: the main
  // row comes back and the parts sit in a tray under it. On a narrow screen there is no room for
  // the slim row, so docked is always the tray. motion.js reshapes the glass to match (hp-docked,
  // hp-wide); every row of parts marks the one being read with a sliding pill.
  function docked(bar, row, secs, links, parts) {
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
      fillRow(r, parts);
      [].forEach.call(r.querySelectorAll('a, .tp-more'), function (c) { c.tabIndex = -1; });
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

    // The pill slides to the current part in a row; a row that is not showing hides its pill.
    function place(r) {
      var ind = r.querySelector(':scope > .hp-ind'), on = r.querySelector(':scope > a[aria-current]');
      if (!ind) return;
      // A part under More: the pill sits on More.
      if (on && on.classList.contains('tp-off')) on = r._more;
      if (r._more) r._more.classList.toggle('on', on === r._more);
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
      fitRow(slimTabs);
    }

    var isDocked = false, wide = false, upward = false, hovering = false, travel = 0, lastY = window.scrollY;
    var enterTimer = 0, leaveTimer = 0, bumpTimer = 0;
    function set() {
      var w = isDocked && (narrow.matches || upward || hovering);
      head.classList.toggle('hp-docked', isDocked);
      head.classList.toggle('hp-slim-on', isDocked && !w);
      menuBtn.setAttribute('aria-expanded', w ? 'true' : 'false');
      [].forEach.call(slimTabs.querySelectorAll('a, .tp-more'), function (a) { a.tabIndex = isDocked && !w ? 0 : -1; });
      [].forEach.call(trayTabs.querySelectorAll('a, .tp-more'), function (a) { a.tabIndex = w ? 0 : -1; });
      if (w !== wide) {
        wide = w;
        head.classList.toggle('hp-wide', w);
        closeMenu();
        fitRow(trayTabs);
        fitRow(slimTabs);
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

    // Positions are measured once (and again when the page's size changes), never inside the
    // scroll frame: reading layout there after the bar's own writes made the browser lay the page
    // out again on every frame.
    var barTop = 0, limit = 0, secTops = [], lastK = -1;
    function measure() {
      var y = window.scrollY;
      limit = navRow.getBoundingClientRect().bottom + 6;
      row.style.transform = '';
      barTop = bar.getBoundingClientRect().top + y;
      secTops = secs.map(function (sec) { return sec.getBoundingClientRect().top + y; });
      lastK = -1;
    }
    var cur = -1;
    function tick() {
      var y = window.scrollY, dy = y - lastY;
      lastY = y;
      if ((dy > 0) !== (travel > 0)) travel = 0;
      travel += dy;
      if (travel < -28) upward = true; else if (travel > 28) upward = false;

      // The page's row rises into the bar as it reaches it (written only while it is moving).
      var top = barTop - y;
      var k = Math.max(0, Math.min(1, (top - limit) / 110));
      if (Math.abs(k - lastK) > 0.004) {
        lastK = k;
        row.style.opacity = reduce ? (k > 0 ? 1 : 0) : k;
        row.style.transform = reduce || k === 1 ? '' : 'translateY(' + (-(1 - k) * 14).toFixed(1) + 'px) scale(' + (0.97 + k * 0.03).toFixed(3) + ')';
        row.style.pointerEvents = k > 0.5 ? '' : 'none';
      }
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
      secTops.forEach(function (t, i) { if (t - y < line) at = i; });
      if (at !== cur) {
        cur = at;
        rows.forEach(function (r) {
          [].forEach.call(r.querySelectorAll(':scope > a'), function (a, i) { if (i === at) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        });
        placeAll();
      }
    }
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
    window.addEventListener('resize', function () { measure(); if (isDocked) fitSlim(); fitRow(trayTabs); placeAll(); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { measure(); tick(); }).observe(document.body);
    narrow.addEventListener('change', set);
    measure();
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
  // A photo's credit button (ⓘ): a tap shows its credit, another tap or a tap elsewhere hides it.
  function photoCredits() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.ph-i');
      [].forEach.call(document.querySelectorAll('.ph-i.open'), function (x) { if (x !== b) x.classList.remove('open'); });
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      b.classList.toggle('open');
    });
  }
  // A hub's finder: one search box and the category chips filter its cards; a group with no card
  // left is hidden, and a line says when nothing matches.
  function hubFinder() {
    var box = document.querySelector('[data-finder]');
    if (!box) return;
    var input = box.querySelector('input[type="search"]');
    var chips = [].slice.call(box.querySelectorAll('[data-filter]'));
    var scope = document.querySelector(box.getAttribute('data-finder')) || document;
    var cards = [].slice.call(scope.querySelectorAll('[data-group]'));
    var groups = [].slice.call(scope.querySelectorAll('.hub-group'));
    var empty = scope.querySelector('.finder-empty');
    var cat = '';
    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      cards.forEach(function (c) {
        var hit = (!cat || c.getAttribute('data-group') === cat) && (!q || c.textContent.toLowerCase().indexOf(q) !== -1);
        c.hidden = !hit;
      });
      var any = false;
      groups.forEach(function (g) { var on = !!g.querySelector('[data-group]:not([hidden])'); g.hidden = !on; any = any || on; });
      if (empty) empty.hidden = any;
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        cat = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
  }
  // Chip rows that scroll sideways show an arrow while there is more to the right.
  function chipScrolls() {
    [].forEach.call(document.querySelectorAll('.chip-scroll'), function (wrap) {
      var row = wrap.querySelector('.chips');
      if (!row) return;
      function mark() { wrap.classList.toggle('over', row.scrollWidth - row.clientWidth - row.scrollLeft > 4); }
      row.addEventListener('scroll', mark, { passive: true });
      window.addEventListener('resize', mark);
      mark();
    });
  }
  // Tabs: chips over panels. Without JavaScript every panel shows.
  function tabs() {
    [].forEach.call(document.querySelectorAll('[data-tabs]'), function (row) {
      var btns = [].slice.call(row.querySelectorAll('[role="tab"]'));
      function show(btn) {
        btns.forEach(function (b) {
          var on = b === btn;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
      }
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () { show(b); });
        b.addEventListener('keydown', function (e) {
          var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!k) return;
          var next = btns[(i + k + btns.length) % btns.length];
          next.focus(); show(next);
        });
      });
      show(btns.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || btns[0]);
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
  if (window.Endwise && window.Endwise.signInHref) {
    [].forEach.call(document.querySelectorAll('.site-head a.nav-start, .site-head [data-endwise-chip] a.endwise-chip-link'), function (a) { a.href = window.Endwise.signInHref(); });
  }
  toolParts();
  docsSpy();
  foldIntro();
  hubFinder();
  photoCredits();
  chipScrolls();
  tabs();
})();
