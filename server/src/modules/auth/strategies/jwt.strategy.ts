import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../../common/database/services/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(
        configService: ConfigService,
        private readonly prisma: DatabaseService
    ) {
        const secret = configService.get<string>('AUTH_ACCESS_TOKEN_SECRET');
        if (!secret?.trim()) {
            throw new Error(
                'Set AUTH_ACCESS_TOKEN_SECRET in server/.env (non-empty string). JwtStrategy requires it.'
            );
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user) {
            throw new UnauthorizedException(
                'User no longer exists or invalid token'
            );
        }

        return {
            id: user.id,
            storeId: user.storeId,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
        };
    }
}
