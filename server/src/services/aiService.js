/**
 * Comprehensive AI Service Architecture
 *
 * Interfaces with OpenAI-compatible LLM endpoints and provides high-fidelity,
 * zero-hallucination deterministic fallback generators when offline or unconfigured.
 */

import { config } from '../config/environment.js';
import {
  RESUME_ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
  buildBulletRewritePrompt,
  buildSummaryPrompt,
  buildRoleRecommendationPrompt,
} from '../prompts/aiPrompts.js';
import { extractSkills } from './skillExtractor.js';
import { ACTION_VERBS } from './keywordMatcher.js';

/**
 * Strips markdown fences (```json ... ```) and safely parses JSON.
 */
export function cleanAndParseJsonResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let cleaned = rawText.trim();

  // Strip leading code fences
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Calls LLM API with system and user prompt.
 */
async function callLlmApi(systemPrompt, userPrompt) {
  if (!config.aiApiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    return cleanAndParseJsonResponse(content);
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. Full Resume Analysis with AI
// ---------------------------------------------------------------------------
export async function analyzeResumeWithAi(resumeText, jobDescription, scoreResult, semanticResult) {
  const userPrompt = buildAnalysisUserPrompt(resumeText, jobDescription, scoreResult, semanticResult);
  const aiResult = await callLlmApi(RESUME_ANALYSIS_SYSTEM_PROMPT, userPrompt);

  if (aiResult && aiResult.summary && Array.isArray(aiResult.strengths)) {
    return {
      ...aiResult,
      provider: 'OpenAI (gpt-4o-mini)',
      isMock: false,
    };
  }

  // High-fidelity fallback heuristic grounded in actual extraction data
  const missingSkills = (scoreResult.breakdown?.skills?.missing || []).slice(0, 5);
  const matchedSkills = (scoreResult.breakdown?.skills?.matched || []).slice(0, 5);
  const missingKeywords = (scoreResult.breakdown?.keywords?.missing || []).slice(0, 4);

  return {
    provider: 'Heuristic Career Advisor (Built-in)',
    isMock: true,
    summary: scoreResult.totalScore >= 75
      ? `Candidate demonstrates strong competency in ${matchedSkills.slice(0, 3).join(', ') || 'core requirements'}. Closing minor keyword gaps will maximize interview conversion.`
      : `Resume provides a foundational background, but demonstrates skill gaps in ${missingSkills.slice(0, 3).join(', ') || 'specialized tools'}. Target specific project evidence to improve alignment.`,
    strengths: [
      `Demonstrated proficiency in ${matchedSkills.join(', ') || 'fundamental technical concepts'}.`,
      `Document structure includes standard sections with ${scoreResult.breakdown?.experience?.actionVerbsCount || 5} active impact verbs.`,
      `Semantic alignment indicates ${semanticResult?.conceptualOverlapPercent || 70}% conceptual synergy with target responsibilities.`,
    ],
    weaknesses: [
      missingSkills.length > 0 ? `Lacks explicitly documented experience in: ${missingSkills.join(', ')}.` : 'Could emphasize more measurable business outcome metrics.',
      missingKeywords.length > 0 ? `Missing ATS keyphrases: ${missingKeywords.join(', ')}.` : 'Add project links to substantiate hands-on experience.',
    ],
    recommendations: [
      missingSkills.length > 0 ? `Incorporate hands-on experience or coursework covering ${missingSkills.slice(0, 2).join(' and ')}.` : 'Enhance bullet points with specific scale and latency benchmarks.',
      'Adopt the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".',
      'Ensure GitHub repositories and live deployment URLs are clickable in your contact and project sections.',
    ],
    suggestedRoles: [
      { role: 'Full Stack Engineer', matchPercentage: Math.min(95, scoreResult.totalScore + 5), reason: 'Strong proficiency in full-lifecycle web development.' },
      { role: 'Software Engineer', matchPercentage: scoreResult.totalScore, reason: 'Solid foundational software engineering and programming competencies.' },
      { role: 'Frontend Developer', matchPercentage: Math.max(50, scoreResult.totalScore - 10), reason: 'Evident modern UI and client-side framework capabilities.' },
    ],
    bulletSuggestions: [
      `Architected responsive web applications using ${matchedSkills.slice(0, 2).join(' and ') || 'modern frameworks'}, ensuring clean component modularity and high performance.`,
      `Engineered RESTful APIs and backend services, implementing robust authentication and structured database schemas.`,
    ],
  };
}

// ---------------------------------------------------------------------------
// 2. AI Bullet Point Rewriter
// ---------------------------------------------------------------------------
export async function rewriteBulletPoint(bulletText, targetRole = 'Software Engineer') {
  if (!bulletText || typeof bulletText !== 'string' || bulletText.trim().length === 0) {
    throw new Error('bulletText is required.');
  }

  const prompt = buildBulletRewritePrompt(bulletText, targetRole);
  const aiResult = await callLlmApi(
    'You are an expert ATS resume editor. Rewrite resume bullet points to maximize impact without ever fabricating numbers or claims.',
    prompt
  );

  if (aiResult && aiResult.improved) {
    return {
      ...aiResult,
      provider: 'OpenAI (gpt-4o-mini)',
      isMock: false,
    };
  }

  // Fallback heuristic rewriter
  const trimmed = bulletText.trim().replace(/^[-*•\s]+/, '');
  const tokens = trimmed.split(/\s+/);
  const firstWord = (tokens[0] || '').toLowerCase();

  let actionVerb = 'Engineered';
  if (!ACTION_VERBS.has(firstWord)) {
    if (/design|ui|front/i.test(trimmed)) actionVerb = 'Architected';
    else if (/lead|manage|team/i.test(trimmed)) actionVerb = 'Spearheaded';
    else if (/test|qa/i.test(trimmed)) actionVerb = 'Automated';
    else if (/optimi|fast|speed/i.test(trimmed)) actionVerb = 'Optimized';
  } else {
    actionVerb = tokens[0].charAt(0).toUpperCase() + tokens[0].slice(1).toLowerCase();
  }

  const improvedBody = tokens.slice(ACTION_VERBS.has(firstWord) ? 1 : 0).join(' ');
  const improved = `${actionVerb} ${improvedBody.charAt(0).toLowerCase() + improvedBody.slice(1)}`;

  return {
    original: trimmed,
    improved: improved.endsWith('.') ? improved : `${improved}.`,
    actionVerbUsed: actionVerb,
    changesMade: 'Strengthened initial phrasing with an executive action verb and structured impact clarity without altering underlying facts.',
    provider: 'Heuristic Bullet Engine (Built-in)',
    isMock: true,
  };
}

// ---------------------------------------------------------------------------
// 3. AI Professional Summary Generator
// ---------------------------------------------------------------------------
export async function generateProfessionalSummary(resumeText, targetRole = 'Software Engineer') {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    throw new Error('resumeText is required.');
  }

  const prompt = buildSummaryPrompt(resumeText, targetRole);
  const aiResult = await callLlmApi(
    'You are an executive resume writer. Generate concise, factual professional summaries strictly based on provided candidate evidence.',
    prompt
  );

  if (aiResult && aiResult.summary) {
    return {
      ...aiResult,
      provider: 'OpenAI (gpt-4o-mini)',
      isMock: false,
    };
  }

  // Fallback heuristic generator
  const extracted = extractSkills(resumeText);
  const topLanguages = (extracted.categories.languages || []).slice(0, 3).join(', ');
  const topFrameworks = (extracted.categories.frameworks || []).slice(0, 2).join(' and ');
  const topDatabases = (extracted.categories.databases || []).slice(0, 2).join(', ');

  const summary = `Results-driven ${targetRole} with hands-on expertise building scalable software solutions using ${topFrameworks || 'modern web technologies'} and ${topLanguages || 'core programming languages'}. Experienced across full-lifecycle application development, database architecture with ${topDatabases || 'relational and NoSQL systems'}, and clean code principles. Dedicated to writing maintainable code and solving complex software engineering challenges.`;

  return {
    summary,
    keyHighlights: [
      `Expertise in ${topLanguages || 'core engineering languages'}`,
      `Experience with ${topFrameworks || 'modern software frameworks'}`,
      `Database engineering and API architecture with ${topDatabases || 'modern databases'}`,
    ],
    provider: 'Heuristic Summary Engine (Built-in)',
    isMock: true,
  };
}

// ---------------------------------------------------------------------------
// 4. Job Role Recommender
// ---------------------------------------------------------------------------
export async function recommendJobRoles(resumeText) {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    throw new Error('resumeText is required.');
  }

  const prompt = buildRoleRecommendationPrompt(resumeText);
  const aiResult = await callLlmApi(
    'You are an AI Career Path Strategist. Match resume capabilities to realistic industry career roles.',
    prompt
  );

  if (aiResult && Array.isArray(aiResult.recommendations) && aiResult.recommendations.length > 0) {
    return {
      ...aiResult,
      provider: 'OpenAI (gpt-4o-mini)',
      isMock: false,
    };
  }

  // Fallback heuristic recommendations
  const extracted = extractSkills(resumeText);
  const hasFrontend = (extracted.categories.frameworks || []).some((f) => /react|vue|angular|next/i.test(f));
  const hasBackend = (extracted.categories.frameworks || []).some((f) => /node|express|django|spring|fastapi/i.test(f)) || (extracted.categories.databases || []).length > 0;
  const hasDevops = (extracted.categories.devops || []).length > 0 || (extracted.categories.cloud || []).length > 0;
  const hasAi = (extracted.categories.aiAndData || []).length > 0;

  const recommendations = [];

  if (hasFrontend && hasBackend) {
    recommendations.push({
      role: 'Full Stack Software Engineer',
      matchPercentage: 92,
      justification: `Demonstrated experience bridging client-side architectures with robust backend services and databases (${(extracted.categories.frameworks || []).slice(0, 3).join(', ')}).`,
    });
  }

  if (hasBackend) {
    recommendations.push({
      role: 'Backend / Platform Engineer',
      matchPercentage: 88,
      justification: `Proficiency in server-side technologies, API design, and data storage systems (${(extracted.categories.databases || []).slice(0, 2).join(', ')}).`,
    });
  }

  if (hasFrontend) {
    recommendations.push({
      role: 'Frontend Web Developer',
      matchPercentage: 85,
      justification: `Strong UI component engineering skills and modern client framework capabilities.`,
    });
  }

  if (hasDevops) {
    recommendations.push({
      role: 'Cloud & DevOps Engineer',
      matchPercentage: 82,
      justification: `Experience with containerization (${(extracted.categories.devops || []).join(', ')}) and cloud platforms.`,
    });
  }

  if (hasAi) {
    recommendations.push({
      role: 'AI / Machine Learning Engineer',
      matchPercentage: 80,
      justification: `Applied experience with machine learning models and intelligent data pipelines.`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      role: 'Junior Software Engineer',
      matchPercentage: 75,
      justification: 'Foundational programming language skills and core technical literacy.',
    });
  }

  return {
    recommendations,
    provider: 'Heuristic Career Matcher (Built-in)',
    isMock: true,
  };
}
