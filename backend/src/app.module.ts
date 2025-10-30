import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Rate limiting avec configuration avancée
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // Requêtes générales
      },
      {
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 5, // Tentatives de connexion
      },
      {
        name: 'password-reset',
        ttl: 3600000, // 1 heure
        limit: 3, // Demandes de reset
      },
      {
        name: 'email-verification',
        ttl: 300000, // 5 minutes
        limit: 3, // Vérifications email
      }
    ]),
    
    // Modules métier
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}