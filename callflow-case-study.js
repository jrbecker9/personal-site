/* ----------------------------------------------------------
   Interactive Call-Flow case study — page + decision-tree engine
---------------------------------------------------------- */

document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());

/* Main nav toggle */
const toggle = document.querySelector('.nav-toggle');
const links  = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
}

/* Scroll reveal */
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.section-header, .cs-meta-card, .cs-stat, .skill-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = ((i % 3) * 0.06) + 's';
    obs.observe(el);
  });
}

/* -- Decision-tree engine ----------------------------------- */
(function () {
  const root = document.getElementById('cf-demo');
  if (!root) return;

  // Fictionalized triage flow for a sample subscription product ("Apex Pro").
  const TREE = {
    start: {
      q: 'What is the customer contacting us about?',
      help: 'Pick the category that best matches the customer’s opening statement.',
      options: [
        { label: 'Refund request',      next: 'refund_age' },
        { label: 'Billing question',    next: 'billing_recognized' },
        { label: 'Cancellation',        next: 'cancel_trial' },
        { label: 'Can’t access content', next: 'access_login' }
      ]
    },
    refund_age: {
      q: 'How long ago was the purchase?',
      options: [
        { label: '30 days or less', next: 'refund_plan' },
        { label: '31–60 days',  next: 'r_partial' },
        { label: 'More than 60 days', next: 'r_closed' }
      ]
    },
    refund_plan: {
      q: 'Which plan is the customer on?',
      options: [
        { label: 'Standard',           next: 'r_approve' },
        { label: 'Professional',       next: 'r_approve' },
        { label: 'Members (lifetime)', next: 'r_escalate' }
      ]
    },
    billing_recognized: {
      q: 'Does the customer recognize the charge?',
      options: [
        { label: 'Yes — just wants it explained', next: 'b_explain' },
        { label: 'No — possible duplicate',       next: 'billing_dupe' }
      ]
    },
    billing_dupe: {
      q: 'Are there two identical charges on the same order?',
      options: [
        { label: 'Yes — identical amounts', next: 'b_dupe' },
        { label: 'No — the amounts differ', next: 'b_investigate' }
      ]
    },
    cancel_trial: {
      q: 'Is the customer still inside the free-trial window?',
      options: [
        { label: 'Yes — within trial', next: 'c_free' },
        { label: 'No — trial has ended', next: 'c_retain' }
      ]
    },
    access_login: {
      q: 'Can the customer log in to their account?',
      options: [
        { label: 'No — login fails',          next: 'a_reset' },
        { label: 'Yes — but content is missing', next: 'a_sync' }
      ]
    },

    /* Results */
    r_approve: {
      tone: 'approve',
      title: 'Approve a full refund',
      detail: 'Process a full refund to the original payment method. No manager approval is required inside the 30-day window for Standard and Professional plans.',
      script: `“You’re still inside our 30-day window, so I can process that full refund back to your original card right now.”`
    },
    r_escalate: {
      tone: 'escalate',
      title: 'Escalate — do not refund',
      detail: 'Members / lifetime plans are handled by the retention team. Do not process this refund independently — create an escalation and warm-transfer the customer.',
      script: `“Your plan is looked after by a specialist team — let me connect you with the right person who can take care of this.”`
    },
    r_partial: {
      tone: 'info',
      title: 'Offer a partial credit',
      detail: 'Outside 30 days but within 60: offer account credit or a partial refund. Manager approval is required before committing to an amount.',
      script: `“You’re just past the full-refund window, but I can look into a partial credit for you — let me confirm the details.”`
    },
    r_closed: {
      tone: 'info',
      title: 'Refund window is closed',
      detail: 'Past 60 days the refund window is closed. Acknowledge it directly, then offer retention options — a pause, downgrade, or extended access.',
      script: `“That purchase is outside our refund window, but I do have a couple of options that might help — can I walk you through them?”`
    },
    b_explain: {
      tone: 'info',
      title: 'Explain the charge',
      detail: 'Walk the customer through the charge using their order confirmation. Confirm the product, date, and amount line by line before closing.',
      script: null
    },
    b_dupe: {
      tone: 'approve',
      title: 'Reverse the duplicate',
      detail: 'Submit a duplicate-charge reversal for the second identical charge. Keep the original and document both transaction IDs in the notes.',
      script: null
    },
    b_investigate: {
      tone: 'info',
      title: 'Open a billing ticket',
      detail: 'The amounts differ, so this needs review. Open a billing-investigation ticket with both charge amounts and dates attached, and set the follow-up expectation.',
      script: null
    },
    c_free: {
      tone: 'approve',
      title: 'Cancel at no charge',
      detail: 'Inside the trial, cancel immediately at no charge. Confirm the cancellation date and that no future billing will occur.',
      script: null
    },
    c_retain: {
      tone: 'info',
      title: 'Attempt retention, then cancel',
      detail: 'Past the trial, offer one retention path — pause, downgrade, or discount. If it’s declined, process the cancellation and confirm in writing.',
      script: null
    },
    a_reset: {
      tone: 'info',
      title: 'Reset their access',
      detail: 'Send a password reset and verify the email on file matches the order. Confirm the customer can log in before ending the contact.',
      script: null
    },
    a_sync: {
      tone: 'approve',
      title: 'Re-sync the entitlement',
      detail: 'Login works but content is missing — regenerate the access link / re-sync the entitlement, then confirm the content appears for the customer.',
      script: null
    }
  };

  const TONE_LABEL = { approve: 'Approve / proceed', escalate: 'Escalate', info: 'Handle / follow up' };

  let path = [];       // [{ node, label }]
  let current = 'start';

  const isResult = id => !!TREE[id].tone;

  function render() {
    const node = TREE[current];
    const result = isResult(current);
    let html = '';

    html += '<div class="cf-topbar">';
    html += '<span class="cf-progress">' + (result ? 'Recommended action' : 'Step ' + (path.length + 1)) + '</span>';
    html += '<button type="button" class="cf-restart"' + (path.length ? '' : ' hidden') + ' data-cf="restart">&#8635; Start over</button>';
    html += '</div>';

    html += '<div class="cf-breadcrumb">';
    if (!path.length) {
      html += '<span class="cf-breadcrumb-empty">Your path will appear here as you choose.</span>';
    } else {
      path.forEach((step, i) => {
        if (i) html += '<span class="cf-crumb-sep">&rsaquo;</span>';
        html += '<span class="cf-crumb">' + step.label + '</span>';
      });
    }
    html += '</div>';

    html += '<div class="cf-stage">';
    if (result) {
      html += '<div class="cf-result cf-result--' + node.tone + '">';
      html += '<div class="cf-result-tone">' + TONE_LABEL[node.tone] + '</div>';
      html += '<h3 tabindex="-1">' + node.title + '</h3>';
      html += '<p>' + node.detail + '</p>';
      if (node.script) {
        html += '<div class="cf-script"><span class="cf-script-label">Sample agent script</span>' + node.script + '</div>';
      }
      html += '</div>';
      html += '<div class="cf-controls"><button type="button" class="cf-back" data-cf="back">&#8592; Back</button></div>';
    } else {
      html += '<h3 class="cf-question" tabindex="-1">' + node.q + '</h3>';
      if (node.help) html += '<p class="cf-help">' + node.help + '</p>';
      html += '<div class="cf-options">';
      node.options.forEach((opt, i) => {
        html += '<button type="button" class="cf-option" data-cf="opt" data-i="' + i + '"><span>' + opt.label + '</span></button>';
      });
      html += '</div>';
      if (path.length) html += '<div class="cf-controls"><button type="button" class="cf-back" data-cf="back">&#8592; Back</button></div>';
    }
    html += '</div>';

    root.innerHTML = html;

    root.querySelectorAll('[data-cf="opt"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const opt = TREE[current].options[+btn.dataset.i];
        path.push({ node: current, label: opt.label });
        current = opt.next;
        render();
      });
    });
    const restartBtn = root.querySelector('[data-cf="restart"]');
    if (restartBtn) restartBtn.addEventListener('click', reset);
    const backBtn = root.querySelector('[data-cf="back"]');
    if (backBtn) backBtn.addEventListener('click', goBack);

    // Move focus to the new heading for keyboard/screen-reader users,
    // but not on first paint (avoids scroll jump on load).
    if (path.length) {
      const f = root.querySelector('.cf-question, .cf-result h3');
      if (f) f.focus({ preventScroll: true });
    }
  }

  function goBack() {
    const last = path.pop();
    if (last) current = last.node;
    render();
  }

  function reset() {
    path = [];
    current = 'start';
    render();
  }

  render();
})();
