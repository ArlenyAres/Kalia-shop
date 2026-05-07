import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.middleware.js';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    return;
  }
  if (!req.user.isAdmin) {
    res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    return;
  }
  next();
}
