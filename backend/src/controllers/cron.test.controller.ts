import { Request, Response } from 'express';
import { cronTestService } from '../services/cron.test.service';
import { AuthenticatedRequest } from '../types/auth.type';

/**
 * Cron Test Controller
 *
 * Handles API endpoints for cron testing:
 * - POST /cron-test/start - Start cron test
 * - POST /cron-test/stop - Stop cron test
 * - GET /cron-test/status - Get test status
 * - POST /cron-test/run - Run single test
 * - POST /cron-test/cleanup - Cleanup test data
 */
export class CronTestController {

    /**
     * POST /cron-test/start - Iniciar teste do cron
     */
    static async startCronTest(req: AuthenticatedRequest, res: Response): Promise<Response> {
        return cronTestService.startCronTest()
            .then(() => {
                return res.json({
                    success: true,
                    message: 'Teste do cron iniciado com sucesso',
                    data: { status: 'running' }
                });
            })
            .catch((error: any) => {
                return res.status(400).json({
                    success: false,
                    message: error.message || 'Erro ao iniciar teste do cron',
                    error: error.message
                });
            });
    }

    /**
     * POST /cron-test/stop - Parar teste do cron
     */
    static async stopCronTest(req: AuthenticatedRequest, res: Response): Promise<Response> {
        return cronTestService.stopCronTest()
            .then(() => {
                return res.json({
                    success: true,
                    message: 'Teste do cron parado com sucesso',
                    data: { status: 'stopped' }
                });
            })
            .catch((error: any) => {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao parar teste do cron',
                    error: error.message
                });
            });
    }

    /**
     * GET /cron-test/status - Verificar status do teste
     */
    static async getCronTestStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
        return cronTestService.getCronTestStatus()
            .then((status) => {
                return res.json({
                    success: true,
                    data: status
                });
            })
            .catch((error: any) => {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao verificar status do teste',
                    error: error.message
                });
            });
    }

    /**
     * POST /cron-test/run - Executar teste único
     */
    static async runSingleTest(req: AuthenticatedRequest, res: Response): Promise<Response> {
        return cronTestService.runSingleTest()
            .then((result) => {
                return res.json({
                    success: true,
                    message: 'Teste único executado com sucesso',
                    data: result
                });
            })
            .catch((error: any) => {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao executar teste único',
                    error: error.message
                });
            });
    }

    /**
     * POST /cron-test/setup - Criar configuração de teste
     */
    static async createTestSyncConfig(req: AuthenticatedRequest, res: Response): Promise<Response> {
        return cronTestService.createTestSyncConfig()
            .then((config) => {
                return res.json({
                    success: true,
                    message: 'Configuração de teste criada com sucesso',
                    data: config
                });
            })
            .catch((error: any) => {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao criar configuração de teste',
                    error: error.message
                });
            });
    }

    /**
     * POST /cron-test/sync - Executar sincronização de teste
     */
    static async executeTestSync(req: AuthenticatedRequest, res: Response): Promise<Response> {
        return cronTestService.executeTestSync()
            .then(() => {
                return res.json({
                    success: true,
                    message: 'Sincronização de teste executada com sucesso'
                });
            })
            .catch((error: any) => {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao executar sincronização de teste',
                    error: error.message
                });
            });
    }

    /**
     * POST /cron-test/cleanup - Limpar dados de teste
     */
    static async cleanupTestData(req: AuthenticatedRequest, res: Response): Promise<Response> {
        return cronTestService.cleanupTestData()
            .then(() => {
                return res.json({
                    success: true,
                    message: 'Dados de teste limpos com sucesso'
                });
            })
            .catch((error: any) => {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao limpar dados de teste',
                    error: error.message
                });
            });
    }

}
