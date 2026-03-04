import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../constants/auth.enum';

export class AuthTokenResponseDto {
    @ApiProperty({
        description: 'JWT Access Token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5c...34f',
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT Refresh Token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5c...xyz',
    })
    refreshToken: string;

    @ApiProperty({
        description: 'User details',
        example: {
            id: 'uuid',
            fullName: 'John Doe',
            phoneNumber: '+250788123456',
            email: 'john@example.com',
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
        },
    })
    user: {
        id: string;
        fullName: string;
        phoneNumber: string;
        email?: string;
        role: UserRole;
        status: UserStatus;
    };
}
