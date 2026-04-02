import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getInfo(@CurrentUser('tenantId') tenantId: string) {
    return this.subscriptionService.getSubscriptionInfo(tenantId);
  }

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
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.subscriptionService.handleWebhook(req.rawBody!, signature);
  }
}
