import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class UserResponseDto {
    @ApiProperty({
        example: faker.string.uuid(),
        required: true,
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        example: faker.internet.email(),
        required: true,
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'USER',
        required: true,
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    role: string;
}

export class TokenDto {
    @ApiProperty({
        example: faker.string.alphanumeric({ length: 64 }),
        required: true,
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({
        example: faker.string.alphanumeric({ length: 64 }),
        required: true,
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

export class AuthResponseDto extends TokenDto {
    @ApiProperty({
        type: () => UserResponseDto,
        required: true,
    })
    @Expose()
    @Type(() => UserResponseDto)
    @ValidateNested()
    user: UserResponseDto;
}

export class AuthRefreshResponseDto extends TokenDto {}
