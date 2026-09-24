import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  tokenizeSentences,
  tokenizeWords,
  segmentSections,
  extractContactInfo,
  extractDocumentMetrics,
} from '../src/services/textPreprocessor.js';

test('Text Preprocessor — normalizeText', async (t) => {
  await t.test('cleans unicode whitespace, smart quotes and dashes', () => {
    const dirty = '“John\u00A0Doe” — Senior\u200B Engineer ‘Portfolio’';
    const cleaned = normalizeText(dirty);
    assert.strictEqual(cleaned, '"John Doe" - Senior Engineer \'Portfolio\'');
  });

  await t.test('standardizes diverse bullet points to dashed lists', () => {
    const raw = 'Skills:\n• JavaScript\n▪ Python\n► React\n✔ Node.js';
    const cleaned = normalizeText(raw);
    assert.ok(cleaned.includes('- JavaScript'));
    assert.ok(cleaned.includes('- Python'));
    assert.ok(cleaned.includes('- React'));
    assert.ok(cleaned.includes('- Node.js'));
  });

  await t.test('handles empty or non-string input safely', () => {
    assert.strictEqual(normalizeText(null), '');
    assert.strictEqual(normalizeText(undefined), '');
    assert.strictEqual(normalizeText(''), '');
  });
});

test('Text Preprocessor — tokenizeSentences', async (t) => {
  await t.test('protects common abbreviations and decimal numbers from splitting', () => {
    const text = 'I have 5.5 years of experience in e.g. React vs. Vue. Worked at Google Inc. from 2020 to 2024.';
    const sentences = tokenizeSentences(text);
    assert.ok(sentences.length >= 2);
    assert.ok(sentences[0].includes('5.5 years of experience in e.g. React vs. Vue'));
  });

  await t.test('splits bullet points and paragraph breaks into sentences', () => {
    const text = 'Led backend engineering.\n• Built high-scale microservices.\n• Reduced latency by 40%.';
    const sentences = tokenizeSentences(text);
    assert.strictEqual(sentences.length, 3);
  });
});

test('Text Preprocessor — tokenizeWords', async (t) => {
  await t.test('preserves crucial tech keywords with punctuation', () => {
    const text = 'Proficient in C++, C#, .NET, Node.js, and CI/CD pipelines.';
    const tokens = tokenizeWords(text, { removeStopwords: false });
    assert.ok(tokens.includes('c++'));
    assert.ok(tokens.includes('c#'));
    assert.ok(tokens.includes('.net'));
    assert.ok(tokens.includes('node.js'));
    assert.ok(tokens.includes('ci/cd'));
  });

  await t.test('filters stopwords when removeStopwords is true', () => {
    const text = 'This is an awesome full-stack engineer with strong skills in React';
    const tokens = tokenizeWords(text, { removeStopwords: true });
    assert.ok(!tokens.includes('this'));
    assert.ok(!tokens.includes('is'));
    assert.ok(!tokens.includes('an'));
    assert.ok(!tokens.includes('with'));
    assert.ok(tokens.includes('react'));
  });
});

test('Text Preprocessor — segmentSections', async (t) => {
  await t.test('correctly identifies and segments standard resume sections', () => {
    const sampleResume = `
Alex Morgan
alex.morgan@example.com | (555) 123-4567 | github.com/alexmorgan

PROFESSIONAL SUMMARY
Senior Software Engineer with 6+ years building distributed cloud platforms.

TECHNICAL SKILLS
JavaScript, TypeScript, React, Node.js, Docker, Kubernetes, AWS, PostgreSQL

WORK EXPERIENCE
Senior Full Stack Engineer at TechCorp (2021 - Present)
- Designed and maintained microservices architecture handling 10M requests/day.
- Mentored 4 junior developers and established CI/CD best practices.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2015 - 2019)

PROJECTS
OpenSource Resume Analyzer (github.com/alexmorgan/resume-analyzer)
- Built an ATS resume optimization engine with React and Express.
    `.trim();

    const { sections, detectedSections, sectionCount } = segmentSections(sampleResume);

    assert.ok(detectedSections.includes('summary'), 'Should detect summary section');
    assert.ok(detectedSections.includes('skills'), 'Should detect skills section');
    assert.ok(detectedSections.includes('experience'), 'Should detect experience section');
    assert.ok(detectedSections.includes('education'), 'Should detect education section');
    assert.ok(detectedSections.includes('projects'), 'Should detect projects section');
    assert.ok(sectionCount >= 5);

    assert.ok(sections.summary.includes('Senior Software Engineer'));
    assert.ok(sections.skills.includes('TypeScript'));
    assert.ok(sections.experience.includes('TechCorp'));
    assert.ok(sections.education.includes('Berkeley'));
    assert.ok(sections.projects.includes('OpenSource Resume Analyzer'));
  });
});

test('Text Preprocessor — extractContactInfo', async (t) => {
  await t.test('extracts email, phone, links, and candidate name', () => {
    const header = `
Aryan Wable
aryan.wable@example.com
+1 (555) 987-6543
https://linkedin.com/in/aryan-wable
https://github.com/aryanwable
https://aryanwable.dev
    `.trim();

    const contact = extractContactInfo(header);
    assert.strictEqual(contact.email, 'aryan.wable@example.com');
    assert.ok(contact.phone.includes('555'));
    assert.ok(contact.linkedin.includes('linkedin.com/in/aryan-wable'));
    assert.ok(contact.github.includes('github.com/aryanwable'));
    assert.ok(contact.portfolio.includes('aryanwable.dev'));
    assert.strictEqual(contact.candidateName, 'Aryan Wable');
  });
});

test('Text Preprocessor — extractDocumentMetrics', async (t) => {
  await t.test('computes word count, sentences, and estimated reading time', () => {
    const text = 'First sentence with some words. Second sentence with more detailed explanations. Third sentence concluding the resume section.';
    const metrics = extractDocumentMetrics(text);

    assert.strictEqual(metrics.sentenceCount, 3);
    assert.ok(metrics.wordCount >= 15);
    assert.ok(metrics.avgSentenceLengthWords > 0);
    assert.ok(metrics.estimatedReadingTimeMinutes >= 0.1);
  });
});
