import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { SecureLoggerService } from '../common/services/secure-logger.service';
import { RequestInfo } from '../common/decorators/request-info.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private secureLogger: SecureLoggerService,
  ) {}

  async register(registerDto: RegisterDto, requestInfo: RequestInfo) {
    const { email, password, firstName, lastName } = registerDto;

    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        this.secureLogger.logSecurityEvent({
          type: 'REGISTRATION_EMAIL_EXISTS',
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await argon2.hash(password);

      // Créer l'utilisateur
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Générer un token de vérification d'email
      const verificationToken = await this.generateEmailVerificationToken(user.id);

      // Envoyer l'email de vérification
      try {
        await this.emailService.sendEmailVerification(
          user.email,
          verificationToken,
          user.firstName,
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
        // On continue même si l'email n'a pas pu être envoyé
      }

      // Envoyer une notification à l'administrateur
      try {
        const registrationDate = new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        await this.emailService.sendAdminNotification(
          user.email,
          registrationDate,
          user.isEmailVerified
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification admin:', error);
        // On continue même si la notification admin n'a pas pu être envoyée
      }

      // Logger le succès de l'inscription
      this.secureLogger.logSecurityEvent({
        type: 'REGISTRATION',
        userId: user.id,
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        timestamp: new Date(),
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        requiresEmailVerification: true,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // Logger les erreurs inattendues
      this.secureLogger.logSecurityEvent({
        type: 'REGISTRATION_ERROR',
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        details: { error: error.message },
        timestamp: new Date(),
      });
      
      throw new InternalServerErrorException('Erreur lors de l\'inscription');
    }
  }

  async login(loginDto: LoginDto, requestInfo: RequestInfo) {
    const { email, password } = loginDto;

    try {
      // Trouver l'utilisateur
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.secureLogger.logSecurityEvent({
          type: 'LOGIN_INVALID_EMAIL',
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new UnauthorizedException('Identifiants invalides');
      }

      // Vérifier le mot de passe
      const passwordMatches = await argon2.verify(user.password, password);
      if (!passwordMatches) {
        this.secureLogger.logSecurityEvent({
          type: 'LOGIN_INVALID_PASSWORD',
          userId: user.id,
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new UnauthorizedException('Identifiants invalides');
      }

      // Vérifier si l'utilisateur est actif
      if (!user.isActive) {
        this.secureLogger.logSecurityEvent({
          type: 'LOGIN_INACTIVE_USER',
          userId: user.id,
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new UnauthorizedException('Compte désactivé');
      }

      // Vérifier si l'email est vérifié
      if (!user.isEmailVerified) {
        this.secureLogger.logSecurityEvent({
          type: 'LOGIN_UNVERIFIED_EMAIL',
          userId: user.id,
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new UnauthorizedException('Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception.');
      }

      // Générer les tokens
      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      // Logger la connexion réussie
      this.secureLogger.logSecurityEvent({
        type: 'AUTH_SUCCESS',
        userId: user.id,
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        timestamp: new Date(),
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Logger les erreurs inattendues
      this.secureLogger.logSecurityEvent({
        type: 'LOGIN_ERROR',
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        details: { error: error.message },
        timestamp: new Date(),
      });
      
      throw new InternalServerErrorException('Erreur lors de la connexion');
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Accès refusé');
    }

    const refreshTokenMatches = await this.verifyRefreshToken(userId, refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Accès refusé');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    
    // Supprimer les anciens refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Créer le nouveau refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });
  }

  private async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { 
        userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return false;
    }

    return argon2.verify(storedToken.token, refreshToken);
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto, requestInfo: RequestInfo) {
    const { email } = requestPasswordResetDto;

    try {
      // Vérifier si l'utilisateur existe
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        // Logger la tentative avec un email inexistant
        this.secureLogger.logSecurityEvent({
          type: 'PASSWORD_RESET_INVALID_EMAIL',
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
        return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await argon2.hash(resetToken);

      // Supprimer les anciens tokens de réinitialisation pour cet utilisateur
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Créer un nouveau token de réinitialisation (valide 1 heure)
      await this.prisma.passwordResetToken.create({
        data: {
          token: hashedToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 heure
        },
      });

      // Envoyer l'email avec le token de réinitialisation
      try {
        await this.emailService.sendPasswordReset(
          user.email,
          resetToken,
          user.firstName,
        );
        console.log(`Email de réinitialisation envoyé à ${email}`);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
        // On ne révèle pas l'erreur à l'utilisateur pour des raisons de sécurité
      }

      // Logger la demande de réinitialisation réussie
      this.secureLogger.logSecurityEvent({
        type: 'PASSWORD_RESET_REQUEST',
        userId: user.id,
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        timestamp: new Date(),
      });

      return { 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
        // En développement seulement
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      };
    } catch (error) {
      // Logger les erreurs inattendues
      this.secureLogger.logSecurityEvent({
        type: 'PASSWORD_RESET_ERROR',
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        details: { error: error.message },
        timestamp: new Date(),
      });
      
      throw new InternalServerErrorException('Erreur lors de la demande de réinitialisation');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, requestInfo: RequestInfo) {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Trouver le token de réinitialisation valide
      const resetTokenRecord = await this.prisma.passwordResetToken.findFirst({
        where: {
          expiresAt: { gt: new Date() },
        },
        include: {
          user: true,
        },
      });

      if (!resetTokenRecord) {
        this.secureLogger.logSecurityEvent({
          type: 'PASSWORD_RESET_INVALID_TOKEN',
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new BadRequestException('Token de réinitialisation invalide ou expiré');
      }

      // Vérifier le token
      const isValidToken = await argon2.verify(resetTokenRecord.token, token);
      if (!isValidToken) {
        this.secureLogger.logSecurityEvent({
          type: 'PASSWORD_RESET_INVALID_TOKEN',
          userId: resetTokenRecord.userId,
          email: resetTokenRecord.user.email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new BadRequestException('Token de réinitialisation invalide ou expiré');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await argon2.hash(newPassword);

      // Mettre à jour le mot de passe de l'utilisateur
      await this.prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      });

      // Supprimer le token de réinitialisation utilisé
      await this.prisma.passwordResetToken.delete({
        where: { id: resetTokenRecord.id },
      });

      // Supprimer tous les refresh tokens pour forcer une nouvelle connexion
      await this.prisma.refreshToken.deleteMany({
        where: { userId: resetTokenRecord.userId },
      });

      // Logger la réinitialisation réussie
      this.secureLogger.logSecurityEvent({
        type: 'PASSWORD_RESET_SUCCESS',
        userId: resetTokenRecord.userId,
        email: resetTokenRecord.user.email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        timestamp: new Date(),
      });

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Logger les erreurs inattendues
      this.secureLogger.logSecurityEvent({
        type: 'PASSWORD_RESET_ERROR',
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        details: { error: error.message },
        timestamp: new Date(),
      });
      
      throw new InternalServerErrorException('Erreur lors de la réinitialisation du mot de passe');
    }
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    // Supprimer les anciens tokens non utilisés
    await this.prisma.emailVerificationToken.deleteMany({
      where: {
        userId,
        used: false,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Générer un nouveau token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24 heures

    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto, requestInfo: RequestInfo) {
    const { token } = verifyEmailDto;

    try {
      // Vérifier si le token existe et n'est pas expiré
      const verificationToken = await this.prisma.emailVerificationToken.findFirst({
        where: {
          token,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!verificationToken) {
        this.secureLogger.logSecurityEvent({
          type: 'EMAIL_VERIFICATION_INVALID_TOKEN',
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new BadRequestException('Token de vérification invalide ou expiré');
      }

      // Vérifier si l'email n'est pas déjà vérifié
      if (verificationToken.user.isEmailVerified) {
        this.secureLogger.logSecurityEvent({
          type: 'EMAIL_VERIFICATION_ALREADY_VERIFIED',
          userId: verificationToken.userId,
          email: verificationToken.user.email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new BadRequestException('Email déjà vérifié');
      }

      // Marquer l'email comme vérifié
      await this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Marquer le token comme utilisé
      await this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });

      // Logger la vérification réussie
      this.secureLogger.logSecurityEvent({
        type: 'EMAIL_VERIFICATION_SUCCESS',
        userId: verificationToken.userId,
        email: verificationToken.user.email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        timestamp: new Date(),
      });

      return { message: 'Email vérifié avec succès' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Logger les erreurs inattendues
      this.secureLogger.logSecurityEvent({
        type: 'EMAIL_VERIFICATION_ERROR',
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        details: { error: error.message },
        timestamp: new Date(),
      });
      
      throw new InternalServerErrorException('Erreur lors de la vérification de l\'email');
    }
  }

  async resendVerificationEmail(resendVerificationDto: ResendVerificationDto, requestInfo: RequestInfo) {
    const { email } = resendVerificationDto;

    try {
      // Vérifier si l'utilisateur existe
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Logger la tentative avec un email inexistant
        this.secureLogger.logSecurityEvent({
          type: 'EMAIL_VERIFICATION_RESEND_INVALID_EMAIL',
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        // Pour des raisons de sécurité, on retourne le même message
        return { message: 'Si cet email existe, un nouveau lien de vérification a été envoyé' };
      }

      // Vérifier si l'email n'est pas déjà vérifié
      if (user.isEmailVerified) {
        this.secureLogger.logSecurityEvent({
          type: 'EMAIL_VERIFICATION_RESEND_ALREADY_VERIFIED',
          userId: user.id,
          email,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          timestamp: new Date(),
        });
        throw new BadRequestException('Email déjà vérifié');
      }

      // Générer un nouveau token
      const token = await this.generateEmailVerificationToken(user.id);

      // Envoyer l'email de vérification
      try {
        await this.emailService.sendEmailVerificationResend(
          user.email,
          token,
          user.firstName,
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
        // On ne révèle pas l'erreur à l'utilisateur pour des raisons de sécurité
      }

      // Logger le renvoi réussi
      this.secureLogger.logSecurityEvent({
        type: 'EMAIL_VERIFICATION_RESEND_SUCCESS',
        userId: user.id,
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        timestamp: new Date(),
      });

      return { message: 'Si cet email existe, un nouveau lien de vérification a été envoyé' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Logger les erreurs inattendues
      this.secureLogger.logSecurityEvent({
        type: 'EMAIL_VERIFICATION_RESEND_ERROR',
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        details: { error: error.message },
        timestamp: new Date(),
      });
      
      throw new InternalServerErrorException('Erreur lors du renvoi de l\'email de vérification');
    }
  }
}