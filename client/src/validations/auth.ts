import { z } from 'zod'

const phoneRegex = /^\+[1-9]\d{1,14}$/

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format (must be E.164, e.g. +250788123456)'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format (must be E.164, e.g. +250788123456)'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
})

export type SignupInput = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format (must be E.164, e.g. +250788123456)'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format (must be E.164, e.g. +250788123456)'),
  otpCode: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
