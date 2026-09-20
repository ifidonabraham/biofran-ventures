/* ==========================================================================
   Admin dashboard page controller
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { get, post, patch, del, escapeHtml, money, state } = BFV;
  const C = () => window.Components;

  let allOrders = [];

  function renderStats(stats) {
    const el = (id, val) => {
      const node = document.getElementById(id);
      if (node) node.textContent = val;
    };

    el('statRevenue', money(stats.revenue || 0));
    el('statOrders', stats.totalOrders || 0);
    el('statCustomers', stats.customers || 0);
    el('statProducts', stats.products || 0);

    const lowStockHost = document.getElementById('adminLowStock');
    if (lowStockHost) {
      const items = stats.lowStock || [];
      if (items.length) {
        lowStockHost.innerHTML = items
          .map(
            (p) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border)">
            <span>${escapeHtml(p.name)}</span>
            <span class="status-pill" data-status="pending" style="background:#dc2626;color:#fff">${p.stock} in stock</span>
          </div>`
          )
          .join('');
      } else {
        lowStockHost.innerHTML = '<p class="dim" style="font-size:.88rem">All non-gas items are adequately stocked.</p>';
      }
    }
  }

  function renderOrders(orders) {
    const host = document.getElementById('adminOrdersTable');
    if (!host) return;

    if (!orders.length) {
      host.innerHTML = '<tr><td colspan="7" class="center dim" style="padding:2rem">No orders found.</td></tr>';
      return;
    }

    host.innerHTML = orders
      .map(
        (o) => `
      <tr>
        <td><strong>${escapeHtml(o.reference)}</strong><br><small class="dim">${BFV.dateText(o.createdAt)}</small></td>
        <td>${escapeHtml(o.customer.name)}<br><small class="dim">${escapeHtml(o.customer.phone)}</small></td>
        <td>${(o.items || []).length} items</td>
        <td><strong>${money(o.pricing ? o.pricing.total : 0)}</strong></td>
        <td>${escapeHtml(o.pricing ? o.pricing.deliveryLabel : 'Pickup')}</td>
        <td>${window.Site.statusPill(o.status, o.statusLabel)}</td>
        <td>
          <select class="field-select" data-order-status="${escapeHtml(o.id)}" style="padding:.2rem .4rem;font-size:.82rem">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="dispatched" ${o.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>`
      )
      .join('');
  }

  function renderEnquiries(enquiries) {
    const host = document.getElementById('adminEnquiriesTable');
    if (!host) return;

    if (!enquiries.length) {
      host.innerHTML = '<tr><td colspan="5" class="center dim" style="padding:2rem">No enquiries yet.</td></tr>';
      return;
    }

    host.innerHTML = enquiries
      .map(
        (e) => `
      <tr>
        <td>${BFV.dateTimeText(e.createdAt)}</td>
        <td><strong>${escapeHtml(e.name)}</strong><br><small class="dim">${escapeHtml(e.email)} · ${escapeHtml(e.phone || '')}</small></td>
        <td><span class="badge">${escapeHtml(e.topic)}</span></td>
        <td style="max-width:300px;word-break:break-word">${escapeHtml(e.message)}</td>
        <td>
          <label style="cursor:pointer;display:flex;align-items:center;gap:.4rem">
            <input type="checkbox" data-enquiry-check="${escapeHtml(e.id)}" ${e.handled ? 'checked' : ''}>
            <span>${e.handled ? 'Handled' : 'Open'}</span>
          </label>
        </td>
      </tr>`
      )
      .join('');
  }

  function renderCustomers(customers) {
    const host = document.getElementById('adminCustomersTable');
    if (!host) return;

    if (!customers.length) {
      host.innerHTML = '<tr><td colspan="5" class="center dim" style="padding:2rem">No customers registered yet.</td></tr>';
      return;
    }

    host.innerHTML = customers
      .map(
        (c) => `
      <tr>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td>${escapeHtml(c.email)}</td>
        <td>${escapeHtml(c.phone || '—')}</td>
        <td>${c.orderCount || 0}</td>
        <td><strong>${money(c.spend || 0)}</strong></td>
      </tr>`
      )
      .join('');
  }

  async function loadDashboard() {
    try {
      const [statsRes, ordersRes, enqRes, custRes] = await Promise.all([
        get('/admin/stats'),
        get('/admin/orders'),
        get('/admin/enquiries'),
        get('/admin/customers')
      ]);

      if (statsRes.stats) renderStats(statsRes.stats);
      allOrders = ordersRes.orders || [];
      renderOrders(allOrders);
      renderEnquiries(enqRes.enquiries || []);
      renderCustomers(custRes.customers || []);
    } catch (err) {
      window.Site.toastErr(err.message || 'Failed to load administrator data.');
    }
  }

  function bindEvents() {
    /* Order status change handler */
    const orderTable = document.getElementById('adminOrdersTable');
    if (orderTable) {
      orderTable.addEventListener('change', async (e) => {
        const select = e.target.closest('[data-order-status]');
        if (!select) return;
        const id = select.dataset.orderStatus;
        const status = select.value;
        const note = `Status changed to ${status} via admin dashboard.`;

        try {
          await patch(`/admin/orders/${id}/status`, { status, note });
          window.Site.toastOk(`Order status updated to ${status}.`);
          loadDashboard();
        } catch (err) {
          window.Site.toastErr(err.message);
        }
      });
    }

    /* Enquiry handled toggle */
    const enqTable = document.getElementById('adminEnquiriesTable');
    if (enqTable) {
      enqTable.addEventListener('change', async (e) => {
        const cb = e.target.closest('[data-enquiry-check]');
        if (!cb) return;
        const id = cb.dataset.enquiryCheck;
        const handled = cb.checked;

        try {
          await patch(`/admin/enquiries/${id}`, { handled });
          window.Site.toastOk(`Enquiry marked as ${handled ? 'handled' : 'open'}.`);
        } catch (err) {
          window.Site.toastErr(err.message);
        }
      });
    }

    /* Orders filter */
    const filterStatus = document.getElementById('adminFilterStatus');
    const searchInput = document.getElementById('adminSearchOrder');

    const filterFn = () => {
      const st = filterStatus ? filterStatus.value : '';
      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

      let list = allOrders;
      if (st) list = list.filter((o) => o.status === st);
      if (q) {
        list = list.filter(
          (o) =>
            o.reference.toLowerCase().includes(q) ||
            o.customer.name.toLowerCase().includes(q) ||
            o.customer.email.toLowerCase().includes(q)
        );
      }
      renderOrders(list);
    };

    if (filterStatus) filterStatus.addEventListener('change', filterFn);
    if (searchInput) searchInput.addEventListener('input', filterFn);

    /* Product creation form */
    const prodForm = document.getElementById('adminAddProductForm');
    if (prodForm) {
      prodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          name: (prodForm.prodName.value || '').trim(),
          price: Number(prodForm.prodPrice.value) || 0,
          oldPrice: Number(prodForm.prodOldPrice.value) || 0,
          stock: Number(prodForm.prodStock.value) || 10,
          category: prodForm.prodCategory.value || 'men-clothing',
          brand: (prodForm.prodBrand.value || 'Biofran Select').trim(),
          description: (prodForm.prodDesc.value || '').trim()
        };

        if (!data.name || !data.price) {
          return window.Site.toastErr('Please provide at least a product name and price.');
        }

        try {
          await post('/admin/products', data);
          window.Site.toastOk(`Product "${data.name}" added successfully.`);
          prodForm.reset();
          loadDashboard();
        } catch (err) {
          window.Site.toastErr(err.message || 'Could not create product.');
        }
      });
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = (form.email.value || '').trim();
    const password = form.password.value || '';

    try {
      const res = await post('/auth/login', { email, password });
      if (res.user && res.user.role === 'admin') {
        state.user = res.user;
        window.Site.syncBadges();
        document.getElementById('adminAuthWall').style.display = 'none';
        document.getElementById('adminDashboardContent').style.display = '';
        loadDashboard();
      } else {
        window.Site.toastErr('This account does not have administrator privileges.');
      }
    } catch (err) {
      window.Site.toastErr(err.message || 'Invalid administrator credentials.');
    }
  }

  async function init() {
    const user = state.user;
    const wall = document.getElementById('adminAuthWall');
    const content = document.getElementById('adminDashboardContent');

    if (!user || user.role !== 'admin') {
      if (wall) wall.style.display = '';
      if (content) content.style.display = 'none';
      const loginForm = document.getElementById('adminLoginForm');
      if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);
    } else {
      if (wall) wall.style.display = 'none';
      if (content) content.style.display = '';
      bindEvents();
      await loadDashboard();
    }
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.admin = init;
})(window.BFV);
