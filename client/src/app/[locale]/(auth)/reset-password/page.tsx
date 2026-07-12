'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { ResetPasswordInput, resetPasswordSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Lock, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
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
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('reset.hint')}</p>
      </div>

      <Form {...form}>
        <form
          method="post"
          action="#"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit(onSubmit)(event)
          }}
          className="w-full space-y-5"
        >
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="relative space-y-0">
                <FormLabel className="sr-only">{t('fields.phone')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <Phone className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder={t('fields.phone')}
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otpCode"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <FormLabel className="sr-only">{t('fields.otpShort')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <KeyRound className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder={t('fields.otpShort')}
                      className="rounded-none border-0 bg-transparent px-0 font-mono tracking-widest shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <FormLabel className="sr-only">{t('fields.newPassword')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <Lock className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('fields.newPassword')}
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
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
              className="w-full rounded-full bg-primary-base py-6 font-bold text-static-white shadow-regular-xs transition-transform hover:bg-primary-darker active:scale-95 disabled:opacity-50"
            >
              {isLoading ? t('reset.submitting') : t('reset.submit')}
            </Button>

            <Link
              href="/login"
              className="text-primary-darker hover:text-primary-darker text-sm font-semibold transition-colors hover:underline"
            >
              {t('reset.backToLogin')}
            </Link>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
