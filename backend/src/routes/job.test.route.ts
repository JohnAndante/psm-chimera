import { Router } from 'express';
import { JobTestController } from '../controllers/job.test.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { JobTestValidator } from '../validators/job.test.validator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// POST /api/v1/jobs/execute - Executar job sob demanda
router.post('/execute', requireAdmin, JobTestValidator.executeJob, JobTestController.executeJob);

// GET /api/v1/jobs/executions/running - Listar execuções em andamento
router.get('/executions/running', JobTestController.getRunningExecutions);

// POST /api/v1/jobs/test-notification - Testar notificação
router.post('/test-notification', JobTestValidator.testNotification, JobTestController.testNotification);

// POST /api/v1/jobs/sync-store - Sincronizar loja com notificação
router.post('/sync-store', requireAdmin, JobTestValidator.syncStore, JobTestController.syncStoreWithNotification);

// GET /api/v1/jobs/telegram/test-connection - Testar conexão Telegram
router.get('/telegram/test-connection', JobTestValidator.testTelegramConnection, JobTestController.testTelegramConnection);

export default router;
