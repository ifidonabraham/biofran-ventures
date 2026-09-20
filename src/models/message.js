'use strict';

/**
 * Messages model - the contact form, property inspection requests and the
 * newsletter list all land in JSON collections the owner can read.
 */

const db = require('../db');
const { uid } = require('../db/store');
const { isEmail } = require('../utils');

const enquiryCol = () => db.collection('enquiries');
const messageCol = () => db.collection('messages');
const newsletterCol = () => db.collection('newsletter');

const TOPICS = [
  'General enquiry',
  'Order or delivery',
  'Gas refill booking',
  'Product availability',
  'Property inspection',
  'Wholesale / bulk order',
  'Complaint'
];

/**
 * Save a contact-form / inspection-request message.
 * @param {object} input
 */
async function createEnquiry(input = {}) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const phone = String(input.phone || '').trim();
  const topic = String(input.topic || TOPICS[0]).trim();
  const message = String(input.message || '').trim();
  const propertyRef = String(input.propertyRef || '').trim();

  if (name.length < 2) return { ok: false, error: 'Please tell us your name.' };
  if (!isEmail(email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (message.length < 10) {
    return { ok: false, error: 'Please give us a little more detail (at least 10 characters).' };
  }

  const enquiry = await enquiryCol().insert({
    id: uid('enq_'),
    name,
    email,
    phone,
    topic: TOPICS.includes(topic) ? topic : TOPICS[0],
    propertyRef,
    message,
    handled: false
  });

  return { ok: true, enquiry };
}

/** Newsletter sign-up (idempotent). */
async function subscribe(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!isEmail(clean)) return { ok: false, error: 'Please enter a valid email address.' };

  const existing = newsletterCol().findOne((s) => s.email === clean);
  if (existing) return { ok: true, alreadySubscribed: true, subscriber: existing };

  const subscriber = await newsletterCol().insert({
    id: uid('sub_'),
    email: clean,
    active: true
  });
  return { ok: true, subscriber };
}

/** Generic internal message log (used for order notifications). */
async function logMessage(entry) {
  return messageCol().insert({
    id: uid('msg_'),
    ...entry,
    at: new Date().toISOString()
  });
}

module.exports = {
  TOPICS,
  createEnquiry,
  subscribe,
  logMessage,
  enquiryCol,
  messageCol,
  newsletterCol
};