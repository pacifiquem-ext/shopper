import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

import { APP_ENVIRONMENT } from '../../../app/enums/app.enum';
import { DatabaseService } from '../../../common/database/services/database.service';
import { OtpService } from './otp.service';
import { OtpType, UserRole, UserStatus } from '../constants/auth.enum';

import { SignupDto } from '../dtos/auth.signup.dto';
import { VerifyPhoneDto } from '../dtos/auth.verify-phone.dto';
import { LoginDto } from '../dtos/auth.login.dto';
import { ForgotPasswordDto } from '../dtos/auth.forgot-password.dto';
import { ResetPasswordDto } from '../dtos/auth.reset-password.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: DatabaseService,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async signup(signupDto: SignupDto) {
        if (signupDto.role === UserRole.PLATFORM_ADMIN) {
            throw new ForbiddenException('Cannot register as PLATFORM_ADMIN');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { phoneNumber: signupDto.phoneNumber },
        });

        if (existingUser) {
            throw new ConflictException('Phone number already exists');
        }

        const saltRoundsStr = this.configService.get<string | number>(
            'BCRYPT_SALT_ROUNDS',
            10
        );
        const saltRounds = parseInt(String(saltRoundsStr), 10);
        const passwordHash = await bcrypt.hash(signupDto.password, saltRounds);

        const email = signupDto.email?.trim();
        const newUser = await this.prisma.user.create({
            data: {
                fullName: signupDto.fullName,
                phoneNumber: signupDto.phoneNumber,
                email: email || null,
                passwordHash,
                role: signupDto.role || UserRole.CUSTOMER,
                status: UserStatus.PENDING_VERIFICATION,
            },
        });

        const otpCode = await this.otpService.createOtp(
            newUser.phoneNumber,
            OtpType.VERIFY_PHONE
        );
        this.logDevOtp(newUser.phoneNumber, OtpType.VERIFY_PHONE, otpCode);

        return {
            userId: newUser.id,
            phoneNumber: newUser.phoneNumber,
            status: newUser.status,
            message:
                'Account created successfully! We just sent a verification code to your phone.',
        };
    }

    async verifyPhone(verifyDto: VerifyPhoneDto) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: verifyDto.phoneNumber },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('Phone number is already verified');
        }

        await this.otpService.validateOtp(
            verifyDto.phoneNumber,
            OtpType.VERIFY_PHONE,
            verifyDto.otpCode
        );

        await this.prisma.user.update({
            where: { id: user.id },
            data: { status: UserStatus.ACTIVE },
        });

        return {
            userId: user.id,
            phoneNumber: user.phoneNumber,
            status: UserStatus.ACTIVE,
            message:
                'Phone number successfully verified! You can now access your account.',
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: loginDto.phoneNumber },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status === UserStatus.SUSPENDED) {
            throw new ForbiddenException('Account is suspended');
        }

        if (user.status === UserStatus.PENDING_VERIFICATION) {
            throw new ForbiddenException(
                'Please verify your phone number first'
            );
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user);
    }

    async refreshToken(refreshToken: string) {
        try {
            const secret = this.configService.get<string>(
                'AUTH_REFRESH_TOKEN_SECRET'
            );
            const payload = this.jwtService.verify(refreshToken, { secret });
            const tokenHash = this.hashToken(refreshToken);

            const deleted = await this.prisma.refreshToken.deleteMany({
                where: {
                    token: tokenHash,
                    revoked: false,
                    expiresAt: { gt: new Date() },
                },
            });

            if (deleted.count === 0) {
                throw new UnauthorizedException(
                    'Invalid or revoked refresh token'
                );
            }

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || user.status !== UserStatus.ACTIVE) {
                throw new ForbiddenException('User is not active');
            }

            return this.generateTokens(user);
        } catch (error) {
            if (
                error instanceof ForbiddenException ||
                error instanceof UnauthorizedException
            ) {
                throw error;
            }
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async forgotPassword(forgotDto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: forgotDto.phoneNumber },
        });

        if (user) {
            const otpCode = await this.otpService.createOtp(
                user.phoneNumber,
                OtpType.RESET_PASSWORD
            );
            this.logDevOtp(user.phoneNumber, OtpType.RESET_PASSWORD, otpCode);
        }

        return {
            message:
                'Password reset code has been sent securely to your phone number.',
        };
    }

    async resetPassword(resetDto: ResetPasswordDto) {
        await this.otpService.validateOtp(
            resetDto.phoneNumber,
            OtpType.RESET_PASSWORD,
            resetDto.otpCode
        );

        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: resetDto.phoneNumber },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const saltRoundsStr = this.configService.get<string | number>(
            'BCRYPT_SALT_ROUNDS',
            10
        );
        const saltRounds = parseInt(String(saltRoundsStr), 10);
        const passwordHash = await bcrypt.hash(
            resetDto.newPassword,
            saltRounds
        );

        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        await this.prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });

        return {
            message:
                'Your password has been completely reset. You are ready to log in!',
        };
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private async generateTokens(user: any) {
        const payload = {
            sub: user.id,
            userId: user.id,
            role: user.role,
            storeId: user.storeId,
            status: user.status,
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshTokenSecret = this.configService.get<string>(
            'AUTH_REFRESH_TOKEN_SECRET'
        );
        const refreshTokenExp = this.configService.get<string>(
            'AUTH_REFRESH_TOKEN_EXP',
            '7d'
        );

        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshTokenSecret,
            expiresIn: refreshTokenExp as any,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: this.hashToken(refreshToken),
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }

    private logDevOtp(phoneNumber: string, type: OtpType, code: string): void {
        const nodeEnv = this.configService.get<string>('NODE_ENV');
        const appEnv =
            this.configService.get<string>('app.env') ??
            this.configService.get<string>('APP_ENV');

        if (
            nodeEnv === 'production' ||
            appEnv === APP_ENVIRONMENT.PRODUCTION
        ) {
            return;
        }

        this.logger.log(
            `[DEV] OTP ${type} for ${phoneNumber}: ${code} (SMS not configured — use this code locally)`
        );
    }
}
