import express from 'express';
import { createOrganization, joinOrganization, getOrgDashboard, verifyInviteCode } from '../controllers/orgController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createOrganization);
router.post('/join', joinOrganization);
router.get('/:orgId/dashboard', getOrgDashboard);
router.get('/invite/:code', verifyInviteCode);

export default router;
