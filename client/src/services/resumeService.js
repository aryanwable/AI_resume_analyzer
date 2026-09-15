import api from './api.js';

/**
 * Upload resume PDF file (multipart/form-data)
 * @param {File} file - PDF resume file
 * @returns {Promise<Object>} - Server response with metadata & extracted text
 */
export const uploadResumeFile = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Score extracted resume text against a target job description and persist to history
 * @param {Object} payload - { resumeText, jobDescription, fileName, fileSizeBytes, fileSizeFormatted, jobRole, metrics }
 * @returns {Promise<Object>} - Structured score, grade, and category breakdown
 */
export const scoreResumeText = async (payload) => {
  // Support both legacy (text, jd) and structured payload objects
  const body = typeof payload === 'string'
    ? { resumeText: arguments[0], jobDescription: arguments[1] }
    : payload;

  const response = await api.post('/resumes/score', body);
  return response.data;
};

/**
 * Fetch past resume analyses for current user
 * @returns {Promise<Object>} - { analyses, total }
 */
export const getAnalysisHistory = async () => {
  const response = await api.get('/resumes/history');
  return response.data;
};

/**
 * Fetch detailed analysis by ID
 * @param {string} id - Analysis document ID
 * @returns {Promise<Object>} - Detailed analysis object
 */
export const getAnalysisById = async (id) => {
  const response = await api.get(`/resumes/history/${id}`);
  return response.data;
};

/**
 * Delete a past analysis by ID
 * @param {string} id - Analysis document ID
 * @returns {Promise<Object>} - Success status
 */
export const deleteAnalysisById = async (id) => {
  const response = await api.delete(`/resumes/history/${id}`);
  return response.data;
};

export default {
  uploadResumeFile,
  scoreResumeText,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysisById,
};
