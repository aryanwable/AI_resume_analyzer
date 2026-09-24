import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';
import { scoreResume } from '../src/services/resumeScorer.js';

let server;
let baseUrl;
let authToken;
const testUserId = '64b1f2e8c9d1a2b3c4d5e6f7';

// ---------------------------------------------------------------------------
// Sample fixtures
// ---------------------------------------------------------------------------
const SAMPLE_RESUME = `
Aryan Wable
Software Engineer | aryan@example.com | github.com/aryanwable | linkedin.com/in/aryanwable

Summary
Full Stack Software Engineer with 2+ years of experience building scalable web applications.
Proficient in React, Node.js, Express, MongoDB, and REST APIs.

Experience
Software Engineer — TechCorp (2023 – Present)
• Built RESTful APIs using Node.js and Express for a SaaS platform serving 10k+ users
• Implemented JWT authentication and role-based access control
• Optimized MongoDB database queries reducing average response time by 40%
• Developed React components with Tailwind CSS for a responsive dashboard

Education
B.Tech Computer Science — IIT Mumbai (2021)
GPA: 8.9/10

Skills
JavaScript, TypeScript, React, Node.js, Express, MongoDB, Mongoose, REST APIs,
JWT, Git, Docker, Tailwind CSS, Vite, PostgreSQL

Projects
AI Resume Analyzer — A full-stack app that scores resumes against job descriptions
using NLP techniques and LLM APIs.

Certifications
AWS Certified Developer Associate | MongoDB University M001
`;

const SAMPLE_JD = `
We are seeking a Full Stack Software Engineer proficient in React, Node.js, Express, and MongoDB.

Key Responsibilities:
- Build responsive web applications using React and Tailwind CSS
- Design scalable RESTful APIs with Node.js and Express
- Implement JWT authentication and role-based access control
- Optimize MongoDB database queries and schemas
- Write unit and integration tests for frontend and backend modules

Requirements:
- 2+ years of experience with JavaScript/TypeScript, React, Node.js
- Proficiency with Git, REST APIs, and modern CI/CD practices
- Experience with Docker and cloud platforms is a plus
`;

// ---------------------------------------------------------------------------
// Unit tests for resumeScorer service
// ---------------------------------------------------------------------------
describe('Resume Scoring Service — Unit Tests', () => {
  test('scoreResume returns totalScore between 0 and 100', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    assert.ok(result.totalScore >= 0, 'score should be >= 0');
    assert.ok(result.totalScore <= 100, 'score should be <= 100');
  });

  test('scoreResume returns a valid letter grade', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    assert.ok(['A', 'B', 'C', 'D', 'F'].includes(result.grade), `unexpected grade: ${result.grade}`);
  });

  test('scoreResume returns all four breakdown categories', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    assert.ok(result.breakdown.keywords, 'keywords breakdown missing');
    assert.ok(result.breakdown.sections, 'sections breakdown missing');
    assert.ok(result.breakdown.contentDepth, 'contentDepth breakdown missing');
    assert.ok(result.breakdown.readability, 'readability breakdown missing');
  });

  test('well-matched resume scores >= 60 against matching JD', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    assert.ok(result.totalScore >= 60, `expected >= 60, got ${result.totalScore}`);
  });

  test('keyword breakdown contains matched and missing arrays', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    assert.ok(Array.isArray(result.breakdown.keywords.matched), 'matched should be array');
    assert.ok(Array.isArray(result.breakdown.keywords.missing), 'missing should be array');
  });

  test('section breakdown detects experience, skills, education', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    const found = result.breakdown.sections.found;
    assert.ok(found.includes('experience'), 'experience section not detected');
    assert.ok(found.includes('skills'), 'skills section not detected');
    assert.ok(found.includes('education'), 'education section not detected');
  });

  test('mismatched resume scores lower than matched resume', () => {
    const unrelatedResume = `
      Chef with 10 years of experience in gourmet cooking and pastry arts.
      Specialises in French cuisine, soufflés, and caramelised desserts.
      Education: Culinary Institute of America.
    `;
    const matched = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    const unmatched = scoreResume(unrelatedResume, SAMPLE_JD);
    assert.ok(
      matched.totalScore > unmatched.totalScore,
      `matched (${matched.totalScore}) should beat unmatched (${unmatched.totalScore})`,
    );
  });

  test('scoreResume throws when resumeText is empty', () => {
    assert.throws(() => scoreResume('', SAMPLE_JD), /resumeText/i);
  });

  test('scoreResume throws when jobDescription is empty', () => {
    assert.throws(() => scoreResume(SAMPLE_RESUME, ''), /jobDescription/i);
  });

  test('contentDepth wordCount matches approximate token count', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    assert.ok(result.breakdown.contentDepth.wordCount > 50, 'wordCount too low');
  });

  test('maxScore values are correct for all categories', () => {
    const result = scoreResume(SAMPLE_RESUME, SAMPLE_JD);
    assert.equal(result.breakdown.skills.maxScore, 25);
    assert.equal(result.breakdown.keywords.maxScore, 20);
    assert.equal(result.breakdown.experience.maxScore, 20);
    assert.equal(result.breakdown.projects.maxScore, 15);
    assert.equal(result.breakdown.ats.maxScore, 10);
    assert.equal(result.breakdown.education.maxScore, 10);
    assert.equal(result.breakdown.sections.maxScore, 20);
    assert.equal(result.breakdown.contentDepth.maxScore, 20);
  });
});

// ---------------------------------------------------------------------------
// Integration tests for POST /api/resumes/score
// ---------------------------------------------------------------------------
describe('Resume Score API — Integration Tests', () => {
  before((_, done) => {
    authToken = generateToken({
      id: testUserId,
      email: 'scorer.tester@example.com',
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

  test('POST /api/resumes/score returns 200 with score data for valid input', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ resumeText: SAMPLE_RESUME, jobDescription: SAMPLE_JD }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.data.score);
    assert.ok(typeof body.data.score.totalScore === 'number');
    assert.ok(typeof body.data.score.grade === 'string');
    assert.ok(body.data.score.breakdown);
    assert.ok(typeof body.data.score.summary === 'string');
  });

  test('POST /api/resumes/score returns 401 without auth token', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: SAMPLE_RESUME, jobDescription: SAMPLE_JD }),
    });
    assert.equal(response.status, 401);
  });

  test('POST /api/resumes/score returns 400 when resumeText is missing', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ jobDescription: SAMPLE_JD }),
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, 'RESUME_TEXT_MISSING');
  });

  test('POST /api/resumes/score returns 400 when jobDescription is missing', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ resumeText: SAMPLE_RESUME }),
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, 'JOB_DESCRIPTION_MISSING');
  });
});
