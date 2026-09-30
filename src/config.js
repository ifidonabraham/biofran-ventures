'use strict';

/**
 * Biofran Ventures - central configuration.
 * Everything that the shop owner is likely to change (contacts, addresses,
 * delivery fees, business details) lives in this single file.
 */

require('dotenv').config();

const path = require('path');

const ROOT = path.join(__dirname, '..');

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || 'biofran-ventures-dev-secret',
  // Vercel (and other serverless platforms) have a read-only filesystem at
  // runtime, except for /tmp.  When DATA_DIR is not explicitly set and we
  // detect a Vercel deployment, fall back to /tmp/biofran-data so the JSON
  // store can still initialise without crashing.
  dataDir: process.env.DATA_DIR
    ? path.resolve(ROOT, process.env.DATA_DIR)
    : process.env.VERCEL
      ? '/tmp/biofran-data'
      : path.join(ROOT, 'data'),
  publicDir: path.join(ROOT, 'public'),
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },

  seed: {
    force: process.argv.includes('--force'),
    wipe: process.argv.includes('--wipe'),
    adminEmail: process.env.ADMIN_EMAIL || 'ifidonabraham249@gmail.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'Biofran@Admin1',
    adminName: process.env.ADMIN_NAME || 'Abraham Ifidon'
  },

  /* ------------------------------------------------------------------
   * Business information
   * ----------------------------------------------------------------*/
  site: {
    name: 'Biofran Ventures',
    legalName: 'Biofran Ventures Ltd.',
    tagline: 'Fashion, Appliances, Gas & Property — all in one place.',
    description:
      'Biofran Ventures is a Nigerian multi-business venture: a classy online store for clothing, shoes, bags, watches and home appliances, a physical store for LPG gas refills, gas accessories, camp gas and stoves — plus Biofran Properties, your trusted housing agent.',
    /* NOTE: replace with your exact physical store address. */
    storeAddress: {
      line1: 'Biofran Ventures Store',
      line2: 'Main Road, opposite the Central Market',
      city: 'Benin City',
      state: 'Edo State',
      country: 'Nigeria'
    },
    /* NOTE: replace with your exact property office address. */
    propertyOffice: {
      line1: 'Biofran Properties (Housing Agent)',
      line2: 'Biofran Ventures Plaza, Main Road',
      city: 'Benin City',
      state: 'Edo State',
      country: 'Nigeria'
    },
    openingHours: [
      { days: 'Monday – Friday', hours: '7:30 AM – 7:00 PM' },
      { days: 'Saturday', hours: '8:00 AM – 7:00 PM' },
      { days: 'Sunday', hours: '1:00 PM – 6:00 PM (Gas refill only)' }
    ],
    contacts: {
      phones: [
        { label: 'Sales & Online Orders', number: '08037211227', intl: '+2348037211227' },
        { label: 'Gas, Refills & Appliances', number: '08141256339', intl: '+2348141256339' },
        { label: 'Biofran Properties', number: '07045723013', intl: '+2347045723013' }
      ],
      emails: [
        { label: 'General Enquiries', address: 'ifidonabraham249@gmail.com' },
        { label: 'Orders & Customer Support', address: 'abiodunifidon@gmail.com' },
        { label: 'Biofran Properties', address: 'francisifidon3@gmail.com' }
      ],
      whatsapp: '+2348037211227'
    },
    socials: [
      { label: 'WhatsApp', url: 'https://wa.me/2348037211227' }
    ]
  },

  /* ------------------------------------------------------------------
   * Commerce rules
   * ----------------------------------------------------------------*/
  commerce: {
    freeDeliveryThreshold: 150000, // ₦150,000 and above -> free delivery
    deliveryFees: {
      pickup: 0,
      'within-city': 2500,
      nationwide: 6500
    },
    gasDeliveryFee: 1500,
    paymentMethods: [
      { id: 'transfer', label: 'Bank Transfer', note: 'You will receive the account details at checkout.' },
      { id: 'pay-on-delivery', label: 'Pay on Delivery', note: 'Available within city limits.' },
      { id: 'pos', label: 'POS / Card at Store', note: 'Pay at the physical store when you pick up.' },
      { id: 'cash', label: 'Cash at Store', note: 'Settle in cash when you collect your order.' }
    ],
    orderStatuses: ['pending', 'confirmed', 'processing', 'ready', 'out-for-delivery', 'completed', 'cancelled']
  },

  session: {
    name: 'bfv.sid',
    maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
  }
};

module.exports = config;
