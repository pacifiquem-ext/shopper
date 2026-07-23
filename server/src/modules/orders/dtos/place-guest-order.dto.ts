import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../common/constants/status.constants';

class GuestOrderLineItemDto {
    @ApiProperty({ example: 'uuid-of-variant' })
    @IsUUID()
    productVariantId: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class PlaceGuestOrderDto {
    @ApiProperty({ example: '+250788123456' })
    @IsString()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'customerPhone must be E.164 format (e.g. +250788123456)',
    })
    customerPhone: string;

    @ApiPropertyOptional({ example: 'Jean Claude' })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiProperty({ type: [GuestOrderLineItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => GuestOrderLineItemDto)
    items: GuestOrderLineItemDto[];

    @ApiPropertyOptional({
        enum: PaymentMethod,
        default: PaymentMethod.MOBILE_MONEY,
        description:
            'Offline payment method. Use MOBILE_MONEY or BANK_TRANSFER for proof upload; COD skips proof.',
    })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: string;
}
