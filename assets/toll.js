/* Shared browser helpers for every page: brand pages and tool pages alike.
   The server injects window.TOLL = { base, brand, tool } into each page; every URL here is
   built from TOLL.base, so the site works under any base path. When the page's prices are not in
   US dollars it also carries { currency, locale } and, on a tool page, { prices }: the tool's
   dollar prices as text, each with the same price in that currency.

   window.Toll = {
     base, brand, tool,
     currency, locale         the page's currency ("USD" unless the server said otherwise) and locale.
     money(display)           an API "display" object ({ USD: "$0.10", ... }) in the page's currency.
     prices(text)             a dollar sentence with the tool's own prices in the page's currency.
     api(path, opts)          fetch base + path as JSON; opts: { method, body, keepalive }.
                              Resolves with the JSON body (null for 204). Rejects with an Error
                              carrying .code, .status and .fields when the server says no.
     me(fresh)                the signed-in account { email, currency, ..., balance, limits } or null.
     mountAccountChip(el)     "Sign in" when signed out; balance and "Top up" when signed in.
     mountCodePanel(el, slug) curl / JavaScript / Python / MCP for the tool's first example.
     run(slug, input)         run a tool from the page (signed in: charged; signed out: free daily runs).
     track(type)              first-party page_view beacon (sent once per page load automatically).
     copy(text, el, statusEl) copy text, falling back to selecting el; a toast says it worked.
     toast(text)              a short note at the foot of the screen with the mark ("Copied").
   }
   Elements with data-toll-chip get an account chip; elements with data-toll-code get a code
   panel for the slug in the attribute (or this page's tool). */
(function () {
  'use strict';

  var cfg = window.TOLL || {};
  var base = typeof cfg.base === 'string' ? cfg.base : '';
  var brand = typeof cfg.brand === 'string' ? cfg.brand : '';
  var tool = typeof cfg.tool === 'string' ? cfg.tool : null;
  var currency = typeof cfg.currency === 'string' ? cfg.currency : 'USD';
  var locale = typeof cfg.locale === 'string' ? cfg.locale : 'en-US';
  var swaps = cfg.prices && typeof cfg.prices === 'object' ? cfg.prices : {};

  // ---------- prices in the page's currency ----------
  // Whole amounts in another currency drop their ".00", as the server writes them; dollar text
  // stays exactly as the API writes it.
  function natural(text) {
    return currency === 'USD' ? text : String(text).replace(/([^\d.,][\d,]+)\.00(?!\d)/g, '$1');
  }
  function money(display) {
    if (!display) return '';
    return natural(display[currency] || display.USD || '');
  }
  function prices(text) {
    return currency === 'USD' ? text : natural(String(text).replace(/\$\d[\d,]*(?:\.\d+)?/g, function (m) { return swaps[m] || m; }));
  }

  // ---------- small DOM helper ----------
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : String(v));
      });
    }
    [].concat(children === undefined ? [] : children).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  // ---------- API ----------
  function apiError(message, code, status, fields, body) {
    var e = new Error(message);
    e.code = code;
    e.status = status;
    e.fields = fields || null;
    e.body = body || null;
    return e;
  }

  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || (opts.body !== undefined ? 'POST' : 'GET'), credentials: 'same-origin', headers: { Accept: 'application/json' } };
    if (opts.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    if (opts.keepalive) init.keepalive = true;
    return fetch(base + path, init).then(function (res) {
      if (res.status === 204) return null;
      return res.text().then(function (text) {
        var json = null;
        try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
        if (!res.ok || !json || json.ok === false) {
          var err = (json && json.error) || {};
          throw apiError(err.message || 'Something went wrong on our side. Try again.', err.code || 'http_' + res.status, res.status, err.fields, json);
        }
        return json;
      });
    }, function () {
      throw apiError('We could not reach the server. Check your connection and try again.', 'network', 0);
    });
  }

  // ---------- account ----------
  var mePromise = null;
  var chips = [];

  function me(fresh) {
    if (!mePromise || fresh) {
      mePromise = api('/api/account').then(function (json) {
        var account = json.account;
        account.balance = json.balance;
        account.limits = json.limits;
        account.products = json.products || [];
        account.passes = json.passes || [];
        account.bundles = json.bundles || [];
        account.invoices = json.invoices || [];
        account.nonprofit = json.nonprofit || null;
        account.invoiceMinDisplay = json.invoiceMinDisplay || '';
        return account;
      }, function (e) {
        if (e.status === 401) return null;
        mePromise = null;
        throw e;
      });
      if (fresh) mePromise.then(renderChips, function () {});
    }
    return mePromise;
  }

  // The account page, with this page as where to come back to (not from the home or account pages).
  function signInHref() {
    var path = location.pathname;
    if (path === base + '/' || path === base || path.indexOf(base + '/account') === 0) return base + '/account';
    return base + '/account?next=' + encodeURIComponent(path);
  }

  function renderChip(el, account) {
    el.textContent = '';
    if (!account) {
      el.appendChild(h('a', { class: 'toll-chip-link', href: signInHref() }, 'Sign in'));
      return;
    }
    el.appendChild(h('a', { class: 'toll-chip-balance', href: base + '/account', title: 'Your balance. Open your account.' }, [
      h('span', { class: 'toll-visually-hidden' }, 'Balance '),
      account.balance.display,
    ]));
    el.appendChild(h('a', { class: 'toll-chip-topup', href: base + '/account#top-up' }, 'Top up'));
  }

  function renderChips() {
    if (!mePromise) return;
    mePromise.then(function (account) {
      // Lets the chrome swap "Get started" for the balance once someone is signed in.
      document.documentElement.classList.toggle('toll-signed-in', !!account);
      chips.forEach(function (el) { renderChip(el, account); });
    }, function () {
      chips.forEach(function (el) { renderChip(el, null); });
    });
  }

  function mountAccountChip(el) {
    if (!el || chips.indexOf(el) !== -1) return;
    injectStyles();
    el.classList.add('toll-chip');
    chips.push(el);
    me();
    renderChips();
  }

  // ---------- copy ----------
  function copy(text, el, statusEl) {
    function say(msg) { if (statusEl) statusEl.textContent = msg; }
    function selectFallback() {
      var ok = false;
      if (el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      }
      say(ok ? 'Copied.' : 'Selected. Press Ctrl+C or Cmd+C to copy.');
      if (ok) toast('Copied');
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { say('Copied.'); toast('Copied'); }, selectFallback);
    } else {
      selectFallback();
    }
  }

  // ---------- code panel ----------
  function indent(text, pad) {
    return text.split('\n').map(function (line, i) { return i === 0 ? line : pad + line; }).join('\n');
  }

  function shellQuote(s) { return "'" + s.replace(/'/g, "'\\''") + "'"; }

  // A JSON value written as a Python literal.
  function py(value, pad) {
    pad = pad || '';
    var inner = pad + '    ';
    if (value === null) return 'None';
    if (value === true) return 'True';
    if (value === false) return 'False';
    if (typeof value === 'number' || typeof value === 'string') return JSON.stringify(value);
    if (Array.isArray(value)) {
      if (!value.length) return '[]';
      return '[\n' + value.map(function (v) { return inner + py(v, inner); }).join(',\n') + ',\n' + pad + ']';
    }
    var keys = Object.keys(value);
    if (!keys.length) return '{}';
    return '{\n' + keys.map(function (k) { return inner + JSON.stringify(k) + ': ' + py(value[k], inner); }).join(',\n') + ',\n' + pad + '}';
  }

  function exampleInput(info) {
    var ex = info.examples && info.examples[0];
    if (!ex || typeof ex !== 'object') return {};
    return ex.input !== undefined ? ex.input : ex;
  }

  function snippets(info) {
    var origin = window.location.origin;
    var endpoint = origin + base + '/api/v1/tools/' + info.slug;
    var input = exampleInput(info);
    var pretty = JSON.stringify(input, null, 2);
    var serverName = (brand || 'tools').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tools';
    return [
      {
        id: 'curl',
        label: 'curl',
        note: 'Set API_KEY to a key from your account page.',
        code: 'curl -X POST ' + shellQuote(endpoint) + ' \\\n'
          + '  -H "Authorization: Bearer $API_KEY" \\\n'
          + '  -H "Content-Type: application/json" \\\n'
          + '  -d ' + shellQuote(JSON.stringify(input)),
      },
      {
        id: 'js',
        label: 'JavaScript',
        note: 'Node 18 or later. Keep the key on your server, never in a web page.',
        code: 'const res = await fetch(' + JSON.stringify(endpoint) + ', {\n'
          + '  method: "POST",\n'
          + '  headers: {\n'
          + '    "Authorization": `Bearer ${process.env.API_KEY}`,\n'
          + '    "Content-Type": "application/json",\n'
          + '  },\n'
          + '  body: JSON.stringify(' + indent(pretty, '  ') + '),\n'
          + '});\n'
          + 'const data = await res.json();\n'
          + 'if (!data.ok) throw new Error(data.error.message);\n'
          + 'console.log(data.result, data.charged.display);',
      },
      {
        id: 'python',
        label: 'Python',
        note: 'Uses the requests package.',
        code: 'import os\nimport requests\n\n'
          + 'res = requests.post(\n'
          + '    ' + JSON.stringify(endpoint) + ',\n'
          + '    headers={"Authorization": f"Bearer {os.environ[\'API_KEY\']}"},\n'
          + '    json=' + py(input, '    ') + ',\n'
          + '    timeout=30,\n'
          + ')\n'
          + 'data = res.json()\n'
          + 'if not data["ok"]:\n'
          + '    raise RuntimeError(data["error"]["message"])\n'
          + 'print(data["result"], data["charged"]["display"])',
      },
      {
        id: 'mcp',
        label: 'MCP',
        note: 'Add this server to your MCP client, then ask your agent to use the tool "' + info.slug + '". Example arguments: ' + JSON.stringify(input),
        code: JSON.stringify({
          mcpServers: {
            [serverName]: {
              type: 'http',
              url: origin + base + '/mcp',
              headers: { Authorization: 'Bearer YOUR_API_KEY' },
            },
          },
        }, null, 2),
      },
    ];
  }

  var panelCount = 0;

  function buildPanel(el, info) {
    var id = 'toll-code-' + (++panelCount);
    var list = snippets(info);
    var tabs = h('div', { class: 'toll-code-tabs', role: 'tablist', 'aria-label': 'Use this from code' });
    var note = h('p', { class: 'toll-code-note' });
    var pre = h('pre', { class: 'toll-code-pre', id: id + '-panel', role: 'tabpanel', tabindex: '0' });
    var status = h('span', { class: 'toll-code-status', role: 'status' });
    var current = 0;

    function select(i, focus) {
      current = i;
      [].forEach.call(tabs.children, function (b, j) {
        b.setAttribute('aria-selected', j === i ? 'true' : 'false');
        b.tabIndex = j === i ? 0 : -1;
      });
      pre.setAttribute('aria-labelledby', id + '-tab-' + i);
      pre.textContent = list[i].code;
      note.textContent = list[i].note;
      status.textContent = '';
      if (focus) tabs.children[i].focus();
    }

    list.forEach(function (s, i) {
      tabs.appendChild(h('button', {
        type: 'button', role: 'tab', id: id + '-tab-' + i, 'aria-controls': id + '-panel', class: 'toll-code-tab',
        onclick: function () { select(i); },
        onkeydown: function (ev) {
          if (ev.key === 'ArrowRight') { ev.preventDefault(); select((current + 1) % list.length, true); }
          if (ev.key === 'ArrowLeft') { ev.preventDefault(); select((current - 1 + list.length) % list.length, true); }
        },
      }, s.label));
    });

    var price = info.price && info.price.display
      ? 'Each call costs ' + money(info.price.display) + ', taken from your balance.'
      : info.pricing && info.pricing.text
        ? 'Prices, taken from your balance: ' + money(info.pricing.text)
        : '';

    el.textContent = '';
    el.appendChild(h('div', { class: 'toll-code' }, [
      h('div', { class: 'toll-code-head' }, [
        h('strong', { class: 'toll-code-title' }, 'Use this from code'),
        h('button', { type: 'button', class: 'toll-code-copy', onclick: function () { copy(list[current].code, pre, status); } }, 'Copy'),
      ]),
      tabs,
      note,
      pre,
      h('p', { class: 'toll-code-foot' }, [
        price ? price + ' ' : '',
        h('a', { href: base + '/account' }, 'Get an API key'),
        ' · ',
        h('a', { href: base + '/docs' }, 'Read the docs'),
        ' ',
        status,
      ]),
    ]));
    select(0);
  }

  function mountCodePanel(el, slug) {
    if (!el) return Promise.resolve();
    injectStyles();
    slug = slug || tool;
    el.textContent = 'Loading the code examples.';
    if (!slug) { el.textContent = ''; return Promise.resolve(); }
    return api('/api/v1/tools/' + encodeURIComponent(slug)).then(function (json) {
      var info = json.tool;
      if (info.kind !== 'api') {
        el.textContent = 'This tool runs entirely in your browser, so it has no API.';
        return;
      }
      buildPanel(el, info);
    }, function () {
      el.textContent = 'Code examples appear here once this tool is live.';
    });
  }

  // ---------- running a tool ----------
  // Once the day's free runs are gone, every run note on the page says so; until then the page's
  // own note ("5 free runs a day, no account needed") stands.
  function noFreeRunsLeft() {
    [].forEach.call(document.querySelectorAll('[class*="-run-note"]'), function (el) {
      el.textContent = 'No free runs left today. Sign in to keep going, or come back tomorrow.';
    });
  }
  // After a run, the answer box in the section the run came from ([id$="-out"], or the fx board)
  // is brought on screen if it is not, so pressing the button always shows something happening.
  // On a wide screen the answer sits beside the form, often above the button that was pressed.
  function reveal(from) {
    var sec = from && from.closest && from.closest('section');
    var out = sec && sec.querySelector('[id$="-out"], [id$="-board"]');
    if (!out || !out.offsetHeight) return;
    var r = out.getBoundingClientRect(), top = 150;
    if (r.top >= top && r.top < window.innerHeight - 120) return;
    var y = window.pageYOffset + r.top - top;
    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: smooth ? 0.9 : 0, immediate: !smooth });
    else window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
  }
  // A tool shows a refused call's message as text. When the fix is in the account (add money, or
  // raise a limit), the message gains a link straight to that part of the account page.
  function linkFix(from, e) {
    var sec = (from && from.closest && from.closest('section')) || document;
    var href = base + '/account' + (e.code === 'insufficient_balance' ? '#top-up' : '#limits');
    var text = e.code === 'insufficient_balance' ? 'Add money' : 'Change your limit';
    [].forEach.call(sec.querySelectorAll('[role="alert"], .form-error, .field-error'), function (el) {
      if (el.textContent.indexOf(e.message) === -1 || el.querySelector('.toll-fix')) return;
      el.appendChild(document.createTextNode(' '));
      el.appendChild(h('a', { class: 'toll-fix', href: href }, text));
    });
  }

  // A guide page's calculator button sends ?run=1: the visitor already pressed it, so a tool that
  // would wait for a second press runs once. The flag is taken off the address so a reload does not
  // run (and charge) again.
  function takeRunFlag() {
    var q = new URLSearchParams(location.search);
    if (q.get('run') !== '1') return false;
    q.delete('run');
    var rest = q.toString();
    try { history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash); } catch (e) { /* the run still happens */ }
    return true;
  }

  // ---------- micro-interactions: the full stop ----------
  // The looks are in motion.css. A run's button fills while it works and shows the mark when it
  // lands; the answer box slides in and stops; refused runs nudge their message; tables light the
  // row and column under the pointer and, below the fold, come in row by row; copies and downloads
  // say so in a small toast. Under reduced motion the states still show, without movement.
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function buttonOf(from) {
    if (!from || !from.closest) return null;
    if (from.tagName === 'FORM') return from.querySelector('button[type="submit"], button:not([type])');
    return from.closest('button.btn');
  }
  function busy(from) {
    var b = buttonOf(from);
    if (!b) return null;
    clearTimeout(b.tlTimer);
    b.classList.remove('tl-done', 'tl-err');
    void b.offsetWidth;
    b.classList.add('tl-busy');
    return b;
  }
  function settle(b, ok) {
    if (!b) return;
    b.classList.remove('tl-busy');
    void b.offsetWidth;
    b.classList.add(ok ? 'tl-done' : 'tl-err');
    b.tlTimer = setTimeout(function () { b.classList.remove('tl-done', 'tl-err'); }, ok ? 1800 : 500);
  }
  function outOf(from) {
    var sec = from && from.closest && from.closest('section');
    return sec && sec.querySelector('[id$="-out"], [id$="-board"]');
  }
  function land(from) {
    var out = outOf(from);
    if (!out || !out.offsetHeight) return;
    out.classList.remove('tl-land');
    void out.offsetWidth;
    out.classList.add('tl-land');
    [].forEach.call(out.querySelectorAll('span, p, div, small, li'), function (el) {
      if (el.children.length === 0 && /^\s*Charged\b/.test(el.textContent)) el.classList.add('tl-charged');
    });
    rows(out);
  }
  function nudge(from) {
    var sec = (from && from.closest && from.closest('section')) || document;
    [].forEach.call(sec.querySelectorAll('[role="alert"], .form-error'), function (el) {
      if (!el.textContent.trim()) return;
      el.classList.remove('tl-say');
      void el.offsetWidth;
      el.classList.add('tl-say');
    });
  }
  var toastEl = null, toastTimer = 0;
  function toast(text) {
    if (!document.body) return;
    if (!toastEl) {
      toastEl = h('div', { class: 'tl-toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = '';
    toastEl.appendChild(h('i', { 'aria-hidden': 'true' }));
    toastEl.appendChild(document.createTextNode(text));
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }
  // Tables: the column under the pointer lights with its row (the row's look is pure CSS).
  var litCells = [];
  function unlight() { litCells.forEach(function (c) { c.classList.remove('tl-col'); }); litCells = []; }
  function lightColumn(cell) {
    unlight();
    var table = cell.closest('table');
    if (!table || !cell.parentNode) return;
    var i = [].indexOf.call(cell.parentNode.children, cell);
    if (i < 1) return; // the first column is the row's label; the row already lights it
    [].forEach.call(table.rows, function (r) {
      var c = r.children[i];
      if (c && !c.hasAttribute('colspan')) { c.classList.add('tl-col'); litCells.push(c); }
    });
  }
  // Long tables below the fold come in row by row, once.
  var rowObserver = null;
  function rows(scope) {
    if (reduced || !('IntersectionObserver' in window)) return;
    if (!rowObserver) {
      rowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('tl-shown');
          rowObserver.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    [].forEach.call((scope || document).querySelectorAll('main table'), function (t) {
      if (t.tlRows || !t.tBodies[0] || t.tBodies[0].rows.length < 3) return;
      t.tlRows = true;
      [].forEach.call(t.tBodies[0].rows, function (r, i) { r.style.setProperty('--i', Math.min(i, 24)); });
      t.classList.add('tl-rows');
      rowObserver.observe(t);
    });
  }
  function micro() {
    document.addEventListener('pointerover', function (e) {
      var cell = e.target.closest && e.target.closest('main td, main th');
      if (cell) lightColumn(cell); else if (litCells.length) unlight();
    });
    document.addEventListener('pointerleave', unlight);
    // A download link says it is on its way (the browser's own bar can be easy to miss).
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[download], a[href$=".pdf"], a[href$=".csv"], a[href$=".zip"]');
      if (a) toast('Downloading');
    });
    rows(document);
  }

  // What started the run: the form submitted or button pressed last (a tool may disable its button
  // while it works, which drops focus to the page).
  var lastAction = null;
  document.addEventListener('submit', function (e) { lastAction = e.target; }, true);
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button')) lastAction = e.target; }, true);
  function run(slug, input) {
    var from = lastAction || document.activeElement;
    var btn = busy(from);
    return api('/api/run/' + encodeURIComponent(slug || tool), { body: input === undefined ? {} : input }).then(function (json) {
      settle(btn, true);
      // Two frames: the tool draws its answer when this resolves, then it is measured.
      requestAnimationFrame(function () { requestAnimationFrame(function () { reveal(from); land(from); }); });
      if (json && json.freeRunsLeft === 0) noFreeRunsLeft();
      if (json && json.balance && mePromise) {
        mePromise.then(function (account) {
          if (!account) return;
          account.balance.total = json.balance.total;
          account.balance.display = json.balance.display;
          chips.forEach(function (el) { renderChip(el, account); });
        }, function () {});
      }
      return json;
    }, function (e) {
      settle(btn, false);
      requestAnimationFrame(function () { requestAnimationFrame(function () { nudge(from); }); });
      if (e.code === 'rate_limited') noFreeRunsLeft(); // the web runner's only limit is the free runs
      if (e.code === 'insufficient_balance' || e.code === 'cap_reached') {
        requestAnimationFrame(function () { requestAnimationFrame(function () { linkFix(from, e); }); });
      }
      throw e;
    });
  }

  // ---------- usage beacon ----------
  var tracked = {};
  function track(type) {
    type = type || 'page_view';
    if (type !== 'page_view' || tracked[type]) return Promise.resolve();
    tracked[type] = true;
    var body = { type: type };
    if (tool) body.tool = tool;
    return api('/api/events', { body: body, keepalive: true }).then(function () {}, function () {});
  }

  // ---------- component styles (scoped; tool pages can theme them with --toll-* variables) ----------
  var styled = false;
  function injectStyles() {
    if (styled) return;
    styled = true;
    var css = ''
      + '.toll-chip{display:inline-flex;align-items:center;gap:12px;font-variant-numeric:tabular-nums}'
      + '.toll-chip a{color:inherit;text-decoration:none;font-weight:500}'
      + '.toll-chip a:hover{text-decoration:underline}'
      + '.toll-chip .toll-chip-balance{font-feature-settings:"tnum" 1}'
      + '.toll-chip .toll-chip-topup,.toll-chip .toll-chip-link{padding:6px 12px;border:1px solid currentColor;border-radius:4px;min-height:34px;display:inline-flex;align-items:center}'
      + '.toll-visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
      + '.toll-code{border-top:1px solid var(--toll-rule,rgba(127,127,127,.4));padding-top:12px}'
      + '.toll-code-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}'
      + '.toll-code-tabs{display:flex;flex-wrap:wrap;gap:4px;border-bottom:1px solid var(--toll-rule,rgba(127,127,127,.4))}'
      + '.toll-code-tab{font:inherit;font-size:.9rem;background:none;border:0;border-bottom:2px solid transparent;color:inherit;padding:8px 12px;cursor:pointer;margin-bottom:-1px;min-height:40px}'
      + '.toll-code-tab[aria-selected="true"]{border-bottom-color:var(--toll-accent,#1c6a51);font-weight:600}'
      + '.toll-code-copy{font:inherit;font-size:.9rem;background:var(--toll-accent,#1c6a51);color:var(--toll-accent-ink,#fff);border:0;border-radius:4px;padding:6px 14px;min-height:34px;cursor:pointer}'
      + '.toll-code-note{font-size:.875rem;color:var(--toll-muted,inherit);opacity:.9;margin:10px 0 6px}'
      + '.toll-code-pre{font-family:var(--toll-font-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);font-size:.85rem;line-height:1.5;background:var(--toll-code-bg,rgba(127,127,127,.12));padding:12px 14px;border-radius:4px;overflow-x:auto;margin:0;white-space:pre}'
      + '.toll-code-foot{font-size:.875rem;margin:10px 0 0}'
      + '.toll-code-status{color:var(--toll-muted,inherit)}';
    document.head.appendChild(h('style', { id: 'toll-components' }, css));
  }

  window.Toll = {
    base: base,
    signInHref: signInHref,
    takeRunFlag: takeRunFlag,
    brand: brand,
    tool: tool,
    currency: currency,
    locale: locale,
    money: money,
    prices: prices,
    api: api,
    me: me,
    mountAccountChip: mountAccountChip,
    mountCodePanel: mountCodePanel,
    run: run,
    track: track,
    copy: copy,
    toast: toast,
    h: h,
  };

  function boot() {
    // The shared header is one partial, so the current page is marked here.
    [].forEach.call(document.querySelectorAll('.head-nav a[href]'), function (a) {
      if (a.pathname === location.pathname && !a.hash) a.setAttribute('aria-current', 'page');
    });
    // The small-screen menu closes when one of its links is followed (most go to the same page).
    [].forEach.call(document.querySelectorAll('.menu-panel a'), function (a) {
      a.addEventListener('click', function () {
        var menu = a.closest('details');
        if (menu) menu.removeAttribute('open');
      });
    });
    [].forEach.call(document.querySelectorAll('[data-toll-chip]'), mountAccountChip);
    [].forEach.call(document.querySelectorAll('[data-toll-code]'), function (el) {
      mountCodePanel(el, el.getAttribute('data-toll-code') || tool);
    });
    micro();
    track('page_view');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
