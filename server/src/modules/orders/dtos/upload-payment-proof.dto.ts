import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadPaymentProofDto {
    @ApiProperty({ example: 'https://cdn.example.com/proofs/abc.jpg' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    paymentProofUrl: string;

    @ApiPropertyOptional({ example: 'MTN-REF-123' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    reference?: string;
}
