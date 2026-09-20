'use strict';

/**
 * Session / identity middleware.
 *
 * Every request gets `req.ctx` = { userId, sessionId } which the cart and
 * order models use as the ownership key. `req.user` is the signed-in user
 * (without the password hash) or null.
 */

const userModel = require('../models/user');
const cartModel = require('../models/cart');

/** Make sure the session object (and its id) exists. */
function ensureSession(req, res, next) {
  if (!req.session) {
    return res.status(500).json({ ok: false, error: 'Session support is not configured.' });
  }
  req.ctx = {
    userId: req.session.userId || null,
    sessionId: req.session.id
  };
  next();
}

/** Attach the current user (if any) to the request. */
function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    const user = userModel.findById(req.session.userId);
    req.user = user ? userModel.safe(user) : null;
    if (!req.user) {
      req.session.userId = null;
      if (req.ctx) req.ctx.userId = null;
    }
  } else {
    req.user = null;
  }
  next();
}

/** Attach the cart + its item count (used by the header badge). */
async function attachCart(req, res, next) {
  try {
    req.cart = await cartModel.get(req.ctx);
    req.cartCount = cartModel.count(req.cart);
    next();
  } catch (err) {
    next(err);
  }
}

/** Block the route unless the visitor is signed in. */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      error: 'Please log in to continue.',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

/** Block the route unless the signed-in user is an administrator. */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: 'Please log in to continue.', code: 'AUTH_REQUIRED' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Administrator access is required.' });
  }
  next();
}

module.exports = {
  ensureSession,
  attachUser,
  attachCart,
  requireAuth,
  requireAdmin
};