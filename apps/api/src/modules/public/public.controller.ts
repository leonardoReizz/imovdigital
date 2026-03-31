import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':slug')
  async tenant(@Param('slug') slug: string) {
    return this.publicService.findTenant(slug);
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

  @Post(':slug/leads')
  async createLead(@Param('slug') slug: string, @Body() body: any) {
    return this.publicService.createLead(slug, body);
  }
}
