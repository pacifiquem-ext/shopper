import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

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
            'When provided, restrict the catalog to products from a single approved store identified by its subdomain.',
        example: 'kigalifashion',
    })
    @IsOptional()
    @IsString()
    @MaxLength(63)
    @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i, {
        message: 'subdomain must be 2-63 chars (letters, digits, hyphens) and not start/end with a hyphen.',
    })
    subdomain?: string;
}
