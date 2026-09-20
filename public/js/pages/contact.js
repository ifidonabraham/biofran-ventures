/* ==========================================================================
   Contact page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, post, escapeHtml } = BFV;
  const C = () => window.Components;

  async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn ? btn.innerHTML : 'Send Message';

    const data = {
      name: (form.name.value || '').trim(),
      email: (form.email.value || '').trim(),
      phone: (form.phone.value || '').trim(),
      topic: form.topic.value || 'General enquiry',
      message: (form.message.value || '').trim()
    };

    if (!data.name || !data.email || !data.message) {
      return window.Site.toastErr('Please provide your name, email, and message.');
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Sending message…';
    }

    try {
      await post('/contact', data);
      window.Site.toastOk('Message sent successfully! We will get back to you shortly.');

      const host = document.getElementById('contactFormHost') || form;
      host.innerHTML = `
      <div class="card" style="padding:2.5rem;text-align:center;border-color:var(--gold)">
        <div style="width:52px;height:52px;margin:0 auto 1rem;border-radius:50%;background:rgba(200,169,126,.15);display:flex;align-items:center;justify-content:center;color:var(--gold)">
          ${C().icon('check', 28)}
        </div>
        <span class="eyebrow" style="color:var(--gold)">Enquiry Received</span>
        <h3>Thank you for reaching out!</h3>
        <p class="dim" style="margin-top:.5rem;margin-bottom:1.5rem">
          Your enquiry regarding <strong>${escapeHtml(data.topic)}</strong> has been received. Our team will review it and reply to <strong>${escapeHtml(data.email)}</strong> or call you.
        </p>
        <a class="btn btn--gold" href="/">Return to Store</a>
      </div>`;
    } catch (err) {
      window.Site.toastErr(err.message || 'Could not submit your message.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  }

  async function init() {
    const topicQuery = BFV.query.get('topic');
    const refQuery = BFV.query.get('ref');

    try {
      const data = await get('/contact');
      const topicSelect = document.getElementById('contactTopic');
      if (topicSelect && data.topics) {
        topicSelect.innerHTML = data.topics
          .map((t) => `<option value="${escapeHtml(t)}" ${topicQuery && topicQuery.toLowerCase() === t.toLowerCase() ? 'selected' : ''}>${escapeHtml(t)}</option>`)
          .join('');
      }
    } catch (err) {
      /* ignore */
    }

    const form = document.getElementById('contactForm');
    if (form) {
      if (refQuery && form.message && !form.message.value) {
        form.message.value = `Regarding reference: ${refQuery}\n\n`;
      }
      form.addEventListener('submit', handleContactSubmit);
    }
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.contact = init;
})(window.BFV);
