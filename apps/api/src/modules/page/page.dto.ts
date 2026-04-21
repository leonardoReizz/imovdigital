import { IsString, IsOptional, IsIn, Allow, Matches, Length } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @Length(1, 60)
  @Matches(/^[a-z0-9][a-z0-9-]*$/, {
    message: 'slug must be lowercase, digits and hyphens',
  })
  slug: string;

  @IsString()
  @Length(1, 120)
  title: string;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  @Matches(/^[a-z0-9][a-z0-9-]*$/, {
    message: 'slug must be lowercase, digits and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  title?: string;

  @IsOptional()
  @Allow()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';
}
