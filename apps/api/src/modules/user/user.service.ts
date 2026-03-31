import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.user.create({ data: { ...data, tenantId } });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
