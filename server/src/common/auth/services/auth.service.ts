import { Injectable } from '@nestjs/common';
import { IAuthUser } from '../../request/interfaces/request.interface';
import { UserLoginDto } from '../dtos/request/auth.login.dto';
import { UserCreateDto } from '../dtos/request/auth.signup.dto';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
} from '../dtos/response/auth.response.dto';
import { IAuthService } from '../interfaces/auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
    constructor() {}

    public async login(data: UserLoginDto): Promise<any> {
        return {
            accessToken: 'dummy-access-token',
            refreshToken: 'dummy-refresh-token',
            user: { id: '1', email: data.email, role: 'USER' },
        };
    }

    public async signup(data: UserCreateDto): Promise<any> {
        return {
            accessToken: 'dummy-access-token',
            refreshToken: 'dummy-refresh-token',
            user: { id: '1', email: data.email, role: 'USER' },
        };
    }

    public async refreshTokens(payload: IAuthUser): Promise<any> {
        return {
            accessToken: 'dummy-access-token',
            refreshToken: 'dummy-refresh-token',
        };
    }
}
