import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Resend } from 'resend';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { generateSlug } from '@imovdigital/utils';

interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  agencyName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    let slug = await this.generateUniqueSlug(dto.agencyName);

    const trialPlan = await this.prisma.plan.findFirst({
      orderBy: { monthlyPrice: 'asc' },
    });

    if (!trialPlan) {
      throw new Error('Nenhum plano encontrado. Execute o seed do banco de dados.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const tenant = await tx.tenant.create({
        data: {
          name: dto.agencyName,
          slug,
          planId: trialPlan.id,
          subscriptionStatus: 'TRIAL',
          trialEndsAt,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          passwordHash,
          name: dto.name,
          phone: dto.phone || null,
          role: 'OWNER',
        },
      });

      await tx.contactConfig.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          showForm: true,
        },
      });

      return { user, tenant };
    });

    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.tenant.id,
      result.user.role,
    );

    return {
      ...tokens,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
    };
  }

  async login(email: string, password: string, tenantId?: string) {
    // Find all user accounts with this email
    const users = await this.prisma.user.findMany({
      where: { email, deletedAt: null },
      include: { tenant: true },
    });

    if (users.length === 0) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // Validate password against the first account (all share same password per email)
    const passwordValid = await bcrypt.compare(password, users[0].passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // If tenantId specified, use that; otherwise use the first (or only) tenant
    const user = tenantId
      ? users.find((u) => u.tenantId === tenantId)
      : users[0];

    if (!user) {
      throw new UnauthorizedException('Imobiliária não encontrada');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.tenantId,
      user.role,
    );

    const tenants = users.map((u) => ({
      id: u.tenant.id,
      name: u.tenant.name,
      slug: u.tenant.slug,
      role: u.role,
    }));

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      },
      tenants,
    };
  }

  async switchTenant(email: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, tenantId, deletedAt: null },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Acesso não encontrado para esta imobiliária');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.tenantId,
      user.role,
    );

    return {
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    };
  }

  async listTenants(email: string) {
    const users = await this.prisma.user.findMany({
      where: { email, deletedAt: null },
      include: { tenant: true },
    });

    return users.map((u) => ({
      id: u.tenant.id,
      name: u.tenant.name,
      slug: u.tenant.slug,
      role: u.role,
    }));
  }

  async createTenant(userId: string, agencyName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const finalSlug = await this.generateUniqueSlug(agencyName);

    const trialPlan = await this.prisma.plan.findFirst({ orderBy: { monthlyPrice: 'asc' } });
    if (!trialPlan) throw new Error('Nenhum plano encontrado');

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: agencyName,
          slug: finalSlug,
          planId: trialPlan.id,
          subscriptionStatus: 'TRIAL',
          trialEndsAt,
        },
      });

      const newUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          phone: user.phone,
          role: 'OWNER',
        },
      });

      await tx.contactConfig.create({
        data: { tenantId: tenant.id, email: user.email, showForm: true },
      });

      return { tenant, user: newUser };
    });

    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.tenant.id,
      result.user.role,
    );

    return {
      ...tokens,
      tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }

      return this.generateTokens(
        user.id,
        user.email,
        user.tenantId,
        user.role,
      );
    } catch {
      throw new UnauthorizedException('Token expirado ou inválido');
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: { plan: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        subscriptionStatus: user.tenant.subscriptionStatus,
        plan: {
          name: user.tenant.plan.name,
          slug: user.tenant.plan.slug,
        },
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) return { message: 'Se o e-mail estiver cadastrado, você receberá um código.' };

    // Generate 6-digit code and hash it
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 6);
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetCode: hashedCode, resetCodeExpiry: expiry },
    });

    // Send email via Resend
    const resendKey = this.config.get<string>('RESEND_API_KEY');
    const fromEmail = this.config.get('EMAIL_FROM') || 'noreply@imovdigital.com.br';

    if (resendKey && resendKey !== 're_...') {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: `ImovDigital <${fromEmail}>`,
        to: user.email,
        subject: 'Seu código de recuperação - ImovDigital',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1f2937; margin-bottom: 8px;">Recuperação de senha</h2>
            <p style="color: #6b7280; font-size: 14px;">Olá ${user.name},</p>
            <p style="color: #6b7280; font-size: 14px;">Use o código abaixo para redefinir sua senha:</p>
            <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">Este código expira em 15 minutos.</p>
            <p style="color: #9ca3af; font-size: 12px;">Se você não solicitou a recuperação, ignore este e-mail.</p>
          </div>
        `,
      });
    } else {
      console.log(`[DEV] Reset code for ${email}: ${code}`);
    }

    return { message: 'Se o e-mail estiver cadastrado, você receberá um código.' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    if (new Date() > user.resetCodeExpiry) {
      // Clear expired code
      await this.prisma.user.update({ where: { id: user.id }, data: { resetCode: null, resetCodeExpiry: null } });
      throw new BadRequestException('Código expirado. Solicite um novo.');
    }

    const valid = await bcrypt.compare(code, user.resetCode);
    if (!valid) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    return { valid: true };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    // Verify code first
    await this.verifyResetCode(email, code);

    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
      },
    });

    return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Senha atual incorreta');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { message: 'Senha alterada com sucesso' };
  }

  async softDeleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new BadRequestException('Senha incorreta');

    // Check if user is the last OWNER
    if (user.role === 'OWNER') {
      const ownerCount = await this.prisma.user.count({
        where: { tenantId: user.tenantId, role: 'OWNER', deletedAt: null },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Não é possível excluir o último proprietário da imobiliária');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Conta excluída com sucesso' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    tenantId: string,
    role: string,
  ) {
    const payload = { sub: userId, email, tenantId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = generateSlug(name);
    const existing = await this.prisma.tenant.findUnique({ where: { slug: base } });
    if (!existing) return base;

    for (let i = 2; i <= 99; i++) {
      const candidate = `${base}-${i}`;
      const found = await this.prisma.tenant.findUnique({ where: { slug: candidate } });
      if (!found) return candidate;
    }

    return `${base}-${Date.now().toString(36)}`;
  }
}
