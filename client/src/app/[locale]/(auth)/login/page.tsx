'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { LoginInput, loginSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Phone } from 'lucide-react'
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
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="relative space-y-0">
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <Phone className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder={t('fields.phone')}
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
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
              <FormItem className="relative space-y-0 pt-4">
                <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
                  <Lock className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder={t('fields.password')}
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between pt-8">
            <Link
              href="/forgot-password"
              className="text-primary-darker hover:text-primary-darker text-xs font-semibold transition-colors hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>

            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-primary-base px-8 py-2 font-bold text-static-white shadow-regular-xs transition-transform hover:bg-primary-darker active:scale-95 disabled:opacity-50"
            >
              {isLoading ? t('login.submitting') : t('login.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
