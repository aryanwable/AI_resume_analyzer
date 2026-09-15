/**
 * Deterministic Resume Scoring Engine
 *
 * Scores a resume against a job description using keyword extraction,
 * section detection, and weighted category analysis.
 *
 * Score breakdown (100 points total):
 *   - Keyword Match    : 50 pts  — How many JD keywords appear in the resume
 *   - Section Coverage : 20 pts  — Presence of standard resume sections
 *   - Content Depth    : 20 pts  — Word count and content density signals
 *   - Readability      : 10 pts  — Average sentence length and formatting signals
 */

// ---------------------------------------------------------------------------
// Stopwords — filtered out before keyword extraction
// ---------------------------------------------------------------------------
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'by',
  'for', 'from', 'has', 'have', 'he', 'her', 'him', 'his', 'how', 'i',
  'if', 'in', 'is', 'it', 'its', 'me', 'my', 'no', 'not', 'of', 'on',
  'or', 'our', 'out', 'she', 'so', 'the', 'their', 'them', 'they',
  'this', 'to', 'up', 'us', 'was', 'we', 'were', 'what', 'when',
  'where', 'who', 'will', 'with', 'you', 'your', 'that', 'which',
  'than', 'more', 'also', 'can', 'do', 'does', 'did', 'would', 'could',
  'should', 'may', 'might', 'shall', 'must', 'about', 'into', 'through',
  'between', 'such', 'then', 'these', 'those', 'other', 'any', 'all',
  'both', 'each', 'few', 'more', 'most', 'some', 'over', 'under',
  'again', 'further', 'once', 'here', 'there', 'why', 'just', 'because',
  'while', 'although', 'however', 'therefore', 'thus', 'hence',
]);

// ---------------------------------------------------------------------------
// Standard resume section headings
// ---------------------------------------------------------------------------
const RESUME_SECTIONS = [
  { name: 'contact',        patterns: [/contact|email|phone|linkedin|github/i] },
  { name: 'summary',        patterns: [/summary|objective|profile|about\s*me/i] },
  { name: 'experience',     patterns: [/experience|employment|work\s*history|career/i] },
  { name: 'education',      patterns: [/education|academic|degree|university|college/i] },
  { name: 'skills',         patterns: [/skills|technologies|tech\s*stack|expertise|competencies/i] },
  { name: 'projects',       patterns: [/projects?|portfolio|personal\s*work/i] },
  { name: 'certifications', patterns: [/certifications?|licenses?|credentials?|courses?/i] },
  { name: 'achievements',   patterns: [/achievements?|awards?|honors?|accomplishments?/i] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Tokenise text into lowercase words, removing punctuation and stopwords.
 * @param {string} text
 * @returns {string[]}
 */
const tokenise = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

/**
 * Build a frequency map from a token array.
 * @param {string[]} tokens
 * @returns {Map<string, number>}
 */
const buildFreqMap = (tokens) => {
  const map = new Map();
  for (const t of tokens) map.set(t, (map.get(t) ?? 0) + 1);
  return map;
};

/**
 * Extract the top-N unique keywords from a token list by frequency.
 * @param {string[]} tokens
 * @param {number} topN
 * @returns {string[]}
 */
const topKeywords = (tokens, topN = 40) => {
  const freq = buildFreqMap(tokens);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
};

// ---------------------------------------------------------------------------
// Scoring components
// ---------------------------------------------------------------------------

/**
 * Keyword match score (0 – 50).
 * Measures what % of top JD keywords appear in the resume.
 */
const scoreKeywords = (resumeTokens, jdTokens) => {
  const jdKeywords = topKeywords(jdTokens, 40);
  if (jdKeywords.length === 0) return { score: 0, matched: [], missing: [] };

  const resumeSet = new Set(resumeTokens);
  const matched = jdKeywords.filter((kw) => resumeSet.has(kw));
  const missing = jdKeywords.filter((kw) => !resumeSet.has(kw));

  const ratio = matched.length / jdKeywords.length;
  const score = Math.round(ratio * 50);

  return { score, matched, missing, total: jdKeywords.length };
};

/**
 * Section coverage score (0 – 20).
 * Checks for presence of standard resume sections.
 */
const scoreSections = (resumeText) => {
  const found = [];
  const missing = [];

  for (const section of RESUME_SECTIONS) {
    const detected = section.patterns.some((p) => p.test(resumeText));
    if (detected) found.push(section.name);
    else missing.push(section.name);
  }

  // Contact, experience, education, skills are required (weight 4 each = 16 pts)
  // Projects and summary are bonus (weight 2 each = 4 pts)
  const REQUIRED = ['experience', 'education', 'skills', 'contact'];
  const BONUS = ['summary', 'projects', 'certifications', 'achievements'];

  let score = 0;
  for (const s of REQUIRED) if (found.includes(s)) score += 4;
  for (const s of BONUS) if (found.includes(s)) score += 1;

  return { score: Math.min(score, 20), found, missing };
};

/**
 * Content depth score (0 – 20).
 * Rewards appropriate resume length and content density.
 */
const scoreContentDepth = (resumeText, resumeTokens) => {
  const wordCount = resumeTokens.length;
  const uniqueWords = new Set(resumeTokens).size;
  const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;

  // Word count bands (resume should be 200–800 words ideally)
  let lengthScore;
  if (wordCount < 100) lengthScore = 4;
  else if (wordCount < 200) lengthScore = 8;
  else if (wordCount <= 800) lengthScore = 14;
  else if (wordCount <= 1200) lengthScore = 12;
  else lengthScore = 8;

  // Lexical diversity reward (0–6 pts)
  const diversityScore = Math.round(Math.min(lexicalDiversity * 10, 6));

  const score = Math.min(lengthScore + diversityScore, 20);
  return { score, wordCount, uniqueWords, lexicalDiversity: +lexicalDiversity.toFixed(3) };
};

/**
 * Readability score (0 – 10).
 * Heuristically checks sentence length distribution and bullet structure.
 */
const scoreReadability = (resumeText) => {
  const sentences = resumeText
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length === 0) return { score: 5, avgSentenceLength: 0, bulletPoints: 0 };

  const avgLength =
    sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

  // Bullet points signal good formatting
  const bulletPoints = (resumeText.match(/^[\s]*[•\-\*\u2022]\s/gm) || []).length;
  const hasBullets = bulletPoints > 3;

  // Ideal avg sentence length is 8–20 words
  let readScore = 10;
  if (avgLength < 5 || avgLength > 35) readScore -= 4;
  else if (avgLength < 8 || avgLength > 25) readScore -= 2;
  if (hasBullets) readScore = Math.min(readScore + 2, 10);

  return {
    score: Math.max(0, readScore),
    avgSentenceLength: +avgLength.toFixed(1),
    bulletPoints,
  };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score a resume against a job description.
 *
 * @param {string} resumeText    - Plain text extracted from the resume PDF.
 * @param {string} jobDescription - The target job description text.
 * @returns {{
 *   totalScore: number,
 *   grade: string,
 *   breakdown: {
 *     keywords: object,
 *     sections: object,
 *     contentDepth: object,
 *     readability: object,
 *   },
 *   summary: string,
 * }}
 */
export const scoreResume = (resumeText, jobDescription) => {
  if (!resumeText || typeof resumeText !== 'string') {
    throw new Error('resumeText must be a non-empty string.');
  }
  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new Error('jobDescription must be a non-empty string.');
  }

  const resumeTokens = tokenise(resumeText);
  const jdTokens = tokenise(jobDescription);

  const keywords = scoreKeywords(resumeTokens, jdTokens);
  const sections = scoreSections(resumeText);
  const contentDepth = scoreContentDepth(resumeText, resumeTokens);
  const readability = scoreReadability(resumeText);

  const totalScore = keywords.score + sections.score + contentDepth.score + readability.score;

  // Letter grade
  let grade;
  if (totalScore >= 85) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';
  else if (totalScore >= 40) grade = 'D';
  else grade = 'F';

  // Human-readable summary
  const matchPct = keywords.total > 0
    ? Math.round((keywords.matched.length / keywords.total) * 100)
    : 0;

  const summary =
    `Resume scored ${totalScore}/100 (${grade}). ` +
    `Matched ${keywords.matched.length}/${keywords.total} JD keywords (${matchPct}%). ` +
    `Detected ${sections.found.length}/${RESUME_SECTIONS.length} resume sections. ` +
    `Content depth: ${contentDepth.wordCount} words.`;

  return {
    totalScore,
    grade,
    breakdown: {
      keywords: { ...keywords, maxScore: 50 },
      sections: { ...sections, maxScore: 20 },
      contentDepth: { ...contentDepth, maxScore: 20 },
      readability: { ...readability, maxScore: 10 },
    },
    summary,
  };
};

export default { scoreResume };
