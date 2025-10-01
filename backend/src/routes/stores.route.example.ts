import { Router } from 'express';
import { StoreController } from '../controllers/store.controller.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';
import { StoreValidator } from '../validators/store.validator.js';
import { filterMiddleware } from '../middlewares/filter.middleware.js';
import { paginationMiddleware } from '../middlewares/pagination.middleware.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Configuração de filtros para listagem de stores
const storeFiltersConfig = {
    name: 'string' as const,
    active: 'boolean' as const,
    integration_type: {
        type: 'enum' as const,
        enumValues: ['crescevendas', 'rp']
    },
    created_at: 'date' as const,
    updated_at: 'date' as const
};

// Configuração de paginação para stores
const storePaginationConfig = {
    defaultLimit: 10,
    maxLimit: 100,
    allowUnlimited: false
};

// GET /api/v1/stores - Com filtros e paginação
router.get('/',
    filterMiddleware(storeFiltersConfig),
    paginationMiddleware(storePaginationConfig),
    StoreValidator.getAll,
    StoreController.getAll
);

// GET /api/v1/stores/:id
router.get('/:id', StoreValidator.getById, StoreController.getById);

// GET /api/v1/stores/:id/products
router.get('/:id/products', StoreValidator.getProducts, StoreController.getProducts);

// POST /api/v1/stores (apenas admin)
router.post('/', requireAdmin, StoreValidator.create, StoreController.create);

// PUT /api/v1/stores/:id (apenas admin)
router.put('/:id', requireAdmin, StoreValidator.update, StoreController.update);

// DELETE /api/v1/stores/:id (apenas admin)
router.delete('/:id', requireAdmin, StoreValidator.delete, StoreController.delete);

// POST /api/v1/stores/:id/sync
router.post('/:id/sync', requireAdmin, StoreController.syncProducts);

export default router;
