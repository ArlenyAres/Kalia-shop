import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,
});

import { httpLogger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler.middleware';
import productRouter from './routes/products.routes';
import authRouter from './routes/auth.routes';
import adminRouter from './routes/admin.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
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
    endpoints: ['/api/health', '/api/products', '/api/auth', '/api/admin'],
  });
});

app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Kalia server listening on http://localhost:${env.PORT}`);
});
