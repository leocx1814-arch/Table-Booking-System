'use strict';

/**
 * Integration Tests: Auth Endpoints
 * Phase 14 — Testing and Bug Fix
 *
 * Covers:
 *   POST /api/v1/auth/login  — valid credentials, invalid credentials, missing fields
 *   GET  /api/v1/auth/me     — authenticated, unauthenticated, expired/invalid token
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
  return { res, body: await res.json() };
}

async function getMe(token) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { res, body: await res.json() };
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test('POST /api/v1/auth/login — valid admin credentials', async () => {
  const { res, body } = await login('admin', 'password123');
  assert.equal(res.status, 200, 'status should be 200');
  assert.equal(body.success, true, 'success should be true');
  assert.ok(body.data.token, 'response should contain a token');
  assert.ok(body.data.user, 'response should contain a user object');
  assert.equal(body.data.user.username, 'admin', 'user.username should be admin');
  assert.equal(body.data.user.role, 'admin', 'user.role should be admin');
});

test('POST /api/v1/auth/login — valid student credentials', async () => {
  const { res, body } = await login('student1', 'password123');
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.token);
  assert.equal(body.data.user.role, 'student');
});

test('POST /api/v1/auth/login — valid inspector credentials', async () => {
  const { res, body } = await login('inspector1', 'password123');
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.user.role, 'inspector');
});

test('POST /api/v1/auth/login — valid cleaner credentials', async () => {
  const { res, body } = await login('cleaner1', 'password123');
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.user.role, 'cleaner');
});

test('POST /api/v1/auth/login — wrong password returns 401', async () => {
  const { res, body } = await login('admin', 'wrong_password');
  assert.equal(res.status, 401, 'wrong password should return 401');
  assert.equal(body.success, false, 'success should be false');
  assert.ok(body.error, 'error object should be present');
});

test('POST /api/v1/auth/login — unknown username returns 401', async () => {
  const { res, body } = await login('nonexistent_user_xyz', 'password123');
  assert.equal(res.status, 401, 'unknown user should return 401');
  assert.equal(body.success, false);
});

test('POST /api/v1/auth/login — missing body fields returns 4xx', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({}),
  });
  const body = await res.json();
  assert.ok(res.status >= 400, `missing fields should return 4xx, got ${res.status}`);
  assert.equal(body.success, false);
});

test('GET /api/v1/auth/me — valid token returns user profile', async () => {
  const { body: loginBody } = await login('admin', 'password123');
  const token = loginBody.data.token;

  const { res, body } = await getMe(token);
  // /auth/me wraps user in { data: { user: {...} } }
  assert.equal(res.status, 200, 'GET /me should succeed with valid token');
  assert.equal(body.success, true);
  assert.ok(body.data, 'data object should be present');
  assert.ok(body.data.user, 'data.user should be present');
  assert.equal(body.data.user.username, 'admin');
  assert.equal(body.data.user.role, 'admin');
});

test('GET /api/v1/auth/me — no token returns 401', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`);
  const body = await res.json();
  assert.equal(res.status, 401, 'no token should return 401');
  assert.equal(body.success, false);
});

test('GET /api/v1/auth/me — invalid/tampered token returns 401', async () => {
  const { res, body } = await getMe('this.is.an.invalid.jwt.token');
  assert.equal(res.status, 401, 'invalid token should return 401');
  assert.equal(body.success, false);
});

test('GET /api/status — health check endpoint', async () => {
  const res  = await fetch(`${BASE_URL}/api/status`);
  const body = await res.json();
  assert.equal(res.status, 200, 'health check should return 200');
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'healthy');
  assert.equal(body.data.database, 'connected');
});
