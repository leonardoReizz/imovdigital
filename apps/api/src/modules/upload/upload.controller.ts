import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Delete('upload/file')
  async deleteFile(@Body() body: { url: string }) {
    await this.uploadService.deleteFile(body.url);
    return { deleted: true };
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
