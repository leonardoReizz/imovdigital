import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PropertyService } from './property.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@CurrentUser('tenantId') tenantId: string) {
    return this.propertyService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.propertyService.findById(tenantId, id);
  }

  @Post()
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    try {
      return await this.propertyService.create(tenantId, body);
    } catch (error) {
      console.error('Property create error:', error);
      throw error;
    }
  }

  @Post('generate-seo')
  async generateSeo(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant?.subscriptionStatus === 'TRIAL') {
      throw new ForbiddenException('Recurso disponível apenas para planos pagos.');
    }
    return this.propertyService.generateSeo(body);
  }

  @Patch(':id')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.propertyService.update(tenantId, id, body);
  }

  @Delete(':id')
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.propertyService.remove(tenantId, id);
  }
}
