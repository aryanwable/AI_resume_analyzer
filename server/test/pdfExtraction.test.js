import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';

let server;
let baseUrl;
let authToken;
const testUserId = '64b1f2e8c9d1a2b3c4d5e6f7';

// ---------------------------------------------------------------------------
// Minimal but valid multi-page PDF built by hand (no external tooling needed).
// Contains actual text in a content stream so pdf-parse can extract it.
// ---------------------------------------------------------------------------
const buildValidPdf = (text = 'Aryan Wable\nSoftware Engineer\nNode.js React MongoDB') => {
  const content = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const streamLen = Buffer.byteLength(content, 'latin1');

  const objects = [
    '%PDF-1.4',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${content}\nendstream\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
  ];

  // Build the body and record byte offsets for the xref table
  let body = objects.join('\n') + '\n';
  // Compute individual offsets
  const offsets = [];
  let pos = 0;
  objects.forEach((obj) => {
    offsets.push(pos);
    pos += Buffer.byteLength(obj + '\n', 'latin1');
  });

  const xrefOffset = Buffer.byteLength(body, 'latin1');
  const xref = [
    'xref',
    `0 ${objects.length}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n `),
    'trailer',
    `<< /Size ${objects.length} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n');

  return Buffer.from(body + xref, 'latin1');
};

describe('PDF Text Extraction — Integration Tests (Day 14)', () => {
  before((_, done) => {
    authToken = generateToken({
      id: testUserId,
      email: 'extractor.tester@example.com',
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

  // -------------------------------------------------------------------------
  test('POST /api/resumes/upload returns extracted text and word count (201)', async () => {
    const pdfBuffer = buildValidPdf('Aryan Wable Software Engineer Node.js React MongoDB');
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'aryan_wable_resume.pdf',
    );

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    assert.equal(response.status, 201);
    const body = await response.json();

    assert.equal(body.success, true);
    const resume = body.data.resume;

    // Metadata checks
    assert.equal(resume.fileName, 'aryan_wable_resume.pdf');
    assert.equal(resume.status, 'extracted');
    assert.ok(resume.uploadedBy);
    assert.ok(resume.uploadedAt);

    // Extraction checks
    assert.ok(resume.extraction, 'extraction object should be present');
    assert.equal(typeof resume.extraction.text, 'string', 'text should be a string');
    assert.ok(resume.extraction.text.length > 0, 'extracted text should not be empty');
    assert.ok(resume.extraction.wordCount > 0, 'wordCount should be > 0');
    assert.ok(resume.extraction.charCount > 0, 'charCount should be > 0');
    assert.ok(resume.extraction.pageCount >= 1, 'pageCount should be at least 1');
  });

  // -------------------------------------------------------------------------
  test('POST /api/resumes/upload extraction result contains expected resume text', async () => {
    const resumeText = 'John Doe Senior Developer JavaScript Python AWS';
    const pdfBuffer = buildValidPdf(resumeText);
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'john_doe_resume.pdf',
    );

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    assert.equal(response.status, 201);
    const body = await response.json();
    const { extraction } = body.data.resume;

    // The text should contain the words we embedded
    assert.ok(extraction.text.includes('John'), 'extracted text should contain "John"');
    assert.ok(extraction.text.includes('Developer'), 'extracted text should contain "Developer"');
    assert.ok(extraction.wordCount >= 6, 'should have at least 6 words');
  });

  // -------------------------------------------------------------------------
  test('POST /api/resumes/upload returns wordCount matching token count', async () => {
    // 10 distinct tokens → wordCount should be 10
    const tokens = ['Alice', 'Bob', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet'];
    const pdfBuffer = buildValidPdf(tokens.join(' '));
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'token_test.pdf',
    );

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    assert.equal(response.status, 201);
    const { extraction } = (await response.json()).data.resume;
    assert.ok(extraction.wordCount >= tokens.length, `expected >= ${tokens.length} words, got ${extraction.wordCount}`);
  });

  // -------------------------------------------------------------------------
  test('POST /api/resumes/upload response includes pdfVersion field', async () => {
    const pdfBuffer = buildValidPdf('Version test resume content');
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'version_test.pdf',
    );

    const response = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    assert.equal(response.status, 201);
    const { extraction } = (await response.json()).data.resume;
    assert.ok('pdfVersion' in extraction, 'pdfVersion field should be present');
  });
});
