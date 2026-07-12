import { BadRequestException, GoneException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { DatabaseService } from '../../../common/database/services/database.service';
import { OtpType } from '../constants/auth.enum';

@Injectable()
export class OtpService {
    private readonly expirationMinutes: number;
    private readonly maxAttempts: number;

    constructor(
        private readonly prisma: DatabaseService,
        private readonly configService: ConfigService
    ) {
        this.expirationMinutes = this.configService.get<number>(
            'OTP_EXPIRATION_MINUTES',
            10
        );
        this.maxAttempts = this.configService.get<number>(
            'OTP_MAX_ATTEMPTS',
            3
        );
    }

    generateCode(): string {
        const buffer = randomBytes(4);
        const code = buffer.readUInt32BE(0) % 1000000;
        return code.toString().padStart(6, '0');
    }

    private hashCode(code: string): string {
        return createHash('sha256').update(code).digest('hex');
    }

    async createOtp(phoneNumber: string, type: OtpType): Promise<string> {
        await this.prisma.otpCode.deleteMany({
            where: { phoneNumber, type },
        });

        const code = this.generateCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.expirationMinutes);

        await this.prisma.otpCode.create({
            data: {
                phoneNumber,
                code: this.hashCode(code),
                type,
                expiresAt,
            },
        });

        return code;
    }

    async validateOtp(
        phoneNumber: string,
        type: OtpType,
        code: string
    ): Promise<boolean> {
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: { phoneNumber, type },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            throw new BadRequestException('Invalid OTP or no OTP requested.');
        }

        if (otpRecord.expiresAt < new Date()) {
            await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
            throw new GoneException(
                'OTP has expired. Please request a new one.'
            );
        }

        if (otpRecord.attempts >= this.maxAttempts) {
            await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
            throw new BadRequestException(
                'Maximum OTP attempts reached. Please request a new one.'
            );
        }

        if (otpRecord.code !== this.hashCode(code)) {
            await this.prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } },
            });
            throw new BadRequestException('Invalid OTP code.');
        }

        await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
        return true;
    }
}
