import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { UserRole } from '../constants/auth.enum';
import { NormalizePhone } from '../../../common/helper/decorators/normalize-phone.decorator';

export class SignupDto {
    @ApiProperty({
        description: 'Store Owner or Customer Name',
        example: 'John Doe',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({
        description: 'International phone number (E.164 format)',
        example: '+250788123456',
        required: true,
    })
    @NormalizePhone()
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiPropertyOptional({
        description: 'Optional email address',
        example: 'john@example.com',
    })
    @ValidateIf((_, value) => value != null && String(value).trim() !== '')
    @IsEmail()
    email?: string;

    @ApiProperty({
        description: 'User password',
        example: 'StrongPass1!',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @ApiPropertyOptional({
        description:
            'User role, defaults to CUSTOMER. Cannot be PLATFORM_ADMIN',
        enum: [UserRole.CUSTOMER, UserRole.STORE_OWNER],
        example: UserRole.CUSTOMER,
        default: UserRole.CUSTOMER,
    })
    @IsOptional()
    @IsIn([UserRole.CUSTOMER, UserRole.STORE_OWNER])
    role?: UserRole;
}
