'use strict';

/**
 * Catalogue routes.
 *
 *   GET /api/categories                   departments + leaf categories
 *   GET /api/categories/:key
 *   GET /api/products                     filter / sort / paginate
 *   GET /api/products/filters             facet data for the shop sidebar
 *   GET /api/products/featured
 *   GET /api/products/:slug
 *   GET /api/products/:slug/related
 */

const express = require('express');
const catalog = require('../catalog');
const productModel = require('../models/product');
const { asyncHandler } = require('../middleware/errors');

const router = express.Router();

/* ---------------------------------------------------------- categories */
router.get('/categories', (req, res) => {
  const counts = productModel.categoryCounts();
  const groupCounts = productModel.groupCounts();

  res.json({
    ok: true,
    groups: catalog.allGroups().map((g) => ({
      ...g,
      productCount: groupCounts[g.key] || 0
    })),
    categories: catalog.allCategories().map((c) => ({
      ...c,
      groupTitle: catalog.groupLabel(c.group),
      productCount: counts[c.key] || 0
    }))
  });
});

router.get('/categories/:key', (req, res) => {
  const category = catalog.categoryByKey(req.params.key);
  if (!category) return res.status(404).json({ ok: false, error: 'Category not found.' });

  const decorated = catalog.allCategories().find((c) => c.key === category.key);
  return res.json({ ok: true, category: decorated });
});

/* ------------------------------------------------------------ products */
const bool = (v) => v === true || v === 'true' || v === '1';

router.get('/products/filters', (req, res) => {
  const counts = productModel.categoryCounts();
  const bounds = productModel.priceBounds();

  res.json({
    ok: true,
    categories: catalog.allCategories().map((c) => ({
      key: c.key,
      title: c.title,
      group: c.group,
      groupTitle: catalog.groupLabel(c.group),
      count: counts[c.key] || 0
    })),
    brands: productModel.brands(),
    price: bounds,
    sorts: [
      { key: 'featured', label: 'Featured' },
      { key: 'newest', label: 'Newest arrivals' },
      { key: 'price-asc', label: 'Price: low to high' },
      { key: 'price-desc', label: 'Price: high to low' },
      { key: 'rating', label: 'Top rated' },
      { key: 'popular', label: 'Most reviewed' },
      { key: 'discount', label: 'Biggest discount' }
    ]
  });
});

router.get('/products/featured', (req, res) => {
  res.json({ ok: true, products: productModel.featured(Number(req.query.limit) || 8) });
});

router.get('/products', (req, res) => {
  const result = productModel.query({
    group: req.query.group,
    category: req.query.category,
    brand: req.query.brand,
    search: req.query.q || req.query.search,
    min: req.query.min,
    max: req.query.max,
    sort: req.query.sort,
    badge: req.query.badge,
    featured: bool(req.query.featured),
    onSale: bool(req.query.onSale || req.query.sale),
    inStock: bool(req.query.inStock),
    page: req.query.page,
    limit: req.query.limit
  });

  res.json({
    ok: true,
    products: result.items,
    meta: result.meta,
    applied: {
      category: req.query.category || null,
      group: req.query.group || null,
      search: req.query.q || req.query.search || null,
      sort: req.query.sort || 'featured'
    }
  });
});

router.get('/products/:slug', (req, res) => {
  const product = productModel.bySlug(req.params.slug);
  if (!product) return res.status(404).json({ ok: false, error: 'Product not found.' });

  const category = catalog.categoryByKey(product.category);
  const group = catalog.groupByKey(product.group);

  return res.json({
    ok: true,
    product: {
      ...product,
      categoryInfo: category,
      groupInfo: group
    },
    related: productModel.related(product, 4)
  });
});

router.get('/products/:slug/related', (req, res) => {
  const product = productModel.bySlug(req.params.slug);
  if (!product) return res.status(404).json({ ok: false, error: 'Product not found.' });
  res.json({ ok: true, products: productModel.related(product, Number(req.query.limit) || 4) });
});

module.exports = router;