import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { CheckPasswordStrengthDto } from './dto/check-password-strength.dto';
import { checkPasswordStrength } from '../common/validators/password.validator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { GetRequestInfo, RequestInfo } from '../common/decorators/request-info.decorator';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ auth: { limit: 3, ttl: 900000 } }) // 3 inscriptions par 15 min
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() registerDto: RegisterDto, @GetRequestInfo() requestInfo: RequestInfo) {
    return this.authService.register(registerDto, requestInfo);
  }

  @Post('login')
  @Throttle({ auth: { limit: 5, ttl: 900000 } }) // 5 tentatives par 15 min
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto, @GetRequestInfo() requestInfo: RequestInfo) {
    return this.authService.login(loginDto, requestInfo);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir les tokens' })
  @ApiResponse({ status: 200, description: 'Tokens rafraîchis' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(
      refreshTokenDto.userId,
      refreshTokenDto.refreshToken,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(@GetUser('id') userId: string) {
    await this.authService.logout(userId);
    return { message: 'Déconnexion réussie' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir les informations de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Informations utilisateur' })
  async getMe(@GetUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  @Post('request-reset')
  @Throttle({ 'password-reset': { limit: 3, ttl: 3600000 } }) // 3 demandes par heure
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander une réinitialisation de mot de passe' })
  @ApiResponse({ status: 200, description: 'Email de réinitialisation envoyé si l\'adresse existe' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto, @GetRequestInfo() requestInfo: RequestInfo) {
    return this.authService.requestPasswordReset(requestPasswordResetDto, requestInfo);
  }

  @Post('reset-password')
  @Throttle({ 'password-reset': { limit: 5, ttl: 3600000 } }) // 5 tentatives par heure
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec un token' })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @GetRequestInfo() requestInfo: RequestInfo) {
    return this.authService.resetPassword(resetPasswordDto, requestInfo);
  }

  @Post('verify-email')
  @Throttle({ 'email-verification': { limit: 3, ttl: 300000 } }) // 3 vérifications par 5 min
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier l\'adresse email avec un token' })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto, @GetRequestInfo() requestInfo: RequestInfo) {
    return this.authService.verifyEmail(verifyEmailDto, requestInfo);
  }

  @Post('resend-verification')
  @Throttle({ 'email-verification': { limit: 2, ttl: 300000 } }) // 2 renvois par 5 min
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renvoyer l\'email de vérification' })
  @ApiResponse({ status: 200, description: 'Email de vérification renvoyé si l\'adresse existe' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async resendVerificationEmail(@Body() resendVerificationDto: ResendVerificationDto, @GetRequestInfo() requestInfo: RequestInfo) {
    return this.authService.resendVerificationEmail(resendVerificationDto, requestInfo);
  }

  @Post('check-password-strength')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier la force d\'un mot de passe' })
  @ApiResponse({ status: 200, description: 'Analyse de la force du mot de passe' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async checkPasswordStrength(@Body() checkPasswordStrengthDto: CheckPasswordStrengthDto) {
    const result = checkPasswordStrength(checkPasswordStrengthDto.password);
    return {
      score: result.score,
      isStrong: result.isStrong,
      feedback: result.feedback,
      strength: this.getStrengthLabel(result.score)
    };
  }

  private getStrengthLabel(score: number): string {
    if (score >= 8) return 'Très fort';
    if (score >= 6) return 'Fort';
    if (score >= 4) return 'Moyen';
    if (score >= 2) return 'Faible';
    return 'Très faible';
  }
}