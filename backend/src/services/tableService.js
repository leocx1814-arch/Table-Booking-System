'use strict';

const { pool } = require('../config/database');

const VALID_STATUSES = ['available', 'pending_checkin', 'occupied', 'need_cleaning', 'cleaning', 'maintenance'];

async function listTables() {
  const [rows] = await pool.query(`
    SELECT
      t.id,
      t.table_number,
      t.status,
      t.layout_x,
      t.layout_y,
      t.qr_code_hash,
      z.zone_name AS zone,
      z.is_staff_only,
      t.zone_id AS zone_id
    FROM \`tables\` t
    JOIN canteen_zones z ON z.id = t.zone_id
    ORDER BY t.id ASC
  `);

  return rows.map((table) => ({
    ...table,
    capacity: table.is_staff_only ? 6 : 4,
  }));
}

async function updateTableStatus(tableId, status) {
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error('สถานะโต๊ะไม่ถูกต้อง');
    err.statusCode = 400;
    err.code = 'INVALID_TABLE_STATUS';
    throw err;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[table]] = await connection.query(
      'SELECT id, table_number, status FROM `tables` WHERE id = ? FOR UPDATE',
      [tableId]
    );

    if (!table) {
      const err = new Error('ไม่พบข้อมูลโต๊ะที่ระบุ');
      err.statusCode = 404;
      err.code = 'TABLE_NOT_FOUND';
      throw err;
    }

    await connection.query('UPDATE `tables` SET status = ? WHERE id = ?', [status, tableId]);
    await connection.commit();

    // Broadcast table status change via SSE
    const { broadcastTableUpdate } = require('./sseService');
    broadcastTableUpdate(tableId);

    const [[updatedTable]] = await pool.query(
      `SELECT t.id, t.table_number, t.status, z.zone_name AS zone, z.is_staff_only
       FROM \`tables\` t
       JOIN canteen_zones z ON z.id = t.zone_id
       WHERE t.id = ?`,
      [tableId]
    );

    return {
      ...updatedTable,
      capacity: updatedTable.is_staff_only ? 6 : 4,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  listTables,
  updateTableStatus,
};
