'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const { handleLogin, handleGetMe } = require('../controllers/authController');

// POST /api/v1/auth/login
router.post('/login', handleLogin);

// GET /api/v1/auth/me
router.get('/me', verifyToken, handleGetMe);

module.exports = router;
