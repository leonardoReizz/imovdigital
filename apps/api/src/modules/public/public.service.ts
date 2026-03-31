import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async findTenant(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { contactConfig: true, plan: true },
    });

    if (!tenant) {
      throw new NotFoundException('Imobiliária não encontrada');
    }

    return {
      name: tenant.name,
      slug: tenant.slug,
      logoUrl: tenant.logoUrl,
      bannerUrl: tenant.bannerUrl,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      fontFamily: tenant.fontFamily,
      layoutStyle: tenant.layoutStyle,
      contact: tenant.contactConfig,
    };
  }

  async listProperties(slug: string, _query: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    // TODO: implement filters and pagination
    const properties = await this.prisma.property.findMany({
      where: { tenantId: tenant.id, active: true },
      orderBy: { createdAt: 'desc' },
    });

    return { data: properties, total: properties.length, page: 1, limit: 20, totalPages: 1 };
  }

  async findProperty(slug: string, propertySlug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const property = await this.prisma.property.findFirst({
      where: { tenantId: tenant.id, slug: propertySlug, active: true },
    });

    if (!property) throw new NotFoundException('Imóvel não encontrado');
    return property;
  }

  async createLead(slug: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    return this.prisma.lead.create({
      data: { ...data, tenantId: tenant.id },
    });
  }
}
