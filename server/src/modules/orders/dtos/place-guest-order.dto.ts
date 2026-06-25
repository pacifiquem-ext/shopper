import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}
