import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    IsNotEmpty,
    Matches,
    IsEmail,
    IsDate,
    ValidateNested,
    IsOptional,
} from 'class-validator';

export class AddressDto {
    @ApiProperty({ description: 'Province name' })
    @IsString()
    @IsNotEmpty()
    province: string;

    @ApiProperty({ description: 'District name' })
    @IsString()
    @IsNotEmpty()
    district: string;

    @ApiProperty({ description: 'Sector name' })
    @IsString()
    @IsNotEmpty()
    sector: string;

    @ApiProperty({ description: 'Full physical address details' })
    @IsString()
    @IsNotEmpty()
    physicalAddress: string;

    @ApiProperty({ description: 'Optional Google Maps URL', required: false })
    @IsString()
    @IsOptional()
    googleMapsUrl?: string;
}

export class SubmitStoreDto {
    // ------------------------------------
    // Store Configuration
    // ------------------------------------
    @ApiProperty({ description: 'Desired subdomain slug', example: 'mystore' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, {
        message: 'Invalid subdomain format',
    })
    subdomain: string;

    @ApiProperty({ description: 'Legal registered business name' })
    @IsString()
    @IsNotEmpty()
    registeredName: string;

    @ApiProperty({ description: 'Publicly displayed store name' })
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @ApiProperty({ description: 'Store description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    // ------------------------------------
    // KYC Legal Identity
    // ------------------------------------
    @ApiProperty({ description: 'UUID of the Industry Sector' })
    @IsUUID()
    @IsNotEmpty()
    industrySectorId: string;

    @ApiProperty({ description: 'UUID of the Business Category' })
    @IsUUID()
    @IsNotEmpty()
    businessCategoryId: string;

    @ApiProperty({ description: 'Country of registration', example: 'RW' })
    @IsString()
    @IsNotEmpty()
    country: string;

    // ------------------------------------
    // KYC Owner Details
    // ------------------------------------
    @ApiProperty({ description: 'Full names of the owner' })
    @IsString()
    @IsNotEmpty()
    ownerFullName: string;

    @ApiProperty({ description: 'Date of Birth (ISO8601)' })
    @Type(() => Date)
    @IsDate()
    ownerDob: Date;

    @ApiProperty({ description: 'Nationality', example: 'Rwandan' })
    @IsString()
    @IsNotEmpty()
    ownerNationality: string;

    @ApiProperty({ description: 'Elevated contact email' })
    @IsEmail()
    @IsNotEmpty()
    ownerEmail: string;

    @ApiProperty({ description: 'Elevated contact phone number' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be internationally formatted',
    })
    ownerPhoneNumber: string;

    // ------------------------------------
    // Addresses
    // ------------------------------------
    @ApiProperty({ description: 'Primary business address' })
    @ValidateNested()
    @Type(() => AddressDto)
    businessAddress: AddressDto;

    @ApiProperty({ description: 'Optional warehouse address', required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    warehouseAddress?: AddressDto;
}
