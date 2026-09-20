/* ==========================================================================
   Account page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, post, put, escapeHtml, money, state } = BFV;
  const C = () => window.Components;

  function renderOrderCard(order) {
    const items = (order.items || [])
      .map(
        (i) => `
      <div style="display:flex;align-items:center;gap:.8rem;padding:.4rem 0">
        <img src="${escapeHtml(i.image)}" alt="${escapeHtml(i.name)}" style="width:40px;height:40px;border-radius:4px;object-fit:cover">
        <div style="flex:1">
          <div style="font-weight:500">${escapeHtml(i.name)}</div>
          <small class="dim">${i.qty} × ${money(i.price)}</small>
        </div>
        <strong>${money(i.lineTotal || i.price * i.qty)}</strong>
      </div>`
      )
      .join('');

    const timeline = order.history || [];
    const lastNote = timeline.length ? timeline[timeline.length - 1].note : '';

    return `
    <div class="card" style="padding:1.5rem;margin-bottom:1.5rem">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.8rem">
        <div>
          <span class="eyebrow" style="margin-bottom:.2rem">Reference: <strong class="gold">${escapeHtml(order.reference)}</strong></span>
          <div class="dim" style="font-size:.82rem">${BFV.dateTimeText(order.createdAt)}</div>
        </div>
        <div>
          ${window.Site.statusPill(order.status, order.statusLabel)}
        </div>
      </div>

      <div style="border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:.8rem 0;margin:.8rem 0">
        ${items}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <div>
          <span class="dim" style="font-size:.85rem">Total: </span>
          <strong class="gold" style="font-size:1.1rem">${money(order.pricing ? order.pricing.total : 0)}</strong>
          ${lastNote ? `<p class="dim" style="font-size:.78rem;margin-top:.2rem">Note: ${escapeHtml(lastNote)}</p>` : ''}
        </div>
        <div class="row" style="gap:.6rem">
          <a class="btn btn--ghost btn--sm" href="/contact?topic=${encodeURIComponent('Order inquiry')}&ref=${encodeURIComponent(order.reference)}">
            Need Help?
          </a>
        </div>
      </div>
    </div>`;
  }

  async function loadOrders() {
    const listHost = document.getElementById('accountOrders');
    if (!listHost) return;

    try {
      const res = await get('/orders/mine');
      if (res.orders && res.orders.length) {
        listHost.innerHTML = res.orders.map(renderOrderCard).join('');
      } else {
        listHost.innerHTML = C().emptyState('No orders yet', 'You have not placed any orders from your account.', {
          href: '/shop',
          label: 'Start shopping'
        });
      }
    } catch (err) {
      listHost.innerHTML = `<p class="dim">Could not load orders: ${escapeHtml(err.message)}</p>`;
    }
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const name = (form.name.value || '').trim();
    const phone = (form.phone.value || '').trim();

    try {
      const res = await put('/auth/profile', { name, phone });
      window.Site.toastOk(res.message || 'Profile updated successfully.');
      state.user = res.user;
    } catch (err) {
      window.Site.toastErr(err.message || 'Failed to update profile.');
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form.currentPassword.value || '';
    const newPassword = form.newPassword.value || '';

    if (!currentPassword || !newPassword) {
      return window.Site.toastErr('Please provide both current and new password.');
    }

    try {
      const res = await put('/auth/password', { currentPassword, newPassword });
      window.Site.toastOk(res.message || 'Password changed successfully.');
      form.reset();
    } catch (err) {
      window.Site.toastErr(err.message || 'Failed to change password.');
    }
  }

  async function handleTrackOrder(e) {
    e.preventDefault();
    const form = e.target;
    const reference = (form.reference.value || '').trim();
    const email = (form.email.value || '').trim();
    const resultHost = document.getElementById('trackResult');

    if (!reference) return window.Site.toastErr('Please enter an order reference.');

    if (resultHost) resultHost.innerHTML = C().loading('order status');

    try {
      const qs = `reference=${encodeURIComponent(reference)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
      const res = await get(`/orders/track?${qs}`);
      if (res.ok && res.order) {
        const o = res.order;
        const timelineHtml = (res.timeline || [])
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

        if (resultHost) {
          resultHost.innerHTML = `
          <div class="card" style="padding:1.5rem;margin-top:1.5rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
              <div>
                <span class="eyebrow">Order Found</span>
                <h3>${escapeHtml(o.reference)}</h3>
              </div>
              <div>${window.Site.statusPill(o.status, o.statusLabel)}</div>
            </div>
            <div class="timeline" style="margin:1.5rem 0">${timelineHtml}</div>
            <div class="summary__row"><span>Total</span><strong>${money(o.pricing ? o.pricing.total : 0)}</strong></div>
            <div class="summary__row"><span>Delivery to</span><span>${escapeHtml(o.customer ? o.customer.city : '')}</span></div>
          </div>`;
        }
      }
    } catch (err) {
      if (resultHost) {
        resultHost.innerHTML = `<div class="card" style="padding:1.5rem;margin-top:1.5rem;border-color:var(--error)">
          <p style="color:var(--error);margin:0">${escapeHtml(err.message || 'Order not found. Please verify the reference and email.')}</p>
        </div>`;
      }
    }
  }

  async function handleLogout() {
    try {
      await post('/auth/logout');
      state.user = null;
      window.location.href = '/login';
    } catch (err) {
      window.location.href = '/login';
    }
  }

  async function init() {
    const user = state.user;
    const authOnlyEls = document.querySelectorAll('.is-auth-only');
    const guestOnlyEls = document.querySelectorAll('.is-guest-only');

    if (user) {
      authOnlyEls.forEach((el) => (el.style.display = ''));
      guestOnlyEls.forEach((el) => (el.style.display = 'none'));

      const greeting = document.getElementById('userGreeting');
      if (greeting) greeting.textContent = user.name ? `Hello, ${user.name.split(' ')[0]}!` : 'My Account';

      const profileForm = document.getElementById('profileForm');
      if (profileForm) {
        if (profileForm.name) profileForm.name.value = user.name || '';
        if (profileForm.email) profileForm.email.value = user.email || '';
        if (profileForm.phone) profileForm.phone.value = user.phone || '';
        profileForm.addEventListener('submit', handleProfileUpdate);
      }

      const passForm = document.getElementById('passwordForm');
      if (passForm) passForm.addEventListener('submit', handlePasswordChange);

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

      await loadOrders();
    } else {
      authOnlyEls.forEach((el) => (el.style.display = 'none'));
      guestOnlyEls.forEach((el) => (el.style.display = ''));
    }

    const trackForm = document.getElementById('trackOrderForm');
    if (trackForm) {
      trackForm.addEventListener('submit', handleTrackOrder);
      const ref = BFV.query.get('reference');
      const em = BFV.query.get('email');
      if (ref && trackForm.reference) trackForm.reference.value = ref;
      if (em && trackForm.email) trackForm.email.value = em;
      if (ref) trackForm.dispatchEvent(new Event('submit'));
    }
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.account = init;
})(window.BFV);
