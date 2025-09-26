import { Router } from 'express';
import { NotificationChannelController } from '../controllers/NotificationChannelController';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { NotificationValidator } from '../validators/notification.validator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/v1/notifications/channels
router.get('/', NotificationValidator.getAll, NotificationChannelController.getAll);

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
