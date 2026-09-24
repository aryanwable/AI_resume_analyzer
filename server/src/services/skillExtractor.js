/**
 * Comprehensive Skill Extraction & Taxonomy Engine
 *
 * Extracts, normalizes, and categorizes technical and soft skills from resumes
 * and job descriptions using taxonomy databases, alias normalization, and boundary-safe matching.
 */

import { normalizeText, segmentSections } from './textPreprocessor.js';

// ---------------------------------------------------------------------------
// Skill Taxonomy Database
// ---------------------------------------------------------------------------
export const SKILL_TAXONOMY = {
  languages: [
    { name: 'JavaScript', aliases: ['javascript', 'js', 'ecmascript'] },
    { name: 'TypeScript', aliases: ['typescript', 'ts'] },
    { name: 'Python', aliases: ['python', 'py'] },
    { name: 'Java', aliases: ['java'], exactOnly: true },
    { name: 'C++', aliases: ['c++', 'cpp'] },
    { name: 'C#', aliases: ['c#', 'csharp'] },
    { name: 'C', aliases: ['c language'], regex: /\bC\b(?!\+\+|\#)/ },
    { name: 'Go', aliases: ['golang'], regex: /\b(?:golang|go\s+programming|go\s+language)\b|\bGo\b(?=\s+(?:developer|engineer|backend|routine|concurrency))/i },
    { name: 'Rust', aliases: ['rustlang', 'rust language'], regex: /\bRust\b(?!\w)/ },
    { name: 'Ruby', aliases: ['ruby'], regex: /\bRuby\b(?!\w)/ },
    { name: 'PHP', aliases: ['php'] },
    { name: 'Swift', aliases: ['swift'], regex: /\bSwift\b(?!\w)/ },
    { name: 'Kotlin', aliases: ['kotlin'] },
    { name: 'SQL', aliases: ['structured query language'], regex: /\bSQL\b/i },
    { name: 'HTML5', aliases: ['html', 'html5'] },
    { name: 'CSS3', aliases: ['css', 'css3'] },
    { name: 'Bash / Shell', aliases: ['bash', 'shell script', 'shell scripting', 'zsh', 'powershell'] },
    { name: 'R', aliases: ['r language', 'r stats'], regex: /\bR\s+programming|\bR\s+language|\bR\s+stats\b/i },
    { name: 'Scala', aliases: ['scala'] },
    { name: 'Dart', aliases: ['dart'] },
    { name: 'Perl', aliases: ['perl'] },
  ],

  frameworks: [
    { name: 'React', aliases: ['react', 'reactjs', 'react.js'] },
    { name: 'Next.js', aliases: ['nextjs', 'next.js', 'next'] },
    { name: 'Vue.js', aliases: ['vue', 'vuejs', 'vue.js'] },
    { name: 'Angular', aliases: ['angular', 'angularjs', 'angular.js'] },
    { name: 'Node.js', aliases: ['node', 'nodejs', 'node.js'] },
    { name: 'Express.js', aliases: ['express', 'expressjs', 'express.js'] },
    { name: 'NestJS', aliases: ['nestjs', 'nest.js'] },
    { name: 'Django', aliases: ['django'] },
    { name: 'FastAPI', aliases: ['fastapi', 'fast-api'] },
    { name: 'Flask', aliases: ['flask'] },
    { name: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring framework'] },
    { name: 'ASP.NET', aliases: ['asp.net', 'aspnet', 'asp.net core', '.net core', 'dotnet'] },
    { name: 'Ruby on Rails', aliases: ['ruby on rails', 'rails', 'ror'] },
    { name: 'Laravel', aliases: ['laravel'] },
    { name: 'Flutter', aliases: ['flutter'] },
    { name: 'React Native', aliases: ['react native', 'react-native'] },
    { name: 'Svelte', aliases: ['svelte', 'sveltekit'] },
    { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'] },
    { name: 'Bootstrap', aliases: ['bootstrap'] },
    { name: 'Redux', aliases: ['redux', 'redux toolkit', 'rtk'] },
  ],

  databases: [
    { name: 'PostgreSQL', aliases: ['postgres', 'postgresql', 'psql'] },
    { name: 'MongoDB', aliases: ['mongo', 'mongodb'] },
    { name: 'MySQL', aliases: ['mysql'] },
    { name: 'Redis', aliases: ['redis'] },
    { name: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search'] },
    { name: 'Amazon DynamoDB', aliases: ['dynamodb', 'dynamo db'] },
    { name: 'Oracle Database', aliases: ['oracle db', 'oracle sql'] },
    { name: 'SQLite', aliases: ['sqlite', 'sqlite3'] },
    { name: 'Cassandra', aliases: ['cassandra', 'apache cassandra'] },
    { name: 'Neo4j', aliases: ['neo4j'] },
    { name: 'Firebase', aliases: ['firebase', 'firestore'] },
    { name: 'Supabase', aliases: ['supabase'] },
    { name: 'Prisma ORM', aliases: ['prisma', 'prisma orm'] },
    { name: 'Mongoose ODM', aliases: ['mongoose', 'mongoose odm'] },
  ],

  cloud: [
    { name: 'Amazon Web Services (AWS)', aliases: ['aws', 'amazon web services', 'amazon aws', 'ec2', 's3', 'lambda', 'cloudformation'] },
    { name: 'Google Cloud Platform (GCP)', aliases: ['gcp', 'google cloud', 'google cloud platform', 'bigquery', 'cloud run', 'gke'] },
    { name: 'Microsoft Azure', aliases: ['azure', 'microsoft azure', 'azure devops', 'azure functions'] },
    { name: 'Cloudflare', aliases: ['cloudflare', 'cloudflare workers'] },
    { name: 'Vercel', aliases: ['vercel'] },
    { name: 'Heroku', aliases: ['heroku'] },
    { name: 'DigitalOcean', aliases: ['digitalocean', 'digital ocean'] },
    { name: 'Netlify', aliases: ['netlify'] },
    { name: 'Terraform', aliases: ['terraform', 'tf'] },
  ],

  devops: [
    { name: 'Docker', aliases: ['docker', 'dockerfile', 'docker-compose', 'containerization'] },
    { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
    { name: 'CI/CD Pipelines', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'] },
    { name: 'GitHub Actions', aliases: ['github actions', 'gh actions'] },
    { name: 'GitLab CI', aliases: ['gitlab ci', 'gitlab-ci'] },
    { name: 'Jenkins', aliases: ['jenkins'] },
    { name: 'Ansible', aliases: ['ansible'] },
    { name: 'Linux Administration', aliases: ['linux', 'unix', 'ubuntu', 'debian', 'centos', 'redhat'] },
    { name: 'Nginx', aliases: ['nginx'] },
    { name: 'Prometheus', aliases: ['prometheus'] },
    { name: 'Grafana', aliases: ['grafana'] },
    { name: 'Helm', aliases: ['helm'] },
    { name: 'Serverless', aliases: ['serverless'] },
  ],

  toolsAndProtocols: [
    { name: 'Git', aliases: ['git', 'version control'], regex: /\bGit\b(?!\w)/i },
    { name: 'GitHub', aliases: ['github'] },
    { name: 'GitLab', aliases: ['gitlab'] },
    { name: 'Jira', aliases: ['jira'] },
    { name: 'Postman', aliases: ['postman'] },
    { name: 'Figma', aliases: ['figma'] },
    { name: 'Webpack', aliases: ['webpack'] },
    { name: 'Vite', aliases: ['vite', 'vitejs'] },
    { name: 'Apache Kafka', aliases: ['kafka', 'apache kafka'] },
    { name: 'RabbitMQ', aliases: ['rabbitmq'] },
    { name: 'GraphQL', aliases: ['graphql', 'gql'] },
    { name: 'REST APIs', aliases: ['rest', 'restful', 'rest api', 'rest apis', 'restful apis'] },
    { name: 'Microservices', aliases: ['microservices', 'microservice architecture'] },
    { name: 'gRPC', aliases: ['grpc'] },
    { name: 'WebSockets', aliases: ['websocket', 'websockets', 'socket.io'] },
    { name: 'OAuth 2.0 / JWT', aliases: ['oauth', 'oauth2', 'jwt', 'json web tokens'] },
    { name: 'Jest', aliases: ['jest'] },
    { name: 'PyTest', aliases: ['pytest'] },
    { name: 'Cypress', aliases: ['cypress'] },
  ],

  aiAndData: [
    { name: 'Machine Learning', aliases: ['machine learning', 'ml'] },
    { name: 'Deep Learning', aliases: ['deep learning', 'neural networks'] },
    { name: 'Natural Language Processing (NLP)', aliases: ['nlp', 'natural language processing'] },
    { name: 'Computer Vision', aliases: ['computer vision', 'opencv'] },
    { name: 'TensorFlow', aliases: ['tensorflow', 'tf'] },
    { name: 'PyTorch', aliases: ['pytorch', 'torch'] },
    { name: 'Scikit-Learn', aliases: ['scikit-learn', 'sklearn'] },
    { name: 'Pandas', aliases: ['pandas'] },
    { name: 'NumPy', aliases: ['numpy'] },
    { name: 'Large Language Models (LLMs)', aliases: ['llm', 'llms', 'large language models', 'generative ai', 'genai'] },
    { name: 'OpenAI API', aliases: ['openai', 'chatgpt', 'gpt-4', 'gpt-3'] },
    { name: 'LangChain', aliases: ['langchain'] },
    { name: 'Hugging Face', aliases: ['huggingface', 'hugging face', 'transformers'] },
    { name: 'Retrieval-Augmented Generation (RAG)', aliases: ['rag', 'retrieval augmented generation'] },
    { name: 'Vector Databases', aliases: ['vector database', 'vector db', 'pinecone', 'weaviate', 'chroma', 'qdrant', 'milvus'] },
    { name: 'Data Engineering', aliases: ['data engineering', 'etl', 'data pipelines', 'spark', 'apache spark'] },
  ],

  softSkills: [
    { name: 'Leadership', aliases: ['leadership', 'team lead', 'leading teams', 'managed engineers'] },
    { name: 'Communication', aliases: ['communication', 'technical communication', 'stakeholder management'] },
    { name: 'Problem Solving', aliases: ['problem solving', 'troubleshooting', 'analytical thinking'] },
    { name: 'Agile & Scrum', aliases: ['agile', 'scrum', 'sprint planning', 'kanban'] },
    { name: 'Mentorship', aliases: ['mentorship', 'mentoring', 'coaching'] },
    { name: 'Cross-functional Collaboration', aliases: ['collaboration', 'cross-functional', 'teamwork'] },
    { name: 'Time Management', aliases: ['time management', 'prioritization'] },
    { name: 'Critical Thinking', aliases: ['critical thinking', 'decision making'] },
  ],
};

/**
 * Escapes regex special characters in a string.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compiles search matchers for each skill in taxonomy.
 */
function buildSkillMatcher(skillDef) {
  if (skillDef.regex) {
    return skillDef.regex;
  }

  // Build regex from name and aliases
  const terms = [skillDef.name, ...(skillDef.aliases || [])];
  const sortedTerms = [...new Set(terms)].sort((a, b) => b.length - a.length);

  const patterns = sortedTerms.map((term) => {
    const escaped = escapeRegex(term);
    return `(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`;
  });

  return new RegExp(patterns.join('|'), 'i');
}

// Precompile matchers
const COMPILED_TAXONOMY = [];
for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
  for (const skill of skills) {
    COMPILED_TAXONOMY.push({
      category,
      name: skill.name,
      matcher: buildSkillMatcher(skill),
    });
  }
}

/**
 * Extracts skills from input text and categorizes them.
 *
 * @param {string} text - Raw or normalized resume/job description text
 * @returns {{
 *   allSkills: string[],
 *   totalSkillsCount: number,
 *   categories: Object<string, string[]>,
 *   primaryCategory: string,
 *   categoryDistribution: Object<string, number>
 * }}
 */
export function extractSkills(text) {
  if (!text || typeof text !== 'string') {
    return {
      allSkills: [],
      totalSkillsCount: 0,
      categories: {
        languages: [],
        frameworks: [],
        databases: [],
        cloud: [],
        devops: [],
        toolsAndProtocols: [],
        aiAndData: [],
        softSkills: [],
      },
      primaryCategory: 'general',
      categoryDistribution: {},
    };
  }

  const normalized = normalizeText(text);
  const categories = {
    languages: [],
    frameworks: [],
    databases: [],
    cloud: [],
    devops: [],
    toolsAndProtocols: [],
    aiAndData: [],
    softSkills: [],
  };

  const foundSkillNames = new Set();

  for (const item of COMPILED_TAXONOMY) {
    if (item.matcher.test(normalized)) {
      if (!foundSkillNames.has(item.name)) {
        foundSkillNames.add(item.name);
        if (categories[item.category]) {
          categories[item.category].push(item.name);
        }
      }
    }
  }

  const allSkills = Array.from(foundSkillNames);
  const totalSkillsCount = allSkills.length;

  // Calculate category distribution
  const categoryDistribution = {};
  let maxCount = 0;
  let primaryCategory = 'general';

  for (const [cat, list] of Object.entries(categories)) {
    const count = list.length;
    categoryDistribution[cat] = count;
    if (count > maxCount && cat !== 'softSkills') {
      maxCount = count;
      primaryCategory = cat;
    }
  }

  return {
    allSkills,
    totalSkillsCount,
    categories,
    primaryCategory,
    categoryDistribution,
  };
}

/**
 * Performs a comprehensive skill gap analysis between a candidate's resume and a job description.
 *
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {{
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   extraSkills: string[],
 *   matchPercentage: number,
 *   categoryBreakdown: Object<string, { matched: string[], missing: string[], jdTotal: number }>
 * }}
 */
export function compareSkills(resumeText, jdText) {
  const resumeExtracted = extractSkills(resumeText);
  const jdExtracted = extractSkills(jdText);

  const resumeSkillsSet = new Set(resumeExtracted.allSkills);
  const jdSkillsSet = new Set(jdExtracted.allSkills);

  const matchedSkills = jdExtracted.allSkills.filter((s) => resumeSkillsSet.has(s));
  const missingSkills = jdExtracted.allSkills.filter((s) => !resumeSkillsSet.has(s));
  const extraSkills = resumeExtracted.allSkills.filter((s) => !jdSkillsSet.has(s));

  const matchPercentage = jdExtracted.totalSkillsCount > 0
    ? Math.round((matchedSkills.length / jdExtracted.totalSkillsCount) * 100)
    : (resumeExtracted.totalSkillsCount > 0 ? 100 : 0);

  const categoryBreakdown = {};
  for (const cat of Object.keys(jdExtracted.categories)) {
    const jdCatSkills = jdExtracted.categories[cat] || [];
    const resumeCatSkills = new Set(resumeExtracted.categories[cat] || []);

    const matched = jdCatSkills.filter((s) => resumeCatSkills.has(s));
    const missing = jdCatSkills.filter((s) => !resumeCatSkills.has(s));

    categoryBreakdown[cat] = {
      matched,
      missing,
      jdTotal: jdCatSkills.length,
      coveragePercent: jdCatSkills.length > 0 ? Math.round((matched.length / jdCatSkills.length) * 100) : 100,
    };
  }

  return {
    matchedSkills,
    missingSkills,
    extraSkills,
    matchPercentage,
    totalJdSkills: jdExtracted.totalSkillsCount,
    totalResumeSkills: resumeExtracted.totalSkillsCount,
    categoryBreakdown,
  };
}
