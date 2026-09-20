'use strict';

/**
 * Error handling helpers.
 */

/** Wrap an async route handler so thrown errors reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** 404 handler for unknown /api/* routes. */
function apiNotFound(req, res) {
  res.status(404).json({
    ok: false,
    error: `No API route matches ${req.method} ${req.originalUrl}`
  });
}

/** Final error handler. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (status >= 500) console.error('[error]', err);

  if (req.path && req.path.startsWith('/api')) {
    return res.status(status).json({
      ok: false,
      error:
        status >= 500 && isProduction
          ? 'Something went wrong on our side. Please try again.'
          : err.message || 'Unexpected error'
    });
  }

  res.status(status).send(
    `<h1>${status}</h1><p>${status >= 500 ? 'Something went wrong.' : err.message || 'Not found'}</p>`
  );
}

module.exports = { asyncHandler, apiNotFound, errorHandler };