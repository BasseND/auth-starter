import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

export interface SecurityEvent {
  type: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_RESET_SUCCESS' |
        'EMAIL_VERIFICATION' | 'EMAIL_VERIFICATION_SUCCESS' | 'EMAIL_VERIFICATION_INVALID_TOKEN' |
        'EMAIL_VERIFICATION_ALREADY_VERIFIED' | 'EMAIL_VERIFICATION_ERROR' |
        'EMAIL_VERIFICATION_RESEND_SUCCESS' | 'EMAIL_VERIFICATION_RESEND_ALREADY_VERIFIED' |
        'EMAIL_VERIFICATION_RESEND_INVALID_EMAIL' | 'EMAIL_VERIFICATION_RESEND_ERROR' |
        'REGISTRATION' | 'REGISTRATION_ATTEMPT' | 'REGISTRATION_SUCCESS' | 'REGISTRATION_EMAIL_EXISTS' |
        'REGISTRATION_ERROR' | 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' |
        'LOGIN_ATTEMPT_INVALID_EMAIL' | 'LOGIN_INVALID_EMAIL' | 'LOGIN_INVALID_PASSWORD' | 'LOGIN_INACTIVE_USER' |
        'LOGIN_UNVERIFIED_EMAIL' | 'LOGIN_ERROR' | 'PASSWORD_RESET_INVALID_EMAIL' |
        'PASSWORD_RESET_ERROR' | 'PASSWORD_RESET_INVALID_TOKEN' | 'ACCOUNT_LOCKED' |
        'SUSPICIOUS_ACTIVITY' | 'TOKEN_REFRESH' | 'LOGOUT' | 'RATE_LIMIT_EXCEEDED';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

@Injectable()
export class SecureLoggerService {
  private readonly logger = new Logger(SecureLoggerService.name);

  /**
   * Log un événement de sécurité en masquant les informations sensibles
   */
  logSecurityEvent(event: SecurityEvent): void {
    const sanitizedEvent = this.sanitizeEvent(event);
    
    const logMessage = `[SECURITY] ${event.type} - User: ${sanitizedEvent.userHash} - IP: ${sanitizedEvent.maskedIp} - ${sanitizedEvent.details || ''}`;
    
    // Log selon le niveau de criticité
    switch (event.type) {
      case 'ACCOUNT_LOCKED':
      case 'REGISTRATION_ERROR':
      case 'LOGIN_ERROR':
      case 'PASSWORD_RESET_ERROR':
      case 'EMAIL_VERIFICATION_ERROR':
      case 'EMAIL_VERIFICATION_RESEND_ERROR':
        this.logger.error(logMessage);
        break;
      case 'AUTH_FAILURE':
      case 'SUSPICIOUS_ACTIVITY':
      case 'RATE_LIMIT_EXCEEDED':
      case 'LOGIN_INVALID_PASSWORD':
      case 'LOGIN_INVALID_EMAIL':
      case 'LOGIN_ATTEMPT_INVALID_EMAIL':
      case 'LOGIN_INACTIVE_USER':
      case 'LOGIN_UNVERIFIED_EMAIL':
      case 'PASSWORD_RESET_INVALID_EMAIL':
      case 'PASSWORD_RESET_INVALID_TOKEN':
      case 'EMAIL_VERIFICATION_INVALID_TOKEN':
      case 'EMAIL_VERIFICATION_RESEND_INVALID_EMAIL':
        this.logger.warn(logMessage);
        break;
      case 'AUTH_SUCCESS':
      case 'PASSWORD_RESET_SUCCESS':
      case 'PASSWORD_RESET_REQUEST':
      case 'EMAIL_VERIFICATION':
      case 'EMAIL_VERIFICATION_SUCCESS':
      case 'EMAIL_VERIFICATION_ALREADY_VERIFIED':
      case 'EMAIL_VERIFICATION_RESEND_SUCCESS':
      case 'EMAIL_VERIFICATION_RESEND_ALREADY_VERIFIED':
      case 'REGISTRATION':
      case 'REGISTRATION_ATTEMPT':
      case 'REGISTRATION_SUCCESS':
      case 'REGISTRATION_EMAIL_EXISTS':
      case 'LOGIN_ATTEMPT':
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILURE':
        this.logger.log(logMessage);
        break;
      default:
        this.logger.debug(logMessage);
    }

    // En production, on pourrait aussi envoyer vers un système de monitoring externe
    if (process.env.NODE_ENV === 'production') {
      this.sendToSecurityMonitoring(sanitizedEvent);
    }
  }

  /**
   * Log une tentative d'authentification
   */
  logAuthAttempt(email: string, ipAddress: string, userAgent: string, success: boolean, details?: string): void {
    this.logSecurityEvent({
      type: success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
      email,
      ipAddress,
      userAgent,
      details: { reason: details },
      timestamp: new Date()
    });
  }

  /**
   * Log une demande de réinitialisation de mot de passe
   */
  logPasswordResetRequest(email: string, ipAddress: string, userAgent: string): void {
    this.logSecurityEvent({
      type: 'PASSWORD_RESET_REQUEST',
      email,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
  }

  /**
   * Log une réinitialisation de mot de passe réussie
   */
  logPasswordResetSuccess(userId: string, ipAddress: string): void {
    this.logSecurityEvent({
      type: 'PASSWORD_RESET_SUCCESS',
      userId,
      ipAddress,
      timestamp: new Date()
    });
  }

  /**
   * Log une vérification d'email
   */
  logEmailVerification(userId: string, email: string, ipAddress: string): void {
    this.logSecurityEvent({
      type: 'EMAIL_VERIFICATION',
      userId,
      email,
      ipAddress,
      timestamp: new Date()
    });
  }

  /**
   * Log un dépassement de limite de taux
   */
  logRateLimitExceeded(ipAddress: string, endpoint: string, userAgent?: string): void {
    this.logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ipAddress,
      userAgent,
      details: { endpoint },
      timestamp: new Date()
    });
  }

  /**
   * Log une activité suspecte
   */
  logSuspiciousActivity(description: string, userId?: string, email?: string, ipAddress?: string): void {
    this.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      email,
      ipAddress,
      details: { description },
      timestamp: new Date()
    });
  }

  /**
   * Sanitise un événement en masquant les informations sensibles
   */
  private sanitizeEvent(event: SecurityEvent): any {
    const sanitized: any = {
      type: event.type,
      timestamp: event.timestamp || new Date(),
    };

    // Hash de l'email pour l'identification sans révéler l'email
    if (event.email) {
      sanitized.userHash = this.hashEmail(event.email);
    }

    // Hash de l'userId
    if (event.userId) {
      sanitized.userIdHash = this.hashUserId(event.userId);
    }

    // Masquer l'IP (garder seulement les 3 premiers octets)
    if (event.ipAddress) {
      sanitized.maskedIp = this.maskIpAddress(event.ipAddress);
    }

    // Masquer le User-Agent (garder seulement le navigateur principal)
    if (event.userAgent) {
      sanitized.maskedUserAgent = this.maskUserAgent(event.userAgent);
    }

    // Détails sans informations sensibles
    if (event.details) {
      sanitized.details = this.sanitizeDetails(event.details);
    }

    return sanitized;
  }

  /**
   * Hash un email de manière déterministe pour le tracking
   */
  private hashEmail(email: string): string {
    return createHash('sha256')
      .update(email.toLowerCase() + process.env.LOG_SALT || 'default-salt')
      .digest('hex')
      .substring(0, 12); // Garder seulement les 12 premiers caractères
  }

  /**
   * Hash un userId
   */
  private hashUserId(userId: string): string {
    return createHash('sha256')
      .update(userId + process.env.LOG_SALT || 'default-salt')
      .digest('hex')
      .substring(0, 12);
  }

  /**
   * Masque une adresse IP (garde les 3 premiers octets)
   */
  private maskIpAddress(ip: string): string {
    if (ip.includes(':')) {
      // IPv6 - garder seulement les 4 premiers groupes
      const parts = ip.split(':');
      return parts.slice(0, 4).join(':') + ':****';
    } else {
      // IPv4 - garder les 3 premiers octets
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
      }
    }
    return 'masked-ip';
  }

  /**
   * Masque le User-Agent (garde seulement le navigateur principal)
   */
  private maskUserAgent(userAgent: string): string {
    // Extraire le navigateur principal
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown-Browser';
  }

  /**
   * Sanitise les détails en supprimant les informations sensibles
   */
  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

    for (const [key, value] of Object.entries(details)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = value.substring(0, 100) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Envoie vers un système de monitoring externe (à implémenter selon les besoins)
   */
  private sendToSecurityMonitoring(event: any): void {
    // Ici on pourrait envoyer vers:
    // - Elasticsearch/Kibana
    // - Splunk
    // - DataDog
    // - Sentry
    // - Un webhook personnalisé
    
    // Pour l'instant, on log juste en debug
    this.logger.debug(`[MONITORING] ${JSON.stringify(event)}`);
  }
}