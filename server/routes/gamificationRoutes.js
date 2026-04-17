import express from 'express';
import { addXpEvent, getGamificationStats, getDashboardStats } from '../controllers/gamificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/add-xp', verifyToken, addXpEvent);
router.get('/:id/stats', verifyToken, getGamificationStats);
router.get('/:id/dashboard', verifyToken, getDashboardStats);

export default router;
