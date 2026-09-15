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
 * Score extracted resume text against a target job description
 * @param {string} resumeText - Extracted plain text
 * @param {string} jobDescription - Target job description text
 * @returns {Promise<Object>} - Structured score, grade, and category breakdown
 */
export const scoreResumeText = async (resumeText, jobDescription) => {
  const response = await api.post('/resumes/score', {
    resumeText,
    jobDescription,
  });
  return response.data;
};

export default {
  uploadResumeFile,
  scoreResumeText,
};
