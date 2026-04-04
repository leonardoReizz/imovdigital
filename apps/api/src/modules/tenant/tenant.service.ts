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

    // DNS verified — generate SSL certificate and configure nginx
    const sslResult = await this.setupCustomDomainSSL(tenant.customDomain);

    return {
      verified: true,
      domain: tenant.customDomain,
      ssl: sslResult.ssl,
      ...(sslResult.error && { sslError: sslResult.error }),
    };
  }

  private async setupCustomDomainSSL(domain: string): Promise<{ ssl: boolean; error?: string }> {
    const sslEmail = this.config.get('SSL_EMAIL') || 'ssl@imovdigital.com.br';
    const webApp = this.config.get('CAPROVER_WEB_APP') || 'imovdigital-cliente';

    // Sanitize domain to prevent injection
    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(domain)) {
      return { ssl: false, error: 'Domínio inválido' };
    }

    try {
      const { execSync } = require('child_process');
      const fs = require('fs');

      // 1. Create webroot directory for ACME challenge
      const webrootPath = `/captain-domains/${domain}/.well-known/acme-challenge`;
      fs.mkdirSync(webrootPath, { recursive: true });

      // 2. Generate SSL certificate via certbot (Docker socket mounted)
      const certbotContainer = execSync('docker ps -q -f name=captain-certbot', { encoding: 'utf-8' }).trim();
      if (!certbotContainer) throw new Error('Certbot container not found');

      const certResult = execSync(
        `docker exec ${certbotContainer} certbot certonly --webroot -w /captain-webroot/${domain} -d ${domain} --non-interactive --agree-tos --email ${sslEmail}`,
        { timeout: 120000, encoding: 'utf-8' },
      );
      this.logger.log(`Certbot for ${domain}: ${certResult}`);

      // 3. Write nginx config for this domain
      const nginxConf = `server {
    listen 80;
    server_name ${domain};
    return 301 https://\\$host\\$request_uri;
}

server {
    listen 443 ssl;
    server_name ${domain};
    ssl_certificate /letencrypt/etc/live/${domain}/fullchain.pem;
    ssl_certificate_key /letencrypt/etc/live/${domain}/privkey.pem;

    location / {
        proxy_pass http://srv-captain--${webApp}:3000;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
    }

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/domains/${domain};
    }
}
`;
      // Write to nginx conf.d on the host (mounted volume)
      fs.writeFileSync(`/captain-nginx-conf/custom-${domain}.conf`, nginxConf);
      this.logger.log(`Nginx config written for ${domain}`);

      // 4. Reload nginx
      const nginxContainer = execSync('docker ps -q -f name=captain-nginx', { encoding: 'utf-8' }).trim();
      execSync(`docker exec ${nginxContainer} nginx -s reload`, { timeout: 10000, encoding: 'utf-8' });
      this.logger.log(`Nginx reloaded for ${domain}`);

      return { ssl: true };
    } catch (err: any) {
      this.logger.error(`SSL setup failed for ${domain}:`, err.message);
      return { ssl: false, error: err.message };
    }
  }
}
