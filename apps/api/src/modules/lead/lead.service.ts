import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const where: any = { tenantId };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
        { phone: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.seen === 'true') where.seen = true;
    if (query.seen === 'false') where.seen = false;
    if (query.source) where.source = query.source;

    const orderBy: any = query.sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [data, total, unseenCount] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy,
        include: { property: { select: { id: true, title: true, slug: true } } },
      }),
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { tenantId, seen: false } }),
    ]);

    return { data, total, unseenCount };
  }

  async markSeen(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new BadRequestException('Lead não encontrado');
    return this.prisma.lead.update({ where: { id }, data: { seen: true } });
  }

  async markAllSeen(tenantId: string) {
    return this.prisma.lead.updateMany({
      where: { tenantId, seen: false },
      data: { seen: true },
    });
  }

  async remove(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new BadRequestException('Lead não encontrado');
    return this.prisma.lead.delete({ where: { id } });
  }
}
