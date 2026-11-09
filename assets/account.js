/* The account page: sign up and sign in, balance, top-ups, the nonprofit and invoice requests,
   limits, API keys and the ledger; for an account's owner also the team plan, members and the
   usage report, and for a team member only what they need to use the tools (never billing).
   Every request goes through Endwise.api, so every URL is built from ENDWISE.base. */
(function () {
  'use strict';

  var h = Endwise.h;
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
  var team = null;
  var toolNames = {};
  var isMember = function () { return !!account && account.role === 'member'; };

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
    var base = Endwise.base || '';
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
    $('reset-view').hidden = view !== 'reset';
    $('join-view').hidden = view !== 'join';
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
    ['key-list', 'app-list', 'ledger', 'buy-passes', 'buy-packs', 'buy-bundles', 'who-email', 'balance-total', 'balance-grant', 'balance-paid', 'balance-pass', 'pass-note',
      'balance-bundle', 'cap-current', 'cap-spent', 'key-error', 'cap-error', 'cap-status', 'topup-error', 'new-key-status',
      'nonprofit-error', 'nonprofit-status', 'invoice-error', 'invoice-status', 'invoice-list', 'verify-email', 'verify-status',
      'member-team', 'member-spend', 'plan-current', 'plan-offers', 'plan-error', 'plan-renew-status', 'seats', 'invite-error', 'invite-status',
      'member-list', 'report-body'].forEach(function (id) {
      $(id).textContent = '';
    });
    ['np-code', 'np-org', 'np-ein', 'np-email', 'inv-want', 'inv-company', 'inv-email', 'inv-po', 'inv-plan', 'invite-email'].forEach(function (id) { $(id).value = ''; });
    $('member-note').hidden = true;
    $('members').hidden = true;
    team = null;
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
    return Endwise.me(true).then(function (a) {
      account = a;
      if (!a) { show('out'); return; }
      show('in');
      renderAccount();
      var loads = isMember() ? [loadKeys()] : [loadKeys(), loadLedger(), loadTeam(), loadReport()];
      return Promise.all(loads).then(function () {
        if (['#top-up', '#keys', '#limits', '#nonprofit', '#invoice', '#plan', '#members', '#report'].indexOf(location.hash) >= 0) {
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

  function longDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }

  // Owner-only sections stay hidden for a team member, who sees the team's balance as one total,
  // their own spend and limit, and their keys.
  function renderMember() {
    [].forEach.call(document.querySelectorAll('.owner-only'), function (el) { el.hidden = true; });
    $('pots').hidden = true;
    $('member-note').hidden = false;
    $('member-team').textContent = 'You are a member of ' + account.teamOwner + '\'s team. What you use is paid from the team\'s balance.'
      + (account.plan ? ' The team\'s ' + account.plan.name + ' plan runs to ' + longDate(account.plan.endsAt) + '.' : ' The team has no plan running, so you cannot spend from its balance until the owner renews it.');
    $('member-spend').textContent = 'You spent ' + account.spentThisMonthDisplay + ' this month'
      + (account.monthlyCapMicros === null ? '.' : ', of your monthly limit of ' + account.monthlyCapDisplay + '.') + ' Only the account owner can change limits.';
    $('key-cap').closest('.field').hidden = true;
    $('key-cap-hint').textContent = 'New keys get a monthly limit of ' + account.limits.defaultKeyCapDisplay + '. The account owner can change it.';
  }

  function renderAccount() {
    var b = account.balance;
    $('who-email').textContent = 'Signed in as ' + account.email + '. Balance in ' + account.currency + '.';
    $('verify-note').hidden = account.emailVerified || !account.emailsOn;
    $('verify-email').textContent = account.email;
    $('balance-total').textContent = b.display;
    [].forEach.call(document.querySelectorAll('.cur-symbol'), function (s) { s.textContent = symbolOf(account.currency); });
    if (isMember()) { renderMember(); return; }
    [].forEach.call(document.querySelectorAll('.owner-only'), function (el) { if (el.id !== 'members') el.hidden = false; });
    $('pots').hidden = false;
    $('key-cap').closest('.field').hidden = false;
    $('balance-grant').textContent = b.grantDisplay;
    $('balance-paid').textContent = b.paidDisplay;
    $('welcome-grant').textContent = b.grantDisplay;
    $('welcome').hidden = !justSignedUp;

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

  // ---------- links from account emails ----------
  // The token comes after #, so it never reaches a server log. It is taken off the address
  // straight away, so it is not left in the history or a shared screenshot.
  function flash(text, isError) {
    $('flash').textContent = text;
    $('flash').className = isError ? 'form-error' : 'next-note';
    $('flash').hidden = !text;
  }
  var resetToken = null;
  function readEmailLink() {
    var link = /^#(verify|reset|invite)=([A-Za-z0-9_-]+)$/.exec(location.hash);
    if (link) history.replaceState(null, '', location.pathname + location.search);
    return link;
  }

  $('verify-resend').addEventListener('click', function (ev) {
    var button = ev.currentTarget;
    $('verify-status').textContent = '';
    busy(button, true);
    Endwise.api('/api/account/verify/send', { body: {} }).then(function (r) {
      $('verify-status').textContent = r.verified ? 'Your email is already confirmed.' : 'Sent. Look for it in ' + r.sentTo + ', and in spam if it is not there in a few minutes.';
    }, function (err) {
      $('verify-status').textContent = err.message;
    }).then(function () { busy(button, false); });
  });

  $('forgot-link').addEventListener('click', function (ev) {
    ev.preventDefault();
    $('forgot-form').hidden = false;
    if (!$('forgot-email').value) $('forgot-email').value = $('login-email').value;
    $('forgot-email').focus();
  });

  $('forgot-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    clearErrors(form);
    $('forgot-error').textContent = '';
    $('forgot-status').textContent = '';
    busy(button, true);
    Endwise.api('/api/account/forgot', { body: { email: $('forgot-email').value } }).then(function (r) {
      $('forgot-status').textContent = r.message;
    }, function (err) {
      showError($('forgot-error'), err, form);
    }).then(function () { busy(button, false); });
  });

  $('reset-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    clearErrors(form);
    $('reset-error').textContent = '';
    busy(button, true);
    Endwise.api('/api/account/reset', { body: { token: resetToken, password: $('reset-password').value } }).then(function () {
      form.reset();
      resetToken = null;
      flash('Your new password is saved, and you are signed in.');
      return load();
    }, function (err) {
      showError($('reset-error'), err, form);
    }).then(function () { busy(button, false); });
  });

  var joinToken = null;
  $('join-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    clearErrors(form);
    $('join-error').textContent = '';
    busy(button, true);
    Endwise.api('/api/team/join', { body: { token: joinToken, password: $('join-password').value } }).then(function () {
      form.reset();
      joinToken = null;
      flash('You joined the team and are signed in.');
      return load();
    }, function (err) {
      showError($('join-error'), err, form);
    }).then(function () { busy(button, false); });
  });

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
    Endwise.api('/api/account/signup', { body: body }).then(function () {
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
    Endwise.api('/api/account/login', { body: { email: $('login-email').value, password: $('login-password').value } })
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
    Endwise.api('/api/account/logout', { body: {} }).then(load, function (err) {
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
    Endwise.api('/api/topup', { body: body }).then(function (json) {
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
    Endwise.api('/api/requests/nonprofit', { body: { orgName: $('np-org').value, ein: $('np-ein').value, email: $('np-email').value } }).then(function () {
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
        h('span', { class: 'muted small' }, INVOICE_STATUS[r.status] + (r.amountDisplay ? ', ' + r.amountDisplay : '')
          + (r.dueAt && r.status === 'issued' ? ', due ' + longDate(r.dueAt) : '') + '. Asked ' + when(r.createdAt) + '.'),
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
    Endwise.api('/api/requests/invoice', { body: {
      want: $('inv-want').value, company: $('inv-company').value, billingEmail: $('inv-email').value, poNumber: $('inv-po').value, plan: $('inv-plan').value,
    } }).then(function () {
      ['inv-want', 'inv-company', 'inv-email', 'inv-po', 'inv-plan'].forEach(function (id) { $(id).value = ''; });
      $('invoice-status').textContent = 'Received. We will email the invoice to your billing address.';
      return Endwise.me(true).then(function (a) { account = a; renderAccount(); });
    }, function (err) {
      showError($('invoice-error'), err, form);
    }).then(function () { busy(button, false); });
  });

  // ---------- account limit ----------
  function saveCap(micros) {
    $('cap-error').textContent = '';
    $('cap-status').textContent = '';
    return Endwise.api('/api/account/cap', { body: { monthlyCapMicros: micros } }).then(function () {
      return Endwise.me(true).then(function (a) {
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
    return Endwise.api('/api/keys').then(function (json) { renderKeys(json.keys); }, function (err) {
      ['key-list', 'app-list'].forEach(function (id) {
        $(id).textContent = '';
        $(id).appendChild(h('p', { class: 'form-error' }, err.message));
      });
    });
  }

  // A connected app (kind 'oauth') is a key made by signing in from Claude or ChatGPT: the same
  // limit and spend, no key text to show, and Disconnect in place of Revoke.
  function keyRow(key) {
    var revoked = !!key.revokedAt;
    var app = key.kind === 'oauth';
    var stopWord = app ? 'Disconnect' : 'Revoke';
    var status = h('span', { class: 'status', role: 'status' });
    var actions = h('div', { class: 'key-actions' });
    var editArea = h('div');

    if (!revoked) {
      var revoke = h('button', { type: 'button', class: 'link-btn' }, stopWord);
      var armed = false;
      revoke.addEventListener('click', function () {
        if (!armed) {
          armed = true;
          revoke.textContent = app ? 'Click again to disconnect' : 'Click again to revoke for good';
          setTimeout(function () { armed = false; revoke.textContent = stopWord; }, 5000);
          return;
        }
        revoke.disabled = true;
        Endwise.api('/api/keys/' + key.id + '/revoke', { body: {} }).then(loadKeys, function (err) {
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
          Endwise.api('/api/keys/' + key.id + '/cap', { body: { monthlyCapMicros: limit.micros } }).then(loadKeys, function (err) {
            status.textContent = err.message;
            save.disabled = false;
          });
        });
        editArea.appendChild(form);
        input.focus();
      });
      if (!isMember()) actions.appendChild(edit);
      actions.appendChild(revoke);
    }

    return h('li', { class: 'key-item' + (revoked ? ' key-revoked' : '') }, [
      h('div', { class: 'key-top' }, [
        h('div', null, (app ? [h('strong', null, key.name)] : [
          h('strong', null, key.name),
          ' ',
          h('code', null, key.prefix + '…'),
        ]).concat(key.memberEmail && !isMember() ? [' ', h('span', { class: 'muted small' }, key.memberEmail)] : [])),
        actions,
      ]),
      h('p', { class: 'key-meta money' }, revoked
        ? [(app ? 'Disconnected ' : 'Revoked ') + when(key.revokedAt) + '. It no longer works.']
        : [
          'Limit ', h('strong', null, key.monthlyCapDisplay), ' a month. ',
          'Spent ', h('strong', null, key.spentThisMonthDisplay), ' this month. ',
          'Last used ' + when(key.lastUsedAt) + '.',
        ]),
      editArea,
      status,
    ]);
  }

  function renderKeyList(id, keys, emptyText) {
    var list = $(id);
    list.textContent = '';
    if (!keys.length) {
      list.appendChild(h('p', { class: 'muted' }, emptyText));
      return;
    }
    var active = keys.filter(function (k) { return !k.revokedAt; });
    var revoked = keys.filter(function (k) { return k.revokedAt; });
    list.appendChild(h('ul', { class: 'key-list' }, active.concat(revoked).map(keyRow)));
  }

  function renderKeys(keys) {
    renderKeyList('key-list', keys.filter(function (k) { return k.kind !== 'oauth'; }), 'You have no keys yet.');
    renderKeyList('app-list', keys.filter(function (k) { return k.kind === 'oauth'; }), 'No apps are connected.');
  }

  // ---------- plan and team members (the owner's) ----------
  function loadTeam() {
    return Endwise.api('/api/team').then(function (json) { team = json; renderTeam(); }, function (err) {
      $('plan-current').textContent = '';
      $('plan-current').appendChild(h('p', { class: 'form-error' }, err.message));
    });
  }

  function renderTeam() {
    var plan = team.plan;
    var box = $('plan-current');
    box.textContent = '';
    if (plan) {
      box.appendChild(h('p', null, [
        h('strong', null, plan.name + ' plan'), ', ' + plan.usageDisplay + ' of use for up to ' + (plan.members === null ? 'any number of' : plan.members) + ' people. ',
        'Runs to ' + longDate(plan.endsAt) + (plan.renew ? ', renewal on.' : ', renewal off.'),
      ]));
      if (team.nextPlan) box.appendChild(h('p', { class: 'muted small' }, 'The next year (' + team.nextPlan.name + ') is paid for and runs to ' + longDate(team.nextPlan.endsAt) + '.'));
    } else {
      box.appendChild(h('p', null, 'No plan yet. A plan is a year of use for a firm or an ops team, with team members and this usage report. It never renews by itself.'));
    }
    $('plan-renew-box').hidden = !plan;
    $('plan-renew').checked = !!(plan && (team.nextPlan || plan).renew);

    var offers = $('plan-offers');
    offers.textContent = '';
    team.offers.forEach(function (o) {
      var button = h('button', { type: 'button', class: 'btn btn-small' }, o.byCard ? 'Pay by card' : 'Ask for an invoice');
      button.addEventListener('click', function () { buyPlan(o, button); });
      var also = o.byCard ? h('button', { type: 'button', class: 'link-btn' }, 'or ask for an invoice') : null;
      if (also) also.addEventListener('click', function () { askInvoiceFor(o); });
      offers.appendChild(h('div', { class: 'choice-card plan-card' }, [
        h('span', { class: 'cc-name' }, o.name),
        h('span', { class: 'cc-price' }, (o.from ? 'From ' : '') + o.priceDisplay + ' a year'),
        h('span', { class: 'cc-note' }, o.usageDisplay + ' of use' + (o.from ? ' or more' : '') + ', ' + (o.members === null ? 'any number of people' : 'up to ' + o.members + ' people') + '. ' + o.pay),
        h('span', null, [button, also ? ' ' : null, also]),
      ]));
    });

    // The plan names in the invoice form.
    var select = $('inv-plan');
    if (select.options.length === 1) {
      team.offers.forEach(function (o) { select.appendChild(h('option', { value: o.id }, o.name + ' plan')); });
    }

    $('members').hidden = !plan && !team.members.length && !team.invites.length;
    $('seats').textContent = team.seats.limit === null
      ? team.seats.used + (team.seats.used === 1 ? ' person' : ' people') + ' on the account, you included. No limit on this plan.'
      : team.seats.used + ' of ' + team.seats.limit + ' people on the account, you included, counting open invitations.';
    renderMembers();
  }

  function buyPlan(offer, button) {
    $('plan-error').textContent = '';
    if (!offer.byCard) { askInvoiceFor(offer); return; }
    busy(button, true);
    Endwise.api('/api/topup', { body: { product: offer.id } }).then(function (json) {
      window.location.assign(json.url);
    }, function (err) {
      $('plan-error').textContent = err.message;
      busy(button, false);
    });
  }

  function askInvoiceFor(offer) {
    $('inv-plan').value = offer.id;
    if (!$('inv-want').value) $('inv-want').value = 'The ' + offer.name + ' plan for a year.';
    $('invoice').scrollIntoView({ block: 'start' });
    $('inv-company').focus();
  }

  $('plan-renew').addEventListener('change', function (ev) {
    var box = ev.currentTarget;
    $('plan-renew-status').textContent = '';
    box.disabled = true;
    Endwise.api('/api/team/renew', { body: { renew: box.checked } }).then(function () {
      $('plan-renew-status').textContent = box.checked
        ? 'Renewal is on. We email you 30 days before the end. Nothing is charged automatically.'
        : 'Renewal is off. The plan ends on its date and nothing is charged.';
      return loadTeam();
    }, function (err) {
      box.checked = !box.checked;
      $('plan-renew-status').textContent = err.message;
    }).then(function () { box.disabled = false; });
  });

  // A limit editor like the keys' one: saves through `path`, or removes the limit.
  function limitEditor(label, current, path, status, done) {
    var input = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', value: current === null ? '' : toAmount(current), 'aria-label': label });
    var save = h('button', { type: 'submit', class: 'btn btn-small' }, 'Save');
    var remove = h('button', { type: 'button', class: 'btn btn-quiet btn-small' }, 'No limit');
    var form = h('form', { class: 'cap-edit', novalidate: true }, [
      h('div', { class: 'money-input' }, [h('span', { 'aria-hidden': 'true' }, symbolOf(account.currency)), input]), save, remove,
    ]);
    var send = function (micros) {
      save.disabled = true;
      Endwise.api(path, { body: { monthlyCapMicros: micros } }).then(done, function (err) {
        status.textContent = err.message;
        save.disabled = false;
      });
    };
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var limit = readLimit(input.value, '50 or 50.50');
      if (limit.error) { status.textContent = limit.error; return; }
      send(limit.micros);
    });
    remove.addEventListener('click', function () { send(null); });
    return form;
  }

  function renderMembers() {
    var box = $('member-list');
    box.textContent = '';
    var rows = team.members.map(function (m) {
      var status = h('span', { class: 'status', role: 'status' });
      var editArea = h('div');
      var edit = h('button', { type: 'button', class: 'link-btn' }, 'Change limit');
      edit.addEventListener('click', function () {
        if (editArea.children.length) { editArea.textContent = ''; return; }
        editArea.appendChild(limitEditor('Monthly limit for ' + m.email, m.monthlyCapMicros, '/api/team/members/' + m.id + '/cap', status, function () {
          return Promise.all([loadTeam(), loadReport()]);
        }));
      });
      var remove = h('button', { type: 'button', class: 'link-btn' }, 'Remove');
      var armed = false;
      remove.addEventListener('click', function () {
        if (!armed) {
          armed = true;
          remove.textContent = 'Click again to remove';
          setTimeout(function () { armed = false; remove.textContent = 'Remove'; }, 5000);
          return;
        }
        remove.disabled = true;
        Endwise.api('/api/team/members/' + m.id + '/remove', { body: {} }).then(function () {
          return Promise.all([loadTeam(), loadKeys(), loadReport()]);
        }, function (err) {
          status.textContent = err.message;
          remove.disabled = false;
        });
      });
      return h('li', { class: 'key-item' }, [
        h('div', { class: 'key-top' }, [h('div', null, [h('strong', null, m.email)]), h('div', { class: 'key-actions' }, [edit, remove])]),
        h('p', { class: 'key-meta money' }, [
          'Limit ', h('strong', null, m.monthlyCapDisplay === null ? 'none' : m.monthlyCapDisplay + ' a month'), '. ',
          'Spent ', h('strong', null, m.spentThisMonthDisplay), ' this month. Joined ' + when(m.joinedAt) + '.',
        ]),
        editArea,
        status,
      ]);
    });
    team.invites.forEach(function (i) {
      var status = h('span', { class: 'status', role: 'status' });
      var cancel = h('button', { type: 'button', class: 'link-btn' }, 'Cancel invitation');
      cancel.addEventListener('click', function () {
        cancel.disabled = true;
        Endwise.api('/api/team/invites/' + i.id + '/cancel', { body: {} }).then(loadTeam, function (err) {
          status.textContent = err.message;
          cancel.disabled = false;
        });
      });
      rows.push(h('li', { class: 'key-item' }, [
        h('div', { class: 'key-top' }, [h('div', null, [h('strong', null, i.email), ' ', h('span', { class: 'muted small' }, 'invited')]), h('div', { class: 'key-actions' }, [cancel])]),
        h('p', { class: 'key-meta' }, 'The link works until ' + when(i.expiresAt) + '.'),
        status,
      ]));
    });
    box.appendChild(rows.length ? h('ul', { class: 'key-list' }, rows) : h('p', { class: 'muted' }, 'No members yet.'));
  }

  $('invite-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    var button = form.querySelector('button[type="submit"]');
    clearErrors(form);
    $('invite-error').textContent = '';
    $('invite-status').textContent = '';
    busy(button, true);
    Endwise.api('/api/team/invites', { body: { email: $('invite-email').value } }).then(function (r) {
      $('invite-email').value = '';
      $('invite-status').textContent = 'Sent to ' + r.invite.email + '. The link works for 7 days.';
      return loadTeam();
    }, function (err) {
      showError($('invite-error'), err, form);
    }).then(function () { busy(button, false); });
  });

  // ---------- usage report (the owner's) ----------
  function loadReport() {
    return Endwise.api('/api/team/report').then(function (json) { renderReport(json.report); }, function (err) {
      $('report-body').textContent = '';
      $('report-body').appendChild(h('p', { class: 'form-error' }, err.message));
    });
  }

  var PAD = 'padding-left:16px';
  function reportTable(caption, head, rows) {
    return h('div', { class: 'table-scroll' }, h('table', { class: 'rules' }, [
      h('caption', { class: 'muted small' }, caption),
      h('thead', null, h('tr', null, head.map(function (c, i) { return h('th', { scope: 'col', class: i >= 1 && i <= 3 ? 'r' : null, style: i ? 'padding-left:16px' : null }, c); }))),
      h('tbody', null, rows),
    ]));
  }

  function renderReport(report) {
    var box = $('report-body');
    box.textContent = '';
    report.months.forEach(function (m, index) {
      box.appendChild(h('h3', null, (index === 0 ? 'This month, ' : 'Last month, ') + m.label + ': ' + m.totalDisplay));
      box.appendChild(reportTable('By person', ['Person', 'Spent', 'Paid calls', 'Tools'], m.byMember.map(function (l) {
        return h('tr', null, [
          h('td', null, [l.name, ' ', h('span', { class: 'muted small' }, l.role === 'owner' ? 'owner' : l.removed ? 'removed' : 'member')]),
          h('td', { class: 'r money', style: PAD }, l.spentDisplay), h('td', { class: 'r num', style: PAD }, String(l.calls)), h('td', { class: 'r num', style: PAD }, String(l.tools)),
        ]);
      })));
      if (!m.byKey.length) { box.appendChild(h('p', { class: 'muted small' }, 'No paid calls by key, app or on the web.')); return; }
      box.appendChild(reportTable('By API key, app or the web', ['Key', 'Spent', 'Paid calls', 'Tools', 'Monthly limit'], m.byKey.map(function (l) {
        var limitCell = h('td', { style: PAD }, l.monthlyCapDisplay || '');
        // This month's lines can set the key's limit in place.
        if (index === 0 && l.keyId !== null && !l.revoked) {
          var status = h('span', { class: 'status', role: 'status' });
          var edit = h('button', { type: 'button', class: 'link-btn' }, 'Change');
          var area = h('div');
          edit.addEventListener('click', function () {
            if (area.children.length) { area.textContent = ''; return; }
            var form = limitEditor('Monthly limit for ' + l.name, l.monthlyCapMicros, '/api/keys/' + l.keyId + '/cap', status, function () {
              return Promise.all([loadKeys(), loadReport()]);
            });
            form.removeChild(form.lastChild); // a key always has a limit
            area.appendChild(form);
          });
          limitCell = h('td', { style: PAD }, [l.monthlyCapDisplay, ' ', edit, area, status]);
        }
        return h('tr', null, [
          h('td', null, [l.name].concat(l.prefix ? [' ', h('code', null, l.prefix + '…')] : [],
            l.member ? [h('br'), h('span', { class: 'muted small' }, l.member + (l.revoked ? ', revoked' : ''))] : [])),
          h('td', { class: 'r money', style: PAD }, l.spentDisplay), h('td', { class: 'r num', style: PAD }, String(l.calls)), h('td', { class: 'r num', style: PAD }, String(l.tools)),
          limitCell,
        ]);
      })));
    });
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
    Endwise.api('/api/keys', { body: body }).then(function (json) {
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
    Endwise.copy($('new-key-value').textContent, $('new-key-value'), $('new-key-status'));
  });
  $('new-key-done').addEventListener('click', function () {
    $('new-key-value').textContent = '';
    $('new-key').hidden = true;
  });

  // ---------- ledger ----------
  function loadLedger() {
    return Promise.all([
      Endwise.api('/api/account/ledger'),
      Endwise.api('/api/v1/tools').catch(function () { return { tools: [] }; }),
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

  // A reset link opens the new-password form; a confirm link is posted, then the page loads as usual.
  // Also on hashchange, for a link opened in a tab already on this page.
  function openEmailLink(link) {
    flash('');
    if (link[1] === 'reset') {
      resetToken = link[2];
      show('reset');
      $('reset-password').focus();
      return;
    }
    if (link[1] === 'invite') {
      Endwise.api('/api/team/join/check', { body: { token: link[2] } }).then(function (r) {
        joinToken = link[2];
        $('join-lede').textContent = r.invite.teamEmail + ' invited you to use ' + (document.title.split(': ').pop() || 'the tools') + ' on their team. What you use is paid from the team\'s balance.';
        $('join-email').value = r.invite.email;
        show('join');
        $('join-password').focus();
      }, function (err) {
        flash(err.message, true);
        load();
      });
      return;
    }
    Endwise.api('/api/account/verify', { body: { token: link[2] } }).then(function () {
      flash('Your email is confirmed.');
    }, function (err) {
      flash(err.message, true);
    }).then(load);
  }
  window.addEventListener('hashchange', function () {
    var link = readEmailLink();
    if (link) openEmailLink(link);
  });
  var first = readEmailLink();
  if (first) openEmailLink(first); else load();
})();
