import { Router } from 'express';
import { CronTestController } from '../controllers/cron.test.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';

const router = Router();

// Todas as rotas requerem autenticação de admin
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * POST /api/v1/cron-test/start
 * Iniciar teste do cron (executa a cada minuto)
 */
router.post('/start', CronTestController.startCronTest);

/**
 * POST /api/v1/cron-test/stop
 * Parar teste do cron
 */
router.post('/stop', CronTestController.stopCronTest);

/**
 * GET /api/v1/cron-test/status
 * Verificar status do teste do cron
 */
router.get('/status', CronTestController.getCronTestStatus);

/**
 * POST /api/v1/cron-test/run-once
 * Executar teste único (não agendado)
 */
router.post('/run-once', CronTestController.runSingleTest);

/**
 * POST /api/v1/cron-test/create-sync-config
 * Criar configuração de sincronização de teste
 */
router.post('/create-sync-config', CronTestController.createTestSyncConfig);

/**
 * POST /api/v1/cron-test/run-sync
 * Executar sincronização de teste
 */
router.post('/run-sync', CronTestController.executeTestSync);

/**
 * DELETE /api/v1/cron-test/cleanup
 * Limpar dados de teste
 */
router.delete('/cleanup', CronTestController.cleanupTestData);

export default router;
