import express from 'express';
import { createSession, getUserSessions } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', createSession);
router.get('/:userId', getUserSessions);

export default router;
