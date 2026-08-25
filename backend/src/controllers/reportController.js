'use strict';

const reportService = require('../services/reportService');

/**
 * GET /api/v1/dashboard/canteen-status
 * Fetch real-time canteen table occupancy status summary.
 */
async function handleGetCanteenStatus(req, res, next) {
  try {
    const statusSummary = await reportService.getCanteenStatus();
    return res.json({
      success: true,
      data: statusSummary,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/reports/violations
 * Fetch executive violation statistics, zone popularity index, and SLA health metrics.
 */
async function handleGetViolationReports(req, res, next) {
  try {
    const reportData = await reportService.getViolationReports();

    return res.json({
      success: true,
      data: reportData,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleGetCanteenStatus,
  handleGetViolationReports,
};
