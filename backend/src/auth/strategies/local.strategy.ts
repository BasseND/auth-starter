import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Dans le contexte de Passport, nous n'avons pas accès aux informations de requête
    // Nous passons des valeurs par défaut
    const defaultRequestInfo = {
      ipAddress: 'unknown',
      userAgent: 'passport-local',
      origin: 'local-strategy'
    };
    
    const result = await this.authService.login({ email, password }, defaultRequestInfo);
    
    if (!result) {
      throw new UnauthorizedException();
    }
    
    return result.user;
  }
}