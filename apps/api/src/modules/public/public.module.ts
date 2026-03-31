import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { TenantContextMiddleware } from '../../common/middleware/tenant-context.middleware';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('public');
  }
}
