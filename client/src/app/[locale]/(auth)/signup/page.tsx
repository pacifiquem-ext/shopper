'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthField, AuthInput } from '@/components/auth/auth-field'
import * as Button from '@/components/alignui/button'
import { Form, FormField } from '@/components/ui/form'
import { SignupInput, signupSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiLockLine, RiMailLine, RiPhoneLine, RiUserLine } from '@remixicon/react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { MERCHANT_ONBOARDING_PATH, withReturnUrl } from '@/lib/auth-return-url'
import { useTranslations } from 'next-intl'

export default function SignupPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const { signup, isLoading } = useAuthStore()
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: SignupInput) {
    const success = await signup(values)
    if (success) {
      localStorage.setItem('pendingVerificationPhone', values.phoneNumber)
      router.push(
        withReturnUrl('/verify-phone', returnUrl ?? MERCHANT_ONBOARDING_PATH) as Parameters<
          typeof router.push
        >[0],
      )
    }
  }

  return (
    <AuthCard activeTab="signup" returnUrl={returnUrl}>
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
            name="fullName"
            render={({ field, fieldState }) => (
              <AuthField label={t('fields.fullName')} icon={RiUserLine} hasError={!!fieldState.error}>
                <AuthInput autoComplete="name" placeholder={t('fields.fullName')} {...field} />
              </AuthField>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field, fieldState }) => (
              <AuthField
                label={t('fields.phone')}
                icon={RiPhoneLine}
                hasError={!!fieldState.error}
                hint={t('fields.phoneHint')}
              >
                <AuthInput type="tel" autoComplete="tel" placeholder={t('fields.phone')} {...field} />
              </AuthField>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <AuthField
                label={t('fields.emailOptional')}
                icon={RiMailLine}
                hasError={!!fieldState.error}
              >
                <AuthInput
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t('fields.emailOptional')}
                  {...field}
                />
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
                  autoComplete="new-password"
                  placeholder={t('fields.password')}
                  {...field}
                />
              </AuthField>
            )}
          />

          <div className="flex justify-end pt-3">
            <Button.Root
              type="submit"
              disabled={isLoading}
              variant="primary"
              mode="filled"
              size="medium"
              className="min-w-[8.5rem]"
            >
              {isLoading ? t('signup.submitting') : t('signup.submit')}
            </Button.Root>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
