import express from 'express';
import { getNotifications, markNotificationRead, markAllRead, dismissNotification } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markNotificationRead);
router.patch('/:userId/read-all', verifyToken, markAllRead);
router.delete('/:id', verifyToken, dismissNotification);

export default router;
