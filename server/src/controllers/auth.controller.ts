import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import type { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      logger.warn('Login attempt for unknown email', { email, ip: req.ip });
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      logger.warn('Failed login attempt', { email, ip: req.ip });
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, isAdmin: true },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
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
