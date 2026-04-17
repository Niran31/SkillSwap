import express from 'express';
import { login, signup, getProfile, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/profile/:id', verifyToken, getProfile);
router.put('/profile/:id', verifyToken, updateProfile);

export default router;
