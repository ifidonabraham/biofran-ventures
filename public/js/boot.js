/* ==========================================================================
   Biofran Ventures — page bootstrap
   Runs on every page: loads site data, renders header / footer / drawers,
   loads the cart and the signed-in user, then calls the page's own init().
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { state, bus } = BFV;

  async function boot() {
    const pageInitName = document.body.dataset.pageInit || '';
    const pageInit =
      (window.BFVPages && pageInitName && window.BFVPages[pageInitName]) || null;

    window.Site.mount();

    try {
      await BFV.loadSite();
    } catch (err) {
      window.Site.toastErr(err.message);
    }

    /* Re-render the chrome now that we have the taxonomy and contacts. */
    window.Site.mount();
    window.Footer.mount();

    try {
      await Promise.all([BFV.loadUser(), BFV.loadCart()]);
    } catch (err) {
      /* A guest with an empty cart is perfectly normal. */
    }

    window.Site.syncBadges();
    window.Site.renderCartDrawer();

    bus.emit('boot:ready', state);

    if (pageInit) {
      try {
        await pageInit(state);
      } catch (err) {
        console.error('[bfv] page init failed', err);
        window.Site.toastErr(err.message || 'Something went wrong loading this page.');
      }
    }

    document.body.classList.add('is-ready');
  }

  window.BFVPages = window.BFVPages || {};

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.BFV);