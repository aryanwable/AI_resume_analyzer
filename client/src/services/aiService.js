import api from './api.js';

/**
 * Rewrites a resume bullet point using AI action verbs and structured impact.
 * @param {string} bulletText
 * @param {string} [targetRole='Software Engineer']
 * @returns {Promise<any>}
 */
export const rewriteBulletPoint = async (bulletText, targetRole = 'Software Engineer') => {
  const response = await api.post('/ai/rewrite-bullet', { bulletText, targetRole });
  return response.data;
};

/**
 * Generates an executive career summary tailored to a target role.
 * @param {string} resumeText
 * @param {string} [targetRole='Software Engineer']
 * @returns {Promise<any>}
 */
export const generateSummary = async (resumeText, targetRole = 'Software Engineer') => {
  const response = await api.post('/ai/generate-summary', { resumeText, targetRole });
  return response.data;
};

/**
 * Recommends best-fit career tracks based on resume competencies.
 * @param {string} resumeText
 * @returns {Promise<any>}
 */
export const recommendRoles = async (resumeText) => {
  const response = await api.post('/ai/recommend-roles', { resumeText });
  return response.data;
};
