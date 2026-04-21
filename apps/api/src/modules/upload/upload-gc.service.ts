import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from './upload.service';

export interface GcResult {
  scanned: number;
  referenced: number;
  candidates: number;
  deleted: number;
  skippedTooYoung: number;
  dryRun: boolean;
}

/**
 * Sweeps the R2 bucket for orphan uploads — files whose URL no longer
 * appears in any Tenant/Property/Page/ContactConfig field. Only deletes
 * files older than `minAgeHours` so in-flight edits (image uploaded but
 * page not yet saved) aren't nuked.
 */
@Injectable()
export class UploadGcService {
  private readonly logger = new Logger(UploadGcService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UploadService,
  ) {}

  async garbageCollect(options: { dryRun?: boolean; minAgeHours?: number } = {}): Promise<GcResult> {
    const dryRun = options.dryRun ?? false;
    const minAgeHours = options.minAgeHours ?? 24;

    if (this.running) {
      this.logger.warn('GC already running — skipping');
      return { scanned: 0, referenced: 0, candidates: 0, deleted: 0, skippedTooYoung: 0, dryRun };
    }
    this.running = true;

    try {
      const [referenced, objects] = await Promise.all([
        this.collectReferencedKeys(),
        this.upload.listAllObjects(),
      ]);

      const cutoff = Date.now() - minAgeHours * 60 * 60 * 1000;
      const orphanKeys: string[] = [];
      let skippedTooYoung = 0;

      for (const obj of objects) {
        if (referenced.has(obj.key)) continue;
        if (obj.lastModified.getTime() >= cutoff) {
          skippedTooYoung += 1;
          continue;
        }
        orphanKeys.push(obj.key);
      }

      let deleted = 0;
      if (!dryRun && orphanKeys.length > 0) {
        deleted = await this.upload.deleteKeys(orphanKeys);
      }

      const result: GcResult = {
        scanned: objects.length,
        referenced: referenced.size,
        candidates: orphanKeys.length,
        deleted,
        skippedTooYoung,
        dryRun,
      };

      this.logger.log(
        `GC ${dryRun ? '[dry-run] ' : ''}scanned=${result.scanned} referenced=${result.referenced} orphans=${result.candidates} deleted=${result.deleted} skippedTooYoung=${result.skippedTooYoung}`,
      );

      return result;
    } finally {
      this.running = false;
    }
  }

  /** Runs every day at 03:00 server time — off-peak window. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduled() {
    try {
      await this.garbageCollect({ dryRun: false, minAgeHours: 24 });
    } catch (err) {
      this.logger.error('Scheduled GC failed', err as Error);
    }
  }

  /** Collects every R2 key referenced anywhere in the database. */
  private async collectReferencedKeys(): Promise<Set<string>> {
    const keys = new Set<string>();
    const add = (url: string | null | undefined) => {
      if (!url) return;
      const key = this.upload.extractKey(url);
      if (key) keys.add(key);
    };

    // Tenant brand assets
    const tenants = await this.prisma.tenant.findMany({
      select: { logoUrl: true, bannerUrl: true, faviconUrl: true },
    });
    for (const t of tenants) {
      add(t.logoUrl);
      add(t.bannerUrl);
      add(t.faviconUrl);
    }

    // Property images (Json[] of { url, alt? })
    const properties = await this.prisma.property.findMany({ select: { images: true } });
    for (const p of properties) {
      for (const img of (p.images as unknown[] as { url?: string }[]) ?? []) {
        add(img?.url);
      }
    }

    // Page data — recursively walk sections/elements for any `src`,
    // `backgroundImage`, or similar URL-bearing fields.
    const pages = await this.prisma.page.findMany({ select: { data: true } });
    for (const page of pages) {
      collectUrlsFromJson(page.data, add);
    }

    return keys;
  }
}

/**
 * Walks an unknown JSON blob and passes every plausible asset URL to `add`.
 * Targets the well-known URL-bearing fields: `src`, `backgroundImage`,
 * `logoUrl`, `bannerUrl`, `faviconUrl`, `url` on image-like objects.
 */
function collectUrlsFromJson(value: unknown, add: (url: string | null | undefined) => void): void {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) collectUrlsFromJson(item, add);
    return;
  }
  if (typeof value !== 'object') return;

  const obj = value as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      if (k === 'src' || k === 'backgroundImage' || k === 'logoUrl' || k === 'bannerUrl' || k === 'faviconUrl' || k === 'url') {
        add(v);
      }
    } else if (v && typeof v === 'object') {
      collectUrlsFromJson(v, add);
    }
  }
}
