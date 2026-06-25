import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumberString,
    IsPhoneNumber,
    IsString,
    Length,
    Matches,
    MinLength,
} from 'class-validator';
import { NormalizePhone } from '../../../common/helper/decorators/normalize-phone.decorator';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'International phone number (E.164 format)',
        example: '+250788123456',
        required: true,
    })
    @NormalizePhone()
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({
        description: '6-digit OTP code received via SMS/Email',
        example: '123456',
        required: true,
    })
    @IsNotEmpty()
    @IsNumberString()
    @Length(6, 6)
    otpCode: string;

    @ApiProperty({
        description: 'New password',
        example: 'NewStrongPass1!',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    newPassword: string;
}
