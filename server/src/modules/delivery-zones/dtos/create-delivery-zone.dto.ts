import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CreateDeliveryZoneDto {
    @ApiProperty({ example: 'Kigali City Center' })
    @IsString()
    name: string;

    @ApiProperty({ example: 2000 })
    @IsInt()
    @Min(0)
    feeRwf: number;

    @ApiProperty({ example: 30 })
    @IsInt()
    @Min(1)
    etaMinutes: number;
}
