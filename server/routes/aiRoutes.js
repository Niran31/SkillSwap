import express from 'express';
import { generateQuestions } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateQuestions);

export default router;
