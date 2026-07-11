import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary-alpha-10 dark:bg-background flex min-h-screen w-full items-center justify-center p-4 md:p-8">
      {children}
    </div>
  )
}
