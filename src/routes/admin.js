'use strict';

/**
 * Administrator routes - used by /admin.html
 *
 *   GET   /api/admin/stats
 *   GET   /api/admin/orders
 *   PATCH /api/admin/orders/:id/status   { status, note }
 *   GET   /api/admin/customers
 *   GET   /api/admin/enquiries
 *   PATCH /api/admin/enquiries/:id       { handled }
 *   GET   /api/admin/newsletter
 *   POST  /api/admin/products            create or update a product
 *   DELETE /api/admin/products/:id
 */

const express = require('express');
const orderModel = require('../models/order');
const productModel = require('../models/product');
const userModel = require('../models/user');
const messageModel = require('../models/message');
const { asyncHandler } = require('../middleware/errors');
const { requireAdmin } = require('../middleware/auth');
const { slugify } = require('../utils');
const catalog = require('../catalog');

const router = express.Router();

router.use(requireAdmin);

router.get('/stats', (req, res) => {
  const orders = orderModel.all();
  const customers = userModel.col().find((u) => u.role !== 'admin');

  const topSellers = {};
  for (const order of orders) {
    for (const item of order.items || []) {
      const key = item.slug;
      if (!topSellers[key]) {
        topSellers[key] = { slug: key, name: item.name, image: item.image, qty: 0, revenue: 0 };
      }
      topSellers[key].qty += item.qty;
      topSellers[key].revenue += item.lineTotal;
    }
  }

  res.json({
    ok: true,
    stats: {
      ...orderModel.stats(),
      products: productModel.all().length,
      customers: customers.length,
      lowStock: productModel
        .all()
        .filter((p) => p.group !== 'gas-refill' && p.stock <= 5)
        .map((p) => ({ slug: p.slug, name: p.name, stock: p.stock, image: p.image }))
    },
    recentOrders: orders.slice(0, 8),
    topSellers: Object.values(topSellers)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)
  });
});

router.get('/orders', (req, res) => {
  const { status, q } = req.query;
  let orders = orderModel.all();

  if (status) orders = orders.filter((o) => o.status === status);
  if (q) {
    const needle = String(q).toLowerCase();
    orders = orders.filter(
      (o) =>
        String(o.reference).toLowerCase().includes(needle) ||
        o.customer.name.toLowerCase().includes(needle) ||
        o.customer.email.toLowerCase().includes(needle) ||
        o.customer.phone.includes(needle)
    );
  }

  res.json({ ok: true, orders, total: orders.length });
});

router.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const { status, note } = req.body || {};
    const result = await orderModel.updateStatus(req.params.id, status, note);
    if (!result.ok) return res.status(400).json(result);
    res.json({ ok: true, order: result.order, message: `Order marked as ${result.order.statusLabel}.` });
  })
);

router.get('/customers', (req, res) => {
  const orders = orderModel.all();
  const customers = userModel
    .col()
    .find((u) => u.role !== 'admin')
    .map((u) => {
      const mine = orders.filter((o) => o.userId === u.id);
      return {
        ...userModel.safe(u),
        orderCount: mine.length,
        spend: mine.reduce((sum, o) => sum + (o.pricing ? o.pricing.total : 0), 0)
      };
    });

  res.json({ ok: true, customers });
});

router.get('/enquiries', (req, res) => {
  res.json({
    ok: true,
    enquiries: messageModel
      .enquiryCol()
      .all()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  });
});

router.patch(
  '/enquiries/:id',
  asyncHandler(async (req, res) => {
    const updated = await messageModel
      .enquiryCol()
      .updateById(req.params.id, { handled: Boolean((req.body || {}).handled) });
    if (!updated) return res.status(404).json({ ok: false, error: 'Enquiry not found.' });
    res.json({ ok: true, enquiry: updated });
  })
);

router.get('/newsletter', (req, res) => {
  res.json({ ok: true, subscribers: messageModel.newsletterCol().all() });
});

/* ------------------------------------------------------- product admin */
router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    if (!name) return res.status(400).json({ ok: false, error: 'A product name is required.' });

    const slug = body.slug ? String(body.slug) : slugify(name);
    const existing = productModel.bySlug(slug);

    const doc = {
      slug,
      name,
      price: Number(body.price) || 0,
      oldPrice: Number(body.oldPrice) || 0,
      stock: Number(body.stock) || 0,
      category: body.category || 'men-clothing',
      brand: body.brand || 'Biofran Select',
      description: body.description || '',
      shortDescription: body.description || '',
      icon: body.icon || 'generic',
      image: body.image || catalog.categoryByKey(body.category || 'men-clothing')?.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      preview: body.preview || body.image || catalog.categoryByKey(body.category || 'men-clothing')?.preview || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      active: body.active !== false
    };

    if (existing) {
      const updated = await productModel.col().updateById(existing.id, doc);
      return res.json({ ok: true, product: updated, message: 'Product updated.' });
    }

    const created = await productModel.col().insert({
      ...doc,
      unit: body.unit || 'per unit',
      rating: 5,
      reviews: 0,
      discountPercent: 0,
      featured: Boolean(body.featured),
      features: body.features || [],
      specs: body.specs || {},
      gallery: [
        { label: 'Front view', url: doc.image, preview: doc.preview },
        { label: 'Detail', url: doc.image, preview: doc.preview }
      ],
      tags: [],
      searchText: `${name} ${body.brand || ''} ${body.category || ''}`.toLowerCase()
    });

    return res.status(201).json({ ok: true, product: created, message: 'Product created.' });
  })
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const removed = await productModel.col().removeById(req.params.id);
    if (!removed) return res.status(404).json({ ok: false, error: 'Product not found.' });
    res.json({ ok: true, message: `"${removed.name}" was removed from the catalogue.` });
  })
);

module.exports = router;