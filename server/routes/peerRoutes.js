import express from 'express';
import { getPeers } from '../controllers/peerController.js';

const router = express.Router();

router.get('/', getPeers);

export default router;
