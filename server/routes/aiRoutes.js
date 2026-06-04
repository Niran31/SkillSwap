import express from 'express';
import { generateQuestions, saveQuestion, getSavedQuestions, deleteSavedQuestion, tutorChat } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', generateQuestions);
router.post('/save', saveQuestion);
router.get('/saved/:userId', getSavedQuestions);
router.delete('/saved/:id', deleteSavedQuestion);
router.post('/tutor', verifyToken, tutorChat);

export default router;

