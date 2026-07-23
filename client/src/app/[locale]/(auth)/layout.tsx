import type React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative min-h-screen w-full overflow-hidden bg-bg-weak-50 outline-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 size-[480px] rounded-full bg-primary-alpha-10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-[420px] rounded-full bg-information-alpha-10 blur-3xl"
      />
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </div>
    </main>
  )
}
