import { Test, TestingModule } from '@nestjs/testing';
import { SecureLoggerService } from './secure-logger.service';
import { Logger } from '@nestjs/common';

describe('SecureLoggerService', () => {
  let service: SecureLoggerService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecureLoggerService],
    }).compile();

    service = module.get<SecureLoggerService>(SecureLoggerService);
    
    // Spy sur les méthodes du logger
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log security event with correct format', () => {
    loggerSpy.mockClear(); // Reset le spy avant le test
    
    const securityEvent = {
      type: 'AUTH_SUCCESS' as const,
      userId: 'user123',
      email: 'test@example.com',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date(),
    };

    service.logSecurityEvent(securityEvent);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('[SECURITY]'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('AUTH_SUCCESS'),
    );
    // Vérifier que l'email n'apparaît PAS en clair (il doit être haché)
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.not.stringContaining('test@example.com'),
    );
    // Vérifier que l'IP est masquée
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('192.168.1.***'),
    );
  });

  it('should sanitize sensitive information', () => {
    const securityEvent = {
      type: 'REGISTRATION_ERROR' as const,
      email: 'test@example.com',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      details: { 
        error: 'Database connection failed',
        password: 'secret123' // Cette information ne devrait pas apparaître dans les logs
      },
      timestamp: new Date(),
    };

    service.logSecurityEvent(securityEvent);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.not.stringContaining('secret123'),
    );
  });

  it('should use appropriate log level based on event type', () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Test événement de niveau warning
    service.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date(),
    });

    expect(warnSpy).toHaveBeenCalled();

    // Reset les mocks
    warnSpy.mockClear();
    errorSpy.mockClear();

    // Test événement de niveau error
    service.logSecurityEvent({
      type: 'ACCOUNT_LOCKED',
      userId: 'user123',
      email: 'test@example.com',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date(),
    });

    expect(errorSpy).toHaveBeenCalled();
  });

  it('should log auth attempt correctly', () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    
    service.logAuthAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0', true);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('AUTH_SUCCESS'),
    );

    loggerSpy.mockClear();

    service.logAuthAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0', false, 'Invalid password');

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('AUTH_FAILURE'),
    );
  });

  it('should log password reset request correctly', () => {
    loggerSpy.mockClear(); // Reset le spy avant le test
    
    service.logPasswordResetRequest('test@example.com', '192.168.1.1', 'Mozilla/5.0');

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('PASSWORD_RESET_REQUEST'),
    );
  });
});