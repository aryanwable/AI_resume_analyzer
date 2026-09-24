/**
 * AI Career Tools Controller
 *
 * Exposes specialized AI features: bullet point rewriter, executive summary generator,
 * and intelligent job role recommender.
 */

import {
  rewriteBulletPoint,
  generateProfessionalSummary,
  recommendJobRoles,
} from '../services/aiService.js';

/**
 * Handles POST /api/ai/rewrite-bullet
 */
export async function rewriteBulletHandler(req, res) {
  try {
    const { bulletText, targetRole } = req.body;

    if (!bulletText || typeof bulletText !== 'string' || bulletText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BULLET_TEXT_REQUIRED',
          message: 'bulletText is required for rewriting.',
        },
      });
    }

    const result = await rewriteBulletPoint(bulletText, targetRole || 'Software Engineer');

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'BULLET_REWRITE_FAILED',
        message: error.message || 'Failed to rewrite bullet point.',
      },
    });
  }
}

/**
 * Handles POST /api/ai/generate-summary
 */
export async function generateSummaryHandler(req, res) {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RESUME_TEXT_REQUIRED',
          message: 'resumeText is required for summary generation.',
        },
      });
    }

    const result = await generateProfessionalSummary(resumeText, targetRole || 'Software Engineer');

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SUMMARY_GENERATION_FAILED',
        message: error.message || 'Failed to generate professional summary.',
      },
    });
  }
}

/**
 * Handles POST /api/ai/recommend-roles
 */
export async function recommendRolesHandler(req, res) {
  try {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RESUME_TEXT_REQUIRED',
          message: 'resumeText is required for role recommendations.',
        },
      });
    }

    const result = await recommendJobRoles(resumeText);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ROLE_RECOMMENDATION_FAILED',
        message: error.message || 'Failed to recommend job roles.',
      },
    });
  }
}
