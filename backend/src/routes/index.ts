import { Router } from "express";

const router = Router();

import authRoutes from './auth.route';

router.use('/auth', authRoutes);

export default router;
