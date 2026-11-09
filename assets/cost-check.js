// The pricing page's staff-time check. The visitor enters what an hour of their staff costs and
// how long one check takes by hand; the page sets that against the price of one answer from the
// tool they pick (micro-units, from the tool's own pricing, in the select's values). Nothing is
// sent anywhere and nothing is assumed: with either number missing, it asks for it.
(function () {
  var form = document.querySelector('[data-cost-check]');
  if (!form) return;
  var currency = form.getAttribute('data-currency') || 'USD';
  var locale = form.getAttribute('data-locale') || 'en-US';
  var out = form.querySelector('output');
  var money = function (n) {
    var digits = n > 0 && n < 1 ? 4 : 2;
    return n.toLocaleString(locale, { style: 'currency', currency: currency, minimumFractionDigits: n >= 1 && n % 1 === 0 ? 0 : 2, maximumFractionDigits: digits });
  };
  var num = function (name) {
    var v = form.elements[name].value.trim();
    return v === '' ? NaN : Number(v);
  };
  function update() {
    var hourly = num('hourly');
    var minutes = num('minutes');
    var each = Number(form.elements.each.value) / 1e6;
    if (!(hourly >= 0) || !(minutes >= 0)) { out.textContent = 'Enter your two numbers.'; return; }
    var byHand = hourly * minutes / 60;
    out.innerHTML = '';
    var rows = [
      ['One check by hand', money(byHand)],
      ['1,000 checks by hand', money(byHand * 1000)],
      ['1,000 answers here', money(each * 1000)],
    ];
    rows.forEach(function (r) {
      var line = document.createElement('span');
      var k = document.createElement('span');
      var v = document.createElement('b');
      k.textContent = r[0];
      v.textContent = r[1];
      line.appendChild(k);
      line.appendChild(v);
      out.appendChild(line);
    });
  }
  form.hidden = false;
  form.addEventListener('input', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  update();
})();
