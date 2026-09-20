'use strict';

/**
 * Artwork renderer - composes the final SVG images used by the store.
 *
 *   GET /img/p/<slug>.svg            -> product card image
 *   GET /img/p/<slug>.svg?size=1400  -> high resolution preview (lightbox)
 *   GET /img/c/<key>.svg             -> category tile
 *   GET /img/pr/<slug>.svg           -> property listing image
 *   GET /img/logo.svg                -> brand mark
 */

const { ICONS } = require('./icons');

/* ----------------------------------------------------------- colour maths */
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* Stable hash so each item always gets the same colours. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* ------------------------------------------------------------ palettes */
/* hue pairs per category - gold (45deg) is used as the accent everywhere  */
const PALETTES = {
  'men-clothing': [214, 232],
  'women-clothing': [326, 292],
  shoes: [24, 8],
  bags: [268, 300],
  watches: [158, 186],
  'home-appliances': [198, 222],
  'gas-accessories': [18, 34],
  'gas-refill': [6, 350],
  'camp-gas': [142, 172],
  'cooking-stoves': [220, 16],
  'camp-stoves': [96, 140],
  properties: [186, 152],
  general: [222, 250]
};

function paletteFor(key, variant = 1) {
  const v = Number(variant) || 1;
  const base = PALETTES[key] || PALETTES.general;
  const shift = (v - 1) * 9;
  const h1 = base[0] + shift;
  const h2 = base[1] + shift * 0.6;
  return {
    bg1: hslToHex(h1, 32, 15),
    bg2: hslToHex(h2, 38, 9),
    panel: hslToHex(h1, 30, 20),
    main: hslToHex(h1, 26, 62),
    dark: hslToHex(h1, 34, 40),
    light: hslToHex(h1, 24, 88),
    accent: hslToHex(44, 62, v % 3 === 0 ? 72 : 60),
    accentSoft: hslToHex(44, 55, 46),
    glow: hslToHex(h2, 55, 42)
  };
}

/* ------------------------------------------------------------- utilities */
const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function wrapText(text, maxChars, maxLines = 2) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.length ? lines : [''];
}

/* ---------------------------------------------------------- scene render */

/**
 * Compose a full artwork scene.
 * @param {object} o
 * @param {string} o.name      main headline (wrapped onto up to 2 lines)
 * @param {string} [o.label]   small caps kicker under the headline
 * @param {string} [o.kicker]  small caps line above the artwork
 * @param {string} [o.kind]    icon key (see src/icons.js)
 * @param {string} [o.palette] palette key (category slug)
 * @param {number} [o.variant] 1..3 - shifts the colour scheme
 * @param {number} [o.size]    rendered width/height in px
 */
function renderScene(o) {
  const v = Number(o.variant) || 1;
  const p = paletteFor(o.palette, v);
  const icon = (ICONS[o.kind] || ICONS.generic)(p);
  const size = Number(o.size) || 900;
  const nameLines = wrapText(o.name, 19, 2);
  const kicker = esc((o.kicker || 'BIOFRAN VENTURES').toUpperCase());
  const label = esc((o.label || '').toUpperCase());

  const glowX = 150 + v * 90;
  const glowY = 170 + (v % 2) * 130;

  const nameY = nameLines.length === 1 ? 662 : 640;
  const nameSvg = nameLines
    .map(
      (line, i) =>
        `<text x="400" y="${nameY + i * 52}" text-anchor="middle" ` +
        `font-family="Georgia, 'Times New Roman', serif" font-size="46" ` +
        `fill="${p.light}" letter-spacing="0.5">${esc(line)}</text>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 800 800" role="img" aria-label="${esc(o.name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/>
      <stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.14"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="46"/>
    </filter>
  </defs>

  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="${glowX}" cy="${glowY}" r="230" fill="url(#glow)" filter="url(#soft)"/>
  <circle cx="${800 - glowX}" cy="${760 - glowY}" r="180" fill="url(#glow)" filter="url(#soft)" opacity="0.7"/>

  <rect x="46" y="46" width="708" height="708" rx="44" fill="#ffffff" fill-opacity="0.045"
        stroke="#ffffff" stroke-opacity="0.10"/>
  <rect x="66" y="66" width="668" height="668" rx="34" fill="none"
        stroke="${p.accent}" stroke-opacity="0.28" stroke-dasharray="2 10"/>
  <rect x="46" y="46" width="708" height="708" rx="44" fill="url(#sheen)"/>

  <text x="100" y="132" font-family="Helvetica, Arial, sans-serif" font-size="24"
        letter-spacing="7" fill="${p.accent}" fill-opacity="0.95">${kicker}</text>
  <path d="M100 152h180" stroke="${p.accent}" stroke-width="3" stroke-opacity="0.6"/>

  <ellipse cx="400" cy="556" rx="150" ry="26" fill="#000000" opacity="0.22"/>
  <g transform="translate(400 340) scale(2.35) translate(-100 -100)">${icon}</g>

  ${nameSvg}
  <text x="400" y="746" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="22" letter-spacing="5" fill="${p.accent}" fill-opacity="0.95">${label}</text>
</svg>`;
}

/* -------------------------------------------------------------- wrappers */

const productImage = (product, size) =>
  renderScene({
    name: product.name,
    label: product.subcategoryLabel || product.categoryLabel || product.brand || 'BIOFRAN',
    kicker: 'Biofran Ventures',
    kind: product.icon,
    palette: product.subcategory || product.category,
    variant: (hash(product.slug) % 3) + 1,
    size
  });

const categoryImage = (category, size) =>
  renderScene({
    name: category.title,
    label: 'Shop the collection',
    kicker: 'Biofran Ventures',
    kind: category.icon,
    palette: category.key,
    variant: ((hash(category.key) % 3) + 1),
    size
  });

const propertyImage = (property, size) =>
  renderScene({
    name: property.title,
    label: [property.purpose, property.city].filter(Boolean).join(' · '),
    kicker: 'Biofran Properties',
    kind: property.icon || 'house',
    palette: 'properties',
    variant: (hash(property.slug) % 3) + 1,
    size
  });

const logo = (size = 240) => {
  const p = paletteFor('men-clothing', 1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="Biofran Ventures">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.accent}"/>
      <stop offset="1" stop-color="${p.accentSoft}"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="188" height="188" rx="46" fill="${p.bg2}"/>
  <rect x="6" y="6" width="188" height="188" rx="46" fill="none" stroke="url(#lg)" stroke-width="4"/>
  <text x="100" y="128" text-anchor="middle" font-family="Georgia, serif" font-size="92"
        font-weight="bold" fill="url(#lg)">B</text>
  <text x="100" y="160" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="17" letter-spacing="4" fill="${p.light}" fill-opacity="0.9">BIOFRAN</text>
</svg>`;
};

module.exports = {
  renderScene,
  productImage,
  categoryImage,
  propertyImage,
  logo,
  paletteFor,
  hash,
  esc,
  wrapText,
  PALETTES
};