import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentFilterDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({ description: 'PENDING | SUCCESS | FAILED | REFUNDED' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'CASH_ON_DELIVERY | MOBILE_MONEY | BANK_TRANSFER | CARD' })
    @IsOptional()
    @IsString()
    method?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    dateFrom?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    dateTo?: string;
}
