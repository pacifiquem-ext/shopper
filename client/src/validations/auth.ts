import { z } from 'zod'
import { normalizePhoneToE164 } from '@/lib/phone'

const phoneRegex = /^\+[1-9]\d{1,14}$/

const phoneField = z
  .string()
  .min(1, 'Phone number is required')
  .transform((value) => normalizePhoneToE164(value))
  .refine((value) => phoneRegex.test(value), {
    message: 'Invalid phone number format (must be E.164, e.g. +250788123456)',
  })

export const loginSchema = z.object({
  phoneNumber: phoneField,
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: phoneField,
  email: z
    .union([z.literal(''), z.string().trim().email('Invalid email address')])
    .optional(),
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
  phoneNumber: phoneField,
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  phoneNumber: phoneField,
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

export const verifyPhoneSchema = z.object({
  phoneNumber: phoneField,
  otpCode: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export type VerifyPhoneSchemaType = z.infer<typeof verifyPhoneSchema>
