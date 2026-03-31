import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  async createCheckoutSession(_tenantId: string, _planId: string) {
    // TODO: implement Stripe integration
    return { message: 'Stripe checkout ainda não implementado' };
  }

  async createPortalSession(_tenantId: string) {
    // TODO: implement Stripe billing portal
    return { message: 'Portal de faturamento ainda não implementado' };
  }

  async handleWebhook(_req: any) {
    // TODO: implement Stripe webhook processing
    return { received: true };
  }
}
