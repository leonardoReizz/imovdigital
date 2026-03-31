import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
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

  async generatePresignedUrl(
    filename: string,
    contentType: string,
    folder: string = 'gallery',
  ) {
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
}
