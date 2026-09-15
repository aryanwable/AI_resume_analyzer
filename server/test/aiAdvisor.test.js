import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateFallbackAdvice,
  cleanAndParseJsonResponse,
} from '../src/services/aiAdvisor.js';

describe('AI Advisor Service — Unit Tests (Day 17)', () => {
  const sampleScore = {
    totalScore: 78,
    grade: 'B',
    breakdown: {
      keywords: {
        matched: ['react', 'node.js', 'mongodb', 'express', 'git', 'javascript'],
        missing: ['docker', 'aws', 'kubernetes', 'ci/cd'],
      },
      sections: {
        found: ['experience', 'education', 'skills', 'contact'],
        missing: ['summary', 'certifications'],
      },
      contentDepth: {
        wordCount: 420,
      },
    },
  };

  test('generateFallbackAdvice returns expected structured advice object', () => {
    const advice = generateFallbackAdvice('Resume text sample', 'Job description sample', sampleScore);

    assert.ok(advice);
    assert.equal(typeof advice.summary, 'string');
    assert.ok(advice.summary.length > 10);
    assert.ok(Array.isArray(advice.strengths), 'strengths should be an array');
    assert.ok(Array.isArray(advice.improvements), 'improvements should be an array');
    assert.ok(Array.isArray(advice.bulletSuggestions), 'bulletSuggestions should be an array');
    assert.ok(Array.isArray(advice.targetRoleTips), 'targetRoleTips should be an array');
    assert.ok(advice.isMock === true);
    assert.equal(advice.provider, 'heuristic-engine');
  });

  test('generateFallbackAdvice includes missing keywords in improvement recommendations', () => {
    const advice = generateFallbackAdvice('Resume text', 'Job description', sampleScore);

    const hasMissingSkillMention = advice.improvements.some((imp) =>
      imp.toLowerCase().includes('docker') || imp.toLowerCase().includes('aws')
    );
    assert.ok(hasMissingSkillMention, 'should mention missing keywords');
  });

  test('generateFallbackAdvice recommends summary section when missing', () => {
    const advice = generateFallbackAdvice('Resume text', 'Job description', sampleScore);

    const hasSummaryAdvice = advice.improvements.some((imp) =>
      imp.toLowerCase().includes('summary')
    );
    assert.ok(hasSummaryAdvice, 'should suggest adding summary section');
  });

  test('cleanAndParseJsonResponse parses clean JSON strings', () => {
    const raw = '{"summary": "Great match", "strengths": ["Leadership"]}';
    const parsed = cleanAndParseJsonResponse(raw);
    assert.deepEqual(parsed, { summary: 'Great match', strengths: ['Leadership'] });
  });

  test('cleanAndParseJsonResponse strips markdown code fences', () => {
    const markdown = '```json\n{"summary": "Solid", "improvements": ["Add metrics"]}\n```';
    const parsed = cleanAndParseJsonResponse(markdown);
    assert.deepEqual(parsed, { summary: 'Solid', improvements: ['Add metrics'] });
  });

  test('cleanAndParseJsonResponse gracefully returns null on malformed input', () => {
    assert.equal(cleanAndParseJsonResponse('not a json object'), null);
    assert.equal(cleanAndParseJsonResponse(null), null);
    assert.equal(cleanAndParseJsonResponse(undefined), null);
  });
});
