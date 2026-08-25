'use strict';

const complaintService = require('../services/complaintService');

/**
 * GET /api/v1/complaint-categories
 * Fetch list of complaint categories.
 */
async function handleGetComplaintCategories(req, res, next) {
  try {
    const categories = await complaintService.getComplaintCategories();
    return res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/complaints
 * File a new table complaint.
 */
async function handleCreateComplaint(req, res, next) {
  try {
    const userId = req.user.id;
    const { table_id, complaint_type_id, description, evidence_image_path, is_anonymous } = req.body;

    if (!table_id || !complaint_type_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'กรุณาระบุ table_id และ complaint_type_id ให้ครบถ้วน',
        },
      });
    }

    const complaint = await complaintService.createComplaint(userId, {
      table_id: parseInt(table_id, 10),
      complaint_type_id: parseInt(complaint_type_id, 10),
      description,
      evidence_image_path,
      is_anonymous: Boolean(is_anonymous),
    });

    return res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (err) {
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }
    return next(err);
  }
}

/**
 * GET /api/v1/complaints
 * Fetch complaints list with optional query filter.
 */
async function handleGetComplaints(req, res, next) {
  try {
    const { status, source } = req.query;
    const complaints = await complaintService.getComplaints({ status, source });

    return res.json({
      success: true,
      data: complaints,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleGetComplaintCategories,
  handleCreateComplaint,
  handleGetComplaints,
};
