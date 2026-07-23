import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import {
    AttributeAppliesTo,
    AttributeFieldType,
} from '../../../common/constants/status.constants';

export class CreateCategoryAttributeDefDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z][a-z0-9_]*$/)
    key: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    labelEn: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    labelRw: string;

    @ApiProperty({ enum: AttributeFieldType })
    @IsEnum(AttributeFieldType)
    type: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    options?: unknown;

    @ApiPropertyOptional({ enum: AttributeAppliesTo })
    @IsOptional()
    @IsEnum(AttributeAppliesTo)
    appliesTo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class CreateProductCategoryDto {
    @ApiProperty({ example: 'fashion' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    @MaxLength(64)
    slug: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nameEn: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nameRw: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ type: [CreateCategoryAttributeDefDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCategoryAttributeDefDto)
    attributeDefs?: CreateCategoryAttributeDefDto[];
}

export class UpdateProductCategoryDto extends PartialType(
    CreateProductCategoryDto,
) {}
