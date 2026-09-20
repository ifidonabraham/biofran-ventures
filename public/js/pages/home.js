/* ==========================================================================
   Home page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, escapeHtml, money } = BFV;
  const C = () => window.Components;

  function categoryTiles() {
    const cats = (BFV.state.categories || []).filter((c) => c.group !== 'properties');
    return cats
      .slice(0, 8)
      .map(
        (c) => `
      <a class="tile reveal" href="${escapeHtml(BFV.shopUrl({ category: c.key }))}">
        <img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title)}" loading="lazy" width="600" height="750">
        <div class="tile__overlay">
          <h3 class="tile__title">${escapeHtml(c.title)}</h3>
          <div class="tile__meta">${c.productCount || 0} products · ${escapeHtml(c.tagline || '')}</div>
          <div class="tile__cta">Shop now →</div>
        </div>
      </a>`
      )
      .join('');
  }

  function serviceCards() {
    const services = BFV.state.storeServices || [];
    return services
      .map(
        (s) => `
      <div class="service reveal">
        <div class="service__icon">${window.Components.icon(s.icon, 22)}</div>
        <div>
          <h4>${escapeHtml(s.title)}</h4>
          <p>${escapeHtml(s.description)}</p>
          <div class="row" style="gap:.8rem">
            <a href="${escapeHtml(BFV.shopUrl({ category: s.category }))}">Shop ${escapeHtml(s.title)}</a>
            <a href="tel:${escapeHtml(s.phone)}">Call ${escapeHtml(s.phone)}</a>
          </div>
        </div>
      </div>`
      )
      .join('');
  }

  async function init() {
    const site = BFV.state.site || {};
    const property = BFV.state.property || {};

    /* hero + trusted numbers */
    const statProducts = document.getElementById('statProducts');
    const heroTag = document.getElementById('heroTag');
    if (heroTag) heroTag.textContent = site.tagline || '';

    /* categories */
    const catHost = document.getElementById('homeCategories');
    if (catHost) catHost.innerHTML = categoryTiles();

    /* gas services */
    const svcHost = document.getElementById('homeServices');
    if (svcHost) svcHost.innerHTML = serviceCards();

    /* property teaser */
    const propHost = document.getElementById('homeProperties');
    const propBlurb = document.getElementById('homePropertyBlurb');
    if (propBlurb) {
      propBlurb.textContent = property.description || '';
    }

    try {
      const [featured, newest, onSale, props] = await Promise.all([
        get('/products/featured?limit=8'),
        get('/products?sort=newest&limit=4'),
        get('/products?onSale=true&limit=4'),
        get('/properties/featured?limit=3')
      ]);

      const totalCount = (newest.meta && newest.meta.total) ? `${newest.meta.total}+` : '60+';
      if (statProducts) statProducts.textContent = totalCount;

      const fHost = document.getElementById('homeFeatured');
      if (fHost) {
        fHost.innerHTML = featured.products.length
          ? C().productCards(featured.products)
          : C().emptyState('No featured products yet', 'Browse the full catalogue instead.', {
              href: '/shop',
              label: 'Shop everything'
            });
      }

      const nHost = document.getElementById('homeNewest');
      if (nHost) nHost.innerHTML = C().productCards(newest.products, { showActions: false });

      const sHost = document.getElementById('homeSale');
      if (sHost) {
        sHost.innerHTML = onSale.products.length
          ? C().productCards(onSale.products)
          : '<p class="dim">No active offers right now — check back soon.</p>';
      }

      if (propHost) {
        propHost.innerHTML = C().propertyCards(props.properties);
      }
    } catch (err) {
      window.Site.toastErr(err.message);
    }

    /* re-observe the freshly injected reveal elements */
    document.querySelectorAll('.reveal').forEach((el) => {
      if ('IntersectionObserver' in window) {
        window.setTimeout(() => el.classList.add('is-visible'), 60);
      } else {
        el.classList.add('is-visible');
      }
    });

    /* keep the department tabs honest */
    document.querySelectorAll('[data-dept-link]').forEach((link) => {
      const key = link.dataset.deptLink;
      const dept = (BFV.state.departments || []).find((d) => d.key === key);
      const badge = link.querySelector('[data-dept-count]');
      if (dept && badge) badge.textContent = String(dept.productCount || 0);
    });

    void money;
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.home = init;
})(window.BFV);