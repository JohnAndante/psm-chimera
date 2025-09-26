import { Router } from 'express';
import { JobConfigurationController } from '../controllers/job.config.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { JobConfigValidator } from '../validators/job.config.validator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/v1/jobs/configurations
router.get(
    '/',
    JobConfigValidator.getAll,
    JobConfigurationController.getAllJobs
);

// GET /api/v1/jobs/configurations/:id
router.get(
    '/:id',
    JobConfigValidator.getById,
    JobConfigurationController.getJobById
);

// POST /api/v1/jobs/configurations (apenas admin)
router.post(
    '/',
    requireAdmin,
    JobConfigValidator.create,
    JobConfigurationController.createJob
);

// PUT /api/v1/jobs/configurations/:id (apenas admin)
router.put(
    '/:id', requireAdmin,
    JobConfigValidator.update,
    JobConfigurationController.updateJob
);

// DELETE /api/v1/jobs/configurations/:id (apenas admin)
router.delete(
    '/:id',
    requireAdmin,
    JobConfigValidator.delete,
    JobConfigurationController.deleteJob
);

// POST /api/v1/jobs/configurations/:id/execute
router.post(
    '/:id/execute',
    JobConfigValidator.execute,
    JobConfigurationController.executeJob
);

export default router;
