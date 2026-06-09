import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../../common/database/services/database.service';
import { withDbRetry } from '../../../common/database/utils/with-db-retry';

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
        const user = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.user.findUnique({
                    where: { id: payload.sub },
                }),
            { label: 'jwt.validate.user' }
        );

        if (!user) {
            throw new UnauthorizedException(
                'User no longer exists or invalid token'
            );
        }

        let storeId = user.storeId;
        if (!storeId) {
            const ownedStore = await withDbRetry(
                this.prisma,
                () =>
                    this.prisma.store.findFirst({
                        where: { userId: user.id },
                        select: { id: true },
                    }),
                { label: 'jwt.validate.store' }
            );
            storeId = ownedStore?.id ?? null;

            if (ownedStore?.id) {
                void this.prisma.user
                    .update({
                        where: { id: user.id },
                        data: {
                            storeId: ownedStore.id,
                            role: UserRole.STORE_OWNER,
                        },
                    })
                    .catch(() => undefined);
            }
        }

        return {
            id: user.id,
            userId: user.id,
            storeId,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
        };
    }
}
