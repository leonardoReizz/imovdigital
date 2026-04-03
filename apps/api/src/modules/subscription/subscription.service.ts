import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getStripe() {
    if (this.stripe) return this.stripe;
    const key = this.config.get('STRIPE_SECRET_KEY');
    if (!key || key === 'sk_test_...') return null;
    this.stripe = new Stripe(key);
    return this.stripe;
  }

  async getSubscriptionInfo(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true, _count: { select: { properties: true, users: true } } },
    });
    if (!tenant) throw new BadRequestException('Tenant não encontrado');

    const plans = await this.prisma.plan.findMany({ orderBy: { monthlyPrice: 'asc' } });

    const now = new Date();
    const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null;
    const trialDaysLeft = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    const trialExpired = tenant.subscriptionStatus === 'TRIAL' && trialEndsAt && trialEndsAt < now;

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subscriptionStatus: tenant.subscriptionStatus,
        trialEndsAt: tenant.trialEndsAt,
        trialDaysLeft,
        trialExpired,
        hasPaymentMethod: !!tenant.stripeCustomerId,
        hasSubscription: !!tenant.stripeSubscriptionId,
      },
      currentPlan: tenant.plan,
      plans,
      usage: {
        properties: tenant._count.properties,
        users: tenant._count.users,
      },
      limits: {
        properties: tenant.subscriptionStatus === 'TRIAL' ? 10 : tenant.plan.propertyLimit,
        users: tenant.subscriptionStatus === 'TRIAL' ? 1 : tenant.plan.userLimit,
        customDomain: tenant.subscriptionStatus !== 'TRIAL',
        leads: tenant.subscriptionStatus !== 'TRIAL',
        team: tenant.subscriptionStatus !== 'TRIAL',
      },
    };
  }

  async createCheckoutSession(tenantId: string, planId: string) {
    const stripe = this.getStripe();
    if (!stripe) throw new BadRequestException('Stripe não configurado');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('Tenant não encontrado');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.stripePriceId) throw new BadRequestException('Plano não encontrado ou sem preço no Stripe');

    // Get or create Stripe customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { tenantId },
        name: tenant.name,
      });
      customerId = customer.id;
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    const dashboardUrl = this.config.get('DASHBOARD_URL') || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${dashboardUrl}/dashboard/subscription?success=true`,
      cancel_url: `${dashboardUrl}/dashboard/subscription?canceled=true`,
      metadata: { tenantId, planId },
    });

    return { url: session.url };
  }

  async createPortalSession(tenantId: string) {
    const stripe = this.getStripe();
    if (!stripe) throw new BadRequestException('Stripe não configurado');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant?.stripeCustomerId) {
      throw new BadRequestException('Nenhuma assinatura ativa');
    }

    const dashboardUrl = this.config.get('DASHBOARD_URL') || 'http://localhost:5173';

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${dashboardUrl}/dashboard/subscription`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const stripe = this.getStripe();
    if (!stripe) return { received: true };

    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || webhookSecret === 'whsec_...') return { received: true };

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId;
        const planId = session.metadata?.planId;
        if (tenantId && planId) {
          await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
              planId,
              subscriptionStatus: 'ACTIVE',
              stripeSubscriptionId: session.subscription as string,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (tenant) {
          const status = sub.status === 'active' ? 'ACTIVE' :
                         sub.status === 'past_due' ? 'OVERDUE' :
                         sub.status === 'canceled' ? 'CANCELED' : tenant.subscriptionStatus;
          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: { subscriptionStatus: status },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (tenant) {
          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: { subscriptionStatus: 'CANCELED', stripeSubscriptionId: null },
          });
        }
        break;
      }
    }

    return { received: true };
  }
}
