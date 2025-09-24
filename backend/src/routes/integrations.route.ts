import { Router } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/v1/integrations
router.get('/', IntegrationController.getAll);

// GET /api/v1/integrations/:id
router.get('/:id', IntegrationController.getById);

// POST /api/v1/integrations
router.post('/', requireAdmin, IntegrationController.create);

// PUT /api/v1/integrations/:id
router.put('/:id', requireAdmin, IntegrationController.update);

// DELETE /api/v1/integrations/:id
router.delete('/:id', requireAdmin, IntegrationController.delete);

// POST /api/v1/integrations/:id/test
router.post('/:id/test', IntegrationController.testConnection);

export default router;
