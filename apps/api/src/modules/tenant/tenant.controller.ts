import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async get(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantService.findById(tenantId);
  }

  @Patch()
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    return this.tenantService.update(tenantId, body);
  }
}
