import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class BrandColorsDto {
    @ApiPropertyOptional({ example: '#1d4ed8' })
    @IsOptional()
    @IsString()
    primary?: string;

    @ApiPropertyOptional({ example: '#e8edfb' })
    @IsOptional()
    @IsString()
    secondary?: string;

    @ApiPropertyOptional({
        example: 'ISHUSHO_CRAFTS',
        enum: ['DEFAULT', 'VIBRANT_MARKET', 'ISHUSHO_CRAFTS'],
    })
    @IsOptional()
    @IsIn(['DEFAULT', 'VIBRANT_MARKET', 'ISHUSHO_CRAFTS'])
    template?: 'DEFAULT' | 'VIBRANT_MARKET' | 'ISHUSHO_CRAFTS';
}

export class UpdateStoreSettingsDto {
    @ApiPropertyOptional({ example: 'Kigali Fashion' })
    @IsOptional()
    @IsString()
    displayName?: string;

    @ApiPropertyOptional({ example: 'Premium fashion and accessories in Kigali' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional({ type: BrandColorsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => BrandColorsDto)
    brandColors?: BrandColorsDto;

    @ApiPropertyOptional({ example: 'We are a premium fashion store based in Kigali.' })
    @IsOptional()
    @IsString()
    aboutUs?: string;

    @ApiPropertyOptional({ example: 'contact@onlineshop.rw' })
    @IsOptional()
    @IsEmail()
    contactEmail?: string;

    @ApiPropertyOptional({ example: '+250788123456' })
    @IsOptional()
    @IsString()
    contactPhone?: string;

    @ApiPropertyOptional({ example: 'KG 123 St, Remera, Kigali' })
    @IsOptional()
    @IsString()
    contactAddress?: string;

    @ApiPropertyOptional({ example: 'Returns accepted within 7 days.' })
    @IsOptional()
    @IsString()
    returnPolicy?: string;

    @ApiPropertyOptional({ example: 'We respect your privacy...' })
    @IsOptional()
    @IsString()
    privacyPolicy?: string;

    @ApiPropertyOptional({ example: 'By using our store you agree...' })
    @IsOptional()
    @IsString()
    termsAndConditions?: string;

    // Owner fields — written to StoreKyc
    @ApiPropertyOptional({ example: 'Jean Claude Mugabo' })
    @IsOptional()
    @IsString()
    ownerFullName?: string;

    @ApiPropertyOptional({ example: 'owner@onlineshop.rw' })
    @IsOptional()
    @IsEmail()
    ownerEmail?: string;

    @ApiPropertyOptional({ example: '+250780123456' })
    @IsOptional()
    @IsString()
    ownerPhoneNumber?: string;
}
