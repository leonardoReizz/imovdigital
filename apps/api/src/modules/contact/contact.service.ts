import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.contactConfig.findUnique({ where: { tenantId } });
  }

  async upsert(tenantId: string, data: any) {
    return this.prisma.contactConfig.upsert({
      where: { tenantId },
      update: data,
      create: { ...data, tenantId },
    });
  }
}
