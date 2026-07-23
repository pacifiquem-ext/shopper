import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import {
    PromotionStatus,
    PromotionType,
} from '../../../common/constants/status.constants';

export class PromotionTargetDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    productId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    categoryId?: string;
}

export class CreatePromotionDto {
    @ApiProperty({ example: 'WELCOME10' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    code: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name: string;

    @ApiProperty({ enum: PromotionType })
    @IsEnum(PromotionType)
    type: string;

    @ApiProperty({ example: 10 })
    @IsNumber()
    @Min(0)
    value: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderAmount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    maxRedemptions?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    perUserLimit?: number;

    @ApiProperty()
    @IsDateString()
    startsAt: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endsAt?: string;

    @ApiPropertyOptional({ enum: PromotionStatus })
    @IsOptional()
    @IsEnum(PromotionStatus)
    status?: string;

    @ApiPropertyOptional({ type: [PromotionTargetDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PromotionTargetDto)
    targets?: PromotionTargetDto[];
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
