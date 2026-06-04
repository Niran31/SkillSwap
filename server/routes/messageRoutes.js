import express from 'express';
import { getMessages, getConversations } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations/:userId', verifyToken, getConversations);
router.get('/:room', verifyToken, getMessages);

export default router;
