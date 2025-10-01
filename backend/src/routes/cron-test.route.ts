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
router.post('/start', (req, res) => {
    try {
        CronTestController.startCronTest();
        res.json({
            success: true,
            message: 'Teste do cron iniciado - execução a cada minuto',
            status: CronTestController.getCronTestStatus()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Erro ao iniciar teste do cron',
            details: error.message
        });
    }
});

/**
 * POST /api/v1/cron-test/stop
 * Parar teste do cron
 */
router.post('/stop', (req, res) => {
    try {
        CronTestController.stopCronTest();
        res.json({
            success: true,
            message: 'Teste do cron parado',
            status: CronTestController.getCronTestStatus()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Erro ao parar teste do cron',
            details: error.message
        });
    }
});

/**
 * GET /api/v1/cron-test/status
 * Verificar status do teste do cron
 */
router.get('/status', (req, res) => {
    try {
        const status = CronTestController.getCronTestStatus();
        res.json({
            success: true,
            status
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar status',
            details: error.message
        });
    }
});

/**
 * POST /api/v1/cron-test/run-once
 * Executar teste único (não agendado)
 */
router.post('/run-once', async (req, res) => {
    try {
        const result = await CronTestController.runSingleTest();
        res.json({
            success: true,
            message: 'Teste único executado com sucesso',
            result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Erro ao executar teste único',
            details: error.message
        });
    }
});

/**
 * POST /api/v1/cron-test/create-sync-config
 * Criar configuração de sincronização de teste
 */
router.post('/create-sync-config', async (req, res) => {
    try {
        const result = await CronTestController.createTestSyncConfig();
        res.json({
            success: true,
            message: 'Configuração de sincronização de teste criada',
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar configuração de teste',
            details: error.message
        });
    }
});

/**
 * POST /api/v1/cron-test/run-sync
 * Executar sincronização de teste
 */
router.post('/run-sync', async (req, res) => {
    try {
        await CronTestController.executeTestSync();
        res.json({
            success: true,
            message: 'Sincronização de teste executada com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Erro ao executar sincronização de teste',
            details: error.message
        });
    }
});

/**
 * DELETE /api/v1/cron-test/cleanup
 * Limpar dados de teste
 */
router.delete('/cleanup', async (req, res) => {
    try {
        await CronTestController.cleanupTestData();
        res.json({
            success: true,
            message: 'Dados de teste limpos com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Erro ao limpar dados de teste',
            details: error.message
        });
    }
});

export default router;
