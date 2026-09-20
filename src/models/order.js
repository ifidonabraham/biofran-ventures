'use strict';

/**
 * Order processing model.
 *
 * An order is created from the customer's cart. It stores a frozen snapshot of
 * every line item (name, price, image) so historic orders never change when
 * catalogue prices move, plus the contact details and delivery choice.
 */

const db = require('../db');
const { uid } = require('../db/store');
const config = require('../config');
const { orderReference, isEmail } = require('../utils');
const cartModel = require('./cart');
const productModel = require('./product');

const col = () => db.collection('orders');

const byId = (id) => col().findById(id);

const byReference = (reference) =>
  col().findOne((o) => String(o.reference).toLowerCase() === String(reference || '').toLowerCase());

const forUser = (userId) =>
  col()
    .find((o) => o.userId === userId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

const all = () =>
  col()
    .find()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

function statusLabel(status) {
  return String(status || '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Timeline steps shown on the order confirmation / tracking page. */
function timeline(order) {
  const flow = ['pending', 'confirmed', 'processing', 'ready', 'out-for-delivery', 'completed'];
  const currentIndex = flow.indexOf(order.status);
  const cancelled = order.status === 'cancelled';

  return flow.map((step, i) => ({
    key: step,
    label: statusLabel(step),
    done: !cancelled && currentIndex >= i,
    current: !cancelled && currentIndex === i
  }));
}

/**
 * Validate checkout input.
 * @returns {{ok:boolean, error?:string, data?:object}}
 */
function validateCheckout(input = {}) {
  const data = {
    customer: {
      name: String(input.name || '').trim(),
      email: String(input.email || '').trim().toLowerCase(),
      phone: String(input.phone || '').trim()
    },
    address: {
      line1: String(input.addressLine1 || '').trim(),
      line2: String(input.addressLine2 || '').trim(),
      city: String(input.city || '').trim(),
      state: String(input.state || '').trim()
    },
    deliveryMethod: String(input.deliveryMethod || 'pickup'),
    paymentMethod: String(input.paymentMethod || 'transfer'),
    notes: String(input.notes || '').trim()
  };

  if (data.customer.name.length < 2) {
    return { ok: false, error: 'Please enter the full name for this order.' };
  }
  if (!isEmail(data.customer.email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (data.customer.phone.replace(/\D/g, '').length < 10) {
    return { ok: false, error: 'Please enter a valid phone number so we can reach you.' };
  }
  if (data.deliveryMethod !== 'pickup') {
    if (!data.address.line1) return { ok: false, error: 'Please enter the delivery address.' };
    if (!data.address.city) return { ok: false, error: 'Please enter the city for delivery.' };
  }

  const validPayments = config.commerce.paymentMethods.map((p) => p.id);
  if (!validPayments.includes(data.paymentMethod)) {
    return { ok: false, error: 'Please choose a payment method.' };
  }

  const validDelivery = ['pickup', 'within-city', 'nationwide', 'gas-delivery'];
  if (!validDelivery.includes(data.deliveryMethod)) {
    return { ok: false, error: 'Please choose a valid delivery option.' };
  }

  return { ok: true, data };
}

/**
 * Place an order from the current cart.
 * @param {object} ctx   { userId, sessionId }
 * @param {object} input checkout form fields
 * @param {object} user  the signed-in user (optional)
 */
async function create(ctx, input, user = null) {
  const cart = await cartModel.get(ctx);
  if (!cart.items.length) return { ok: false, error: 'Your cart is empty.' };

  const check = validateCheckout(input);
  if (!check.ok) return check;
  const { data } = check;

  const pricing = cartModel.summary(cart, data.deliveryMethod);

  const items = cart.items.map((i) => ({
    productId: i.productId,
    slug: i.slug,
    name: i.name,
    brand: i.brand,
    category: i.category,
    group: i.group,
    unit: i.unit,
    variant: i.variant || '',
    price: i.price,
    qty: i.qty,
    lineTotal: i.price * i.qty,
    image: i.image,
    preview: i.preview
  }));

  const now = new Date().toISOString();
  const payment = config.commerce.paymentMethods.find((p) => p.id === data.paymentMethod);

  const order = await col().insert({
    id: uid('ord_'),
    reference: orderReference(new Date()),
    userId: user ? user.id : null,
    customer: data.customer,
    address: data.address,
    items,
    pricing: {
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      deliveryId: pricing.deliveryId,
      deliveryLabel: pricing.deliveryLabel,
      deliveryFee: pricing.deliveryFee,
      total: pricing.total
    },
    payment,
    paymentStatus: data.paymentMethod === 'transfer' ? 'awaiting-transfer' : 'pending',
    status: 'pending',
    statusLabel: statusLabel('pending'),
    notes: data.notes,
    history: [{ status: 'pending', at: now, note: 'Order placed on the website.' }],
    contactNumbers: config.site.contacts.phones.map((p) => p.number),
    contactEmails: config.site.contacts.emails.map((e) => e.address)
  });

  /* Reduce stock for physical goods (gas refills are unlimited). */
  for (const item of items) {
    await productModel.decrementStock(item.productId, item.qty);
  }

  await cartModel.clear(ctx);

  return { ok: true, order };
}

async function updateStatus(id, status, note = '') {
  if (!config.commerce.orderStatuses.includes(status)) {
    return { ok: false, error: `Unknown order status "${status}".` };
  }

  const order = byId(id);
  if (!order) return { ok: false, error: 'Order not found.' };

  const history = (order.history || []).concat([
    {
      status,
      at: new Date().toISOString(),
      note: note || `Status changed to ${statusLabel(status)}.`
    }
  ]);

  const updated = await col().updateById(id, {
    status,
    statusLabel: statusLabel(status),
    history
  });

  return { ok: true, order: updated };
}

async function cancel(id, note = '') {
  return updateStatus(id, 'cancelled', note || 'Order cancelled.');
}

/** Dashboard counters for the admin page. */
function stats() {
  const orders = all();
  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.pricing ? o.pricing.total : 0), 0);

  return {
    totalOrders: orders.length,
    revenue,
    pending: orders.filter((o) => o.status === 'pending').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    byStatus: config.commerce.orderStatuses.reduce((acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    }, {})
  };
}

/** Plain-text receipt lines used in the WhatsApp hand-off link. */
function receiptLines(order) {
  return (order.items || []).map(
    (i) =>
      `${i.qty} x ${i.name} — NGN ${Number(i.lineTotal).toLocaleString('en-NG')}`
  );
}

module.exports = {
  col,
  byId,
  byReference,
  forUser,
  all,
  create,
  updateStatus,
  cancel,
  stats,
  statusLabel,
  timeline,
  receiptLines,
  validateCheckout
};