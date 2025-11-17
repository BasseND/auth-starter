import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { RequestInfo } from '../../common/decorators/request-info.decorator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, email: string, password: string): Promise<any> {
    const getClientIp = (r: Request): string => {
      const forwarded = r.headers['x-forwarded-for'];
      const realIp = r.headers['x-real-ip'];
      const cfConnectingIp = r.headers['cf-connecting-ip'];
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      }
      if (typeof realIp === 'string') {
        return realIp;
      }
      if (typeof cfConnectingIp === 'string') {
        return cfConnectingIp;
      }
      return (
        (req.connection && (req.connection.remoteAddress || (req.connection as any).socket?.remoteAddress)) ||
        req.socket.remoteAddress ||
        'unknown'
      );
    };

    const requestInfo: RequestInfo = {
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      origin: (req.headers.origin as string) || (req.headers.referer as string) || 'unknown',
    };

    const result = await this.authService.login({ email, password }, requestInfo);
    
    if (!result) {
      throw new UnauthorizedException();
    }
    
    return result.user;
  }
}