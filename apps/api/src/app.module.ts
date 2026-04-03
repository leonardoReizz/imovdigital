import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { PlanModule } from './modules/plan/plan.module';
import { PropertyModule } from './modules/property/property.module';
import { UserModule } from './modules/user/user.module';
import { ContactModule } from './modules/contact/contact.module';
import { LeadModule } from './modules/lead/lead.module';
import { UploadModule } from './modules/upload/upload.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PublicModule } from './modules/public/public.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },   // 10 req/s
      { name: 'medium', ttl: 60000, limit: 100 }, // 100 req/min
    ]),
    PrismaModule,
    AuthModule,
    TenantModule,
    PlanModule,
    PropertyModule,
    UserModule,
    ContactModule,
    LeadModule,
    UploadModule,
    SubscriptionModule,
    PublicModule,
    SiteConfigModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
