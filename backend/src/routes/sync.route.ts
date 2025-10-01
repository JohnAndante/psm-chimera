import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/v1/sync/status - Status do sistema
router.get('/status', SyncController.getStatus);

// ===== Sync Configurations =====
// GET /api/v1/sync/configs - Listar configurações
router.get('/configs', SyncController.getAllSyncConfigs);

// GET /api/v1/sync/configs/:id - Buscar configuração específica
router.get('/configs/:id', SyncController.getSyncConfigById);

// POST /api/v1/sync/configs - Criar nova configuração (requer admin)
router.post('/configs', requireAdmin, SyncController.createSyncConfig);

// PUT /api/v1/sync/configs/:id - Atualizar configuração (requer admin)
router.put('/configs/:id', requireAdmin, SyncController.updateSyncConfig);

// DELETE /api/v1/sync/configs/:id - Remover configuração (requer admin)
router.delete('/configs/:id', requireAdmin, SyncController.deleteSyncConfig);

// POST /api/v1/sync/configs/:id/execute - Executar configuração específica (requer admin)
router.post('/configs/:id/execute', requireAdmin, SyncController.executeSyncConfig);

// ===== Sync Executions =====
// GET /api/v1/sync/executions - Listar execuções
router.get('/executions', SyncController.getExecutions);

// GET /api/v1/sync/executions/:executionId - Buscar execução específica
router.get('/executions/:executionId', SyncController.getExecutionById);

// ===== Manual Sync Execution =====
// POST /api/v1/sync/execute - Executar sincronização manual (requer admin)
router.post('/execute', requireAdmin, SyncController.executeSync);

// POST /api/v1/sync/execute/store/:storeId - Executar para loja específica (requer admin)
router.post('/execute/store/:storeId', requireAdmin, SyncController.executeSyncForStore);

// POST /api/v1/sync/compare - Executar apenas comparação (requer admin)
router.post('/compare', requireAdmin, SyncController.executeComparison);

export default router;
