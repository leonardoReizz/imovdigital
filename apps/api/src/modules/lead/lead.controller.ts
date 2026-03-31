import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
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

  @Patch(':id/seen')
  async markSeen(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.leadService.markSeen(tenantId, id);
  }
}
