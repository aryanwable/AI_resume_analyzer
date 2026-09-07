import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// Protected routes (require valid JWT)
// GET /api/auth/me
router.get('/me', authenticate, getMe);

export default router;
