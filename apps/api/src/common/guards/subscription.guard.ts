import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SKIP_SUBSCRIPTION_CHECK } from '../decorators/skip-subscription-check.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_CHECK, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.tenantId) return true;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { subscriptionStatus: true, trialEndsAt: true },
    });
    if (!tenant) return true;

    const { subscriptionStatus, trialEndsAt } = tenant;

    if (subscriptionStatus === 'CANCELED') {
      throw new ForbiddenException('Sua assinatura foi cancelada. Assine um plano para continuar.');
    }

    if (subscriptionStatus === 'TRIAL' && trialEndsAt) {
      const now = new Date();
      if (new Date(trialEndsAt) < now) {
        throw new ForbiddenException('Seu período de teste expirou. Assine um plano para continuar.');
      }
    }

    return true;
  }
}
