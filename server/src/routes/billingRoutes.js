import { Router } from 'express';
import { getBilling, updateBilling } from '../controllers/billingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getBilling);
router.post('/upgrade', requireAuth, updateBilling);

export default router;
