import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'International phone number (E.164 format)',
        example: '+250788123456',
        required: true,
    })
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({
        description: 'User password',
        example: 'StrongPass1!',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
