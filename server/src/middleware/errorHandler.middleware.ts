import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.name, message: err.message });
    return;
  }

  res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong' });
}
