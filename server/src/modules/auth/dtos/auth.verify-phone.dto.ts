import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumberString,
    IsPhoneNumber,
    Length,
} from 'class-validator';

export class VerifyPhoneDto {
    @ApiProperty({
        description: 'International phone number (E.164 format)',
        example: '+250788123456',
        required: true,
    })
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({
        description: '6-digit OTP code',
        example: '123456',
        required: true,
    })
    @IsNotEmpty()
    @IsNumberString()
    @Length(6, 6)
    otpCode: string;
}
