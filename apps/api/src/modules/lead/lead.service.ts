import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, _query: any) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { property: { select: { title: true, slug: true } } },
    });
  }

  async markSeen(tenantId: string, id: string) {
    return this.prisma.lead.update({
      where: { id },
      data: { seen: true },
    });
  }
}
