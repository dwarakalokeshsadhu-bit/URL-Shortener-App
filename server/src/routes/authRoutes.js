import { Router } from 'express';
import { check, googleAuth, googleCallback, login, logout, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/check', requireAuth, check);

export default router;
