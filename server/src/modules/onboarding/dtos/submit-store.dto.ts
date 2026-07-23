import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    IsNotEmpty,
    Matches,
    IsEmail,
    ValidateNested,
    IsOptional,
    IsNumber,
    IsArray,
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

export class DeliveryZoneDto {
    @ApiProperty({ description: 'Delivery Zone Name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Delivery Fee in RWF' })
    @IsNumber()
    feeRwf: number;

    @ApiProperty({ description: 'Estimated Delivery Time in minutes' })
    @IsNumber()
    etaMinutes: number;
}

export class SubmitStoreDto {
    @ApiProperty({
        description: 'Desired store slug (URL path identity)',
        example: 'mystore',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, {
        message: 'Invalid slug format',
    })
    slug: string;

    /** @deprecated Use slug. Accepted for one-release client back-compat. */
    @ApiProperty({
        description: 'Deprecated alias for slug',
        required: false,
        deprecated: true,
    })
    @IsString()
    @IsOptional()
    subdomain?: string;

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

    @ApiProperty({ description: 'Brand primary color', required: false })
    @IsString()
    @IsOptional()
    brandPrimaryColor?: string;

    @ApiProperty({ description: 'Brand secondary color', required: false })
    @IsString()
    @IsOptional()
    brandSecondaryColor?: string;

    @ApiProperty({
        description: 'Company logo URL or Base64 Data',
        required: false,
    })
    @IsString()
    @IsOptional()
    logoDataUrl?: string;

    @ApiProperty({ description: 'About us content', required: false })
    @IsString()
    @IsOptional()
    aboutUs?: string;

    @ApiProperty({ description: 'Public Contact Email', required: false })
    @IsEmail()
    @IsOptional()
    contactEmail?: string;

    @ApiProperty({ description: 'Public Contact Phone', required: false })
    @IsString()
    @IsOptional()
    contactPhone?: string;

    @ApiProperty({ description: 'Public Contact Address', required: false })
    @IsString()
    @IsOptional()
    contactAddress?: string;

    @ApiProperty({
        description: 'Delivery Zones supported by the store',
        type: [DeliveryZoneDto],
        required: false,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveryZoneDto)
    @IsOptional()
    deliveryZones?: DeliveryZoneDto[];

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

    @ApiProperty({ description: 'Full names of the owner' })
    @IsString()
    @IsNotEmpty()
    ownerFullName: string;

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

    @ApiProperty({ description: 'Primary business address' })
    @ValidateNested()
    @Type(() => AddressDto)
    businessAddress: AddressDto;
}
