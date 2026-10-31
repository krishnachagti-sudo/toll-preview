/* Variant c, "Fluid island". Loaded at the end of the body, after home.js and toll.js.

   - island():    the header pinches into a floating pill after a short scroll, and springs open
                  on hover, keyboard focus or tap. Positions are measured once (offsets ignore
                  transforms) and handed to CSS as variables, so a state change is one class flip.
   - switchers(): one highlight per tab group that morphs to the selected tab through a
                  same-document view transition (FLIP with the Web Animations API as fallback).
   - idle():      pauses the hero's glow and caret while the hero is offscreen. */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SPRING = 'linear(0, 0.0332, 0.1142, 0.2208, 0.3374, 0.4531, 0.5611, 0.6575, 0.7405, 0.8097, 0.8659, 0.9103, 0.9442, 0.9695, 0.9876, 0.9999, 1.0079, 1.0125, 1.0147, 1.0152, 1.0145, 1.0132, 1.0116, 1.0098, 1.0081, 1.0065, 1.005, 1.0038, 1)';
  try { if (!CSS.supports('transition-timing-function', SPRING)) SPRING = 'cubic-bezier(.25,1.12,.5,1)'; } catch (e) { SPRING = 'ease-out'; }

  function each(sel, fn, scope) { [].forEach.call((scope || document).querySelectorAll(sel), fn); }
  function shown(el) { return !!el && el.offsetWidth > 0 && el.getClientRects().length > 0; }

  // ---------------------------------------------------------------- island
  function island() {
    var head = document.querySelector('.site-head');
    var row = head && head.querySelector('.nav-row');
    var logo = row && row.querySelector('.logo');
    if (!logo) return;

    var layers = document.createElement('div');
    layers.className = 'lq-layers';
    layers.setAttribute('aria-hidden', 'true');
    layers.innerHTML = '<div class="lq-shadow"><i></i></div><div class="lq-edge"></div><div class="lq-glass"></div>';
    head.insertBefore(layers, row);
    head.classList.add('lq');
    var glass = layers.querySelector('.lq-glass');
    var menu = row.querySelector('details.menu');

    var isIsland = false, isOpen = false, how = '', openY = 0;
    var tEnter = 0, tLeave = 0, hush = false;

    function x(el) { var v = 0; while (el && el !== head) { v += el.offsetLeft; el = el.offsetParent; } return v; }
    function y(el) { var v = 0; while (el && el !== head) { v += el.offsetTop; el = el.offsetParent; } return v; }
    function px(n) { return Math.round(n * 10) / 10 + 'px'; }

    // The one action the island keeps: the menu button on small screens, "Get started" on wide
    // ones, or the account chip (balance and Top up) once signed in.
    function pickAction() {
      var s = row.querySelector('.menu summary');
      if (shown(s)) return s;
      var b = row.querySelector('.nav-cta .nav-start');
      if (shown(b)) return b;
      return row.querySelector('[data-toll-chip]');
    }

    function measure() {
      each('.lq-logo,.lq-act,.lq-hide', function (el) {
        el.classList.remove('lq-logo', 'lq-act', 'lq-hide');
        el.style.removeProperty('--lq-x');
      }, row);
      var act = pickAction();
      if (!shown(act)) return;
      var vw = head.clientWidth, hh = head.offsetHeight;

      var s = 0.92, padL = 14, padR = 4, gap = 22;
      var lw = logo.offsetWidth * s, aw = act.offsetWidth, ah = act.offsetHeight;
      var H = Math.round(ah + 8);
      var W = Math.round(padL + lw + gap + aw + padR);
      var L = Math.round((vw - W) / 2);
      var cy = y(act) + ah / 2;
      var top = cy - H / 2;

      var st = head.style;
      st.setProperty('--i-t', px(top));
      st.setProperty('--i-b', px(hh - top - H));
      st.setProperty('--i-l', px(L));
      st.setProperty('--i-r', px(vw - L - W));
      st.setProperty('--i-rad', px(H / 2));

      // Open: a wide pill around the nav's own resting layout.
      var H2 = H + 4, top2 = cy - H2 / 2;
      var oL = Math.max(8, x(logo) - padL);
      var oR = Math.min(vw - 8, x(act) + aw + padR);
      st.setProperty('--o-t', px(top2));
      st.setProperty('--o-b', px(hh - top2 - H2));
      st.setProperty('--o-l', px(oL));
      st.setProperty('--o-r', px(vw - oR));
      st.setProperty('--o-rad', px(H2 / 2));

      logo.classList.add('lq-logo');
      logo.style.setProperty('--lq-x', px(L + padL - x(logo)));
      act.classList.add('lq-act');
      act.style.setProperty('--lq-x', px(L + W - padR - aw - x(act)));

      var mid = L + W / 2;
      ['.head-nav', '.nav-cta .sep', '[data-toll-chip]', '.nav-cta .nav-start', '.menu'].forEach(function (sel) {
        var el = row.querySelector(sel);
        if (!shown(el) || el === act || el.contains(act)) return;
        el.classList.add('lq-hide');
        el.style.setProperty('--lq-x', px((mid - (x(el) + el.offsetWidth / 2)) * 0.35));
      });
    }

    function paint() {
      head.classList.toggle('is-island', isIsland);
      head.classList.toggle('is-open', isIsland && isOpen);
    }
    function setOpen(v, why) {
      clearTimeout(tEnter); clearTimeout(tLeave);
      if (isOpen === v && (!v || how === why)) return;
      isOpen = v; how = v ? why : ''; openY = window.scrollY;
      paint();
    }

    // Scroll: hysteresis so the threshold never flickers.
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var sy = window.scrollY;
        var want = isIsland ? sy > 12 : sy > 56;
        if (want !== isIsland) {
          isIsland = want;
          if (!want && !(menu && menu.open)) { isOpen = false; how = ''; }
          paint();
        }
        if (isOpen && how === 'tap' && Math.abs(sy - openY) > 48) setOpen(false);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Hover (a fine pointer): open after a beat, close a little after leaving.
    head.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !isIsland) return;
      clearTimeout(tLeave);
      tEnter = setTimeout(function () { setOpen(true, 'hover'); }, 60);
    });
    head.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(tEnter);
      if (how !== 'hover') return;
      tLeave = setTimeout(function () { setOpen(false); }, 260);
    });

    // Tap on the pill itself (not on a link): toggle open. A tap elsewhere closes it.
    glass.addEventListener('click', function () {
      if (!isIsland) return;
      setOpen(!isOpen, 'tap');
    });
    document.addEventListener('pointerdown', function (e) {
      if (isOpen && (how === 'tap' || how === 'menu') && !head.contains(e.target)) {
        if (menu && menu.open) menu.open = false;
        setOpen(false);
      }
    }, { passive: true });

    // Keyboard: focus inside the header opens it; leaving closes it.
    head.addEventListener('focusin', function (e) {
      var fv = false;
      try { fv = e.target.matches(':focus-visible'); } catch (err) { fv = true; }
      if (fv && isIsland && !hush) setOpen(true, 'focus');
    });
    head.addEventListener('focusout', function () {
      setTimeout(function () {
        if (how === 'focus' && !head.contains(document.activeElement)) setOpen(false);
      }, 0);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen) return;
      if (menu && menu.open) { menu.open = false; var sm = menu.querySelector('summary'); if (sm) sm.focus(); }
      setOpen(false);
      // Never leave focus on a link the closed island has just hidden.
      var a = document.activeElement;
      if (a && a.closest && a.closest('.lq-hide')) { hush = true; logo.focus(); hush = false; }
    });

    if (menu) {
      menu.addEventListener('toggle', function () {
        if (menu.open) setOpen(true, 'menu');
        else if (how === 'menu') setOpen(false);
      });
      each('.menu-panel a', function (a) {
        a.addEventListener('click', function () { menu.open = false; });
      }, menu);
    }

    // Re-measure when anything in the bar changes size (fonts, the account chip, the viewport).
    var raf = 0;
    function remeasure() { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); }
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(remeasure);
      ro.observe(row);
      each('.logo, .head-nav, .nav-cta, [data-toll-chip], .menu summary', function (el) { ro.observe(el); }, row);
    } else {
      window.addEventListener('resize', remeasure);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);

    measure();
    isIsland = window.scrollY > 56;
    paint();
    // Two frames later the resting state is painted; only then turn the motion on.
    requestAnimationFrame(function () { requestAnimationFrame(function () { head.classList.add('lq-ready'); }); });
  }

  // ---------------------------------------------------------------- tab highlights
  var vtOK = !reduce && typeof document.startViewTransition === 'function';

  function enter(els) {
    if (reduce) return;
    [].forEach.call(els, function (el) {
      el.classList.remove('lq-enter');
      void el.offsetWidth;
      el.classList.add('lq-enter');
      el.addEventListener('animationend', function done() { el.classList.remove('lq-enter'); el.removeEventListener('animationend', done); });
    });
  }

  // One highlight per group, living inside the selected item.
  function indicator(group, itemSel, attr, name) {
    var ind = document.createElement('span');
    ind.className = 'lq-ind';
    ind.setAttribute('aria-hidden', 'true');
    ind.style.viewTransitionName = name;
    function place() {
      var cur = group.querySelector(itemSel + '[' + attr + '="true"]');
      if (cur && ind.parentNode !== cur) cur.insertBefore(ind, cur.firstChild);
    }
    place();
    new MutationObserver(place).observe(group, { subtree: true, attributes: true, attributeFilter: [attr] });
    return { el: ind, place: place };
  }

  // Wrap a group's clicks so home.js's own handler runs inside a view transition.
  function morphClicks(root, itemSel, inds, panesSel) {
    root.classList.add('lq-sw');
    var passing = false;
    root.addEventListener('click', function (e) {
      if (passing) return;
      var t = e.target.closest && e.target.closest(itemSel);
      if (!t || !root.contains(t)) return;
      var before = [].filter.call(root.querySelectorAll(panesSel), function (p) { return !p.hidden; });
      function after() {
        inds.forEach(function (i) { i.place(); });
        enter([].filter.call(root.querySelectorAll(panesSel), function (p) { return !p.hidden && before.indexOf(p) < 0; }));
      }
      if (reduce) { requestAnimationFrame(after); return; }
      if (vtOK) {
        e.stopImmediatePropagation();
        e.preventDefault();
        document.startViewTransition(function () {
          passing = true;
          try { t.click(); } finally { passing = false; }
          after();
        });
        return;
      }
      // Fallback: FLIP each highlight from where it was.
      var old = inds.map(function (i) { return i.el.getBoundingClientRect(); });
      requestAnimationFrame(function () {
        after();
        inds.forEach(function (i, n) {
          var a = old[n], b = i.el.getBoundingClientRect();
          if (!b.width || !a.width || (a.left === b.left && a.top === b.top && a.width === b.width)) return;
          i.el.animate([
            { transformOrigin: '0 0', transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + a.width / b.width + ',' + a.height / b.height + ')' },
            { transformOrigin: '0 0', transform: 'none' }
          ], { duration: 460, easing: SPRING });
        });
      });
    }, true);
  }

  function switchers() {
    var code = document.getElementById('code');
    if (code) {
      var ep = code.querySelector('.tabs.ep');
      var lang = code.querySelector('.tabs:not(.ep)');
      var inds = [];
      if (ep) inds.push(indicator(ep, '.tab', 'aria-selected', 'lq-tab-ep'));
      if (lang) inds.push(indicator(lang, '.tab', 'aria-selected', 'lq-tab-lang'));
      morphClicks(code, '.tab', inds, 'pre[data-lang], pre[data-resp], [data-cost]');
    }
    var app = document.getElementById('app');
    if (app) {
      var side = app.querySelector('.side');
      var tabs = app.querySelector('.m-tabs');
      var hi = [];
      if (side) hi.push(indicator(side, 'button.s-item', 'aria-current', 'lq-tool-side'));
      if (tabs) hi.push(indicator(tabs, 'button.s-item', 'aria-current', 'lq-tool-tabs'));
      morphClicks(app, 'button.s-item', hi, '.view-wrap');
    }
  }

  // ---------------------------------------------------------------- offscreen pause
  function idle() {
    var stage = document.querySelector('.hero .stage');
    if (!stage || !('IntersectionObserver' in window)) return;
    var hero = document.querySelector('.hero');
    new IntersectionObserver(function (en) {
      hero.classList.toggle('lq-idle', !en[0].isIntersecting);
    }).observe(hero);
  }

  function boot() { island(); switchers(); idle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
