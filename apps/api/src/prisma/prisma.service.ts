import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private keepAliveTimer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    super({
      datasourceUrl: process.env.DATABASE_URL,
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    (this as any).$on('error', (e: any) => {
      this.logger.error('Prisma error:', e.message);
    });
    (this as any).$on('warn', (e: any) => {
      this.logger.warn('Prisma warning:', e.message);
    });
  }

  async onModuleInit() {
    let retries = 3;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('Database connected');
        break;
      } catch (err) {
        retries--;
        this.logger.warn(`Database connection failed, ${retries} retries left...`);
        if (retries === 0) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Keep connection alive — ping every 4 minutes to prevent Neon from suspending
    this.keepAliveTimer = setInterval(async () => {
      try {
        await this.$queryRaw`SELECT 1`;
      } catch {
        this.logger.warn('Keep-alive ping failed, reconnecting...');
        try {
          await this.$disconnect();
          await this.$connect();
          this.logger.log('Reconnected after keep-alive failure');
        } catch (err) {
          this.logger.error('Reconnection failed:', (err as Error).message);
        }
      }
    }, 4 * 60 * 1000);
  }

  async onModuleDestroy() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    await this.$disconnect();
  }
}
