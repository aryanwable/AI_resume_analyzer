import { scoreResume } from '../services/resumeScorer.js';
import { generateAiAdvice } from '../services/aiAdvisor.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import mongoose from 'mongoose';

/**
 * Check if MongoDB is currently connected
 */
const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * POST /api/resumes/score
 *
 * Body: { resumeText, jobDescription, fileName, fileSizeBytes, fileSizeFormatted, jobRole, metrics, saveToHistory }
 */
export const scoreResumeHandler = async (req, res, next) => {
  try {
    const {
      resumeText,
      jobDescription,
      fileName,
      fileSizeBytes,
      fileSizeFormatted,
      jobRole,
      metrics,
      saveToHistory = true,
    } = req.body;

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

    // 1. Calculate deterministic score
    const scoreResult = scoreResume(resumeText.trim(), jobDescription.trim());

    // 2. Generate AI resume feedback & bullet rewrites
    const aiAdvice = await generateAiAdvice(
      resumeText.trim(),
      jobDescription.trim(),
      scoreResult
    );

    let savedRecord = null;

    // 3. Persist to MongoDB history if available and requested
    if (saveToHistory && isMongoConnected() && req.user?.id) {
      try {
        savedRecord = await ResumeAnalysis.create({
          userId: req.user.id,
          fileName: fileName || 'Uploaded_Resume.pdf',
          fileSizeBytes: fileSizeBytes || resumeText.length,
          fileSizeFormatted: fileSizeFormatted || `${Math.round(resumeText.length / 1024)} KB`,
          jobRole: jobRole || 'Target Role Analysis',
          jobDescription: jobDescription.trim(),
          extractedText: resumeText.trim(),
          metrics: {
            wordCount: metrics?.wordCount || scoreResult.breakdown.contentDepth.wordCount,
            charCount: metrics?.charCount || resumeText.length,
            pageCount: metrics?.pageCount || 1,
            pdfVersion: metrics?.pdfVersion || 'unknown',
          },
          score: scoreResult,
          aiAdvice,
        });
      } catch (dbErr) {
        // Non-blocking: If DB write fails, still return computed score
        console.error('[ScoreController] History persist error:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resume scored and analyzed successfully.',
      data: {
        score: scoreResult,
        aiAdvice,
        analysisId: savedRecord?.id || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes/history
 * Fetch past resume analyses for the authenticated user
 */
export const getAnalysisHistory = async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      return res.status(200).json({
        success: true,
        message: 'Database offline, returning empty history.',
        data: {
          analyses: [],
          total: 0,
        },
      });
    }

    const analyses = await ResumeAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-extractedText'); // Exclude large text blob for performant listings

    return res.status(200).json({
      success: true,
      data: {
        analyses,
        total: analyses.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes/history/:id
 * Fetch single detailed analysis with full extracted text and breakdown
 */
export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid analysis ID format.',
          code: 'INVALID_ID',
        },
      });
    }

    if (!isMongoConnected()) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Database is in offline mode.',
          code: 'DATABASE_OFFLINE',
        },
      });
    }

    const analysis = await ResumeAnalysis.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Analysis record not found.',
          code: 'ANALYSIS_NOT_FOUND',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resumes/history/:id
 * Delete a past analysis record
 */
export const deleteAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid analysis ID format.',
          code: 'INVALID_ID',
        },
      });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Database offline.',
          code: 'DATABASE_OFFLINE',
        },
      });
    }

    const result = await ResumeAnalysis.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Analysis record not found or unauthorized.',
          code: 'ANALYSIS_NOT_FOUND',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Analysis record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  scoreResumeHandler,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysisById,
};
