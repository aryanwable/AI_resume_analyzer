import { Router } from 'express';
import { uploadResume } from '../controllers/resumeController.js';
import {
  scoreResumeHandler,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysisById,
} from '../controllers/scoreController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadSingleResume } from '../middleware/uploadMiddleware.js';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// POST /api/resumes/upload  — multipart PDF upload + text extraction
router.post('/upload', uploadSingleResume, uploadResume);

// POST /api/resumes/score   — deterministic scoring & auto-history persistence
router.post('/score', scoreResumeHandler);

// GET  /api/resumes/history       — fetch user's past resume analysis reports
router.get('/history', getAnalysisHistory);

// GET  /api/resumes/history/:id   — get specific analysis detail
router.get('/history/:id', getAnalysisById);

// DELETE /api/resumes/history/:id — delete specific analysis from archive
router.delete('/history/:id', deleteAnalysisById);

export default router;
