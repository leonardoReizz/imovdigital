import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async list(@CurrentUser('tenantId') tenantId: string) {
    return this.userService.findAll(tenantId);
  }

  @Post()
  async create(@CurrentUser('tenantId') tenantId: string, @Body() body: any) {
    return this.userService.create(tenantId, body);
  }

  @Patch(':id')
  async update(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() body: any) {
    return this.userService.update(tenantId, id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.userService.remove(tenantId, id);
  }
}
