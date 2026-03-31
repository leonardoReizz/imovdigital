import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateSiteConfigDto } from './site-config.dto';

@UseGuards(JwtAuthGuard)
@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get()
  async get(@CurrentUser('tenantId') tenantId: string) {
    return this.siteConfigService.findByTenant(tenantId);
  }

  @Patch()
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateSiteConfigDto,
  ) {
    return this.siteConfigService.update(tenantId, dto);
  }

  @Post('publish')
  async publish(@CurrentUser('tenantId') tenantId: string) {
    return this.siteConfigService.publish(tenantId);
  }
}
