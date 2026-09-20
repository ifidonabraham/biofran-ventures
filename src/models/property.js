'use strict';

const db = require('../db');
const { normalise, paginate } = require('../utils');

const col = () => db.collection('properties');

const all = () => col().find((p) => p.active !== false);

const bySlug = (slug) => col().findOne((p) => p.slug === slug && p.active !== false);

const featured = (limit = 6) =>
  all()
    .slice()
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price)
    .slice(0, limit);

const cities = () => Array.from(new Set(all().map((p) => p.city))).sort();

const purposes = () => Array.from(new Set(all().map((p) => p.purpose))).sort();

const types = () => Array.from(new Set(all().map((p) => p.type))).sort();

function query(q = {}) {
  let items = all();

  if (q.purpose) items = items.filter((p) => p.purpose === q.purpose);
  if (q.city) items = items.filter((p) => p.city === q.city);
  if (q.type) items = items.filter((p) => p.type === q.type);
  if (q.bedrooms) items = items.filter((p) => p.bedrooms >= Number(q.bedrooms));
  if (q.min !== undefined && q.min !== '') items = items.filter((p) => p.price >= Number(q.min));
  if (q.max !== undefined && q.max !== '') items = items.filter((p) => p.price <= Number(q.max));

  if (q.search) {
    const needle = normalise(q.search);
    const words = needle.split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const haystack = normalise(`${p.title} ${p.type} ${p.purpose} ${p.city} ${p.area} ${p.description}`);
      return words.every((w) => haystack.includes(w));
    });
  }

  const sorters = {
    newest: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    bedrooms: (a, b) => b.bedrooms - a.bedrooms
  };
  items = items.slice().sort(sorters[q.sort] || sorters.newest);

  return paginate(items, q.page || 1, q.limit || 9);
}

function related(property, limit = 3) {
  return all()
    .filter((p) => p.slug !== property.slug)
    .sort((a, b) => {
      const score = (x) => (x.city === property.city ? 2 : 0) + (x.purpose === property.purpose ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

/** Grouped price ranges for the property filter sidebar. */
function priceBands() {
  return [
    { label: 'Below ₦20M', min: 0, max: 20000000 },
    { label: '₦20M – ₦50M', min: 20000000, max: 50000000 },
    { label: '₦50M – ₦100M', min: 50000000, max: 100000000 },
    { label: 'Above ₦100M', min: 100000000, max: 9999999999 }
  ];
}

module.exports = {
  col,
  all,
  bySlug,
  featured,
  cities,
  purposes,
  types,
  query,
  related,
  priceBands
};