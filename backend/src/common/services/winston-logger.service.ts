import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'auth-starter' },
      transports: [
        // Console pour le développement
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // Fichiers pour la production
        ...(process.env.NODE_ENV === 'production' ? [
          // Logs généraux
          new winston.transports.File({
            filename: path.join('logs', 'app.log'),
            level: 'info'
          }),
          
          // Logs d'erreur
          new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error'
          }),
          
          // Logs de sécurité spécifiques
          new winston.transports.File({
            filename: path.join('logs', 'security.log'),
            level: 'warn',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                if (typeof message === 'string' && message.includes('[SECURITY]')) {
                  return JSON.stringify({ timestamp, level, message, ...meta });
                }
                return null;
              })
            )
          })
        ] : [])
      ]
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}