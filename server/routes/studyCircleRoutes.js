import express from 'express';
import { matchCircle, getUserCircles, toggleMilestone, askCircleMentor } from '../controllers/studyCircleController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/match', verifyToken, matchCircle);
router.get('/user/:userId', verifyToken, getUserCircles);
router.patch('/:circleId/milestones/:milestoneId', verifyToken, toggleMilestone);
router.post('/:circleId/ask-mentor', verifyToken, askCircleMentor);

export default router;
