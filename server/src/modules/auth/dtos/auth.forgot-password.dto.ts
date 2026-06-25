import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { NormalizePhone } from '../../../common/helper/decorators/normalize-phone.decorator';

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'International phone number (E.164 format)',
        example: '+250788123456',
        required: true,
    })
    @NormalizePhone()
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;
}
