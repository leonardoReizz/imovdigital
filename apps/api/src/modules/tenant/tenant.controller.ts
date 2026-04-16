import { Controller, Get, Patch, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async get(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantService.findById(tenantId);
  }

  @Get('dashboard')
  async dashboard(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantService.getDashboardStats(tenantId);
  }

  @Patch()
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    return this.tenantService.update(tenantId, body);
  }

  @Get('check-slug')
  async checkSlug(
    @CurrentUser('tenantId') tenantId: string,
    @Query('slug') slug: string,
  ) {
    return this.tenantService.checkSlugAvailability(slug, tenantId);
  }

  @Patch('slug')
  async updateSlug(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { slug: string },
  ) {
    return this.tenantService.updateSlug(tenantId, body.slug);
  }

  @Patch('domain')
  async updateDomain(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { domain: string | null },
  ) {
    return this.tenantService.updateCustomDomain(tenantId, body.domain);
  }

  @Post('verify-domain')
  async verifyDomain(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantService.verifyDomain(tenantId);
  }
}
