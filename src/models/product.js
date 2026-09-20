'use strict';

const db = require('../db');
const { normalise, paginate } = require('../utils');

const col = () => db.collection('products');

const all = () => col().find((p) => p.active !== false);

const bySlug = (slug) => col().findOne((p) => p.slug === slug && p.active !== false);

const byId = (id) => col().findById(id);

const byCategory = (category) => all().filter((p) => p.category === category);

const byGroup = (group) => all().filter((p) => p.group === group);

const featured = (limit = 8) =>
  all()
    .filter((p) => p.featured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

/** Newest first - products are seeded in order so the last ones are "new". */
const newest = (limit = 8) => all().slice(-limit).reverse();

const onSale = (limit = 8) =>
  all()
    .filter((p) => p.discountPercent > 0)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, limit);

const SORTS = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  popular: (a, b) => b.reviews - a.reviews,
  discount: (a, b) => b.discountPercent - a.discountPercent,
  newest: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt))
};

/**
 * Filter + sort + paginate the catalogue.
 * @param {object} q { category, group, search, min, max, sort, featured, onSale, inStock, page, limit }
 */
function query(q = {}) {
  let items = all();

  if (q.group) {
    const groups = String(q.group).split(',');
    items = items.filter((p) => groups.includes(p.group));
  }
  if (q.category) {
    const cats = String(q.category).split(',');
    items = items.filter((p) => cats.includes(p.category));
  }
  if (q.brand) {
    const brands = String(q.brand).split(',');
    items = items.filter((p) => brands.includes(p.brand));
  }
  if (q.search) {
    const needle = normalise(q.search);
    const words = needle.split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const haystack = normalise(
        `${p.name} ${p.brand} ${p.categoryLabel} ${p.groupLabel} ${p.description} ${(p.tags || []).join(' ')}`
      );
      return words.every((w) => haystack.includes(w));
    });
  }
  if (q.min !== undefined && q.min !== '') items = items.filter((p) => p.price >= Number(q.min));
  if (q.max !== undefined && q.max !== '') items = items.filter((p) => p.price <= Number(q.max));
  if (q.featured === true || q.featured === 'true') items = items.filter((p) => p.featured);
  if (q.onSale === true || q.onSale === 'true') items = items.filter((p) => p.discountPercent > 0);
  if (q.inStock === true || q.inStock === 'true') items = items.filter((p) => p.stock > 0);
  if (q.badge) items = items.filter((p) => p.badge === q.badge);

  const sorter = SORTS[q.sort] || SORTS.featured;
  items = items.slice().sort(sorter);

  return paginate(items, q.page || 1, q.limit || 12);
}

/** Counts per category (used by the navigation and shop filters). */
function categoryCounts() {
  return all().reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
}

function groupCounts() {
  return all().reduce((acc, p) => {
    acc[p.group] = (acc[p.group] || 0) + 1;
    return acc;
  }, {});
}

function brands() {
  return Array.from(new Set(all().map((p) => p.brand))).sort();
}

/** Related products - same category first, then same group. */
function related(product, limit = 4) {
  const pool = all().filter((p) => p.slug !== product.slug);
  const sameCat = pool.filter((p) => p.category === product.category);
  const sameGroup = pool.filter((p) => p.group === product.group && p.category !== product.category);

  const out = [...sameCat.sort((a, b) => b.rating - a.rating), ...sameGroup.sort((a, b) => b.rating - a.rating)];
  return out.slice(0, limit);
}

/** Prices that the store actually stocks - used for the price range slider. */
function priceBounds() {
  const prices = all().map((p) => p.price);
  if (!prices.length) return { min: 0, max: 1000000 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

async function decrementStock(productId, quantity) {
  const product = byId(productId);
  if (!product) return null;
  if (product.category === 'gas-refill') return product; // refills are unlimited
  const next = Math.max(0, (product.stock || 0) - Number(quantity || 0));
  return col().updateById(productId, { stock: next });
}

module.exports = {
  col,
  all,
  bySlug,
  byId,
  byCategory,
  byGroup,
  featured,
  newest,
  onSale,
  query,
  categoryCounts,
  groupCounts,
  brands,
  related,
  priceBounds,
  decrementStock,
  SORTS
};