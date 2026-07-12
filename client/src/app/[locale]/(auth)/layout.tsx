import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-primary-alpha-10 dark:bg-background flex min-h-screen w-full items-center justify-center p-4 outline-none md:p-8"
    >
      {children}
    </main>
  )
}
