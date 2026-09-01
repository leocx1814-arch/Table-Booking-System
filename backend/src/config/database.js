'use strict';

const mysql = require('mysql2/promise');

// ─────────────────────────────────────────────────────────────
// MySQL Connection Pool Configuration
// Host must use the Docker service name 'db' (not 'localhost')
// For Cloud / TiDB / Remote DBs requiring TLS/SSL:
// Set MYSQL_SSL=true (or auto-detected for known cloud hosts).
// ─────────────────────────────────────────────────────────────
function getSslConfig() {
  const sslEnv = process.env.MYSQL_SSL ? process.env.MYSQL_SSL.toLowerCase().trim() : '';
  const host = process.env.MYSQL_HOST || '';
  const isCloudHost = host.includes('tidbcloud.com') ||
                      host.includes('psdb.cloud') ||
                      host.includes('aivencloud.com');

  if (sslEnv === 'true' || sslEnv === '1' || (!sslEnv && isCloudHost)) {
    const rejectUnauthorized = process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false';
    const config = { rejectUnauthorized, minVersion: 'TLSv1.2' };
    if (process.env.MYSQL_SSL_CA) {
      config.ca = process.env.MYSQL_SSL_CA;
    }
    return config;
  }

  if (process.env.MYSQL_SSL_CA) {
    return {
      ca: process.env.MYSQL_SSL_CA,
      rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false',
    };
  }

  return undefined;
}

const pool = mysql.createPool({
  host:              process.env.MYSQL_HOST     || 'db',
  port:              parseInt(process.env.MYSQL_PORT || '3306', 10),
  user:              process.env.MYSQL_USER     || 'booking_user',
  password:          process.env.MYSQL_PASSWORD || 'booking_pass',
  database:          process.env.MYSQL_DATABASE || 'booking_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+07:00',   // Asia/Bangkok — prevents timestamp shift bugs
  ssl:                getSslConfig(),
});

/**
 * Retry loop: attempts a DB ping every RETRY_INTERVAL_MS until successful.
 * Prevents the backend container from crashing when MySQL is still initialising.
 *
 * @param {number} maxRetries       - Maximum attempts before giving up (0 = infinite)
 * @param {number} retryIntervalMs  - Milliseconds between retry attempts
 * @returns {Promise<void>}
 */
const RETRY_INTERVAL_MS = 5000;
const MAX_RETRIES = 0; // 0 = keep retrying forever (Docker restarts handle the rest)

async function connectWithRetry(attempt = 1) {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`✅ [DB] MySQL connected successfully (attempt #${attempt})`);
  } catch (err) {
    const nextAttempt = attempt + 1;
    console.warn(
      `⚠️  [DB] Connection failed (attempt #${attempt}): ${err.message}. ` +
      `Retrying in ${RETRY_INTERVAL_MS / 1000}s...`
    );
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));

    if (MAX_RETRIES === 0 || nextAttempt <= MAX_RETRIES) {
      return connectWithRetry(nextAttempt);
    }
    throw new Error(`[DB] Could not connect to MySQL after ${attempt} attempts.`);
  }
}

module.exports = { pool, connectWithRetry };
