import { Router } from 'express';
import { uploadResume } from '../controllers/resumeController.js';
import { scoreResumeHandler } from '../controllers/scoreController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadSingleResume } from '../middleware/uploadMiddleware.js';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// POST /api/resumes/upload  — multipart PDF upload + text extraction
router.post('/upload', uploadSingleResume, uploadResume);

// POST /api/resumes/score   — deterministic scoring against a job description
router.post('/score', scoreResumeHandler);

export default router;

