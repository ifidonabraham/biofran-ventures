/* ==========================================================================
   Gas services & refill page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, post, escapeHtml, money } = BFV;
  const C = () => window.Components;

  const CYLINDERS = [
    { size: '3kg', name: '3kg Camp Cylinder Refill', price: 3800, slug: '3kg-cooking-gas-refill', note: 'Single-burner camp cylinders' },
    { size: '6kg', name: '6kg Gas Cylinder Refill', price: 7500, slug: '6kg-cooking-gas-refill', note: 'Small household cylinder' },
    { size: '12.5kg', name: '12.5kg Cooking Gas Refill', price: 15500, slug: '12-5kg-cooking-gas-refill', note: 'Standard family size (Most popular)' },
    { size: '50kg', name: '50kg Commercial Gas Refill', price: 62000, slug: '50kg-commercial-cooking-gas-refill', note: 'Bakeries, hotels & restaurants' }
  ];

  let selectedCylinder = CYLINDERS[2]; // default 12.5kg

  function renderCalculator() {
    const host = document.getElementById('cylinderOptions');
    if (!host) return;

    host.innerHTML = CYLINDERS.map(
      (c) => `
      <div class="option-card ${c.size === selectedCylinder.size ? 'is-selected' : ''}" data-cylinder="${escapeHtml(c.size)}" style="cursor:pointer">
        <div class="option-card__body">
          <div class="option-card__title">
            <span style="font-size:1.1rem;font-weight:600">${escapeHtml(c.name)}</span>
            <span class="gold" style="font-size:1.15rem;font-weight:700">${money(c.price)}</span>
          </div>
          <div class="option-card__note">${escapeHtml(c.note)}</div>
        </div>
      </div>`
    ).join('');

    const priceEl = document.getElementById('calcSelectedPrice');
    if (priceEl) priceEl.textContent = money(selectedCylinder.price);

    const nameEl = document.getElementById('calcSelectedName');
    if (nameEl) nameEl.textContent = selectedCylinder.name;

    const addBtn = document.getElementById('calcAddToCart');
    if (addBtn) addBtn.dataset.add = selectedCylinder.slug;
  }

  async function handleRefillBooking(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn ? btn.innerHTML : 'Book Gas Refill';

    const data = {
      name: (form.name.value || '').trim(),
      email: (form.email.value || '').trim(),
      phone: (form.phone.value || '').trim(),
      cylinder: form.cylinder.value || selectedCylinder.size,
      mode: form.mode ? form.mode.value : 'pickup',
      address: form.address ? (form.address.value || '').trim() : '',
      message: form.message ? (form.message.value || '').trim() : ''
    };

    if (!data.name || !data.phone) {
      return window.Site.toastErr('Please provide your name and phone number.');
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Sending booking…';
    }

    try {
      const res = await post('/gas-enquiry', data);
      window.Site.toastOk(res.message || 'Gas refill booked successfully.');

      const host = document.getElementById('gasFormHost');
      if (host) {
        host.innerHTML = `
        <div class="card" style="padding:2rem;text-align:center;border-color:var(--gold)">
          <div style="width:52px;height:52px;margin:0 auto 1rem;border-radius:50%;background:rgba(200,169,126,.15);display:flex;align-items:center;justify-content:center;color:var(--gold)">
            ${C().icon('flame', 28)}
          </div>
          <span class="eyebrow" style="color:var(--gold)">Refill Booking Received</span>
          <h3>We have reserved your refill slot!</h3>
          <p class="dim" style="margin-bottom:1.5rem">
            Our gas technician will prepare for your <strong>${escapeHtml(data.cylinder)}</strong> cylinder.
            For immediate delivery assistance, reach our direct gas desk:
          </p>
          <div class="row" style="justify-content:center;gap:1rem;flex-wrap:wrap">
            <a class="btn btn--gold" href="tel:${escapeHtml(res.gasPhone || '08141256339')}">
              ${C().icon('phone', 16)} Call Gas Desk: ${escapeHtml(res.gasPhone || '08141256339')}
            </a>
            <a class="btn btn--ghost" href="/gas">Book Another</a>
          </div>
        </div>`;
      }
    } catch (err) {
      window.Site.toastErr(err.message || 'Could not submit booking.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  }

  async function loadGasProducts() {
    const host = document.getElementById('gasProductsGrid');
    if (!host) return;

    try {
      const res = await get('/products?group=gas&limit=8');
      if (res.products && res.products.length) {
        host.innerHTML = C().productCards(res.products);
      } else {
        host.innerHTML = C().emptyState('No accessories found', 'Check back shortly.');
      }
    } catch (err) {
      host.innerHTML = `<p class="dim">${escapeHtml(err.message)}</p>`;
    }
  }

  async function init() {
    renderCalculator();

    const calcHost = document.getElementById('cylinderOptions');
    if (calcHost) {
      calcHost.addEventListener('click', (e) => {
        const card = e.target.closest('[data-cylinder]');
        if (!card) return;
        const size = card.dataset.cylinder;
        const found = CYLINDERS.find((c) => c.size === size);
        if (found) {
          selectedCylinder = found;
          renderCalculator();
          const cylinderSelect = document.getElementById('bookingCylinder');
          if (cylinderSelect) cylinderSelect.value = size;
        }
      });
    }

    const bookingForm = document.getElementById('gasBookingForm');
    if (bookingForm) bookingForm.addEventListener('submit', handleRefillBooking);

    await loadGasProducts();
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.gas = init;
})(window.BFV);
