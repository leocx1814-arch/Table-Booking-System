'use strict';

/**
 * Integration Tests: Booking Endpoints
 * Phase 14 — Testing and Bug Fix
 *
 * Covers the full booking lifecycle:
 *   POST /api/v1/users/bookings        — create booking
 *   GET  /api/v1/users/bookings/active — get active booking
 *   POST /api/v1/users/bookings/:id/check-in  — check in
 *   POST /api/v1/users/bookings/:id/check-out — check out
 *
 * Also covers:
 *   - Unauthenticated access (should return 401)
 *   - Double-booking prevention (same table)
 */

const test   = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `login(${username}) failed: ${JSON.stringify(body)}`);
  return body.data.token;
}

async function getAvailableTable(adminToken) {
  const res  = await fetch(`${BASE_URL}/api/v1/tables`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const body = await res.json();
  assert.equal(res.status, 200, 'GET /tables should succeed');
  const available = (body.data || []).find((t) => t.status === 'available');
  return available || null;
}

async function resetTableToAvailable(adminToken, tableId) {
  // Reset table back to 'available' so other tests can use it
  await fetch(`${BASE_URL}/api/v1/tables/${tableId}/status`, {
    method:  'PATCH',
    headers: {
      Authorization:  `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'available' }),
  });
}

async function clearActiveBooking(token) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/bookings/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (body.data && body.data.booking_id) {
      if (body.data.status === 'pending') {
        await fetch(`${BASE_URL}/api/v1/users/bookings/${body.data.booking_id}/check-in`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ latitude: 13.736717, longitude: 100.523186 }),
        });
      }
      await fetch(`${BASE_URL}/api/v1/users/bookings/${body.data.booking_id}/check-out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test('Booking: unauthenticated request returns 401', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/users/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_id: 1 }),
  });
  const body = await res.json();
  assert.equal(res.status, 401, 'unauthenticated POST /bookings should return 401');
  assert.equal(body.success, false);
});

test('Booking: GET /active with no booking returns null or empty data', async () => {
  const token = await login('student1', 'password123');
  await clearActiveBooking(token);
  const res   = await fetch(`${BASE_URL}/api/v1/users/bookings/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.ok(
    res.status === 200 || res.status === 404,
    `GET /active with no booking should be 200 or 404, got ${res.status}`
  );
  assert.equal(body.success, true, 'success should always be true for standard response');
});

test('Booking: Full lifecycle — create, check-in, check-out', async () => {
  const adminToken   = await login('admin', 'password123');
  const studentToken = await login('student1', 'password123');

  await clearActiveBooking(studentToken);

  // 1. Find an available table
  const table = await getAvailableTable(adminToken);
  assert.ok(table, 'there must be at least one available table to run this test');

  // 2. Create a booking
  const createRes  = await fetch(`${BASE_URL}/api/v1/users/bookings`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ table_id: table.id }),
  });
  const createBody = await createRes.json();
  assert.equal(createRes.status, 201, `POST /bookings should return 201. got: ${JSON.stringify(createBody)}`);
  assert.equal(createBody.success, true);
  assert.ok(createBody.data.booking_id, 'booking_id should be present');
  assert.equal(createBody.data.table_id, table.id, 'booking should be for the requested table');

  const bookingId = createBody.data.booking_id;

  // 3. Verify GET /active shows the booking
  const activeRes  = await fetch(`${BASE_URL}/api/v1/users/bookings/active`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const activeBody = await activeRes.json();
  assert.equal(activeRes.status, 200, 'GET /active should return 200 after booking');
  assert.ok(activeBody.data, 'active booking data should exist');

  // 4. Check in (passing valid canteen GPS coordinates)
  const checkInRes  = await fetch(`${BASE_URL}/api/v1/users/bookings/${bookingId}/check-in`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude:  13.736717,
      longitude: 100.523186,
    }),
  });
  const checkInBody = await checkInRes.json();
  assert.equal(checkInRes.status, 200, `POST /check-in should return 200. got: ${JSON.stringify(checkInBody)}`);
  assert.equal(checkInBody.success, true);
  assert.equal(checkInBody.data.status, 'active', 'booking status after check-in should be active');

  // 5. Check out
  const checkOutRes  = await fetch(`${BASE_URL}/api/v1/users/bookings/${bookingId}/check-out`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const checkOutBody = await checkOutRes.json();
  assert.equal(checkOutRes.status, 200, `POST /check-out should return 200. got: ${JSON.stringify(checkOutBody)}`);
  assert.equal(checkOutBody.success, true);
  assert.equal(checkOutBody.data.status, 'completed', 'booking status after check-out should be completed');

  // 6. Cleanup: reset table to available
  await resetTableToAvailable(adminToken, table.id);
});

test('Booking: Cannot book a table that is already occupied/pending', async () => {
  const adminToken    = await login('admin', 'password123');
  const studentToken1 = await login('student1', 'password123');
  const studentToken2 = await login('student2', 'password123');

  await clearActiveBooking(studentToken1);
  await clearActiveBooking(studentToken2);

  // Find an available table
  const table = await getAvailableTable(adminToken);
  assert.ok(table, 'there must be at least one available table');

  // student1 books it
  const firstBookRes = await fetch(`${BASE_URL}/api/v1/users/bookings`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ table_id: table.id }),
  });
  const firstBookBody = await firstBookRes.json();
  assert.equal(firstBookRes.status, 201, `First booking should succeed. got: ${JSON.stringify(firstBookBody)}`);

  const bookingId = firstBookBody.data.booking_id;

  // student2 tries to book the same table
  const secondBookRes  = await fetch(`${BASE_URL}/api/v1/users/bookings`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken2}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ table_id: table.id }),
  });
  const secondBookBody = await secondBookRes.json();
  assert.ok(
    secondBookRes.status === 409 || secondBookRes.status === 400,
    `Double-booking should return 409 or 400, got ${secondBookRes.status}: ${JSON.stringify(secondBookBody)}`
  );
  assert.equal(secondBookBody.success, false, 'Double-booking should return success: false');

  // Cleanup: check-in and check-out to release, then reset
  await fetch(`${BASE_URL}/api/v1/users/bookings/${bookingId}/check-in`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latitude: 13.736717, longitude: 100.523186 }),
  });
  await fetch(`${BASE_URL}/api/v1/users/bookings/${bookingId}/check-out`, {
    method: 'POST', headers: { Authorization: `Bearer ${studentToken1}` },
  });
  await resetTableToAvailable(adminToken, table.id);
});

test('Booking: POST /bookings with missing table_id returns 4xx', async () => {
  const token = await login('student1', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/users/bookings`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assert.ok(res.status >= 400, `missing table_id should return 4xx, got ${res.status}`);
  assert.equal(body.success, false);
});
