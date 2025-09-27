import { Router } from 'express';
import { JobExecutionController } from '../controllers/jobExec.controller';
import { authenticateToken } from '../utils/auth';
import { JobExecutionValidator } from '../validators/jobExec.validator';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/v1/jobs/executions
router.get('/', JobExecutionValidator.getAll, JobExecutionController.getExecutions);

// GET /api/v1/jobs/executions/:id
router.get('/:id', JobExecutionValidator.getById, JobExecutionController.getExecutionById);

// GET /api/v1/jobs/executions/:id/logs
router.get('/:id/logs', JobExecutionValidator.getLogs, JobExecutionController.getExecutionLogs);

export default router;
