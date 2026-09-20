'use strict';

/**
 * Shared helpers used by both the server and the database seeder.
 */

const crypto = require('crypto');

/** Turn "12.5kg Gas Cylinder (Empty)" into "12-5kg-gas-cylinder-empty". */
function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/₦/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);
}

/** Human friendly order reference, e.g. BFV-260919-4F2A1C */
function orderReference(date = new Date()) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BFV-${y}${m}${d}-${rand}`;
}

/** Money formatting for server side notices / emails. */
function formatMoney(amount, symbol = '₦') {
  const n = Number(amount) || 0;
  return symbol + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Normalise a search string. */
function normalise(str) {
  return String(str || '').toLowerCase().trim();
}

/** Paginate an array. */
function paginate(items, page = 1, limit = 12) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 12));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / l));
  const start = (p - 1) * l;
  return {
    items: items.slice(start, start + l),
    meta: {
      page: p,
      limit: l,
      total,
      pages,
      hasPrev: p > 1,
      hasNext: p < pages
    }
  };
}

/** Percentage discount (rounded). */
function discountPercent(price, oldPrice) {
  const p = Number(price);
  const o = Number(oldPrice);
  if (!o || !p || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}

/** Very small validators. */
const isEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());

const isPhone = (v) =>
  /^[0-9+()\-\s]{7,20}$/.test(String(v || '').trim());

/** Trim every string field of an object (shallow + one nested level). */
function cleanObject(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (typeof value === 'string') out[key] = value.trim();
    else if (Array.isArray(value)) out[key] = value;
    else out[key] = value;
  }
  return out;
}

/** Pick only the listed keys from an object. */
function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
  }
  return out;
}

module.exports = {
  slugify,
  orderReference,
  formatMoney,
  normalise,
  paginate,
  discountPercent,
  isEmail,
  isPhone,
  cleanObject,
  pick
};
