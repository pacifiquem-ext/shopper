import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class InventoryDto {
    @ApiProperty()
    @Expose()
    onHand: number;

    @ApiProperty()
    @Expose()
    available: number;

    @ApiProperty()
    @Expose()
    status: string;
}

class ProductVariantDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    sku: string;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiPropertyOptional()
    @Expose()
    colorName?: string;

    @ApiPropertyOptional()
    @Expose()
    colorHex?: string;

    @ApiPropertyOptional()
    @Expose()
    size?: string;

    @ApiProperty()
    @Expose()
    price: number;

    @ApiPropertyOptional()
    @Expose()
    compareAt?: number;

    @ApiPropertyOptional()
    @Expose()
    cost?: number;

    @ApiPropertyOptional({ type: InventoryDto })
    @Expose()
    @Type(() => InventoryDto)
    inventory?: InventoryDto;
}

export class ProductResponseDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiPropertyOptional()
    @Expose()
    description?: string;

    @ApiProperty()
    @Expose()
    vendor: string;

    @ApiProperty()
    @Expose()
    category: string;

    @ApiProperty()
    @Expose()
    status: string;

    @ApiPropertyOptional()
    @Expose()
    tags?: string[];

    @ApiPropertyOptional()
    @Expose()
    images?: string[];

    @ApiPropertyOptional()
    @Expose()
    primaryImage?: string;

    @ApiProperty()
    @Expose()
    deliveryEnabled: boolean;

    @ApiPropertyOptional()
    @Expose()
    deliveryLocation?: string;

    @ApiPropertyOptional()
    @Expose()
    deliveryPrice?: number;

    @ApiProperty({ type: [ProductVariantDto] })
    @Expose()
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto[];

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiProperty()
    @Expose()
    updatedAt: Date;
}

export class ProductListResponseDto {
    @ApiProperty({ type: [ProductResponseDto] })
    @Expose()
    @Type(() => ProductResponseDto)
    data: ProductResponseDto[];

    @ApiProperty()
    @Expose()
    total: number;

    @ApiProperty()
    @Expose()
    page: number;

    @ApiProperty()
    @Expose()
    limit: number;

    @ApiProperty()
    @Expose()
    totalPages: number;
}
