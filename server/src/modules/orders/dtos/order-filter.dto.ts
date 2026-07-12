import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, FulfillmentStatus } from '../../../common/constants/status.constants';

export class OrderFilterDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ example: '2024-01-01' })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({ example: '2024-12-31' })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @ApiPropertyOptional({ example: 'PENDING', enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: string;

    @ApiPropertyOptional({ example: 'UNFULFILLED', enum: FulfillmentStatus })
    @IsOptional()
    @IsEnum(FulfillmentStatus)
    fulfillmentStatus?: string;

    @ApiPropertyOptional({ example: 'Jean' })
    @IsOptional()
    @IsString()
    search?: string;
}
