import { Router } from 'express';
import { analytics, createUrl, deleteUrl, listUrls, updateUrl } from '../controllers/urlController.js';
import { attachUser, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', attachUser, createUrl);
router.get('/', requireAuth, listUrls);
router.get('/:id/analytics', requireAuth, analytics);
router.put('/:id', requireAuth, updateUrl);
router.delete('/:id', requireAuth, deleteUrl);

export default router;
