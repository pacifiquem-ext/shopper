import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({
        description: 'Previously issued refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
