'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { ForgotPasswordInput, forgotPasswordSchema } from '@/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Phone } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  function onSubmit(values: ForgotPasswordInput) {
    // NOTE: This will be integrated with backend later.
    console.log('Forgot Password values:', values)
    // Mocking an API call success
    setIsSubmitted(true)
  }

  return (
    <AuthCard activeTab="forgot-password">
      <div className="mb-6 text-center">
        {!isSubmitted ? (
          <>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Enter your phone number to receive an OTP to reset your password.
            </p>
          </>
        ) : (
          <p className="text-brand-700 dark:text-brand-400 mt-2 text-sm font-medium">
            We have sent an OTP to your phone number. Please check your SMS.
          </p>
        )}
      </div>

      {!isSubmitted ? (
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

            <div className="flex flex-col items-center space-y-4 pt-8">
              <Button
                type="submit"
                className="bg-brand-700 hover:bg-brand-800 w-full rounded-full py-6 font-bold shadow-md transition-transform active:scale-95"
              >
                SEND RESET LINK
              </Button>

              <Link
                href="/login"
                className="text-brand-700 hover:text-brand-800 text-sm font-semibold transition-colors hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex flex-col items-center space-y-4 pt-4">
          <Button
            asChild
            className="bg-brand-700 hover:bg-brand-800 w-full rounded-full py-6 font-bold shadow-md transition-transform active:scale-95"
          >
            <Link href="/reset-password">PROCEED TO RESET PASSWORD</Link>
          </Button>

          <Button
            variant="ghost"
            className="text-brand-700 hover:bg-brand-50 hover:text-brand-800 dark:hover:bg-brand-900/30 w-full rounded-full py-6 font-semibold transition-colors"
            onClick={() => {
              // Mocking a resend action
              console.log('Resending code to', form.getValues().phoneNumber)
              alert('Code resent successfully!')
            }}
          >
            RESEND CODE
          </Button>

          <Link
            href="/login"
            className="text-brand-700 hover:text-brand-800 mt-4 text-sm font-semibold transition-colors hover:underline"
          >
            Back to Login
          </Link>
        </div>
      )}
    </AuthCard>
  )
}
