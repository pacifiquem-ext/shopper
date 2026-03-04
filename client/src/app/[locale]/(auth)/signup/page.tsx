'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SignupInput, signupSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, Phone, User as UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from '@/i18n/navigation'

export default function SignupPage() {
  const router = useRouter()
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
    // We send payload to global store which triggers toast on success
    const success = await signup(values)
    if (success) {
      // Store the phone number locally to automatically detect it in the verify-phone page
      localStorage.setItem('pendingVerificationPhone', values.phoneNumber)
      router.push('/verify-phone')
    }
  }

  return (
    <AuthCard activeTab="signup">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
          {/* Full Name Field */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="relative space-y-0">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <UserIcon className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="Full Name"
                      className="rounded-none border-0 bg-transparent px-0 shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          {/* Phone Number Field */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
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

          {/* Email Field (Optional) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <Mail className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="Email (Optional)"
                      type="email"
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
              <FormItem className="relative space-y-0 pt-3">
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

          <div className="flex items-center justify-end pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-700 hover:bg-brand-800 rounded-full px-8 py-2 font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
