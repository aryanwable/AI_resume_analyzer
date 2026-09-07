import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import config from '../src/config/environment.js';
import { generateToken } from '../src/utils/token.js';

let server;
let baseUrl;
let validToken;
const testUser = {
  id: '64b1f2e8c9d1a2b3c4d5e6f7',
  email: 'protected.user@example.com',
  name: 'Protected Route User',
  role: 'user',
};

describe('Authentication Middleware & Protected Routes Tests', () => {
  before((_, done) => {
    validToken = generateToken({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  test('GET /api/auth/me allows access with valid Bearer token (200)', async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    assert.equal(response.status, 200);
    const body = await response.json();

    assert.equal(body.success, true);
    assert.ok(body.data.user);
    assert.equal(body.data.user.email, testUser.email);
    assert.equal(body.data.user.id, testUser.id);
  });

  test('GET /api/auth/me rejects request with missing Authorization header (401)', async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`);

    assert.equal(response.status, 401);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'TOKEN_MISSING');
  });

  test('GET /api/auth/me rejects malformed Authorization header without Bearer scheme (401)', async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Basic ${validToken}`,
      },
    });

    assert.equal(response.status, 401);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_TOKEN_FORMAT');
  });

  test('GET /api/auth/me rejects tampered or invalid JWT signature (401)', async () => {
    const tamperedToken = validToken.slice(0, -5) + 'abcde'; // Corrupt signature bytes

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${tamperedToken}`,
      },
    });

    assert.equal(response.status, 401);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_TOKEN');
  });

  test('GET /api/auth/me rejects expired JWT token (401 TOKEN_EXPIRED)', async () => {
    // Generate token with -10 seconds remaining (already expired)
    const expiredToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      config.jwtSecret,
      { expiresIn: '-10s' }
    );

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });

    assert.equal(response.status, 401);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'TOKEN_EXPIRED');
    assert.match(body.error.message, /session has expired/i);
  });
});
