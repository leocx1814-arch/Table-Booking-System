'use strict';

const tableService = require('../services/tableService');

async function handleListTables(req, res, next) {
  try {
    const tables = await tableService.listTables();
    return res.json({
      success: true,
      data: tables,
    });
  } catch (err) {
    return next(err);
  }
}

async function handleUpdateTableStatus(req, res, next) {
  try {
    const tableId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (Number.isNaN(tableId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TABLE_ID',
          message: 'รหัสโต๊ะไม่ถูกต้อง',
        },
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STATUS',
          message: 'กรุณาระบุสถานะโต๊ะ',
        },
      });
    }

    const table = await tableService.updateTableStatus(tableId, status);
    return res.json({
      success: true,
      data: table,
    });
  } catch (err) {
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }
    return next(err);
  }
}

module.exports = {
  handleListTables,
  handleUpdateTableStatus,
};
