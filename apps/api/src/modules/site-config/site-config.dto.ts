import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsNumber,
  IsUUID,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class SectionDto {
  @IsUUID()
  id: string;

  @IsString()
  type: string;

  @IsNumber()
  order: number;

  @IsBoolean()
  visible: boolean;

  settings: Record<string, unknown>;
}

export class UpdateSiteConfigDto {
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  faviconUrl?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];
}

export class PresignedUrlDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsOptional()
  @IsIn(['banners', 'logos', 'gallery'])
  folder?: string;
}
