import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async get(@CurrentUser('tenantId') tenantId: string) {
    return this.contactService.findByTenant(tenantId);
  }

  @Patch()
  async update(@CurrentUser('tenantId') tenantId: string, @Body() body: any) {
    return this.contactService.upsert(tenantId, body);
  }
}
