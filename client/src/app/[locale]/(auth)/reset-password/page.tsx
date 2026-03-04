'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { ResetPasswordInput, resetPasswordSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Lock, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from '@/i18n/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword, isLoading } = useAuthStore()
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phoneNumber: '',
      otpCode: '',
      newPassword: '',
    },
  })

  async function onSubmit(values: ResetPasswordInput) {
    const success = await resetPassword(values)
    if (success) {
      router.push('/login')
    }
  }

  return (
    <AuthCard activeTab="reset-password">
      <div className="mb-6 text-center">
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter the OTP sent to your phone and your new password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
          {/* Phone Number Field */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="relative space-y-0">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <Phone className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="Phone Number (e.g. +2507...)"
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          {/* OTP Code Field */}
          <FormField
            control={form.control}
            name="otpCode"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <KeyRound className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="6-Digit OTP"
                      className="rounded-none border-0 bg-transparent px-0 font-mono tracking-widest shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          {/* New Password Field */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <Lock className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="New Password"
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          <div className="flex flex-col items-center space-y-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-700 hover:bg-brand-800 w-full rounded-full py-6 font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
            </Button>

            <Link
              href="/login"
              className="text-brand-700 hover:text-brand-800 text-sm font-semibold transition-colors hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
