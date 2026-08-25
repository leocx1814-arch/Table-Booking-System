'use strict';

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT Bearer token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
function verifyToken(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน (Missing or invalid token)',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณากรอกข้อมูลเข้าสู่ระบบใหม่',
      },
    });
  }
}

/**
 * Middleware to restrict route access to specific roles.
 * @param {...string} allowedRoles Roles allowed to access (e.g. 'admin', 'inspector', 'student')
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ไม่พบข้อมูลสิทธิ์ของผู้ใช้งานในระบบ',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันหรือข้อมูลส่วนนี้',
        },
      });
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  requireRoles,
};
