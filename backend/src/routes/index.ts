import { Router } from "express";

const router = Router();

import authRoutes from './auth.route';
import integrationRoutes from './integrations.route';
import storeRoutes from './stores.route';

// Prefixo /api/v1

router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);
router.use('/stores', storeRoutes);

export default router;
