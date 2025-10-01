import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../utils/auth';
import { AuthValidator } from '../validators/auth.validator';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', AuthValidator.login, AuthController.login);

// POST /api/v1/auth/logout
router.post('/logout', AuthController.logout);

// POST /api/v1/auth/refresh
router.post('/refresh', authenticateToken, AuthController.refresh);

// GET /api/v1/auth/me
router.get('/me', authenticateToken, AuthController.me);

// GET /api/v1/auth/validate-token
router.get('/validate-token', authenticateToken, AuthController.validateToken);

// POST /api/v1/auth/change-password
router.post('/change-password', authenticateToken, AuthController.changePassword);

export default router;
