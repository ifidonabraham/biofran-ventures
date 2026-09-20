'use strict';

/**
 * Contact, enquiry and newsletter routes.
 *
 *   GET  /api/contact          store contacts, hours, addresses
 *   POST /api/contact          contact form / inspection request
 *   POST /api/newsletter       newsletter sign-up
 *   POST /api/gas-enquiry      gas refill booking shortcut
 */

const express = require('express');
const messageModel = require('../models/message');
const config = require('../config');
const { asyncHandler } = require('../middleware/errors');

const router = express.Router();

router.get('/contact', (req, res) => {
  res.json({
    ok: true,
    site: {
      name: config.site.name,
      legalName: config.site.legalName,
      tagline: config.site.tagline,
      description: config.site.description
    },
    contacts: config.site.contacts,
    storeAddress: config.site.storeAddress,
    propertyOffice: config.site.propertyOffice,
    openingHours: config.site.openingHours,
    topics: messageModel.TOPICS
  });
});

router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const result = await messageModel.createEnquiry(req.body || {});
    if (!result.ok) return res.status(400).json(result);

    await messageModel.logMessage({
      type: 'enquiry',
      enquiryId: result.enquiry.id,
      to: 'abiodunifidon@gmail.com',
      subject: `[${result.enquiry.topic}] Website enquiry from ${result.enquiry.name}`,
      body: result.enquiry.message
    });

    res.status(201).json({
      ok: true,
      enquiry: result.enquiry,
      message:
        'Thank you — your message has been received. Our team will get back to you within one business day.'
    });
  })
);

router.post(
  '/newsletter',
  asyncHandler(async (req, res) => {
    const result = await messageModel.subscribe((req.body || {}).email);
    if (!result.ok) return res.status(400).json(result);

    res.status(201).json({
      ok: true,
      message: result.alreadySubscribed
        ? 'You are already on our list — thank you!'
        : 'You are on the list. Expect new arrivals and gas offers in your inbox.'
    });
  })
);

router.post(
  '/gas-enquiry',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const message = [
      `Gas refill booking`,
      `Cylinder size: ${body.cylinder || 'not specified'}`,
      `Preferred date: ${body.preferredDate || 'any'}`,
      `Pickup or delivery: ${body.mode || 'pickup'}`,
      '',
      String(body.message || '').trim()
    ].join('\n');

    const result = await messageModel.createEnquiry({
      name: body.name,
      email: body.email,
      phone: body.phone,
      topic: 'Gas refill booking',
      message
    });
    if (!result.ok) return res.status(400).json(result);

    res.status(201).json({
      ok: true,
      enquiry: result.enquiry,
      message:
        'Refill request received. Call 08141256339 if you would like us to come and pick up your cylinder today.',
      gasPhone: '08141256339'
    });
  })
);

module.exports = router;