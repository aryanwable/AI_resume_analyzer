/**
 * Advanced Text Preprocessing & Document Analysis Pipeline
 *
 * Provides high-performance text normalization, section segmentation,
 * sentence/word tokenization with technology term preservation, and
 * metadata extraction (contact details, metrics).
 */

// ---------------------------------------------------------------------------
// Stopwords List (Common English stopwords + resume noise words)
// ---------------------------------------------------------------------------
export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t',
  'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is',
  'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should',
  'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d',
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom',
  'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  'also', 'etc', 'via', 'using', 'used', 'well', 'within', 'per', 'across'
]);

// ---------------------------------------------------------------------------
// Standard Resume Section Header Regexes (strict section header matching)
// ---------------------------------------------------------------------------
export const SECTION_PATTERNS = [
  {
    key: 'summary',
    label: 'Professional Summary',
    regex: /^(?:professional\s+|career\s+|executive\s+)?(?:summary|profile|overview|objective|about\s*me)(?:\s*(?:statement|section))?$/i,
  },
  {
    key: 'experience',
    label: 'Work Experience',
    regex: /^(?:work|professional|career|relevant|industry)?\s*(?:experience|employment|work\s*history|history|internships?)(?:\s*(?:details|history))?$/i,
  },
  {
    key: 'education',
    label: 'Education & Academics',
    regex: /^(?:education|academic\s*background|academic\s*history|academics|qualifications|educational\s*qualifications)$/i,
  },
  {
    key: 'skills',
    label: 'Skills & Competencies',
    regex: /^(?:technical\s+|core\s+|key\s+)?(?:skills|technologies|tech\s*stack|tools|competencies|areas\s*of\s*expertise|expertise)$/i,
  },
  {
    key: 'projects',
    label: 'Projects & Portfolio',
    regex: /^(?:technical\s+|key\s+|personal\s+|academic\s+)?(?:projects?|portfolio|open\s*source|case\s*studies)$/i,
  },
  {
    key: 'certifications',
    label: 'Certifications & Licenses',
    regex: /^(?:certifications?|licenses?|credentials?|courses?|professional\s*certifications?|licenses?\s*&\s*certifications?)$/i,
  },
  {
    key: 'awards',
    label: 'Honors & Awards',
    regex: /^(?:honors?|awards?|achievements?|accomplishments?|recognition|fellowships?)$/i,
  },
  {
    key: 'publications',
    label: 'Publications & Research',
    regex: /^(?:publications?|research(?:\s*papers?)?|patents?|presentations?)$/i,
  },
  {
    key: 'contact',
    label: 'Contact Information',
    regex: /^(?:contact(?:\s*information|\s*details)?|personal\s*details)$/i,
  },
];

/**
 * Normalizes raw text by cleaning smart quotes, bullets, strange unicode,
 * and normalizing whitespace while keeping line formatting.
 *
 * @param {string} text - Raw input text
 * @returns {string} Cleaned normalized text
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    // Replace non-breaking spaces and zero-width spaces
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    // Replace smart single quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Replace smart double quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Replace en-dash, em-dash, horizontal bar
    .replace(/[\u2013\u2014\u2015]/g, '-')
    // Replace diverse bullet characters with standard dash
    .replace(/[•\u2022\u2023\u25E6\u2043\u2219▪\u25AA\u25AB►\u25BA\u25C6●\u25CF\u25CB\u25D8➤\u27A2➔\u2794✓\u2713✔\u2714☑\u2611]/g, '- ')
    // Remove control characters except tab and newline
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize excessive horizontal spacing
    .replace(/[ \t]+/g, ' ')
    // Normalize lines where bullet dash got an extra space
    .replace(/^\s*-\s+/gm, '- ')
    // Normalize excessive newlines
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Tokenizes text into individual sentences, respecting common abbreviations,
 * numbers, URLs, and bullet points.
 *
 * @param {string} text
 * @returns {string[]} List of sentences
 */
export function tokenizeSentences(text) {
  if (!text || typeof text !== 'string') return [];

  const clean = normalizeText(text);
  if (!clean) return [];

  // Protect common abbreviations and numbers
  const protectedText = clean
    .replace(/\b(e\.g\.|i\.e\.|etc\.|vs\.|inc\.|corp\.|ltd\.|mr\.|mrs\.|ms\.|dr\.|prof\.|sr\.|jr\.|dept\.|approx\.|est\.)/gi, (match) =>
      match.replace(/\./g, '__DOT__')
    )
    .replace(/(\d+)\.(\d+)/g, '$1__DOT__$2') // Decimal numbers
    .replace(/(https?:\/\/|www\.)\S+/gi, (match) =>
      match.replace(/\./g, '__DOT__') // URLs
    );

  // Split on newlines, bullet points, or sentence terminals (. ! ?) followed by whitespace
  const rawSentences = protectedText.split(/(?:[\r\n]+|\.\s+|\!\s+|\?\s+)/);

  return rawSentences
    .map((s) => s.replace(/__DOT__/g, '.').replace(/^[-*•\s]+/, '').trim())
    .filter((s) => s.length > 3);
}

/**
 * Tokenizes text into words/terms, optionally removing stopwords and preserving tech tokens.
 *
 * @param {string} text
 * @param {Object} [options]
 * @param {boolean} [options.removeStopwords=true]
 * @param {boolean} [options.lowercase=true]
 * @param {number} [options.minWordLength=2]
 * @returns {string[]} Array of token strings
 */
export function tokenizeWords(text, options = {}) {
  const {
    removeStopwords = true,
    lowercase = true,
    minWordLength = 2,
  } = options;

  if (!text || typeof text !== 'string') return [];

  let processed = text;
  if (lowercase) {
    processed = processed.toLowerCase();
  }

  const tokens = [];

  // Priority tokenization regex that captures special tech tokens FIRST, then standard words
  const tokenRegex = /c\+\+|c\#|\.net|ci\/cd|tcp\/ip|node\.js|vue\.js|react\.js|next\.js|angular\.js|express\.js|three\.js|d3\.js|[a-z0-9]+(?:\.[a-z0-9]+)+|\b[a-z0-9]+\b/gi;
  const matches = processed.match(tokenRegex) || [];

  for (const m of matches) {
    const token = lowercase ? m.toLowerCase() : m;
    if (token.length < minWordLength && !['c', 'r', 'go', 'ai', 'ui', 'ux'].includes(token)) {
      continue;
    }
    if (removeStopwords && STOPWORDS.has(token)) {
      continue;
    }
    tokens.push(token);
  }

  return tokens;
}

/**
 * Segments a resume or job description into semantic sections.
 *
 * @param {string} text - Full text of resume
 * @returns {{
 *   sections: Object<string, string>,
 *   detectedSections: string[],
 *   sectionCount: number
 * }}
 */
export function segmentSections(text) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return { sections: {}, detectedSections: [], sectionCount: 0 };
  }

  const lines = normalized.split('\n');
  const sections = {
    contact: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    certifications: '',
    awards: '',
    publications: '',
    other: '',
  };

  const detectedSections = [];
  let currentSection = 'other';
  let isFirstLines = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line is a section header
    const cleanHeader = line
      .replace(/^[\d\.\-\*#\s]+/, '')
      .replace(/[:\-_|]+$/, '')
      .trim();

    let matchedKey = null;
    if (cleanHeader.length <= 50 && !cleanHeader.includes('.')) {
      for (const section of SECTION_PATTERNS) {
        if (section.regex.test(cleanHeader)) {
          matchedKey = section.key;
          break;
        }
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
      if (!detectedSections.includes(matchedKey)) {
        detectedSections.push(matchedKey);
      }
      isFirstLines = false;
      continue;
    }

    // Top lines heuristic before any section
    if (isFirstLines && currentSection === 'other' && i < 6) {
      if (/@|github\.com|linkedin\.com|\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/i.test(line)) {
        if (!detectedSections.includes('contact')) {
          detectedSections.push('contact');
        }
        sections.contact = (sections.contact ? sections.contact + '\n' : '') + line;
        continue;
      }
    } else {
      isFirstLines = false;
    }

    // Append to current section
    sections[currentSection] = (sections[currentSection] ? sections[currentSection] + '\n' : '') + line;
  }

  return {
    sections,
    detectedSections,
    sectionCount: detectedSections.length,
  };
}

/**
 * Extracts candidate contact information and links from text.
 *
 * @param {string} text
 * @returns {{
 *   email: string|null,
 *   phone: string|null,
 *   linkedin: string|null,
 *   github: string|null,
 *   portfolio: string|null,
 *   candidateName: string|null
 * }}
 */
export function extractContactInfo(text) {
  if (!text || typeof text !== 'string') {
    return { email: null, phone: null, linkedin: null, github: null, portfolio: null, candidateName: null };
  }

  const normalized = normalizeText(text);

  // Email regex
  const emailMatch = normalized.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0].toLowerCase() : null;

  // Phone regex (International, US, Indian, UK formats)
  const phoneMatch = normalized.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\+?\d{10,13}\b/);
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  // LinkedIn regex
  const linkedinMatch = normalized.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : null;

  // GitHub regex
  const githubMatch = normalized.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : null;

  // Portfolio / Website URL
  const allUrls = normalized.match(/https?:\/\/[^\s/$.?#].[^\s]*/gi) || [];
  let portfolio = null;
  for (const url of allUrls) {
    if (!/linkedin\.com|github\.com/i.test(url)) {
      portfolio = url;
      break;
    }
  }

  // Name heuristic: 1st line if it's 2-4 words, capitalized, not an email/URL/header
  let candidateName = null;
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    const isNotHeaderOrContact = !SECTION_PATTERNS.some((p) => p.regex.test(firstLine)) &&
      !/@|github\.com|linkedin\.com|http/i.test(firstLine) &&
      firstLine.length < 50;

    const words = firstLine.split(/\s+/);
    if (isNotHeaderOrContact && words.length >= 2 && words.length <= 5) {
      candidateName = firstLine;
    }
  }

  return {
    email,
    phone,
    linkedin,
    github,
    portfolio,
    candidateName,
  };
}

/**
 * Computes deep document statistics and readability metrics.
 *
 * @param {string} text
 * @returns {{
 *   characterCount: number,
 *   wordCount: number,
 *   sentenceCount: number,
 *   paragraphCount: number,
 *   avgSentenceLengthWords: number,
 *   avgWordLengthChars: number,
 *   estimatedReadingTimeMinutes: number
 * }}
 */
export function extractDocumentMetrics(text) {
  if (!text || typeof text !== 'string') {
    return {
      characterCount: 0,
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      avgSentenceLengthWords: 0,
      avgWordLengthChars: 0,
      estimatedReadingTimeMinutes: 0,
    };
  }

  const normalized = normalizeText(text);
  const characterCount = normalized.length;
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  const sentences = tokenizeSentences(normalized);
  const sentenceCount = Math.max(sentences.length, 1);

  const paragraphs = normalized.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = Math.max(paragraphs.length, 1);

  const avgSentenceLengthWords = Number((wordCount / sentenceCount).toFixed(1));
  const totalCharsInWords = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLengthChars = wordCount > 0 ? Number((totalCharsInWords / wordCount).toFixed(1)) : 0;
  const estimatedReadingTimeMinutes = Number((wordCount / 200).toFixed(1));

  return {
    characterCount,
    wordCount,
    sentenceCount,
    paragraphCount,
    avgSentenceLengthWords,
    avgWordLengthChars,
    estimatedReadingTimeMinutes,
  };
}
