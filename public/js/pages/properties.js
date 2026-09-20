/* ==========================================================================
   Biofran Properties listings page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, escapeHtml } = BFV;
  const C = () => window.Components;

  let state = {
    purpose: '',
    city: '',
    type: '',
    sort: 'newest',
    page: 1,
    limit: 9
  };

  function readUrl() {
    const q = BFV.query.all();
    return {
      purpose: q.purpose || '',
      city: q.city || '',
      type: q.type || '',
      sort: q.sort || 'newest',
      page: Number(q.page) || 1,
      limit: 9
    };
  }

  async function loadListings() {
    const grid = document.getElementById('propertiesGrid');
    const countEl = document.getElementById('propertiesCount');
    if (!grid) return;

    grid.innerHTML = C().loading('available properties');

    const params = new URLSearchParams();
    if (state.purpose) params.set('purpose', state.purpose);
    if (state.city) params.set('city', state.city);
    if (state.type) params.set('type', state.type);
    if (state.sort) params.set('sort', state.sort);
    if (state.page > 1) params.set('page', state.page);
    params.set('limit', state.limit);

    try {
      const res = await get(`/properties?${params.toString()}`);
      if (countEl && res.meta) {
        countEl.textContent = `${res.meta.total} properties found`;
      }

      if (res.properties && res.properties.length) {
        grid.innerHTML = C().propertyCards(res.properties);
      } else {
        grid.innerHTML = C().emptyState(
          'No properties matching criteria',
          'Try clearing some filters or searching a different city.',
          { href: '/properties', label: 'Clear all filters' }
        );
      }
    } catch (err) {
      grid.innerHTML = `<p class="dim">${escapeHtml(err.message)}</p>`;
    }
  }

  function renderFilterOptions(filters) {
    const purposeSelect = document.getElementById('filterPurpose');
    if (purposeSelect && filters.purposes) {
      purposeSelect.innerHTML =
        '<option value="">All Purposes (Sale & Rent)</option>' +
        filters.purposes
          .map((p) => `<option value="${escapeHtml(p)}" ${state.purpose === p ? 'selected' : ''}>${escapeHtml(p)}</option>`)
          .join('');
    }

    const citySelect = document.getElementById('filterCity');
    if (citySelect && filters.cities) {
      citySelect.innerHTML =
        '<option value="">All Locations</option>' +
        filters.cities
          .map((c) => `<option value="${escapeHtml(c)}" ${state.city === c ? 'selected' : ''}>${escapeHtml(c)}</option>`)
          .join('');
    }

    const sortSelect = document.getElementById('sortProperties');
    if (sortSelect && filters.sorts) {
      sortSelect.innerHTML = filters.sorts
        .map((s) => `<option value="${escapeHtml(s.key)}" ${state.sort === s.key ? 'selected' : ''}>${escapeHtml(s.label)}</option>`)
        .join('');
    }
  }

  function bindEvents() {
    const purposeSelect = document.getElementById('filterPurpose');
    if (purposeSelect) {
      purposeSelect.addEventListener('change', () => {
        state.purpose = purposeSelect.value;
        state.page = 1;
        BFV.query.set({ purpose: state.purpose, page: null });
        loadListings();
      });
    }

    const citySelect = document.getElementById('filterCity');
    if (citySelect) {
      citySelect.addEventListener('change', () => {
        state.city = citySelect.value;
        state.page = 1;
        BFV.query.set({ city: state.city, page: null });
        loadListings();
      });
    }

    const sortSelect = document.getElementById('sortProperties');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        BFV.query.set({ sort: state.sort });
        loadListings();
      });
    }

    /* Purpose quick tabs */
    document.querySelectorAll('[data-purpose-tab]').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const p = tab.dataset.purposeTab;
        state.purpose = p;
        state.page = 1;
        document.querySelectorAll('[data-purpose-tab]').forEach((t) => t.classList.toggle('is-active', t === tab));
        if (purposeSelect) purposeSelect.value = p;
        BFV.query.set({ purpose: p || null, page: null });
        loadListings();
      });
    });
  }

  async function init() {
    Object.assign(state, readUrl());

    try {
      const filters = await get('/properties/filters');
      renderFilterOptions(filters);
    } catch (err) {
      /* ignore */
    }

    bindEvents();
    await loadListings();
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.properties = init;
})(window.BFV);
