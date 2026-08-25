'use strict';

const { pool } = require('../config/database');

/**
 * Fetch all complaint categories/types.
 */
async function getComplaintCategories() {
  const [rows] = await pool.query(
    'SELECT id, type_name, default_penalty_points FROM complaint_types ORDER BY id ASC'
  );
  return rows;
}

/**
 * Submit a new complaint regarding canteen tables.
 */
async function createComplaint(userId, { table_id, complaint_type_id, description, evidence_image_path, is_anonymous }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verify table exists
    const [[table]] = await connection.query(
      'SELECT id, table_number FROM `tables` WHERE id = ?',
      [table_id]
    );

    if (!table) {
      const err = new Error('ไม่พบข้อมูลโต๊ะที่ระบุ');
      err.statusCode = 404;
      err.code = 'TABLE_NOT_FOUND';
      throw err;
    }

    // 2. Verify complaint type exists
    const [[cType]] = await connection.query(
      'SELECT id, type_name FROM complaint_types WHERE id = ?',
      [complaint_type_id]
    );

    if (!cType) {
      const err = new Error('ไม่พบประเภทข้อร้องเรียนที่ระบุ');
      err.statusCode = 404;
      err.code = 'COMPLAINT_TYPE_NOT_FOUND';
      throw err;
    }

    if (!description || description.trim() === '') {
      const err = new Error('กรุณาระบุรายละเอียดข้อร้องเรียน');
      err.statusCode = 400;
      err.code = 'MISSING_DESCRIPTION';
      throw err;
    }

    // 3. Insert complaint record (reporter_user_id is NULL if anonymous according to PDPA policy)
    const reporterId = is_anonymous ? null : userId;
    const evidencePath = evidence_image_path || null;

    const [result] = await connection.query(
      `INSERT INTO complaints (source, reporter_user_id, table_id, complaint_type_id, evidence_image_path, description, status)
       VALUES ('web', ?, ?, ?, ?, ?, 'pending_review')`,
      [reporterId, table_id, complaint_type_id, evidencePath, description.trim()]
    );

    const complaintId = result.insertId;

    // 4. Record complaint status history
    await connection.query(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, remarks, changed_by_user_id)
       VALUES (?, NULL, 'pending_review', 'ยื่นข้อร้องเรียนผ่านระบบเว็บ', ?)`,
      [complaintId, userId]
    );

    await connection.commit();

    const [[newComplaint]] = await pool.query(
      `SELECT c.id AS complaint_id, c.source, c.table_id, t.table_number,
              c.complaint_type_id, ct.type_name, c.evidence_image_path,
              c.description, c.status, c.created_at
       FROM complaints c
       JOIN \`tables\` t ON c.table_id = t.id
       JOIN complaint_types ct ON c.complaint_type_id = ct.id
       WHERE c.id = ?`,
      [complaintId]
    );

    return newComplaint;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Fetch complaints with optional status and source filtering.
 */
async function getComplaints({ status, source }) {
  let query = `
    SELECT c.id AS complaint_id, c.source, c.table_id, t.table_number,
           c.complaint_type_id, ct.type_name, c.evidence_image_path,
           c.description, c.status, c.created_at, c.resolved_at,
           CASE WHEN c.reporter_user_id IS NULL THEN 'ไม่ประสงค์ออกนาม' ELSE u.first_name END AS reporter_name
    FROM complaints c
    JOIN \`tables\` t ON c.table_id = t.id
    JOIN complaint_types ct ON c.complaint_type_id = ct.id
    LEFT JOIN users u ON c.reporter_user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }

  if (source) {
    query += ' AND c.source = ?';
    params.push(source);
  }

  query += ' ORDER BY c.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
}

module.exports = {
  getComplaintCategories,
  createComplaint,
  getComplaints,
};
