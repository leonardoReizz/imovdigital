import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

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
    // Retry connection on startup
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

    // Middleware: auto-reconnect on connection errors
    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('Connection') || msg.includes('Closed') || msg.includes('connection')) {
          this.logger.warn(`Connection lost during ${params.model}.${params.action}, reconnecting...`);
          await this.$disconnect();
          await this.$connect();
          return next(params);
        }
        throw err;
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Reconnect if connection was closed (Neon idle timeout) */
  async ensureConnection() {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch {
      this.logger.warn('Connection lost, reconnecting...');
      await this.$disconnect();
      await this.$connect();
    }
  }
}
