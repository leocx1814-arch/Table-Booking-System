'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const {
  handleListTables,
  handleUpdateTableStatus,
} = require('../controllers/tableController');

router.use(verifyToken);

router.get('/tables', handleListTables);
router.patch('/tables/:id/status', handleUpdateTableStatus);

module.exports = router;
