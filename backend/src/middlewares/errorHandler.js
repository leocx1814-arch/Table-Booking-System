'use strict';

/**
 * Global Express Error Handler Middleware
 *
 * Must be registered LAST in the Express middleware chain (after all routes).
 * Catches any error passed via next(err) from controllers or route handlers.
 *
 * Standard error response envelope:
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Human-readable error description",
 *     "code": "ERROR_CODE"
 *   }
 * }
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log full error stack in development for easier debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ErrorHandler] ${req.method} ${req.originalUrl}`, err);
  } else {
    // In production, log only message without stack trace (no PII leakage)
    console.error(`[ErrorHandler] ${req.method} ${req.originalUrl} — ${err.message}`);
  }

  // Respect explicitly set status codes (e.g. from controllers)
  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : err.statusCode || err.status || 500;

  // Map well-known error names to cleaner codes
  const errorCodeMap = {
    ValidationError:      'VALIDATION_ERROR',
    UnauthorizedError:    'UNAUTHORIZED',
    JsonWebTokenError:    'INVALID_TOKEN',
    TokenExpiredError:    'TOKEN_EXPIRED',
    NotFoundError:        'NOT_FOUND',
    ForbiddenError:       'FORBIDDEN',
  };
  const errorCode = errorCodeMap[err.name] || err.code || 'INTERNAL_SERVER_ERROR';

  // Never expose raw stack traces or internal details in production
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
    },
  });
}

module.exports = errorHandler;
