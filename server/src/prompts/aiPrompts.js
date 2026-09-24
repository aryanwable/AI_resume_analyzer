/**
 * AI System Prompts & Structured Templates
 *
 * Enforces zero-hallucination, factual grounding, and structured JSON output.
 */

export const RESUME_ANALYSIS_SYSTEM_PROMPT = `
You are an elite Executive ATS Resume Evaluator and Career Coach.
Analyze the provided resume against the target job description.

CRITICAL INTEGRITY RULES:
1. ZERO FABRICATION: Never invent employers, years of experience, certifications, technologies, or percentage metrics.
2. EVIDENCE GROUNDING: Every strength or weakness must reference actual content from the resume or explicit requirements from the job description.
3. STRUCTURED JSON: Respond strictly with a valid JSON object matching the requested schema. Do NOT include markdown code fences or conversational text.
`.trim();

export function buildAnalysisUserPrompt(resumeText, jobDescription, scoreResult, semanticResult) {
  return `
TARGET JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

CANDIDATE RESUME:
${resumeText.slice(0, 3500)}

DETERMINISTIC EVALUATION METRICS:
- Overall Score: ${scoreResult.totalScore}/100 (Grade ${scoreResult.grade})
- Skills Match: ${scoreResult.breakdown?.skills?.score}/${scoreResult.breakdown?.skills?.maxScore}
- Missing Skills: ${(scoreResult.breakdown?.skills?.missing || []).slice(0, 8).join(', ') || 'None'}
- Missing Keywords: ${(scoreResult.breakdown?.keywords?.missing || []).slice(0, 8).join(', ') || 'None'}
- Semantic Conceptual Overlap: ${semanticResult?.conceptualOverlapPercent || 70}%

Produce a JSON response with the following exact keys:
{
  "summary": "2-3 sentence executive assessment of candidate fit",
  "strengths": ["3 to 5 specific, grounded strengths observed in the resume"],
  "weaknesses": ["2 to 4 actionable gaps or weaknesses compared to the JD"],
  "recommendations": ["3 to 5 prioritized concrete steps candidate should take"],
  "suggestedRoles": [
    { "role": "Role Title", "matchPercentage": 85, "reason": "Grounding reason" }
  ],
  "bulletSuggestions": ["2 to 4 improved bullet points based on the candidate's existing experience"]
}
`.trim();
}

export function buildBulletRewritePrompt(bulletText, targetRole = 'Software Engineer') {
  return `
ROLE CONTEXT: ${targetRole}
ORIGINAL BULLET POINT:
"${bulletText}"

REWRITE INSTRUCTIONS:
1. Transform into 1 concise, high-impact bullet using the [Action Verb] + [Task/Context] + [Result/Tech] formula.
2. DO NOT fabricate numbers, metrics, percentages, or technologies not mentioned in the original bullet.
3. If no metrics are present, emphasize clarity, scope, and technical depth without inventing numbers.

Produce a JSON response with the following exact keys:
{
  "original": "${bulletText.replace(/"/g, '\\"')}",
  "improved": "High-impact rewritten bullet",
  "actionVerbUsed": "Primary action verb",
  "changesMade": "Brief explanation of what was enhanced"
}
`.trim();
}

export function buildSummaryPrompt(resumeText, targetRole = 'Software Engineer') {
  return `
TARGET ROLE: ${targetRole}
RESUME CONTENT:
${resumeText.slice(0, 3000)}

INSTRUCTIONS:
Create a professional 3-4 sentence Career Summary tailored to the target role using ONLY technologies and experience found in the resume.

Produce a JSON response with:
{
  "summary": "Compelling 3-4 sentence career summary",
  "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}
`.trim();
}

export function buildRoleRecommendationPrompt(resumeText) {
  return `
RESUME CONTENT:
${resumeText.slice(0, 3000)}

INSTRUCTIONS:
Evaluate the candidate's actual skill profile and recommend 3-5 relevant job roles with fit percentage (50-98%) and justification based strictly on evident competencies.

Produce a JSON response with:
{
  "recommendations": [
    { "role": "Role Title", "matchPercentage": 88, "justification": "Evidence from resume" }
  ]
}
`.trim();
}
