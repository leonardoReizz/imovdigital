import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import type { Readable } from 'stream';

@Injectable()
export class UploadService {
  private s3: S3Client | null = null;

  constructor(private readonly config: ConfigService) {}

  private getS3() {
    if (this.s3) return this.s3;

    const r2AccountId = this.config.get('R2_ACCOUNT_ID');
    const r2AccessKeyId = this.config.get('R2_ACCESS_KEY_ID');
    const r2SecretAccessKey = this.config.get('R2_SECRET_ACCESS_KEY');

    if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) return null;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    return this.s3;
  }

  private getBucket() {
    return this.config.get('R2_BUCKET_NAME');
  }

  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon'];
  private static readonly MAX_FILE_SIZE_MB = 10;

  async generatePresignedUrl(
    filename: string,
    contentType: string,
    folder: string = 'gallery',
  ) {
    // Validate content type
    if (!UploadService.ALLOWED_TYPES.includes(contentType)) {
      throw new NotFoundException(`Tipo de arquivo não permitido: ${contentType}. Use JPG, PNG, WebP, GIF ou ICO.`);
    }

    // Validate filename (prevent path traversal)
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (sanitized.includes('..')) {
      throw new NotFoundException('Nome de arquivo inválido');
    }

    const s3 = this.getS3();
    const bucket = this.getBucket();
    const r2PublicUrl = this.config.get('R2_PUBLIC_URL');

    if (!s3 || !bucket) {
      const key = `${folder}/${randomUUID()}-${filename}`;
      return {
        uploadUrl: null,
        publicUrl: `/uploads/${key}`,
        key,
        message: 'R2 not configured.',
      };
    }

    const ext = filename.split('.').pop();
    const key = `${folder}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    // If a public URL is configured, use it. Otherwise serve via API proxy.
    const publicUrl = r2PublicUrl
      ? `${r2PublicUrl}/${key}`
      : `/api/files/${key}`;

    return { uploadUrl, publicUrl, key };
  }

  async getFile(key: string): Promise<{ stream: Readable; contentType: string }> {
    const s3 = this.getS3();
    const bucket = this.getBucket();

    if (!s3 || !bucket) {
      throw new NotFoundException('R2 not configured');
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || 'application/octet-stream',
    };
  }

  /**
   * Extract the R2 key from a URL like /api/files/gallery/xxx.jpg or https://cdn.../gallery/xxx.jpg
   */
  extractKey(url: string): string | null {
    // /api/files/gallery/xxx.jpg → gallery/xxx.jpg
    const apiMatch = url.match(/\/api\/files\/(.+)$/);
    if (apiMatch) return apiMatch[1];

    // https://cdn.example.com/gallery/xxx.jpg → gallery/xxx.jpg
    const r2PublicUrl = this.config.get('R2_PUBLIC_URL');
    if (r2PublicUrl && url.startsWith(r2PublicUrl)) {
      return url.slice(r2PublicUrl.length + 1);
    }

    // /uploads/gallery/xxx.jpg (dev fallback)
    const uploadsMatch = url.match(/\/uploads\/(.+)$/);
    if (uploadsMatch) return uploadsMatch[1];

    return null;
  }

  async deleteFile(url: string): Promise<void> {
    const s3 = this.getS3();
    const bucket = this.getBucket();
    if (!s3 || !bucket) return;

    const key = this.extractKey(url);
    if (!key) return;

    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch {
      // Ignore delete errors — file may already be gone
    }
  }

  async deleteFiles(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.deleteFile(url)));
  }

  /** List every object in the bucket. Returns key + lastModified. */
  async listAllObjects(): Promise<{ key: string; lastModified: Date }[]> {
    const s3 = this.getS3();
    const bucket = this.getBucket();
    if (!s3 || !bucket) return [];

    const results: { key: string; lastModified: Date }[] = [];
    let ContinuationToken: string | undefined;
    do {
      const res = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, ContinuationToken }),
      );
      for (const obj of res.Contents ?? []) {
        if (obj.Key && obj.LastModified) {
          results.push({ key: obj.Key, lastModified: obj.LastModified });
        }
      }
      ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (ContinuationToken);
    return results;
  }

  /** Delete a batch of keys with one S3 call (max 1000 per call). */
  async deleteKeys(keys: string[]): Promise<number> {
    const s3 = this.getS3();
    const bucket = this.getBucket();
    if (!s3 || !bucket || keys.length === 0) return 0;

    let deleted = 0;
    for (let i = 0; i < keys.length; i += 1000) {
      const chunk = keys.slice(i, i + 1000);
      try {
        const res = await s3.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true },
          }),
        );
        deleted += chunk.length - (res.Errors?.length ?? 0);
      } catch {
        // Fall back to individual deletes for this chunk
        for (const key of chunk) {
          try {
            await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
            deleted += 1;
          } catch {
            /* ignore */
          }
        }
      }
    }
    return deleted;
  }
}
