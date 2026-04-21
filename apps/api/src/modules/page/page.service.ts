import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_THEME,
  RESERVED_SLUGS,
  RESERVED_TITLES,
  buildDefaultTemplate,
  isReservedSlug,
  type Page,
  type PageData,
  type ReservedSlug,
} from '@imovdigital/types';
import { CreatePageDto, UpdatePageDto } from './page.dto';

function hasAnyPropertyBlock(sections: unknown[]): boolean {
  const walk = (nodes: unknown): boolean => {
    if (!Array.isArray(nodes)) return false;
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const t = (node as { type?: unknown }).type;
      if (typeof t === 'string' && t.startsWith('property_')) return true;
      const children = (node as { children?: unknown }).children;
      if (walk(children)) return true;
    }
    return false;
  };
  return walk(sections);
}

function hasListingsElement(sections: unknown[]): boolean {
  const walk = (nodes: unknown): boolean => {
    if (!Array.isArray(nodes)) return false;
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const t = (node as { type?: unknown }).type;
      // Section type `listings` also exists; only element-level listings
      // count for re-seed (sections have `children`, elements don't).
      const hasChildren = Array.isArray((node as { children?: unknown }).children);
      if (t === 'listings' && !hasChildren) return true;
      const children = (node as { children?: unknown }).children;
      if (walk(children)) return true;
    }
    return false;
  };
  return walk(sections);
}

function isNavbarSection(node: unknown): boolean {
  return !!node && typeof node === 'object' && (node as { type?: unknown }).type === 'navbar';
}

function isFooterSection(node: unknown): boolean {
  return !!node && typeof node === 'object' && (node as { type?: unknown }).type === 'footer';
}

/**
 * Deep-clone a node tree, rewriting every `id` to a fresh UUID. Used when
 * copying the navbar from one reserved page to another so keys stay
 * unique per page document.
 */
function cloneWithFreshIds<T>(node: T): T {
  if (Array.isArray(node)) return node.map((n) => cloneWithFreshIds(n)) as unknown as T;
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === 'id' && typeof v === 'string') out[k] = randomUUID();
      else out[k] = cloneWithFreshIds(v);
    }
    return out as unknown as T;
  }
  return node;
}

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureDefaults(tenantId: string): Promise<void> {
    const existing = await this.prisma.page.findMany({
      where: { tenantId, slug: { in: [...RESERVED_SLUGS] } },
      select: { id: true, slug: true, data: true },
    });
    const byIslug = new Map(existing.map((p) => [p.slug, p]));

    for (const slug of RESERVED_SLUGS) {
      const data = buildDefaultTemplate(slug as ReservedSlug, { ...DEFAULT_THEME });
      const row = byIslug.get(slug);

      if (!row) {
        await this.prisma.page.create({
          data: {
            id: randomUUID(),
            tenantId,
            slug,
            title: RESERVED_TITLES[slug],
            data: data as unknown as object,
            status: 'draft',
          },
        });
        continue;
      }

      // Re-seed conditions:
      //   1) Empty page (legacy seed or never edited)
      //   2) `property` page that doesn't yet have any property_* block
      //      (template evolved — gallery, prices, specs, etc are new)
      //   3) `search` page that doesn't have a listings element yet
      //      (template evolved — sidebar filters + results grid are new)
      const current = (row.data as { sections?: unknown[] }) ?? {};
      const sections = Array.isArray(current.sections) ? current.sections : [];

      const isEmpty =
        sections.length === 0 ||
        (sections.length === 1 &&
          ((sections[0] as { children?: unknown[] }).children?.length ?? 0) === 0);

      const needsPropertyBlocks =
        slug === 'property' && !hasAnyPropertyBlock(sections);

      const needsSearchResults =
        slug === 'search' && !hasListingsElement(sections);

      if (isEmpty || needsPropertyBlocks || needsSearchResults) {
        await this.prisma.page.update({
          where: { id: row.id },
          data: { data: data as unknown as object },
        });
        continue;
      }

      // Non-destructive navbar prepend + footer append: existing pages
      // that don't have navbar/footer yet get the default ones added,
      // without losing anything the user customized in between.
      let mutated = [...sections];
      let changed = false;

      if (!isNavbarSection(mutated[0])) {
        const templateNav = (data.sections ?? []).find(isNavbarSection);
        if (templateNav) {
          mutated = [cloneWithFreshIds(templateNav), ...mutated];
          changed = true;
        }
      }

      if (!isFooterSection(mutated[mutated.length - 1])) {
        const templateFooter = (data.sections ?? []).find(isFooterSection);
        if (templateFooter) {
          mutated = [...mutated, cloneWithFreshIds(templateFooter)];
          changed = true;
        }
      }

      if (changed) {
        const newData = { ...current, sections: mutated };
        await this.prisma.page.update({
          where: { id: row.id },
          data: { data: newData as unknown as object },
        });
      }
    }
  }

  async list(tenantId: string) {
    await this.ensureDefaults(tenantId);
    const rows = await this.prisma.page.findMany({
      where: { tenantId },
      orderBy: [{ slug: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
    return rows.map((r) => ({ ...r, reserved: isReservedSlug(r.slug) }));
  }

  async get(tenantId: string, id: string): Promise<Page> {
    const row = await this.prisma.page.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Página não encontrada');
    return this.toPage(row);
  }

  async create(tenantId: string, dto: CreatePageDto): Promise<Page> {
    if (isReservedSlug(dto.slug)) {
      throw new ConflictException(`O slug "${dto.slug}" é reservado.`);
    }

    const existing = await this.prisma.page.findUnique({
      where: { tenantId_slug: { tenantId, slug: dto.slug } },
    });
    if (existing) throw new ConflictException('Já existe uma página com esse slug');

    const pageId = randomUUID();
    const data: PageData = {
      seo: { title: dto.title, description: '' },
      theme: { ...DEFAULT_THEME },
      sections: [],
    };
    const row = await this.prisma.page.create({
      data: {
        id: pageId,
        tenantId,
        slug: dto.slug,
        title: dto.title,
        data: data as unknown as object,
        status: 'draft',
      },
    });
    return this.toPage(row);
  }

  async update(tenantId: string, id: string, dto: UpdatePageDto): Promise<Page> {
    const existing = await this.prisma.page.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Página não encontrada');

    if (dto.slug && dto.slug !== existing.slug) {
      if (isReservedSlug(existing.slug)) {
        throw new ForbiddenException('Páginas padrão não podem trocar de slug.');
      }
      if (isReservedSlug(dto.slug)) {
        throw new ConflictException(`O slug "${dto.slug}" é reservado.`);
      }
      const clash = await this.prisma.page.findUnique({
        where: { tenantId_slug: { tenantId, slug: dto.slug } },
      });
      if (clash) throw new ConflictException('Já existe uma página com esse slug');
    }

    const merged = {
      ...(existing.data as object),
      ...(dto.data ?? {}),
    };

    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        slug: dto.slug ?? existing.slug,
        title: dto.title ?? existing.title,
        data: merged as unknown as object,
        // Any edit moves status back to draft until publish is called.
        status: 'draft',
      },
    });

    // Navbar and footer are shared chrome across reserved pages. When
    // one of them is edited on any reserved page, propagate the change
    // to the others so the site stays consistent.
    if (isReservedSlug(existing.slug) && dto.data) {
      const incomingSections = (dto.data as { sections?: unknown[] }).sections;
      if (Array.isArray(incomingSections)) {
        const navbar = incomingSections.find(isNavbarSection);
        const footer = [...incomingSections].reverse().find(isFooterSection);
        if (navbar || footer) {
          await this.syncSharedChromeToOtherReservedPages(
            existing.tenantId,
            existing.slug as ReservedSlug,
            { navbar, footer },
          );
        }
      }
    }

    return this.toPage(updated);
  }

  /**
   * Writes the given navbar/footer sections into every reserved page
   * except the source. Replaces existing navbar/footer if present,
   * otherwise prepends/appends. Section/element IDs are regenerated so
   * each page document holds its own unique ids (keeps React keys
   * stable per page).
   */
  private async syncSharedChromeToOtherReservedPages(
    tenantId: string,
    sourceSlug: ReservedSlug,
    chrome: { navbar?: unknown; footer?: unknown },
  ): Promise<void> {
    const others = RESERVED_SLUGS.filter((s) => s !== sourceSlug);
    const rows = await this.prisma.page.findMany({
      where: { tenantId, slug: { in: [...others] } },
    });
    for (const row of rows) {
      const data = (row.data as { sections?: unknown[] }) ?? {};
      const sections = Array.isArray(data.sections) ? [...data.sections] : [];

      if (chrome.navbar) {
        const cloned = cloneWithFreshIds(chrome.navbar);
        if (sections.length > 0 && isNavbarSection(sections[0])) {
          sections[0] = cloned;
        } else {
          sections.unshift(cloned);
        }
      }

      if (chrome.footer) {
        const cloned = cloneWithFreshIds(chrome.footer);
        const lastIdx = sections.length - 1;
        if (lastIdx >= 0 && isFooterSection(sections[lastIdx])) {
          sections[lastIdx] = cloned;
        } else {
          sections.push(cloned);
        }
      }

      const newData = { ...data, sections };
      await this.prisma.page.update({
        where: { id: row.id },
        data: { data: newData as unknown as object },
      });
    }
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.page.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Página não encontrada');
    if (isReservedSlug(existing.slug)) {
      throw new ForbiddenException('Páginas padrão não podem ser removidas.');
    }
    await this.prisma.page.delete({ where: { id } });
  }

  /**
   * Re-seeds a reserved page (home | property | search) back to its
   * current default template. Custom pages can't be reset — they don't
   * have a template. Used when templates evolve and the user wants the
   * latest defaults instead of the snapshot stored at creation time.
   */
  async resetToTemplate(tenantId: string, id: string): Promise<Page> {
    const existing = await this.prisma.page.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Página não encontrada');
    if (!isReservedSlug(existing.slug)) {
      throw new ForbiddenException('Apenas páginas padrão podem ser redefinidas.');
    }
    const data = buildDefaultTemplate(existing.slug as ReservedSlug, { ...DEFAULT_THEME });
    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        data: data as unknown as object,
        status: 'draft',
      },
    });
    return this.toPage(updated);
  }

  async publish(tenantId: string, id: string): Promise<Page> {
    const existing = await this.prisma.page.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Página não encontrada');

    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
    return this.toPage(updated);
  }

  private toPage(row: {
    id: string;
    tenantId: string;
    slug: string;
    title: string;
    data: unknown;
    status: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Page {
    const data = (row.data as PageData) ?? ({} as PageData);
    return {
      id: row.id,
      tenantId: row.tenantId,
      slug: row.slug,
      title: row.title,
      seo: data.seo,
      theme: data.theme,
      sections: data.sections ?? [],
      status: row.status === 'published' ? 'published' : 'draft',
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
