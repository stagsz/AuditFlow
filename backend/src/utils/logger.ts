import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isTest = process.env.NODE_ENV === 'test';

export const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  silent: isTest,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: isTest
    ? []
    : [
        new winston.transports.Console({
          format: combine(colorize(), logFormat),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
});

// Create logs directory if it doesn't exist (skip in test mode)
import fs from 'fs';
if (!isTest && !fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}
