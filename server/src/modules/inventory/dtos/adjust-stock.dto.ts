import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, MinLength } from 'class-validator';

export class AdjustStockDto {
    @ApiProperty({
        example: 10,
        description: 'Quantity change (positive to add, negative to remove)',
    })
    @Type(() => Number)
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 'Manual restock' })
    @IsString()
    @MinLength(1)
    reason: string;
}
