'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthField, AuthInput } from '@/components/auth/auth-field'
import * as Button from '@/components/alignui/button'
import { Form, FormField } from '@/components/ui/form'
import { Link } from '@/i18n/navigation'
import { ForgotPasswordInput, forgotPasswordSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiPhoneLine } from '@remixicon/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const { forgotPassword, isLoading } = useAuthStore()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    const success = await forgotPassword(values)
    if (success) {
      setIsSubmitted(true)
    }
  }

  return (
    <AuthCard
      activeTab="forgot-password"
      description={isSubmitted ? t('forgot.sent') : t('forgot.hint')}
    >
      {!isSubmitted ? (
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

            <div className="flex flex-col gap-3 pt-2">
              <Button.Root
                type="submit"
                disabled={isLoading}
                variant="primary"
                mode="filled"
                size="medium"
                className="w-full"
              >
                {isLoading ? t('forgot.submitting') : t('forgot.submit')}
              </Button.Root>

              <Link
                href="/login"
                className="text-center text-label-sm text-primary-base transition hover:text-primary-darker hover:underline"
              >
                {t('forgot.backToLogin')}
              </Link>
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex flex-col gap-3 pt-2">
          <Button.Root asChild variant="primary" mode="filled" size="medium" className="w-full">
            <Link href="/reset-password">{t('forgot.proceedReset')}</Link>
          </Button.Root>
          <Button.Root asChild variant="neutral" mode="stroke" size="medium" className="w-full">
            <Link href="/login">{t('forgot.backToLogin')}</Link>
          </Button.Root>
        </div>
      )}
    </AuthCard>
  )
}
