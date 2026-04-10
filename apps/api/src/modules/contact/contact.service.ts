import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.contactConfig.findUnique({ where: { tenantId } });
  }

  async upsert(tenantId: string, data: any) {
    // Validate leadNotifyPhones limit based on plan
    if (data.leadNotifyPhones && Array.isArray(data.leadNotifyPhones)) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true },
      });
      const features = (tenant?.plan?.features as any) || {};

      if (!features.whatsappNotifications) {
        data.leadNotifyPhones = [];
      } else {
        const maxPhones = features.prioritySupport ? 5 : 2;
        if (data.leadNotifyPhones.length > maxPhones) {
          throw new BadRequestException(`Limite de ${maxPhones} números para o seu plano.`);
        }
      }
    }

    return this.prisma.contactConfig.upsert({
      where: { tenantId },
      update: data,
      create: { ...data, tenantId },
    });
  }
}
