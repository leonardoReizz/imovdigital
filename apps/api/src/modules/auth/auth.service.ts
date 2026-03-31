import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
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

    let slug = generateSlug(dto.agencyName);

    const existingSlug = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const trialPlan = await this.prisma.plan.findFirst({
      orderBy: { monthlyPrice: 'asc' },
    });

    if (!trialPlan) {
      throw new Error('Nenhum plano encontrado. Execute o seed do banco de dados.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.agencyName,
          slug,
          planId: trialPlan.id,
          subscriptionStatus: 'TRIAL',
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

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.tenantId,
      user.role,
    );

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
}
