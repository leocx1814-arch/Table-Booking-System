'use strict';

const { pool } = require('../config/database');

// Active SSE client connections
let clients = [];

/**
 * Register a new client for SSE event streaming.
 */
async function registerClient(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write('\n');

  const client = {
    id: Date.now(),
    req,
    res,
    user: req.user || null,
  };

  clients.push(client);
  console.log(`📡 [SSE] Client connected. ID: ${client.id}. Total active: ${clients.length}`);

  // 1. Send initial tables state to populate UI instantly
  try {
    const [tables] = await pool.query(`
      SELECT
        t.id,
        t.table_number,
        t.status,
        t.layout_x,
        t.layout_y,
        t.qr_code_hash,
        z.zone_name AS zone,
        z.is_staff_only,
        t.zone_id AS zone_id
      FROM \`tables\` t
      JOIN canteen_zones z ON z.id = t.zone_id
      ORDER BY t.id ASC
    `);

    const formattedTables = tables.map((table) => ({
      ...table,
      capacity: table.is_staff_only ? 6 : 4,
    }));

    sendEventToClient(client, 'initial_tables', formattedTables);
  } catch (err) {
    console.error('❌ [SSE] Error fetching initial tables:', err.message);
  }

  // 2. Handle client disconnect
  req.on('close', () => {
    clients = clients.filter((c) => c.id !== client.id);
    console.log(`📡 [SSE] Client disconnected. ID: ${client.id}. Total active: ${clients.length}`);
  });
}

/**
 * Send event message directly to a single client connection.
 */
function sendEventToClient(client, eventName, data) {
  try {
    client.res.write(`event: ${eventName}\n`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (err) {
    console.error(`❌ [SSE] Error writing event to client ${client.id}:`, err.message);
  }
}

/**
 * Broadcast an event to all connected clients.
 */
function broadcast(eventName, data) {
  clients.forEach((client) => {
    sendEventToClient(client, eventName, data);
  });
  console.log(`📡 [SSE] Broadcasted event "${eventName}" to ${clients.length} client(s)`);
}

/**
 * Broadcast updated details of a single table to all clients.
 */
async function broadcastTableUpdate(tableId) {
  try {
    const [[table]] = await pool.query(
      `SELECT t.id, t.table_number, t.status, t.layout_x, t.layout_y, t.qr_code_hash, z.zone_name AS zone, z.is_staff_only, t.zone_id AS zone_id
       FROM \`tables\` t
       JOIN canteen_zones z ON z.id = t.zone_id
       WHERE t.id = ?`,
      [tableId]
    );

    if (table) {
      const formatted = {
        ...table,
        capacity: table.is_staff_only ? 6 : 4,
        status_changed_at: new Date().toISOString(), // attach status transition timestamp for SLA calculations
      };
      broadcast('table_updated', formatted);
    }
  } catch (err) {
    console.error(`❌ [SSE] Error broadcasting table update for ID ${tableId}:`, err.message);
  }
}

module.exports = {
  registerClient,
  broadcast,
  broadcastTableUpdate,
};
