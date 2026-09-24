import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';

const testUserId = '64e8a1b2c3d4e5f6a7b8c9e0';
let server;
let baseUrl;
let authToken;

const SAMPLE_RESUME = `
Jane Doe
jane.doe@example.com | (555) 019-2834 | github.com/janedoe

SUMMARY
Experienced Software Engineer specializing in React, Node.js, and cloud systems.

EXPERIENCE
Software Engineer at CloudTech (2021 - Present)
- Developed responsive web interfaces using React, Redux, and Tailwind CSS.
- Built scalable REST APIs in Node.js and Express connected to MongoDB.
- Implemented CI/CD pipelines with GitHub Actions.

EDUCATION
B.S. in Computer Science, Stanford University (2020)
`;

test('AI Tools Endpoints — Integration Tests', async (t) => {
  t.before((_, done) => {
    authToken = generateToken({
      id: testUserId,
      email: 'ai.tools@example.com',
      role: 'user',
    });
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      done();
    });
  });

  t.after((_, done) => {
    server.close(done);
  });

  await t.test('POST /api/ai/rewrite-bullet rewrites bullet with action verb', async () => {
    const response = await fetch(`${baseUrl}/api/ai/rewrite-bullet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        bulletText: 'worked on the react user interface and made it faster',
        targetRole: 'Senior Frontend Developer',
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.data.improved);
    assert.ok(body.data.actionVerbUsed);
  });

  await t.test('POST /api/ai/rewrite-bullet requires bulletText', async () => {
    const response = await fetch(`${baseUrl}/api/ai/rewrite-bullet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 400);
  });

  await t.test('POST /api/ai/generate-summary generates tailored summary', async () => {
    const response = await fetch(`${baseUrl}/api/ai/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        resumeText: SAMPLE_RESUME,
        targetRole: 'Full Stack Engineer',
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.data.summary.includes('Full Stack Engineer') || body.data.summary.length > 50);
    assert.ok(Array.isArray(body.data.keyHighlights));
  });

  await t.test('POST /api/ai/recommend-roles provides grounded career tracks', async () => {
    const response = await fetch(`${baseUrl}/api/ai/recommend-roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        resumeText: SAMPLE_RESUME,
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.recommendations));
    assert.ok(body.data.recommendations.length >= 1);
    assert.ok(body.data.recommendations[0].role);
    assert.ok(typeof body.data.recommendations[0].matchPercentage === 'number');
  });

  await t.test('rejects unauthenticated requests to AI endpoints with 401', async () => {
    const response = await fetch(`${baseUrl}/api/ai/rewrite-bullet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bulletText: 'built features' }),
    });
    assert.equal(response.status, 401);
  });
});
