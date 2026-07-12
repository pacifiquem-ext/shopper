import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../../common/constants/status.constants';

export class ProductFilterDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ example: 'ACTIVE', enum: ProductStatus })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: string;

    @ApiPropertyOptional({ example: 'Clothing' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 'Fashion Co.' })
    @IsOptional()
    @IsString()
    vendor?: string;

    @ApiPropertyOptional({ example: 'T-Shirt' })
    @IsOptional()
    @IsString()
    search?: string;
}
