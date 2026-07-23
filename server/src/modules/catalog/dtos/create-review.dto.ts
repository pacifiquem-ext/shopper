import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    body?: string;

    @ApiPropertyOptional({ description: 'Order that purchased this product' })
    @IsOptional()
    @IsUUID()
    orderId?: string;
}
