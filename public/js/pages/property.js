/* ==========================================================================
   Single property detail page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, post, escapeHtml, money } = BFV;
  const C = () => window.Components;

  let property = null;

  function renderGallery() {
    const gallery = property.gallery && property.gallery.length ? property.gallery : [{ url: property.image, preview: property.preview }];
    const mainHost = document.getElementById('propMainImage');
    const thumbsHost = document.getElementById('propThumbs');
    const previewBtn = document.getElementById('propPreviewBtn');

    if (mainHost) {
      mainHost.src = property.image;
      mainHost.alt = property.title;
    }

    if (previewBtn) {
      previewBtn.dataset.preview = property.preview || property.image;
      previewBtn.dataset.previewName = property.title;
      previewBtn.dataset.previewSub = `${property.purpose} · ${property.area}, ${property.city}`;
      previewBtn.dataset.gallery = JSON.stringify(gallery);
    }

    if (thumbsHost) {
      thumbsHost.innerHTML = gallery
        .map(
          (g, i) => `
        <img src="${escapeHtml(g.url)}" alt="${escapeHtml(g.label || `View ${i + 1}`)}"
             class="${i === 0 ? 'is-active' : ''}" style="cursor:pointer"
             data-thumb-img="${escapeHtml(g.url)}" data-thumb-preview="${escapeHtml(g.preview || g.url)}">`
        )
        .join('');

      thumbsHost.addEventListener('click', (e) => {
        const thumb = e.target.closest('[data-thumb-img]');
        if (!thumb) return;
        if (mainHost) mainHost.src = thumb.dataset.thumbImg;
        if (previewBtn) previewBtn.dataset.preview = thumb.dataset.thumbPreview;
        thumbsHost.querySelectorAll('img').forEach((t) => t.classList.toggle('is-active', t === thumb));
      });
    }
  }

  function renderDetails() {
    document.title = `${property.title} · Biofran Properties`;

    const titleEl = document.getElementById('propTitle');
    if (titleEl) titleEl.textContent = property.title;

    const refEl = document.getElementById('propReference');
    if (refEl) refEl.textContent = `Ref: ${property.reference}`;

    const purposeBadge = document.getElementById('propPurposeBadge');
    if (purposeBadge) purposeBadge.textContent = property.purpose;

    const priceEl = document.getElementById('propPrice');
    if (priceEl) {
      priceEl.innerHTML = property.priceUnit === 'one-off'
        ? money(property.price)
        : `${money(property.price)}<small style="font-size:.9rem;font-weight:normal;color:var(--text-dim)"> / ${escapeHtml(property.priceUnit)}</small>`;
    }

    const locEl = document.getElementById('propLocation');
    if (locEl) locEl.textContent = `${property.area}, ${property.city}`;

    const descEl = document.getElementById('propDescription');
    if (descEl) descEl.textContent = property.description;

    const featuresHost = document.getElementById('propFeatures');
    if (featuresHost && property.features) {
      featuresHost.innerHTML = property.features
        .map((f) => `<li style="margin-bottom:.5rem">${C().icon('check', 16, 'gold')} <span>${escapeHtml(f)}</span></li>`)
        .join('');
    }

    const docsHost = document.getElementById('propDocs');
    if (docsHost && property.documents) {
      docsHost.innerHTML = property.documents
        .map((d) => `<li style="margin-bottom:.5rem">${C().icon('shield', 16, 'gold')} <span>${escapeHtml(d)}</span></li>`)
        .join('');
    }

    const specsHost = document.getElementById('propSpecs');
    if (specsHost) {
      specsHost.innerHTML = `
        <div class="stat-box"><strong>${property.bedrooms || '—'}</strong><span>Bedrooms</span></div>
        <div class="stat-box"><strong>${property.bathrooms || '—'}</strong><span>Bathrooms</span></div>
        <div class="stat-box"><strong>${escapeHtml(property.size || 'Standard')}</strong><span>Plot / Size</span></div>
        <div class="stat-box"><strong>${escapeHtml(property.status || 'Available')}</strong><span>Status</span></div>
      `;
    }

    /* Direct contact link */
    const phoneBtn = document.getElementById('propPhoneBtn');
    if (phoneBtn) {
      phoneBtn.href = 'tel:07045723013';
      phoneBtn.textContent = 'Call Desk: 07045723013';
    }

    const waBtn = document.getElementById('propWaBtn');
    if (waBtn) {
      const waText = `Hello Biofran Properties, I am interested in inspecting ${property.reference} (${property.title}) located at ${property.area}, ${property.city}.`;
      waBtn.href = `https://wa.me/2347045723013?text=${encodeURIComponent(waText)}`;
    }
  }

  async function handleInspectionSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn ? btn.innerHTML : 'Request Guided Inspection';

    const data = {
      name: (form.name.value || '').trim(),
      email: (form.email.value || '').trim(),
      phone: (form.phone.value || '').trim(),
      topic: 'Property inspection',
      message: `Inspection Request for Property: ${property.reference} - ${property.title} (${property.area}, ${property.city})\nPreferred Date/Notes: ${(form.date ? form.date.value : '')} ${(form.notes ? form.notes.value : '')}`
    };

    if (!data.name || !data.phone) {
      return window.Site.toastErr('Please provide your name and phone number.');
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Submitting request…';
    }

    try {
      await post('/contact', data);
      window.Site.toastOk('Inspection request submitted! Our housing desk will call you shortly.');
      form.innerHTML = `
        <div style="text-align:center;padding:1.5rem 0">
          <div style="width:48px;height:48px;margin:0 auto .8rem;border-radius:50%;background:rgba(200,169,126,.15);display:flex;align-items:center;justify-content:center;color:var(--gold)">
            ${C().icon('check', 24)}
          </div>
          <h4>Inspection Request Received</h4>
          <p class="dim" style="font-size:.88rem;margin-top:.4rem">We have logged your inspection for <strong>${escapeHtml(property.reference)}</strong>. Our property manager will call you on <strong>${escapeHtml(data.phone)}</strong> to arrange the viewing.</p>
        </div>`;
    } catch (err) {
      window.Site.toastErr(err.message || 'Could not send request.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  }

  async function loadRelated() {
    const host = document.getElementById('propRelatedGrid');
    if (!host) return;

    try {
      const res = await get(`/properties?purpose=${encodeURIComponent(property.purpose)}&limit=3`);
      const related = (res.properties || []).filter((p) => p.slug !== property.slug).slice(0, 3);
      if (related.length) {
        host.innerHTML = C().propertyCards(related);
      } else {
        const parent = host.closest('.section');
        if (parent) parent.style.display = 'none';
      }
    } catch (err) {
      /* ignore */
    }
  }

  async function init() {
    const slug = BFV.query.get('slug') || window.location.pathname.split('/').pop();

    try {
      const res = await get(`/properties/${slug}`);
      property = res.property;
      renderGallery();
      renderDetails();

      const form = document.getElementById('inspectionForm');
      if (form) form.addEventListener('submit', handleInspectionSubmit);

      await loadRelated();
    } catch (err) {
      const host = document.querySelector('main');
      if (host) {
        host.innerHTML = `<div class="container" style="padding:4rem 1rem;text-align:center">
          ${C().emptyState('Property Not Found', err.message, { href: '/properties', label: 'View all properties' })}
        </div>`;
      }
    }
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.property = init;
})(window.BFV);
