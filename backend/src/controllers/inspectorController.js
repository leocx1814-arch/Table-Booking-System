'use strict';

const { pool } = require('../config/database');

/**
 * POST /api/v1/complaints/:id/assign
 * Assign inspector to investigate a complaint and change status to 'investigating'.
 */
async function handleAssignComplaint(req, res, next) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const complaintId = parseInt(req.params.id, 10);
    const inspectorId = req.body.assigned_inspector_id
      ? parseInt(req.body.assigned_inspector_id, 10)
      : req.user.id;

    if (isNaN(complaintId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COMPLAINT_ID',
          message: 'รหัสข้อร้องเรียนไม่ถูกต้อง',
        },
      });
    }

    // Lock complaint record with SELECT FOR UPDATE
    const [[complaint]] = await connection.query(
      'SELECT id, status, table_id FROM complaints WHERE id = ? FOR UPDATE',
      [complaintId]
    );

    if (!complaint) {
      const err = new Error('ไม่พบข้อมูลข้อร้องเรียนที่ระบุ');
      err.statusCode = 404;
      err.code = 'COMPLAINT_NOT_FOUND';
      throw err;
    }

    const oldStatus = complaint.status;

    // Update status to investigating
    await connection.query(
      "UPDATE complaints SET status = 'investigating' WHERE id = ?",
      [complaintId]
    );

    // Record status history
    await connection.query(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, remarks, changed_by_user_id)
       VALUES (?, ?, 'investigating', 'มอบหมายสารวัตรลงพื้นที่ตรวจสอบ', ?)`,
      [complaintId, oldStatus, inspectorId]
    );

    await connection.commit();

    const [[updatedComplaint]] = await pool.query(
      `SELECT c.id AS complaint_id, c.status, c.table_id, t.table_number, u.first_name AS assigned_to
       FROM complaints c
       JOIN \`tables\` t ON c.table_id = t.id
       LEFT JOIN users u ON u.id = ?
       WHERE c.id = ?`,
      [inspectorId, complaintId]
    );

    return res.json({
      success: true,
      data: updatedComplaint,
    });
  } catch (err) {
    await connection.rollback();
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }
    return next(err);
  } finally {
    connection.release();
  }
}

/**
 * PATCH /api/v1/complaints/:id/status
 * Resolve or reject a complaint, deduct penalty points if violation confirmed, and update table status.
 */
async function handleUpdateComplaintStatus(req, res, next) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const complaintId = parseInt(req.params.id, 10);
    const { status, remarks, verify_violation, target_user_id } = req.body;

    if (isNaN(complaintId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COMPLAINT_ID',
          message: 'รหัสข้อร้องเรียนไม่ถูกต้อง',
        },
      });
    }

    if (!['resolved', 'rejected', 'awaiting_info', 'investigating'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: "สถานะต้องเป็น 'resolved', 'rejected', 'awaiting_info', หรือ 'investigating' เท่านั้น",
        },
      });
    }

    // Lock complaint record with SELECT FOR UPDATE
    const [[complaint]] = await connection.query(
      `SELECT c.id, c.status, c.table_id, c.complaint_type_id, ct.default_penalty_points
       FROM complaints c
       JOIN complaint_types ct ON c.complaint_type_id = ct.id
       WHERE c.id = ? FOR UPDATE`,
      [complaintId]
    );

    if (!complaint) {
      const err = new Error('ไม่พบข้อมูลข้อร้องเรียนที่ระบุ');
      err.statusCode = 404;
      err.code = 'COMPLAINT_NOT_FOUND';
      throw err;
    }

    const oldStatus = complaint.status;
    let pointsDeducted = 0;

    // Update complaint status and resolved_at
    const isFinished = ['resolved', 'rejected'].includes(status);
    await connection.query(
      `UPDATE complaints
       SET status = ?,
           resolved_at = ${isFinished ? 'NOW()' : 'NULL'}
       WHERE id = ?`,
      [status, complaintId]
    );

    // Record status history
    await connection.query(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, remarks, changed_by_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [complaintId, oldStatus, status, remarks || null, req.user.id]
    );

    // If resolved and violation confirmed, deduct penalty points
    if (status === 'resolved' && Boolean(verify_violation) && target_user_id) {
      const targetUserId = parseInt(target_user_id, 10);
      pointsDeducted = complaint.default_penalty_points || 20;

      // Deduct points
      await connection.query(
        'UPDATE users SET penalty_points = GREATEST(0, penalty_points - ?) WHERE id = ?',
        [pointsDeducted, targetUserId]
      );

      // Record penalty log
      await connection.query(
        `INSERT INTO penalty_logs (user_id, booking_id, complaint_id, points_changed, action_type, reason, created_by_user_id)
         VALUES (?, NULL, ?, ?, 'deduct', ?, ?)`,
        [targetUserId, complaintId, -pointsDeducted, remarks || 'คำร้องเรียนได้รับการยืนยันการทำผิดจริง', req.user.id]
      );

      // Check if target user dropped below 50 points and auto-blacklist
      const [[targetUser]] = await connection.query(
        'SELECT penalty_points, is_blacklisted FROM users WHERE id = ?',
        [targetUserId]
      );

      if (targetUser && targetUser.penalty_points < 50 && targetUser.is_blacklisted === 0) {
        await connection.query(
          'UPDATE users SET is_blacklisted = 1 WHERE id = ?',
          [targetUserId]
        );

        await connection.query(
          `INSERT INTO blacklists (user_id, banned_at, banned_until, reason, created_by_admin_id, is_active)
           VALUES (?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Auto-blacklisted: penalty points fell below 50 from confirmed complaint violation', ?, 1)`,
          [targetUserId, req.user.id]
        );
      }

      // Restore table status back to available after clearing
      await connection.query(
        "UPDATE `tables` SET status = 'available' WHERE id = ?",
        [complaint.table_id]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      data: {
        complaint_id: complaintId,
        status: status,
        points_deducted: pointsDeducted,
        remarks: remarks || null,
      },
    });
  } catch (err) {
    await connection.rollback();
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }
    return next(err);
  } finally {
    connection.release();
  }
}

module.exports = {
  handleAssignComplaint,
  handleUpdateComplaintStatus,
};
