import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { loginSchema } from '../validation/schemas.js';

const router = Router();

// Frena la fuerza bruta: 10 intentos fallidos por IP cada 15 minutos.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Demasiados intentos. Prueba más tarde.' },
});

router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', verifyToken, me as Parameters<typeof router.get>[1]);

export default router;
