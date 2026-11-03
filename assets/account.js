/* The account page: sign up and sign in, balance, top-ups, the nonprofit and invoice requests,
   limits, API keys and the ledger.
   Every request goes through Toll.api, so every URL is built from TOLL.base. */
(function () {
  'use strict';

  var h = Toll.h;
  var $ = function (id) { return document.getElementById(id); };

  var MICROS = 1000000;
  // The sign before a typed amount, in the account's currency: "$" for a dollar account, the
  // currency's own sign for another (its code where the browser has none).
  function symbolOf(currency) {
    if (currency === 'USD') return '$';
    try {
      var part = new Intl.NumberFormat('en', { style: 'currency', currency: currency }).formatToParts(0).filter(function (p) { return p.type === 'currency'; })[0];
      if (part && part.value !== currency) return part.value;
    } catch (e) { /* the code below */ }
    return currency + ' ';
  }
  var KIND = {
    topup: 'Top-up',
    invoice: 'Paid by invoice or check',
    bonus: 'Bonus credit',
    pass: 'Pass allowance for the month',
    pass_expiry: 'Unused pass allowance lapsed',
    grant: 'Monthly free allowance',
    grant_expiry: 'Unused allowance expired',
    charge: 'Call',
    refund: 'Refund',
    adjust: 'Adjustment',
  };

  var account = null;
  var toolNames = {};

  // "12.5" or "1,000" to integer micro-units; whole units or up to two decimals. null when it is not an amount.
  // Whole units are capped at 13 digits, so the arithmetic stays far inside safe integers.
  function toMicros(text) {
    var m = /^(\d{1,13})(?:\.(\d{1,2}))?$/.exec(String(text).trim().replace(/,/g, ''));
    if (!m) return null;
    var cents = Number((m[2] || '').concat('00').slice(0, 2));
    return Number(m[1]) * MICROS + cents * 10000;
  }

  // A typed limit as { micros } or { error } in plain words, within the server's range.
  function readLimit(text, example) {
    var micros = toMicros(text);
    if (micros === null) return { error: 'Enter an amount like ' + example + '.' };
    if (micros > account.limits.maxCapMicros) return { error: 'Enter an amount up to ' + account.limits.maxCapDisplay + '.' };
    return { micros: micros };
  }

  // Integer micro-units to an editable amount ("12.5" stays "12.50").
  function toAmount(micros) {
    var whole = Math.floor(micros / MICROS);
    var frac = micros % MICROS;
    if (frac === 0) return String(whole);
    var digits = String(frac).padStart(6, '0').replace(/0+$/, '');
    if (digits.length < 2) digits += '0';
    return whole + '.' + digits;
  }

  function when(iso) {
    if (!iso) return 'never';
    var d = new Date(iso);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function clearErrors(form) {
    [].forEach.call(form.querySelectorAll('.field-error'), function (p) { p.textContent = ''; });
  }

  function showError(el, err, form) {
    el.textContent = err.message;
    if (form && err.fields) {
      Object.keys(err.fields).forEach(function (k) {
        var p = form.querySelector('[data-error-for="' + k + '"]');
        if (p) p.textContent = err.fields[k];
      });
    }
  }

  function busy(button, on) { if (button) button.disabled = on; }

  // ---------- where to go after signing in ----------
  // A tool sends people here with ?next=<its page>. Only a path on this site, under the base path,
  // and not this page, is followed.
  function nextPath() {
    var n = new URLSearchParams(location.search).get('next');
    var base = Toll.base || '';
    if (!n || n.charAt(0) !== '/' || n.charAt(1) === '/' || n.indexOf('\\') >= 0) return null;
    if (n.indexOf(base + '/') !== 0 || n.indexOf(base + '/account') === 0) return null;
    return n;
  }
  var justSignedUp = false;

  // ---------- views ----------
  function show(view) {
    $('loading').hidden = true;
    $('signed-out').hidden = view !== 'out';
    $('signed-in').hidden = view !== 'in';
    $('next-note').hidden = !(view === 'out' && nextPath());
    $('back-note').hidden = !(view === 'in' && nextPath());
    if (nextPath()) $('back-link').href = nextPath();
    if (view !== 'in') forgetSignedIn();
  }

  // Wipes everything the last account left on the page, above all a freshly shown API key,
  // so the next person to sign in on this tab sees none of it.
  function forgetSignedIn() {
    $('new-key-value').textContent = '';
    $('new-key-name').textContent = '';
    $('new-key').hidden = true;
    $('welcome').hidden = true;
    ['key-list', 'ledger', 'buy-passes', 'buy-packs', 'buy-bundles', 'who-email', 'balance-total', 'balance-grant', 'balance-paid', 'balance-pass', 'pass-note',
      'balance-bundle', 'cap-current', 'cap-spent', 'key-error', 'cap-error', 'cap-status', 'topup-error', 'new-key-status',
      'nonprofit-error', 'nonprofit-status', 'invoice-error', 'invoice-status', 'invoice-list'].forEach(function (id) {
      $(id).textContent = '';
    });
    ['np-code', 'np-org', 'np-ein', 'np-email', 'inv-want', 'inv-company', 'inv-email', 'inv-po'].forEach(function (id) { $(id).value = ''; });
    $('bundle-row').hidden = true;
    // Without the marker, the next account rebuilds its choices even in the same currency.
    $('buy-packs').removeAttribute('data-currency');
    $('pass-row').hidden = true;
    $('cap-amount').value = '';
    $('key-name').value = '';
    $('key-cap').value = '';
    account = null;
  }

  function load() {
    return Toll.me(true).then(function (a) {
      account = a;
      if (!a) { show('out'); return; }
      show('in');
      renderAccount();
      return Promise.all([loadKeys(), loadLedger()]).then(function () {
        if (['#top-up', '#keys', '#limits', '#nonprofit', '#invoice'].indexOf(location.hash) >= 0) {
          var target = $(location.hash.slice(1));
          if (target) target.scrollIntoView();
        }
      });
    }, function (err) {
      $('loading').hidden = true;
      $('load-error').hidden = false;
      $('load-error').textContent = err.message;
    });
  }

  function renderAccount() {
    var b = account.balance;
    $('who-email').textContent = 'Signed in as ' + account.email + '. Balance in ' + account.currency + '.';
    $('balance-total').textContent = b.display;
    $('balance-grant').textContent = b.grantDisplay;
    $('balance-paid').textContent = b.paidDisplay;
    $('welcome-grant').textContent = b.grantDisplay;
    $('welcome').hidden = !justSignedUp;
    [].forEach.call(document.querySelectorAll('.cur-symbol'), function (s) { s.textContent = symbolOf(account.currency); });

    // A pass the account holds: what is left of this month's allowance, and when the pass ends.
    var pass = account.passes[0];
    $('pass-row').hidden = !pass;
    if (pass) {
      $('pass-name').textContent = pass.name;
      $('balance-pass').textContent = b.passDisplay;
      $('pass-note').textContent = 'Left of this month\'s ' + pass.allowanceDisplay + ' for using the tools on the web. Spent before your balance. Ends ' + new Date(pass.endsAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + '.';
    }

    // Prepaid worksheets left from fleet bundles.
    var left = (account.bundles || []).reduce(function (n, b) { return n + b.left; }, 0);
    $('bundle-row').hidden = !(account.bundles && account.bundles.length);
    $('balance-bundle').textContent = left + (left === 1 ? ' worksheet' : ' worksheets');

    if (account.nonprofit) {
      $('np-percent').textContent = account.nonprofit.percentOff + '%';
      $('np-days').textContent = String(account.nonprofit.codeDays);
    }
    if (account.invoiceMinDisplay) $('invoice-min').textContent = account.invoiceMinDisplay;
    if (!$('np-email').value) $('np-email').value = account.email;
    renderInvoices(account.invoices);

    // The passes, packs and bundles on offer, in the account's currency. ?buy=<id> (from the
    // pricing page) picks one and scrolls here.
    if ($('buy-packs').getAttribute('data-currency') !== account.currency) {
      $('buy-packs').setAttribute('data-currency', account.currency);
      var wanted = new URLSearchParams(window.location.search).get('buy');
      var picked = account.products.some(function (p) { return p.id === wanted; }) ? wanted : 'pass-year';
      ['buy-passes', 'buy-packs', 'buy-bundles'].forEach(function (id) { $(id).textContent = ''; });
      var BOX = { pass: 'buy-passes', pack: 'buy-packs', bundle: 'buy-bundles' };
      account.products.forEach(function (p) {
        var named = p.kind !== 'pack';
        $(BOX[p.kind]).appendChild(h('label', { class: 'choice choice-card' }, [
          h('input', { type: 'radio', name: 'product', value: p.id, checked: p.id === picked }),
          h('span', { class: 'cc-name' }, named ? p.name : p.display),
          h('span', { class: 'cc-price' }, named ? p.display : (p.note || 'No bonus')),
          named ? h('span', { class: 'cc-note' }, p.kind === 'pass' ? p.note + '. Nonprofit price ' + p.nonprofitDisplay : p.note) : null,
        ]));
      });
      if (wanted && picked === wanted) {
        try { $('top-up').scrollIntoView({ block: 'start' }); } catch (e) { /* older browsers */ }
      }
    }

    var cap = account.monthlyCapMicros;
    $('cap-current').textContent = cap === null ? 'none set' : account.monthlyCapDisplay + ' a month';
    $('cap-spent').textContent = account.spentThisMonthDisplay;
    $('cap-remove').hidden = cap === null;
    $('cap-amount').value = cap === null ? '' : toAmount(cap);
    $('key-cap-hint').textContent = 'Leave it blank to use the default of ' + account.limits.defaultKeyCapDisplay + ' a month.';
    $('key-cap').placeholder = account.limits.defaultKeyCapDisplay.replace(/^[^0-9]+/, '');
  }

  // ---------- sign up / sign in / out ----------
  $('signup-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    clearErrors(form);
    $('signup-error').textContent = '';
    busy(button, true);
    // The currency choice is on the form only when more than one is offered; without it the
    // server opens the account in the currency this page was shown in.
    var body = { email: $('signup-email').value, password: $('signup-password').value };
    var currency = form.querySelector('input[name="currency"]:checked');
    if (currency) body.currency = currency.value;
    Toll.api('/api/account/signup', { body: body }).then(function () {
      form.reset();
      if (nextPath()) { window.location.assign(nextPath()); return; }
      justSignedUp = true;
      return load();
    }, function (err) {
      showError($('signup-error'), err, form);
    }).then(function () { busy(button, false); });
  });

  // The line under the currency choice says what the picked currency means.
  [].forEach.call(document.querySelectorAll('#signup-form input[name="currency"]'), function (radio) {
    radio.addEventListener('change', function () {
      if (radio.checked && $('signup-currency-line')) $('signup-currency-line').textContent = radio.getAttribute('data-line');
    });
  });

  $('login-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    $('login-error').textContent = '';
    busy(button, true);
    Toll.api('/api/account/login', { body: { email: $('login-email').value, password: $('login-password').value } })
      .then(function () {
        form.reset();
        if (nextPath()) { window.location.assign(nextPath()); return; }
        return load();
      }, function (err) {
        $('login-error').textContent = err.message;
      }).then(function () { busy(button, false); });
  });

  $('logout').addEventListener('click', function () {
    forgetSignedIn();
    Toll.api('/api/account/logout', { body: {} }).then(load, function (err) {
      $('load-error').hidden = false;
      $('load-error').textContent = err.message;
    });
  });

  // ---------- top-up ----------
  $('topup-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var picked = ev.currentTarget.querySelector('input[name="product"]:checked');
    var button = ev.currentTarget.querySelector('button[type="submit"]');
    $('topup-error').textContent = '';
    var form = ev.currentTarget;
    clearErrors(form);
    if (!picked) { $('topup-error').textContent = 'Pick a pass, an amount of credit or a bundle.'; return; }
    var body = { product: picked.value };
    var code = $('np-code').value.trim();
    if (code) body.code = code;
    busy(button, true);
    Toll.api('/api/topup', { body: body }).then(function (json) {
      window.location.assign(json.url);
    }, function (err) {
      showError($('topup-error'), err, form);
      busy(button, false);
    });
  });

  // ---------- nonprofit price and invoices ----------
  $('nonprofit-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    clearErrors(form);
    $('nonprofit-error').textContent = '';
    $('nonprofit-status').textContent = '';
    busy(button, true);
    Toll.api('/api/requests/nonprofit', { body: { orgName: $('np-org').value, ein: $('np-ein').value, email: $('np-email').value } }).then(function () {
      $('np-org').value = '';
      $('np-ein').value = '';
      $('nonprofit-status').textContent = 'Received. A person checks it by hand and emails you at the contact address.';
    }, function (err) {
      showError($('nonprofit-error'), err, form);
    }).then(function () { busy(button, false); });
  });

  var INVOICE_STATUS = { requested: 'Asked for', issued: 'Invoice sent', paid: 'Paid', cancelled: 'Cancelled' };

  function renderInvoices(list) {
    var box = $('invoice-list');
    box.textContent = '';
    if (!list || !list.length) return;
    box.appendChild(h('ul', { class: 'key-list' }, list.map(function (r) {
      return h('li', { class: 'key-item' }, [
        h('strong', null, r.company),
        ' ',
        h('span', { class: 'muted small' }, INVOICE_STATUS[r.status] + (r.amountDisplay ? ', ' + r.amountDisplay : '') + '. Asked ' + when(r.createdAt) + '.'),
      ]);
    })));
  }

  $('invoice-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    clearErrors(form);
    $('invoice-error').textContent = '';
    $('invoice-status').textContent = '';
    busy(button, true);
    Toll.api('/api/requests/invoice', { body: {
      want: $('inv-want').value, company: $('inv-company').value, billingEmail: $('inv-email').value, poNumber: $('inv-po').value,
    } }).then(function () {
      ['inv-want', 'inv-company', 'inv-email', 'inv-po'].forEach(function (id) { $(id).value = ''; });
      $('invoice-status').textContent = 'Received. We will email the invoice to your billing address.';
      return Toll.me(true).then(function (a) { account = a; renderAccount(); });
    }, function (err) {
      showError($('invoice-error'), err, form);
    }).then(function () { busy(button, false); });
  });

  // ---------- account limit ----------
  function saveCap(micros) {
    $('cap-error').textContent = '';
    $('cap-status').textContent = '';
    return Toll.api('/api/account/cap', { body: { monthlyCapMicros: micros } }).then(function () {
      return Toll.me(true).then(function (a) {
        account = a;
        renderAccount();
        $('cap-status').textContent = micros === null ? 'Limit removed.' : 'Limit saved.';
      });
    }, function (err) {
      $('cap-error').textContent = err.message;
    });
  }

  $('cap-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    $('cap-error').textContent = '';
    var limit = readLimit($('cap-amount').value, '25 or 25.50');
    if (limit.error) { $('cap-error').textContent = limit.error; return; }
    saveCap(limit.micros);
  });
  $('cap-remove').addEventListener('click', function () { saveCap(null); });

  // ---------- API keys ----------
  function loadKeys() {
    return Toll.api('/api/keys').then(function (json) { renderKeys(json.keys); }, function (err) {
      $('key-list').textContent = '';
      $('key-list').appendChild(h('p', { class: 'form-error' }, err.message));
    });
  }

  function keyRow(key) {
    var revoked = !!key.revokedAt;
    var status = h('span', { class: 'status', role: 'status' });
    var actions = h('div', { class: 'key-actions' });
    var editArea = h('div');

    if (!revoked) {
      var revoke = h('button', { type: 'button', class: 'link-btn' }, 'Revoke');
      var armed = false;
      revoke.addEventListener('click', function () {
        if (!armed) {
          armed = true;
          revoke.textContent = 'Click again to revoke for good';
          setTimeout(function () { armed = false; revoke.textContent = 'Revoke'; }, 5000);
          return;
        }
        revoke.disabled = true;
        Toll.api('/api/keys/' + key.id + '/revoke', { body: {} }).then(loadKeys, function (err) {
          status.textContent = err.message;
          revoke.disabled = false;
        });
      });

      var edit = h('button', { type: 'button', class: 'link-btn' }, 'Change limit');
      edit.addEventListener('click', function () {
        if (editArea.children.length) { editArea.textContent = ''; return; }
        var inputId = 'key-cap-' + key.id;
        var input = h('input', { id: inputId, type: 'text', inputmode: 'decimal', autocomplete: 'off', value: toAmount(key.monthlyCapMicros) });
        var save = h('button', { type: 'submit', class: 'btn btn-small' }, 'Save');
        var form = h('form', { class: 'cap-edit', novalidate: true }, [
          h('label', { for: inputId, class: 'visually-hidden' }, 'Monthly limit for ' + key.name),
          h('div', { class: 'money-input' }, [h('span', { 'aria-hidden': 'true' }, symbolOf(account.currency)), input]),
          save,
        ]);
        form.addEventListener('submit', function (ev) {
          ev.preventDefault();
          var limit = readLimit(input.value, '5 or 5.50');
          if (limit.error) { status.textContent = limit.error; return; }
          save.disabled = true;
          Toll.api('/api/keys/' + key.id + '/cap', { body: { monthlyCapMicros: limit.micros } }).then(loadKeys, function (err) {
            status.textContent = err.message;
            save.disabled = false;
          });
        });
        editArea.appendChild(form);
        input.focus();
      });
      actions.appendChild(edit);
      actions.appendChild(revoke);
    }

    return h('li', { class: 'key-item' + (revoked ? ' key-revoked' : '') }, [
      h('div', { class: 'key-top' }, [
        h('div', null, [
          h('strong', null, key.name),
          ' ',
          h('code', null, key.prefix + '…'),
        ]),
        actions,
      ]),
      h('p', { class: 'key-meta money' }, revoked
        ? ['Revoked ' + when(key.revokedAt) + '. It no longer works.']
        : [
          'Limit ', h('strong', null, key.monthlyCapDisplay), ' a month. ',
          'Spent ', h('strong', null, key.spentThisMonthDisplay), ' this month. ',
          'Last used ' + when(key.lastUsedAt) + '.',
        ]),
      editArea,
      status,
    ]);
  }

  function renderKeys(keys) {
    var list = $('key-list');
    list.textContent = '';
    if (!keys.length) {
      list.appendChild(h('p', { class: 'muted' }, 'You have no keys yet.'));
      return;
    }
    var active = keys.filter(function (k) { return !k.revokedAt; });
    var revoked = keys.filter(function (k) { return k.revokedAt; });
    list.appendChild(h('ul', { class: 'key-list' }, active.concat(revoked).map(keyRow)));
  }

  $('key-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var button = ev.currentTarget.querySelector('button[type="submit"]');
    $('key-error').textContent = '';
    var body = { name: $('key-name').value };
    var capText = $('key-cap').value.trim();
    if (capText) {
      var limit = readLimit(capText, '5 or 5.50, or leave it blank');
      if (limit.error) { $('key-error').textContent = limit.error; return; }
      body.monthlyCapMicros = limit.micros;
    }
    busy(button, true);
    Toll.api('/api/keys', { body: body }).then(function (json) {
      $('new-key-name').textContent = ' "' + body.name.trim() + '"';
      $('new-key-value').textContent = json.key;
      $('new-key-status').textContent = '';
      $('new-key').hidden = false;
      $('key-name').value = '';
      $('key-cap').value = '';
      $('new-key-copy').focus();
      return loadKeys();
    }, function (err) {
      $('key-error').textContent = err.message;
    }).then(function () { busy(button, false); });
  });

  $('new-key-copy').addEventListener('click', function () {
    Toll.copy($('new-key-value').textContent, $('new-key-value'), $('new-key-status'));
  });
  $('new-key-done').addEventListener('click', function () {
    $('new-key-value').textContent = '';
    $('new-key').hidden = true;
  });

  // ---------- ledger ----------
  function loadLedger() {
    return Promise.all([
      Toll.api('/api/account/ledger'),
      Toll.api('/api/v1/tools').catch(function () { return { tools: [] }; }),
    ]).then(function (r) {
      r[1].tools.forEach(function (t) { toolNames[t.slug] = t.name; });
      renderLedger(r[0].entries);
    }, function (err) {
      $('ledger').textContent = '';
      $('ledger').appendChild(h('p', { class: 'form-error' }, err.message));
    });
  }

  function describe(entry) {
    var label = KIND[entry.kind] || entry.kind;
    if (entry.toolSlug) {
      var name = toolNames[entry.toolSlug] || entry.toolSlug;
      label = (entry.kind === 'refund' ? 'Refund for ' : entry.kind === 'charge' ? 'Call to ' : label + ': ') + name;
    }
    return label;
  }

  function renderLedger(entries) {
    var box = $('ledger');
    box.textContent = '';
    if (!entries.length) {
      box.appendChild(h('p', { class: 'muted' }, 'Nothing here yet.'));
      return;
    }
    var rows = entries.map(function (e) {
      return h('tr', null, [
        h('td', { class: 'num when' }, when(e.createdAt)),
        h('td', null, [describe(e), h('br'), h('span', { class: 'muted small' }, e.pot === 'grant' ? 'Free allowance' : 'Paid balance')]),
        h('td', { class: 'r money' }, e.amount > 0 ? '+' + e.display : e.display),
      ]);
    });
    box.appendChild(h('div', { class: 'table-scroll' }, h('table', { class: 'rules' }, [
      h('thead', null, h('tr', null, [
        h('th', { scope: 'col', class: 'when' }, 'When'),
        h('th', { scope: 'col' }, 'What'),
        h('th', { scope: 'col', class: 'r' }, 'Amount'),
      ])),
      h('tbody', null, rows),
    ])));
  }

  load();
})();
