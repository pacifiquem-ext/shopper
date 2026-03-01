import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatabaseModule } from 'src/common/database/database.module';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('AUTH_ACCESS_TOKEN_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>(
                        'AUTH_ACCESS_TOKEN_EXP',
                        '15m'
                    ),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, OtpService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
