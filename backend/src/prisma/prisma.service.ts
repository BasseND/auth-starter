import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Base de données connectée');
    } catch (err: any) {
      console.warn('⚠️ Échec de connexion à la base de données (dev):', err?.message || err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}