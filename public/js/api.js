/* ==========================================================================
   Biofran Ventures — API client & shared helpers
   Loaded first on every page. Exposes window.BFV.
   ========================================================================== */

(function () {
  'use strict';

  const API_BASE = '/api';
  const LS_KEYS = { recent: 'bfv.recent', buyer: 'bfv.buyer' };
  const CURRENCY = '₦';

  /* ------------------------------------------------------------- storage */

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (err) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        /* storage may be disabled — the site still works */
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        /* ignore */
      }
    }
  };

  /* -------------------------------------------------------------- format */

  function money(amount, options = {}) {
    const value = Number(amount) || 0;
    const text = value.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2
    });
    return options.bare ? text : CURRENCY + text;
  }

  function compactMoney(amount) {
    const value = Number(amount) || 0;
    if (value >= 1000000000) return CURRENCY + (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (value >= 1000000) return CURRENCY + (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (value >= 1000) return CURRENCY + Math.round(value / 1000) + 'K';
    return CURRENCY + value;
  }

  function dateText(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (err) {
      return String(iso).slice(0, 10);
    }
  }

  function dateTimeText(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return String(iso);
    }
  }

  /* --------------------------------------------------------------- html */

  const escapeHtml = (value) =>
    String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  function stars(rating) {
    const r = Math.round(Number(rating) || 0);
    return '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(Math.max(0, 5 - r));
  }

  function initials(name) {
    return String(name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }

  /* -------------------------------------------------------------- export */

  /* ----------------------------------------------------------------- api */

  async function api(path, options = {}) {
    const opts = { credentials: 'same-origin', ...options };

    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
      opts.body = JSON.stringify(opts.body);
    }

    let response;
    try {
      response = await fetch(API_BASE + path, opts);
    } catch (err) {
      const error = new Error(
        'We could not reach the Biofran Ventures server. Please check your connection and try again.'
      );
      error.offline = true;
      throw error;
    }

    const type = response.headers.get('content-type') || '';
    const payload = type.includes('application/json') ? await response.json() : {};

    if (!response.ok || payload.ok === false) {
      const error = new Error(payload.error || `Request failed (${response.status})`);
      error.status = response.status;
      error.code = payload.code;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  const get = (path) => api(path);
  const post = (path, body) => api(path, { method: 'POST', body: body || {} });
  const put = (path, body) => api(path, { method: 'PUT', body: body || {} });
  const patch = (path, body) => api(path, { method: 'PATCH', body: body || {} });
  const del = (path) => api(path, { method: 'DELETE' });

  /* --------------------------------------------------------------- query */

  const query = {
    get(name, fallback = null) {
      return new URLSearchParams(window.location.search).get(name) || fallback;
    },
    all() {
      return Object.fromEntries(new URLSearchParams(window.location.search).entries());
    },
    set(params, { replace = false } = {}) {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') url.searchParams.delete(key);
        else url.searchParams.set(key, value);
      });
      const next = url.pathname + (url.search || '');
      if (replace) window.history.replaceState({}, '', next);
      else window.history.pushState({}, '', next);
    }
  };

  /* ----------------------------------------------------------------- bus */

  const listeners = {};

  const bus = {
    on(event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
      return () => bus.off(event, handler);
    },
    off(event, handler) {
      listeners[event] = (listeners[event] || []).filter((h) => h !== handler);
    },
    emit(event, detail) {
      (listeners[event] || []).forEach((handler) => {
        try {
          handler(detail);
        } catch (err) {
          console.error('[bfv] listener failed for', event, err);
        }
      });
    }
  };

  /* --------------------------------------------------------------- store */

  const state = { site: null, user: null, cart: null, summary: null, cartCount: 0 };

  async function loadSite() {
    if (state.site) return state.site;
    const data = await get('/site');
    state.site = data.site;
    state.commerce = data.commerce;
    state.departments = data.departments;
    state.categories = data.categories;
    state.storeServices = data.storeServices;
    state.property = data.property;
    bus.emit('site:loaded', data);
    return state.site;
  }

  async function loadUser() {
    const data = await get('/auth/me');
    state.user = data.user;
    state.cartCount = data.cartCount || 0;
    bus.emit('user:changed', { user: state.user });
    return state.user;
  }

  async function loadCart() {
    const data = await get('/cart');
    state.cart = data.cart;
    state.summary = data.summary;
    state.cartCount = data.summary ? data.summary.itemCount : 0;
    bus.emit('cart:changed', { cart: state.cart, summary: state.summary });
    return data;
  }

  function applyCart(data) {
    state.cart = data.cart;
    state.summary = data.summary;
    state.cartCount = data.summary ? data.summary.itemCount : 0;
    bus.emit('cart:changed', { cart: state.cart, summary: state.summary, added: data.message });
    return data;
  }

  const addToCart = (slug, quantity = 1, variant = '') =>
    post('/cart', { slug, quantity, variant }).then(applyCart);

  const setCartQuantity = (itemId, quantity) =>
    patch(`/cart/${itemId}`, { quantity }).then(applyCart);

  const removeCartItem = (itemId) => del(`/cart/${itemId}`).then(applyCart);

  /* -------------------------------------------------------------- recent */

  const recent = {
    all: () => storage.get(LS_KEYS.recent, []),
    push(slug) {
      const list = recent.all().filter((s) => s !== slug);
      list.unshift(slug);
      storage.set(LS_KEYS.recent, list.slice(0, 8));
    },
    clear: () => storage.remove(LS_KEYS.recent)
  };

  /* ------------------------------------------------------------ urls */

  function shopUrl(params = {}, path = '/shop') {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') search.set(key, value);
    });
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  }

  const productUrl = (slug) => `/product/${slug}`;
  const propertyUrl = (slug) => `/property/${slug}`;

  window.BFVPages = window.BFVPages || {};
  window.BFV = Object.assign(window.BFV || {}, {
    API_BASE,
    LS_KEYS,
    CURRENCY,
    storage,
    money,
    compactMoney,
    dateText,
    dateTimeText,
    escapeHtml,
    stars,
    initials,
    api,
    get,
    post,
    put,
    patch,
    del,
    query,
    bus,
    state,
    loadSite,
    loadUser,
    loadCart,
    addToCart,
    setCartQuantity,
    removeCartItem,
    recent,
    shopUrl,
    productUrl,
    propertyUrl
  });
})();