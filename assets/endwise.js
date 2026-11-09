/* Shared browser helpers for every page: brand pages and tool pages alike.
   The server injects window.ENDWISE = { base, brand, tool } into each page; every URL here is
   built from ENDWISE.base, so the site works under any base path. When the page's prices are not in
   US dollars it also carries { currency, locale } and, on a tool page, { prices }: the tool's
   dollar prices as text, each with the same price in that currency.

   window.Endwise = {
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
   Elements with data-endwise-chip get an account chip; elements with data-endwise-code get a code
   panel for the slug in the attribute (or this page's tool). */
(function () {
  'use strict';

  var cfg = window.ENDWISE || {};
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
      el.appendChild(h('a', { class: 'endwise-chip-link', href: signInHref() }, 'Sign in'));
      return;
    }
    el.appendChild(h('a', { class: 'endwise-chip-balance', href: base + '/account', title: 'Your balance. Open your account.' }, [
      h('span', { class: 'endwise-visually-hidden' }, 'Balance '),
      account.balance.display,
    ]));
    el.appendChild(h('a', { class: 'endwise-chip-topup', href: base + '/account#top-up' }, 'Top up'));
  }

  function renderChips() {
    if (!mePromise) return;
    mePromise.then(function (account) {
      // Lets the chrome swap "Get started" for the balance once someone is signed in.
      document.documentElement.classList.toggle('endwise-signed-in', !!account);
      chips.forEach(function (el) { renderChip(el, account); });
    }, function () {
      chips.forEach(function (el) { renderChip(el, null); });
    });
  }

  function mountAccountChip(el) {
    if (!el || chips.indexOf(el) !== -1) return;
    injectStyles();
    el.classList.add('endwise-chip');
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
    var id = 'endwise-code-' + (++panelCount);
    var list = snippets(info);
    var tabs = h('div', { class: 'endwise-code-tabs', role: 'tablist', 'aria-label': 'Use this from code' });
    var note = h('p', { class: 'endwise-code-note' });
    var pre = h('pre', { class: 'endwise-code-pre', id: id + '-panel', role: 'tabpanel', tabindex: '0' });
    var status = h('span', { class: 'endwise-code-status', role: 'status' });
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
        type: 'button', role: 'tab', id: id + '-tab-' + i, 'aria-controls': id + '-panel', class: 'endwise-code-tab',
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
    el.appendChild(h('div', { class: 'endwise-code' }, [
      h('div', { class: 'endwise-code-head' }, [
        h('strong', { class: 'endwise-code-title' }, 'Use this from code'),
        h('button', { type: 'button', class: 'endwise-code-copy', onclick: function () { copy(list[current].code, pre, status); } }, 'Copy'),
      ]),
      tabs,
      note,
      pre,
      h('p', { class: 'endwise-code-foot' }, [
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
      if (el.textContent.indexOf(e.message) === -1 || el.querySelector('.endwise-fix')) return;
      el.appendChild(document.createTextNode(' '));
      el.appendChild(h('a', { class: 'endwise-fix', href: href }, text));
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
  // Tables below the fold bring their first rows in one by one, once. Rows are never left invisible:
  // only the first ANIMATED rows move, and a table already on screen when the page loads, any table
  // after a jump to a #link, and every table while the tab is hidden show at once.
  var ANIMATED = 12;
  var rowObserver = null;
  var rowTables = [];
  function showRows(t) {
    if (t.classList.contains('tl-shown')) return;
    t.classList.add('tl-shown');
    if (rowObserver) rowObserver.unobserve(t);
  }
  // A table inside a reveal block (.rv, motion.js) waits for the block's "in". The block's own
  // observer needs 8% of it on screen, which a tall table never reaches, so the table says when.
  var rvTables = [], rvObserver = null;
  function rvIn(t, now) {
    var rv = t.closest('.rv');
    if (rv && now === true && !rv.classList.contains('in')) rv.classList.add('tl-now');
    if (rv) rv.classList.add('in');
    if (rvObserver) rvObserver.unobserve(t);
  }
  function watchRv(t) {
    if (!t.closest('.rv')) return;
    rvTables.push(t);
    if (!('IntersectionObserver' in window) || inView(t) || document.hidden) { rvIn(t, true); return; }
    if (!rvObserver) {
      rvObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) rvIn(e.target); });
      });
    }
    rvObserver.observe(t);
  }
  function showAllRows(now) {
    rowTables.forEach(function (t) {
      if (now) t.classList.add('tl-now');
      showRows(t);
    });
    rvTables.forEach(function (t) { rvIn(t, now); });
  }
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
  }
  function rows(scope, onLoad) {
    if (reduced || !('IntersectionObserver' in window)) return;
    // A page opened at a #link, or in a background tab: nothing waits to fade in.
    if (onLoad && (document.hidden || (location.hash && location.hash.length > 1))) return;
    if (!rowObserver) {
      rowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) showRows(e.target); });
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    [].forEach.call((scope || document).querySelectorAll('main table'), function (t) {
      if (t.tlRows || !t.tBodies[0] || t.tBodies[0].rows.length < 3) return;
      t.tlRows = true;
      if (t.closest('.rv')) return; // its block brings its rows in (motion.css)
      if (onLoad && inView(t)) return; // already on screen: it simply shows
      [].forEach.call(t.tBodies[0].rows, function (r, i) { if (i < ANIMATED) r.style.setProperty('--i', i); });
      t.classList.add('tl-rows');
      rowTables.push(t);
      rowObserver.observe(t);
    });
  }

  // ---------- tables: long ones fold, narrow ones stack on phones, wide ones say they scroll ----------
  // Done here once for every page (content, tool and brand pages). Every row stays in the HTML and,
  // without JavaScript, every row shows. A long table shows its first SHOWN rows inside its frame,
  // which clips the rest (overflow hidden, not display none), so the browser's find, a #link to a
  // row and Tab still reach every row: when one of them scrolls the frame to a clipped row, the
  // table opens in full, with that row kept where the browser put it.
  var LONG = 15, SHOWN = 12, STACK_COLS = 4;
  var STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
    'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
    'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
  var stateNames = {};
  STATES.forEach(function (s) { stateNames[s.toLowerCase()] = s; });
  function stateOf(text) {
    var name = String(text).replace(/[([*†].*$/, '').replace(/[^A-Za-z ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    return stateNames[name] || null;
  }
  var longTables = [];
  var tableSeq = 0;
  function bodyRows(t) { return t.tBodies[0] ? [].slice.call(t.tBodies[0].rows) : []; }
  function headLabels(t) {
    var head = t.tHead && t.tHead.rows[0];
    return head ? [].map.call(head.cells, function (c) { return c.textContent.replace(/\s+/g, ' ').trim(); }) : [];
  }
  function spans(t) { return !!t.querySelector('tbody [rowspan]:not([rowspan="1"]), tbody [colspan]:not([colspan="1"])'); }
  function editable(t) { return !!t.querySelector('input, select, textarea, button'); }
  // The element that scrolls the table sideways, or a new one around it.
  function frameOf(t) {
    var p = t.parentElement;
    if (p && p.tagName === 'DIV' && (p.children.length === 1 || /\b(table-scroll|tbl)\b/.test(p.className))) {
      var cs = getComputedStyle(p);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return p;
    }
    var f = h('div', { class: 'tl-frame-own' });
    t.parentNode.insertBefore(f, t);
    f.appendChild(t);
    return f;
  }
  // Momentum scrolling (motion.js) caches the page's height; a table that just opened changed it.
  function lenis() {
    var l = window.__lenis;
    if (l && l.resize) l.resize();
    return l;
  }
  function jumpBy(dy) {
    if (!dy) return;
    if (lenis()) window.__lenis.scrollTo(window.pageYOffset + dy, { immediate: true, force: true });
    else window.scrollBy(0, dy);
  }
  function jumpTo(el, instant) {
    var now = instant || reduced;
    var y = window.pageYOffset + el.getBoundingClientRect().top - Math.round((window.innerHeight || 800) / 3);
    if (lenis()) window.__lenis.scrollTo(y, { immediate: now, duration: now ? 0 : 0.8, force: true });
    else window.scrollTo({ top: y, behavior: now ? 'auto' : 'smooth' });
  }

  // Narrow tables (STACK_COLS columns or fewer) become one card per row under 640px; each cell
  // names its column. Tables with their own phone layout (.tbl, the docs) keep it.
  function stack(t) {
    if (!(t.classList.contains('cp-table') || t.className === 'rules' || t.className === 'rules tl-rows')) return;
    if (t.closest('.tbl, .docs-body') || spans(t) || editable(t)) return;
    var labels = headLabels(t);
    if (labels.length < 2 || labels.length > STACK_COLS) { wrap(t); return; }
    bodyRows(t).forEach(function (r) {
      [].forEach.call(r.cells, function (c, i) { if (i > 0 && labels[i] && !c.hasAttribute('data-label')) c.setAttribute('data-label', labels[i]); });
    });
    t.tlStack = labels.length === 2 ? 'tl-stack2' : 'tl-stack3';
    restack(t);
  }
  // Cards only where the table would not fit: a table that fits its width stays a table.
  var phone = window.matchMedia ? window.matchMedia('(max-width: 640px)') : null;
  // A content table that runs past its frame lets its sentences wrap (figures stay on one line).
  function wrap(t) {
    var f = t.parentElement;
    if (t.classList.contains('cp-table') && f && f.scrollWidth > f.clientWidth + 2) t.classList.add('tl-wrap');
  }
  function restack(t) {
    wrap(t);
    if (!t.tlStack) return;
    t.classList.remove('tl-stack', t.tlStack);
    var f = t.parentElement;
    if (!phone || !phone.matches || !f || f.scrollWidth <= f.clientWidth + 2) return;
    t.classList.add('tl-stack', t.tlStack);
  }

  // The caption of a table that scrolls sideways goes above its frame, so it is never cut off.
  function liftCaption(t, frame) {
    var cap = t.caption;
    if (!cap || cap.classList.contains('visually-hidden') || !cap.textContent.trim()) return;
    var p = h('p', { class: 'tl-cap', 'aria-hidden': 'true' }, cap.textContent.trim());
    frame.parentNode.insertBefore(p, frame);
    cap.classList.add('visually-hidden');
  }

  // A wide table names the columns past the edge and fades its right side until scrolled to the end.
  function cueOf(st) {
    if (!st.cue) {
      st.cue = h('p', { class: 'tl-cue', 'aria-hidden': 'true', hidden: true }, 'Scroll sideways for more columns');
      st.frame.parentNode.insertBefore(st.cue, st.frame);
      st.frame.addEventListener('scroll', function () { edge(st); }, { passive: true });
    }
    return st.cue;
  }
  function edge(st) {
    var f = st.frame;
    var wide = f.scrollWidth > f.clientWidth + 2;
    if (wide || st.cue) cueOf(st).hidden = !wide;
    f.classList.toggle('tl-wide', wide);
    f.classList.toggle('tl-more', wide && f.scrollLeft + f.clientWidth < f.scrollWidth - 2);
    // The frame scrolled down to a clipped row (find in page, a #link, Tab): open the table there.
    if (st.clipped && f.scrollTop > 0) {
      var dy = f.scrollTop;
      setOpen(st, true);
      jumpBy(dy);
    }
  }

  // ----- long tables -----
  function clip(st) {
    if (!st.clipped) return;
    var f = st.frame, next = st.rows[SHOWN];
    if (!next || !f.offsetParent && getComputedStyle(f).position !== 'fixed') return; // not on screen yet (a closed fold or tab)
    var top = f.getBoundingClientRect().top;
    // The row after the last shown one peeks in under the fade.
    var hgt = Math.ceil(next.getBoundingClientRect().top - top + Math.min(36, next.offsetHeight * 0.6));
    if (hgt > 40 && st.height !== hgt) { st.height = hgt; f.style.maxHeight = hgt + 'px'; }
  }
  function setClipped(st, on) {
    st.clipped = on;
    st.frame.classList.toggle('tl-clipped', on);
    if (!on) { st.frame.style.maxHeight = ''; st.height = 0; st.frame.scrollTop = 0; }
    else clip(st);
  }
  function label(st) {
    var n = st.rows.length;
    st.all.textContent = st.open ? 'Show the first ' + SHOWN + ' rows' : 'Show all ' + n.toLocaleString(locale) + ' rows';
    st.all.setAttribute('aria-expanded', st.open ? 'true' : 'false');
    st.all.hidden = !!st.query;
  }
  function setOpen(st, on) {
    st.open = on;
    setClipped(st, !on && !st.query);
    label(st);
  }
  function filter(st, q) {
    q = q.replace(/\s+/g, ' ').trim().toLowerCase();
    st.query = q;
    var hits = 0;
    st.rows.forEach(function (r) {
      var miss = q && (r.tlText || (r.tlText = r.textContent.replace(/\s+/g, ' ').toLowerCase())).indexOf(q) === -1;
      r.classList.toggle('tl-miss', !!miss);
      if (!miss) hits++;
    });
    setClipped(st, !q && !st.open);
    label(st);
    st.count.textContent = !q ? '' : hits === 0 ? 'No rows match.' : hits === 1 ? '1 row matches.' : hits.toLocaleString(locale) + ' rows match.';
    edge(st);
  }
  function hit(st, row) {
    if (st.lit) st.lit.classList.remove('tl-hit');
    st.lit = row;
    row.classList.add('tl-hit');
  }
  // Show one row: clear a filter that hides it, open the table, light the row and bring it on screen.
  function showRow(row, scroll, instant) {
    var st = row.tlLong;
    if (!st) return false;
    if (st.query && row.classList.contains('tl-miss')) { st.find.value = ''; filter(st, ''); }
    if (st.clipped && st.rows.indexOf(row) >= SHOWN) setOpen(st, true);
    hit(st, row);
    showAllRows(true);
    if (scroll) jumpTo(row, instant);
    return true;
  }
  function foldLong(t, frame, st) {
    var list = st.rows;
    var n = list.length;
    var id = t.id || ('tl-t' + (++tableSeq));
    t.id = id;
    var noun = n.toLocaleString(locale);
    var tools = h('div', { class: 'tl-tools' });
    // A filter, unless merged cells would lose their values when rows hide.
    if (!spans(t)) {
      st.find = h('input', { type: 'search', class: 'tl-find', placeholder: 'Filter ' + noun + ' rows', 'aria-controls': id, autocomplete: 'off', spellcheck: 'false' });
      tools.appendChild(h('label', { class: 'tl-field' }, [h('span', { class: 'visually-hidden' }, 'Filter the rows of this table'), st.find]));
      var wait = 0;
      st.find.addEventListener('input', function () {
        clearTimeout(wait);
        wait = setTimeout(function () { filter(st, st.find.value); }, n > 400 ? 120 : 0);
      });
    }
    // A table of states gets a picker that jumps to the state's row.
    var states = list.map(function (r) { return r.cells[0] ? stateOf(r.cells[0].textContent) : null; });
    var named = states.filter(Boolean).length;
    if (t.getAttribute('data-pick') === 'state' || named >= 0.8 * n) {
      var pick = h('select', { class: 'tl-pick', 'aria-controls': id }, h('option', { value: '' }, 'Pick a state'));
      list.forEach(function (r, i) {
        if (!states[i]) return;
        if (!r.id) {
          var want = 'state-' + states[i].toLowerCase().replace(/ /g, '-'), rid = want;
          for (var k = 2; document.getElementById(rid); k++) rid = want + '-' + k;
          r.id = rid;
        }
        pick.appendChild(h('option', { value: r.id }, r.cells[0].textContent.replace(/\s+/g, ' ').trim()));
      });
      pick.addEventListener('change', function () {
        var row = pick.value && document.getElementById(pick.value);
        if (!row) return;
        showRow(row, true);
        try { history.replaceState(history.state, '', '#' + row.id); } catch (e) { /* the jump still happens */ }
      });
      tools.appendChild(h('label', { class: 'tl-field tl-field-pick' }, [h('span', { class: 'visually-hidden' }, 'Jump to a state'), pick]));
    }
    st.count = h('p', { class: 'tl-count', role: 'status', 'aria-live': 'polite' });
    tools.appendChild(st.count);
    frame.parentNode.insertBefore(tools, frame);
    st.all = h('button', { type: 'button', class: 'btn btn-quiet btn-small tl-all', 'aria-controls': id });
    var foot = h('div', { class: 'tl-foot' }, st.all);
    frame.parentNode.insertBefore(foot, frame.nextSibling);
    st.all.addEventListener('click', function () {
      var closing = st.open;
      setOpen(st, !st.open);
      // Folding a long table back: keep its top in view rather than leave the reader far below it.
      if (closing && frame.getBoundingClientRect().top < 0) jumpTo(frame);
    });
    list.forEach(function (r) { r.tlLong = st; });
    longTables.push(st);
    setOpen(st, false);
  }

  function tables(scope) {
    [].forEach.call((scope || document).querySelectorAll('main table'), function (t) {
      if (t.tlTable || !t.tBodies[0] || t.closest('[id$="-out"], [id$="-board"]')) return;
      t.tlTable = true;
      if (editable(t)) return;
      var frame = frameOf(t);
      stack(t);
      var st = { table: t, frame: frame, rows: bodyRows(t), open: false, clipped: false, query: '' };
      frame.classList.add('tl-frame');
      liftCaption(t, frame);
      if (st.rows.length > LONG) foldLong(t, frame, st);
      t.tlState = st;
      watchRv(t);
      edge(st);
      if (window.ResizeObserver) {
        var lastW = 0;
        new ResizeObserver(function () {
          var w = st.frame.clientWidth;
          if (w !== lastW) { lastW = w; if (t.tlStack) restack(t); else wrap(t); }
          clip(st); edge(st);
        }).observe(t);
      }
    });
  }
  function remeasure() { longTables.forEach(clip); }
  // A #link to a row (on arrival or later) opens its table at that row.
  function toHash(scroll) {
    var id = location.hash.length > 1 ? decodeURIComponent(location.hash.slice(1)) : '';
    var el = id && document.getElementById(id);
    var row = el && el.closest && el.closest('tr');
    if (row && row.tlLong) showRow(row, scroll, true);
  }
  function tablesBoot() {
    tables(document);
    document.addEventListener('visibilitychange', function () { if (document.hidden) showAllRows(true); });
    window.addEventListener('hashchange', function () { showAllRows(true); });
    window.addEventListener('beforeprint', function () { showAllRows(true); });
    if (document.hidden || location.hash.length > 1) showAllRows(true);
    window.addEventListener('hashchange', function () { toHash(true); });
    window.addEventListener('load', function () { remeasure(); toHash(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure, function () {});
    document.addEventListener('toggle', remeasure, true);
    // An in-page link to a clipped row: open the table before the page scrolls to it.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.hash.length < 2) return;
      var el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      var row = el && el.closest && el.closest('tr');
      showAllRows(true);
      if (row && row.tlLong) showRow(row, false);
    }, true);
    // Text selected inside a clipped row (the browser's find selects its match when closed, and
    // window.find does at once): open the table there.
    document.addEventListener('selectionchange', function () {
      if (!longTables.length) return;
      var sel = window.getSelection && window.getSelection();
      var node = sel && sel.rangeCount ? sel.anchorNode : null;
      var el = node && (node.nodeType === 1 ? node : node.parentElement);
      var row = el && el.closest && el.closest('tr');
      var st = row && row.tlLong;
      if (!st || !st.clipped || st.rows.indexOf(row) < SHOWN) return;
      var before = row.getBoundingClientRect().top;
      setOpen(st, true);
      // A match the browser had already scrolled to stays where it was; one below the clip comes up.
      var after = row.getBoundingClientRect().top;
      if (before >= 0 && before < (window.innerHeight || 800)) jumpBy(after - before);
      else jumpTo(row, true);
    });
    window.addEventListener('beforeprint', function () { longTables.forEach(function (st) { setClipped(st, false); }); });
    window.addEventListener('afterprint', function () { longTables.forEach(function (st) { setClipped(st, !st.open && !st.query); }); });
    toHash(true);
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
    rows(document, true);
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

  // ---------- component styles (scoped; tool pages can theme them with --endwise-* variables) ----------
  var styled = false;
  function injectStyles() {
    if (styled) return;
    styled = true;
    var css = ''
      + '.endwise-chip{display:inline-flex;align-items:center;gap:12px;font-variant-numeric:tabular-nums}'
      + '.endwise-chip a{color:inherit;text-decoration:none;font-weight:500}'
      + '.endwise-chip a:hover{text-decoration:underline}'
      + '.endwise-chip .endwise-chip-balance{font-feature-settings:"tnum" 1}'
      + '.endwise-chip .endwise-chip-topup,.endwise-chip .endwise-chip-link{padding:6px 12px;border:1px solid currentColor;border-radius:4px;min-height:34px;display:inline-flex;align-items:center}'
      + '.endwise-visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
      + '.endwise-code{border-top:1px solid var(--endwise-rule,rgba(127,127,127,.4));padding-top:12px}'
      + '.endwise-code-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}'
      + '.endwise-code-tabs{display:flex;flex-wrap:wrap;gap:4px;border-bottom:1px solid var(--endwise-rule,rgba(127,127,127,.4))}'
      + '.endwise-code-tab{font:inherit;font-size:.9rem;background:none;border:0;border-bottom:2px solid transparent;color:inherit;padding:8px 12px;cursor:pointer;margin-bottom:-1px;min-height:40px}'
      + '.endwise-code-tab[aria-selected="true"]{border-bottom-color:var(--endwise-accent,#1c6a51);font-weight:600}'
      + '.endwise-code-copy{font:inherit;font-size:.9rem;background:var(--endwise-accent,#1c6a51);color:var(--endwise-accent-ink,#fff);border:0;border-radius:4px;padding:6px 14px;min-height:34px;cursor:pointer}'
      + '.endwise-code-note{font-size:.875rem;color:var(--endwise-muted,inherit);opacity:.9;margin:10px 0 6px}'
      + '.endwise-code-pre{font-family:var(--endwise-font-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);font-size:.85rem;line-height:1.5;background:var(--endwise-code-bg,rgba(127,127,127,.12));padding:12px 14px;border-radius:4px;overflow-x:auto;margin:0;white-space:pre}'
      + '.endwise-code-foot{font-size:.875rem;margin:10px 0 0}'
      + '.endwise-code-status{color:var(--endwise-muted,inherit)}';
    document.head.appendChild(h('style', { id: 'endwise-components' }, css));
  }

  window.Endwise = {
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
    [].forEach.call(document.querySelectorAll('[data-endwise-chip]'), mountAccountChip);
    [].forEach.call(document.querySelectorAll('[data-endwise-code]'), function (el) {
      mountCodePanel(el, el.getAttribute('data-endwise-code') || tool);
    });
    tablesBoot();
    micro();
    track('page_view');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
