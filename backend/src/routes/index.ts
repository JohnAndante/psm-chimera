import { Router } from "express";

const router = Router();

import authRoutes from './auth.route';
import integrationRoutes from './integrations.route';
import storeRoutes from './stores.route';
import jobConfigRoutes from './jobsConfig.route';
import jobExecRoutes from './jobsExec.route';
import notificationChannelRoutes from './notificationChannels.route';

// Prefixo /api/v1

router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);
router.use('/stores', storeRoutes);
router.use('/jobs/configurations', jobConfigRoutes);
router.use('/jobs/executions', jobExecRoutes);
router.use('/notifications/channels', notificationChannelRoutes);

export default router;
