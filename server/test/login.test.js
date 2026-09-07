import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { verifyToken } from '../src/utils/token.js';

let server;
let baseUrl;

describe('Authentication API — User Login & JWT Tests', () => {
  const testUser = {
    name: 'JWT Test User',
    email: 'jwt.user@example.com',
    password: 'ValidPassword2026!',
  };

  before((_, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  test('Prerequisite: Register a user for login testing', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
  });

  test('POST /api/auth/login successfully authenticates valid credentials (200)', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();

    assert.equal(body.success, true);
    assert.equal(body.message, 'Login successful');
    assert.ok(body.data.token);
    assert.equal(typeof body.data.token, 'string');
    assert.equal(body.data.user.email, testUser.email);
    assert.equal(body.data.user.name, testUser.name);
    assert.equal(body.data.user.password, undefined); // Security: No password in response

    // Verify JWT claims
    const decoded = verifyToken(body.data.token);
    assert.equal(decoded.email, testUser.email);
    assert.equal(decoded.role, 'user');
    assert.ok(decoded.id);
  });

  test('POST /api/auth/login rejects incorrect password with 401', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'IncorrectPassword999!',
      }),
    });

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(body.error.message, 'Invalid email or password');
  });

  test('POST /api/auth/login rejects non-existent email with 401 (enumeration defense)', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'does.not.exist@example.com',
        password: 'AnyPassword123!',
      }),
    });

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(body.error.message, 'Invalid email or password');
  });

  test('POST /api/auth/login rejects missing email (400)', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'ValidPassword2026!',
      }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.equal(body.error.field, 'email');
  });

  test('POST /api/auth/login rejects missing password (400)', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
      }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.equal(body.error.field, 'password');
  });
});
