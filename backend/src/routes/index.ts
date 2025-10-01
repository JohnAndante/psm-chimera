import { Router } from "express";

const router = Router();

import authRoutes from './auth.route';
import integrationRoutes from './integrations.route';
import storeRoutes from './stores.route';
import notificationChannelRoutes from './notificationChannels.route';
import userRoutes from './user.route';

// Prefixo /api/v1

router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);
router.use('/stores', storeRoutes);
router.use('/notifications/channels', notificationChannelRoutes);
router.use('/users', userRoutes);

export default router;
