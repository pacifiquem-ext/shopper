import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    ArrayMaxSize,
    IsArray,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator'

import { SHOPPER_SIGNAL_TYPES } from '../discovery/shopper-affinity'

export class ShopperSignalItemDto {
    @ApiProperty({ enum: SHOPPER_SIGNAL_TYPES })
    @IsIn([...SHOPPER_SIGNAL_TYPES])
    type!: (typeof SHOPPER_SIGNAL_TYPES)[number]

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    query?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(80)
    productId?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(80)
    storeId?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(80)
    category?: string

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(12)
    tags?: string[]

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    price?: number
}

export class IngestShopperSignalsDto {
    @ApiPropertyOptional({
        description: 'First-party visitor id. Also accepted via X-Shopper-Visitor.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    visitorId?: string

    @ApiProperty({ type: [ShopperSignalItemDto] })
    @IsArray()
    @ArrayMaxSize(40)
    @ValidateNested({ each: true })
    @Type(() => ShopperSignalItemDto)
    events!: ShopperSignalItemDto[]
}
