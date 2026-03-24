import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    IsBoolean,
    IsNumber,
    IsEnum,
    Min,
} from 'class-validator';
import { ProductStatus } from '../../../common/constants/status.constants';

export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Premium Cotton T-Shirt' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'High-quality cotton t-shirt with modern fit' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Fashion Co.' })
    @IsOptional()
    @IsString()
    vendor?: string;

    @ApiPropertyOptional({ example: 'Clothing' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 'ACTIVE', enum: ProductStatus })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: string;

    @ApiPropertyOptional({ example: ['fashion', 'casual', 'cotton'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ example: ['/products/tshirt-1.jpg', '/products/tshirt-2.jpg'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @ApiPropertyOptional({ example: '/products/tshirt-1.jpg' })
    @IsOptional()
    @IsString()
    primaryImage?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    deliveryEnabled?: boolean;

    @ApiPropertyOptional({ example: 'Kigali' })
    @IsOptional()
    @IsString()
    deliveryLocation?: string;

    @ApiPropertyOptional({ example: 2000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    deliveryPrice?: number;
}
