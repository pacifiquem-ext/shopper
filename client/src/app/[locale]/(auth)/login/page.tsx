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
import { resolvePostAuthRedirect } from '@/lib/auth-return-url'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const { login, isLoading } = useAuthStore()

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
      router.push(
        resolvePostAuthRedirect(searchParams.get('returnUrl')) as Parameters<typeof router.push>[0],
      )
    }
  }

  return (
    <AuthCard activeTab="login" returnUrl={returnUrl}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          {/* Phone Number Field */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="relative space-y-0">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <Phone className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="Phone Number (e.g. +2507...)"
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-4">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <Lock className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
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
              className="text-brand-700 hover:text-brand-800 text-xs font-semibold transition-colors hover:underline"
            >
              Forgot Password?
            </Link>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-700 hover:bg-brand-800 rounded-full px-8 py-2 font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
