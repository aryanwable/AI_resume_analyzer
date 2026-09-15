import { scoreResume } from '../services/resumeScorer.js';

/**
 * POST /api/resumes/score
 *
 * Body: { resumeText: string, jobDescription: string }
 *
 * Runs the deterministic scoring engine and returns a structured score
 * breakdown. Does NOT require a file upload — works on already-extracted text.
 */
export const scoreResumeHandler = (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'resumeText is required and must be a non-empty string.',
          code: 'RESUME_TEXT_MISSING',
        },
      });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'jobDescription is required and must be a non-empty string.',
          code: 'JOB_DESCRIPTION_MISSING',
        },
      });
    }

    const result = scoreResume(resumeText.trim(), jobDescription.trim());

    return res.status(200).json({
      success: true,
      message: 'Resume scored successfully.',
      data: {
        score: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { scoreResumeHandler };
