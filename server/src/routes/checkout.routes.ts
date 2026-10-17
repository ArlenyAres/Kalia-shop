import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { checkout } from '../controllers/orders.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { checkoutSchema } from '../validation/schemas.js';

const router = Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', checkoutLimiter, validate(checkoutSchema), checkout);

export default router;
