import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Triggers when the module initializes, ensuring the app connects to the database successfully
  async onModuleInit() {
    await this.$connect();
  }

  // Gracefully shuts down the connection when the app is stopped
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
