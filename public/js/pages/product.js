/* ==========================================================================
   Product detail page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, escapeHtml, money, state } = BFV;
  const C = () => window.Components;

  let product = null;

  function galleryMarkup() {
    const gallery =
      product.gallery && product.gallery.length ? product.gallery : [{ url: product.image }];

    return `
    <div class="pd-gallery">
      <div class="pd-main">
        <img id="pdMainImage" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"
             width="900" height="900">
        <button class="card__tool" type="button" id="pdPreview" title="Open high resolution preview"
                style="position:absolute;top:1rem;right:1rem;width:42px;height:42px"
                data-preview="${escapeHtml(product.preview)}"
                data-preview-name="${escapeHtml(product.name)}"
                data-preview-sub="${escapeHtml(product.categoryLabel)} · high resolution preview"
                data-gallery="${escapeHtml(JSON.stringify(gallery))}"
                aria-label="Open high resolution preview">
          ${C().icon('search', 18)}
        </button>
      </div>

      <div class="pd-thumbs" id="pdThumbs">
        ${gallery
          .map(
            (g, i) => `
          <img src="${escapeHtml(g.url)}" alt="${escapeHtml(g.label || `View ${i + 1}`)}"
               class="${i === 0 ? 'is-active' : ''}" loading="lazy"
               data-thumb="${escapeHtml(g.url)}" data-thumb-preview="${escapeHtml(g.preview || g.url)}">
        `
          )
          .join('')}
      </div>

      <p class="preview-link" style="justify-content:center;cursor:default">
        ${C().icon('search', 14)} Click any image for its matching high-resolution preview
      </p>
    </div>`;
  }

  function crumbsMarkup() {
    const category = product.categoryInfo || {};
    const group = product.groupInfo || {};
    return `
    <div class="crumbs">
      <a href="/">Home</a><span class="sep">/</span>
      <a href="${escapeHtml(BFV.shopUrl({ group: product.group }))}">${escapeHtml(group.title || 'Shop')}</a>
      <span class="sep">/</span>
      <a href="${escapeHtml(BFV.shopUrl({ category: product.category }))}">
        ${escapeHtml(category.title || product.categoryLabel)}
      </a>
      <span class="sep">/</span><span>${escapeHtml(product.name)}</span>
    </div>`;
  }

  function buyPanelMarkup(inStock) {
    return `
    <div class="pd-actions">
      <div class="qty">
        <button type="button" id="qtyDown" aria-label="Decrease quantity">−</button>
        <input type="number" id="qtyInput" value="1" min="1" max="99" aria-label="Quantity">
        <button type="button" id="qtyUp" aria-label="Increase quantity">+</button>
      </div>
      <button class="btn btn--gold" type="button" id="addBtn" ${inStock ? '' : 'disabled'}>
        ${C().icon('cart', 16)} Add to cart
      </button>
      <button class="btn btn--ghost" type="button" id="buyNow">Buy now</button>
    </div>

    <div class="notice notice--info">
      ${C().icon('truck', 16)}
      <span>${escapeHtml(product.deliveryNote || '')}</span>
    </div>

    <dl class="pd-meta">
      <div><dt>Category</dt><dd>${escapeHtml(product.categoryLabel)}</dd></div>
      <div><dt>Brand line</dt><dd>${escapeHtml(product.brand)}</dd></div>
      <div><dt>Availability</dt><dd>${escapeHtml(C().stockNote(product))}</dd></div>
      <div><dt>Sold as</dt><dd>${escapeHtml(product.unit || 'per unit')}</dd></div>
    </dl>`;
  }

  function tabPanelsMarkup() {
    const threshold = money((state.commerce && state.commerce.freeDeliveryThreshold) || 150000);

    return `
    <div class="tabs" role="tablist">
      <button class="tab is-active" type="button" data-tab="description">Description</button>
      <button class="tab" type="button" data-tab="features">What you get</button>
      <button class="tab" type="button" data-tab="specs">Specifications</button>
      <button class="tab" type="button" data-tab="delivery">Delivery &amp; returns</button>
    </div>

    <div class="tab-panel" data-panel="description">
      <p class="muted">${escapeHtml(product.description)}</p>
    </div>

    <div class="tab-panel hidden" data-panel="features">
      <ul class="feature-list">
        ${(product.features || [])
          .map((f) => `<li>${C().icon('check', 15)}<span>${escapeHtml(f)}</span></li>`)
          .join('')}
      </ul>
    </div>

    <div class="tab-panel hidden" data-panel="specs">
      <table class="spec-table">
        <tbody>
          ${Object.entries(product.specs || {})
            .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
            .join('')}
          <tr><th>SKU</th><td>${escapeHtml(product.sku)}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="tab-panel hidden" data-panel="delivery">
      <p class="muted">
        Free delivery on orders above ${threshold}. Choose pickup at our store, same-day delivery within
        the city, or nationwide courier at checkout.
      </p>
      <p class="muted">
        ${escapeHtml(product.deliveryNote || '')}
        Items can be returned within 7 days if unused and in the original packaging.
      </p>
      ${''}
    </div>`;
  }

  /* ------------------------------------------------------------- render */

  function render() {
    const host = document.getElementById('productDetail');
    if (!host) return;
    const inStock = product.stock > 0 || product.category === 'gas-refill';

    host.innerHTML = `
      <div class="container-wide">${crumbsMarkup()}</div>
      <div class="container-wide pd-layout">
        ${galleryMarkup()}
        <div>
          <div class="row" style="gap:.6rem;margin-bottom:.6rem">
            <span class="badge">${escapeHtml(product.brand)}</span>
            ${product.badge ? `<span class="badge badge--soft">${escapeHtml(product.badge)}</span>` : ''}
            <span class="dim" style="font-size:.76rem">SKU ${escapeHtml(product.sku)}</span>
          </div>

          <h1 class="pd-title">${escapeHtml(product.name)}</h1>

          <div class="row" style="gap:.7rem;margin-bottom:.8rem">
            <span class="stars">${BFV.stars(product.rating)}</span>
            <span class="dim" style="font-size:.84rem">
              ${Number(product.rating).toFixed(1)} · ${product.reviews} customer reviews
            </span>
          </div>

          <div class="pd-price">
            <span class="pd-price__now">${money(product.price)}</span>
            ${product.oldPrice > product.price ? `<span class="pd-price__was">${money(product.oldPrice)}</span>` : ''}
            ${product.discountPercent > 0 ? `<span class="pd-price__save">Save ${product.discountPercent}%</span>` : ''}
            <span class="dim" style="font-size:.8rem">${escapeHtml(product.unit || '')}</span>
          </div>

          <p class="muted">${escapeHtml(product.shortDescription || product.description)}</p>

          <div class="badge-list">
            <span class="badge ${inStock ? 'badge--new' : 'badge--sale'}">
              ${inStock ? 'In stock' : 'Out of stock'}
            </span>
            ${product.category === 'gas-refill' ? '<span class="badge badge--gas">Physical store refill</span>' : ''}
            <span class="badge badge--soft">${escapeHtml(product.categoryLabel)}</span>
          </div>

          ${buyPanelMarkup(inStock)}
          ${tabPanelsMarkup()}
        </div>
      </div>`;
  }

  function paintThumbs(activeUrl, previewUrl) {
    const main = document.getElementById('pdMainImage');
    if (main) main.src = previewUrl || activeUrl;
    document.querySelectorAll('#pdThumbs img').forEach((img) => {
      img.classList.toggle('is-active', img.dataset.thumb === activeUrl);
    });
  }

  function renderRelated(list) {
    const host = document.getElementById('relatedProducts');
    if (!host) return;
    host.innerHTML = list.length
      ? C().productCards(list)
      : '<p class="dim">No related products yet.</p>';
  }

  /* -------------------------------------------------------------- events */

  function bind() {
    document.addEventListener('click', (event) => {
      const thumb = event.target.closest('#pdThumbs img[data-thumb]');
      if (thumb) {
        paintThumbs(thumb.dataset.thumb, thumb.dataset.thumbPreview);
        return;
      }

      const tab = event.target.closest('[data-tab]');
      if (tab) {
        document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
        const name = tab.dataset.tab;
        document.querySelectorAll('[data-panel]').forEach((panel) => {
          panel.classList.toggle('hidden', panel.dataset.panel !== name);
        });
        return;
      }

      if (event.target.closest('#qtyUp') || event.target.closest('#qtyDown')) {
        const isUp = Boolean(event.target.closest('#qtyUp'));
        const input = document.getElementById('qtyInput');
        if (!input) return;
        const next = Math.max(1, Math.min(99, (Number(input.value) || 1) + (isUp ? 1 : -1)));
        input.value = String(next);
        return;
      }

      if (event.target.closest('#addBtn')) {
        const input = document.getElementById('qtyInput');
        const qty = input ? Number(input.value) || 1 : 1;
        BFV.addToCart(product.slug, qty)
          .then(() => window.Site.openCartDrawer())
          .catch((err) => window.Site.toastErr(err.message));
        return;
      }

      if (event.target.closest('#buyNow')) {
        const input = document.getElementById('qtyInput');
        const qty = input ? Number(input.value) || 1 : 1;
        BFV.addToCart(product.slug, qty)
          .then(() => {
            window.location.href = '/checkout';
          })
          .catch((err) => window.Site.toastErr(err.message));
      }
    });
  }

  /* ---------------------------------------------------------------- init */

  async function init() {
    const slug = BFV.query.get('slug') || window.location.pathname.split('/').pop();

    try {
      const data = await get(`/products/${slug}`);
      product = data.product;
      BFV.recent.push(product.slug);
      render();
      renderRelated(data.related || []);
      bind();
      document.title = `${product.name} · Biofran Ventures`;
    } catch (err) {
      const host = document.getElementById('productDetail');
      if (host) {
        host.innerHTML = `<div class="container-wide" style="padding:3rem 0">
          ${C().emptyState('We could not find that product', err.message, {
            href: '/shop',
            label: 'Back to the shop'
          })}
        </div>`;
      }
    }
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.product = init;
})(window.BFV);