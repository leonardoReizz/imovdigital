import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const baseDomain = process.env.BASE_DOMAIN || 'imovdigital.com.br';

    let tenant = null;

    if (host.endsWith(`.${baseDomain}`)) {
      // Subdomínio: agencia.imovdigital.com.br
      const slug = host.replace(`.${baseDomain}`, '');
      tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    } else if (host !== baseDomain && !host.startsWith('localhost')) {
      // Domínio próprio: imoveis.minhaagencia.com.br
      tenant = await this.prisma.tenant.findUnique({
        where: { customDomain: host },
      });
    }

    if (tenant) {
      (req as any).tenantId = tenant.id;
      (req as any).tenant = tenant;
    }

    next();
  }
}
