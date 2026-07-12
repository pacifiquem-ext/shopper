'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { VerifyPhoneSchemaType, verifyPhoneSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Phone } from 'lucide-react'
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
    <AuthCard activeTab="signup">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">{t('verify.title')}</h2>
        <p className="mt-2 text-sm text-gray-500">
          {detectedPhone
            ? t('verify.hintWithPhone', { phone: detectedPhone })
            : t('verify.hint')}
        </p>
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
              <FormItem className="relative space-y-0 pt-3">
                <FormLabel className="sr-only">{t('fields.phone')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <Phone className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder={t('fields.phone')}
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                      disabled={!!detectedPhone}
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
                <FormLabel className="sr-only">{t('fields.otp')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <KeyRound className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder={t('fields.otp')}
                      maxLength={6}
                      className="rounded-none border-0 bg-transparent px-0 tracking-widest shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-primary-base px-8 py-2 font-bold text-static-white shadow-regular-xs transition-transform hover:bg-primary-darker active:scale-95 disabled:opacity-50"
            >
              {isLoading ? t('verify.submitting') : t('verify.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
