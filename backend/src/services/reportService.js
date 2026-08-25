'use strict';

const { pool } = require('../config/database');

/**
 * Get real-time canteen table occupancy status summary.
 */
async function getCanteenStatus() {
  const [[counts]] = await pool.query(`
    SELECT
      COUNT(*) AS total_tables,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS occupied,
      SUM(CASE WHEN status = 'pending_checkin' THEN 1 ELSE 0 END) AS pending_checkin,
      SUM(CASE WHEN status = 'need_cleaning' THEN 1 ELSE 0 END) AS need_cleaning,
      SUM(CASE WHEN status = 'cleaning' THEN 1 ELSE 0 END) AS cleaning,
      SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance
    FROM \`tables\`
  `);

  const total = counts.total_tables || 0;
  const inUse = (counts.occupied || 0) + (counts.pending_checkin || 0);
  const occupancyRate = total > 0 ? Math.round((inUse / total) * 100 * 100) / 100 : 0;

  return {
    occupancy_rate: occupancyRate,
    total_tables: total,
    available: counts.available || 0,
    occupied: counts.occupied || 0,
    pending_checkin: counts.pending_checkin || 0,
    need_cleaning: counts.need_cleaning || 0,
    cleaning: counts.cleaning || 0,
    maintenance: counts.maintenance || 0,
  };
}

/**
 * Get detailed executive report on violations, zone popularity, and SLA health.
 * NOTE: Date range / zone filtering is reserved for future phases.
 */
async function getViolationReports() {
  // 1. Total violations & blacklist counts
  const [[violationStats]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM penalty_logs WHERE action_type = 'deduct') AS total_violations,
      (SELECT COUNT(*) FROM users WHERE is_blacklisted = 1) AS blacklist_active,
      (SELECT COUNT(*) FROM bookings WHERE status = 'expired') AS no_show_count,
      (SELECT COUNT(*) FROM complaints WHERE status = 'resolved') AS complaint_violations_count
  `);

  // 2. Zone Popularity Index
  const [zonePopularity] = await pool.query(`
    SELECT
      z.id AS zone_id,
      z.zone_name,
      COUNT(b.id) AS total_bookings,
      ROUND(
        COUNT(b.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM bookings), 0),
        2
      ) AS popularity_percentage
    FROM canteen_zones z
    LEFT JOIN \`tables\` t ON z.id = t.zone_id
    LEFT JOIN bookings b ON t.id = b.table_id
    GROUP BY z.id, z.zone_name
    ORDER BY total_bookings DESC
  `);

  // 3. SLA Health Metrics (Average cleaning time & resolution time)
  const [[avgCleaning]] = await pool.query(`
    SELECT
      COALESCE(ROUND(AVG(TIMESTAMPDIFF(MINUTE, started_at, completed_at)), 1), 0) AS avg_cleaning_time_minutes
    FROM table_cleaning_logs
    WHERE completed_at IS NOT NULL
  `);

  const [[avgResolution]] = await pool.query(`
    SELECT
      COALESCE(ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)), 1), 0) AS avg_resolution_time_minutes
    FROM complaints
    WHERE status = 'resolved' AND resolved_at IS NOT NULL
  `);

  // Count active complaints exceeding 5-minute High SLA threshold
  const [[slaBreach]] = await pool.query(`
    SELECT COUNT(*) AS breach_count
    FROM complaints
    WHERE status IN ('pending_review', 'investigating')
      AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 5
  `);

  const [[totalComplaints]] = await pool.query('SELECT COUNT(*) AS total FROM complaints');
  const totalCompCount = totalComplaints.total || 0;
  const breachCount = slaBreach.breach_count || 0;
  const slaHealthPercentage = totalCompCount > 0
    ? Math.max(0, Math.round((1 - breachCount / totalCompCount) * 100 * 100) / 100)
    : 100;

  return {
    total_violations: violationStats.total_violations || 0,
    blacklist_active: violationStats.blacklist_active || 0,
    no_show_count: violationStats.no_show_count || 0,
    complaint_violations_count: violationStats.complaint_violations_count || 0,
    zone_popularity: zonePopularity,
    sla_health: {
      sla_health_percentage: slaHealthPercentage,
      sla_breach_count: breachCount,
      avg_cleaning_time_minutes: parseFloat(avgCleaning.avg_cleaning_time_minutes),
      avg_resolution_time_minutes: parseFloat(avgResolution.avg_resolution_time_minutes),
    },
  };
}

module.exports = {
  getCanteenStatus,
  getViolationReports,
};
