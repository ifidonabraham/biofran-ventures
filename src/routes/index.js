'use strict';

/**
 * API router - mounts every /api/* sub-router.
 */

const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'biofran-ventures',
    time: new Date().toISOString(),
    uptime: Math.round(process.uptime())
  });
});

router.use(require('./site'));
router.use('/auth', require('./auth'));
router.use(require('./catalog'));
router.use(require('./properties'));
router.use(require('./cart'));
router.use(require('./orders'));
router.use(require('./contact'));
router.use('/admin', require('./admin'));

module.exports = router;