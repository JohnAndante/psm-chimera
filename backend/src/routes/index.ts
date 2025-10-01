import { Router } from "express";

const router = Router();

import authRoutes from './auth.route';
import integrationRoutes from './integrations.route';
import storeRoutes from './stores.route';
import syncRoutes from './sync.route';
import notificationChannelRoutes from './notificationChannels.route';
import userRoutes from './user.route';
import cronTestRoutes from './cron-test.route';
import { logRoutes } from './log.route';

// Prefixo /api/v1

router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);
router.use('/stores', storeRoutes);
router.use('/sync', syncRoutes);
router.use('/notifications/channels', notificationChannelRoutes);
router.use('/users', userRoutes);
router.use('/cron-test', cronTestRoutes);
router.use('/logs', logRoutes);

export default router;
