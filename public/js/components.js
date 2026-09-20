/* ==========================================================================
   Biofran Ventures — shared markup builders (product & property cards)
   Exposes window.Components
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { escapeHtml, money, stars } = BFV;
  const icon = (n, s, c) => window.Site.icon(n, s, c);

  function badgeFor(product) {
    if (product.badge) {
      const cls =
        product.badge === 'Best Seller' || product.badge === 'Trending'
          ? 'badge--new'
          : product.badge === 'Store Service' || product.badge === 'Camping'
            ? 'badge--gas'
            : '';
      return `<span class="badge ${cls}">${escapeHtml(product.badge)}</span>`;
    }
    if (product.discountPercent > 0) {
      return `<span class="badge badge--sale">-${product.discountPercent}%</span>`;
    }
    return '';
  }

  function stockNote(product) {
    if (product.category === 'gas-refill') return 'Refill service — always available';
    if (product.stock === 0) return 'Currently out of stock';
    if (product.stock <= 5) return `Only ${product.stock} left in stock`;
    return 'In stock';
  }

  /**
   * Product card markup.
   * @param {object} p    product document
   * @param {object} opts { showActions: boolean }
   */
  function productCard(p, opts = {}) {
    const showActions = opts.showActions !== false;
    const galleryJson = escapeHtml(JSON.stringify(p.gallery || []));

    return `
    <article class="card" data-product="${escapeHtml(p.slug)}">
      <a class="card__media" href="${escapeHtml(BFV.productUrl(p.slug))}" aria-label="${escapeHtml(p.name)}">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" width="600" height="600">
      </a>

      <div class="card__badges">${badgeFor(p)}</div>

      <div class="card__tools">
        <button class="card__tool" type="button" title="Preview image"
                data-preview="${escapeHtml(p.preview)}"
                data-preview-name="${escapeHtml(p.name)}"
                data-preview-sub="${escapeHtml(p.categoryLabel)} · high resolution preview"
                data-gallery="${galleryJson}"
                aria-label="Preview ${escapeHtml(p.name)}">
          ${icon('search', 16)}
        </button>
        <button class="card__tool" type="button" title="Add to cart"
                data-add="${escapeHtml(p.slug)}" aria-label="Add ${escapeHtml(p.name)} to cart">
          ${icon('plus', 16)}
        </button>
      </div>

      <div class="card__body">
        <div class="card__cat">${escapeHtml(p.categoryLabel)}</div>
        <a class="card__title" href="${escapeHtml(BFV.productUrl(p.slug))}">${escapeHtml(p.name)}</a>

        <div class="card__rating">
          <span class="stars" aria-hidden="true">${stars(p.rating)}</span>
          <span>${Number(p.rating).toFixed(1)} · ${p.reviews} reviews</span>
        </div>

        <div class="card__price-row">
          <span class="card__price">${money(p.price)}</span>
          ${p.oldPrice && p.oldPrice > p.price ? `<span class="card__old">${money(p.oldPrice)}</span>` : ''}
          <span class="card__unit">${escapeHtml(p.unit || '')}</span>
        </div>

        ${
          showActions
            ? `<div class="card__actions">
          <button class="btn btn--gold btn--sm" type="button" data-add="${escapeHtml(p.slug)}">
            ${icon('cart', 15)} Add to cart
          </button>
          <a class="btn btn--ghost btn--sm" href="${escapeHtml(BFV.productUrl(p.slug))}">Details</a>
        </div>`
            : ''
        }

        <div class="dim" style="font-size:.74rem;margin-top:.6rem">${escapeHtml(stockNote(p))}</div>
      </div>
    </article>`;
  }

  const productCards = (list, opts) => list.map((p) => productCard(p, opts)).join('');

  window.Components = { productCard, productCards, badgeFor, stockNote, icon };

  /* -------------------------------------------------------- property card */

  function propertyCard(p) {
    const galleryJson = escapeHtml(JSON.stringify(p.gallery || []));
    const priceLine =
      p.priceUnit === 'one-off'
        ? money(p.price)
        : `${money(p.price)}<small> ${escapeHtml(p.priceUnit)}</small>`;

    return `
    <article class="card card--property" data-property="${escapeHtml(p.slug)}">
      <a class="card__media" href="${escapeHtml(BFV.propertyUrl(p.slug))}" aria-label="${escapeHtml(p.title)}">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy" width="800" height="600">
      </a>

      <div class="card__badges">
        <span class="badge">${escapeHtml(p.purpose)}</span>
        ${p.featured ? '<span class="badge badge--new">Featured</span>' : ''}
      </div>

      <div class="card__tools">
        <button class="card__tool" type="button" title="Preview images"
                data-preview="${escapeHtml(p.preview)}"
                data-preview-name="${escapeHtml(p.title)}"
                data-preview-sub="${escapeHtml(`${p.purpose} · ${p.area}, ${p.city}`)}"
                data-gallery="${galleryJson}"
                aria-label="Preview ${escapeHtml(p.title)}">
          ${icon('search', 16)}
        </button>
      </div>

      <div class="card__body">
        <div class="card__cat">${escapeHtml(p.type)}</div>
        <a class="card__title" href="${escapeHtml(BFV.propertyUrl(p.slug))}">${escapeHtml(p.title)}</a>

        <div class="card__meta">
          <span>${icon('building', 14)} ${escapeHtml(p.area)}, ${escapeHtml(p.city)}</span>
          ${p.bedrooms ? `<span>${icon('box', 14)} ${p.bedrooms} bedrooms</span>` : ''}
          ${p.bathrooms ? `<span>${p.bathrooms} baths</span>` : ''}
          ${p.size ? `<span>${escapeHtml(p.size)}</span>` : ''}
        </div>

        <div class="card__price-row">
          <span class="price-tag">${priceLine}</span>
        </div>

        <div class="card__actions">
          <a class="btn btn--gold btn--sm" href="${escapeHtml(BFV.propertyUrl(p.slug))}">View property</a>
          <a class="btn btn--ghost btn--sm"
             href="/contact?topic=${encodeURIComponent('Property inspection')}&ref=${encodeURIComponent(p.reference)}">
            Book inspection
          </a>
        </div>
      </div>
    </article>`;
  }

  const propertyCards = (list) => list.map(propertyCard).join('');

  /* -------------------------------------------------------------- generic */

  function emptyState(title, text, cta) {
    return `
    <div class="empty">
      ${icon('search', 34)}
      <h3>${escapeHtml(title)}</h3>
      <p class="dim">${escapeHtml(text)}</p>
      ${
        cta
          ? `<a class="btn btn--gold" href="${escapeHtml(cta.href)}" style="margin-top:.8rem">${escapeHtml(cta.label)}</a>`
          : ''
      }
    </div>`;
  }

  const loading = (label = 'items') => `<div class="spinner"></div><p class="center dim">Loading ${escapeHtml(label)}…</p>`;

  /* --------------------------------------------------------- add-to-cart */

  function bindAddToCart() {
    document.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-add]');
      if (!button) return;
      event.preventDefault();

      const slug = button.dataset.add;
      const original = button.innerHTML;
      button.disabled = true;
      button.innerHTML = 'Adding…';

      try {
        await BFV.addToCart(slug, 1);
        window.Site.openCartDrawer();
      } catch (err) {
        window.Site.toastErr(err.message);
      } finally {
        button.disabled = false;
        button.innerHTML = original;
      }
    });
  }

  bindAddToCart();

  window.Components = {
    productCard,
    productCards,
    propertyCard,
    propertyCards,
    emptyState,
    loading,
    badgeFor,
    stockNote,
    icon
  };
})(window.BFV);