import { api } from '@/lib/axios'
import type {
  LoginInput,
  SignupInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/validations/auth'

export interface AuthTokenResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    fullName: string
    phoneNumber: string
    email?: string
    role: string
    status: string
  }
}

export interface ApiResponse<T = any> {
  statusCode: number
  message: string
  timestamp: string
  data: T
}

export interface VerifyPhoneInput {
  phoneNumber: string
  otpCode: string
}

export const authService = {
  async login(data: LoginInput): Promise<ApiResponse<AuthTokenResponse>> {
    return (await api.post('/auth/login', data)) as ApiResponse<AuthTokenResponse>
  },

  async signup(data: SignupInput): Promise<ApiResponse<any>> {
    return (await api.post('/auth/signup', data)) as ApiResponse<any>
  },

  async verifyPhone(data: VerifyPhoneInput): Promise<ApiResponse<any>> {
    return (await api.post('/auth/verify-phone', data)) as ApiResponse<any>
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse<any>> {
    return (await api.post('/auth/forgot-password', data)) as ApiResponse<any>
  },

  async resetPassword(data: ResetPasswordInput): Promise<ApiResponse<any>> {
    return (await api.post('/auth/reset-password', data)) as ApiResponse<any>
  },
}
