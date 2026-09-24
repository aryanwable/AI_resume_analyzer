import test from 'node:test';
import assert from 'node:assert/strict';
import { extractImportantKeywords, matchKeywords, extractNgrams, ACTION_VERBS } from '../src/services/keywordMatcher.js';
import { calculateSemanticSimilarity } from '../src/services/semanticMatcher.js';

test('Keyword Matcher — extractImportantKeywords and extractNgrams', async (t) => {
  await t.test('extracts top keywords and multi-word bigrams', () => {
    const text = 'Senior Full Stack Engineer building high-throughput microservices using Node.js and distributed systems.';
    const result = extractImportantKeywords(text, 10);

    assert.ok(result.uniqueTerms.length > 0);
    assert.ok(result.uniqueTerms.some((k) => k.includes('microservices') || k.includes('node.js')));
  });

  await t.test('generates valid n-grams', () => {
    const tokens = ['senior', 'software', 'engineer', 'react'];
    const ngrams = extractNgrams(tokens, 2);
    assert.ok(ngrams.includes('senior software'));
    assert.ok(ngrams.includes('software engineer'));
  });
});

test('Keyword Matcher — matchKeywords', async (t) => {
  await t.test('identifies matched keywords and action verbs', () => {
    const resume = 'Architected and developed high-scale cloud platforms using Docker and Kubernetes. Spearheaded team of 5 engineers.';
    const jd = 'Looking for an engineer to build and manage Docker and Kubernetes cloud platforms.';

    const match = matchKeywords(resume, jd);
    assert.ok(match.matchedKeywords.includes('docker') || match.matchedKeywords.includes('kubernetes') || match.matchedKeywords.includes('platforms'));
    assert.ok(match.actionVerbsFound.includes('architected') || match.actionVerbsFound.includes('spearheaded'));
    assert.ok(match.actionVerbCount >= 2);
    assert.ok(match.matchScore >= 40);
  });
});

test('Semantic Matcher — calculateSemanticSimilarity', async (t) => {
  await t.test('computes deterministic TF-IDF cosine similarity for matching domain texts', async () => {
    const resume = 'Full stack software engineer with 5 years experience in React, Node.js, Express, MongoDB, and AWS cloud development.';
    const jd = 'Seeking Full Stack Developer experienced with React, Node.js backend services, database design, and cloud infrastructure.';

    const sim = await calculateSemanticSimilarity(resume, jd);
    assert.ok(sim.similarityScore >= 50, `Expected similarity >= 50, got ${sim.similarityScore}`);
    assert.ok(['High', 'Medium', 'Low'].includes(sim.semanticConfidence));
    assert.ok(typeof sim.explanation === 'string');
  });

  await t.test('handles empty text gracefully', async () => {
    const sim = await calculateSemanticSimilarity('', '');
    assert.strictEqual(sim.similarityScore, 0);
    assert.strictEqual(sim.semanticConfidence, 'Low');
  });
});
