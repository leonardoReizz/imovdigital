import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(tenantId: string, data: { email: string; password: string; name: string; phone?: string; role?: string }) {
    // Check plan limits
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true, _count: { select: { users: true } } },
    });
    if (tenant) {
      if (tenant.subscriptionStatus === 'TRIAL') {
        throw new BadRequestException('Adicionar membros não está disponível no teste grátis. Faça upgrade do seu plano.');
      }
      if (tenant._count.users >= tenant.plan.userLimit) {
        throw new BadRequestException(`Limite de ${tenant.plan.userLimit} membros atingido. Faça upgrade do seu plano.`);
      }
    }

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: data.email } },
    });
    if (existing) {
      throw new BadRequestException('Já existe um membro com este e-mail');
    }

    if (data.phone) {
      const phoneNormalized = data.phone.replace(/\D/g, '');
      const allUsers = await this.prisma.user.findMany({
        where: { tenantId, phone: { not: null }, deletedAt: null },
        select: { phone: true },
      });
      if (allUsers.some((u) => u.phone?.replace(/\D/g, '') === phoneNormalized)) {
        throw new BadRequestException('Já existe um membro com este telefone');
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        tenantId,
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        role: (data.role as any) || 'AGENT',
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async update(tenantId: string, id: string, data: { name?: string; phone?: string; role?: string; password?: string }) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new BadRequestException('Membro não encontrado');

    // Owner can only update name and phone
    if (user.role === 'OWNER') {
      if (data.role && data.role !== 'OWNER') {
        throw new BadRequestException('Não é possível alterar o cargo do proprietário');
      }
      if (data.password) {
        throw new BadRequestException('Altere a senha do proprietário nas configurações da conta');
      }
    }

    if (data.phone) {
      const phoneNormalized = data.phone.replace(/\D/g, '');
      const allUsers = await this.prisma.user.findMany({
        where: { tenantId, phone: { not: null }, deletedAt: null, id: { not: id } },
        select: { phone: true },
      });
      if (allUsers.some((u) => u.phone?.replace(/\D/g, '') === phoneNormalized)) {
        throw new BadRequestException('Já existe um membro com este telefone');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (user.role !== 'OWNER') {
      if (data.role !== undefined) updateData.role = data.role;
      if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    // Prevent deleting the last OWNER
    const owners = await this.prisma.user.count({
      where: { tenantId, role: 'OWNER' },
    });
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new BadRequestException('Membro não encontrado');
    if (user.role === 'OWNER') {
      throw new BadRequestException('Não é possível remover o proprietário da organização');
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
