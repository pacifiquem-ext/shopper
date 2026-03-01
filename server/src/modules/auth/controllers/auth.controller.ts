import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { PublicRoute } from '../../../common/request/decorators/request.public.decorator';
import { SignupDto } from '../dtos/auth.signup.dto';
import { VerifyPhoneDto } from '../dtos/auth.verify-phone.dto';
import { LoginDto } from '../dtos/auth.login.dto';
import { RefreshTokenDto } from '../dtos/auth.refresh-token.dto';
import { ForgotPasswordDto } from '../dtos/auth.forgot-password.dto';
import { ResetPasswordDto } from '../dtos/auth.reset-password.dto';
import { AuthTokenResponseDto } from '../dtos/auth.response.dto';


@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @PublicRoute()
    @Post('signup')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User created pending verification',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Phone number already exists',
    })
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @PublicRoute()
    @Post('verify-phone')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify phone number using OTP' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Phone successfully verified',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid code or max attempts reached',
    })
    @ApiResponse({ status: HttpStatus.GONE, description: 'OTP has expired' })
    async verifyPhone(@Body() verifyDto: VerifyPhoneDto) {
        return this.authService.verifyPhone(verifyDto);
    }

    @PublicRoute()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user using phone number and password' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: AuthTokenResponseDto,
        description: 'Login successful',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Account suspended or unverified',
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @PublicRoute()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: AuthTokenResponseDto,
        description: 'New token generated',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid or revoked token',
    })
    async refresh(@Body() refreshDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshDto.refreshToken);
    }

    @PublicRoute()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request OTP for password reset' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'OTP sent if user exists',
    })
    async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotDto);
    }

    @PublicRoute()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset user password using OTP' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password reset successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid code or max attempts reached',
    })
    async resetPassword(@Body() resetDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetDto);
    }
}
