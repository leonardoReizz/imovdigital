import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalTenants, totalUsers, totalProperties, totalLeads, activeTenants, trialTenants] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.property.count(),
      this.prisma.lead.count(),
      this.prisma.tenant.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      this.prisma.tenant.count({ where: { subscriptionStatus: 'TRIAL' } }),
    ]);

    return { totalTenants, totalUsers, totalProperties, totalLeads, activeTenants, trialTenants };
  }

  async listTenants() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        plan: { select: { id: true, name: true, slug: true, monthlyPrice: true } },
        _count: { select: { users: true, properties: true, leads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      customDomain: t.customDomain,
      subscriptionStatus: t.subscriptionStatus,
      plan: t.plan,
      createdAt: t.createdAt,
      trialEndsAt: t.trialEndsAt,
      _count: t._count,
    }));
  }

  async getPlans() {
    return this.prisma.plan.findMany({ orderBy: { monthlyPrice: 'asc' } });
  }

  async setTenantPlan(tenantId: string, planId: string, subscriptionStatus: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new BadRequestException('Plano não encontrado');

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        planId,
        subscriptionStatus: subscriptionStatus as any,
        ...(subscriptionStatus === 'ACTIVE' ? { trialEndsAt: null } : {}),
      },
      include: {
        plan: { select: { id: true, name: true, slug: true, monthlyPrice: true } },
      },
    });
  }
}
