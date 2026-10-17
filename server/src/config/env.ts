import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  // URL pública del backend, usada para construir las URLs de /uploads.
  PUBLIC_URL: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET es obligatorio' })
    .min(isProduction ? 32 : 16, 'JWT_SECRET demasiado corto')
    .refine((v) => v !== 'change-me', 'JWT_SECRET no puede ser el valor de ejemplo'),
  JWT_EXPIRES_IN: z.string().default('8h'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Valida el entorno una sola vez; lanza al arrancar si falta algo crítico. */
export function getEnv(): Env {
  if (!cached) cached = envSchema.parse(process.env);
  return cached;
}

/** Lectura perezosa para que los tests puedan fijar process.env.JWT_SECRET antes de usarlo. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está configurado');
  return secret;
}
