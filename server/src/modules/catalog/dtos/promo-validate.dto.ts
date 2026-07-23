import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';

class PromoLineItemDto {
    @ApiProperty()
    @IsUUID()
    productId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    productVariantId?: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class PromoValidateDto {
    @ApiProperty({ example: 'WELCOME10' })
    @IsString()
    code: string;

    @ApiPropertyOptional({ description: 'Store scope for STORE promotions' })
    @IsOptional()
    @IsUUID()
    storeId?: string;

    @ApiProperty({ type: [PromoLineItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PromoLineItemDto)
    lineItems: PromoLineItemDto[];

    @ApiProperty({ example: 50000 })
    @IsNumber()
    @Min(0)
    subtotal: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customerPhone?: string;
}
