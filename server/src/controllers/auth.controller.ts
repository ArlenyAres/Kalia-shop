import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { getJwtSecret } from '../config/env.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import logger from '../utils/logger.js';

// Hash ficticio para comparar aunque el email no exista: misma latencia en ambos casos.
const DUMMY_HASH = '$2a$10$AKoNTn4bb8T9Ep95m0xAZecvd9vH4vCPOKoO5bUO7Rsiy7cO9POGG';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    const valid = await bcrypt.compare(password, admin?.password ?? DUMMY_HASH);

    if (!admin || !valid) {
      logger.warn('Failed login attempt', { email, ip: req.ip });
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, isAdmin: true },
      getJwtSecret(),
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as jwt.SignOptions['expiresIn'] },
    );

    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(admin);
  } catch (err) {
    next(err);
  }
};
