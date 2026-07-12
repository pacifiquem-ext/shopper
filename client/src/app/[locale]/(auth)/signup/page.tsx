'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SignupInput, signupSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, Phone, User as UserIcon } from 'lucide-react'
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
          className="w-full space-y-5"
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="relative space-y-0">
                <FormLabel className="sr-only">{t('fields.fullName')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <UserIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder={t('fields.fullName')}
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
                      {...field}
                    />
                  </FormControl>
                </div>
                <p className="pt-1 text-xs text-gray-500">{t('fields.phoneHint')}</p>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <FormLabel className="sr-only">{t('fields.emailOptional')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <Mail className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder={t('fields.emailOptional')}
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
            name="password"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <FormLabel className="sr-only">{t('fields.password')}</FormLabel>
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <Lock className="mr-3 h-5 w-5 text-gray-400" aria-hidden />
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('fields.password')}
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
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
              {isLoading ? t('signup.submitting') : t('signup.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
