/* ----------------------------------------------------------
   Jesse Becker - Personal Site | site.js
   Shared across every page: footer year, mobile nav toggle,
   and a small scroll-reveal helper (window.initReveal).
   Page-specific behaviour stays in each page's own script.
---------------------------------------------------------- */

(function () {
  // Footer copyright year
  document.querySelectorAll('.year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
  }
})();

/* Generic scroll-reveal. Pages call window.initReveal({...}) with:
     singles : ['.selector', ...]          - each match revealed
     grids   : ['.selector', ...]          - direct children revealed, staggered
     items   : [{ sel, step, mod }, ...]   - flat list revealed, staggered (mod caps the index)
     step / threshold / rootMargin         - optional tuning
*/
window.initReveal = function (cfg) {
  if (!('IntersectionObserver' in window)) return null;
  cfg = cfg || {};
  var step = cfg.step != null ? cfg.step : 0.08;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: cfg.threshold || 0.08, rootMargin: cfg.rootMargin || '0px 0px -30px 0px' });

  (cfg.singles || []).forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('reveal');
      obs.observe(el);
    });
  });

  (cfg.grids || []).forEach(function (sel) {
    document.querySelectorAll(sel + ' > *').forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * step) + 's';
      obs.observe(el);
    });
  });

  (cfg.items || []).forEach(function (spec) {
    var s = spec.step != null ? spec.step : step;
    var mod = spec.mod || 0;
    document.querySelectorAll(spec.sel).forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((mod ? i % mod : i) * s) + 's';
      obs.observe(el);
    });
  });

  return obs;
};
