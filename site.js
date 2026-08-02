/* ==========================================================
   Jesse Becker - Personal Site  |  site.js
   Shared behaviour for every page, split into small modules
   that each guard their own markup. Page-specific behaviour
   stays in that page's own script.

   Note: the theme is applied by a tiny inline script in each
   <head> so there is no flash before this file loads. This
   file only owns the toggle button and the system-preference
   listener.
   ========================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'theme';

  /* -- Footer year ---------------------------------------- */

  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('.year').forEach(function (el) {
      el.textContent = year;
    });
  }

  /* -- Mobile navigation ---------------------------------- */

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close the menu when a link is chosen or Escape is pressed
    links.addEventListener('click', function (e) {
      if (e.target.closest('.nav-link')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        close();
        toggle.focus();
      }
    });

    function close() {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  /* -- Theme ---------------------------------------------- */

  function initTheme() {
    var root = document.documentElement;
    var btn = document.querySelector('.theme-toggle');
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    function stored() {
      try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function isDark() { return root.getAttribute('data-theme') === 'dark'; }

    function apply(dark) {
      if (dark) root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      syncLabel();
    }

    function syncLabel() {
      if (!btn) return;
      var dark = isDark();
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', String(dark));
    }

    if (btn) {
      syncLabel();
      btn.addEventListener('click', function () {
        var next = !isDark();
        apply(next);
        try { localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light'); } catch (e) {}
      });
    }

    // Follow the OS only while the visitor has not chosen for themselves
    var onSystemChange = function (e) { if (!stored()) apply(e.matches); };
    if (typeof media.addEventListener === 'function') media.addEventListener('change', onSystemChange);
    else if (typeof media.addListener === 'function') media.addListener(onSystemChange);
  }

  /* -- Boot ------------------------------------------------ */

  initYear();
  initMobileNav();
  initTheme();
})();

/* ==========================================================
   Scroll reveal
   Pages call window.initReveal({...}) with:
     singles : ['.selector', ...]        - each match revealed
     grids   : ['.selector', ...]        - children, staggered
     items   : [{ sel, step, mod }, ...] - flat list, staggered
     step / threshold / rootMargin       - optional tuning
   ========================================================== */

window.initReveal = function (cfg) {
  if (!('IntersectionObserver' in window)) return null;
  cfg = cfg || {};

  var step = cfg.step != null ? cfg.step : 0.08;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, {
    threshold: cfg.threshold || 0.08,
    rootMargin: cfg.rootMargin || '0px 0px -30px 0px'
  });

  function mark(el, delay) {
    el.classList.add('reveal');
    if (delay) el.style.transitionDelay = delay + 's';
    obs.observe(el);
  }

  (cfg.singles || []).forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { mark(el, 0); });
  });

  (cfg.grids || []).forEach(function (sel) {
    document.querySelectorAll(sel + ' > *').forEach(function (el, i) { mark(el, i * step); });
  });

  (cfg.items || []).forEach(function (spec) {
    var s = spec.step != null ? spec.step : step;
    var mod = spec.mod || 0;
    document.querySelectorAll(spec.sel).forEach(function (el, i) {
      mark(el, (mod ? i % mod : i) * s);
    });
  });

  return obs;
};

/* ==========================================================
   Count-up
   Animates numeric values into view once. Each element
   declares its own target via data attributes:
     data-count="90"  data-suffix="%+"  data-decimals="0"
   Suffixes render into a <sup> so display type can style them.
   ========================================================== */

window.initCounters = function (containerSel) {
  var container = document.querySelector(containerSel);
  if (!container) return;

  var els = Array.prototype.slice.call(container.querySelectorAll('[data-count]'));
  if (!els.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(el, value) {
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    el.textContent = value.toFixed(decimals);
    if (suffix) {
      var sup = document.createElement('sup');
      sup.textContent = suffix;
      el.appendChild(sup);
    }
  }

  function settle() {
    els.forEach(function (el) { render(el, parseFloat(el.dataset.count)); });
  }

  if (reduced || !('IntersectionObserver' in window)) { settle(); return; }

  var ran = false;
  var ease = function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; };

  new IntersectionObserver(function (entries, observer) {
    if (!entries[0].isIntersecting || ran) return;
    ran = true;
    observer.disconnect();

    var start = performance.now();
    var duration = 1100;

    (function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = ease(p);
      els.forEach(function (el) { render(el, parseFloat(el.dataset.count) * eased); });
      if (p < 1) requestAnimationFrame(frame);
    })(start);
  }, { threshold: 0.5 }).observe(container);
};
