import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  VITE_API_URL: z.string().optional(),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  VITE_API_URL: process.env.VITE_API_URL,
});

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'kalia-server',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (_request, response) => {
  response.json({
    name: 'Kalia API',
    version: '0.1.0',
    clientUrl: env.VITE_API_URL ?? null,
    endpoints: ['/api/health'],
  });
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

app.listen(env.PORT, () => {
  console.log(`Kalia server listening on http://localhost:${env.PORT}`);
});
