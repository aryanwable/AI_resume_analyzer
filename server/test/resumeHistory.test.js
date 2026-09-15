import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';

let server;
let baseUrl;
let authToken;
const testUserId = '64b1f2e8c9d1a2b3c4d5e6f7';

describe('Resume History API — Integration Tests (Day 16)', () => {
  before((_, done) => {
    authToken = generateToken({
      id: testUserId,
      email: 'history.tester@example.com',
      role: 'user',
    });
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  test('GET /api/resumes/history requires authentication (401)', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/history`);
    assert.equal(response.status, 401);
  });

  test('GET /api/resumes/history returns 200 with list envelope', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/history`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.analyses));
    assert.equal(typeof body.data.total, 'number');
  });

  test('GET /api/resumes/history/:id validates ObjectId format (400 INVALID_ID)', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/history/invalid-id-string`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_ID');
  });

  test('DELETE /api/resumes/history/:id rejects invalid ObjectId format (400)', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/history/12345nonhex`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, 'INVALID_ID');
  });

  test('POST /api/resumes/score accepts metadata and saveToHistory flag', async () => {
    const payload = {
      resumeText: 'John Doe Software Engineer JavaScript Node.js React Experience Education',
      jobDescription: 'Seeking Software Engineer with Node.js and React experience',
      fileName: 'test_resume.pdf',
      fileSizeBytes: 1024,
      fileSizeFormatted: '1.0 KB',
      jobRole: 'Full Stack Engineer',
      saveToHistory: true,
    };

    const response = await fetch(`${baseUrl}/api/resumes/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.data.score);
    assert.ok('analysisId' in body.data);
  });
});
