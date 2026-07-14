'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const { connectWithRetry } = require('./config/database');
const errorHandler         = require('./middlewares/errorHandler');

// ─────────────────────────────────────────────────────────────
// Startup Guard: Abort immediately if JWT_SECRET is missing.
// Phase 4 auth will need this; we fail-fast here to surface
// misconfigured environments before deployment.
// ─────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('❌ [Server] FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

const app  = express();
const PORT = parseInt(process.env.PORT || '5001', 10);

// ─────────────────────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));   // generous limit for future image uploads
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// Health-check Endpoint — /api/status
// Used by Docker healthcheck and frontend status indicator.
// Does NOT require authentication (public route).
// ─────────────────────────────────────────────────────────────
const { pool } = require('./config/database');

app.get('/api/status', async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT 1 + 1 AS result');
    return res.json({
      success: true,
      data: {
        status:    'healthy',
        database:  'connected',
        timestamp: new Date().toISOString(),
        version:   process.env.npm_package_version || '1.0.0',
        message:   'Canteen Table Booking System backend is running.',
      },
    });
  } catch (err) {
    // Delegate to errorHandler with an explicit status code
    res.statusCode = 503;
    return next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// Future route registrations go here (Phase 4+):
//
//   const authRoutes = require('./routes/authRoutes');
//   app.use('/api/auth', authRoutes);
//
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 404 Handler — must be after all valid routes
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code:    'ROUTE_NOT_FOUND',
    },
  });
});

// ─────────────────────────────────────────────────────────────
// Global Error Handler — must be LAST middleware (4 params)
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Bootstrap: connect to DB first, then start HTTP server
// ─────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 [Server] Starting Canteen Table Booking System backend...');
  console.log(`   Node.js  : ${process.version}`);
  console.log(`   Port     : ${PORT}`);
  console.log(`   Env      : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB Host  : ${process.env.MYSQL_HOST || 'db'}:${process.env.MYSQL_PORT || 3306}`);

  // Block startup until MySQL is reachable (retry loop in database.js)
  await connectWithRetry();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ [Server] Express server listening on port ${PORT}`);
  });
})();
