import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsIn,
  IsObject,
  ValidateNested,
  Allow,
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

  @Allow()
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

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsObject()
  propertyDetail?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  searchPage?: Record<string, unknown>;
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
