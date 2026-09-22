'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');
const {
  handleListUsers,
  handleUnbanUser,
  handleAdjustPoints,
} = require('../controllers/adminUserController');

// All admin user routes require authentication + admin role
const adminAuth = [verifyToken, requireRoles('admin')];

// GET /api/v1/admin/users
router.get('/users', adminAuth, handleListUsers);

// PATCH /api/v1/admin/users/:id/unban
router.patch('/users/:id/unban', adminAuth, handleUnbanUser);

// PATCH /api/v1/admin/users/:id/points
router.patch('/users/:id/points', adminAuth, handleAdjustPoints);

module.exports = router;
