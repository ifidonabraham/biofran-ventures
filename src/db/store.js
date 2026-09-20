'use strict';

/**
 * Tiny, dependency-free JSON document store.
 *
 * Every "collection" is a JSON array stored in its own file inside ./data.
 * Documents are cached in memory and written back atomically (tmp file +
 * rename) so a crash mid-write can never corrupt the database.
 *
 * The API intentionally mirrors a light Mongo/Mongoose surface so the store
 * can later be swapped for MongoDB or SQLite without touching the routes.
 */

const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uid = (prefix = '') =>
  prefix + crypto.randomBytes(9).toString('hex');

class Collection {
  constructor(store, name) {
    this.store = store;
    this.name = name;
    this.file = path.join(store.dir, `${name}.json`);
    this.docs = [];
    this.loaded = false;
    this._queue = Promise.resolve();
  }

  async load() {
    if (this.loaded) return this.docs;
    try {
      const raw = await fsp.readFile(this.file, 'utf8');
      const parsed = JSON.parse(raw || '[]');
      this.docs = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      this.docs = [];
      await this.flush();
    }
    this.loaded = true;
    return this.docs;
  }

  /** Persist to disk (atomic). Returns a promise resolving when written. */
  flush() {
    this._queue = this._queue
      .then(async () => {
        const tmp = `${this.file}.${process.pid}.tmp`;
        const json = JSON.stringify(this.docs, null, 2);
        await fsp.writeFile(tmp, json, 'utf8');
        await fsp.rename(tmp, this.file);
      })
      .catch((err) => {
        console.error(`[db] failed to persist ${this.name}:`, err.message);
      });
    return this._queue;
  }

  /** Synchronous flush used on process shutdown. */
  flushSync() {
    try {
      const tmp = `${this.file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.docs, null, 2), 'utf8');
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error(`[db] sync flush failed for ${this.name}:`, err.message);
    }
  }

  all() {
    return this.docs.slice();
  }

  find(predicate) {
    return typeof predicate === 'function'
      ? this.docs.filter(predicate)
      : this.docs.slice();
  }

  findOne(predicate) {
    if (typeof predicate !== 'function') return this.docs[0] || null;
    return this.docs.find(predicate) || null;
  }

  findById(id) {
    return this.docs.find((d) => d.id === id) || null;
  }

  count(predicate) {
    return typeof predicate === 'function'
      ? this.docs.filter(predicate).length
      : this.docs.length;
  }

  async insert(doc) {
    const now = new Date().toISOString();
    const record = {
      id: doc.id || uid(),
      createdAt: doc.createdAt || now,
      updatedAt: now,
      ...doc
    };
    record.id = doc.id || record.id;
    record.createdAt = doc.createdAt || record.createdAt;
    this.docs.push(record);
    await this.flush();
    return record;
  }

  async insertMany(docs) {
    const out = [];
    for (const doc of docs) out.push(await this.insert(doc));
    return out;
  }

  async updateById(id, patch) {
    const idx = this.docs.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.docs[idx] = {
      ...this.docs[idx],
      ...patch,
      id,
      updatedAt: new Date().toISOString()
    };
    await this.flush();
    return this.docs[idx];
  }

  async removeById(id) {
    const idx = this.docs.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    const [removed] = this.docs.splice(idx, 1);
    await this.flush();
    return removed;
  }

  async replaceAll(docs) {
    const now = new Date().toISOString();
    this.docs = docs.map((d) => {
      const doc = { ...d };
      if (!doc.id) doc.id = uid(this.name.slice(0, 3) + '_');
      if (!doc.createdAt) doc.createdAt = now;
      if (!doc.updatedAt) doc.updatedAt = now;
      return doc;
    });
    this.loaded = true;
    await this.flush();
    return this.docs;
  }

  async clear() {
    return this.replaceAll([]);
  }
}

class JsonStore {
  constructor(dir) {
    this.dir = dir;
    this.collections = new Map();
  }

  async init() {
    await fsp.mkdir(this.dir, { recursive: true });
    return this;
  }

  collection(name) {
    if (!this.collections.has(name)) {
      const col = new Collection(this, name);
      this.collections.set(name, col);
    }
    return this.collections.get(name);
  }

  async loadAll() {
    for (const col of this.collections.values()) await col.load();
    return this;
  }

  flushSyncAll() {
    for (const col of this.collections.values()) col.flushSync();
  }
}

module.exports = { JsonStore, Collection, uid };
