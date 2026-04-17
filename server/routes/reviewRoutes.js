import express from 'express';
import { addReview, getReviews, getAverageRating } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, addReview);
router.get('/:peerId', getReviews);
router.get('/average/:peerId', getAverageRating);

export default router;
