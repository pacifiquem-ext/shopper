import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FulfillmentStatus } from '../../../common/constants/status.constants';

export class UpdateFulfillmentDto {
    @ApiProperty({ example: 'PACKED', enum: FulfillmentStatus })
    @IsEnum(FulfillmentStatus)
    status: string;

    @ApiPropertyOptional({ example: 'DHL Express' })
    @IsOptional()
    @IsString()
    courierName?: string;

    @ApiPropertyOptional({ example: 'John Driver' })
    @IsOptional()
    @IsString()
    driverName?: string;

    @ApiPropertyOptional({ example: 'TRK-987654' })
    @IsOptional()
    @IsString()
    trackingNumber?: string;

    @ApiPropertyOptional({ example: 'user-uuid' })
    @IsOptional()
    @IsString()
    deliveredBy?: string;
}
