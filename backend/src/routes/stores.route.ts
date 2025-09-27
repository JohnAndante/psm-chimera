import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { StoreValidator } from '../validators/store.validator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/v1/stores
router.get('/', StoreValidator.getAll, StoreController.getAll);

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
router.post('/:id/sync', StoreValidator.syncProducts, StoreController.syncProducts);

export default router;
