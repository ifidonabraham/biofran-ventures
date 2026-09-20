'use strict';

/**
 * Biofran Ventures - database seeder.
 *
 *   npm run seed            -> seeds only if the database is empty
 *   npm run seed:reset      -> wipes and reseeds everything
 *
 * Collections: users, products, properties, orders, enquiries, messages,
 *              newsletter, sessions
 */

const bcrypt = require('bcryptjs');

const config = require('../config');
const db = require('./index');
const { buildProducts } = require('./seed-data/products');
const { buildProperties } = require('./seed-data/properties');

async function seed({ force = false, wipe = false, quiet = false } = {}) {
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };

  await db.init();

  if (wipe) {
    log('[seed] wiping all collections...');
    for (const name of [
      'users',
      'products',
      'properties',
      'orders',
      'enquiries',
      'messages',
      'newsletter'
    ]) {
      await db.collection(name).clear();
    }
  }

  /* ------------------------------------------------------------- products */
  const products = db.collection('products');
  if (force || products.count() === 0) {
    if (products.count() > 0) await products.clear();
    const docs = buildProducts();
    await products.replaceAll(docs);
    log(`[seed] products ......... ${docs.length}`);
  } else {
    log(`[seed] products ......... skipped (${products.count()} already present)`);
  }

  /* ----------------------------------------------------------- properties */
  const properties = db.collection('properties');
  if (force || properties.count() === 0) {
    if (properties.count() > 0) await properties.clear();
    const docs = buildProperties();
    await properties.replaceAll(docs);
    log(`[seed] properties ....... ${docs.length}`);
  } else {
    log(`[seed] properties ....... skipped (${properties.count()} already present)`);
  }

  /* ---------------------------------------------------------------- users */
  const users = db.collection('users');
  if (force || users.count() === 0) {
    const passwordHash = await bcrypt.hash(config.seed.adminPassword, 10);
    const demoHash = await bcrypt.hash('Biofran@1234', 10);

    await users.insertMany([
      {
        id: 'usr_admin',
        name: config.seed.adminName,
        email: config.seed.adminEmail.toLowerCase(),
        phone: '08037211227',
        passwordHash,
        role: 'admin',
        active: true,
        addresses: []
      },
      {
        id: 'usr_demo',
        name: 'Demo Customer',
        email: 'demo@biofranventures.com',
        phone: '08141256339',
        passwordHash: demoHash,
        role: 'customer',
        active: true,
        addresses: [
          {
            label: 'Home',
            line1: '12 Main Road',
            city: 'Benin City',
            state: 'Edo State',
            phone: '08141256339'
          }
        ]
      }
    ]);
    log('[seed] users ............ 2 (admin + demo customer)');
  } else {
    log(`[seed] users ............ skipped (${users.count()} already present)`);
  }

  /* ---------------------------------------------------------- empty files */
  for (const name of ['orders', 'enquiries', 'messages', 'newsletter']) {
    const col = db.collection(name);
    await col.load();
  }

  log('[seed] done ✓');
  return db;
}

/* --------------------------------------------------------------- CLI mode */
if (require.main === module) {
  seed({
    force: config.seed.force,
    wipe: config.seed.wipe
  })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[seed] failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };