/* ==========================================================================
   Checkout page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { escapeHtml, money, state, storage, post } = BFV;
  const C = () => window.Components;

  const els = {};
  let deliveryMethod = 'pickup';
  let paymentMethod = 'transfer';

  function prefill() {
    const saved = storage.get(BFV.LS_KEYS.buyer, {}) || {};
    const user = state.user || {};
    const address = (user.addresses && user.addresses[0]) || {};

    return {
      name: user.name || saved.name || '',
      email: user.email || saved.email || '',
      phone: user.phone || saved.phone || address.phone || '',
      addressLine1: address.line1 || saved.addressLine1 || '',
      addressLine2: address.line2 || saved.addressLine2 || '',
      city: address.city || saved.city || '',
      state: address.state || saved.state || '',
      notes: saved.notes || ''
    };
  }

  function deliveryMarkup(options) {
    if (!options || !options.length) {
      options = [
        { id: 'pickup', label: 'Store pickup', fee: 0, note: 'Collect at our physical store (free)' },
        { id: 'within-city', label: 'Same-day city delivery', fee: 2500, note: 'Direct dispatch within the city' },
        { id: 'nationwide', label: 'Nationwide shipping', fee: 5500, note: '2–5 business days' }
      ];
    }
    return options
      .map(
        (o) => `
      <label class="option-card ${o.id === deliveryMethod ? 'is-selected' : ''}">
        <input type="radio" name="deliveryMethod" value="${escapeHtml(o.id)}"
               ${o.id === deliveryMethod ? 'checked' : ''}>
        <span class="option-card__body">
          <span class="option-card__title">
            <span>${escapeHtml(o.label)}</span>
            <span class="option-card__fee">${o.fee ? money(o.fee) : 'Free'}</span>
          </span>
          <span class="option-card__note">${escapeHtml(o.note)}</span>
        </span>
      </label>`
      )
      .join('');
  }

  function paymentMarkup() {
    const methods = (state.commerce && state.commerce.paymentMethods) || [
      { id: 'transfer', label: 'Bank Transfer', note: 'Account details provided on confirmation' },
      { id: 'pos', label: 'POS / Cash on Delivery', note: 'Pay our delivery rider or at the counter' }
    ];
    return methods
      .map(
        (m, i) => `
      <label class="option-card ${m.id === paymentMethod ? 'is-selected' : ''}">
        <input type="radio" name="paymentMethod" value="${escapeHtml(m.id)}" ${m.id === paymentMethod ? 'checked' : ''}>
        <span class="option-card__body">
          <span class="option-card__title"><span>${escapeHtml(m.label)}</span></span>
          <span class="option-card__note">${escapeHtml(m.note)}</span>
        </span>
      </label>`
      )
      .join('');
  }

  function orderLines() {
    const cart = state.cart;
    if (!cart || !cart.items.length) return '<p class="dim">Your cart is empty.</p>';
    return cart.items
      .map(
        (i) => `
      <div class="check-line">
        <img src="${escapeHtml(i.image)}" alt="${escapeHtml(i.name)}" loading="lazy">
        <div class="check-line__body">
          <div class="check-line__name">${escapeHtml(i.name)}</div>
          <div class="check-line__meta">${i.qty} × ${money(i.price)} ${escapeHtml(i.unit || '')}</div>
        </div>
        <strong class="gold">${money(i.price * i.qty)}</strong>
      </div>`
      )
      .join('');
  }

  function summaryMarkup() {
    const summary = state.summary || {};
    const remaining = Math.max(0, (summary.freeDeliveryThreshold || 0) - (summary.subtotal || 0));

    return `
    <div class="summary">
      <h3>Your order</h3>
      ${orderLines()}
      <hr class="divider" style="margin:1rem 0">
      <div class="summary__row"><span>Subtotal</span><span>${money(summary.subtotal || 0)}</span></div>
      <div class="summary__row">
        <span>${escapeHtml(summary.deliveryLabel || 'Delivery')}</span>
        <span>${summary.deliveryFee ? money(summary.deliveryFee) : 'Free'}</span>
      </div>
      <div class="summary__row summary__row--total">
        <span>Total</span><strong>${money(summary.total || 0)}</strong>
      </div>
      ${
        remaining > 0
          ? `<p class="summary__note">${money(remaining)} more for free delivery.</p>`
          : '<p class="summary__note" style="color:var(--success)">Free delivery applied.</p>'
      }
      <p class="summary__note">
        You will be called on the phone number you provide to confirm this order.
      </p>
    </div>`;
  }

  function successMarkup(order, timeline, whatsapp) {
    const lines = (order.items || [])
      .map(
        (i) => `
      <div class="summary__row" style="padding:.4rem 0">
        <span>${escapeHtml(i.name)} × ${i.qty}</span>
        <strong>${money(i.lineTotal || i.price * i.qty)}</strong>
      </div>`
      )
      .join('');

    const timelineHtml = (timeline || [])
      .map(
        (t) => `
      <div class="timeline__step ${t.done ? 'is-done' : ''} ${t.current ? 'is-current' : ''}">
        <div class="timeline__marker"></div>
        <div class="timeline__content">
          <strong>${escapeHtml(t.label)}</strong>
          <small class="dim">${escapeHtml(t.description || '')}</small>
        </div>
      </div>`
      )
      .join('');

    return `
    <div class="checkout-success card" style="max-width:680px;margin:2rem auto;padding:2.5rem;text-align:center">
      <div style="width:64px;height:64px;margin:0 auto 1.2rem;border-radius:50%;background:rgba(200,169,126,.15);display:flex;align-items:center;justify-content:center;color:var(--gold)">
        ${C().icon('check', 32)}
      </div>
      <span class="eyebrow" style="color:var(--gold)">Order Placed Successfully</span>
      <h2 style="margin:.5rem 0 1rem">Thank you for your order!</h2>
      <p class="dim" style="margin-bottom:1.5rem">
        Your order reference is <strong class="gold" style="font-size:1.2rem;letter-spacing:1px">${escapeHtml(
          order.reference
        )}</strong>.
        A confirmation has been recorded and our team will call you shortly on <strong>${escapeHtml(
          order.customer.phone
        )}</strong>.
      </p>

      ${
        whatsapp
          ? `<a class="btn btn--gold btn--lg" href="${escapeHtml(
              whatsapp
            )}" target="_blank" rel="noopener" style="width:100%;margin-bottom:1.5rem">
          ${C().icon('whatsapp', 18)} Confirm on WhatsApp in One Tap
        </a>`
          : ''
      }

      <div class="timeline" style="margin:2rem 0;text-align:left">
        ${timelineHtml}
      </div>

      <div class="summary" style="text-align:left;margin-bottom:2rem">
        <h4>Order Details</h4>
        ${lines}
        <hr class="divider" style="margin:.8rem 0">
        <div class="summary__row"><span>Delivery Method</span><span>${escapeHtml(
          order.pricing ? order.pricing.deliveryLabel : ''
        )}</span></div>
        <div class="summary__row"><span>Payment</span><span>${escapeHtml(
          order.payment ? order.payment.label : 'Bank Transfer'
        )}</span></div>
        <div class="summary__row summary__row--total"><span>Total</span><strong>${money(
          order.pricing ? order.pricing.total : 0
        )}</strong></div>
      </div>

      <div class="row" style="justify-content:center;gap:1rem">
        <a class="btn btn--ghost" href="/shop">Continue Shopping</a>
        <a class="btn btn--ghost" href="/account">Go to My Account</a>
      </div>
    </div>`;
  }

  async function onDeliveryChange(e) {
    const radio = e.target.closest('input[name="deliveryMethod"]');
    if (!radio) return;
    deliveryMethod = radio.value;

    document.querySelectorAll('input[name="deliveryMethod"]').forEach((input) => {
      const card = input.closest('.option-card');
      if (card) card.classList.toggle('is-selected', input.checked);
    });

    try {
      const res = await post('/cart/delivery', { deliveryMethod });
      if (res.summary) {
        state.summary = res.summary;
        if (els.summary) els.summary.innerHTML = summaryMarkup();
      }
    } catch (err) {
      window.Site.toastErr(err.message);
    }
  }

  function onPaymentChange(e) {
    const radio = e.target.closest('input[name="paymentMethod"]');
    if (!radio) return;
    paymentMethod = radio.value;

    document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
      const card = input.closest('.option-card');
      if (card) card.classList.toggle('is-selected', input.checked);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    const data = {
      name: (form.name.value || '').trim(),
      email: (form.email.value || '').trim(),
      phone: (form.phone.value || '').trim(),
      addressLine1: (form.addressLine1.value || '').trim(),
      addressLine2: (form.addressLine2 ? form.addressLine2.value : '').trim(),
      city: (form.city.value || '').trim(),
      state: (form.state.value || '').trim(),
      deliveryMethod,
      paymentMethod,
      notes: (form.notes ? form.notes.value : '').trim()
    };

    if (!data.name) return window.Site.toastErr('Please provide your full name.');
    if (!data.email || !data.email.includes('@')) return window.Site.toastErr('Please provide a valid email.');
    if (!data.phone || data.phone.length < 7) return window.Site.toastErr('Please provide a valid phone number.');

    storage.set(BFV.LS_KEYS.buyer, data);

    const origText = btn ? btn.innerHTML : 'Place Order';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Processing order…';
    }

    try {
      const res = await post('/orders', data);
      if (res.ok) {
        /* Update cart state to empty */
        state.cart = { items: [] };
        state.summary = { itemCount: 0, subtotal: 0, total: 0 };
        state.cartCount = 0;
        window.Site.syncBadges();
        window.Site.renderCartDrawer();

        const host = document.getElementById('checkoutHost') || document.querySelector('main');
        if (host) {
          host.innerHTML = successMarkup(res.order, res.timeline, res.whatsapp);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      window.Site.toastErr(err.message || 'Could not place order. Please check your details.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  }

  async function init() {
    els.host = document.getElementById('checkoutHost');
    els.summary = document.getElementById('checkoutSummary');
    els.form = document.getElementById('checkoutForm');
    els.delivery = document.getElementById('deliveryOptions');
    els.payment = document.getElementById('paymentOptions');

    if (!state.cart || !state.cart.items || !state.cart.items.length) {
      if (els.host) {
        els.host.innerHTML = `
        <div class="container" style="padding:4rem 1rem;text-align:center">
          ${C().emptyState('Your cart is empty', 'Add items from our fashion, appliance or gas departments before checking out.', {
            href: '/shop',
            label: 'Explore Store'
          })}
        </div>`;
      }
      return;
    }

    const pre = prefill();
    if (els.form) {
      if (els.form.name) els.form.name.value = pre.name;
      if (els.form.email) els.form.email.value = pre.email;
      if (els.form.phone) els.form.phone.value = pre.phone;
      if (els.form.addressLine1) els.form.addressLine1.value = pre.addressLine1;
      if (els.form.addressLine2) els.form.addressLine2.value = pre.addressLine2;
      if (els.form.city) els.form.city.value = pre.city;
      if (els.form.state) els.form.state.value = pre.state;
      if (els.form.notes) els.form.notes.value = pre.notes;
      els.form.addEventListener('submit', onSubmit);
    }

    if (els.delivery) {
      const opts = (state.summary && state.summary.options) || [];
      els.delivery.innerHTML = deliveryMarkup(opts);
      els.delivery.addEventListener('change', onDeliveryChange);
    }

    if (els.payment) {
      els.payment.innerHTML = paymentMarkup();
      els.payment.addEventListener('change', onPaymentChange);
    }

    if (els.summary) {
      els.summary.innerHTML = summaryMarkup();
    }
  }

  window.BFVCheckout = { prefill, deliveryMarkup, paymentMarkup, orderLines, summaryMarkup, els: () => els };
  window.BFVPages = window.BFVPages || {};
  window.BFVPages.checkout = init;
})(window.BFV);