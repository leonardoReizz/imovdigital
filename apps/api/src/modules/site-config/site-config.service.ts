import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSiteConfigDto } from './site-config.dto';
import { DEFAULT_SECTION_SETTINGS, DEFAULT_PROPERTY_DETAIL_CONFIG, SectionType } from '@imovdigital/types';
import { randomUUID } from 'crypto';

const DEFAULT_SECTIONS: SectionType[] = [
  'hero',
  'search_bar',
  'featured_listings',
  'about',
  'testimonials',
  'cta_banner',
  'contact',
  'footer',
];

@Injectable()
export class SiteConfigService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDefaultConfig(tenantId: string) {
    return {
      id: randomUUID(),
      tenantId,
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Inter',
      logoUrl: null,
      faviconUrl: null,
      sections: DEFAULT_SECTIONS.map((type, index) => ({
        id: randomUUID(),
        type,
        order: index,
        visible: true,
        settings: DEFAULT_SECTION_SETTINGS[type],
      })),
      propertyDetail: DEFAULT_PROPERTY_DETAIL_CONFIG,
      updatedAt: new Date().toISOString(),
    };
  }

  async findByTenant(tenantId: string) {
    const record = await this.prisma.siteConfig.findUnique({
      where: { tenantId },
    });

    if (!record) {
      // Auto-create with defaults
      const defaultData = this.buildDefaultConfig(tenantId);
      const created = await this.prisma.siteConfig.create({
        data: {
          tenantId,
          data: defaultData as any,
        },
      });
      return created.data;
    }

    return record.data;
  }

  async update(tenantId: string, dto: UpdateSiteConfigDto) {
    const existing = await this.prisma.siteConfig.findUnique({
      where: { tenantId },
    });

    if (!existing) {
      // Create with defaults merged with dto
      const defaultData = this.buildDefaultConfig(tenantId);
      const merged = { ...defaultData, ...dto, updatedAt: new Date().toISOString() };
      const created = await this.prisma.siteConfig.create({
        data: {
          tenantId,
          data: merged as any,
        },
      });
      return created.data;
    }

    const currentData = existing.data as Record<string, unknown>;
    const updatedData = {
      ...currentData,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    const updated = await this.prisma.siteConfig.update({
      where: { tenantId },
      data: {
        data: updatedData as any,
        published: false,
      },
    });

    return updated.data;
  }

  async publish(tenantId: string) {
    const existing = await this.prisma.siteConfig.findUnique({
      where: { tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Site config not found. Save your config first.');
    }

    const updated = await this.prisma.siteConfig.update({
      where: { tenantId },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });

    return { published: true, publishedAt: updated.publishedAt };
  }
}
