'use strict';

/**
 * Shopping cart routes. Works for guests (session based) and signed-in users.
 *
 *   GET    /api/cart
 *   POST   /api/cart            { slug | productId, quantity, variant }
 *   PATCH  /api/cart/:itemId    { quantity }
 *   DELETE /api/cart/:itemId
 *   DELETE /api/cart
 *   POST   /api/cart/delivery   { deliveryMethod }  -> repriced summary
 */

const express = require('express');
const cartModel = require('../models/cart');
const productModel = require('../models/product');
const config = require('../config');
const { asyncHandler } = require('../middleware/errors');

const router = express.Router();

async function payload(req, deliveryId) {
  const cart = await cartModel.get(req.ctx);
  const summary = cartModel.summary(cart, deliveryId || req.query.delivery || 'pickup');
  return { ok: true, cart, summary, meta: { currency: config.currency, config: publicConfig() } };
}

function publicConfig() {
  return {
    currency: config.currency,
    freeDeliveryThreshold: config.commerce.freeDeliveryThreshold,
    paymentMethods: config.commerce.paymentMethods,
    deliveryFees: config.commerce.deliveryFees,
    gasDeliveryFee: config.commerce.gasDeliveryFee
  };
}

router.get(
  '/cart',
  asyncHandler(async (req, res) => {
    res.json(await payload(req));
  })
);

router.post(
  '/cart',
  asyncHandler(async (req, res) => {
    const { slug, productId, quantity, variant } = req.body || {};
    const product = slug ? productModel.bySlug(slug) : productId ? productModel.byId(productId) : null;

    if (!product) return res.status(404).json({ ok: false, error: 'That product could not be found.' });
    if (product.stock === 0) {
      return res.status(400).json({ ok: false, error: 'That item is currently out of stock.' });
    }

    const cart = await cartModel.add(req.ctx, product, quantity, variant || '');
    const summary = cartModel.summary(cart, req.body.delivery || 'pickup');

    res.status(201).json({
      ok: true,
      cart,
      summary,
      message: `${product.name} was added to your cart.`
    });
  })
);

router.patch(
  '/cart/:itemId',
  asyncHandler(async (req, res) => {
    const cart = await cartModel.setQuantity(req.ctx, req.params.itemId, req.body.quantity);
    res.json({ ok: true, cart, summary: cartModel.summary(cart) });
  })
);

router.delete(
  '/cart/:itemId',
  asyncHandler(async (req, res) => {
    const cart = await cartModel.remove(req.ctx, req.params.itemId);
    res.json({ ok: true, cart, summary: cartModel.summary(cart), message: 'Item removed from your cart.' });
  })
);

router.delete(
  '/cart',
  asyncHandler(async (req, res) => {
    const cart = await cartModel.clear(req.ctx);
    res.json({ ok: true, cart, summary: cartModel.summary(cart), message: 'Your cart is now empty.' });
  })
);

router.post(
  '/cart/delivery',
  asyncHandler(async (req, res) => {
    const cart = await cartModel.get(req.ctx);
    const summary = cartModel.summary(cart, (req.body || {}).deliveryMethod);
    res.json({ ok: true, summary });
  })
);

module.exports = router;
module.exports.publicConfig = publicConfig;