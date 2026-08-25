const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

async function login(username, password) {
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const payload = await response.json();
  assert.equal(response.status, 200, 'login should succeed');
  assert.equal(payload.success, true, 'login payload should indicate success');
  return payload.data.token;
}

test('table endpoints return live table data and allow status updates', async () => {
  const token = await login('admin', 'password123');

  const listResponse = await fetch(`${BASE_URL}/api/v1/tables`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const listPayload = await listResponse.json();
  assert.equal(listResponse.status, 200, 'GET /api/v1/tables should succeed');
  assert.equal(listPayload.success, true, 'GET /api/v1/tables should return success');
  assert.ok(Array.isArray(listPayload.data), 'GET /api/v1/tables should return an array');
  assert.ok(listPayload.data.length > 0, 'GET /api/v1/tables should return at least one table');

  const table = listPayload.data.find((item) => item.table_number === 'T-08');
  assert.ok(table, 'expected seeded table T-08 to be present');

  const updateResponse = await fetch(`${BASE_URL}/api/v1/tables/${table.id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cleaning' }),
  });

  const updatePayload = await updateResponse.json();
  assert.equal(updateResponse.status, 200, 'PATCH /api/v1/tables/:id/status should succeed');
  assert.equal(updatePayload.success, true, 'PATCH /api/v1/tables/:id/status should return success');
  assert.equal(updatePayload.data.status, 'cleaning', 'table status should be updated');
});
