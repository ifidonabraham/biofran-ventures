'use strict';

/**
 * Biofran Ventures - Express web server.
 *
 *   npm start        -> http://localhost:3000
 *
 * Serves the REST API under /api, the generated artwork under /img and the
 * static storefront from /public. The JSON database is seeded automatically
 * the first time the server starts.
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');

const config = require('./src/config');
const db = require('./src/db');
const { seed } = require('./src/db/seed');
const apiRouter = require('./src/routes');
const imageRouter = require('./src/routes/images');
const { errorHandler, apiNotFound } = require('./src/middleware/errors');
const {
  ensureSession,
  attachUser,
  attachCart
} = require('./src/middleware/auth');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

/* ------------------------------------------------------------ body parsers */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* ---------------------------------------------------------------- sessions */
app.use(
  session({
    name: config.session.name,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.env === 'production',
      maxAge: config.session.maxAge
    }
  })
);

/* -------------------------------------------------------------- identity */
app.use(ensureSession);
app.use(attachUser);
app.use(attachCart);

/* ----------------------------------------------------- generated artwork */
app.use(
  '/img',
  (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  },
  imageRouter
);

/* ------------------------------------------------------------ REST API */
app.use('/api', apiRouter);
app.use('/api', apiNotFound);

/* ------------------------------------------------------- static front end */
const publicDir = config.publicDir;
app.use(
  express.static(publicDir, {
    extensions: ['html'],
    setHeaders(res, filePath) {
      if (/\.(css|js)$/.test(filePath)) {
        res.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  })
);

/* Friendly route aliases so /shop, /product/x, /property/x all work. */
const pages = {
  '/shop': 'shop.html',
  '/cart': 'cart.html',
  '/checkout': 'checkout.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/account': 'account.html',
  '/contact': 'contact.html',
  '/about': 'about.html',
  '/gas': 'gas.html',
  '/properties': 'properties.html',
  '/admin': 'admin.html'
};

for (const [route, file] of Object.entries(pages)) {
  app.get(route, (req, res) => res.sendFile(path.join(publicDir, file)));
}

app.get('/product/:slug', (req, res) => res.sendFile(path.join(publicDir, 'product.html')));
app.get('/property/:slug', (req, res) => res.sendFile(path.join(publicDir, 'property.html')));

/* Health probe for hosting platforms. */
app.get('/healthz', (req, res) => res.type('text/plain').send('ok'));

/* 404 fallback for anything else. */
app.use((req, res) => {
  if (req.accepts('html')) {
    const notFound = path.join(publicDir, '404.html');
    if (fs.existsSync(notFound)) return res.status(404).sendFile(notFound);
  }
  res.status(404).json({ ok: false, error: 'Not found' });
});

app.use(errorHandler);

/* ------------------------------------------------------------------ boot */
async function start() {
  await db.init();
  await seed({ quiet: false });

  const server = app.listen(config.port, () => {
    const store = config.site;
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════════╗');
    console.log('  ║   BIOFRAN VENTURES - E-COMMERCE STORE                ║');
    console.log('  ╚══════════════════════════════════════════════════════╝');
    console.log(`   Storefront : http://localhost:${config.port}`);
    console.log(`   Shop       : http://localhost:${config.port}/shop`);
    console.log(`   Gas store  : http://localhost:${config.port}/gas`);
    console.log(`   Properties : http://localhost:${config.port}/properties`);
    console.log(`   Admin      : http://localhost:${config.port}/admin`);
    console.log(`   API health : http://localhost:${config.port}/api/health`);
    console.log('');
    console.log(`   Sales      : ${store.contacts.phones[0].number}`);
    console.log(`   Gas desk   : ${store.contacts.phones[1].number}`);
    console.log(`   Properties : ${store.contacts.phones[2].number}`);
    console.log(`   Email      : ${store.contacts.emails.map((e) => e.address).join(', ')}`);
    console.log('');
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received - flushing database and closing...`);
    try {
      db.store.flushSyncAll();
    } catch (err) {
      console.error('[server] flush failed:', err.message);
    }
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[server] failed to start:', err);
    process.exit(1);
  });
}

module.exports = { app, start };