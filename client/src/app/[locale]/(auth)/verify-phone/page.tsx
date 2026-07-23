'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthField, AuthInput } from '@/components/auth/auth-field'
import * as Button from '@/components/alignui/button'
import { Form, FormField } from '@/components/ui/form'
import { VerifyPhoneSchemaType, verifyPhoneSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiKey2Line, RiPhoneLine } from '@remixicon/react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MERCHANT_ONBOARDING_PATH, withReturnUrl } from '@/lib/auth-return-url'
import { useTranslations } from 'next-intl'

export default function VerifyPhonePage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const { verifyPhone, isLoading } = useAuthStore()
  const [detectedPhone, setDetectedPhone] = useState('')

  const form = useForm<VerifyPhoneSchemaType>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      phoneNumber: '',
      otpCode: '',
    },
  })

  useEffect(() => {
    const savedPhone = localStorage.getItem('pendingVerificationPhone')
    if (savedPhone) {
      setDetectedPhone(savedPhone)
      form.setValue('phoneNumber', savedPhone)
    }
  }, [form])

  async function onSubmit(values: VerifyPhoneSchemaType) {
    const success = await verifyPhone(values)
    if (success) {
      localStorage.removeItem('pendingVerificationPhone')
      router.push(
        withReturnUrl('/login', returnUrl ?? MERCHANT_ONBOARDING_PATH) as Parameters<
          typeof router.push
        >[0],
      )
    }
  }

  return (
    <AuthCard
      activeTab="signup"
      title={t('verify.title')}
      description={
        detectedPhone
          ? t('verify.hintWithPhone', { phone: detectedPhone })
          : t('verify.hint')
      }
    >
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
                <AuthInput
                  type="tel"
                  autoComplete="tel"
                  placeholder={t('fields.phone')}
                  disabled={!!detectedPhone}
                  {...field}
                />
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

          <div className="flex justify-end pt-3">
            <Button.Root
              type="submit"
              disabled={isLoading}
              variant="primary"
              mode="filled"
              size="medium"
              className="min-w-[8.5rem]"
            >
              {isLoading ? t('verify.submitting') : t('verify.submit')}
            </Button.Root>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
