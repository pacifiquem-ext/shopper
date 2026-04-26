import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateDeliveryZoneDto {
    @ApiPropertyOptional({ example: 'Kigali City Center' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 2000 })
    @IsOptional()
    @IsInt()
    @Min(0)
    feeRwf?: number;

    @ApiPropertyOptional({ example: 30 })
    @IsOptional()
    @IsInt()
    @Min(1)
    etaMinutes?: number;
}
