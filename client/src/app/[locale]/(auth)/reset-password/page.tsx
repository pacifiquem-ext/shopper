'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthField, AuthInput } from '@/components/auth/auth-field'
import * as Button from '@/components/alignui/button'
import { Form, FormField } from '@/components/ui/form'
import { Link } from '@/i18n/navigation'
import { ResetPasswordInput, resetPasswordSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiKey2Line, RiLockLine, RiPhoneLine } from '@remixicon/react'
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
    <AuthCard activeTab="reset-password" description={t('reset.hint')}>
      <Form {...form}>
        <form
          method="post"
          action="#"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit(onSubmit)(event)
          }}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field, fieldState }) => (
              <AuthField label={t('fields.phone')} icon={RiPhoneLine} hasError={!!fieldState.error}>
                <AuthInput type="tel" autoComplete="tel" placeholder={t('fields.phone')} {...field} />
              </AuthField>
            )}
          />

          <FormField
            control={form.control}
            name="otpCode"
            render={({ field, fieldState }) => (
              <AuthField label={t('fields.otpShort')} icon={RiKey2Line} hasError={!!fieldState.error}>
                <AuthInput
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder={t('fields.otp')}
                  {...field}
                />
              </AuthField>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <AuthField label={t('fields.newPassword')} icon={RiLockLine} hasError={!!fieldState.error}>
                <AuthInput
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('fields.newPassword')}
                  {...field}
                />
              </AuthField>
            )}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button.Root
              type="submit"
              disabled={isLoading}
              variant="primary"
              mode="filled"
              size="medium"
              className="w-full"
            >
              {isLoading ? t('reset.submitting') : t('reset.submit')}
            </Button.Root>
            <Link
              href="/login"
              className="text-center text-label-sm text-primary-base transition hover:text-primary-darker hover:underline"
            >
              {t('reset.backToLogin')}
            </Link>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
