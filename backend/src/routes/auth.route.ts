import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../utils/auth';

const router = Router();

// Rotas públicas
router.post(
    '/login',
    AuthController.login
);

router.post(
    '/logout',
    AuthController.logout
);

// Rotas protegidas
router.get(
    '/me',
    authenticateToken,
    AuthController.me
);
router.post(
    '/change-password',
    authenticateToken,
    AuthController.changePassword
);

export default router;
