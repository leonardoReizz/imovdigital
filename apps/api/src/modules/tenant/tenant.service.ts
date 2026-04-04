import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as dns from 'dns/promises';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async getDashboardStats(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalProperties,
      activeProperties,
      featuredProperties,
      totalLeads,
      leadsThisMonth,
      leadsLastMonth,
      unseenLeads,
      totalUsers,
      recentLeads,
      recentProperties,
      propertiesByType,
      propertiesByListing,
    ] = await Promise.all([
      this.prisma.property.count({ where: { tenantId } }),
      this.prisma.property.count({ where: { tenantId, active: true } }),
      this.prisma.property.count({ where: { tenantId, featured: true } }),
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      this.prisma.lead.count({ where: { tenantId, seen: false } }),
      this.prisma.user.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.lead.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { property: { select: { title: true, slug: true } } },
      }),
      this.prisma.property.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, price: true, rentPrice: true, listingType: true, active: true, images: true, createdAt: true },
      }),
      this.prisma.property.groupBy({
        by: ['type'],
        where: { tenantId, active: true },
        _count: true,
      }),
      this.prisma.property.groupBy({
        by: ['listingType'],
        where: { tenantId, active: true },
        _count: true,
      }),
    ]);

    const leadsGrowth = leadsLastMonth > 0
      ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
      : leadsThisMonth > 0 ? 100 : 0;

    // Check if tenant has leads access (not on trial)
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { subscriptionStatus: true } });
    const canAccessLeads = tenant?.subscriptionStatus !== 'TRIAL';

    const maskName = (name: string) => name.charAt(0) + '•'.repeat(Math.max(name.length - 1, 3));

    return {
      cards: {
        totalProperties,
        activeProperties,
        featuredProperties,
        leadsThisMonth,
        unseenLeads,
        totalUsers,
        leadsGrowth,
      },
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        name: canAccessLeads ? l.name : maskName(l.name),
        email: canAccessLeads ? l.email : null,
        phone: canAccessLeads ? l.phone : null,
        message: canAccessLeads ? l.message : null,
        source: l.source,
        seen: l.seen,
        propertyTitle: l.property?.title || null,
        createdAt: l.createdAt,
      })),
      recentProperties,
      propertiesByType: propertiesByType.map((g) => ({ type: g.type, count: g._count })),
      propertiesByListing: propertiesByListing.map((g) => ({ listingType: g.listingType, count: g._count })),
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async update(id: string, data: any) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async checkSlugAvailability(slug: string, currentTenantId: string) {
    const normalized = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!normalized || normalized.length < 3) {
      return { available: false, slug: normalized, reason: 'Mínimo de 3 caracteres' };
    }

    if (normalized.length > 63) {
      return { available: false, slug: normalized, reason: 'Máximo de 63 caracteres' };
    }

    const reserved = ['www', 'api', 'app', 'admin', 'dashboard', 'mail', 'ftp', 'cdn', 'static'];
    if (reserved.includes(normalized)) {
      return { available: false, slug: normalized, reason: 'Este subdomínio é reservado' };
    }

    const existing = await this.prisma.tenant.findUnique({ where: { slug: normalized } });
    if (existing && existing.id !== currentTenantId) {
      return { available: false, slug: normalized, reason: 'Este subdomínio já está em uso' };
    }

    return { available: true, slug: normalized };
  }

  async updateSlug(tenantId: string, slug: string) {
    const check = await this.checkSlugAvailability(slug, tenantId);
    if (!check.available) {
      throw new BadRequestException(check.reason);
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { slug: check.slug },
    });
  }

  async updateCustomDomain(tenantId: string, domain: string | null) {
    if (!domain) {
      return this.prisma.tenant.update({
        where: { id: tenantId },
        data: { customDomain: null },
      });
    }

    // Check plan limit
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant?.subscriptionStatus === 'TRIAL') {
      throw new BadRequestException('Domínio personalizado não está disponível no teste grátis. Faça upgrade do seu plano.');
    }

    const normalized = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(normalized)) {
      throw new BadRequestException('Domínio inválido');
    }

    const existing = await this.prisma.tenant.findUnique({ where: { customDomain: normalized } });
    if (existing && existing.id !== tenantId) {
      throw new BadRequestException('Este domínio já está em uso por outra imobiliária');
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { customDomain: normalized },
    });
  }

  async verifyDomain(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant?.customDomain) {
      return { verified: false, reason: 'Nenhum domínio configurado' };
    }

    const baseDomain = this.config.get('BASE_DOMAIN') || 'imovdigital.com.br';
    const originDomain = `origin.${baseDomain}`;
    const expectedCname = `${tenant.slug}.${baseDomain}`;
    const serverIp = this.config.get('SERVER_IP') || '';

    // Check DNS: accept CNAME to origin.imovdigital.com.br, slug.imovdigital.com.br, or A record to server IP
    let dnsOk = false;
    let dnsInfo = '';

    try {
      const records = await dns.resolveCname(tenant.customDomain);
      dnsOk = records.some((r) =>
        r === originDomain || r === `${originDomain}.` ||
        r === expectedCname || r === `${expectedCname}.`
      );
      dnsInfo = records.join(', ');
    } catch {
      // No CNAME, try A record
      try {
        const aRecords = await dns.resolve4(tenant.customDomain);
        dnsOk = serverIp ? aRecords.includes(serverIp) : false;
        dnsInfo = aRecords.join(', ');
      } catch {
        return {
          verified: false,
          domain: tenant.customDomain,
          expected: originDomain,
          reason: `Nenhum registro DNS encontrado. Configure um CNAME apontando para ${originDomain}`,
        };
      }
    }

    if (!dnsOk) {
      return {
        verified: false,
        domain: tenant.customDomain,
        expected: originDomain,
        found: dnsInfo,
        reason: `DNS não aponta para ${originDomain}. Configure um CNAME apontando para ${originDomain}`,
      };
    }

    // DNS verified — register domain in Caddy for auto-SSL
    const caddyResult = await this.registerDomainInCaddy(tenant.customDomain);

    return {
      verified: true,
      domain: tenant.customDomain,
      ssl: caddyResult.ssl,
      ...(caddyResult.error && { sslError: caddyResult.error }),
    };
  }

  private async registerDomainInCaddy(domain: string): Promise<{ ssl: boolean; error?: string }> {
    const caddyUrl = this.config.get('CADDY_API_URL');
    const webAppUrl = this.config.get('CADDY_UPSTREAM') || 'srv-captain--imovdigital-cliente:3000';

    if (!caddyUrl) {
      this.logger.warn('Caddy not configured, skipping domain registration');
      return { ssl: false, error: 'Caddy não configurado' };
    }

    try {
      // Add route via Caddy Admin API
      const caddyConfig = {
        '@id': `custom-${domain}`,
        match: [{ host: [domain] }],
        handle: [
          {
            handler: 'reverse_proxy',
            upstreams: [{ dial: webAppUrl }],
            headers: {
              request: {
                set: {
                  'Host': ['{http.request.host}'],
                  'X-Real-IP': ['{http.request.remote.host}'],
                  'X-Forwarded-For': ['{http.request.remote.host}'],
                  'X-Forwarded-Proto': ['{http.request.scheme}'],
                },
              },
            },
          },
        ],
        terminal: true,
      };

      // First, try to delete existing route (ignore errors)
      await fetch(`${caddyUrl}/id/custom-${domain}`, { method: 'DELETE' }).catch(() => {});

      // Add route to Caddy
      const res = await fetch(`${caddyUrl}/config/apps/http/servers/srv0/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caddyConfig),
      });

      if (res.ok) {
        this.logger.log(`Domain ${domain} registered in Caddy with auto-SSL`);
        return { ssl: true };
      }

      const error = await res.text();
      this.logger.warn(`Caddy registration failed for ${domain}: ${error}`);
      return { ssl: false, error };
    } catch (err: any) {
      this.logger.error(`Caddy registration failed for ${domain}:`, err.message);
      return { ssl: false, error: err.message };
    }
  }
}
