import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface RequestInfo {
  ipAddress: string;
  userAgent: string;
  origin?: string;
}

export const GetRequestInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // Extraire l'IP en tenant compte des proxies
    const getClientIp = (req: Request): string => {
      const forwarded = req.headers['x-forwarded-for'];
      const realIp = req.headers['x-real-ip'];
      const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
      
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      }
      
      if (typeof realIp === 'string') {
        return realIp;
      }
      
      if (typeof cfConnectingIp === 'string') {
        return cfConnectingIp;
      }
      
      return req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             (req.connection as any)?.socket?.remoteAddress || 
             'unknown';
    };

    return {
      ipAddress: getClientIp(request),
      userAgent: request.headers['user-agent'] || 'unknown',
      origin: request.headers.origin || request.headers.referer || 'unknown'
    };
  },
);