document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());

    // Main nav toggle
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    // Case study tabs
    document.querySelectorAll('.cs-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cs-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.cs-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        document.getElementById('cs-panel-' + btn.dataset.csTab).classList.add('active');
      });
    });

    // Component explorer sidebar
    document.querySelectorAll('.comp-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.comp-nav-item').forEach(i => {
          i.classList.remove('active');
          i.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.comp-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');
        document.getElementById('comp-' + item.dataset.comp).classList.add('active');
      });
    });

    // Animated stat counters - data-driven via data-cs-count / data-cs-suffix
    (function () {
      const row = document.querySelector('.cs-stat-row');
      if (!row) return;
      const defs = Array.prototype.slice
        .call(row.querySelectorAll('.cs-stat-value[data-cs-count]'))
        .map(el => ({
          el: el,
          end: parseInt(el.getAttribute('data-cs-count'), 10) || 0,
          suffix: el.getAttribute('data-cs-suffix') || ''
        }));
      if (!defs.length) return;
      let ran = false;
      const ease = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const settle = () => defs.forEach(d => { d.el.textContent = d.end + d.suffix; });
      new IntersectionObserver((entries, ob) => {
        if (!entries[0].isIntersecting || ran) return;
        ran = true;
        ob.disconnect();
        const t0 = performance.now(), dur = 1100;
        function frame(now) {
          const p = Math.min((now - t0) / dur, 1), ep = ease(p);
          defs.forEach(d => { d.el.textContent = Math.round(d.end * ep) + d.suffix; });
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        setTimeout(settle, dur + 120); // guarantee final value if rAF is throttled
      }, { threshold: 0.5 }).observe(row);
    })();
