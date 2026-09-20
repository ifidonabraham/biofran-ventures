'use strict';

/**
 * Biofran Ventures - smoke test.
 *
 *   node tests/smoke.js
 *
 * Boots the real Express app on a random port and exercises the API end to
 * end: catalogue, generated images, registration, cart, checkout, order
 * tracking, admin endpoints and every static page.
 */

process.env.PORT = process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : '0';

const { start } = require('../server');

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function main() {
  const server = await start();
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const jar = new Map();
  const cookieHeader = () =>
    Array.from(jar.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

  async function api(pathname, options = {}) {
    const res = await fetch(base + pathname, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(jar.size ? { Cookie: cookieHeader() } : {}),
        ...(options.headers || {})
      }
    });

    const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const raw of setCookie) {
      const [pair] = raw.split(';');
      const [name, value] = pair.split('=');
      if (name && value) jar.set(name.trim(), value.trim());
    }

    const type = res.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await res.json() : await res.text();
    return { status: res.status, body, type };
  }

  const svg = async (pathname) => {
    const res = await fetch(base + pathname);
    const text = await res.text();
    return { status: res.status, type: res.headers.get('content-type') || '', text };
  };

  console.log('\n=== Biofran Ventures smoke test ===\n');
  console.log('--- health & site -------------------------------------------------');

  let r = await api('/api/health');
  check('GET /api/health', r.status === 200 && r.body.ok === true);

  r = await api('/api/site');
  check('GET /api/site returns branding', r.status === 200 && r.body.site.name === 'Biofran Ventures');
  check(
    'site exposes the three contact numbers',
    r.body.site.contacts.phones.map((p) => p.number).join(',') ===
      '08037211227,08141256339,07045723013'
  );
  check(
    'site exposes the three emails',
    r.body.site.contacts.emails.map((e) => e.address).join(',') ===
      'ifidonabraham249@gmail.com,abiodunifidon@gmail.com,francisifidon3@gmail.com'
  );
  check('site exposes departments', Array.isArray(r.body.departments) && r.body.departments.length === 3);
  check('site exposes the six gas / appliance services', r.body.storeServices.length === 6);
  check('site exposes Biofran Properties', r.body.property.phone === '07045723013');

  console.log('\n--- catalogue ------------------------------------------------------');

  r = await api('/api/categories');
  check('GET /api/categories', r.status === 200 && r.body.categories.length >= 12);
  check('every category has an image + preview', r.body.categories.every((c) => c.image && c.preview));

  r = await api('/api/products?limit=5');
  check('GET /api/products paginates', r.status === 200 && r.body.products.length === 5);
  check('catalogue meta reports the total', r.body.meta.total >= 60, `total=${r.body.meta.total}`);
  check(
    'every product has image + preview + gallery',
    r.body.products.every(
      (p) => p.image && p.preview && Array.isArray(p.gallery) && p.gallery.length >= 3
    )
  );

  r = await api('/api/products?category=gas-refill');
  check('filter by the gas-refill category', r.status === 200 && r.body.products.length >= 4);

  r = await api('/api/products?group=gas&limit=100');
  check('filter by the gas department', r.body.meta.total >= 15, `total=${r.body.meta.total}`);

  r = await api('/api/products?q=cylinder&limit=50');
  check('search finds cylinders', r.body.meta.total >= 3, `total=${r.body.meta.total}`);

  r = await api('/api/products?sort=price-asc&limit=100');
  const prices = r.body.products.map((p) => p.price);
  check('sort price ascending works', prices.every((v, i) => i === 0 || prices[i - 1] <= v));

  r = await api('/api/products/filters');
  check('GET /api/products/filters', r.status === 200 && r.body.brands.length > 0);

  r = await api('/api/products/premium-oxford-shirt');
  check('GET /api/products/:slug', r.status === 200 && r.body.product.name === 'Premium Oxford Shirt');
  check('product detail includes related items', r.body.related.length > 0);

  r = await api('/api/products/does-not-exist');
  check('unknown product returns 404', r.status === 404);

  /* ============================================================ ARTWORK ==
   * Every image link must resolve - otherwise the storefront shows a broken
   * picture. The preview link must be the matching high-resolution version.
   * ==================================================================== */
  console.log('\n--- generated artwork ----------------------------------------------');

  let img = await svg('/img/p/premium-oxford-shirt.svg');
  check('product image is an SVG', img.status === 200 && img.type.includes('svg'));
  check('product image contains the product name', img.text.includes('Premium Oxford Shirt'));

  img = await svg('/img/p/premium-oxford-shirt.svg?size=1400');
  check('high resolution preview link renders', img.status === 200 && img.text.includes('width="1400"'));

  img = await svg('/img/p/premium-oxford-shirt.svg?v=2');
  check('gallery variant 2 renders', img.status === 200);

  img = await svg('/img/c/gas-refill.svg');
  check('category image renders', img.status === 200 && img.text.includes('Gas Refill'));

  img = await svg('/img/c/group-gas.svg');
  check('department image renders', img.status === 200);

  img = await svg('/img/logo.svg');
  check('logo renders', img.status === 200);

  img = await svg('/img/p/nope.svg');
  check('unknown image returns 404 SVG (never a broken <img>)', img.status === 404);

  /* ======================================================== PROPERTIES == */
  console.log('\n--- properties (Biofran Properties) --------------------------------');

  r = await api('/api/properties');
  check('GET /api/properties', r.status === 200 && r.body.meta.total === 10);
  check('listings carry image + preview', r.body.properties.every((p) => p.image && p.preview));

  r = await api('/api/properties?purpose=For%20Rent');
  check('filter listings by purpose', r.body.properties.every((p) => p.purpose === 'For Rent'));

  r = await api('/api/properties?city=Lagos');
  check('filter listings by city', r.body.properties.every((p) => p.city === 'Lagos'));

  r = await api('/api/properties/filters');
  check('property filters expose cities', r.status === 200 && r.body.cities.includes('Benin City'));

  const propertySlug = (await api('/api/properties')).body.properties[0].slug;
  r = await api(`/api/properties/${propertySlug}`);
  check('GET /api/properties/:slug', r.status === 200 && r.body.property.slug === propertySlug);

  img = await svg(`/img/pr/${propertySlug}.svg`);
  check('property image renders', img.status === 200);

  /* ============================================================== AUTH == */
  console.log('\n--- authentication -------------------------------------------------');

  const email = `smoke${Date.now()}@example.com`;

  r = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Smoke Tester', email, phone: '08037211227', password: 'secret123' })
  });
  check('POST /api/auth/register', r.status === 201 && r.body.user.email === email);
  check('register never leaks the password hash', !JSON.stringify(r.body).includes('passwordHash'));

  r = await api('/api/auth/me');
  check('GET /api/auth/me returns the session user', r.body.user && r.body.user.email === email);

  r = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Dup', email, phone: '08037211227', password: 'secret123' })
  });
  check('duplicate email is rejected', r.status === 400);

  r = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'wrong-password' })
  });
  check('wrong password is rejected', r.status === 401);

  /* ============================================================== CART == */
  console.log('\n--- shopping cart --------------------------------------------------');

  r = await api('/api/cart');
  check('GET /api/cart starts empty', r.status === 200 && r.body.cart.items.length === 0);

  r = await api('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ slug: '12-5kg-cooking-gas-refill', quantity: 1 })
  });
  check('add a gas refill to the cart', r.status === 201 && r.body.cart.items.length === 1);

  r = await api('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ slug: 'premium-oxford-shirt', quantity: 2 })
  });
  check('add a shirt to the cart', r.status === 201 && r.body.summary.itemCount === 3);

  r = await api('/api/cart/delivery', {
    method: 'POST',
    body: JSON.stringify({ deliveryMethod: 'gas-delivery' })
  });
  check('gas delivery option is offered', r.body.summary.options.some((o) => o.id === 'gas-delivery'));
  check('chosen delivery is applied', r.body.summary.deliveryId === 'gas-delivery');

  const itemId = (await api('/api/cart')).body.cart.items[0].id;
  r = await api(`/api/cart/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity: 5 }) });
  check('PATCH cart item quantity', r.status === 200 && r.body.summary.itemCount === 7);

  r = await api(`/api/cart/${itemId}`, { method: 'DELETE' });
  check('DELETE cart item', r.status === 200 && r.body.cart.items.length === 1);

  /* =========================================== CHECKOUT & ORDER PROCESS ==
   * Placing an order must freeze the cart lines, empty the cart, produce a
   * trackable reference and be visible to the administrator.
   * ==================================================================== */
  console.log('\n--- order processing ----------------------------------------------');

  r = await api('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Tester',
      email,
      phone: '08037211227',
      addressLine1: 'Main Road',
      city: 'Benin City',
      state: 'Edo State',
      deliveryMethod: 'within-city',
      paymentMethod: 'transfer',
      notes: 'Please call before delivery.'
    })
  });
  check('POST /api/orders places an order', r.status === 201 && r.body.order.reference.startsWith('BFV-'));
  check('order carries a status timeline', Array.isArray(r.body.timeline) && r.body.timeline.length === 6);
  check('order returns a WhatsApp confirmation link', String(r.body.whatsapp).includes('wa.me'));
  check('order freezes the line items', r.body.order.items.length === 1 && r.body.order.items[0].price > 0);

  const reference = r.body.order.reference;
  const orderId = r.body.order.id;

  r = await api('/api/cart');
  check('cart is emptied after checkout', r.body.cart.items.length === 0);

  r = await api(`/api/orders/track?reference=${reference}&email=${encodeURIComponent(email)}`);
  check('GET /api/orders/track with the matching email', r.status === 200 && r.body.order.reference === reference);

  r = await api(`/api/orders/track?reference=${reference}&email=someone-else@example.com`);
  check('tracking with the wrong email is refused', r.status === 403);

  r = await api('/api/orders/mine');
  check('GET /api/orders/mine lists the order', r.body.orders.some((o) => o.reference === reference));

  r = await api('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      name: 'X',
      email: 'not-an-email',
      phone: '1',
      deliveryMethod: 'pickup',
      paymentMethod: 'transfer'
    })
  });
  check('checkout validation rejects bad input', r.status === 400);

  /* ============================================ CONTACT & ADMIN PANEL == */
  console.log('\n--- contact, enquiries & admin -------------------------------------');

  r = await api('/api/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Tester',
      email,
      phone: '08037211227',
      topic: 'Gas refill booking',
      message: 'Please refill my 12.5kg cylinder tomorrow morning.'
    })
  });
  check('POST /api/contact saves an enquiry', r.status === 201 && r.body.enquiry.topic === 'Gas refill booking');

  r = await api('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email: `news${Date.now()}@example.com` })
  });
  check('POST /api/newsletter subscribes', r.status === 201);

  r = await api('/api/gas-enquiry', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Tester',
      email,
      phone: '08141256339',
      cylinder: '12.5kg',
      mode: 'pickup',
      message: 'I will come by at 4pm.'
    })
  });
  check('POST /api/gas-enquiry books a refill', r.status === 201 && r.body.gasPhone === '08141256339');

  r = await api('/api/admin/stats');
  check('a customer is blocked from /api/admin', r.status === 403);

  await api('/api/auth/logout');
  r = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'ifidonabraham249@gmail.com', password: 'Biofran@Admin1' })
  });
  check('the administrator can log in', r.status === 200 && r.body.user.role === 'admin');

  r = await api('/api/admin/stats');
  check('GET /api/admin/stats', r.status === 200 && r.body.stats.totalOrders >= 1);
  check('admin sees low stock warnings', Array.isArray(r.body.stats.lowStock));

  r = await api('/api/admin/orders');
  check('GET /api/admin/orders', r.status === 200 && r.body.orders.length >= 1);

  r = await api(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'confirmed', note: 'Confirmed by the smoke test.' })
  });
  check('PATCH order status', r.status === 200 && r.body.order.status === 'confirmed');
  check('the status change is written to history', r.body.order.history.length >= 2);

  r = await api('/api/admin/enquiries');
  check('GET /api/admin/enquiries', r.status === 200 && r.body.enquiries.length >= 1);

  r = await api('/api/admin/customers');
  check('GET /api/admin/customers', r.status === 200 && r.body.customers.length >= 1);

  r = await api('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({ name: 'Smoke Test Product', price: 1234, stock: 3, category: 'men-clothing' })
  });
  check('POST /api/admin/products creates a product', r.status === 201);
  const createdId = r.body.product.id;

  r = await api(`/api/admin/products/${createdId}`, { method: 'DELETE' });
  check('DELETE /api/admin/products/:id', r.status === 200);

  /* ============================================================ PAGES == */
  console.log('\n--- static storefront ----------------------------------------------');

  const firstProduct = (await api('/api/products?limit=1')).body.products[0].slug;
  const firstProperty = (await api('/api/properties?limit=1')).body.properties[0].slug;

  const pages = [
    '/',
    '/shop',
    '/gas',
    '/properties',
    '/cart',
    '/checkout',
    '/login',
    '/register',
    '/about',
    '/contact',
    '/account',
    '/admin',
    `/product/${firstProduct}`,
    `/property/${firstProperty}`
  ];

  for (const page of pages) {
    const res = await fetch(base + page);
    const html = res.status === 200 ? await res.text() : '';
    check(`serves ${page}`, res.status === 200 && html.toLowerCase().includes('<html'));
  }

  const missing = await fetch(base + '/definitely-not-a-page');
  check('unknown page returns 404', missing.status === 404);

  /* ------------------------------------------------------------------ */
  console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
  server.close();
  process.exit(failed === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nSmoke test crashed:', err);
    process.exit(1);
  });
}

module.exports = { main };
