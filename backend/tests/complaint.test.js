'use strict';

/**
 * Integration Tests: Complaint & Inspector Endpoints
 * Phase 14 — Testing and Bug Fix
 *
 * Covers:
 *   GET  /api/v1/complaint-categories        — list categories
 *   POST /api/v1/complaints                  — create complaint (student)
 *   GET  /api/v1/complaints                  — list complaints
 *   POST /api/v1/complaints/:id/assign       — inspector assigns complaint
 *   PATCH /api/v1/complaints/:id/status      — inspector resolves/rejects complaint
 *
 * Also covers:
 *   - Role-based access control (student cannot assign, inspector can)
 *   - Unauthenticated access (should return 401)
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

async function getFirstCategoryId(token) {
  const res  = await fetch(`${BASE_URL}/api/v1/complaint-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.data) && body.data.length > 0, 'complaint categories must exist');
  return body.data[0].id;
}

async function getFirstTableId(adminToken) {
  const res  = await fetch(`${BASE_URL}/api/v1/tables`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const body = await res.json();
  assert.equal(res.status, 200, `GET /tables failed: ${JSON.stringify(body)}`);
  return body.data[0].id;
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test('Complaint: GET /complaint-categories returns list', async () => {
  const token = await login('student1', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/complaint-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.equal(res.status, 200, 'GET /complaint-categories should return 200');
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data), 'data should be an array');
  assert.ok(body.data.length > 0, 'should have at least one category seeded');
});

test('Complaint: GET /complaint-categories without auth returns 401', async () => {
  const res  = await fetch(`${BASE_URL}/api/v1/complaint-categories`);
  const body = await res.json();
  assert.equal(res.status, 401, 'unauthenticated request should return 401');
  assert.equal(body.success, false);
});

test('Complaint: POST /complaints — student creates complaint successfully', async () => {
  const adminToken   = await login('admin', 'password123');
  const studentToken = await login('student1', 'password123');
  const categoryId   = await getFirstCategoryId(studentToken);
  const tableId      = await getFirstTableId(adminToken);

  const res  = await fetch(`${BASE_URL}/api/v1/complaints`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table_id:           tableId,
      complaint_type_id:  categoryId,
      description: 'โต๊ะสกปรก — Integration Test',
    }),
  });
  const body = await res.json();
  assert.equal(res.status, 201, `POST /complaints should return 201. got: ${JSON.stringify(body)}`);
  assert.equal(body.success, true);
  assert.ok(body.data.complaint_id, 'complaint_id should be present');
  assert.equal(body.data.status, 'pending_review', 'new complaint should be pending_review');
});

test('Complaint: POST /complaints without auth returns 401', async () => {
  const res  = await fetch(`${BASE_URL}/api/v1/complaints`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ table_id: 1, category_id: 1, description: 'test' }),
  });
  const body = await res.json();
  assert.equal(res.status, 401);
  assert.equal(body.success, false);
});

test('Complaint: POST /complaints with missing fields returns 4xx', async () => {
  const token = await login('student1', 'password123');
  const res   = await fetch(`${BASE_URL}/api/v1/complaints`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assert.ok(res.status >= 400, `missing fields should return 4xx, got ${res.status}`);
  assert.equal(body.success, false);
});

test('Complaint: GET /complaints — returns list (accessible by all roles)', async () => {
  const studentToken   = await login('student1', 'password123');
  const inspectorToken = await login('inspector1', 'password123');

  // Both student and inspector can list complaints
  for (const [role, token] of [['student', studentToken], ['inspector', inspectorToken]]) {
    const res  = await fetch(`${BASE_URL}/api/v1/complaints`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200, `GET /complaints should be accessible by ${role}`);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data), 'data should be an array');
  }
});

test('Complaint: Inspector can assign a pending_review complaint', async () => {
  // Create a complaint first
  const adminToken     = await login('admin', 'password123');
  const studentToken   = await login('student1', 'password123');
  const inspectorToken = await login('inspector1', 'password123');
  const categoryId     = await getFirstCategoryId(studentToken);
  const tableId        = await getFirstTableId(adminToken);

  const createRes  = await fetch(`${BASE_URL}/api/v1/complaints`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table_id:          tableId,
      complaint_type_id: categoryId,
      description: 'ทดสอบการรับเรื่องจาก Inspector — Integration Test',
    }),
  });
  const createBody = await createRes.json();
  assert.equal(createRes.status, 201, `failed to create complaint: ${JSON.stringify(createBody)}`);
  const complaintId = createBody.data.complaint_id;

  // Inspector assigns it
  const assignRes  = await fetch(`${BASE_URL}/api/v1/complaints/${complaintId}/assign`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${inspectorToken}` },
  });
  const assignBody = await assignRes.json();
  assert.equal(assignRes.status, 200, `POST /complaints/:id/assign should return 200. got: ${JSON.stringify(assignBody)}`);
  assert.equal(assignBody.success, true);
  assert.equal(assignBody.data.status, 'investigating', 'status should change to investigating after assign');
});

test('Complaint: Student cannot assign complaints (role guard 403)', async () => {
  const studentToken = await login('student1', 'password123');

  const assignRes  = await fetch(`${BASE_URL}/api/v1/complaints/999/assign`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const assignBody = await assignRes.json();
  assert.equal(assignRes.status, 403, `student assigning complaint should return 403, got ${assignRes.status}`);
  assert.equal(assignBody.success, false);
});

test('Complaint: Inspector can resolve a complaint', async () => {
  // Create a complaint then resolve it directly (PATCH /status allows direct resolved)
  const adminToken     = await login('admin', 'password123');
  const studentToken   = await login('student1', 'password123');
  const inspectorToken = await login('inspector1', 'password123');
  const categoryId     = await getFirstCategoryId(studentToken);
  const tableId        = await getFirstTableId(adminToken);

  const createRes = await fetch(`${BASE_URL}/api/v1/complaints`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table_id:          tableId,
      complaint_type_id: categoryId,
      description: 'ทดสอบการแก้ไขเรื่องร้องเรียน — Integration Test',
    }),
  });
  const createBody = await createRes.json();
  assert.equal(createRes.status, 201);
  const complaintId = createBody.data.complaint_id;

  // Resolve it
  const resolveRes  = await fetch(`${BASE_URL}/api/v1/complaints/${complaintId}/status`, {
    method:  'PATCH',
    headers: {
      Authorization:  `Bearer ${inspectorToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'resolved' }),
  });
  const resolveBody = await resolveRes.json();
  assert.equal(resolveRes.status, 200, `PATCH /complaints/:id/status should return 200. got: ${JSON.stringify(resolveBody)}`);
  assert.equal(resolveBody.success, true);
  assert.equal(resolveBody.data.status, 'resolved', 'complaint status should be resolved');
});

test('Complaint: Inspector can reject a complaint', async () => {
  const adminToken     = await login('admin', 'password123');
  const studentToken   = await login('student1', 'password123');
  const inspectorToken = await login('inspector1', 'password123');
  const categoryId     = await getFirstCategoryId(studentToken);
  const tableId        = await getFirstTableId(adminToken);

  const createRes = await fetch(`${BASE_URL}/api/v1/complaints`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table_id:          tableId,
      complaint_type_id: categoryId,
      description: 'ทดสอบการปฏิเสธเรื่องร้องเรียน — Integration Test',
    }),
  });
  const createBody = await createRes.json();
  assert.equal(createRes.status, 201);
  const complaintId = createBody.data.complaint_id;

  const rejectRes  = await fetch(`${BASE_URL}/api/v1/complaints/${complaintId}/status`, {
    method:  'PATCH',
    headers: {
      Authorization:  `Bearer ${inspectorToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'rejected' }),
  });
  const rejectBody = await rejectRes.json();
  assert.equal(rejectRes.status, 200, `reject should return 200. got: ${JSON.stringify(rejectBody)}`);
  assert.equal(rejectBody.success, true);
  assert.equal(rejectBody.data.status, 'rejected');
});

test('Complaint: Student cannot PATCH /complaints/:id/status (role guard 403)', async () => {
  const studentToken = await login('student1', 'password123');
  const res = await fetch(`${BASE_URL}/api/v1/complaints/999/status`, {
    method:  'PATCH',
    headers: {
      Authorization:  `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'resolved' }),
  });
  const body = await res.json();
  assert.equal(res.status, 403, `student patching complaint status should return 403, got ${res.status}`);
  assert.equal(body.success, false);
});
