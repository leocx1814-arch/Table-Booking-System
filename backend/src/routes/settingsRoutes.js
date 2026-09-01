'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');
const { handleGetSettings, handleUpdateSetting } = require('../controllers/settingsController');

// All settings endpoints require authentication + admin role
const adminAuth = [verifyToken, requireRoles('admin')];

// GET /api/v1/settings — fetch all system settings with labels
router.get('/settings', adminAuth, handleGetSettings);

// PATCH /api/v1/settings/:key — update a single setting value
router.patch('/settings/:key', adminAuth, handleUpdateSetting);

module.exports = router;
