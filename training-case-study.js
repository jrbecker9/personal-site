document.documentElement.classList.add('training-js');

document.querySelectorAll('.year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
}

const wrap = document.getElementById('tl-wrap');
const timelineEntries = document.querySelectorAll('.tl-entry');
const counters = document.querySelectorAll('.cs-stat-num[data-count]');

function showTimeline() {
  wrap?.classList.add('spine-drawn');
  timelineEntries.forEach(el => el.classList.add('tl-visible'));
}

function runCounter(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const isDecimal = el.dataset.decimal === '1';
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = ease * target;
    el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window) {
  const spineObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      wrap?.classList.add('spine-drawn');
      spineObserver.disconnect();
    }
  }, { threshold: 0.08 });

  if (wrap) spineObserver.observe(wrap);

  const entryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('tl-visible');
        entryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  timelineEntries.forEach(el => entryObserver.observe(el));

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
} else {
  showTimeline();
  counters.forEach(runCounter);
}
