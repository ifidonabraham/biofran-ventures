/* ==========================================================================
   Biofran Ventures — site chrome
   Header, navigation, cart drawer, search, lightbox, toasts, footer.
   Exposes window.Site.
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { escapeHtml, money, bus, state } = BFV;

  /* ---------------------------------------------------------------- icons */

  const ICONS = {
    cart: '<path d="M3 4h2l2.4 11.2A2 2 0 0 0 9.36 17h8.5a2 2 0 0 0 1.96-1.6L21.5 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    truck: '<rect x="1" y="6" width="14" height="10" rx="2"/><path d="M15 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    shield: '<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1z"/>',
    flame: '<path d="M12 2c4 5 7 7 7 11a7 7 0 0 1-14 0c0-3.5 2.7-5.1 4.6-8.3.5 2.1 1.6 3 2.4 3.2-.8-2.1-.3-4 0-5.9z"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    whatsapp: '<path d="M20.5 3.5A10 10 0 0 0 4 15.6L2.6 21.4l5.9-1.5A10 10 0 1 0 20.5 3.5z"/><path d="M8.6 8.6c.4-.9 1-.8 1.3-.2l.7 1.3c.2.4 0 .8-.3 1l-.6.5c.7 1.3 1.8 2.3 3.1 3l.5-.6c.2-.3.6-.4 1-.2l1.3.7c.6.3.7.9-.2 1.3-2.4 1-6.8-3.4-6.8-6.8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-8-8V3h9.6l8.4 8.4a2 2 0 0 1 0 2z"/><circle cx="7.5" cy="7.5" r="1.5"/>'
  };

  function icon(name, size = 18, cls = '') {
    const body = ICONS[name] || ICONS.box;
    return (
      `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
      `stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ` +
      `aria-hidden="true">${body}</svg>`
    );
  }

  /* --------------------------------------------------------------- toasts */

  function toast(message, type = 'info', timeout = 4200) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = String(message);
    wrap.appendChild(el);

    window.setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      window.setTimeout(() => el.remove(), 320);
    }, timeout);
  }

  const toastOk = (m) => toast(m, 'ok');
  const toastErr = (m) => toast(m, 'err', 6000);

  /* -------------------------------------------------------------- helpers */

  function debounce(fn, wait = 260) {
    let timer;
    return function debounced(...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const statusPill = (status, label) =>
    `<span class="status-pill" data-status="${escapeHtml(status)}">${escapeHtml(label || status)}</span>`;

  window.SiteIcons = { ICONS, icon, toast, toastOk, toastErr, debounce, statusPill };

  /* ================================================================ header */

  function navDropdown(group) {
    const cats = (state.categories || []).filter((c) => c.group === group);
    return cats
      .map(
        (c) =>
          `<a href="${escapeHtml(BFV.shopUrl({ category: c.key }))}">
             <span>${escapeHtml(c.title)}</span><span>${c.productCount || 0}</span>
           </a>`
      )
      .join('');
  }

  function headerMarkup() {
    const site = state.site || {};
    const phones = (site.contacts && site.contacts.phones) || [];
    const emails = (site.contacts && site.contacts.emails) || [];
    const threshold = (state.commerce && state.commerce.freeDeliveryThreshold) || 150000;

    return `
    <div class="topbar">
      <div class="container-wide topbar__inner">
        <div class="topbar__marquee">
          ${icon('truck', 15)}
          <span>Free delivery on orders above <strong>${money(threshold)}</strong>
          &nbsp;·&nbsp; LPG gas refills at our physical store</span>
        </div>
        <div class="topbar__contacts">
          ${phones
            .map((p) => `<a href="tel:${escapeHtml(p.intl)}">${icon('phone', 14)} ${escapeHtml(p.number)}</a>`)
            .join('')}
          <a href="mailto:${escapeHtml(emails[0] ? emails[0].address : '')}">${icon('mail', 14)} Email us</a>
        </div>
      </div>
    </div>

    <header class="site-header" id="siteHeader">
      <div class="container-wide site-header__inner">
        <a class="brand" href="/" aria-label="Biofran Ventures home">
          <img class="brand__mark" src="/img/logo.svg" alt="Biofran Ventures" width="44" height="44">
          <span class="brand__text">
            <span class="brand__name">Biofran Ventures</span>
            <span class="brand__sub">Fashion · Gas · Home</span>
          </span>
        </a>

        <nav class="main-nav" aria-label="Main navigation">
          <a href="/" data-nav="/">Home</a>
          <div class="nav-item">
            <button class="main-nav__trigger" type="button">Fashion</button>
            <div class="nav-drop">
              <div class="nav-drop__head">Clothing, shoes, bags &amp; watches</div>
              ${navDropdown('fashion')}
              <a href="/shop?group=fashion" class="gold"><span>View all fashion</span><span>→</span></a>
            </div>
          </div>
          <div class="nav-item">
            <button class="main-nav__trigger" type="button">Appliances</button>
            <div class="nav-drop">
              <div class="nav-drop__head">For the home</div>
              ${navDropdown('appliances')}
              <a href="/shop?group=appliances" class="gold"><span>View all appliances</span><span>→</span></a>
            </div>
          </div>
          <div class="nav-item">
            <button class="main-nav__trigger" type="button">Gas &amp; Stoves</button>
            <div class="nav-drop">
              <div class="nav-drop__head">Our physical store speciality</div>
              ${navDropdown('gas')}
              <a href="/gas" class="gold"><span>Gas services &amp; refills</span><span>→</span></a>
            </div>
          </div>
          <a href="/properties" data-nav="/properties">Properties</a>
          <a href="/about" data-nav="/about">About</a>
          <a href="/contact" data-nav="/contact">Contact</a>
        </nav>

        <div class="header-actions">
          <button class="icon-btn" type="button" id="openSearch" aria-label="Search the store">
            ${icon('search', 19)}
          </button>
          <a class="icon-btn" href="/account" aria-label="Your account">
            ${icon('user', 19)}
          </a>
          <button class="icon-btn" type="button" id="openCart" aria-label="Open your cart">
            ${icon('cart', 19)}
            <span class="icon-btn__count" id="cartCount" hidden>0</span>
          </button>
          <button class="icon-btn nav-toggle" type="button" id="openNav" aria-label="Open menu">
            ${icon('menu', 20)}
          </button>
        </div>
      </div>
    </header>`;
  }
/* ------------------------------------------------------------- drawers */

  function chromeMarkup() {
    const cats = state.categories || [];
    const groups = state.departments || [];
    const phones = (state.site && state.site.contacts && state.site.contacts.phones) || [];

    return `
    <div class="drawer-nav" id="navDrawer" aria-hidden="true">
      <div class="drawer-nav__backdrop" data-close-nav></div>
      <div class="drawer-nav__panel">
        <div class="row-between" style="margin-bottom:1.4rem">
          <strong style="font-family:var(--serif);font-size:1.2rem">Menu</strong>
          <button class="icon-btn" type="button" data-close-nav aria-label="Close menu">${icon('x', 18)}</button>
        </div>
        <div class="drawer-nav__group">
          <a href="/">Home</a>
          <a href="/shop">Shop everything</a>
          <a href="/gas">Gas refills &amp; accessories</a>
          <a href="/properties">Biofran Properties</a>
          <a href="/about">About us</a>
          <a href="/contact">Contact</a>
          <a href="/account">My account</a>
          <a href="/cart">My cart</a>
        </div>
        ${groups
          .map(
            (g) => `
          <div class="drawer-nav__group">
            <div class="drawer-nav__title">${escapeHtml(g.title)}</div>
            ${cats
              .filter((c) => c.group === g.key)
              .map((c) => `<a href="${escapeHtml(BFV.shopUrl({ category: c.key }))}">${escapeHtml(c.title)}</a>`)
              .join('')}
          </div>`
          )
          .join('')}
        <div class="drawer-nav__group">
          <div class="drawer-nav__title">Call us</div>
          ${phones
            .map((p) => `<a href="tel:${escapeHtml(p.intl)}">${escapeHtml(p.number)} — ${escapeHtml(p.label)}</a>`)
            .join('')}
        </div>
      </div>
    </div>

    <div class="cart-drawer" id="cartDrawer" aria-hidden="true">
      <div class="cart-drawer__backdrop" data-close-cart></div>
      <div class="cart-drawer__panel" role="dialog" aria-label="Your shopping cart">
        <div class="cart-drawer__head row-between">
          <strong style="font-family:var(--serif);font-size:1.25rem">Your cart</strong>
          <button class="icon-btn" type="button" data-close-cart aria-label="Close cart">${icon('x', 18)}</button>
        </div>
        <div class="cart-drawer__body" id="cartDrawerBody"></div>
        <div class="cart-drawer__foot" id="cartDrawerFoot"></div>
      </div>
    </div>

    <div class="search-panel" id="searchPanel" aria-hidden="true">
      <div class="search-panel__inner">
        <div class="row-between" style="margin-bottom:1rem">
          <strong style="font-family:var(--serif);font-size:1.2rem">Search the store</strong>
          <button class="icon-btn" type="button" data-close-search aria-label="Close search">${icon('x', 18)}</button>
        </div>
        <form class="search-panel__form" id="searchForm" role="search">
          <input class="input" type="search" id="searchInput" autocomplete="off"
                 placeholder="Try &ldquo;gas refill&rdquo;, &ldquo;fridge&rdquo;, &ldquo;suit&rdquo;, &ldquo;watch&rdquo;&hellip;"
                 aria-label="Search products">
          <button class="btn btn--gold" type="submit">Search</button>
        </form>
        <div class="search-results" id="searchResults"></div>
      </div>
    </div>

    <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="Image preview">
      <div class="lightbox__inner">
        <button class="lightbox__close" type="button" data-close-lightbox aria-label="Close preview">
          ${icon('x', 18)}
        </button>
        <img class="lightbox__img" id="lightboxImg" src="" alt="">
        <div class="lightbox__thumbs" id="lightboxThumbs"></div>
        <div class="lightbox__title">
          <h3 id="lightboxTitle"></h3>
          <p class="dim" id="lightboxSub"></p>
        </div>
      </div>
    </div>`;
  }
/* --------------------------------------------------------- open/close */

  const openEls = [];

  function openPanel(el) {
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (!openEls.includes(el)) openEls.push(el);
  }

  function closePanels() {
    while (openEls.length) {
      const el = openEls.pop();
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('no-scroll');
  }

  const openNav = () => openPanel(document.getElementById('navDrawer'));

  const openCartDrawer = () => {
    openPanel(document.getElementById('cartDrawer'));
    renderCartDrawer();
  };

  const openSearch = () => {
    openPanel(document.getElementById('searchPanel'));
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (input) {
      input.value = '';
      window.setTimeout(() => input.focus(), 60);
    }
    if (results) results.innerHTML = '';
  };

  function openLightbox(item, gallery, index) {
    const box = document.getElementById('lightbox');
    if (!box) return;

    const images = (gallery && gallery.length ? gallery : [item]).map((g) =>
      typeof g === 'string' ? { url: g, preview: g, label: '' } : g
    );
    const activeIndex = Number(index) || 0;

    const main = document.getElementById('lightboxImg');
    main.src = item.preview || item.url || (images[0] && images[0].preview) || '';
    main.alt = item.name || item.title || 'Preview';

    document.getElementById('lightboxTitle').textContent = item.name || item.title || '';
    document.getElementById('lightboxSub').textContent =
      item.sub || `${images.length} image${images.length === 1 ? '' : 's'} available`;

    document.getElementById('lightboxThumbs').innerHTML = images
      .map(
        (g, i) =>
          `<img src="${escapeHtml(g.url)}" alt="${escapeHtml(g.label || `View ${i + 1}`)}" ` +
          `class="${i === activeIndex ? 'is-active' : ''}" data-preview-src="${escapeHtml(g.preview || g.url)}">`
      )
      .join('');

    openPanel(box);
  }

  document.addEventListener('click', (event) => {
    const target = event.target;

    if (
      target.closest(
        '[data-close-nav], [data-close-cart], [data-close-search], [data-close-lightbox]'
      )
    ) {
      event.preventDefault();
      closePanels();
      return;
    }

    if (target.classList.contains('cart-drawer__backdrop') || target.classList.contains('lightbox')) {
      closePanels();
      return;
    }

    const thumb = target.closest('#lightboxThumbs img[data-preview-src]');
    if (thumb && thumb.dataset.previewSrc) {
      const main = document.getElementById('lightboxImg');
      if (main) main.src = thumb.dataset.previewSrc;
      document
        .querySelectorAll('#lightboxThumbs img')
        .forEach((img) => img.classList.toggle('is-active', img === thumb));
      return;
    }

    const preview = target.closest('[data-preview]');
    if (preview) {
      event.preventDefault();
      let gallery = [];
      try {
        gallery = JSON.parse(preview.dataset.gallery || '[]');
      } catch (err) {
        gallery = [];
      }
      openLightbox(
        {
          preview: preview.dataset.preview,
          url: preview.dataset.preview,
          name: preview.dataset.previewName || '',
          sub: preview.dataset.previewSub || ''
        },
        gallery,
        0
      );
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanels();
  });

  /* ------------------------------------------------------- cart drawer */

  function cartLineMarkup(item) {
    return `
    <div class="cart-row" data-item="${escapeHtml(item.id)}" style="grid-template-columns:64px minmax(0,1fr) auto">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
      <div>
        <a class="cart-row__name" href="${escapeHtml(BFV.productUrl(item.slug))}"
           style="font-size:.98rem;display:block">${escapeHtml(item.name)}</a>
        <div class="cart-row__cat">${escapeHtml(item.categoryLabel || '')}</div>
        <div class="row" style="margin-top:.5rem;gap:.5rem">
          <div class="qty" style="transform:scale(.86);transform-origin:left center">
            <button type="button" data-cart-dec="${escapeHtml(item.id)}" aria-label="Decrease quantity">−</button>
            <input type="number" min="1" max="99" value="${item.qty}" data-cart-qty="${escapeHtml(item.id)}"
                   aria-label="Quantity for ${escapeHtml(item.name)}">
            <button type="button" data-cart-inc="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
          </div>
          <button class="icon-btn" type="button" data-cart-remove="${escapeHtml(item.id)}"
                  aria-label="Remove ${escapeHtml(item.name)}" style="width:34px;height:34px">
            ${icon('trash', 15)}
          </button>
        </div>
      </div>
      <div class="cart-row__side">
        <div class="cart-row__price">${money(item.price * item.qty)}</div>
        <div class="dim" style="font-size:.76rem">${money(item.price)} each</div>
      </div>
    </div>`;
  }

  function cartFootMarkup(summary) {
    if (!summary) return '';
    const remaining = Math.max(0, (summary.freeDeliveryThreshold || 0) - summary.subtotal);

    return `
    <div class="summary__row"><span>Subtotal</span><span>${money(summary.subtotal)}</span></div>
    <div class="summary__row"><span>${escapeHtml(summary.deliveryLabel)}</span>
      <span>${summary.deliveryFee ? money(summary.deliveryFee) : 'Free'}</span></div>
    <div class="summary__row summary__row--total"><span>Total</span><strong>${money(summary.total)}</strong></div>
    ${
      remaining > 0
        ? `<p class="summary__note">Add ${money(remaining)} more for free delivery.</p>`
        : `<p class="summary__note" style="color:var(--success)">You qualify for free delivery.</p>`
    }
    <div class="stack" style="margin-top:1rem;gap:.6rem">
      <a class="btn btn--gold btn--block" href="/checkout">Proceed to checkout</a>
      <a class="btn btn--ghost btn--block" href="/cart">View full cart</a>
    </div>`;
  }

  function renderCartDrawer() {
    const body = document.getElementById('cartDrawerBody');
    const foot = document.getElementById('cartDrawerFoot');
    if (!body || !foot) return;

    const cart = state.cart;
    if (!cart || !cart.items.length) {
      body.innerHTML = `
        <div class="empty" style="border:0;padding:2.5rem 0">
          ${icon('cart', 34)}
          <h3>Your cart is empty</h3>
          <p class="dim">Browse fashion, appliances or gas refills to get started.</p>
          <a class="btn btn--gold" href="/shop" style="margin-top:.8rem">Start shopping</a>
        </div>`;
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = `<div class="cart-list">${cart.items.map(cartLineMarkup).join('')}</div>`;
    foot.innerHTML = cartFootMarkup(state.summary);
  }

  async function refreshCart() {
    try {
      const data = await BFV.loadCart();
      renderCartDrawer();
      return data;
    } catch (err) {
      return null;
    }
  }

  document.addEventListener('click', async (event) => {
    const inc = event.target.closest('[data-cart-inc]');
    const dec = event.target.closest('[data-cart-dec]');
    const remove = event.target.closest('[data-cart-remove]');
    if (!inc && !dec && !remove) return;
    event.preventDefault();

    const items = (state.cart && state.cart.items) || [];
    try {
      if (remove) {
        await BFV.removeCartItem(remove.dataset.cartRemove);
        toastOk('Item removed from your cart.');
      } else {
        const id = inc ? inc.dataset.cartInc : dec.dataset.cartDec;
        const line = items.find((i) => i.id === id);
        if (!line) return;
        const next = inc ? line.qty + 1 : line.qty - 1;
        await BFV.setCartQuantity(id, Math.max(1, next));
      }
      renderCartDrawer();
    } catch (err) {
      toastErr(err.message);
    }
  });

  document.addEventListener(
    'change',
    async (event) => {
      const input = event.target.closest('[data-cart-qty]');
      if (!input) return;
      try {
        await BFV.setCartQuantity(input.dataset.cartQty, Number(input.value) || 1);
        renderCartDrawer();
      } catch (err) {
        toastErr(err.message);
      }
    },
    true
  );

  /* ------------------------------------------------------------- search */

  async function runSearch(term) {
    const results = document.getElementById('searchResults');
    if (!results) return;

    const value = String(term || '').trim();
    if (value.length < 2) {
      results.innerHTML = '<p class="dim" style="padding:.8rem">Type at least two characters to search.</p>';
      return;
    }

    results.innerHTML = '<div class="spinner"></div>';

    try {
      const data = await BFV.get(`/products?q=${encodeURIComponent(value)}&limit=6`);
      if (!data.products.length) {
        results.innerHTML = `
          <p class="dim" style="padding:.8rem">
            No products matched “${escapeHtml(value)}”.
            <a href="/contact">Tell us what you need</a> — we may still source it for you.
          </p>`;
        return;
      }

      results.innerHTML = data.products
        .map(
          (p) => `
        <a class="search-result" href="${escapeHtml(BFV.productUrl(p.slug))}">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
          <span style="flex:1 1 auto">
            <span style="display:block;font-weight:600">${escapeHtml(p.name)}</span>
            <span class="dim" style="font-size:.78rem">${escapeHtml(p.categoryLabel)}</span>
          </span>
          <strong class="gold">${money(p.price)}</strong>
        </a>`
        )
        .join('');

      results.innerHTML += `
        <a class="search-result" href="${escapeHtml(BFV.shopUrl({ q: value }))}"
           style="justify-content:center;color:var(--gold-400)">
          See all ${data.meta.total} result${data.meta.total === 1 ? '' : 's'} →
        </a>`;
    } catch (err) {
      results.innerHTML = `<p class="dim" style="padding:.8rem">${escapeHtml(err.message)}</p>`;
    }
  }

  function bindSearch() {
    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');
    if (!form || !input) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      window.location.href = BFV.shopUrl({ q: value });
    });

    input.addEventListener(
      'input',
      debounce(() => runSearch(input.value), 300)
    );
  }

  /* ---------------------------------------------------- badge & counters */

  function syncBadges() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const count = state.cartCount || 0;
    el.textContent = String(count);
    el.hidden = count === 0;
  }

  /* --------------------------------------------------------------- chrome */

  function stickyHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function markActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('[data-nav]').forEach((link) => {
      const href = link.getAttribute('data-nav');
      if (href === '/' ? path === '/' : path.startsWith(href)) link.classList.add('is-active');
    });
  }

  function revealOnScroll() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px 40px 0px', threshold: 0.01 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------- mount */

  function mount() {
    const headerHost = document.getElementById('site-header');
    const chromeHost = document.getElementById('site-chrome');
    if (headerHost) headerHost.innerHTML = headerMarkup();
    if (chromeHost) chromeHost.innerHTML = chromeMarkup();

    const searchBtn = document.getElementById('openSearch');
    const cartBtn = document.getElementById('openCart');
    const navBtn = document.getElementById('openNav');
    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
    if (navBtn) navBtn.addEventListener('click', openNav);

    bindSearch();
    stickyHeader();
    markActiveNav();
    revealOnScroll();
    syncBadges();

    bus.on('cart:changed', (detail) => {
      syncBadges();
      if (detail && detail.added) {
        toastOk(typeof detail.added === 'string' ? detail.added : 'Added to your cart.');
      }
    });
    bus.on('user:changed', syncBadges);
  }

  window.Site = {
    ICONS,
    icon,
    toast,
    toastOk,
    toastErr,
    debounce,
    statusPill,
    headerMarkup,
    chromeMarkup,
    mount,
    openNav,
    openSearch,
    openCartDrawer,
    openLightbox,
    closePanels,
    renderCartDrawer,
    refreshCart,
    runSearch,
    syncBadges,
    revealOnScroll
  };
})(window.BFV);