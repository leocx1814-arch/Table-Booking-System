'use strict';

const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Periodically scan and auto-release pending bookings that exceeded their grace period expiration.
 * Deducts 5 penalty points for no-show and auto-blacklists if penalty points drop below 50.
 */
async function autoReleaseExpiredBookings() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Find all pending bookings where grace_expired_at < NOW()
    const [expiredBookings] = await connection.query(
      `SELECT b.id AS booking_id, b.user_id, b.table_id
       FROM bookings b
       WHERE b.status = 'pending' AND b.grace_expired_at < NOW()
       FOR UPDATE`
    );

    if (expiredBookings.length === 0) {
      await connection.rollback();
      return;
    }

    console.log(`⏰ [CronService] Processing ${expiredBookings.length} expired pending booking(s)...`);

    const releasedTables = [];

    for (const booking of expiredBookings) {
      const { booking_id, user_id, table_id } = booking;
      releasedTables.push({ tableId: table_id, userId: user_id });

      // Update booking status to 'expired'
      await connection.query(
        "UPDATE bookings SET status = 'expired' WHERE id = ?",
        [booking_id]
      );

      // Restore table status back to 'available'
      await connection.query(
        "UPDATE `tables` SET status = 'available' WHERE id = ? AND status = 'pending_checkin'",
        [table_id]
      );

      // Record audit history
      await connection.query(
        `INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by_user_id)
         VALUES (?, 'pending', 'expired', NULL)`,
        [booking_id]
      );

      // Deduct 5 penalty points from user for no-show
      const PENALTY_DEDUCTION = 5;
      await connection.query(
        'UPDATE users SET penalty_points = GREATEST(0, penalty_points - ?) WHERE id = ?',
        [PENALTY_DEDUCTION, user_id]
      );

      // Insert penalty log
      await connection.query(
        `INSERT INTO penalty_logs (user_id, booking_id, complaint_id, points_changed, action_type, reason, created_by_user_id)
         VALUES (?, ?, NULL, ?, 'deduct', 'Auto-released: booking expired without check-in (grace period exceeded)', NULL)`,
        [user_id, booking_id, -PENALTY_DEDUCTION]
      );

      // Check if user's remaining points dropped below 50 and auto-blacklist
      const [[user]] = await connection.query(
        'SELECT penalty_points, is_blacklisted FROM users WHERE id = ?',
        [user_id]
      );

      if (user && user.penalty_points < 50 && user.is_blacklisted === 0) {
        await connection.query(
          'UPDATE users SET is_blacklisted = 1 WHERE id = ?',
          [user_id]
        );

        await connection.query(
          `INSERT INTO blacklists (user_id, banned_at, banned_until, reason, created_by_admin_id, is_active)
           VALUES (?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Auto-blacklisted: penalty points fell below 50', ?, 1)`,
          [user_id, user_id]
        );
        console.log(`🚨 [CronService] User ID ${user_id} auto-blacklisted due to low penalty points (${user.penalty_points})`);
      }
    }

    await connection.commit();

    // Broadcast table releases and user notifications via SSE
    const { broadcast, broadcastTableUpdate } = require('./sseService');
    for (const item of releasedTables) {
      broadcastTableUpdate(item.tableId);
      broadcast('notification', {
        userId: item.userId,
        message: 'การจองโต๊ะของคุณถูกยกเลิกแล้ว เนื่องจากเช็คอินไม่ทันภายในกำหนด 10 นาที (หัก 5 คะแนน)',
      });
    }

    console.log(`✅ [CronService] Auto-released ${expiredBookings.length} expired booking(s) successfully.`);
  } catch (err) {
    await connection.rollback();
    console.error('❌ [CronService] Error running autoReleaseExpiredBookings:', err.message);
  } finally {
    connection.release();
  }
}

/**
 * Start background Cron jobs.
 */
function startCronJobs() {
  console.log('⏱️ [CronService] Initializing auto-release cron service (runs every minute)...');
  // Schedule to run every 1 minute
  cron.schedule('* * * * *', async () => {
    await autoReleaseExpiredBookings();
  });
}

module.exports = {
  startCronJobs,
  autoReleaseExpiredBookings,
};
