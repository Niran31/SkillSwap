import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', verifyToken, getAnalytics);

export default router;
