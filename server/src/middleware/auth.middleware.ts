import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string; isAdmin?: boolean };
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      name: string;
      isAdmin?: boolean;
    };
    req.user = payload;
    next();
  } catch {
    logger.warn('Invalid token attempt', { ip: req.ip, path: req.path });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}
