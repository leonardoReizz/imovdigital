import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { LeadService } from './lead.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  async list(@CurrentUser('tenantId') tenantId: string, @Query() query: any) {
    return this.leadService.findAll(tenantId, query);
  }

  @Patch('mark-all-seen')
  async markAllSeen(@CurrentUser('tenantId') tenantId: string) {
    return this.leadService.markAllSeen(tenantId);
  }

  @Patch(':id/seen')
  async markSeen(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.leadService.markSeen(tenantId, id);
  }

  @Delete(':id')
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.leadService.remove(tenantId, id);
  }
}
