import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

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

        const newUser = await this.prisma.user.create({
            data: {
                fullName: signupDto.fullName,
                phoneNumber: signupDto.phoneNumber,
                email: signupDto.email,
                passwordHash,
                role: signupDto.role || UserRole.CUSTOMER,
                status: UserStatus.PENDING_VERIFICATION,
            },
        });

        // create & send OTP
        await this.otpService.createOtp(
            newUser.phoneNumber,
            OtpType.VERIFY_PHONE
        );

        return {
            userId: newUser.id,
            phoneNumber: newUser.phoneNumber,
            status: newUser.status,
            message: 'User registered. Please verify your phone number.',
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

            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!storedToken || storedToken.revoked) {
                throw new UnauthorizedException(
                    'Invalid or revoked refresh token'
                );
            }

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub || storedToken.userId },
            });

            if (!user || user.status !== UserStatus.ACTIVE) {
                throw new ForbiddenException('User is not active');
            }

            // Remove old token and issue new
            await this.prisma.refreshToken.delete({
                where: { token: refreshToken },
            });

            return this.generateTokens(user);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async forgotPassword(forgotDto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: forgotDto.phoneNumber },
        });

        if (user) {
            await this.otpService.createOtp(
                user.phoneNumber,
                OtpType.RESET_PASSWORD
            );
        }

        // Always return success to prevent user enumeration
        return {
            message:
                'If the phone number is registered, an OTP has been sent for password reset.',
        };
    }

    async resetPassword(resetDto: ResetPasswordDto) {
        await this.otpService.validateOtp(
            resetDto.phoneNumber,
            OtpType.RESET_PASSWORD,
            resetDto.otpCode
        );

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
            where: { phoneNumber: resetDto.phoneNumber },
            data: { passwordHash },
        });

        return {
            message: 'Password has been successfully reset. You can now login.',
        };
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

        // Store refresh token in the database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Default fallback mapping to 7d

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
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
                role: user.role,
                status: user.status,
            },
        };
    }
}
