import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '@/services/auth.service'
import type {
  LoginInput,
  SignupInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/validations/auth'
import type { VerifyPhoneInput } from '@/services/auth.service'

interface User {
  id: string
  fullName: string
  phoneNumber: string
  email?: string
  role: string
  status: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean

  // Actions
  logout: () => void

  // Async Actions
  login: (data: LoginInput) => Promise<boolean>
  signup: (data: SignupInput) => Promise<boolean>
  verifyPhone: (data: VerifyPhoneInput) => Promise<boolean>
  forgotPassword: (data: ForgotPasswordInput) => Promise<boolean>
  resetPassword: (data: ResetPasswordInput) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      logout: () => set({ user: null, accessToken: null, refreshToken: null, isLoading: false }),

      login: async (data: LoginInput) => {
        if (get().isLoading) return false
        set({ isLoading: true })
        try {
          const response = (await authService.login(data)) as any
          const token = response?.data?.accessToken || response?.accessToken
          const refresh = response?.data?.refreshToken || response?.refreshToken
          const userData = response?.data?.user || response?.user

          if (token) {
            set({
              user: userData || null,
              accessToken: token,
              refreshToken: refresh,
            })
            return true
          }
          return false
        } catch (error) {
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      signup: async (data: SignupInput) => {
        if (get().isLoading) return false
        set({ isLoading: true })
        try {
          const email = data.email?.trim()
          await authService.signup({
            ...data,
            ...(email ? { email } : {}),
          })
          return true
        } catch (error) {
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      verifyPhone: async (data: VerifyPhoneInput) => {
        set({ isLoading: true })
        try {
          await authService.verifyPhone(data)
          return true
        } catch (error) {
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      forgotPassword: async (data: ForgotPasswordInput) => {
        set({ isLoading: true })
        try {
          await authService.forgotPassword(data)
          return true
        } catch (error) {
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      resetPassword: async (data: ResetPasswordInput) => {
        set({ isLoading: true })
        try {
          await authService.resetPassword(data)
          return true
        } catch (error) {
          return false
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
