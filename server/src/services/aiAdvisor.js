import config from '../config/environment.js';

/**
 * Clean and parse raw LLM output into validated JSON
 * @param {string} raw - Text response from LLM
 * @returns {object|null}
 */
export const cleanAndParseJsonResponse = (raw) => {
  if (!raw || typeof raw !== 'string') return null;

  // Remove markdown code fence if model wraps in ```json ... ```
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  try {
    return JSON.parse(cleaned.trim());
  } catch {
    // If straight parse fails, try extracting first outermost JSON block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Generate heuristic-backed career suggestions if AI API key is missing or call fails
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {object} scoreResult
 * @returns {object}
 */
export const generateFallbackAdvice = (resumeText, jobDescription, scoreResult = {}) => {
  const missingKeywords = scoreResult.breakdown?.keywords?.missing || [];
  const missingSections = scoreResult.breakdown?.sections?.missing || [];
  const totalScore = scoreResult.totalScore || 0;

  const strengths = [];
  const improvements = [];
  const bulletSuggestions = [];

  if (totalScore >= 70) {
    strengths.push('Strong structural alignment with target industry expectations.');
  }
  if (scoreResult.breakdown?.keywords?.matched?.length > 5) {
    strengths.push(`Proven mention of core competencies: ${scoreResult.breakdown.keywords.matched.slice(0, 4).join(', ')}.`);
  } else {
    strengths.push('Solid foundation and readable formatting.');
  }

  if (missingKeywords.length > 0) {
    improvements.push(`Incorporate target technical skills such as: ${missingKeywords.slice(0, 5).join(', ')}.`);
    bulletSuggestions.push(`Spearheaded development utilizing ${missingKeywords[0] || 'core technologies'}, improving performance and delivery speed.`);
  }

  if (missingSections.includes('summary')) {
    improvements.push('Add an impactful 3-line Professional Summary directly below your contact details.');
  }
  if (missingSections.includes('projects')) {
    improvements.push('Include a dedicated Projects section demonstrating practical application of key tools.');
  }

  bulletSuggestions.push('Quantify key achievements with measurable impact metrics (e.g., increased efficiency by 25%, scaled to 10k users).');
  bulletSuggestions.push('Align action verbs at the start of each bullet point (e.g., Architected, Spearheaded, Engineered).');

  return {
    isMock: true,
    provider: 'heuristic-engine',
    summary: `Your resume demonstrates good compatibility. Addressing ${improvements.length} targeted improvement areas will significantly enhance ATS and recruiter pass-through rates.`,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 4),
    bulletSuggestions: bulletSuggestions.slice(0, 3),
    targetRoleTips: [
      'Mirror technical keywords from the job description in your skills and project sections.',
      'Ensure clear chronological ordering with dates and location details.',
    ],
  };
};

/**
 * Generate AI Analysis and Feedback using OpenAI-compatible or direct API
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {object} scoreResult
 * @returns {Promise<object>}
 */
export const generateAiAdvice = async (resumeText, jobDescription, scoreResult = {}) => {
  // If no AI key provided in environment, gracefully fallback to deterministic recommendations
  if (!config.aiApiKey) {
    return generateFallbackAdvice(resumeText, jobDescription, scoreResult);
  }

  const prompt = `You are an executive ATS resume coach and hiring manager.
Compare this candidate resume against the target job description and return strict JSON with actionable recommendations.

Resume Text:
${resumeText.slice(0, 4000)}

Job Description:
${jobDescription.slice(0, 2500)}

Existing Score Metrics:
- Total Match Score: ${scoreResult.totalScore || 0}/100
- Grade: ${scoreResult.grade || 'N/A'}
- Matched Keywords: ${(scoreResult.breakdown?.keywords?.matched || []).slice(0, 10).join(', ')}
- Missing Keywords: ${(scoreResult.breakdown?.keywords?.missing || []).slice(0, 10).join(', ')}

Return ONLY a valid JSON object matching this schema:
{
  "summary": "2-sentence executive assessment of resume-JD alignment",
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "bulletSuggestions": ["Rewritten or suggested action-verb bullet with metrics", "bullet 2", "bullet 3"],
  "targetRoleTips": ["specific tip 1", "specific tip 2"]
}`;

  try {
    // Standard fetch to OpenAI-compatible endpoint or Gemini endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert resume reviewer that responds strictly in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(12000), // 12s timeout
    });

    if (!response.ok) {
      throw new Error(`AI Provider returned status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    const parsed = cleanAndParseJsonResponse(rawContent);

    if (!parsed || !parsed.summary || !Array.isArray(parsed.improvements)) {
      throw new Error('Invalid JSON structure received from LLM');
    }

    return {
      isMock: false,
      provider: 'gpt-4o-mini',
      ...parsed,
    };
  } catch (err) {
    console.warn(`[AIAdvisor] External LLM call skipped/failed (${err.message}). Using intelligent heuristic fallback.`);
    return generateFallbackAdvice(resumeText, jobDescription, scoreResult);
  }
};

export default {
  generateAiAdvice,
  generateFallbackAdvice,
  cleanAndParseJsonResponse,
};
