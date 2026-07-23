import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class CatalogQueryDto {
    @ApiPropertyOptional({
        description: 'Search product name, description, or vendor',
        example: 'coffee',
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @ApiPropertyOptional({
        description:
            'Restrict catalog to products from a store identified by slug',
        example: 'kigalifashion',
    })
    @IsOptional()
    @IsString()
    @MaxLength(63)
    @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i, {
        message:
            'storeSlug must be 2-63 chars (letters, digits, hyphens) and not start/end with a hyphen.',
    })
    storeSlug?: string;

    /** @deprecated Use storeSlug */
    @ApiPropertyOptional({
        description: 'Deprecated alias for storeSlug',
        deprecated: true,
        example: 'kigalifashion',
    })
    @IsOptional()
    @IsString()
    @MaxLength(63)
    @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i, {
        message:
            'subdomain must be 2-63 chars (letters, digits, hyphens) and not start/end with a hyphen.',
    })
    subdomain?: string;
}

export class CatalogPaginationDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;
}
