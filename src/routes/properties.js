'use strict';

/**
 * Biofran Properties (housing agency) routes.
 *
 *   GET /api/properties            filter / sort / paginate listings
 *   GET /api/properties/filters    cities, purposes, types, price bands
 *   GET /api/properties/featured
 *   GET /api/properties/:slug
 */

const express = require('express');
const propertyModel = require('../models/property');
const { asyncHandler } = require('../middleware/errors');

const router = express.Router();

const bool = (v) => v === true || v === 'true' || v === '1';

router.get('/properties/filters', (req, res) => {
  res.json({
    ok: true,
    cities: propertyModel.cities(),
    purposes: propertyModel.purposes(),
    types: propertyModel.types(),
    priceBands: propertyModel.priceBands(),
    sorts: [
      { key: 'newest', label: 'Newest listings' },
      { key: 'price-asc', label: 'Price: low to high' },
      { key: 'price-desc', label: 'Price: high to low' },
      { key: 'bedrooms', label: 'Most bedrooms' }
    ]
  });
});

router.get('/properties/featured', (req, res) => {
  res.json({ ok: true, properties: propertyModel.featured(Number(req.query.limit) || 6) });
});

router.get('/properties', (req, res) => {
  const result = propertyModel.query({
    purpose: req.query.purpose,
    city: req.query.city,
    type: req.query.type,
    bedrooms: req.query.bedrooms,
    min: req.query.min,
    max: req.query.max,
    search: req.query.q || req.query.search,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit
  });

  res.json({ ok: true, properties: result.items, meta: result.meta });
});

router.get('/properties/:slug', (req, res) => {
  const property = propertyModel.bySlug(req.params.slug);
  if (!property) return res.status(404).json({ ok: false, error: 'Property listing not found.' });

  res.json({
    ok: true,
    property,
    related: propertyModel.related(property, 3)
  });
});

module.exports = router;