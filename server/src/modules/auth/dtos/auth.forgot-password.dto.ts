import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'International phone number (E.164 format)',
        example: '+250788123456',
        required: true,
    })
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;
}
