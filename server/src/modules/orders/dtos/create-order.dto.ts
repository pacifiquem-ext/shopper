import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    IsNumber,
    IsEnum,
    ValidateNested,
    ArrayMinSize,
    IsUUID,
    Min,
    IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../common/constants/status.constants';

class AddressDto {
    @ApiPropertyOptional({ example: 'Kigali' })
    @IsOptional()
    @IsString()
    province?: string;

    @ApiPropertyOptional({ example: 'Gasabo' })
    @IsOptional()
    @IsString()
    district?: string;

    @ApiPropertyOptional({ example: 'Remera' })
    @IsOptional()
    @IsString()
    sector?: string;

    @ApiProperty({ example: 'KG 123 St' })
    @IsString()
    physicalAddress: string;
}

class OrderLineItemDto {
    @ApiProperty({ example: 'uuid-of-variant' })
    @IsUUID()
    productVariantId: string;

    @ApiProperty({ example: 'Cotton T-Shirt Black M' })
    @IsString()
    productName: string;

    @ApiProperty({ example: 'CTN-BLK-M' })
    @IsString()
    sku: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 15000 })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiProperty({ example: 30000 })
    @IsNumber()
    @Min(0)
    total: number;
}

export class CreateOrderDto {
    @ApiProperty({ example: 'Jean Claude' })
    @IsString()
    customerName: string;

    @ApiProperty({ example: '+250780000000' })
    @IsString()
    customerPhone: string;

    @ApiPropertyOptional({ example: 'jean@example.com' })
    @IsOptional()
    @IsEmail()
    customerEmail?: string;

    @ApiProperty({ type: AddressDto })
    @ValidateNested()
    @Type(() => AddressDto)
    shippingAddress: AddressDto;

    @ApiPropertyOptional({ type: AddressDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    billingAddress?: AddressDto;

    @ApiProperty({ example: 30000 })
    @IsNumber()
    @Min(0)
    subtotal: number;

    @ApiPropertyOptional({ example: 2000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    deliveryFee?: number;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    tax?: number;

    @ApiProperty({ example: 32000 })
    @IsNumber()
    @Min(0)
    total: number;

    @ApiPropertyOptional({ example: 'Please deliver after 5pm' })
    @IsOptional()
    @IsString()
    customerNote?: string;

    @ApiPropertyOptional({ example: 'CASH_ON_DELIVERY', enum: PaymentMethod })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: string;

    @ApiPropertyOptional({ example: 'Standard Delivery' })
    @IsOptional()
    @IsString()
    deliveryMethod?: string;

    @ApiProperty({ type: [OrderLineItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderLineItemDto)
    items: OrderLineItemDto[];
}
