import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserValidator } from '../validators/user.validator';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { paginationMiddleware } from '../middlewares/pagination.middleware';
import { filterMiddleware } from '../middlewares/filter.middleware';

const router = Router();

// GET /api/v1/users - Listar usuários (requer autenticação)
router.get('/',
    authenticateToken,
    filterMiddleware({
        name: 'string',
        email: 'string',
        role: 'enum',
        active: 'boolean',
    }),
    paginationMiddleware(),
    UserValidator.getAll,
    UserController.getAll
);

// GET /api/v1/users/:id - Buscar usuário por ID (requer autenticação)
router.get('/:id',
    authenticateToken,
    UserValidator.getById,
    UserController.getById
);

// POST /api/v1/users - Criar usuário (requer admin)
router.post('/',
    authenticateToken,
    requireAdmin,
    UserValidator.create,
    UserController.create
);

// PUT /api/v1/users/:id - Atualizar usuário (requer admin)
router.put('/:id',
    authenticateToken,
    requireAdmin,
    UserValidator.update,
    UserController.update
);

// DELETE /api/v1/users/:id - Deletar usuário (requer admin)
router.delete('/:id',
    authenticateToken,
    requireAdmin,
    UserValidator.delete,
    UserController.delete
);

// PUT /api/v1/users/:id/change-password - Alterar senha (requer admin)
router.put('/:id/change-password',
    authenticateToken,
    requireAdmin,
    UserValidator.changePassword,
    UserController.changePassword
);

export default router;
