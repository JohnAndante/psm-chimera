import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../utils/auth';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', AuthController.login);

// POST /api/v1/auth/logout
router.post('/logout', AuthController.logout);

// GET /api/v1/auth/me
router.get('/me', authenticateToken, AuthController.me);

// POST /api/v1/auth/change-password
router.post('/change-password', authenticateToken, AuthController.changePassword);

export default router;
