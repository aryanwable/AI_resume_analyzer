/**
 * AI Career Tools Routes
 *
 * Mounts endpoints for bullet rewriter, summary generator, and role recommendations.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  rewriteBulletHandler,
  generateSummaryHandler,
  recommendRolesHandler,
} from '../controllers/aiController.js';

const router = Router();

// All AI operations require authentication
router.use(authenticate);

router.post('/rewrite-bullet', rewriteBulletHandler);
router.post('/generate-summary', generateSummaryHandler);
router.post('/recommend-roles', recommendRolesHandler);

export default router;
