import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // En Vercel + Neon, POSTGRES_PRISMA_URL es la URL del pooler preparada para Prisma (pgbouncer=true).
    datasourceUrl: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

prisma
  .$connect()
  .then(() => logger.info('Database connected'))
  .catch((err: Error) => logger.error('Database connection failed', { error: err.message }));

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
