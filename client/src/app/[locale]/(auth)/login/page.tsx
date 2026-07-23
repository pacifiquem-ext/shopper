'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthField, AuthInput } from '@/components/auth/auth-field'
import * as Button from '@/components/alignui/button'
import { Form, FormField } from '@/components/ui/form'
import { Link } from '@/i18n/navigation'
import { LoginInput, loginSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiLockLine, RiPhoneLine } from '@remixicon/react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { resolvePostAuthRedirect, MERCHANT_DASHBOARD_PATH } from '@/lib/auth-return-url'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const { login, isLoading, accessToken } = useAuthStore()

  const redirectTarget = useMemo(
    () =>
      resolvePostAuthRedirect(returnUrl, MERCHANT_DASHBOARD_PATH) as Parameters<
        typeof router.replace
      >[0],
    [returnUrl],
  )

  useEffect(() => {
    if (accessToken) {
      router.replace(redirectTarget)
    }
  }, [accessToken, redirectTarget, router])

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginInput) {
    const success = await login(values)
    if (success) {
      router.replace(redirectTarget)
    }
  }

  return (
    <AuthCard activeTab="login" returnUrl={returnUrl}>
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
            render={({ field, fieldState }) => (
              <AuthField label={t('fields.phone')} icon={RiPhoneLine} hasError={!!fieldState.error}>
                <AuthInput type="tel" autoComplete="tel" placeholder={t('fields.phone')} {...field} />
              </AuthField>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <AuthField label={t('fields.password')} icon={RiLockLine} hasError={!!fieldState.error}>
                <AuthInput
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('fields.password')}
                  {...field}
                />
              </AuthField>
            )}
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <Link
              href="/forgot-password"
              className="text-label-sm text-primary-base transition hover:text-primary-darker hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>

            <Button.Root type="submit" disabled={isLoading} variant="primary" mode="filled" size="medium">
              {isLoading ? t('login.submitting') : t('login.submit')}
            </Button.Root>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
