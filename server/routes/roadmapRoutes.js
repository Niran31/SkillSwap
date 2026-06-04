import express from 'express';
import { generateRoadmap, saveRoadmap, getRoadmaps, toggleStepCompletion } from '../controllers/roadmapController.js';

const router = express.Router();

router.post('/generate', generateRoadmap);
router.post('/save', saveRoadmap);
router.get('/:userId', getRoadmaps);
router.patch('/:roadmapId/steps/:stepId', toggleStepCompletion);

export default router;
