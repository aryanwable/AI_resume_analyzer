/**
 * Explainable Resume Scoring Engine (6-Pillar Model)
 *
 * Evaluates a resume against a target job description across 6 transparent,
 * weighted categories (total 100 points):
 *
 *   1. Skills Match           : 25 pts — Categorized taxonomy overlap & core skill coverage
 *   2. Keyword Alignment      : 20 pts — N-gram, domain term match & keyword density
 *   3. Experience & Impact    : 20 pts — Action verbs, quantified metrics, & employment tenure
 *   4. Project Relevance      : 15 pts — Technical projects, modern stack application & links
 *   5. ATS Compatibility      : 10 pts — Clean header parseability, contact data & bullet structure
 *   6. Education & Credentials: 10 pts — Academic background, degree relevance & certifications
 */

import {
  normalizeText,
  segmentSections,
  extractContactInfo,
  extractDocumentMetrics,
  tokenizeWords,
} from './textPreprocessor.js';
import { compareSkills, extractSkills } from './skillExtractor.js';
import { matchKeywords, ACTION_VERBS } from './keywordMatcher.js';

/**
 * Derives letter grade from total score.
 *
 * @param {number} totalScore
 * @returns {string}
 */
export function deriveGrade(totalScore) {
  if (totalScore >= 90) return 'A';
  if (totalScore >= 80) return 'A-';
  if (totalScore >= 70) return 'B';
  if (totalScore >= 60) return 'C';
  if (totalScore >= 50) return 'D';
  return 'F';
}

/**
 * 1. Skills Match Category (Max: 25 pts)
 */
function evaluateSkills(resumeText, jdText, segmented) {
  const skillComparison = compareSkills(resumeText, jdText);
  const { matchedSkills, missingSkills, matchPercentage, categoryBreakdown } = skillComparison;

  // Base score proportional to match percentage
  let score = Math.round((matchPercentage / 100) * 25);

  // Bonus if skills are specifically listed in dedicated skills section
  if (segmented.detectedSections.includes('skills')) {
    score = Math.min(25, score + 2);
  }

  const percentage = Math.round((score / 25) * 100);
  let status = 'Needs Improvement';
  let feedback = '';

  if (percentage >= 80) {
    status = 'Excellent';
    feedback = `Exceptional skill alignment. Matched ${matchedSkills.length} required competencies with strong category coverage.`;
  } else if (percentage >= 60) {
    status = 'Strong';
    feedback = `Good skill overlap (${matchedSkills.length} matched), but missing critical competencies like ${missingSkills.slice(0, 3).join(', ') || 'specialized tools'}.`;
  } else if (percentage >= 40) {
    status = 'Moderate';
    feedback = `Moderate match. Resume covers foundational skills but lacks key requirements: ${missingSkills.slice(0, 4).join(', ')}.`;
  } else {
    status = 'Critical Gap';
    feedback = `Significant skill mismatch. Target position requires ${missingSkills.slice(0, 5).join(', ')}.`;
  }

  return {
    score,
    maxScore: 25,
    percentage,
    status,
    feedback,
    matched: matchedSkills,
    missing: missingSkills,
    extra: skillComparison.extraSkills,
    categoryBreakdown,
  };
}

/**
 * 2. Keyword Alignment Category (Max: 20 pts)
 */
function evaluateKeywords(resumeText, jdText) {
  const keywordData = matchKeywords(resumeText, jdText);
  const { matchScore, matchedKeywords, missingKeywords, keywordDensityPercent } = keywordData;

  const score = Math.round((matchScore / 100) * 20);
  const percentage = Math.round((score / 20) * 100);

  let status = 'Moderate';
  let feedback = '';

  if (percentage >= 75) {
    status = 'Excellent';
    feedback = `Strong domain vocabulary. Matched ${matchedKeywords.length} essential job description terms with ${keywordDensityPercent}% keyword density.`;
  } else if (percentage >= 50) {
    status = 'Strong';
    feedback = `Fair keyword density. Incorporate high-signal terms like "${missingKeywords.slice(0, 3).join('", "')}" to boost relevance.`;
  } else {
    status = 'Needs Improvement';
    feedback = `Low keyword alignment with target job. Key missing phrases: ${missingKeywords.slice(0, 4).join(', ')}.`;
  }

  return {
    score,
    maxScore: 20,
    percentage,
    status,
    feedback,
    matched: matchedKeywords,
    missing: missingKeywords,
    total: matchedKeywords.length + missingKeywords.length,
    keywordDensityPercent,
  };
}

/**
 * 3. Experience & Impact Category (Max: 20 pts)
 */
function evaluateExperience(resumeText, segmented) {
  let score = 0;
  const hasExpSection = segmented.detectedSections.includes('experience');
  if (hasExpSection) score += 6;

  // Detect action verbs
  const tokens = tokenizeWords(resumeText, { removeStopwords: false });
  const verbsFound = new Set();
  for (const t of tokens) {
    if (ACTION_VERBS.has(t)) verbsFound.add(t);
  }

  if (verbsFound.size >= 10) score += 7;
  else if (verbsFound.size >= 5) score += 4;
  else if (verbsFound.size >= 2) score += 2;

  // Detect quantified achievements (numbers, %, $, k/m metrics)
  const metricMatches = resumeText.match(/\b\d+%\b|\$\d+[\d,.]*(?:k|m|b)?\b|\b\d+\s*(?:million|billion|thousand|users|clients|requests|ms|x)\b|\b(?:increased|decreased|reduced|improved|scaled)\s+by\s+\d+/gi) || [];
  const quantifiedMetricsCount = metricMatches.length;

  if (quantifiedMetricsCount >= 4) score += 7;
  else if (quantifiedMetricsCount >= 2) score += 4;
  else if (quantifiedMetricsCount >= 1) score += 2;

  const percentage = Math.round((score / 20) * 100);
  let status = 'Moderate';
  let feedback = '';

  if (percentage >= 80) {
    status = 'Excellent';
    feedback = `Impactful bullet points featuring ${verbsFound.size} strong action verbs and ${quantifiedMetricsCount} quantified outcome metrics.`;
  } else if (percentage >= 50) {
    status = 'Strong';
    feedback = `Good experience layout, but could be elevated by replacing passive language with strong action verbs and measurable performance figures.`;
  } else {
    status = 'Needs Improvement';
    feedback = `Experience lacks measurable business impact. Add percentage growth, latency reductions, or scale metrics to your bullet points.`;
  }

  return {
    score,
    maxScore: 20,
    percentage,
    status,
    feedback,
    actionVerbsCount: verbsFound.size,
    actionVerbs: Array.from(verbsFound).slice(0, 10),
    quantifiedMetricsCount,
    hasExperienceSection: hasExpSection,
  };
}

/**
 * 4. Project Relevance Category (Max: 15 pts)
 */
function evaluateProjects(resumeText, segmented) {
  let score = 0;
  const hasProjectsSection = segmented.detectedSections.includes('projects');
  if (hasProjectsSection) score += 6;

  // Check for repo / live demo links in projects or whole resume
  const hasRepoLinks = /github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|gitlab\.com\/|bitbucket\.org\/|https?:\/\/[a-zA-Z0-9.-]+\.vercel\.app|https?:\/\/[a-zA-Z0-9.-]+\.netlify\.app/i.test(resumeText);
  if (hasRepoLinks) score += 4;

  // Project depth: word count in projects section or project keywords
  const projectContent = segmented.sections.projects || '';
  const projectWords = projectContent.split(/\s+/).filter(Boolean).length;
  if (projectWords >= 60) score += 5;
  else if (projectWords >= 25 || (!hasProjectsSection && /built|developed|created\s+an?\s+application/i.test(resumeText))) score += 3;

  const percentage = Math.round((score / 15) * 100);
  let status = 'Moderate';
  let feedback = '';

  if (percentage >= 80) {
    status = 'Excellent';
    feedback = `Outstanding technical projects showcasing applied skills with verifiable code repository/demo links.`;
  } else if (percentage >= 50) {
    status = 'Strong';
    feedback = `Projects are present. Include live deployment links and GitHub repositories to provide proof of execution.`;
  } else {
    status = 'Needs Improvement';
    feedback = `Add a dedicated Projects section highlighting real-world applications, tech stacks utilized, and GitHub links.`;
  }

  return {
    score,
    maxScore: 15,
    percentage,
    status,
    feedback,
    hasProjectsSection,
    hasRepoLinks,
  };
}

/**
 * 5. ATS Formatting & Compatibility Category (Max: 10 pts)
 */
function evaluateAts(resumeText, segmented, metrics) {
  let score = 0;
  const contact = extractContactInfo(resumeText);

  // Complete contact data (email + phone + link)
  if (contact.email) score += 2;
  if (contact.phone) score += 1;
  if (contact.linkedin || contact.github || contact.portfolio) score += 1;

  // Standard section header structure
  const standardSectionsCount = segmented.detectedSections.length;
  if (standardSectionsCount >= 4) score += 3;
  else if (standardSectionsCount >= 2) score += 2;

  // Healthy word count for 1-2 page resume (300 - 1000 words)
  if (metrics.wordCount >= 300 && metrics.wordCount <= 1200) score += 2;
  else if (metrics.wordCount > 150) score += 1;

  // Sentence length readability
  if (metrics.avgSentenceLengthWords >= 10 && metrics.avgSentenceLengthWords <= 28) score += 1;

  score = Math.min(10, score);
  const percentage = Math.round((score / 10) * 100);

  let status = 'Excellent';
  let feedback = '';

  if (percentage >= 80) {
    status = 'Excellent';
    feedback = `Clean ATS-compliant document layout with standard section headers, parseable contact metadata, and optimal length.`;
  } else if (percentage >= 60) {
    status = 'Strong';
    feedback = `Good parseability. Ensure email, phone, and standard section headers (Experience, Education, Skills) are clearly distinct.`;
  } else {
    status = 'Needs Improvement';
    feedback = `ATS parsing risks detected. Ensure standard section titles and clear contact details are at the top of the resume.`;
  }

  return {
    score,
    maxScore: 10,
    percentage,
    status,
    feedback,
    detectedSections: segmented.detectedSections,
    contactDataFound: {
      email: Boolean(contact.email),
      phone: Boolean(contact.phone),
      links: Boolean(contact.linkedin || contact.github || contact.portfolio),
    },
  };
}

/**
 * 6. Education & Certifications Category (Max: 10 pts)
 */
function evaluateEducation(resumeText, segmented) {
  let score = 0;
  const hasEduSection = segmented.detectedSections.includes('education');
  if (hasEduSection) score += 4;

  // Degree detection
  const hasDegree = /bachelor|master|phd|b\.s\.|m\.s\.|b\.tech|m\.tech|b\.e\.|m\.e\.|computer\s*science|engineering|information\s*technology/i.test(resumeText);
  if (hasDegree) score += 3;

  // Certifications detection
  const hasCertSection = segmented.detectedSections.includes('certifications');
  const hasCertKeywords = /certified|aws\s*certified|kubernetes\s*administrator|cka|ckad|pmp|comptia|azure\s*solutions\s*architect|gcp\s*professional/i.test(resumeText);
  if (hasCertSection || hasCertKeywords) score += 3;

  score = Math.min(10, score);
  const percentage = Math.round((score / 10) * 100);

  let status = 'Moderate';
  let feedback = '';

  if (percentage >= 80) {
    status = 'Excellent';
    feedback = `Strong educational background and industry certifications validating your technical expertise.`;
  } else if (percentage >= 50) {
    status = 'Strong';
    feedback = `Education is documented. Adding industry certifications (e.g. AWS, Kubernetes, GCP) will boost credibility.`;
  } else {
    status = 'Needs Improvement';
    feedback = `Academic credentials or relevant certifications are minimally represented.`;
  }

  return {
    score,
    maxScore: 10,
    percentage,
    status,
    feedback,
    hasEducationSection: hasEduSection,
    hasDegreeIdentified: hasDegree,
  };
}

/**
 * Master Explainable Resume Scoring Function
 *
 * @param {string} resumeText
 * @param {string} jobDescription
 * @returns {{
 *   totalScore: number,
 *   grade: string,
 *   summary: string,
 *   breakdown: {
 *     skills: Object,
 *     keywords: Object,
 *     experience: Object,
 *     projects: Object,
 *     ats: Object,
 *     education: Object,
 *     // Backwards-compatible legacy breakdown fields
 *     contentDepth?: Object,
 *     readability?: Object,
 *     sections?: Object
 *   },
 *   metrics: Object,
 *   contact: Object,
 *   scoredAt: string
 * }}
 */
export function scoreResume(resumeText, jobDescription) {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    throw new Error('resumeText is required for scoring.');
  }

  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
    throw new Error('jobDescription is required for scoring.');
  }

  const cleanResume = normalizeText(resumeText);
  const cleanJd = normalizeText(jobDescription);

  const segmented = segmentSections(cleanResume);
  const metrics = extractDocumentMetrics(cleanResume);
  const contact = extractContactInfo(cleanResume);

  // 6 Evaluator Pillars
  const skillsPillar = evaluateSkills(cleanResume, cleanJd, segmented);
  const keywordsPillar = evaluateKeywords(cleanResume, cleanJd);
  const experiencePillar = evaluateExperience(cleanResume, segmented);
  const projectsPillar = evaluateProjects(cleanResume, segmented);
  const atsPillar = evaluateAts(cleanResume, segmented, metrics);
  const educationPillar = evaluateEducation(cleanResume, segmented);

  const totalScore = Math.min(
    100,
    skillsPillar.score +
    keywordsPillar.score +
    experiencePillar.score +
    projectsPillar.score +
    atsPillar.score +
    educationPillar.score
  );

  const grade = deriveGrade(totalScore);

  let summary = '';
  if (totalScore >= 85) {
    summary = `Excellent Match (${totalScore}/100 — Grade ${grade}): Outstanding alignment with target role across technical skills, experience impact, and ATS structure.`;
  } else if (totalScore >= 70) {
    summary = `Strong Match (${totalScore}/100 — Grade ${grade}): Solid qualifications for this role with actionable opportunities to close minor skill gaps and boost quantified bullet impact.`;
  } else if (totalScore >= 55) {
    summary = `Moderate Match (${totalScore}/100 — Grade ${grade}): Foundational alignment present, but requires targeted keyword optimization and additional project/skill evidence.`;
  } else {
    summary = `Low Match (${totalScore}/100 — Grade ${grade}): Significant gap between resume competencies and target job requirements. Target recommended skills to improve viability.`;
  }

  return {
    totalScore,
    grade,
    summary,
    breakdown: {
      skills: skillsPillar,
      keywords: keywordsPillar,
      experience: experiencePillar,
      projects: projectsPillar,
      ats: atsPillar,
      education: educationPillar,

      // Legacy backwards-compatibility properties for existing frontend views
      sections: {
        score: Math.round((segmented.detectedSections.length / 5) * 20),
        maxScore: 20,
        found: segmented.detectedSections,
      },
      contentDepth: {
        score: Math.min(20, Math.round((metrics.wordCount / 500) * 20)),
        maxScore: 20,
        wordCount: metrics.wordCount,
      },
      readability: {
        score: atsPillar.score,
        maxScore: 10,
        avgSentenceLength: metrics.avgSentenceLengthWords,
      },
    },
    metrics,
    contact,
    scoredAt: new Date().toISOString(),
  };
}
