import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString } from 'class-validator'

export class UploadImageQueryDto {
    @ApiPropertyOptional({ enum: ['product', 'proof', 'logo', 'general'] })
    @IsOptional()
    @IsIn(['product', 'proof', 'logo', 'general'])
    purpose?: 'product' | 'proof' | 'logo' | 'general'
}
