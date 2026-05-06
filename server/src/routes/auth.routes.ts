import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, me as Parameters<typeof router.get>[1]);

export default router;
