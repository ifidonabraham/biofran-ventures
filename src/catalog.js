'use strict';

/**
 * Biofran Ventures - catalogue taxonomy.
 *
 * GROUPS   -> the three big departments shown on the home page
 * CATEGORIES -> the leaf categories a product belongs to
 *
 * Every category gets its own generated image + high resolution preview link.
 */

const GROUPS = [
  {
    key: 'fashion',
    title: 'Fashion & Lifestyle',
    tagline: 'Clothes, shoes, bags & dress watches',
    description:
      'Curated menswear and womenswear, leather shoes, bags and dress watches — quality pieces picked for both work and weekend.',
    icon: 'shirt',
    accent: 'gold'
  },
  {
    key: 'appliances',
    title: 'Home Appliances',
    tagline: 'Cooling, cooking & everyday comfort',
    description:
      'Fridges, freezers, air conditioners, fans, blenders, kettles and more — with installation advice and a full warranty.',
    icon: 'fridge',
    accent: 'steel'
  },
  {
    key: 'gas',
    title: 'Gas, Refills & Stoves',
    tagline: 'Our physical store speciality',
    description:
      'LPG refills of every cylinder size, gas accessories, camp gas, cooking stoves and camping stoves — plus safe refill service at our physical store.',
    icon: 'cylinder',
    accent: 'flame'
  }
];

const CATEGORIES = [
  /* ---------------------------------------------------------------- fashion */
  {
    key: 'men-clothing',
    group: 'fashion',
    title: "Men's Clothing",
    tagline: 'Shirts, suits, native & casual',
    icon: 'shirt',
    sortOrder: 1
  },
  {
    key: 'women-clothing',
    group: 'fashion',
    title: "Women's Clothing",
    tagline: 'Gowns, dresses, blazers & native',
    icon: 'gown',
    sortOrder: 2
  },
  {
    key: 'shoes',
    group: 'fashion',
    title: 'Shoes',
    tagline: 'Leather, sneakers & heels',
    icon: 'shoe',
    sortOrder: 3
  },
  {
    key: 'bags',
    group: 'fashion',
    title: 'Bags',
    tagline: 'Briefcases, totes & backpacks',
    icon: 'bag',
    sortOrder: 4
  },
  {
    key: 'watches',
    group: 'fashion',
    title: 'Watches',
    tagline: "Men's & women's dress watches",
    icon: 'watch',
    sortOrder: 5
  },
  {
    key: 'glasses',
    group: 'fashion',
    title: 'Eyewear',
    tagline: 'Sunglasses & frames',
    icon: 'glasses',
    sortOrder: 6
  },

  /* ------------------------------------------------------------- appliances */
  {
    key: 'home-appliances',
    group: 'appliances',
    title: 'Home Appliances',
    tagline: 'Fridges, ACs, fans & kitchen',
    icon: 'fridge',
    sortOrder: 10
  },
  {
    key: 'kitchen-appliances',
    group: 'appliances',
    title: 'Kitchen Appliances',
    tagline: 'Blenders, kettles & cookers',
    icon: 'blender',
    sortOrder: 11
  },

  /* -------------------------------------------------------------------- gas */
  {
    key: 'gas-refill',
    group: 'gas',
    title: 'Gas Refill Service',
    tagline: '12.5kg, 25kg, 5kg & 50kg',
    icon: 'flame',
    sortOrder: 20
  },
  {
    key: 'gas-accessories',
    group: 'gas',
    title: 'Gas Accessories',
    tagline: 'Cylinders, regulators, hoses',
    icon: 'regulator',
    sortOrder: 21
  },
  {
    key: 'camp-gas',
    group: 'gas',
    title: 'Camp Gas',
    tagline: 'Portable cylinders & canisters',
    icon: 'canister',
    sortOrder: 22
  },
  {
    key: 'cooking-stoves',
    group: 'gas',
    title: 'Cooking Stoves',
    tagline: 'Table-top & standing cookers',
    icon: 'stove',
    sortOrder: 23
  },
  {
    key: 'camp-stoves',
    group: 'gas',
    title: 'Camp Stoves',
    tagline: 'Outdoor & picnic burners',
    icon: 'campstove',
    sortOrder: 24
  }
];

const BY_KEY = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = {
    ...c,
    image: `/img/c/${c.key}.svg`,
    preview: `/img/c/${c.key}.svg?size=1400`
  };
  return acc;
}, {});

const GROUPS_BY_KEY = GROUPS.reduce((acc, g) => {
  acc[g.key] = {
    ...g,
    children: CATEGORIES.filter((c) => c.group === g.key).map((c) => c.key),
    image: `/img/c/group-${g.key}.svg`,
    preview: `/img/c/group-${g.key}.svg?size=1400`
  };
  return acc;
}, {});

const categoryByKey = (key) => BY_KEY[key] || null;
const groupByKey = (key) => GROUPS_BY_KEY[key] || null;
const categoryLabel = (key) => (BY_KEY[key] ? BY_KEY[key].title : key || '');
const groupLabel = (key) => (GROUPS_BY_KEY[key] ? GROUPS_BY_KEY[key].title : key || '');

/** Full category list decorated with their generated image + preview links. */
const allCategories = () =>
  CATEGORIES.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ ...c, image: BY_KEY[c.key].image, preview: BY_KEY[c.key].preview }));

const allGroups = () =>
  GROUPS.map((g) => ({
    ...g,
    children: GROUPS_BY_KEY[g.key].children,
    childCategories: GROUPS_BY_KEY[g.key].children.map((k) => BY_KEY[k]),
    image: GROUPS_BY_KEY[g.key].image,
    preview: GROUPS_BY_KEY[g.key].preview
  }));

module.exports = {
  GROUPS,
  CATEGORIES,
  BY_KEY,
  GROUPS_BY_KEY,
  categoryByKey,
  groupByKey,
  categoryLabel,
  groupLabel,
  allCategories,
  allGroups
};