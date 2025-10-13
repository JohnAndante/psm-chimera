import { Router } from 'express';
import { NotificationChannelController } from '../controllers/notification-channel.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { NotificationValidator } from '../validators/notificationChannel.validator';
import { queryMiddleware } from '../middlewares/query.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/v1/notifications/channels
router.get(
    '/',
    NotificationValidator.getAll,
    queryMiddleware({
        name: { type: 'string', sortable: true, filterable: true },
        type: {
            type: 'enum',
            sortable: true,
            filterable: true,
            enumValues: ['EMAIL', 'TELEGRAM', 'WEBHOOK']
        },
        active: { type: 'boolean', sortable: true, filterable: true },
        createdAt: { type: 'date', sortable: true, filterable: false },
    }),
    NotificationChannelController.getAll
);

// GET /api/v1/notifications/channels/:id
router.get('/:id', NotificationValidator.getById, NotificationChannelController.getById);

// POST /api/v1/notifications/channels (apenas admin)
router.post('/', requireAdmin, NotificationValidator.create, NotificationChannelController.create);

// PUT /api/v1/notifications/channels/:id (apenas admin)
router.put('/:id', requireAdmin, NotificationValidator.update, NotificationChannelController.update);

// DELETE /api/v1/notifications/channels/:id (apenas admin)
router.delete('/:id', requireAdmin, NotificationValidator.delete, NotificationChannelController.delete);

// POST /api/v1/notifications/channels/:id/test
router.post('/:id/test', NotificationValidator.test, NotificationChannelController.testNotification);

export default router;
