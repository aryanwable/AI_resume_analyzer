import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';

let server;
let baseUrl;
let authToken;
const testUserId = '64b1f2e8c9d1a2b3c4d5e6f7';

describe('Resume Management API — Backend Upload Tests (Multer)', () => {
  before((_, done) => {
    authToken = generateToken({
      id: testUserId,
      email: 'resume.tester@example.com',
      role: 'user',
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

  test('POST /api/resumes/upload rejects unauthenticated requests with 401', async () => {
    const formData = new FormData();
    const mockPdf = new Blob(['%PDF-1.4 Mock PDF content for test'], { type: 'application/pdf' });
    formData.append('resume', mockPdf, 'resume_sample.pdf');

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'TOKEN_MISSING');
  });

  test('POST /api/resumes/upload successfully accepts valid PDF file buffer (201)', async () => {
    const formData = new FormData();
    const mockPdfContent =
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n' +
      '4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 100 700 Td (Aryan Wable Resume) Tj ET\nendstream\nendobj\n' +
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' +
      'xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000063 00000 n \n' +
      '0000000114 00000 n \n0000000191 00000 n \n0000000290 00000 n \n' +
      'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n369\n%%EOF' +
      '#'.repeat(600);
    const mockPdf = new Blob([mockPdfContent], { type: 'application/pdf' });
    formData.append('resume', mockPdf, 'aryan_wable_resume.pdf');

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    assert.equal(response.status, 201);
    const body = await response.json();

    assert.equal(body.success, true);
    assert.ok(body.data.resume);
    assert.equal(body.data.resume.fileName, 'aryan_wable_resume.pdf');
    assert.equal(body.data.resume.mimeType, 'application/pdf');
    assert.equal(body.data.resume.uploadedBy, testUserId);
    assert.ok(body.data.resume.fileSizeBytes > 0);
  });

  test('POST /api/resumes/upload rejects non-PDF file upload (400 INVALID_FILE_TYPE)', async () => {
    const formData = new FormData();
    const mockTxt = new Blob(['Plain text document pretending to be resume'], { type: 'text/plain' });
    formData.append('resume', mockTxt, 'unsupported_file.txt');

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    assert.equal(response.status, 400);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_FILE_TYPE');
  });

  test('POST /api/resumes/upload rejects request with missing file payload (400 FILE_MISSING)', async () => {
    const formData = new FormData();
    formData.append('other_field', 'some_text');

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    assert.equal(response.status, 400);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FILE_MISSING');
  });

  test('POST /api/resumes/upload rejects corrupted PDF with invalid magic bytes (400 INVALID_MAGIC_BYTES)', async () => {
    const formData = new FormData();
    // File has .pdf extension and application/pdf MIME, but content is NOT a real PDF
    const fakeContent = 'This is NOT a PDF file but pretends to be one. '.repeat(20);
    const fakePdf = new Blob([fakeContent], { type: 'application/pdf' });
    formData.append('resume', fakePdf, 'fake_resume.pdf');

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    assert.equal(response.status, 400);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_MAGIC_BYTES');
    assert.ok(body.error.message.includes('%PDF-'));
  });

  test('POST /api/resumes/upload rejects undersized PDF file (400 FILE_TOO_SMALL)', async () => {
    const formData = new FormData();
    // Starts with valid magic bytes but is way too small (< 500 bytes)
    const tinyContent = '%PDF-1.4 tiny';
    const tinyPdf = new Blob([tinyContent], { type: 'application/pdf' });
    formData.append('resume', tinyPdf, 'tiny_resume.pdf');

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    assert.equal(response.status, 400);
    const body = await response.json();

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FILE_TOO_SMALL');
    assert.ok(body.error.message.includes('500'));
  });
});
