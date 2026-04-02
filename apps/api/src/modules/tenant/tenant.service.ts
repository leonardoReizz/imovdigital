import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as dns from 'dns/promises';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
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
    const expectedCname = `${tenant.slug}.${baseDomain}`;

    try {
      const records = await dns.resolveCname(tenant.customDomain);
      const hasCname = records.some((r) => r === expectedCname || r === `${expectedCname}.`);

      if (hasCname) {
        return { verified: true, domain: tenant.customDomain, cname: expectedCname };
      }

      return {
        verified: false,
        domain: tenant.customDomain,
        expected: expectedCname,
        found: records,
        reason: `CNAME não aponta para ${expectedCname}`,
      };
    } catch {
      // Try A record or TXT as fallback info
      try {
        const aRecords = await dns.resolve4(tenant.customDomain);
        return {
          verified: false,
          domain: tenant.customDomain,
          expected: expectedCname,
          found: aRecords,
          reason: `Configure um CNAME apontando para ${expectedCname}`,
        };
      } catch {
        return {
          verified: false,
          domain: tenant.customDomain,
          expected: expectedCname,
          reason: `Nenhum registro DNS encontrado. Configure um CNAME apontando para ${expectedCname}`,
        };
      }
    }
  }
}
