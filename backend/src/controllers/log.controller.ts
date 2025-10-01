import { Request, Response } from 'express';
import { logService } from '../services/log.service';
import { LogFilters, LogLevel } from '../types/log.type';
import { AuthenticatedRequest } from '../types/auth.type';

/**
 * Log Controller
 *
 * Handles API endpoints for log management:
 * - GET /logs - List logs with filtering
 * - GET /logs/categories - Get available categories
 * - GET /logs/statistics - Get log statistics
 * - GET /logs/session/:sessionId - Get logs by session
 * - GET /logs/stream - Server-Sent Events for real-time logs
 * - POST /logs/cleanup - Manual cleanup trigger
 */
export class LogController {

    /**
     * GET /logs - Retrieve logs with filtering support
     */
    static async getLogs(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const filters: LogFilters = {
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                level: req.query.level as LogLevel,
                category: req.query.category as string,
                sessionId: req.query.sessionId as string,
                search: req.query.search as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
                offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
            };

            const logs = await logService.getLogs(filters);

            return res.json({
                success: true,
                data: logs,
                total: logs.length,
                filters: filters,
            });
        } catch (error: any) {
            await logService.error('API', `Erro ao buscar logs: ${error?.message}`, {
                error: error?.stack,
                user_id: req.user?.id,
            });

            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar logs',
                error: error?.message,
            });
        }
    }

    /**
     * GET /logs/session/:sessionId - Get logs by session ID
     */
    static async getLogsBySession(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Session ID é obrigatório',
                });
            }

            const logs = await logService.getLogs({ sessionId });

            return res.json({
                success: true,
                data: logs,
                session_id: sessionId,
                total: logs.length,
            });
        } catch (error: any) {
            await logService.error('API', `Erro ao buscar logs da sessão: ${error?.message}`, {
                error: error?.stack,
                session_id: req.params.sessionId,
                user_id: req.user?.id,
            });

            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar logs da sessão',
                error: error?.message,
            });
        }
    }

    /**
     * GET /logs/categories - Get available log categories
     */
    static async getLogCategories(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const categories = await logService.getCategories();

            return res.json({
                success: true,
                data: categories,
                total: categories.length,
            });
        } catch (error: any) {
            await logService.error('API', `Erro ao buscar categorias: ${error?.message}`, {
                error: error?.stack,
                user_id: req.user?.id,
            });

            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar categorias',
                error: error?.message,
            });
        }
    }

    /**
     * GET /logs/statistics - Get log statistics and metrics
     */
    static async getLogStatistics(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const statistics = await logService.getStatistics();

            return res.json({
                success: true,
                data: statistics,
            });
        } catch (error: any) {
            await logService.error('API', `Erro ao buscar estatísticas: ${error?.message}`, {
                error: error?.stack,
                user_id: req.user?.id,
            });

            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas',
                error: error?.message,
            });
        }
    }

    /**
     * POST /logs/cleanup - Manual cleanup trigger
     */
    static async cleanupLogs(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            await logService.info('API', 'Limpeza manual iniciada', {
                user_id: req.user?.id,
                user_email: req.user?.email,
            });

            const result = await logService.cleanupOldLogs();

            return res.json({
                success: true,
                message: 'Limpeza concluída com sucesso',
                data: result,
            });
        } catch (error: any) {
            await logService.error('API', `Erro na limpeza manual: ${error?.message}`, {
                error: error?.stack,
                user_id: req.user?.id,
            });

            return res.status(500).json({
                success: false,
                message: 'Erro na limpeza de logs',
                error: error?.message,
            });
        }
    }

    /**
     * GET /logs/stream - Server-Sent Events for real-time logs
     */
    static async streamLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
        // Set headers for Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
        });

        // Send initial connection message
        res.write('data: {"type":"connected","message":"Log stream connected"}\\n\\n');

        await logService.info('API', 'Cliente conectado ao stream de logs', {
            user_id: req.user?.id,
            user_agent: req.headers['user-agent'],
            ip: req.ip,
        });

        // Set up log listener
        const logListener = (log: any) => {
            try {
                // Apply basic filtering if query params provided
                const levelFilter = req.query.level as LogLevel;
                const categoryFilter = req.query.category as string;

                if (levelFilter && log.level !== levelFilter) return;
                if (categoryFilter && log.category !== categoryFilter) return;

                // Send log entry
                res.write(`data: ${JSON.stringify({
                    type: 'log',
                    data: log
                })}\\n\\n`);
            } catch (error) {
                console.error('Error sending log via SSE:', error);
            }
        };

        // Register listener
        logService.onLogAdded(logListener);

        // Handle client disconnect
        req.on('close', () => {
            logService.removeLogListener(logListener);
            res.end();
        });

        // Send keepalive every 30 seconds
        const keepAlive = setInterval(() => {
            res.write('data: {"type":"keepalive"}\\n\\n');
        }, 30000);

        req.on('close', () => {
            clearInterval(keepAlive);
        });
    }

    /**
     * POST /logs/test - Create test log entry (development only)
     */
    static async createTestLog(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { level = 'INFO', category = 'TEST', message = 'Test log entry' } = req.body;

            await logService.log({
                level: level as LogLevel,
                category,
                message,
                metadata: {
                    test: true,
                    user_id: req.user?.id,
                    timestamp: new Date().toISOString(),
                },
                source: 'manual',
            });

            return res.json({
                success: true,
                message: 'Log de teste criado com sucesso',
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar log de teste',
                error: error?.message,
            });
        }
    }
}
