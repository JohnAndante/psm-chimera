import { Router } from 'express';
import { LogController } from '../controllers/log.controller';
import { authenticateToken } from '../utils/auth';

const router = Router();

// Middleware de autenticação para todas as rotas de log
router.use(authenticateToken);

/**
 * Log Management Routes
 */

// GET /api/v1/logs - List logs with filtering
router.get('/', LogController.getLogs);

// GET /api/v1/logs/categories - Get available categories
router.get('/categories', LogController.getLogCategories);

// GET /api/v1/logs/statistics - Get log statistics
router.get('/statistics', LogController.getLogStatistics);

// GET /api/v1/logs/session/:sessionId - Get logs by session
router.get('/session/:sessionId', LogController.getLogsBySession);

// GET /api/v1/logs/stream - Server-Sent Events for real-time logs
router.get('/stream', LogController.streamLogs);

// POST /api/v1/logs/cleanup - Manual cleanup trigger
router.post('/cleanup', LogController.cleanupLogs);

// POST /api/v1/logs/test - Create test log (development only)
router.post('/test', LogController.createTestLog);

export { router as logRoutes };
