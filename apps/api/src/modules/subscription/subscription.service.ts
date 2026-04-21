import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TikTokEventsService } from './tiktok-events.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tiktok: TikTokEventsService,
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

    const changeStatus = await this.getPlanChangeStatus({
      stripeSubscriptionId: tenant.stripeSubscriptionId,
      subscriptionStatus: tenant.subscriptionStatus,
      planChangedAt: (tenant as unknown as { planChangedAt: Date | null }).planChangedAt ?? null,
    });

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
        canChangePlan: changeStatus.canChange,
        nextChangeAvailableAt: changeStatus.nextAvailableAt,
      },
      currentPlan: tenant.plan,
      currentBilling: tenant.billingInterval as 'monthly' | 'yearly',
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

  private async getPlanChangeStatus(tenant: { stripeSubscriptionId: string | null; subscriptionStatus: string; planChangedAt: Date | null }) {
    if (tenant.subscriptionStatus !== 'ACTIVE' || !tenant.stripeSubscriptionId) {
      return { canChange: true, nextAvailableAt: null as Date | null };
    }
    if (!tenant.planChangedAt) {
      return { canChange: true, nextAvailableAt: null };
    }
    const stripe = this.getStripe();
    if (!stripe) return { canChange: true, nextAvailableAt: null };
    try {
      const sub = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
      const periodEndUnix = sub.items.data[0]?.current_period_end;
      if (!periodEndUnix) return { canChange: true, nextAvailableAt: null };
      const periodEnd = new Date(periodEndUnix * 1000);
      const cutoff = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const canChange = Date.now() >= cutoff.getTime();
      return { canChange, nextAvailableAt: canChange ? null : cutoff };
    } catch {
      return { canChange: true, nextAvailableAt: null };
    }
  }

  async createCheckoutSession(tenantId: string, planId: string, billing: 'monthly' | 'yearly' = 'monthly') {
    const stripe = this.getStripe();
    if (!stripe) throw new BadRequestException('Stripe não configurado');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('Tenant não encontrado');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.stripePriceId) throw new BadRequestException('Plano não encontrado ou sem preço no Stripe');

    const priceId = billing === 'yearly' && plan.stripeYearlyPriceId
      ? plan.stripeYearlyPriceId
      : plan.stripePriceId;

    // Plan change: tenant already has an active subscription — update in place with proration
    if (tenant.stripeSubscriptionId && tenant.subscriptionStatus === 'ACTIVE') {
      try {
        const existing = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
        const currentItem = existing.items.data[0];

        if (currentItem?.price?.id === priceId) {
          throw new BadRequestException('Você já está neste plano');
        }

        const changeStatus = await this.getPlanChangeStatus({
          stripeSubscriptionId: tenant.stripeSubscriptionId,
          subscriptionStatus: tenant.subscriptionStatus,
          planChangedAt: (tenant as unknown as { planChangedAt: Date | null }).planChangedAt ?? null,
        });
        if (!changeStatus.canChange) {
          const availableAt = changeStatus.nextAvailableAt?.toISOString() ?? '';
          throw new BadRequestException(
            `Você já trocou de plano neste período. Próxima troca disponível em ${availableAt}.`,
          );
        }

        const updated = await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
          items: [{ id: currentItem.id, price: priceId }],
          proration_behavior: 'always_invoice',
          metadata: { tenantId, planId, billing },
        });

        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: { planId, billingInterval: billing, planChangedAt: new Date() } as never,
        });

        return { updated: true, subscriptionId: updated.id };
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        // Stripe sub missing/canceled — fall through to checkout
      }
    }

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
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${dashboardUrl}/dashboard/subscription?success=true`,
      cancel_url: `${dashboardUrl}/dashboard/subscription?canceled=true`,
      metadata: { tenantId, planId, billing },
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

  async cancelSubscription(
    tenantId: string,
    userId: string,
    reason: string,
    comment?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    if (!tenant) throw new BadRequestException('Tenant não encontrado');

    // Save feedback
    await this.prisma.cancellationFeedback.create({
      data: {
        tenantId,
        userId,
        reason,
        comment: comment || null,
        planName: tenant.plan.name,
      },
    });

    // Cancel Stripe subscription if exists
    const stripe = this.getStripe();
    if (stripe && tenant.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(tenant.stripeSubscriptionId);
      } catch {
        // Subscription may already be canceled
      }
    }

    // Update tenant status
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: 'CANCELED',
        stripeSubscriptionId: null,
      },
    });

    return { canceled: true };
  }

  async getCancellationSummary(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
        _count: { select: { properties: true, users: true, leads: true } },
      },
    });
    if (!tenant) throw new BadRequestException('Tenant não encontrado');

    const publishedPages = await this.prisma.page.count({
      where: { tenantId, status: 'published' },
    });

    return {
      planName: tenant.plan.name,
      properties: tenant._count.properties,
      users: tenant._count.users,
      leads: tenant._count.leads,
      hasSitePublished: publishedPages > 0,
      hasCustomDomain: !!tenant.customDomain,
    };
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
        const billing = session.metadata?.billing || 'monthly';
        if (tenantId && planId) {
          await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
              planId,
              subscriptionStatus: 'ACTIVE',
              stripeSubscriptionId: session.subscription as string,
              billingInterval: billing,
            },
          });

          const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
          const owner = await this.prisma.user.findFirst({
            where: { tenantId, role: { in: ['OWNER', 'ADMIN'] } },
            orderBy: { createdAt: 'asc' },
          });
          const priceCents = billing === 'yearly' ? plan?.yearlyPrice : plan?.monthlyPrice;
          const value = priceCents ? priceCents / 100 : undefined;
          const userData = {
            email: owner?.email,
            phone: owner?.phone,
            externalId: tenantId,
          };
          const properties = {
            value,
            currency: 'BRL',
            contents: plan
              ? [{ content_id: plan.id, content_type: 'product', content_name: plan.name }]
              : undefined,
          };

          await Promise.all([
            this.tiktok.sendEvent('Purchase', userData, properties, session.id),
            this.tiktok.sendEvent('Subscribe', userData, properties, session.id),
          ]);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (tenant) {
          const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
          const billingInterval = interval === 'year' ? 'yearly' : 'monthly';
          const status = sub.status === 'active' ? 'ACTIVE' :
                         sub.status === 'past_due' ? 'OVERDUE' :
                         sub.status === 'canceled' ? 'CANCELED' : tenant.subscriptionStatus;
          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: { subscriptionStatus: status, billingInterval },
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
