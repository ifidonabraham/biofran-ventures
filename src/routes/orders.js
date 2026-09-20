'use strict';

/**
 * Order processing routes.
 *
 *   POST /api/orders                 place an order from the cart (guest or user)
 *   GET  /api/orders/mine            signed-in customer's order history
 *   GET  /api/orders/track?reference=BFV-...&email=...
 *   GET  /api/orders/:id             owner, admin, or reference+email tracked
 */

const express = require('express');
const orderModel = require('../models/order');
const messageModel = require('../models/message');
const config = require('../config');
const { asyncHandler } = require('../middleware/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/** Build a WhatsApp hand-off link so the customer can confirm in one tap. */
function whatsappLink(order) {
  const lines = [
    `Hello Biofran Ventures, I just placed order ${order.reference}.`,
    '',
    ...orderModel.receiptLines(order),
    '',
    `Subtotal: NGN ${Number(order.pricing.subtotal).toLocaleString('en-NG')}`,
    `${order.pricing.deliveryLabel}: NGN ${Number(order.pricing.deliveryFee).toLocaleString('en-NG')}`,
    `Total: NGN ${Number(order.pricing.total).toLocaleString('en-NG')}`,
    '',
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Delivery: ${order.pricing.deliveryLabel}`,
    `Payment: ${order.payment ? order.payment.label : 'To be confirmed'}`
  ];
  return `https://wa.me/${config.site.contacts.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    lines.join('\n')
  )}`;
}

router.post(
  '/orders',
  asyncHandler(async (req, res) => {
    const result = await orderModel.create(req.ctx, req.body || {}, req.user);
    if (!result.ok) return res.status(400).json(result);

    await messageModel.logMessage({
      type: 'order-placed',
      orderId: result.order.id,
      reference: result.order.reference,
      to: result.order.customer.email,
      subject: `Biofran Ventures order ${result.order.reference}`,
      body: orderModel.receiptLines(result.order).join('\n')
    });

    res.status(201).json({
      ok: true,
      order: result.order,
      timeline: orderModel.timeline(result.order),
      whatsapp: whatsappLink(result.order),
      message: `Order ${result.order.reference} received. We will call you shortly to confirm.`
    });
  })
);

router.get(
  '/orders/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ ok: true, orders: orderModel.forUser(req.user.id) });
  })
);

router.get(
  '/orders/track',
  asyncHandler(async (req, res) => {
    const { reference, email } = req.query;
    if (!reference) return res.status(400).json({ ok: false, error: 'Please provide your order reference.' });

    const order = orderModel.byReference(reference);
    if (!order) return res.status(404).json({ ok: false, error: 'No order found with that reference.' });

    const providedEmail = email ? String(email).trim().toLowerCase() : null;
    const orderEmail = String(order.customer.email || '').toLowerCase();
    const emailMatches = providedEmail && providedEmail === orderEmail;
    const isOwner = req.user && order.userId === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (providedEmail && !emailMatches) {
      return res.status(403).json({
        ok: false,
        error: 'That reference does not match the email on the order. Please check and try again.'
      });
    }

    if (!providedEmail && !isOwner && !isAdmin) {
      return res.status(403).json({
        ok: false,
        error: 'Please provide the email address used to place this order.'
      });
    }

    return res.json({ ok: true, order, timeline: orderModel.timeline(order) });
  })
);

router.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const order = orderModel.byId(req.params.id);
    if (!order) return res.status(404).json({ ok: false, error: 'Order not found.' });

    const isOwner = req.user && order.userId === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ ok: false, error: 'You do not have access to that order.' });
    }

    res.json({ ok: true, order, timeline: orderModel.timeline(order), whatsapp: whatsappLink(order) });
  })
);

module.exports = router;
module.exports.whatsappLink = whatsappLink;