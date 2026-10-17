import { mkdirSync } from 'fs';
import morgan from 'morgan';
import winston from 'winston';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const isDev = process.env.NODE_ENV !== 'production';

// En Vercel (serverless) el disco es de solo lectura: solo consola, que recoge Vercel Logs.
const writeFiles = !process.env.VERCEL;
if (writeFiles) mkdirSync('logs', { recursive: true });

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    ...(writeFiles
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

export const httpLogger = morgan('combined', {
  stream: { write: (message: string) => logger.http(message.trim()) },
});

export default logger;
