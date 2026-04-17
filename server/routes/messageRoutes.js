import express from 'express';
import { getMessages } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:room', verifyToken, getMessages);

export default router;
