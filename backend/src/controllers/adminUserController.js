'use strict';

const { pool } = require('../config/database');

/**
 * GET /api/v1/admin/users
 * Fetch all users with role, penalty points, and active blacklist status.
 */
async function handleListUsers(req, res, next) {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.student_id,
              r.role_name AS role, u.penalty_points, u.is_blacklisted, u.created_at,
              b.id AS blacklist_id, b.banned_at, b.banned_until, b.reason AS blacklist_reason
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN blacklists b ON b.user_id = u.id AND b.is_active = 1
       ORDER BY u.id ASC`
    );

    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/v1/admin/users/:id/unban
 * Unban a user, restore points to 100, and deactivate blacklist records.
 */
async function handleUnbanUser(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.id, 10);
    const adminId = req.user?.id || null;
    const { reason = 'Admin manual unban override' } = req.body;

    await connection.beginTransaction();

    const [[user]] = await connection.query(
      'SELECT id, username, penalty_points, is_blacklisted FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );

    if (!user) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'ไม่พบผู้ใช้งานที่ระบุ' },
      });
    }

    const pointsToRestore = Math.max(0, 100 - user.penalty_points);

    // Update user status
    await connection.query(
      'UPDATE users SET is_blacklisted = 0, penalty_points = 100 WHERE id = ?',
      [userId]
    );

    // Deactivate blacklist records
    await connection.query(
      'UPDATE blacklists SET is_active = 0 WHERE user_id = ? AND is_active = 1',
      [userId]
    );

    // Insert penalty log if points changed
    if (pointsToRestore > 0) {
      await connection.query(
        `INSERT INTO penalty_logs (user_id, points_changed, action_type, reason, created_by_user_id)
         VALUES (?, ?, 'restore', ?, ?)`,
        [userId, pointsToRestore, reason, adminId]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      data: {
        userId,
        is_blacklisted: 0,
        penalty_points: 100,
        message: 'ปลดแบนและคืนแต้มความประพฤติสำเร็จ',
      },
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
}

/**
 * PATCH /api/v1/admin/users/:id/points
 * Adjust penalty points for a user.
 */
async function handleAdjustPoints(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.id, 10);
    const adminId = req.user?.id || null;
    const { points, reason = 'Admin manual adjustment' } = req.body;

    if (points === undefined || isNaN(points)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'กรุณาระบุคะแนนที่ถูกต้อง' },
      });
    }

    await connection.beginTransaction();

    const [[user]] = await connection.query(
      'SELECT id, username, penalty_points, is_blacklisted FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );

    if (!user) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'ไม่พบผู้ใช้งานที่ระบุ' },
      });
    }

    const newPoints = Math.max(0, Math.min(100, parseInt(points, 10)));
    const diff = newPoints - user.penalty_points;
    const isBlacklisted = newPoints < 50 ? 1 : user.is_blacklisted;

    await connection.query(
      'UPDATE users SET penalty_points = ?, is_blacklisted = ? WHERE id = ?',
      [newPoints, isBlacklisted, userId]
    );

    if (diff !== 0) {
      await connection.query(
        `INSERT INTO penalty_logs (user_id, points_changed, action_type, reason, created_by_user_id)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, diff, diff > 0 ? 'restore' : 'deduct', reason, adminId]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      data: {
        userId,
        penalty_points: newPoints,
        is_blacklisted: isBlacklisted,
        message: 'ปรับปรุงคะแนนสำเร็จ',
      },
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
}

module.exports = {
  handleListUsers,
  handleUnbanUser,
  handleAdjustPoints,
};
