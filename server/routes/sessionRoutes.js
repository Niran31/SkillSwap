import express from 'express';
import { createSession, getUserSessions, updateSessionStatus } from '../controllers/sessionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createSession);
router.get('/:userId', verifyToken, getUserSessions);
router.patch('/:id/status', verifyToken, updateSessionStatus);

export default router;
