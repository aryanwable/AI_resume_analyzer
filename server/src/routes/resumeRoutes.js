import { Router } from 'express';
import { uploadResume } from '../controllers/resumeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadSingleResume } from '../middleware/uploadMiddleware.js';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// POST /api/resumes/upload
router.post('/upload', uploadSingleResume, uploadResume);

export default router;
