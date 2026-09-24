import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSkills, compareSkills, SKILL_TAXONOMY } from '../src/services/skillExtractor.js';

test('Skill Extractor — extractSkills', async (t) => {
  await t.test('extracts categorized technical skills across standard categories', () => {
    const text = `
      Experienced Senior Full Stack Developer.
      Proficient in TypeScript, React, Next.js, Node.js, Express.js.
      Database expertise in PostgreSQL, MongoDB, and Redis.
      Cloud infrastructure with AWS (EC2, S3, Lambda) and Docker, Kubernetes.
      Practiced in CI/CD pipelines, GitHub Actions, Git, and REST APIs.
      Applied Machine Learning with PyTorch and OpenAI API.
    `;

    const result = extractSkills(text);

    assert.ok(result.allSkills.includes('TypeScript'));
    assert.ok(result.allSkills.includes('React'));
    assert.ok(result.allSkills.includes('Node.js'));
    assert.ok(result.allSkills.includes('PostgreSQL'));
    assert.ok(result.allSkills.includes('MongoDB'));
    assert.ok(result.allSkills.includes('Redis'));
    assert.ok(result.allSkills.includes('Amazon Web Services (AWS)'));
    assert.ok(result.allSkills.includes('Docker'));
    assert.ok(result.allSkills.includes('Kubernetes'));
    assert.ok(result.allSkills.includes('CI/CD Pipelines'));
    assert.ok(result.allSkills.includes('REST APIs'));
    assert.ok(result.allSkills.includes('PyTorch'));

    assert.ok(result.categories.languages.includes('TypeScript'));
    assert.ok(result.categories.frameworks.includes('React'));
    assert.ok(result.categories.databases.includes('PostgreSQL'));
    assert.ok(result.categories.cloud.includes('Amazon Web Services (AWS)'));
    assert.ok(result.categories.devops.includes('Docker'));
    assert.ok(result.categories.aiAndData.includes('PyTorch'));
  });

  await t.test('correctly normalizes aliases to canonical taxonomy names', () => {
    const text = 'Expert in k8s, postgres, ts, js, rtk, and gcp cloud.';
    const result = extractSkills(text);

    assert.ok(result.allSkills.includes('Kubernetes'), 'k8s -> Kubernetes');
    assert.ok(result.allSkills.includes('PostgreSQL'), 'postgres -> PostgreSQL');
    assert.ok(result.allSkills.includes('TypeScript'), 'ts -> TypeScript');
    assert.ok(result.allSkills.includes('JavaScript'), 'js -> JavaScript');
    assert.ok(result.allSkills.includes('Redux'), 'rtk -> Redux');
    assert.ok(result.allSkills.includes('Google Cloud Platform (GCP)'), 'gcp -> Google Cloud Platform (GCP)');
  });

  await t.test('avoids false positives in normal English words', () => {
    const text = 'We trust our team to go the extra mile and build high value solutions on 5th avenue.';
    const result = extractSkills(text);

    assert.ok(!result.allSkills.includes('Rust'), 'Should not match "trust" as Rust');
    assert.ok(!result.allSkills.includes('Vue.js'), 'Should not match "avenue" as Vue');
  });

  await t.test('safely handles empty input', () => {
    const result = extractSkills(null);
    assert.strictEqual(result.totalSkillsCount, 0);
    assert.deepStrictEqual(result.allSkills, []);
  });
});

test('Skill Extractor — compareSkills', async (t) => {
  await t.test('accurately identifies matched, missing, and extra skills', () => {
    const resume = `
      Full Stack Engineer with React, Node.js, TypeScript, PostgreSQL, and Docker.
    `;
    const jd = `
      Looking for a Senior Engineer with React, Node.js, TypeScript, AWS, Kubernetes, and Python.
    `;

    const comparison = compareSkills(resume, jd);

    assert.ok(comparison.matchedSkills.includes('React'));
    assert.ok(comparison.matchedSkills.includes('Node.js'));
    assert.ok(comparison.matchedSkills.includes('TypeScript'));

    assert.ok(comparison.missingSkills.includes('Amazon Web Services (AWS)'));
    assert.ok(comparison.missingSkills.includes('Kubernetes'));
    assert.ok(comparison.missingSkills.includes('Python'));

    assert.ok(comparison.extraSkills.includes('PostgreSQL'));
    assert.ok(comparison.extraSkills.includes('Docker'));

    assert.ok(comparison.matchPercentage >= 40 && comparison.matchPercentage <= 60);
    assert.ok(comparison.categoryBreakdown.frameworks.matched.includes('React'));
    assert.ok(comparison.categoryBreakdown.devops.missing.includes('Kubernetes'));
  });
});
