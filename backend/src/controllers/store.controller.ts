import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth';
import { storeService } from '../services/store.service';

export class StoreController {

    // GET /api/v1/stores
    static getAll(req: AuthenticatedRequest, res: Response) {
        const filters = req.filters || {};
        const pagination = req.pagination || { limit: 10, offset: 0 };
        const sorting = req.sorting || { createdAt: 'asc' };

        storeService.getAllStores(filters, pagination, sorting)
            .then(result => {
                const { data, total } = result;

                return res.status(200).json({
                    data,
                    metadata: {
                        limit: pagination.limit,
                        offset: pagination.offset,
                        total: total,
                    },
                    message: 'Lojas recuperados com sucesso'
                });
            })
            .catch((error) => {
                console.error('Erro ao buscar lojas:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // GET /api/v1/stores/:id
    static getById(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const storeId = parseInt(id); // Validação já foi feita pelo middleware

        storeService.getStoreById(storeId)
            .then((store) => {
                if (!store) {
                    return res.status(404).json({
                        error: 'Loja não encontrada'
                    });
                }

                res.json({
                    message: 'Loja encontrada com sucesso',
                    data: store
                });
            })
            .catch((error) => {
                console.error('Erro ao buscar loja:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // GET /api/v1/stores/:id/products
    static getProducts(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const { page = '1', limit = '50', search } = req.query;

        const storeId = parseInt(id);
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);

        // Primeiro verifica se a loja existe
        storeService.getStoreById(storeId)
            .then((store) => {
                if (!store) {
                    res.status(404).json({
                        error: 'Loja não encontrada'
                    });
                    return;
                }

                // Busca os produtos da loja
                const pagination = { page: pageNum, limit: limitNum };
                const searchTerm = search && typeof search === 'string' ? search : undefined;

                storeService.getStoreProducts(storeId, pagination, searchTerm)
                    .then(({ products, total }) => {
                        const totalPages = Math.ceil(total / limitNum);

                        res.json({
                            message: 'Produtos listados com sucesso',
                            data: {
                                products,
                                pagination: {
                                    page: pageNum,
                                    limit: limitNum,
                                    total,
                                    totalPages,
                                    hasNext: pageNum < totalPages,
                                    hasPrev: pageNum > 1
                                }
                            }
                        });
                    })
                    .catch((error) => {
                        console.error('Erro ao buscar produtos da loja:', error);
                        res.status(500).json({
                            error: 'Erro interno do servidor'
                        });
                    });
            })
            .catch((error) => {
                console.error('Erro ao verificar loja:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // POST /api/v1/stores
    static create(req: AuthenticatedRequest, res: Response) {
        const { name, registration, document, active } = req.body;

        // Validação já foi feita pelo middleware
        const storeData = { name, registration, document, active };

        // Verifica se já existe loja com o mesmo registration
        storeService.checkRegistrationExists(registration)
            .then((exists) => {
                if (exists) {
                    return res.status(409).json({
                        error: 'Já existe uma loja com este código de registro'
                    });
                }

                // Cria a loja
                storeService.createStore(storeData)
                    .then((store) => {
                        res.status(201).json({
                            message: 'Loja criada com sucesso',
                            data: store
                        });
                    })
                    .catch((error) => {
                        console.error('Erro ao criar loja:', error);
                        res.status(500).json({
                            error: 'Erro interno do servidor'
                        });
                    });
            })
            .catch((error) => {
                console.error('Erro ao verificar registro existente:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // PUT /api/v1/stores/:id
    static update(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const { name, registration, document, active } = req.body;

        const storeId = parseInt(id); // Validação já foi feita pelo middleware

        // Dados já foram validados pelo middleware
        const updateData = { name, registration, document, active };

        // Verifica se loja existe
        storeService.getStoreById(storeId)
            .then((existingStore) => {
                if (!existingStore) {
                    return res.status(404).json({
                        error: 'Loja não encontrada'
                    });
                }

                // Verifica conflito de registration (se mudou)
                if (registration && registration !== existingStore.registration) {
                    storeService.checkRegistrationExists(registration, storeId)
                        .then((exists) => {
                            if (exists) {
                                return res.status(409).json({
                                    error: 'Já existe uma loja com este código de registro'
                                });
                            }

                            // Atualiza a loja
                            storeService.updateStore(storeId, updateData)
                                .then((store) => {
                                    res.json({
                                        message: 'Loja atualizada com sucesso',
                                        data: store
                                    });
                                })
                                .catch((error) => {
                                    console.error('Erro ao atualizar loja:', error);
                                    res.status(500).json({
                                        error: 'Erro interno do servidor'
                                    });
                                });
                        })
                        .catch((error) => {
                            console.error('Erro ao verificar registro:', error);
                            res.status(500).json({
                                error: 'Erro interno do servidor'
                            });
                        });
                } else {
                    // Atualiza a loja sem verificar registration
                    storeService.updateStore(storeId, updateData)
                        .then((store) => {
                            res.json({
                                message: 'Loja atualizada com sucesso',
                                data: store
                            });
                        })
                        .catch((error) => {
                            console.error('Erro ao atualizar loja:', error);
                            res.status(500).json({
                                error: 'Erro interno do servidor'
                            });
                        });
                }
            })
            .catch((error) => {
                console.error('Erro ao verificar loja existente:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // DELETE /api/v1/stores/:id
    static delete(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const storeId = parseInt(id); // Validação já foi feita pelo middleware

        // Verifica se loja existe
        storeService.getStoreById(storeId)
            .then((existingStore) => {
                if (!existingStore) {
                    return res.status(404).json({
                        error: 'Loja não encontrada'
                    });
                }

                // Soft delete
                storeService.deleteStore(storeId)
                    .then(() => {
                        res.json({
                            message: 'Loja excluída com sucesso'
                        });
                    })
                    .catch((error) => {
                        console.error('Erro ao excluir loja:', error);
                        res.status(500).json({
                            error: 'Erro interno do servidor'
                        });
                    });
            })
            .catch((error) => {
                console.error('Erro ao verificar loja existente:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }
}
