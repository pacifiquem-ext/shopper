import { IAuthUser } from 'src/common/request/interfaces/request.interface';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
} from '../dtos/response/auth.response.dto';

export interface IAuthService {
    // login(data: UserLoginDto): Promise<AuthResponseDto>;
    // signup(data: UserCreateDto): Promise<AuthResponseDto>;
    // refreshTokens(payload: IAuthUser): Promise<AuthRefreshResponseDto>;
}
