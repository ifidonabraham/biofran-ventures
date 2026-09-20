/* ==========================================================================
   Biofran Ventures — footer + floating contact buttons
   Exposes window.Footer
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { escapeHtml, money, state } = BFV;
  const icon = (name, size, cls) => window.Site.icon(name, size, cls);

  function contactLinks(contacts) {
    const phones = (contacts.phones || [])
      .map(
        (p) =>
          `<a class="footer-contact" href="tel:${escapeHtml(p.intl)}">${icon('phone', 15)}` +
          `<span><strong>${escapeHtml(p.number)}</strong>${escapeHtml(p.label)}</span></a>`
      )
      .join('');

    const emails = (contacts.emails || [])
      .map(
        (e) =>
          `<a class="footer-contact" href="mailto:${escapeHtml(e.address)}">${icon('mail', 15)}` +
          `<span><strong>${escapeHtml(e.address)}</strong>${escapeHtml(e.label)}</span></a>`
      )
      .join('');

    return phones + emails;
  }

  function addressBlock(iconName, address, fallbackName) {
    const a = address || {};
    const line = [a.line2, a.city, a.state, a.country].filter(Boolean).join(', ');
    return (
      `<div class="footer-contact">${icon(iconName, 15)}` +
      `<span><strong>${escapeHtml(a.line1 || fallbackName)}</strong>${escapeHtml(line)}</span></div>`
    );
  }

  function footerMarkup() {
    const site = state.site || {};
    const groups = state.departments || [];
    const cats = state.categories || [];
    const year = new Date().getFullYear();
    const threshold = (state.commerce && state.commerce.freeDeliveryThreshold) || 150000;

    return `
    <div class="container-wide">
      <div class="footer-grid">
        <div class="footer-col">
          <a class="brand" href="/" style="margin-bottom:1rem">
            <img class="brand__mark" src="/img/logo.svg" alt="Biofran Ventures" width="44" height="44">
            <span class="brand__text">
              <span class="brand__name">Biofran Ventures</span>
              <span class="brand__sub">Est. Nigeria</span>
            </span>
          </a>
          <p class="dim" style="font-size:.87rem;max-width:34ch">
            ${escapeHtml(site.tagline || 'Fashion, Appliances, Gas & Property — all in one place.')}
            A classy online store, a full-service LPG gas store and a trusted housing agency.
          </p>
          <div class="row" style="margin-top:.4rem">
            <a class="btn btn--ghost btn--sm" href="/shop">Shop now</a>
            <a class="btn btn--gold btn--sm" href="/gas">Book a refill</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a href="/shop">All products</a></li>
            ${groups
              .map((g) => `<li><a href="${escapeHtml(BFV.shopUrl({ group: g.key }))}">${escapeHtml(g.title)}</a></li>`)
              .join('')}
            <li><a href="/shop?onSale=true">Offers &amp; discounts</a></li>
            <li><a href="/properties">Biofran Properties</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Popular</h4>
          <ul>
            ${cats
              .slice(0, 6)
              .map((c) => `<li><a href="${escapeHtml(BFV.shopUrl({ category: c.key }))}">${escapeHtml(c.title)}</a></li>`)
              .join('')}
            <li><a href="/about">About Biofran</a></li>
            <li><a href="/contact">Contact &amp; enquiries</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Reach us</h4>
          ${contactLinks(site.contacts || {})}
          ${addressBlock('building', site.storeAddress, 'Biofran Ventures Store')}
          ${addressBlock('box', site.propertyOffice, 'Biofran Properties')}
        </div>
      </div>

      <hr class="divider">

      <div class="footer-grid">
        <div class="footer-col">
          <h4>Store opening hours</h4>
          ${(site.openingHours || [])
            .map(
              (h) =>
                `<div class="hours-row"><span class="dim">${escapeHtml(h.days)}</span><span>${escapeHtml(h.hours)}</span></div>`
            )
            .join('')}
        </div>
        <div class="footer-col">
          <h4>Gas &amp; refill service</h4>
          <p class="dim" style="font-size:.85rem;margin:0 0 .6rem">
            We refill 5kg, 12.5kg, 25kg and 50kg cylinders — weighed, leak-tested and sealed in front of you.
          </p>
          <a class="btn btn--ghost btn--sm" href="/gas">See gas services</a>
        </div>
        <div class="footer-col">
          <h4>Delivery</h4>
          <p class="dim" style="font-size:.85rem;margin:0">
            Free delivery on orders above ${money(threshold)}. Same-day delivery within the city and
            nationwide courier available.
          </p>
        </div>
        <div class="footer-col">
          <h4>Newsletter</h4>
          <p class="dim" style="font-size:.85rem;margin:0">
            New arrivals, gas offers and property listings — once a week, no spam.
          </p>
          <form class="newsletter-form" id="newsletterForm">
            <input class="input" type="email" name="email" placeholder="Your email address"
                   required aria-label="Email address for the newsletter">
            <button class="btn btn--gold btn--sm" type="submit">Join</button>
          </form>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© ${year} ${escapeHtml(site.legalName || 'Biofran Ventures Ltd.')} · All rights reserved.</span>
        <span class="row" style="gap:1rem">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/shop">Shop</a>
          <a href="/properties">Properties</a>
        </span>
      </div>
    </div>`;
  }

  window.Footer = { footerMarkup, contactLinks, addressBlock };

  /* -------------------------------------------------------- floating ctas */

  function floatingMarkup() {
    const site = state.site || {};
    const contacts = site.contacts || {};
    const whatsapp = String(contacts.whatsapp || '+2348037211227').replace(/\D/g, '');
    const gas = (contacts.phones || [])[1] || { number: '08141256339', intl: '+2348141256339' };

    return `
    <div class="floating-cta">
      <a href="https://wa.me/${escapeHtml(whatsapp)}" target="_blank" rel="noopener"
         aria-label="Chat with Biofran Ventures on WhatsApp">
        ${icon('whatsapp', 18)}<span>Chat on WhatsApp</span>
      </a>
      <a class="floating-cta--gas" href="tel:${escapeHtml(gas.intl)}" aria-label="Call the gas desk">
        ${icon('flame', 18)}<span>Gas refill: ${escapeHtml(gas.number)}</span>
      </a>
    </div>`;
  }

  /* ------------------------------------------------------------ newsletter */

  function bindNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="email"]');
      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;

      try {
        const data = await BFV.post('/newsletter', { email: (input && input.value) || '' });
        window.Site.toastOk(data.message || 'You are on the list — thank you!');
        form.reset();
      } catch (err) {
        window.Site.toastErr(err.message);
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  /* ---------------------------------------------------------------- mount */

  function mount() {
    const host = document.getElementById('site-footer');
    if (host) {
      host.classList.add('site-footer');
      host.innerHTML = footerMarkup();
      bindNewsletter();
    }

    const floatHost = document.getElementById('site-floating');
    if (floatHost) floatHost.innerHTML = floatingMarkup();
  }

  window.Footer = { footerMarkup, contactLinks, addressBlock, floatingMarkup, mount, bindNewsletter };
})(window.BFV);