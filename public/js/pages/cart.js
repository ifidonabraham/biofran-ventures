/* ==========================================================================
   Cart page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { escapeHtml, money, state } = BFV;
  const C = () => window.Components;

  const els = {};

  function lineMarkup(item) {
    return `
    <div class="cart-row" data-item="${escapeHtml(item.id)}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
      <div>
        <a class="cart-row__name" href="${escapeHtml(BFV.productUrl(item.slug))}">${escapeHtml(item.name)}</a>
        <div class="cart-row__cat">${escapeHtml(item.categoryLabel || item.category)}</div>
        <div class="dim" style="font-size:.8rem;margin-top:.3rem">
          ${money(item.price)} ${escapeHtml(item.unit || '')}
        </div>
        <div class="row" style="margin-top:.7rem;gap:.6rem">
          <div class="qty">
            <button type="button" data-dec="${escapeHtml(item.id)}" aria-label="Decrease quantity">−</button>
            <input type="number" min="1" max="99" value="${item.qty}" data-qty="${escapeHtml(item.id)}"
                   aria-label="Quantity for ${escapeHtml(item.name)}">
            <button type="button" data-inc="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn--ghost btn--sm" type="button" data-remove="${escapeHtml(item.id)}">
            ${C().icon('trash', 14)} Remove
          </button>
          <button class="preview-link" type="button"
                  data-preview="${escapeHtml(item.preview || item.image)}"
                  data-preview-name="${escapeHtml(item.name)}"
                  data-preview-sub="Product preview">
            ${C().icon('search', 14)} Preview
          </button>
        </div>
      </div>
      <div class="cart-row__side">
        <div class="cart-row__price">${money(item.price * item.qty)}</div>
      </div>
    </div>`;
  }

  function summaryMarkup(summary) {
    const remaining = Math.max(0, (summary.freeDeliveryThreshold || 0) - summary.subtotal);
    const phones = (state.site && state.site.contacts && state.site.contacts.phones) || [];
    const helpPhone = phones[0] ? phones[0].number : '08037211227';

    return `
    <div class="summary">
      <h3>Order summary</h3>

      <div class="summary__row">
        <span>Items (${summary.itemCount})</span><span>${money(summary.subtotal)}</span>
      </div>

      <div class="field" style="margin:1rem 0">
        <label for="cartDelivery">Delivery method</label>
        <select class="select" id="cartDelivery">
          ${summary.options
            .map(
              (o) =>
                `<option value="${escapeHtml(o.id)}" ${o.id === summary.deliveryId ? 'selected' : ''}>
                   ${escapeHtml(o.label)} — ${o.fee ? money(o.fee) : 'Free'}
                 </option>`
            )
            .join('')}
        </select>
      </div>

      <div class="summary__row">
        <span>${escapeHtml(summary.deliveryLabel)}</span>
        <span>${summary.deliveryFee ? money(summary.deliveryFee) : 'Free'}</span>
      </div>

      <div class="summary__row summary__row--total">
        <span>Total</span><strong>${money(summary.total)}</strong>
      </div>

      ${
        remaining > 0
          ? `<p class="summary__note">Add ${money(remaining)} more to qualify for free delivery.</p>`
          : `<p class="summary__note" style="color:var(--success)">
               You qualify for free delivery on this order.
             </p>`
      }

      <a class="btn btn--gold btn--block" href="/checkout" style="margin-top:1.1rem">Proceed to checkout</a>
      <a class="btn btn--ghost btn--block" href="/shop" style="margin-top:.6rem">Continue shopping</a>

      <p class="summary__note">
        Need help? Call ${escapeHtml(helpPhone)} — we can complete the order for you.
      </p>
    </div>`;
  }

  function render() {
    const cart = state.cart;
    const summary = state.summary;
    if (!els.list || !els.summary) return;

    if (!cart || !cart.items.length) {
      els.list.innerHTML = C().emptyState(
        'Your cart is empty',
        'Browse fashion, home appliances or book a gas refill to get started.',
        { href: '/shop', label: 'Start shopping' }
      );
      els.summary.innerHTML = `
        <div class="summary">
          <h3>Order summary</h3>
          <p class="dim">Nothing in the cart yet.</p>
          <a class="btn btn--gold btn--block" href="/shop">Browse products</a>
          <a class="btn btn--ghost btn--block" href="/gas" style="margin-top:.6rem">Book a gas refill</a>
        </div>`;
      return;
    }

    els.list.innerHTML = `<div class="cart-list">${cart.items.map(lineMarkup).join('')}</div>`;
    els.summary.innerHTML = summaryMarkup(summary);

    const title = document.getElementById('cartTitle');
    if (title) {
      title.textContent = `Your cart — ${cart.items.length} item${cart.items.length === 1 ? '' : 's'}`;
    }

    const delivery = document.getElementById('cartDelivery');
    if (delivery) {
      delivery.addEventListener('change', async () => {
        try {
          const data = await BFV.post('/cart/delivery', { deliveryMethod: delivery.value });
          state.summary = data.summary;
          render();
        } catch (err) {
          window.Site.toastErr(err.message);
        }
      });
    }
  }

  async function refresh() {
    const data = await BFV.loadCart();
    state.summary = data.summary;
    render();
  }

  window.BFVCart = { lineMarkup, summaryMarkup, render, refresh, els: () => els };

  /* -------------------------------------------------------------- events */

  function bind() {
    document.addEventListener('click', async (event) => {
      const inc = event.target.closest('[data-inc]');
      const dec = event.target.closest('[data-dec]');
      const remove = event.target.closest('[data-remove]');
      const clear = event.target.closest('#clearCart');

      if (clear) {
        event.preventDefault();
        if (!window.confirm('Remove every item from your cart?')) return;
        try {
          await BFV.del('/cart');
          await refresh();
          window.Site.toastOk('Your cart is now empty.');
        } catch (err) {
          window.Site.toastErr(err.message);
        }
        return;
      }

      if (!inc && !dec && !remove) return;
      event.preventDefault();

      const items = (state.cart && state.cart.items) || [];

      try {
        if (remove) {
          await BFV.removeCartItem(remove.dataset.remove);
          window.Site.toastOk('Item removed.');
        } else {
          const id = inc ? inc.dataset.inc : dec.dataset.dec;
          const line = items.find((i) => i.id === id);
          if (!line) return;
          const next = inc ? line.qty + 1 : line.qty - 1;
          if (next < 1) await BFV.removeCartItem(id);
          else await BFV.setCartQuantity(id, next);
        }
        await refresh();
      } catch (err) {
        window.Site.toastErr(err.message);
      }
    });

    document.addEventListener(
      'change',
      async (event) => {
        const input = event.target.closest('[data-qty]');
        if (!input) return;
        try {
          await BFV.setCartQuantity(input.dataset.qty, Number(input.value) || 1);
          await refresh();
        } catch (err) {
          window.Site.toastErr(err.message);
        }
      },
      true
    );
  }

  async function init() {
    els.list = document.getElementById('cartItems');
    els.summary = document.getElementById('cartSummary');
    bind();
    await refresh();
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.cart = init;
})(window.BFV);