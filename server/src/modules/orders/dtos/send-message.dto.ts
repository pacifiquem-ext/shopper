import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class SendMessageDto {
    @ApiProperty({ example: 'Your order is ready for pickup.' })
    @IsString()
    @MinLength(1)
    message: string;

    @ApiPropertyOptional({ example: 'Store Admin' })
    @IsOptional()
    @IsString()
    senderName?: string;
}
