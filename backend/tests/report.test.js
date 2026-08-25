'use strict';

/**
 * Integration Tests: Report & Dashboard Endpoints
 * Phase 14 — Testing and Bug Fix
 *
 * Covers:
 *   GET /api/v1/dashboard/canteen-status  — accessible to all authenticated roles
 *   GET /api/v1/reports/violations        — restricted to admin/executive only
 *
 * Also covers:
 *   - Unauthenticated access (should return 401)
 *   - Role-based access control (student/cleaner cannot access violations report)
 *   - Response structure validation
 */

const test   = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function login(username, password) {
  const res  = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `login(${username}) failed: ${JSON.stringify(body)}`);
  return body.data.token;
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test('Report: GET /dashboard/canteen-status is accessible to all authenticated roles', async () => {
  const roles = [
    { username: 'admin',      password: 'password123', role: 'admin' },
    { username: 'inspector1', password: 'password123', role: 'inspector' },
    { username: 'student1',   password: 'password123', role: 'student' },
  ];

  for (const { username, role } of roles) {
    const token = await login(username, 'password123');
    const res   = await fetch(`${BASE_URL}/api/v1/dashboard/canteen-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200, `GET /dashboard/canteen-status should be 200 for ${role}. got: ${JSON.stringify(body)}`);
    assert.equal(body.success, true, `success should be true for ${role}`);
    assert.ok(body.data, `data should be present for ${role}`);
  }
});

test('Report: GET /dashboard/canteen-status without auth returns 401', async () => {
  const res  = await fetch(`${BASE_URL}/api/v1/dashboard/canteen-status`);
  const body = await res.json();
  assert.equal(res.status, 401, 'unauthenticated request should return 401');
  assert.equal(body.success, false);
});

test('Report: GET /dashboard/canteen-status returns valid structure', async () => {
  const token = await login('admin', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/dashboard/canteen-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  // Canteen status should have summary counts
  const data = body.data;
  assert.ok(data !== null && typeof data === 'object', 'data should be an object');
});

test('Report: GET /reports/violations accessible to admin', async () => {
  const token = await login('admin', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/reports/violations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 200, `admin should access violations report. got: ${JSON.stringify(body)}`);
  assert.equal(body.success, true);
  // violations report returns an object with stats (not an array)
  assert.ok(body.data !== null && typeof body.data === 'object', 'violations data should be an object');
  assert.ok('total_violations' in body.data, 'data should have total_violations field');
  assert.ok('zone_popularity' in body.data, 'data should have zone_popularity field');
  assert.ok('sla_health' in body.data, 'data should have sla_health field');
});

test('Report: GET /reports/violations blocked for student role (403)', async () => {
  const token = await login('student1', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/reports/violations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 403, `student should not access violations report, got ${res.status}`);
  assert.equal(body.success, false);
});

test('Report: GET /reports/violations blocked for cleaner role (403)', async () => {
  const token = await login('cleaner1', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/reports/violations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 403, `cleaner should not access violations report, got ${res.status}`);
  assert.equal(body.success, false);
});

test('Report: GET /reports/violations blocked for inspector role (403)', async () => {
  const token = await login('inspector1', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/reports/violations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 403, `inspector should not access violations report, got ${res.status}`);
  assert.equal(body.success, false);
});

test('Report: GET /reports/violations without auth returns 401', async () => {
  const res  = await fetch(`${BASE_URL}/api/v1/reports/violations`);
  const body = await res.json();
  assert.equal(res.status, 401, 'unauthenticated request should return 401');
  assert.equal(body.success, false);
});

test('Security: No sensitive secrets in /api/status health check response', async () => {
  const res  = await fetch(`${BASE_URL}/api/status`);
  const body = await res.json();
  const raw  = JSON.stringify(body);
  assert.equal(res.status, 200);
  // Ensure JWT_SECRET and DB passwords are not leaked in health response
  assert.ok(!raw.includes('JWT_SECRET'), 'JWT_SECRET must not appear in health check');
  assert.ok(!raw.includes('password'), 'database password must not appear in health check');
});

test('Security: 404 on unknown authenticated route returns proper error format', async () => {
  // Routes that match /api/v1/* but don't exist still check auth first in Express
  // Send an authenticated request to validate the 404 response format on the API namespace
  const token = await login('admin', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/does-not-exist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 404, `unknown route should return 404, got ${res.status}`);
  assert.equal(body.success, false, 'success should be false on 404');
  assert.ok(body.error, 'error object should be present on 404');
  assert.ok(body.error.code, 'error.code should be present');
});
