import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Env } from './config/env.js';
import { httpLogger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import productRouter from './routes/products.routes.js';
import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import checkoutRouter from './routes/checkout.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Construye la app sin escuchar en un puerto: reutilizable en tests y en serverless. */
export function createApp(env: Pick<Env, 'CLIENT_URL'>) {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.CLIENT_URL.split(',').map((o) => o.trim()), credentials: true }));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.use(express.json({ limit: '2mb' }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(httpLogger);

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true, service: 'kalia-server', timestamp: new Date().toISOString() });
  });

  app.get('/api', (_request, response) => {
    response.json({
      name: 'Kalia API',
      version: '0.1.0',
      endpoints: ['/api/health', '/api/products', '/api/checkout', '/api/auth', '/api/admin'],
    });
  });

  app.use('/api/products', productRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
}
