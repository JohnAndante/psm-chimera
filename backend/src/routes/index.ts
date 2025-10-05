import { Router } from "express";

const router = Router();

import authRoutes from './auth.route';
import integrationRoutes from './integrations.route';
import storeRoutes from './stores.route';
import syncRoutes from './sync.route';
import notificationChannelRoutes from './notification-channels.route';
import userRoutes from './user.route';
import cronTestRoutes from './cron-test.route';

// Prefixo /api/v1

router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);
router.use('/stores', storeRoutes);
router.use('/sync', syncRoutes);
router.use('/notifications/channels', notificationChannelRoutes);
router.use('/users', userRoutes);
router.use('/cron-test', cronTestRoutes);

export default router;
