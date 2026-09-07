import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

describe('Authentication API — User Registration Tests', () => {
  before((_, done) => {
    // Start test server on random available port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  test('POST /api/auth/register successfully creates a new user (201)', async () => {
    const payload = {
      name: 'Aryan Wable',
      email: 'aryan.dev@example.com',
      password: 'SecurePassword123!',
    };

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(response.status, 201);
    const body = await response.json();

    assert.equal(body.success, true);
    assert.equal(body.message, 'User registered successfully');
    assert.ok(body.data.user);
    assert.equal(body.data.user.name, 'Aryan Wable');
    assert.equal(body.data.user.email, 'aryan.dev@example.com');
    assert.equal(body.data.user.role, 'user');
    assert.ok(body.data.user.id);
    // Security check: password must NEVER be in response payload
    assert.equal(body.data.user.password, undefined);
  });

  test('POST /api/auth/register rejects duplicate email address (409)', async () => {
    const payload = {
      name: 'Aryan Duplicate',
      email: 'aryan.dev@example.com', // same email
      password: 'AnotherPassword456!',
    };

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(response.status, 409);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'EMAIL_ALREADY_EXISTS');
  });

  test('POST /api/auth/register rejects missing name (400)', async () => {
    const payload = {
      email: 'noname@example.com',
      password: 'ValidPassword123!',
    };

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.equal(body.error.field, 'name');
  });

  test('POST /api/auth/register rejects invalid email format (400)', async () => {
    const payload = {
      name: 'John Doe',
      email: 'not-an-email-address',
      password: 'ValidPassword123!',
    };

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_EMAIL_FORMAT');
    assert.equal(body.error.field, 'email');
  });

  test('POST /api/auth/register rejects short password < 6 chars (400)', async () => {
    const payload = {
      name: 'John Doe',
      email: 'shortpass@example.com',
      password: '123',
    };

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'PASSWORD_TOO_SHORT');
    assert.equal(body.error.field, 'password');
  });
});
