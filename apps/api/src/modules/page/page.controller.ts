import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PageService } from './page.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePageDto, UpdatePageDto } from './page.dto';

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  list(@CurrentUser('tenantId') tenantId: string) {
    return this.pageService.list(tenantId);
  }

  @Post()
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreatePageDto,
  ) {
    return this.pageService.create(tenantId, dto);
  }

  @Get(':id')
  get(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.get(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pageService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.remove(tenantId, id);
  }

  @Post(':id/publish')
  publish(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.publish(tenantId, id);
  }

  @Post(':id/reset-template')
  resetTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.resetToTemplate(tenantId, id);
  }
}
