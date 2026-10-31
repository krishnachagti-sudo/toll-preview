/* The account page: sign up and sign in, balance, top-ups, limits, API keys and the ledger.
   Every request goes through Toll.api, so every URL is built from TOLL.base. */
(function () {
  'use strict';

  var h = Toll.h;
  var $ = function (id) { return document.getElementById(id); };

  var MICROS = 1000000;
  var TOPUPS = {
    USD: [[20, '$20'], [50, '$50'], [100, '$100'], [500, '$500']],
    INR: [[200, '₹200'], [500, '₹500'], [1000, '₹1,000'], [5000, '₹5,000']],
  };
  var SYMBOL = { USD: '$', INR: '₹' };
  var KIND = {
    topup: 'Top-up',
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

  // ---------- views ----------
  function show(view) {
    $('loading').hidden = true;
    $('signed-out').hidden = view !== 'out';
    $('signed-in').hidden = view !== 'in';
    if (view !== 'in') forgetSignedIn();
  }

  // Wipes everything the last account left on the page, above all a freshly shown API key,
  // so the next person to sign in on this tab sees none of it.
  function forgetSignedIn() {
    $('new-key-value').textContent = '';
    $('new-key-name').textContent = '';
    $('new-key').hidden = true;
    ['key-list', 'ledger', 'topup-amounts', 'who-email', 'balance-total', 'balance-grant', 'balance-paid',
      'cap-current', 'cap-spent', 'key-error', 'cap-error', 'cap-status', 'topup-error', 'new-key-status'].forEach(function (id) {
      $(id).textContent = '';
    });
    // Without the marker, the next account rebuilds its choices even in the same currency.
    $('topup-amounts').removeAttribute('data-currency');
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
        if (location.hash === '#top-up' || location.hash === '#keys' || location.hash === '#limits') {
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
    [].forEach.call(document.querySelectorAll('.cur-symbol'), function (s) { s.textContent = SYMBOL[account.currency]; });

    var amounts = $('topup-amounts');
    if (amounts.getAttribute('data-currency') !== account.currency) {
      amounts.textContent = '';
      amounts.setAttribute('data-currency', account.currency);
      TOPUPS[account.currency].forEach(function (pair, i) {
        amounts.appendChild(h('label', { class: 'choice' }, [
          h('input', { type: 'radio', name: 'amount', value: String(pair[0]), checked: i === 0 }),
          h('span', null, pair[1]),
        ]));
      });
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
    var currency = form.querySelector('input[name="currency"]:checked');
    busy(button, true);
    Toll.api('/api/account/signup', { body: {
      email: $('signup-email').value,
      password: $('signup-password').value,
      currency: currency ? currency.value : 'USD',
    } }).then(function () {
      form.reset();
      return load();
    }, function (err) {
      showError($('signup-error'), err, form);
    }).then(function () { busy(button, false); });
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
    var picked = ev.currentTarget.querySelector('input[name="amount"]:checked');
    var button = ev.currentTarget.querySelector('button[type="submit"]');
    $('topup-error').textContent = '';
    if (!picked) { $('topup-error').textContent = 'Pick an amount.'; return; }
    busy(button, true);
    Toll.api('/api/topup', { body: { amountMicros: Number(picked.value) * MICROS } }).then(function (json) {
      window.location.assign(json.url);
    }, function (err) {
      $('topup-error').textContent = err.message;
      busy(button, false);
    });
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
          h('div', { class: 'money-input' }, [h('span', { 'aria-hidden': 'true' }, SYMBOL[account.currency]), input]),
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
