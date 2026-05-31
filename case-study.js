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

    // KB stat counters (700+, 15+)
    (function () {
      const row = document.querySelector('.cs-stat-row');
      if (!row) return;
      const defs = [
        { idx: 0, end: 700, suffix: '+' },
        { idx: 1, end: 15,  suffix: '+' }
      ];
      const els = row.querySelectorAll('.cs-stat-value');
      let ran = false;
      const ease = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      new IntersectionObserver(([e]) => {
        if (!e.isIntersecting || ran) return;
        ran = true;
        const t0 = performance.now(), dur = 1100;
        function frame(now) {
          const p = Math.min((now - t0) / dur, 1), ep = ease(p);
          defs.forEach(d => { els[d.idx].textContent = Math.round(d.end * ep) + d.suffix; });
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }, { threshold: 0.5 }).observe(row);
    })();
