'use strict';

const { pool } = require('../config/database');

/**
 * Labels สำหรับแสดงชื่อ setting บน Admin UI (ภาษาไทย)
 */
const SETTING_LABELS = {
  grace_period_minutes:        { label: 'เวลารอเช็คอิน (Grace Period)', unit: 'นาที', description: 'เวลาที่ผู้ใช้มีสิทธิ์สแกน QR เช็คอินหลังจองก่อนถูกยกเลิกอัตโนมัติ' },
  max_booking_duration_minutes:{ label: 'ระยะเวลาใช้งานสูงสุดต่อครั้ง', unit: 'นาที', description: 'เวลาที่นั่งสูงสุดหลังเช็คอิน หลังจากนั้นระบบจะเช็คเอาต์อัตโนมัติ' },
  blacklist_duration_days:     { label: 'ระยะเวลา Blacklist (ถาวร)', unit: 'วัน', description: 'จำนวนวันที่ผู้ใช้ถูกระงับสิทธิ์เมื่อคะแนนต่ำกว่าเกณฑ์' },
  min_points_to_book:          { label: 'คะแนนขั้นต่ำในการจอง', unit: 'คะแนน', description: 'ผู้ใช้ต้องมีคะแนนประพฤติไม่ต่ำกว่าค่านี้จึงจะจองได้' },
  gps_radius_meters:           { label: 'รัศมี GPS เช็คอิน', unit: 'เมตร', description: 'ระยะห่างสูงสุดจากศูนย์กลางโรงอาหารที่อนุญาตให้เช็คอิน' },
  canteen_lat:                 { label: 'Latitude ศูนย์กลางโรงอาหาร', unit: '', description: 'พิกัดละติจูดของโรงอาหาร ใช้คำนวณระยะ GPS Check-in' },
  canteen_lng:                 { label: 'Longitude ศูนย์กลางโรงอาหาร', unit: '', description: 'พิกัดลองจิจูดของโรงอาหาร ใช้คำนวณระยะ GPS Check-in' },
  max_bookings_per_day:        { label: 'สิทธิ์จองสูงสุดต่อวัน', unit: 'ครั้ง', description: 'จำนวนครั้งสูงสุดที่ผู้ใช้แต่ละคนจองได้ต่อวันปฏิทิน (เช่น 2 = มื้อเที่ยง + มื้อเย็น)' },
  max_advance_booking_minutes: { label: 'จองล่วงหน้าได้สูงสุด', unit: 'นาที', description: 'จำนวนนาทีสูงสุดที่อนุญาตให้จองล่วงหน้า (สำรองไว้สำหรับ Time-slot Booking)' },
  noshow_weekly_limit:         { label: 'No-show สูงสุดต่อสัปดาห์', unit: 'ครั้ง', description: 'หากไม่มาเช็คอินเกินจำนวนนี้ใน 7 วัน จะถูกระงับสิทธิ์ชั่วคราว' },
  noshow_temp_ban_days:        { label: 'ระยะเวลาระงับสิทธิ์ (No-show)', unit: 'วัน', description: 'จำนวนวันที่ถูกระงับสิทธิ์เมื่อ No-show เกินเกณฑ์ต่อสัปดาห์' },
};

/**
 * GET /api/v1/settings
 * Fetch all system settings with labels and descriptions for the Admin UI.
 * Requires admin role.
 */
async function handleGetSettings(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value, description FROM system_settings ORDER BY id ASC'
    );

    const enriched = rows.map((row) => {
      const meta = SETTING_LABELS[row.setting_key] || { label: row.setting_key, unit: '', description: row.description };
      return {
        key: row.setting_key,
        value: row.setting_value,
        label: meta.label,
        unit: meta.unit,
        description: meta.description || row.description,
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/v1/settings/:key
 * Update a single system setting value.
 * Requires admin role.
 */
async function handleUpdateSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null || String(value).trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_VALUE', message: 'กรุณาระบุค่าของ setting ที่ต้องการบันทึก' },
      });
    }

    const [[existing]] = await pool.query(
      'SELECT setting_key FROM system_settings WHERE setting_key = ?',
      [key]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'SETTING_NOT_FOUND', message: `ไม่พบ setting key: ${key}` },
      });
    }

    await pool.query(
      'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
      [String(value).trim(), key]
    );

    const meta = SETTING_LABELS[key] || { label: key, unit: '', description: '' };

    return res.json({
      success: true,
      data: {
        key,
        value: String(value).trim(),
        label: meta.label,
        unit: meta.unit,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleGetSettings,
  handleUpdateSetting,
};
