import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
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
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
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
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Trouver l'utilisateur
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier le mot de passe
    const passwordMatches = await argon2.verify(user.password, password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception.');
    }

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

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

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    // Vérifier si l'utilisateur existe
    const user = await this.usersService.findByEmail(email);
    if (!user) {
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

    // TODO: Envoyer l'email avec le token de réinitialisation
    // Pour l'instant, on retourne le token en développement
    console.log(`Token de réinitialisation pour ${email}: ${resetToken}`);

    return { 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      // En développement seulement
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

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
      throw new BadRequestException('Token de réinitialisation invalide ou expiré');
    }

    // Vérifier le token
    const isValidToken = await argon2.verify(resetTokenRecord.token, token);
    if (!isValidToken) {
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

    return { message: 'Mot de passe réinitialisé avec succès' };
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

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

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
      throw new BadRequestException('Token de vérification invalide ou expiré');
    }

    // Vérifier si l'email n'est pas déjà vérifié
    if (verificationToken.user.isEmailVerified) {
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

    return { message: 'Email vérifié avec succès' };
  }

  async resendEmailVerification(resendVerificationDto: ResendVerificationDto) {
    const { email } = resendVerificationDto;

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on retourne le même message
      return { message: 'Si cet email existe, un nouveau lien de vérification a été envoyé' };
    }

    // Vérifier si l'email n'est pas déjà vérifié
    if (user.isEmailVerified) {
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

    return { message: 'Si cet email existe, un nouveau lien de vérification a été envoyé' };
  }
}