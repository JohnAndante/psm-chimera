import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth.js';
import { storeService } from '../services/store.service.js';
import { applyFilters, applyPagination, createPaginatedResponse } from '../utils/query-builder.helper.js';
import { DatabaseFactory } from '../factory/database.factory.js';

export class StoreControllerExample {

    // GET /api/v1/stores - Usando os novos middlewares
    static getAll(req: AuthenticatedRequest, res: Response) {
        const db = DatabaseFactory.getInstance();

        // Os middlewares já processaram e validaram os filtros e paginação
        const filters = req.filters || {};
        const pagination = req.pagination!;

        // Query base
        let query = db.selectFrom('stores').selectAll();

        // Aplica filtros
        query = applyFilters(query, filters);

        // Conta total para paginação
        let countQuery = db.selectFrom('stores')
            .select(db.fn.count('id').as('total'));
        countQuery = applyFilters(countQuery, filters);

        // Executa count e query principal
        Promise.all([
            countQuery.executeTakeFirstOrThrow(),
            applyPagination(query, pagination).execute()
        ])
            .then(([countResult, stores]) => {
                const totalCount = Number(countResult.total);
                const paginationInfo = req.calculatePaginationInfo!(totalCount);

                const response = createPaginatedResponse(
                    stores,
                    pagination,
                    totalCount,
                    paginationInfo
                );

                res.json(response);
            })
            .catch((error) => {
                console.error('Erro ao buscar lojas:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            });
    }

    // GET /api/v1/stores/:id - Método inalterado (sem filtros/paginação)
    static getById(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const storeId = parseInt(id);

        storeService.getStoreById(storeId)
            .then((store) => {
                if (!store) {
                    return res.status(404).json({
                        success: false,
                        error: 'Loja não encontrada'
                    });
                }

                res.json({
                    success: true,
                    data: store
                });
            })
            .catch((error) => {
                console.error('Erro ao buscar loja:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            });
    }
}
