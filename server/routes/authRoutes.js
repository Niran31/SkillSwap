import express from 'express';
import { login, signup, getProfile, addXp } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/profile/:id', getProfile);
router.post('/xp', addXp);

export default router;
