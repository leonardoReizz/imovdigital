import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadGcService } from './upload-gc.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, UploadGcService],
  exports: [UploadService, UploadGcService],
})
export class UploadModule {}
