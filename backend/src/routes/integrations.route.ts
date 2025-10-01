import { Router } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';
import {
    validateGetAllIntegrations,
    validateGetIntegrationById,
    validateCreateIntegration,
    validateUpdateIntegration,
    validateDeleteIntegration,
    validateTestConnection,
    validateConfigValidation
} from '../validators/integration.validator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/v1/integrations
router.get('/', validateGetAllIntegrations, IntegrationController.getAll);

// GET /api/v1/integrations/:id
router.get('/:id', validateGetIntegrationById, IntegrationController.getById);

// POST /api/v1/integrations
router.post('/', requireAdmin, validateCreateIntegration, IntegrationController.create);

// PUT /api/v1/integrations/:id
router.put('/:id', requireAdmin, validateUpdateIntegration, IntegrationController.update);

// DELETE /api/v1/integrations/:id
router.delete('/:id', requireAdmin, validateDeleteIntegration, IntegrationController.delete);

// POST /api/v1/integrations/:id/test
router.post('/:id/test', validateTestConnection, IntegrationController.testConnection);

// POST /api/v1/integrations/validate-config
router.post('/validate-config', validateConfigValidation, IntegrationController.validateConfig);

export default router;
