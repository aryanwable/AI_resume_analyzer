import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

describe('Backend Foundation & Health Check Tests', () => {
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

  test('GET / returns 200 and API discovery information', async () => {
    const response = await fetch(`${baseUrl}/`);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.message, 'AI Resume Analyzer API Server');
    assert.equal(body.version, '0.1.0');
    assert.equal(body.docs, '/api/health');
  });

  test('GET /api/health returns 200 with service health metrics', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'healthy');
    assert.equal(body.data.service, 'ai-resume-analyzer-api');
    assert.equal(body.data.version, '0.1.0');
    assert.ok(typeof body.data.uptimeSeconds === 'number');
    assert.ok(typeof body.data.memory.rssMb === 'number');
    assert.ok(typeof body.data.memory.heapUsedMb === 'number');
  });

  test('GET /api/non-existent-route returns 404 with structured error JSON', async () => {
    const response = await fetch(`${baseUrl}/api/non-existent-route`);
    assert.equal(response.status, 404);

    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
    assert.match(body.error.message, /Route not found: GET \/api\/non-existent-route/);
  });
});
