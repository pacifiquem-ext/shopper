'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { VerifyPhoneSchemaType, verifyPhoneSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'

export default function VerifyPhonePage() {
  const router = useRouter()
  const { verifyPhone, isLoading } = useAuthStore()
  const [detectedPhone, setDetectedPhone] = useState('')

  const form = useForm<VerifyPhoneSchemaType>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      phoneNumber: '',
      otpCode: '',
    },
  })

  // Pre-fill phone number if navigating from signup step
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
      router.push('/login')
    }
  }

  return (
    <AuthCard activeTab="signup">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Verify Your Phone</h2>
        <p className="mt-2 text-sm text-gray-500">
          {detectedPhone
            ? `We sent a 6-digit code to ${detectedPhone}`
            : 'Enter your phone number and the 6-digit code we sent you.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
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
                      disabled={!!detectedPhone}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="absolute pt-1 text-xs" />
              </FormItem>
            )}
          />

          {/* OTP Code Field */}
          <FormField
            control={form.control}
            name="otpCode"
            render={({ field }) => (
              <FormItem className="relative space-y-0 pt-3">
                <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
                  <KeyRound className="mr-3 h-5 w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="6-Digit Code"
                      maxLength={6}
                      className="rounded-none border-0 bg-transparent px-0 tracking-widest shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
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
              {isLoading ? 'VERIFYING...' : 'VERIFY'}
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
