import { Controller, Get, Post, Param, Query, Body, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':slug')
  async tenant(@Param('slug') slug: string) {
    return this.publicService.findTenant(slug);
  }

  @Get(':slug/filters')
  async filterOptions(@Param('slug') slug: string, @Query('city') city?: string) {
    return this.publicService.getFilterOptions(slug, city);
  }

  @Get(':slug/properties')
  async listProperties(@Param('slug') slug: string, @Query() query: any) {
    return this.publicService.listProperties(slug, query);
  }

  @Get(':slug/properties/:propertySlug')
  async findProperty(
    @Param('slug') slug: string,
    @Param('propertySlug') propertySlug: string,
  ) {
    return this.publicService.findProperty(slug, propertySlug);
  }

  @Get('resolve-domain')
  async resolveDomain(@Query('domain') domain: string) {
    return this.publicService.resolveDomain(domain);
  }

  @Get(':slug/site-config')
  async siteConfig(@Param('slug') slug: string) {
    return this.publicService.getSiteConfig(slug);
  }

  @Post(':slug/leads')
  async createLead(@Param('slug') slug: string, @Body() body: any) {
    return this.publicService.createLead(slug, body);
  }

  // ─── SEO Endpoints ─────────────────────────────────────────

  @Get(':slug/sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async sitemap(@Param('slug') slug: string, @Res() res: Response) {
    const xml = await this.publicService.generateSitemap(slug);
    res.send(xml);
  }

  @Get(':slug/robots.txt')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'public, max-age=86400')
  async robots(@Param('slug') slug: string, @Res() res: Response) {
    const txt = await this.publicService.generateRobots(slug);
    res.send(txt);
  }

  @Get(':slug/seo/home')
  async homeSeo(@Param('slug') slug: string) {
    return this.publicService.getHomeSeoData(slug);
  }

  @Get(':slug/seo/property/:propertySlug')
  async propertySeo(
    @Param('slug') slug: string,
    @Param('propertySlug') propertySlug: string,
  ) {
    return this.publicService.getPropertySeoData(slug, propertySlug);
  }
}
