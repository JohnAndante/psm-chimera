import { NextFunction, Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserValidator } from '../validators/user.validator';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { queryMiddleware } from '../middlewares/query.middleware';

const router = Router();

function debugQueryMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log('🔍 Query Parameters:', req.query);
    console.log('🔍 URL:', req.originalUrl);
    next();
}

// GET /api/v1/users - Listar usuários (requer autenticação)
router.get('/',
    authenticateToken,
    debugQueryMiddleware,
    UserValidator.getAll,
    queryMiddleware({
        name: { type: 'string', sortable: true, filterable: true },
        role: {
            type: 'enum',
            sortable: true,
            filterable: true,
            enumValues: ['ADMIN', 'USER']
        },
        active: { type: 'boolean', sortable: true, filterable: true },
        createdAt: { type: 'date', sortable: true, filterable: false },
        updatedAt: { type: 'date', sortable: true, filterable: false }
    }),
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
