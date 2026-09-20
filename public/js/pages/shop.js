/* ==========================================================================
   Shop page controller — filters, sorting, pagination, URL state
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, escapeHtml } = BFV;
  const C = () => window.Components;

  const els = {};
  let filters = null;
  let state = {};

  function readUrl() {
    const q = BFV.query.all();
    return {
      category: q.category || '',
      group: q.group || '',
      brand: q.brand || '',
      q: q.q || '',
      min: q.min || '',
      max: q.max || '',
      sort: q.sort || 'featured',
      sale: q.onSale === 'true' || q.sale === 'true',
      inStock: q.inStock === 'true',
      page: Number(q.page) || 1,
      limit: 12
    };
  }

  function currentParams() {
    return {
      category: state.category,
      group: state.group,
      brand: state.brand,
      q: state.q,
      min: state.min,
      max: state.max,
      sort: state.sort,
      onSale: state.sale ? 'true' : '',
      inStock: state.inStock ? 'true' : '',
      page: state.page,
      limit: state.limit
    };
  }

  /* ------------------------------------------------------------- sidebar */

  function categoryList() {
    const counted = (filters && filters.categories) || [];
    const groups = BFV.state.departments || [];

    return groups
      .map((g) => {
        const children = counted.filter((c) => c.group === g.key);
        if (!children.length) return '';
        return `
        <div class="filters__group">
          <div class="filters__title">${escapeHtml(g.title)}</div>
          <div class="filters__list">
            ${children
              .map(
                (c) => `
              <button class="filters__item ${state.category === c.key ? 'is-active' : ''}"
                      type="button" data-filter-category="${escapeHtml(c.key)}">
                <span>${escapeHtml(c.title)}</span><span>${c.count}</span>
              </button>`
              )
              .join('')}
          </div>
        </div>`;
      })
      .join('');
  }

  function brandList() {
    const brands = (filters && filters.brands) || [];
    if (!brands.length) return '';
    return `
    <div class="filters__group">
      <div class="filters__title">Brand / line</div>
      <div class="filters__list">
        ${brands
          .map(
            (b) => `
          <button class="filters__item ${state.brand === b ? 'is-active' : ''}"
                  type="button" data-filter-brand="${escapeHtml(b)}">
            <span>${escapeHtml(b)}</span><span>→</span>
          </button>`
          )
          .join('')}
      </div>
    </div>`;
  }

  function renderFilters() {
    if (!els.sidebar) return;
    const bounds = (filters && filters.price) || { min: 0, max: 0 };

    els.sidebar.innerHTML = `
      <div class="row-between" style="margin-bottom:1rem">
        <strong style="font-size:.95rem">Refine your search</strong>
        <button class="preview-link" type="button" data-clear-filters>Clear all</button>
      </div>

      <div class="filters__group">
        <div class="filters__title">Department</div>
        <div class="filters__list">
          <button class="filters__item ${!state.group && !state.category ? 'is-active' : ''}"
                  type="button" data-filter-group="">All products</button>
          ${(BFV.state.departments || [])
            .map(
              (g) => `
            <button class="filters__item ${state.group === g.key ? 'is-active' : ''}"
                    type="button" data-filter-group="${escapeHtml(g.key)}">
              <span>${escapeHtml(g.title)}</span><span>${g.productCount || 0}</span>
            </button>`
            )
            .join('')}
        </div>
      </div>

      ${categoryList()}
      ${brandList()}

      <div class="filters__group">
        <div class="filters__title">Price range (₦)</div>
        <div class="price-row">
          <input class="input" type="number" id="minPrice" placeholder="Min" min="0"
                 value="${escapeHtml(state.min || '')}">
          <span class="dim">–</span>
          <input class="input" type="number" id="maxPrice" placeholder="Max" min="0"
                 value="${escapeHtml(state.max || '')}">
        </div>
        <button class="btn btn--ghost btn--sm btn--block" type="button" data-apply-price
                style="margin-top:.7rem">Apply price</button>
        <p class="dim" style="font-size:.74rem;margin:.6rem 0 0">
          Catalogue prices range from ${BFV.money(bounds.min)} to ${BFV.money(bounds.max)}.
        </p>
      </div>

      <div class="filters__group">
        <div class="filters__title">Availability</div>
        <label class="checkbox" style="margin-bottom:.5rem">
          <input type="checkbox" ${state.sale ? 'checked' : ''} data-toggle-sale>
          <span>Only items on offer</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" ${state.inStock ? 'checked' : ''} data-toggle-stock>
          <span>Only items in stock</span>
        </label>
      </div>`;
  }

  /* ------------------------------------------------------------ toolbar */

  function activeFilterTags() {
    const tags = [];
    const catTitle = (key) => {
      const c = (BFV.state.categories || []).find((x) => x.key === key);
      return c ? c.title : key;
    };

    if (state.category) tags.push({ key: 'category', label: catTitle(state.category) });
    if (state.group) {
      const g = (BFV.state.departments || []).find((x) => x.key === state.group);
      tags.push({ key: 'group', label: g ? g.title : state.group });
    }
    if (state.brand) tags.push({ key: 'brand', label: state.brand });
    if (state.q) tags.push({ key: 'q', label: `“${state.q}”` });
    if (state.min || state.max) {
      tags.push({ key: 'price', label: `₦${state.min || 0} – ₦${state.max || '∞'}` });
    }
    if (state.sale) tags.push({ key: 'sale', label: 'On offer' });
    if (state.inStock) tags.push({ key: 'inStock', label: 'In stock' });

    if (!tags.length) return '';

    return tags
      .map(
        (t) => `
      <span class="filter-tag">${escapeHtml(t.label)}
        <button type="button" data-remove-filter="${escapeHtml(t.key)}"
                aria-label="Remove ${escapeHtml(t.label)} filter">×</button>
      </span>`
      )
      .join('');
  }

  function renderPagination(meta) {
    if (!els.pagination) return;
    if (meta.pages <= 1) {
      els.pagination.innerHTML = '';
      return;
    }

    const buttons = [
      `<button type="button" data-page="${meta.page - 1}" ${meta.hasPrev ? '' : 'disabled'}>‹ Prev</button>`
    ];

    for (let p = 1; p <= meta.pages; p += 1) {
      const near = Math.abs(p - meta.page) <= 2 || p === 1 || p === meta.pages;
      if (!near) {
        if (p === 2 || p === meta.pages - 1) buttons.push('<span class="dim">…</span>');
        continue;
      }
      buttons.push(
        `<button type="button" data-page="${p}" class="${p === meta.page ? 'is-active' : ''}">${p}</button>`
      );
    }

    buttons.push(
      `<button type="button" data-page="${meta.page + 1}" ${meta.hasNext ? '' : 'disabled'}>Next ›</button>`
    );

    els.pagination.innerHTML = buttons.join('');
  }

  /* --------------------------------------------------------------- load */

  async function load() {
    if (els.grid) els.grid.innerHTML = C().loading('products');

    const search = new URLSearchParams();
    Object.entries(currentParams()).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) search.set(key, value);
    });

    try {
      const data = await get(`/products?${search.toString()}`);

      if (els.count) {
        els.count.innerHTML = `<strong>${data.meta.total}</strong> product${
          data.meta.total === 1 ? '' : 's'
        } found`;
      }

      if (els.grid) {
        els.grid.innerHTML = data.products.length
          ? C().productCards(data.products)
          : C().emptyState(
              'Nothing matched those filters',
              'Try removing a filter — or tell us what you need and we will source it for you.',
              { href: '/contact', label: 'Request an item' }
            );
      }

      if (els.tags) els.tags.innerHTML = activeFilterTags();
      renderPagination(data.meta);
      renderFilters();
      bindFilterControls();

      const heading = document.getElementById('shopHeading');
      if (heading) {
        if (state.q) heading.textContent = `Search results for “${state.q}”`;
        else if (state.category) {
          const c = (BFV.state.categories || []).find((x) => x.key === state.category);
          heading.textContent = c ? c.title : 'Shop';
        } else if (state.group) {
          const g = (BFV.state.departments || []).find((x) => x.key === state.group);
          heading.textContent = g ? g.title : 'Shop';
        } else {
          heading.textContent = 'Shop everything';
        }
      }
    } catch (err) {
      if (els.grid) {
        els.grid.innerHTML = C().emptyState('We could not load the catalogue', err.message);
      }
      window.Site.toastErr(err.message);
    }
  }

  /* ------------------------------------------------------------- events */

  function apply(patch, options) {
    const resetPage = !options || options.resetPage !== false;
    Object.assign(state, patch);
    if (resetPage) state.page = 1;
    BFV.query.set(currentParams(), { replace: false });
    load();
    if (els.sidebar && window.innerWidth <= 960) els.sidebar.classList.add('is-collapsed');
  }

  function bindFilterControls() {
    if (!els.sidebar) return;

    els.sidebar.querySelectorAll('[data-filter-category]').forEach((btn) => {
      btn.addEventListener('click', () => apply({ category: btn.dataset.filterCategory, group: '' }));
    });

    els.sidebar.querySelectorAll('[data-filter-group]').forEach((btn) => {
      btn.addEventListener('click', () => apply({ group: btn.dataset.filterGroup, category: '' }));
    });

    els.sidebar.querySelectorAll('[data-filter-brand]').forEach((btn) => {
      btn.addEventListener('click', () =>
        apply({ brand: state.brand === btn.dataset.filterBrand ? '' : btn.dataset.filterBrand })
      );
    });

    const clear = els.sidebar.querySelector('[data-clear-filters]');
    if (clear) {
      clear.addEventListener('click', () =>
        apply({ category: '', group: '', brand: '', q: '', min: '', max: '', sale: false, inStock: false })
      );
    }

    const applyPrice = els.sidebar.querySelector('[data-apply-price]');
    if (applyPrice) {
      applyPrice.addEventListener('click', () => {
        const minEl = document.getElementById('minPrice');
        const maxEl = document.getElementById('maxPrice');
        apply({ min: minEl ? minEl.value : '', max: maxEl ? maxEl.value : '' });
      });
    }

    const sale = els.sidebar.querySelector('[data-toggle-sale]');
    if (sale) sale.addEventListener('change', () => apply({ sale: sale.checked }));

    const stock = els.sidebar.querySelector('[data-toggle-stock]');
    if (stock) stock.addEventListener('change', () => apply({ inStock: stock.checked }));
  }

  function bindPageEvents() {
    document.addEventListener('click', (event) => {
      const pageBtn = event.target.closest('[data-page]');
      if (pageBtn) {
        event.preventDefault();
        const next = Number(pageBtn.dataset.page);
        if (!next || next < 1) return;
        state.page = next;
        BFV.query.set(currentParams(), { replace: false });
        load();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const remove = event.target.closest('[data-remove-filter]');
      if (remove) {
        const key = remove.dataset.removeFilter;
        const patch = {};
        if (key === 'category') patch.category = '';
        else if (key === 'group') patch.group = '';
        else if (key === 'brand') patch.brand = '';
        else if (key === 'q') patch.q = '';
        else if (key === 'price') {
          patch.min = '';
          patch.max = '';
        } else if (key === 'sale') patch.sale = false;
        else if (key === 'inStock') patch.inStock = false;
        apply(patch);
      }
    });

    const sort = document.getElementById('sortSelect');
    if (sort) sort.addEventListener('change', () => apply({ sort: sort.value }, { resetPage: false }));

    const toggle = document.getElementById('toggleFilters');
    if (toggle) {
      toggle.addEventListener('click', () => {
        if (els.sidebar) els.sidebar.classList.toggle('is-collapsed');
      });
    }
  }

  async function init() {
    els.grid = document.getElementById('productGrid');
    els.sidebar = document.getElementById('shopFilters');
    els.count = document.getElementById('resultCount');
    els.pagination = document.getElementById('pagination');
    els.tags = document.getElementById('activeFilters');

    Object.assign(state, readUrl());

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = state.sort;

    try {
      filters = await get('/products/filters');
    } catch (err) {
      window.Site.toastErr(err.message);
      filters = { categories: [], brands: [], price: { min: 0, max: 0 }, sorts: [] };
    }

    renderFilters();
    bindFilterControls();
    bindPageEvents();
    await load();
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.shop = init;
})(window.BFV);