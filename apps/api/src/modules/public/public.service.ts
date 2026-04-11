import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  COMMERCIAL: 'Imóvel Comercial',
  LAND: 'Terreno',
  RURAL: 'Imóvel Rural',
};

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getBaseUrl(slug: string, customDomain?: string | null) {
    const baseDomain = this.config.get('BASE_DOMAIN') || 'imovdigital.com.br';
    return customDomain
      ? `https://${customDomain}`
      : `https://${slug}.${baseDomain}`;
  }

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

  async getFilterOptions(slug: string, city?: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const allProperties = await this.prisma.property.findMany({
      where: { tenantId: tenant.id, active: true },
      select: { city: true, neighborhood: true },
    });

    const cities = [...new Set(allProperties.map((p) => p.city).filter(Boolean))].sort();

    // If city filter is provided, only return neighborhoods from that city
    const filtered = city
      ? allProperties.filter((p) => p.city.toLowerCase() === city.toLowerCase())
      : allProperties;
    const neighborhoods = [...new Set(filtered.map((p) => p.neighborhood).filter(Boolean))].sort();

    return { cities, neighborhoods };
  }

  async listProperties(slug: string, query: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const where: any = { tenantId: tenant.id, active: true };

    if (query.q) {
      const q = query.q as string;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { neighborhood: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (query.type) where.type = query.type;
    if (query.listingType) where.listingType = query.listingType;
    if (query.city) where.city = { equals: query.city, mode: 'insensitive' };
    if (query.neighborhood) where.neighborhood = { equals: query.neighborhood, mode: 'insensitive' };
    if (query.bedrooms) where.bedrooms = { gte: parseInt(query.bedrooms) };
    if (query.bathrooms) where.bathrooms = { gte: parseInt(query.bathrooms) };
    if (query.parkingSpots) where.parkingSpots = { gte: parseInt(query.parkingSpots) };
    if (query.minPrice) where.price = { ...(where.price || {}), gte: parseInt(query.minPrice) };
    if (query.maxPrice) where.price = { ...(where.price || {}), lte: parseInt(query.maxPrice) };

    const sortByPrice = query.sort === 'price_asc' || query.sort === 'price_desc';
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'featured') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
    else if (!sortByPrice && query.sort) orderBy = { createdAt: 'desc' };

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));

    if (sortByPrice) {
      // Fetch all matching, sort by effective price (price or rentPrice), then paginate
      const [allData, total] = await Promise.all([
        this.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' } }),
        this.prisma.property.count({ where }),
      ]);

      const getEffectivePrice = (p: any) => {
        if (p.listingType === 'RENT') return p.rentPrice || p.price || 0;
        if (p.listingType === 'BOTH') return p.price || p.rentPrice || 0;
        return p.price || 0;
      };

      allData.sort((a: any, b: any) => {
        const priceA = getEffectivePrice(a);
        const priceB = getEffectivePrice(b);
        return query.sort === 'price_asc' ? priceA - priceB : priceB - priceA;
      });

      const data = allData.slice((page - 1) * limit, page * limit);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.property.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.property.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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

  async getGoogleReviews(placeId: string, minRating = 0) {
    if (!placeId) return [];
    const apiKey = this.config.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) return [];

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&language=pt-BR&key=${apiKey}`,
      );
      const data = await res.json();
      const reviews = data.result?.reviews || [];

      return reviews
        .filter((r: any) => r.rating >= minRating)
        .slice(0, 8)
        .map((r: any) => ({
          name: r.author_name,
          text: r.text,
          rating: r.rating,
          avatarUrl: r.profile_photo_url || null,
          time: r.relative_time_description,
        }));
    } catch {
      return [];
    }
  }

  async resolveDomain(domain: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { customDomain: domain } });
    if (!tenant) throw new NotFoundException('Domínio não encontrado');
    return { slug: tenant.slug };
  }

  async getSiteConfig(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { contactConfig: true },
    });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const config = await this.prisma.siteConfig.findUnique({ where: { tenantId: tenant.id } });
    if (!config) return null;

    return config.data;
  }

  async createLead(slug: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { plan: true, contactConfig: true },
    });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const lead = await this.prisma.lead.create({
      data: { ...data, tenantId: tenant.id },
      include: { property: { select: { title: true, slug: true } } },
    });

    // Send WhatsApp notification via Z-API (only for plans with whatsappNotifications)
    const features = (tenant.plan.features as any) || {};
    const cc = tenant.contactConfig;

    if (features.whatsappNotifications && cc) {
      if (cc.leadPipelineEnabled) {
        // Pipeline mode: notify master + next agent in round-robin
        this.handlePipelineLead(cc, lead, slug, tenant.customDomain).catch((err) => {
          console.error('Pipeline notification failed:', err.message);
        });
      } else if (cc.leadNotifyPhones.length > 0) {
        // Simple mode: notify all configured phones
        this.sendLeadNotifications(cc.leadNotifyPhones, lead, slug, tenant.customDomain, null).catch((err) => {
          console.error('Z-API notification failed:', err.message);
        });
      }
    }

    return lead;
  }

  private async handlePipelineLead(
    cc: { id: string; leadMasterPhone: string | null; leadPipelineAgents: any; leadPipelineCurrentIndex: number },
    lead: any,
    tenantSlug: string,
    customDomain: string | null,
  ) {
    const agents: { name: string; phone: string; active: boolean; leadCount: number }[] = cc.leadPipelineAgents || [];
    const activeAgents = agents.filter((a) => a.active && a.phone);

    // Find the next agent in round-robin
    let assignedAgent: typeof agents[0] | null = null;
    if (activeAgents.length > 0) {
      const index = cc.leadPipelineCurrentIndex % activeAgents.length;
      assignedAgent = activeAgents[index];

      // Update the agent's lead count and the round-robin index
      const updatedAgents = agents.map((a) =>
        a.phone === assignedAgent!.phone ? { ...a, leadCount: (a.leadCount || 0) + 1 } : a
      );
      await this.prisma.contactConfig.update({
        where: { id: cc.id },
        data: {
          leadPipelineAgents: updatedAgents,
          leadPipelineCurrentIndex: index + 1,
        },
      });
    }

    // Build phones to notify
    const phonesToNotify: string[] = [];
    if (cc.leadMasterPhone) phonesToNotify.push(cc.leadMasterPhone);
    if (assignedAgent) phonesToNotify.push(assignedAgent.phone);

    if (phonesToNotify.length > 0) {
      await this.sendLeadNotifications(phonesToNotify, lead, tenantSlug, customDomain, assignedAgent?.name || null);
    }
  }

  private async sendLeadNotifications(
    phones: string[],
    lead: any,
    tenantSlug: string,
    customDomain: string | null,
    assignedAgentName: string | null,
  ) {
    const instanceId = this.config.get('ZAPI_INSTANCE_ID');
    const token = this.config.get('ZAPI_TOKEN');
    if (!instanceId || !token) return;

    const baseUrl = customDomain
      ? `https://${customDomain}`
      : `https://${tenantSlug}.${this.config.get('BASE_DOMAIN') || 'imovdigital.com.br'}`;

    const propertyLine = lead.property
      ? `*Interesse:* ${lead.property.title}\n${baseUrl}/imoveis/${lead.property.slug}`
      : 'Contato geral pelo site';

    const replyLink = lead.phone
      ? `https://wa.me/${lead.phone.replace(/\D/g, '')}`
      : '';

    const message = [
      '🏠 *Novo lead!*',
      '',
      `*Nome:* ${lead.name}`,
      lead.phone ? `*Telefone:* ${lead.phone}` : null,
      lead.email ? `*E-mail:* ${lead.email}` : null,
      lead.message ? `*Mensagem:* ${lead.message}` : null,
      assignedAgentName ? `\n📋 *Designado para:* ${assignedAgentName}` : null,
      '',
      propertyLine,
      replyLink ? `\n👉 Responder: ${replyLink}` : null,
    ].filter(Boolean).join('\n');

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

    const clientToken = this.config.get('ZAPI_CLIENT_TOKEN') || '';

    for (const phone of phones) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone) continue;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': clientToken,
          },
          body: JSON.stringify({ phone: cleanPhone, message }),
        });
        const body = await res.text();
        console.log(`[ZAPI] Sent to ${cleanPhone}: ${res.status} ${body}`);
      } catch (err: any) {
        console.error(`[ZAPI] Error sending to ${cleanPhone}:`, err.message);
      }
    }
  }

  // ─── SEO: Sitemap ───────────────────────────────────────────

  async generateSitemap(slug: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const baseUrl = this.getBaseUrl(slug, tenant.customDomain);

    const properties = await this.prisma.property.findMany({
      where: { tenantId: tenant.id, active: true },
      select: { slug: true, updatedAt: true, images: true },
      orderBy: { updatedAt: 'desc' },
    });

    const urls = [
      { loc: baseUrl, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/imoveis`, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/sobre`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${baseUrl}/contato`, changefreq: 'monthly', priority: '0.5' },
      ...properties.map((p) => ({
        loc: `${baseUrl}/imoveis/${p.slug}`,
        changefreq: 'weekly' as const,
        priority: '0.8',
        lastmod: p.updatedAt.toISOString().split('T')[0],
        image: Array.isArray(p.images) && p.images.length > 0 ? (p.images[0] as any)?.url : null,
      })),
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
      ...urls.map((u) => {
        let entry = `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>`;
        if ('lastmod' in u && u.lastmod) entry += `\n    <lastmod>${u.lastmod}</lastmod>`;
        if ('image' in u && u.image) entry += `\n    <image:image>\n      <image:loc>${u.image}</image:loc>\n    </image:image>`;
        entry += '\n  </url>';
        return entry;
      }),
      '</urlset>',
    ].join('\n');

    return xml;
  }

  // ─── SEO: Robots.txt ───────────────────────────────────────

  async generateRobots(slug: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const baseUrl = this.getBaseUrl(slug, tenant.customDomain);

    return [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');
  }

  // ─── SEO: Open Graph + JSON-LD for a property ──────────────

  async getPropertySeoData(slug: string, propertySlug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { contactConfig: true },
    });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const property = await this.prisma.property.findFirst({
      where: { tenantId: tenant.id, slug: propertySlug, active: true },
    });
    if (!property) throw new NotFoundException('Imóvel não encontrado');

    const baseUrl = this.getBaseUrl(slug, tenant.customDomain);
    const url = `${baseUrl}/imoveis/${property.slug}`;
    const images = (property.images as any[]) || [];
    const firstImage = images.length > 0 ? images[0]?.url : null;
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price / 100);
    const typeName = TYPE_LABELS[property.type] || property.type;
    const isRent = property.listingType === 'RENT';

    // Open Graph
    const openGraph = {
      'og:type': 'website',
      'og:title': property.metaTitle || `${property.title} - ${tenant.name}`,
      'og:description': property.metaDescription || `${typeName} em ${property.neighborhood}, ${property.city}. ${priceFormatted}${isRent ? '/mês' : ''}. ${property.bedrooms} quartos, ${property.area}m².`,
      'og:url': url,
      'og:image': firstImage,
      'og:site_name': tenant.name,
      'og:locale': 'pt_BR',
    };

    // Twitter Card
    const twitter = {
      'twitter:card': 'summary_large_image',
      'twitter:title': openGraph['og:title'],
      'twitter:description': openGraph['og:description'],
      'twitter:image': firstImage,
    };

    // JSON-LD (Schema.org RealEstateListing)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.title,
      description: property.description,
      url,
      datePosted: property.createdAt.toISOString(),
      dateModified: property.updatedAt.toISOString(),
      ...(firstImage && { image: images.map((img: any) => img.url) }),
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.fullAddress,
        addressLocality: property.city,
        addressRegion: property.state,
        postalCode: property.zipCode,
        addressCountry: 'BR',
      },
      geo: property.latitude && property.longitude ? {
        '@type': 'GeoCoordinates',
        latitude: property.latitude,
        longitude: property.longitude,
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: property.price / 100,
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        ...(isRent && { priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }),
      },
      numberOfRooms: property.bedrooms || undefined,
      floorSize: property.area ? {
        '@type': 'QuantitativeValue',
        value: property.area,
        unitCode: 'MTK',
      } : undefined,
      provider: {
        '@type': 'RealEstateAgent',
        name: tenant.name,
        url: baseUrl,
        ...(tenant.logoUrl && { logo: tenant.logoUrl }),
      },
    };

    return { openGraph, twitter, jsonLd, canonical: url };
  }

  // ─── SEO: Home page meta ───────────────────────────────────

  async getHomeSeoData(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        contactConfig: true,
        _count: { select: { properties: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Imobiliária não encontrada');

    const baseUrl = this.getBaseUrl(slug, tenant.customDomain);
    const siteConfig = await this.prisma.siteConfig.findUnique({ where: { tenantId: tenant.id } });
    const configData = siteConfig?.data as any;

    // Build location-aware SEO
    const city = tenant.contactConfig?.city;
    const state = tenant.contactConfig?.state;
    const locationStr = city && state ? ` em ${city}, ${state}` : city ? ` em ${city}` : '';

    const title = `${tenant.name} | Imóveis à Venda e Aluguel${locationStr}`;
    const description = city
      ? `${tenant.name} - Imobiliária${locationStr}. ${tenant._count.properties} imóveis disponíveis para venda e aluguel. Encontre casas, apartamentos e muito mais.`
      : `Encontre os melhores imóveis com ${tenant.name}. ${tenant._count.properties} imóveis disponíveis para venda e aluguel. Casas, apartamentos, terrenos e mais.`;

    const openGraph = {
      'og:type': 'website',
      'og:title': title,
      'og:description': description,
      'og:url': baseUrl,
      'og:image': tenant.logoUrl || tenant.bannerUrl,
      'og:site_name': tenant.name,
      'og:locale': 'pt_BR',
    };

    const address = tenant.contactConfig?.address;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: tenant.name,
      url: baseUrl,
      ...(tenant.logoUrl && { logo: tenant.logoUrl }),
      ...(address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: city || undefined,
          addressRegion: state || undefined,
          addressCountry: 'BR',
        },
      }),
      ...(tenant.contactConfig?.phone && { telephone: tenant.contactConfig.phone }),
      ...(tenant.contactConfig?.email && { email: tenant.contactConfig.email }),
    };

    return { title, description, openGraph, jsonLd, canonical: baseUrl };
  }
}
