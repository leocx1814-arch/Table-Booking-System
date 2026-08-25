'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const {
  handleGetComplaintCategories,
  handleCreateComplaint,
  handleGetComplaints,
} = require('../controllers/complaintController');

// All complaint routes require JWT authentication
router.use(verifyToken);

// GET /api/v1/complaint-categories
router.get('/complaint-categories', handleGetComplaintCategories);

// POST /api/v1/complaints
router.post('/complaints', handleCreateComplaint);

// GET /api/v1/complaints
router.get('/complaints', handleGetComplaints);

module.exports = router;
