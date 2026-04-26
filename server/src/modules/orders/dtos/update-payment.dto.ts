import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../../common/constants/status.constants';

export class UpdatePaymentDto {
    @ApiProperty({ example: 'SUCCESS', enum: PaymentStatus })
    @IsEnum(PaymentStatus)
    status: string;

    @ApiPropertyOptional({ example: 'TXN-12345' })
    @IsOptional()
    @IsString()
    reference?: string;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/proof.jpg' })
    @IsOptional()
    @IsString()
    paymentProofUrl?: string;
}
