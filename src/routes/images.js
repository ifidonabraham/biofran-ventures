'use strict';

/**
 * Generated artwork routes.
 *
 *   /img/p/<slug>.svg?v=1&size=1400   product images (v switches the palette)
 *   /img/c/<key>.svg                  category tiles
 *   /img/c/group-<key>.svg            department tiles
 *   /img/pr/<slug>.svg                property listing images
 *   /img/logo.svg                     brand mark
 *
 * Because every image is generated we can guarantee the "preview" link always
 * matches the picture shown in the grid - there are no broken images.
 */

const express = require('express');
const artwork = require('../artwork');
const catalog = require('../catalog');
const productModel = require('../models/product');
const propertyModel = require('../models/property');
const config = require('../config');

const router = express.Router();

const stripSvg = (value) => String(value || '').replace(/\.svg$/i, '');
const clampSize = (value, fallback = 900) => Math.max(120, Math.min(2000, Number(value) || fallback));
const clampVariant = (value) => Math.max(1, Math.min(6, Number(value) || 0)) || 0;

function sendSvg(res, svg) {
  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=604800, immutable');
  res.send(svg);
}

function notFound(res, what) {
  res
    .status(404)
    .set('Content-Type', 'image/svg+xml; charset=utf-8')
    .send(
      artwork.renderScene({
        name: 'Image not found',
        label: what,
        kind: 'generic',
        palette: 'general',
        size: 400
      })
    );
}

/* ------------------------------------------------------------- products */
router.get('/p/:file', (req, res) => {
  const slug = stripSvg(req.params.file);
  const product = productModel.bySlug(slug);
  if (!product) return notFound(res, slug);

  const size = clampSize(req.query.size, 900);
  const variant = clampVariant(req.query.v);

  return sendSvg(
    res,
    artwork.renderScene({
      name: product.name,
      label: product.categoryLabel || product.brand,
      kicker: 'Biofran Ventures',
      kind: product.icon,
      palette: product.category,
      variant: variant || (artwork.hash(product.slug) % 3) + 1,
      size
    })
  );
});

/* ----------------------------------------------------------- categories */
router.get('/c/:file', (req, res) => {
  const key = stripSvg(req.params.file);
  const size = clampSize(req.query.size, 900);

  if (key.startsWith('group-')) {
    const group = catalog.groupByKey(key.replace('group-', ''));
    if (!group) return notFound(res, key);
    return sendSvg(
      res,
      artwork.renderScene({
        name: group.title,
        label: group.tagline,
        kicker: 'Biofran Ventures',
        kind: group.icon,
        palette: group.key === 'gas' ? 'gas-refill' : group.key === 'appliances' ? 'home-appliances' : 'men-clothing',
        variant: (artwork.hash(group.key) % 3) + 1,
        size
      })
    );
  }

  const category = catalog.categoryByKey(key);
  if (!category) return notFound(res, key);

  return sendSvg(
    res,
    artwork.renderScene({
      name: category.title,
      label: category.tagline,
      kicker: 'Biofran Ventures',
      kind: category.icon,
      palette: category.key,
      variant: (artwork.hash(category.key) % 3) + 1,
      size
    })
  );
});

/* ----------------------------------------------------------- properties */
router.get('/pr/:file', (req, res) => {
  const slug = stripSvg(req.params.file);
  const property = propertyModel.bySlug(slug);
  if (!property) return notFound(res, slug);

  const size = clampSize(req.query.size, 900);
  const variant = clampVariant(req.query.v);

  return sendSvg(
    res,
    artwork.renderScene({
      name: property.title,
      label: `${property.purpose} · ${property.city}`,
      kicker: 'Biofran Properties',
      kind: property.icon || 'house',
      palette: 'properties',
      variant: variant || (artwork.hash(property.slug) % 3) + 1,
      size
    })
  );
});

/* ---------------------------------------------------------------- brand */
router.get('/logo.svg', (req, res) => {
  res.set('Cache-Control', 'public, max-age=604800');
  sendSvg(res, artwork.logo(240));
});

router.get('/favicon.svg', (req, res) => {
  res.set('Cache-Control', 'public, max-age=604800');
  sendSvg(res, artwork.logo(64));
});

/* ------------------------------------------------------------ hero art */
router.get('/hero.svg', (req, res) => {
  const group = req.query.group || 'fashion';
  const size = clampSize(req.query.size, 1400);
  sendSvg(
    res,
    artwork.renderScene({
      name: config.site.name,
      label: config.site.tagline,
      kicker: 'Fashion · Appliances · Gas · Property',
      kind: group === 'gas' ? 'flame' : group === 'appliances' ? 'fridge' : 'gown',
      palette: group === 'gas' ? 'gas-refill' : group === 'appliances' ? 'home-appliances' : 'women-clothing',
      variant: 2,
      size
    })
  );
});

module.exports = router;