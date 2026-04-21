import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Headers,
  Param,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { UploadGcService } from './upload-gc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';

@Controller()
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly uploadGc: UploadGcService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Post('upload/presigned')
  async getPresignedUrl(
    @Body() body: { filename: string; contentType: string; folder?: string },
  ) {
    return this.uploadService.generatePresignedUrl(
      body.filename,
      body.contentType,
      body.folder,
    );
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Delete('upload/file')
  async deleteFile(@Body() body: { url: string }) {
    await this.uploadService.deleteFile(body.url);
    return { deleted: true };
  }

  // Admin-only manual trigger for the R2 orphan sweep. Defaults to dry-run
  // so the caller can inspect counts before deleting for real.
  @SkipThrottle()
  @Post('upload/gc')
  async runGc(
    @Headers('authorization') auth: string,
    @Query('dryRun') dryRunQ?: string,
    @Query('minAgeHours') minAgeHoursQ?: string,
  ) {
    const adminKey = this.config.get('ADMIN_API_KEY');
    if (!adminKey || auth !== `Bearer ${adminKey}`) {
      throw new UnauthorizedException('Invalid admin key');
    }
    const dryRun = dryRunQ !== 'false';
    const minAgeHours = minAgeHoursQ ? Math.max(0, Number(minAgeHoursQ)) : 24;
    return this.uploadGc.garbageCollect({ dryRun, minAgeHours });
  }

  // Proxy R2 files — no auth required (public images)
  @SkipThrottle()
  @Get('files/:folder/:filename')
  async serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Prevent path traversal
    if (folder.includes('..') || filename.includes('..')) {
      return res.status(400).json({ error: 'Invalid path' });
    }
    const key = `${folder}/${filename}`;
    const { stream, contentType } = await this.uploadService.getFile(key);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    stream.pipe(res);
  }
}
