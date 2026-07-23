import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class ReviewPaymentDto {
    @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
    @IsEnum(['APPROVE', 'REJECT'] as const)
    action: 'APPROVE' | 'REJECT';

    @ApiPropertyOptional({ description: 'Required when rejecting' })
    @ValidateIf((o) => o.action === 'REJECT')
    @IsString()
    @MaxLength(500)
    rejectionReason?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(120)
    reference?: string;
}
