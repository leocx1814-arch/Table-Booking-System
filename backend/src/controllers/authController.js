'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

/**
 * POST /api/v1/auth/login
 * Log in a user and return a JWT token.
 */
async function handleLogin(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน',
        },
      });
    }

    // Query user and join with roles to get role_name
    const [[user]] = await pool.query(
      `SELECT u.id, u.username, u.password_hash, u.email, u.first_name, u.last_name, u.penalty_points, u.is_blacklisted, r.role_name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = ?`,
      [username]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        },
      });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      }
    );

    // Return token and user details
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          penalty_points: user.penalty_points,
          is_blacklisted: user.is_blacklisted,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/auth/me
 * Fetch profile of the logged-in user.
 */
async function handleGetMe(req, res, next) {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.penalty_points, u.is_blacklisted, r.role_name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งานในระบบ',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleLogin,
  handleGetMe,
};
