import { Controller, Post, Body, UseGuards, RawBodyRequest, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { planId: string },
  ) {
    return this.subscriptionService.createCheckoutSession(tenantId, body.planId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  async billingPortal(@CurrentUser('tenantId') tenantId: string) {
    return this.subscriptionService.createPortalSession(tenantId);
  }

  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>) {
    return this.subscriptionService.handleWebhook(req);
  }
}
