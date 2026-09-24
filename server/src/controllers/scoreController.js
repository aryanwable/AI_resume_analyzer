import mongoose from 'mongoose';
import { scoreResume } from '../services/resumeScorer.js';
import { calculateSemanticSimilarity } from '../services/semanticMatcher.js';
import { analyzeResumeWithAi } from '../services/aiService.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';

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

    // 1. Calculate deterministic 6-pillar score
    const scoreResult = scoreResume(resumeText.trim(), jobDescription.trim());

    // 2. Calculate semantic conceptual similarity
    const semanticMatch = await calculateSemanticSimilarity(
      resumeText.trim(),
      jobDescription.trim()
    );

    // 3. Generate AI resume feedback, career advice, and role recommendations
    const aiAdvice = await analyzeResumeWithAi(
      resumeText.trim(),
      jobDescription.trim(),
      scoreResult,
      semanticMatch
    );

    let savedRecord = null;

    // 4. Persist to MongoDB history if requested and database is available
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
            wordCount: metrics?.wordCount || scoreResult.metrics?.wordCount || 0,
            characterCount: metrics?.charCount || scoreResult.metrics?.characterCount || resumeText.length,
            sentenceCount: scoreResult.metrics?.sentenceCount || 1,
            paragraphCount: scoreResult.metrics?.paragraphCount || 1,
            avgSentenceLengthWords: scoreResult.metrics?.avgSentenceLengthWords || 0,
            estimatedReadingTimeMinutes: scoreResult.metrics?.estimatedReadingTimeMinutes || 0,
            pdfVersion: metrics?.pdfVersion || 'unknown',
          },
          score: scoreResult,
          semanticMatch,
          aiAdvice,
        });
      } catch (dbErr) {
        console.error('[ScoreController] History persist error:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resume scored and analyzed successfully.',
      data: {
        score: scoreResult,
        semanticMatch,
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
 * Retrieves the current authenticated user's past resume analysis summaries.
 */
export const getAnalysisHistoryHandler = async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      return res.status(200).json({
        success: true,
        message: 'History storage is offline.',
        data: { analyses: [], total: 0 },
      });
    }

    const analyses = await ResumeAnalysis.find({ userId: req.user.id })
      .select('-extractedText') // Exclude raw text payload for efficiency
      .sort({ createdAt: -1 })
      .limit(50);

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
 * Retrieves a single complete analysis by ID for the authenticated owner.
 */
export const getAnalysisByIdHandler = async (req, res, next) => {
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
          message: 'Database service is currently unavailable.',
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
          message: 'Analysis record not found or does not belong to you.',
          code: 'NOT_FOUND',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resumes/history/:id
 * Deletes an analysis record owned by the authenticated user.
 */
export const deleteAnalysisHandler = async (req, res, next) => {
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
          message: 'Database service is currently unavailable.',
          code: 'DATABASE_OFFLINE',
        },
      });
    }

    const deleted = await ResumeAnalysis.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Analysis record not found or does not belong to you.',
          code: 'NOT_FOUND',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Analysis record removed successfully.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

// Aliases for compatibility
export const getAnalysisHistory = getAnalysisHistoryHandler;
export const getAnalysisById = getAnalysisByIdHandler;
export const deleteAnalysisById = deleteAnalysisHandler;

