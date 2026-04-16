import { Controller, Get, Patch, Param, Body, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ConfigService } from '@nestjs/config';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly config: ConfigService,
  ) {}

  private validateAdminKey(authorization: string) {
    const adminKey = this.config.get('ADMIN_API_KEY');
    if (!adminKey || authorization !== `Bearer ${adminKey}`) {
      throw new UnauthorizedException('Invalid admin key');
    }
  }

  @Get('dashboard')
  async dashboard(@Headers('authorization') auth: string) {
    this.validateAdminKey(auth);
    return this.adminService.getDashboardStats();
  }

  @Get('tenants')
  async listTenants(@Headers('authorization') auth: string) {
    this.validateAdminKey(auth);
    return this.adminService.listTenants();
  }

  @Get('plans')
  async plans(@Headers('authorization') auth: string) {
    this.validateAdminKey(auth);
    return this.adminService.getPlans();
  }

  @Patch('tenants/:id/plan')
  async setTenantPlan(
    @Headers('authorization') auth: string,
    @Param('id') tenantId: string,
    @Body() body: { planId: string; subscriptionStatus: string },
  ) {
    this.validateAdminKey(auth);
    return this.adminService.setTenantPlan(tenantId, body.planId, body.subscriptionStatus);
  }
}
