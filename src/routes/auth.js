'use strict';

/**
 * Authentication routes - register, login, logout, profile.
 *
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 *   PUT  /api/auth/profile
 *   PUT  /api/auth/password
 */

const express = require('express');
const userModel = require('../models/user');
const cartModel = require('../models/cart');
const { asyncHandler } = require('../middleware/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/** Log a user in (regenerate the session id to prevent fixation). */
function startSession(req, res, user) {
  const guestSessionId = req.session.id;

  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.save(async (saveErr) => {
        if (saveErr) return reject(saveErr);
        /* Carry the guest cart over to the signed-in account. */
        await cartModel.merge(guestSessionId, user.id);
        resolve();
      });
    });
  });
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const result = await userModel.create(req.body || {});
    if (!result.ok) return res.status(400).json(result);

    await startSession(req, res, result.user);

    const cart = await cartModel.get({ userId: result.user.id, sessionId: req.session.id });
    res.status(201).json({
      ok: true,
      user: result.user,
      cartCount: cartModel.count(cart),
      message: `Welcome to Biofran Ventures, ${result.user.name.split(' ')[0]}!`
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    const result = await userModel.verify(email, password);
    if (!result.ok) return res.status(401).json(result);

    await startSession(req, res, result.user);

    const cart = await cartModel.get({ userId: result.user.id, sessionId: req.session.id });
    res.json({
      ok: true,
      user: result.user,
      cartCount: cartModel.count(cart),
      message: `Welcome back, ${result.user.name.split(' ')[0]}!`
    });
  })
);

router.post('/logout', (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => {
    res.clearCookie(require('../config').session.name);
    res.json({ ok: true, message: 'You have been signed out.' });
  });
});

router.get('/me', (req, res) => {
  res.json({
    ok: true,
    user: req.user || null,
    cartCount: req.cartCount || 0
  });
});

router.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await userModel.updateProfile(req.user.id, req.body || {});
    if (!result.ok) return res.status(400).json(result);
    res.json({ ok: true, user: result.user, message: 'Your details have been updated.' });
  })
);

router.put(
  '/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    const result = await userModel.changePassword(req.user.id, currentPassword, newPassword);
    if (!result.ok) return res.status(400).json(result);
    res.json({ ok: true, message: 'Your password has been changed.' });
  })
);

module.exports = router;