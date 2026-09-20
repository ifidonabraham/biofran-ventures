'use strict';

/**
 * Database facade - a single place the rest of the app imports.
 *
 *   const db = require('./db');
 *   await db.init();
 *   db.collection('products').find(...)
 *
 * Swapping the JSON store for MongoDB or SQLite later only requires changing
 * this file and the small store adapter in ./store.js.
 */

const { JsonStore } = require('./store');

const store = new JsonStore(require('../config').dataDir);

const COLLECTIONS = [
  'users',
  'products',
  'properties',
  'carts',
  'orders',
  'enquiries',
  'messages',
  'newsletter'
];

let ready = null;

function init() {
  if (!ready) {
    ready = store
      .init()
      .then(() => {
        for (const name of COLLECTIONS) store.collection(name);
        return store.loadAll();
      })
      .then(() => store);
  }
  return ready;
}

module.exports = {
  init,
  store,
  collection: (name) => store.collection(name),
  COLLECTIONS
};