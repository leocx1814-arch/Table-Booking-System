'use strict';

const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Helper: fetch a system setting value from DB with a fallback default.
 */
async function getSettingValue(connection, key, defaultValue) {
  const [[row]] = await connection.query(
    'SELECT setting_value FROM system_settings WHERE setting_key = ?',
    [key]
  );
  return row ? row.setting_value : defaultValue;
}

/**
 * Periodically scan and auto-release pending bookings that exceeded their grace period expiration.
 * Deducts 5 penalty points for no-show and auto-blacklists if penalty points drop below 50.
 * Also applies a temporary no-show ban if user exceeds noshow_weekly_limit within 7 days.
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

    // Read no-show policy settings
    const noshowLimitStr = await getSettingValue(connection, 'noshow_weekly_limit', '3');
    const noshowLimit = parseInt(noshowLimitStr, 10);
    const noshowBanDaysStr = await getSettingValue(connection, 'noshow_temp_ban_days', '3');
    const noshowBanDays = parseInt(noshowBanDaysStr, 10);

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

      // Re-fetch user state after deduction
      const [[user]] = await connection.query(
        'SELECT penalty_points, is_blacklisted FROM users WHERE id = ?',
        [user_id]
      );

      // Check 1: penalty-points-triggered permanent blacklist (< 50 points)
      if (user && user.penalty_points < 50 && user.is_blacklisted === 0) {
        const blacklistDaysStr = await getSettingValue(connection, 'blacklist_duration_days', '7');
        const blacklistDays = parseInt(blacklistDaysStr, 10);

        await connection.query(
          'UPDATE users SET is_blacklisted = 1 WHERE id = ?',
          [user_id]
        );

        await connection.query(
          `INSERT INTO blacklists (user_id, banned_at, banned_until, reason, created_by_admin_id, is_active)
           VALUES (?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'Auto-blacklisted: penalty points fell below 50', ?, 1)`,
          [user_id, blacklistDays, user_id]
        );
        console.log(`🚨 [CronService] User ID ${user_id} auto-blacklisted (low points: ${user.penalty_points})`);
        continue; // Already blacklisted — skip no-show temp ban check
      }

      // Check 2: no-show-count-triggered temporary ban
      if (user && user.is_blacklisted === 0) {
        const [[noshowRow]] = await connection.query(
          `SELECT COUNT(*) AS cnt FROM bookings
           WHERE user_id = ? AND status = 'expired'
             AND booked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
          [user_id]
        );

        const weeklyNoshow = noshowRow.cnt;
        if (weeklyNoshow >= noshowLimit) {
          await connection.query(
            'UPDATE users SET is_blacklisted = 1 WHERE id = ?',
            [user_id]
          );

          await connection.query(
            `INSERT INTO blacklists (user_id, banned_at, banned_until, reason, created_by_admin_id, is_active)
             VALUES (?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY),
               'Auto-temp-banned: no-show ${weeklyNoshow} times within 7 days (limit: ${noshowLimit})',
               ?, 1)`,
            [user_id, noshowBanDays, user_id]
          );
          console.log(`⚠️ [CronService] User ID ${user_id} temp-banned for ${noshowBanDays} days (no-show: ${weeklyNoshow}/${noshowLimit} this week)`);
        }
      }
    }

    await connection.commit();

    // Broadcast table releases and user notifications via SSE
    const { broadcast, broadcastTableUpdate } = require('./sseService');
    for (const item of releasedTables) {
      broadcastTableUpdate(item.tableId);
      broadcast('notification', {
        userId: item.userId,
        message: 'การจองโต๊ะของคุณถูกยกเลิกแล้ว เนื่องจากเช็คอินไม่ทันภายในกำหนด (หัก 5 คะแนน)',
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
