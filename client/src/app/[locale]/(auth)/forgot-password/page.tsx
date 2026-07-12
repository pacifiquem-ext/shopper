'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { ForgotPasswordInput, forgotPasswordSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Phone } from 'lucide-react'
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
    <AuthCard activeTab="forgot-password">
      <div className="mb-6 text-center">
        {!isSubmitted ? (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('forgot.hint')}</p>
        ) : (
          <p className="text-primary-darker dark:text-primary-base mt-2 text-sm font-medium">
            {t('forgot.sent')}
          </p>
        )}
      </div>

      {!isSubmitted ? (
        <Form {...form}>
          <form
            method="post"
            action="#"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit(onSubmit)(event)
            }}
            className="w-full space-y-6"
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

            <div className="flex flex-col items-center space-y-4 pt-8">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-primary-base py-6 font-bold text-static-white shadow-regular-xs transition-transform hover:bg-primary-darker active:scale-95 disabled:opacity-50"
              >
                {isLoading ? t('forgot.submitting') : t('forgot.submit')}
              </Button>

              <Link
                href="/login"
                className="text-primary-darker hover:text-primary-darker text-sm font-semibold transition-colors hover:underline"
              >
                {t('forgot.backToLogin')}
              </Link>
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex flex-col items-center space-y-4 pt-4">
          <Button
            asChild
            className="w-full rounded-full bg-primary-base py-6 font-bold text-static-white shadow-regular-xs transition-transform hover:bg-primary-darker active:scale-95"
          >
            <Link href="/reset-password">{t('forgot.proceedReset')}</Link>
          </Button>

          <Button asChild variant="ghost">
            <Link href="/login">{t('forgot.backToLogin')}</Link>
          </Button>
        </div>
      )}
    </AuthCard>
  )
}
