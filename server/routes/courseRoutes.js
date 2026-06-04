import express from 'express';
import { createCourse, updateCourse, enrollCourse, completeLesson, submitQuizScore, getCourses } from '../controllers/courseController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getCourses);
router.post('/', createCourse);
router.patch('/:courseId', updateCourse);
router.post('/:courseId/enroll', enrollCourse);
router.post('/:courseId/lessons/:lessonId/complete', completeLesson);
router.post('/:courseId/quizzes/:quizId/submit', submitQuizScore);

export default router;
