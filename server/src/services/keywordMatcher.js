/**
 * Advanced Keyword & N-Gram Matching Service
 *
 * Extracts unigrams, bigrams, and domain phrases from job descriptions and resumes,
 * computing weighted keyword match rates, missing keyword gaps, action verb presence,
 * and content density.
 */

import { tokenizeWords, normalizeText } from './textPreprocessor.js';

// High-impact resume action verbs
export const ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'architected', 'automated', 'built', 'championed',
  'collaborated', 'configured', 'constructed', 'created', 'customized', 'decreased',
  'delivered', 'deployed', 'designed', 'developed', 'devised', 'directed',
  'engineered', 'enhanced', 'established', 'executed', 'expanded', 'expedited',
  'formulated', 'generated', 'guided', 'headed', 'implemented', 'improved',
  'increased', 'initiated', 'innovated', 'integrated', 'introduced', 'invented',
  'launched', 'lead', 'led', 'leveraged', 'maintained', 'managed', 'maximized',
  'mentored', 'minimized', 'modernized', 'negotiated', 'orchestrated', 'optimized',
  'overhauled', 'oversaw', 'pioneered', 'planned', 'programmed', 'reduced',
  'refactored', 'resolved', 'restructured', 'revamped', 'scaled', 'simplified',
  'spearheaded', 'standardized', 'streamlined', 'strengthened', 'structured',
  'surpassed', 'trained', 'transformed', 'upgraded', 'validated', 'yielded'
]);

/**
 * Extracts n-grams (1, 2, 3 words) from token list.
 *
 * @param {string[]} tokens
 * @param {number} [maxN=3]
 * @returns {string[]} List of unique n-grams
 */
export function extractNgrams(tokens, maxN = 3) {
  if (!tokens || tokens.length === 0) return [];
  const ngrams = [];

  for (let n = 1; n <= Math.min(maxN, tokens.length); n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const phrase = tokens.slice(i, i + n).join(' ');
      if (phrase.length >= 2) {
        ngrams.push(phrase);
      }
    }
  }

  return ngrams;
}

/**
 * Extracts high-value keywords and domain phrases from text.
 *
 * @param {string} text
 * @param {number} [topN=30]
 * @returns {{
 *   keywords: { word: string, count: number, weight: number }[],
 *   uniqueTerms: string[]
 * }}
 */
export function extractImportantKeywords(text, topN = 30) {
  if (!text || typeof text !== 'string') {
    return { keywords: [], uniqueTerms: [] };
  }

  const tokens = tokenizeWords(text, { removeStopwords: true });
  const freq = new Map();

  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }

  // Also extract high-frequency bigrams
  const bigramTokens = tokenizeWords(text, { removeStopwords: false });
  for (let i = 0; i < bigramTokens.length - 1; i++) {
    const w1 = bigramTokens[i];
    const w2 = bigramTokens[i + 1];
    // Include bigrams where neither word is purely a single character
    if (w1.length > 2 && w2.length > 2) {
      const bigram = `${w1} ${w2}`;
      freq.set(bigram, (freq.get(bigram) || 0) + 1.5);
    }
  }

  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term, score]) => ({
      word: term,
      count: Math.round(score),
      weight: Number(score.toFixed(2)),
    }));

  return {
    keywords: sorted,
    uniqueTerms: sorted.map((k) => k.word),
  };
}

/**
 * Compares resume text against a job description for keyword alignment and action metrics.
 *
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {{
 *   matchScore: number,
 *   matchedKeywords: string[],
 *   missingKeywords: string[],
 *   topJdKeywords: string[],
 *   actionVerbsFound: string[],
 *   actionVerbCount: number,
 *   keywordDensityPercent: number
 * }}
 */
export function matchKeywords(resumeText, jdText) {
  if (!resumeText || !jdText) {
    return {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      topJdKeywords: [],
      actionVerbsFound: [],
      actionVerbCount: 0,
      keywordDensityPercent: 0,
    };
  }

  const resumeNorm = normalizeText(resumeText).toLowerCase();
  const jdKeywordsData = extractImportantKeywords(jdText, 35);
  const topJdTerms = jdKeywordsData.uniqueTerms;

  if (topJdTerms.length === 0) {
    return {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      topJdKeywords: [],
      actionVerbsFound: [],
      actionVerbCount: 0,
      keywordDensityPercent: 0,
    };
  }

  const matchedKeywords = [];
  const missingKeywords = [];

  for (const term of topJdTerms) {
    // Check whole word or phrase in normalized resume
    const regex = new RegExp(`(?:^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9])`, 'i');
    if (regex.test(resumeNorm)) {
      matchedKeywords.push(term);
    } else {
      missingKeywords.push(term);
    }
  }

  const matchRatio = matchedKeywords.length / topJdTerms.length;
  const matchScore = Math.round(matchRatio * 100);

  // Action verb detection in resume
  const resumeTokens = tokenizeWords(resumeText, { removeStopwords: false });
  const actionVerbsFoundSet = new Set();
  for (const token of resumeTokens) {
    if (ACTION_VERBS.has(token)) {
      actionVerbsFoundSet.add(token);
    }
  }
  const actionVerbsFound = Array.from(actionVerbsFoundSet);

  // Keyword density
  const totalResumeTokens = resumeTokens.length || 1;
  let matchedOccurrences = 0;
  for (const token of resumeTokens) {
    if (matchedKeywords.includes(token)) {
      matchedOccurrences++;
    }
  }
  const keywordDensityPercent = Number(((matchedOccurrences / totalResumeTokens) * 100).toFixed(1));

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    topJdKeywords: topJdTerms,
    actionVerbsFound,
    actionVerbCount: actionVerbsFound.length,
    keywordDensityPercent,
  };
}
