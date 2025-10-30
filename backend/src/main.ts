import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité - Configuration Helmet stricte
  app.use(helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
      },
    },
    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: { policy: "same-origin" },
    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    // Frame Options
    frameguard: { action: 'deny' },
    // Hide Powered-By
    hidePoweredBy: true,
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true
    },
    // IE No Open
    ieNoOpen: true,
    // No Sniff
    noSniff: true,
    // Origin Agent Cluster
    originAgentCluster: true,
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: false,
    // Referrer Policy
    referrerPolicy: { policy: "no-referrer" },
    // X-XSS-Protection
    xssFilter: true,
  }));
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth Starter API')
    .setDescription('API d\'authentification complète avec NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend démarré sur http://localhost:${port}`);
  console.log(`📚 Documentation Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();