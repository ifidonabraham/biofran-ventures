'use strict';

/**
 * Site routes - everything the front end needs to render itself.
 *
 *   GET /api/site   branding, contacts, departments, footer, offers
 */

const express = require('express');
const config = require('../config');
const catalog = require('../catalog');
const productModel = require('../models/product');
const propertyModel = require('../models/property');

const router = express.Router();

router.get('/site', (req, res) => {
  const counts = productModel.categoryCounts();
  const groupCounts = productModel.groupCounts();

  res.json({
    ok: true,
    site: {
      name: config.site.name,
      legalName: config.site.legalName,
      tagline: config.site.tagline,
      description: config.site.description,
      storeAddress: config.site.storeAddress,
      propertyOffice: config.site.propertyOffice,
      openingHours: config.site.openingHours,
      contacts: config.site.contacts,
      socials: config.site.socials,
      logo: '/img/logo.svg',
      favicon: '/img/favicon.svg',
      heroImage: '/img/hero.svg',
      heroPreview: '/img/hero.svg?size=1600'
    },
    currency: config.currency,
    commerce: {
      freeDeliveryThreshold: config.commerce.freeDeliveryThreshold,
      deliveryFees: config.commerce.deliveryFees,
      gasDeliveryFee: config.commerce.gasDeliveryFee,
      paymentMethods: config.commerce.paymentMethods
    },
    departments: catalog.allGroups().map((g) => ({
      ...g,
      productCount: groupCounts[g.key] || 0,
      children: g.childCategories.map((c) => ({ ...c, productCount: counts[c.key] || 0 }))
    })),
    categories: catalog.allCategories().map((c) => ({
      ...c,
      groupTitle: catalog.groupLabel(c.group),
      productCount: counts[c.key] || 0
    })),
    storeServices: [
      {
        key: 'gas-refill',
        title: 'LPG Gas Refill',
        description:
          'Bring your cylinder to our physical store and we refill, weigh, leak-test and seal it while you wait.',
        icon: 'flame',
        phone: '08141256339',
        category: 'gas-refill',
        image: '/img/c/gas-refill.svg',
        preview: '/img/c/gas-refill.svg?size=1400'
      },
      {
        key: 'gas-accessories',
        title: 'Gas Accessories',
        description:
          'Cylinders, regulators, hoses, clamps, burner heads and leak alarms — all safety certified.',
        icon: 'regulator',
        phone: '08141256339',
        category: 'gas-accessories',
        image: '/img/c/gas-accessories.svg',
        preview: '/img/c/gas-accessories.svg?size=1400'
      },
      {
        key: 'camp-gas',
        title: 'Camp Gas',
        description:
          'Portable camp cylinders, canisters and kits for camping, road trips and small kitchens.',
        icon: 'canister',
        phone: '08141256339',
        category: 'camp-gas',
        image: '/img/c/camp-gas.svg',
        preview: '/img/c/camp-gas.svg?size=1400'
      },
      {
        key: 'cooking-stoves',
        title: 'Cooking Stoves & Cookers',
        description:
          'Table-top cookers, standing cookers with ovens and tempered-glass tops — delivered and set up.',
        icon: 'stove',
        phone: '08141256339',
        category: 'cooking-stoves',
        image: '/img/c/cooking-stoves.svg',
        preview: '/img/c/cooking-stoves.svg?size=1400'
      },
      {
        key: 'camp-stoves',
        title: 'Camp Stoves',
        description:
          'Folding, windproof and double-burner camp stoves with carry cases for outdoor cooking.',
        icon: 'campstove',
        phone: '08141256339',
        category: 'camp-stoves',
        image: '/img/c/camp-stoves.svg',
        preview: '/img/c/camp-stoves.svg?size=1400'
      },
      {
        key: 'appliances',
        title: 'Home Appliances',
        description:
          'Fridges, freezers, air conditioners, fans, washing machines and kitchen appliances with warranty.',
        icon: 'fridge',
        phone: '08141256339',
        category: 'home-appliances',
        image: '/img/c/home-appliances.svg',
        preview: '/img/c/home-appliances.svg?size=1400'
      }
    ],
    property: {
      title: 'Biofran Properties',
      subtitle: 'Housing agent · sales, rentals, short-lets & land',
      description:
        'Our property desk handles house sales, rentals, short-lets, land and commercial space — with verified titles and guided inspections.',
      phone: '07045723013',
      email: 'francisifidon3@gmail.com',
      listingCount: propertyModel.all().length,
      image: '/img/pr/featured.svg',
      preview: '/img/pr/featured.svg?size=1400'
    }
  });
});

module.exports = router;