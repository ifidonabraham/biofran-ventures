'use strict';

/**
 * Shopping cart model.
 *
 * A cart belongs either to a signed-in user (ownerKey "u:<userId>") or to a
 * guest browser session (ownerKey "s:<sessionId>"). When a guest logs in or
 * registers, their guest cart is merged into their user cart so nothing is
 * ever lost.
 */

const db = require('../db');
const { uid } = require('../db/store');
const config = require('../config');

const col = () => db.collection('carts');

const ownerKeyFor = (ctx) =>
  ctx && ctx.userId ? `u:${ctx.userId}` : `s:${ctx.sessionId}`;

const find = (ctx) => col().findOne((c) => c.ownerKey === ownerKeyFor(ctx));

/** Get (creating if needed) the cart document for this owner. */
async function get(ctx) {
  const existing = find(ctx);
  if (existing) return existing;

  return col().insert({
    id: uid('cart_'),
    ownerKey: ownerKeyFor(ctx),
    userId: ctx.userId || null,
    sessionId: ctx.sessionId || null,
    items: []
  });
}

const MAX_QTY = 99;

/** Add a product (or bump its quantity). */
async function add(ctx, product, quantity = 1, variant = '') {
  const cart = await get(ctx);
  const qty = Math.max(1, Math.min(MAX_QTY, Number(quantity) || 1));
  const items = cart.items.slice();
  const idx = items.findIndex((i) => i.productId === product.id && i.variant === variant);

  if (idx > -1) {
    items[idx] = { ...items[idx], qty: Math.min(MAX_QTY, items[idx].qty + qty) };
  } else {
    items.push({
      id: uid('ci_'),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      group: product.group,
      unit: product.unit,
      price: product.price,
      oldPrice: product.oldPrice || 0,
      image: product.image,
      preview: product.preview,
      variant,
      qty,
      stock: product.stock
    });
  }

  await col().updateById(cart.id, { items });
  return get(ctx);
}

/** Set an exact quantity (quantity 0 removes the line). */
async function setQuantity(ctx, itemId, quantity) {
  const cart = await get(ctx);
  const qty = Math.max(0, Math.min(MAX_QTY, Number(quantity) || 0));
  let items = cart.items.slice();

  if (qty === 0) {
    items = items.filter((i) => i.id !== itemId);
  } else {
    items = items.map((i) => (i.id === itemId ? { ...i, qty } : i));
  }

  await col().updateById(cart.id, { items });
  return get(ctx);
}

async function remove(ctx, itemId) {
  const cart = await get(ctx);
  const items = cart.items.filter((i) => i.id !== itemId);
  await col().updateById(cart.id, { items });
  return get(ctx);
}

async function clear(ctx) {
  const cart = await get(ctx);
  await col().updateById(cart.id, { items: [] });
  return get(ctx);
}

/** Move a guest cart into the signed-in user's cart. */
async function merge(sessionId, userId) {
  const guest = col().findOne((c) => c.ownerKey === `s:${sessionId}`);
  if (!guest || !guest.items.length) return null;

  const target = await get({ userId, sessionId });
  const items = target.items.slice();

  for (const guestItem of guest.items) {
    const idx = items.findIndex(
      (i) => i.productId === guestItem.productId && i.variant === guestItem.variant
    );
    if (idx > -1) {
      items[idx] = { ...items[idx], qty: Math.min(MAX_QTY, items[idx].qty + guestItem.qty) };
    } else {
      items.push({ ...guestItem, id: uid('ci_') });
    }
  }

  await col().updateById(target.id, { items });
  await col().updateById(guest.id, { items: [], mergedInto: target.id });
  return get({ userId, sessionId });
}

/** Cart badge number. */
const count = (cart) => (cart ? cart.items.reduce((n, i) => n + i.qty, 0) : 0);

const subtotalOf = (cart) =>
  cart ? cart.items.reduce((sum, i) => sum + i.price * i.qty, 0) : 0;

/** Delivery options depend on what is in the cart. */
function deliveryOptions(cart) {
  const subtotal = subtotalOf(cart);
  const hasGas = Boolean(cart && cart.items.some((i) => i.group === 'gas'));
  const freeOver = subtotal >= config.commerce.freeDeliveryThreshold;

  const options = [
    {
      id: 'pickup',
      label: 'Pick up at our store',
      note: 'Collect from Biofran Ventures — we will call you when it is ready.',
      fee: 0
    },
    {
      id: 'within-city',
      label: 'Delivery within the city',
      note: freeOver ? 'Free — your order qualifies for free delivery.' : 'Same-day or next-day delivery.',
      fee: freeOver ? 0 : config.commerce.deliveryFees['within-city']
    },
    {
      id: 'nationwide',
      label: 'Nationwide delivery',
      note: freeOver ? 'Free — your order qualifies for free delivery.' : '2 – 5 working days by courier.',
      fee: freeOver ? 0 : config.commerce.deliveryFees.nationwide
    }
  ];

  if (hasGas) {
    options.push({
      id: 'gas-delivery',
      label: 'Gas doorstep delivery',
      note: 'Our team delivers the filled cylinder to your door and takes the empty one.',
      fee: config.commerce.gasDeliveryFee
    });
  }

  return options;
}

/** Pricing summary used by the cart page, checkout and orders. */
function summary(cart, deliveryId = 'pickup') {
  const subtotal = subtotalOf(cart);
  const options = deliveryOptions(cart);
  const chosen = options.find((o) => o.id === deliveryId) || options[0];
  const discount = 0;
  const total = Math.max(0, subtotal - discount) + chosen.fee;

  return {
    itemCount: count(cart),
    subtotal,
    discount,
    deliveryId: chosen.id,
    deliveryLabel: chosen.label,
    deliveryFee: chosen.fee,
    total,
    freeDeliveryThreshold: config.commerce.freeDeliveryThreshold,
    qualifiesForFreeDelivery: subtotal >= config.commerce.freeDeliveryThreshold,
    options
  };
}

module.exports = {
  col,
  get,
  add,
  setQuantity,
  remove,
  clear,
  merge,
  count,
  subtotalOf,
  deliveryOptions,
  summary,
  MAX_QTY
};