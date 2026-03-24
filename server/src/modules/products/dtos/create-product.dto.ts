import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    IsBoolean,
    IsNumber,
    IsEnum,
    ValidateNested,
    ArrayMinSize,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../../common/constants/status.constants';

class CreateProductVariantDto {
    @ApiPropertyOptional({ example: 'Black' })
    @IsOptional()
    @IsString()
    colorName?: string;

    @ApiPropertyOptional({ example: '#000000' })
    @IsOptional()
    @IsString()
    colorHex?: string;

    @ApiPropertyOptional({ example: 'M' })
    @IsOptional()
    @IsString()
    size?: string;

    @ApiPropertyOptional({ example: 'Standard' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({ example: 15000 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: 18000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    compareAt?: number;

    @ApiPropertyOptional({ example: 8000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    cost?: number;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(0)
    stock: number;
}

export class CreateProductDto {
    @ApiProperty({ example: 'Premium Cotton T-Shirt' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'High-quality cotton t-shirt with modern fit' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'Fashion Co.' })
    @IsString()
    vendor: string;

    @ApiProperty({ example: 'Clothing' })
    @IsString()
    category: string;

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

    @ApiProperty({ type: [CreateProductVariantDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateProductVariantDto)
    variants: CreateProductVariantDto[];
}
