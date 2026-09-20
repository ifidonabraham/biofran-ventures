'use strict';

const bcrypt = require('bcryptjs');
const db = require('../db');
const { uid } = require('../db/store');
const { isEmail } = require('../utils');

const col = () => db.collection('users');

/** Remove anything that must never leave the server. */
function safe(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

const normaliseEmail = (email) => String(email || '').trim().toLowerCase();

const findByEmail = (email) => col().findOne((u) => u.email === normaliseEmail(email));

const findById = (id) => col().findById(id);

/**
 * Register a new customer.
 * @returns {{ok:boolean, error?:string, user?:object}}
 */
async function create({ name, email, phone, password }) {
  const cleanName = String(name || '').trim();
  const cleanEmail = normaliseEmail(email);
  const cleanPhone = String(phone || '').trim();

  if (cleanName.length < 2) return { ok: false, error: 'Please enter your full name.' };
  if (!isEmail(cleanEmail)) return { ok: false, error: 'Please enter a valid email address.' };
  if (String(password || '').length < 6) {
    return { ok: false, error: 'Your password must be at least 6 characters long.' };
  }
  if (await findByEmail(cleanEmail)) {
    return { ok: false, error: 'An account with that email already exists. Please log in.' };
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await col().insert({
    id: uid('usr_'),
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash,
    role: 'customer',
    active: true,
    addresses: []
  });

  return { ok: true, user: safe(user) };
}

/** Check credentials. */
async function verify(email, password) {
  const user = await findByEmail(email);
  if (!user) return { ok: false, error: 'No account found with that email address.' };
  if (user.active === false) return { ok: false, error: 'This account has been suspended.' };

  const match = await bcrypt.compare(String(password || ''), user.passwordHash || '');
  if (!match) return { ok: false, error: 'Incorrect password. Please try again.' };

  return { ok: true, user: safe(user) };
}

async function updateProfile(id, patch) {
  const allowed = ['name', 'phone', 'addresses'];
  const update = {};
  for (const key of allowed) {
    if (patch[key] !== undefined) update[key] = patch[key];
  }
  if (update.name !== undefined && String(update.name).trim().length < 2) {
    return { ok: false, error: 'Please enter your full name.' };
  }
  const user = await col().updateById(id, update);
  return { ok: true, user: safe(user) };
}

async function changePassword(id, currentPassword, newPassword) {
  const user = col().findById(id);
  if (!user) return { ok: false, error: 'Account not found.' };

  const match = await bcrypt.compare(String(currentPassword || ''), user.passwordHash || '');
  if (!match) return { ok: false, error: 'Your current password is incorrect.' };
  if (String(newPassword || '').length < 6) {
    return { ok: false, error: 'The new password must be at least 6 characters long.' };
  }

  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await col().updateById(id, { passwordHash });
  return { ok: true };
}

module.exports = {
  safe,
  create,
  verify,
  findByEmail,
  findById,
  updateProfile,
  changePassword,
  col
};